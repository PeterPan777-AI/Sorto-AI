import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import * as db from "./db";
import { analyzeDocument, calculateSimilarity, detectVersionPattern } from "./ai_tagger";
import { licenseRouter } from "./license";

const execAsync = promisify(exec);

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => {
      const user = opts.ctx.user;
      if (!user) return null;
      
      // Check if trial has expired
      if (user.licenseStatus === 'trial' && user.trialEndDate) {
        const now = new Date();
        const trialEnd = new Date(user.trialEndDate);
        if (now > trialEnd) {
          // Trial expired
          return {
            ...user,
            licenseStatus: 'expired' as const,
            trialExpired: true,
            daysRemaining: 0
          };
        }
        
        // Calculate days remaining
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...user,
          trialExpired: false,
          daysRemaining
        };
      }
      
      return {
        ...user,
        trialExpired: false,
        daysRemaining: 0
      };
    }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  documents: router({
    // Scan a folder and process documents
    scan: protectedProcedure
      .input(z.object({
        folderPath: z.string(),
        recursive: z.boolean().default(true)
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // Create scan history entry
        const scanResult = await db.insertScanHistory({
          userId,
          folderPath: input.folderPath,
          status: 'running'
        });
        
        const scanId = Number((scanResult as any).insertId);
        
        try {
          // Run Python document processor
          const recursiveFlag = input.recursive ? '' : '--no-recursive';
          const { stdout } = await execAsync(
            `python3.11 ${__dirname}/document_processor.py "${input.folderPath}" ${recursiveFlag}`
          );
          
          const result = JSON.parse(stdout);
          const documents = result.documents || [];
          
          // Process each document
          let processed = 0;
          let failed = 0;
          
          for (const doc of documents) {
            try {
              // Check for duplicates by hash
              const existingDocs = await db.getDocumentsByHash(userId, doc.fileHash);
              
              // Analyze document with AI
              const tags = await analyzeDocument(doc.fileName, doc.extractedText || '');
              
              // Insert document
              const docResult = await db.insertDocument({
                userId,
                ...doc,
                documentType: tags.documentType,
                topics: JSON.stringify(tags.topics),
                categories: JSON.stringify(tags.categories),
                geographicFocus: JSON.stringify(tags.geographicFocus),
                targetAudience: tags.targetAudience,
                organizations: JSON.stringify(tags.organizations),
                extractedDates: JSON.stringify(tags.extractedDates),
                modifiedAt: new Date(doc.modifiedAt),
                processingStatus: 'completed'
              });
              
              const newDocId = Number((docResult as any).insertId);
              
              // Check for duplicates and similar documents
              if (existingDocs.length > 0) {
                // Exact duplicate found
                const groupResult = await db.insertDuplicateGroup({
                  userId,
                  masterDocumentId: existingDocs[0]!.id,
                  groupType: 'exact'
                });
                
                const groupId = Number((groupResult as any).insertId);
                
                // Update both documents with group ID
                await db.updateDocument(existingDocs[0]!.id, { duplicateGroupId: groupId, similarityScore: 100 });
                await db.updateDocument(newDocId, { duplicateGroupId: groupId, similarityScore: 100 });
              } else {
                // Check for similar documents (version detection)
                const allUserDocs = await db.getDocumentsByUserId(userId, 1000);
                
                for (const existingDoc of allUserDocs) {
                  if (existingDoc.id === newDocId) continue;
                  
                  // Check filename similarity
                  const isVersion = detectVersionPattern(doc.fileName, existingDoc.fileName);
                  
                  if (isVersion) {
                    // Calculate content similarity
                    const similarity = calculateSimilarity(
                      doc.extractedText || '',
                      existingDoc.extractedText || ''
                    );
                    
                    if (similarity > 60) {
                      // Create or update duplicate group
                      if (existingDoc.duplicateGroupId) {
                        // Add to existing group
                        await db.updateDocument(newDocId, {
                          duplicateGroupId: existingDoc.duplicateGroupId,
                          similarityScore: similarity
                        });
                      } else {
                        // Create new group
                        const groupResult = await db.insertDuplicateGroup({
                          userId,
                          masterDocumentId: existingDoc.id,
                          groupType: 'version'
                        });
                        
                        const groupId = Number((groupResult as any).insertId);
                        
                        await db.updateDocument(existingDoc.id, {
                          duplicateGroupId: groupId,
                          similarityScore: 100
                        });
                        await db.updateDocument(newDocId, {
                          duplicateGroupId: groupId,
                          similarityScore: similarity
                        });
                      }
                      break;
                    }
                  }
                }
              }
              
              processed++;
            } catch (error) {
              console.error('Error processing document:', error);
              failed++;
            }
          }
          
          // Update scan history
          await db.updateScanHistory(scanId, {
            status: 'completed',
            completedAt: new Date(),
            filesScanned: documents.length,
            filesProcessed: processed,
            filesFailed: failed
          });
          
          return {
            success: true,
            scanId,
            filesScanned: documents.length,
            filesProcessed: processed,
            filesFailed: failed
          };
          
        } catch (error) {
          // Update scan history with error
          await db.updateScanHistory(scanId, {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
          
          throw error;
        }
      }),
    
    // Get all documents for current user
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0)
      }))
      .query(async ({ ctx, input }) => {
        const documents = await db.getDocumentsByUserId(ctx.user.id, input.limit, input.offset);
        
        // Parse JSON fields
        return documents.map(doc => ({
          ...doc,
          topics: doc.topics ? JSON.parse(doc.topics) : [],
          categories: doc.categories ? JSON.parse(doc.categories) : [],
          geographicFocus: doc.geographicFocus ? JSON.parse(doc.geographicFocus) : [],
          organizations: doc.organizations ? JSON.parse(doc.organizations) : [],
          extractedDates: doc.extractedDates ? JSON.parse(doc.extractedDates) : []
        }));
      }),
    
    // Search documents
    search: protectedProcedure
      .input(z.object({
        query: z.string(),
        filters: z.object({
          documentType: z.string().optional(),
          fileType: z.string().optional()
        }).optional()
      }))
      .query(async ({ ctx, input }) => {
        const documents = await db.searchDocuments(ctx.user.id, input.query, input.filters);
        
        return documents.map(doc => ({
          ...doc,
          topics: doc.topics ? JSON.parse(doc.topics) : [],
          categories: doc.categories ? JSON.parse(doc.categories) : [],
          geographicFocus: doc.geographicFocus ? JSON.parse(doc.geographicFocus) : [],
          organizations: doc.organizations ? JSON.parse(doc.organizations) : [],
          extractedDates: doc.extractedDates ? JSON.parse(doc.extractedDates) : []
        }));
      }),
    
    // Get document statistics
    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getDocumentStats(ctx.user.id);
    }),
    
    // Get document by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const doc = await db.getDocumentById(input.id);
        
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        return {
          ...doc,
          topics: doc.topics ? JSON.parse(doc.topics) : [],
          categories: doc.categories ? JSON.parse(doc.categories) : [],
          geographicFocus: doc.geographicFocus ? JSON.parse(doc.geographicFocus) : [],
          organizations: doc.organizations ? JSON.parse(doc.organizations) : [],
          extractedDates: doc.extractedDates ? JSON.parse(doc.extractedDates) : []
        };
      })
  }),
  
  duplicates: router({
    // Get duplicate groups
    list: protectedProcedure
      .input(z.object({
        includeResolved: z.boolean().default(false)
      }))
      .query(async ({ ctx, input }) => {
        const groups = await db.getDuplicateGroupsByUserId(ctx.user.id, input.includeResolved);
        
        // Get documents for each group
        const groupsWithDocs = await Promise.all(
          groups.map(async (group) => {
            const documents = await db.getDocumentsByDuplicateGroup(group.id);
            return {
              ...group,
              documents: documents.map(doc => ({
                ...doc,
                topics: doc.topics ? JSON.parse(doc.topics) : [],
                categories: doc.categories ? JSON.parse(doc.categories) : [],
                geographicFocus: doc.geographicFocus ? JSON.parse(doc.geographicFocus) : [],
                organizations: doc.organizations ? JSON.parse(doc.organizations) : [],
                extractedDates: doc.extractedDates ? JSON.parse(doc.extractedDates) : []
              }))
            };
          })
        );
        
        return groupsWithDocs;
      }),
    
    // Mark duplicate group as resolved
    resolve: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markDuplicateGroupResolved(input.groupId);
        return { success: true };
      })
  }),
  
  scanHistory: router({
    // Get scan history
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(10)
      }))
      .query(async ({ ctx, input }) => {
        return await db.getScanHistoryByUserId(ctx.user.id, input.limit);
      })
  }),
  
  license: licenseRouter
});

export type AppRouter = typeof appRouter;
