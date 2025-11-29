import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const documentsRouter = router({
  /**
   * Get all documents for current user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const documents = await db.getDocumentsByUserId(
        ctx.user.id,
        input.limit,
        input.offset
      );
      return documents;
    }),

  /**
   * Search documents
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        documentType: z.string().optional(),
        fileType: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const results = await db.searchDocuments(ctx.user.id, input.query, {
        documentType: input.documentType,
        fileType: input.fileType,
      });
      return results;
    }),

  /**
   * Get document by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const doc = await db.getDocumentById(input.id);
      
      // Verify ownership
      if (!doc || doc.userId !== ctx.user.id) {
        throw new Error("Document not found");
      }
      
      return doc;
    }),

  /**
   * Get document statistics
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await db.getDocumentStats(ctx.user.id);
    return stats;
  }),

  /**
   * Delete a document
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const doc = await db.getDocumentById(input.id);
      
      // Verify ownership
      if (!doc || doc.userId !== ctx.user.id) {
        throw new Error("Document not found");
      }
      
      // TODO: Delete from database
      // For now, just mark as deleted or return success
      return { success: true };
    }),
});
