import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { documents, scanHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { detectDuplicates } from "../services/duplicate_detector";

export const scanRouter = router({
  /**
   * Start scanning a folder for documents
   */
  startScan: protectedProcedure
    .input(
      z.object({
        folderPath: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { folderPath } = input;
      const userId = ctx.user.id;

      // Create scan history record
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [scanRecord] = await db.insert(scanHistory).values({
        userId,
        folderPath,
        status: "running",
      }).$returningId();

      // Start async scanning process
      scanFolderAsync(userId, folderPath, scanRecord.id).catch(async (error) => {
        console.error("Scan error:", error);
        const db = await getDb();
        if (!db) return;
        await db.update(scanHistory)
          .set({
            status: "failed",
            errorMessage: error.message,
            completedAt: new Date(),
          })
          .where(eq(scanHistory.id, scanRecord.id));
      });

      return {
        scanId: scanRecord.id,
        message: "Scan started",
      };
    }),

  /**
   * Get scan status
   */
  getScanStatus: protectedProcedure
    .input(z.object({ scanId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [scan] = await db
        .select()
        .from(scanHistory)
        .where(
          and(
            eq(scanHistory.id, input.scanId),
            eq(scanHistory.userId, ctx.user.id)
          )
        );

      return scan;
    }),

  /**
   * Get scan history
   */
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const scans = await db
      .select()
      .from(scanHistory)
      .where(eq(scanHistory.userId, ctx.user.id))
      .orderBy(desc(scanHistory.startedAt))
      .limit(10);

    return scans;
  }),

  /**
   * Cancel a running scan
   */
  cancelScan: protectedProcedure
    .input(z.object({ scanId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(scanHistory)
        .set({
          status: "cancelled",
          completedAt: new Date(),
        })
        .where(
          and(
            eq(scanHistory.id, input.scanId),
            eq(scanHistory.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Run duplicate detection
   */
  detectDuplicates: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await detectDuplicates(ctx.user.id);
    return result;
  }),
});

/**
 * Async function to scan folder and process documents
 */
async function scanFolderAsync(
  userId: number,
  folderPath: string,
  scanId: number
) {
  const supportedExtensions = [".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".pdf", ".txt"];
  let filesScanned = 0;
  let filesProcessed = 0;
  let filesFailed = 0;

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Recursively scan folder
    const files = await getAllFiles(folderPath, supportedExtensions);
    filesScanned = files.length;

    // Update scan record
    await db
      .update(scanHistory)
      .set({ filesScanned })
      .where(eq(scanHistory.id, scanId));

    // Process each file
    for (const filePath of files) {
      try {
        await processDocument(userId, filePath);
        filesProcessed++;
      } catch (error) {
        console.error(`Failed to process ${filePath}:`, error);
        filesFailed++;
      }

      // Update progress
      await db
        .update(scanHistory)
        .set({ filesProcessed, filesFailed })
        .where(eq(scanHistory.id, scanId));
    }

    // Mark scan as completed
    await db
      .update(scanHistory)
      .set({
        status: "completed",
        completedAt: new Date(),
        filesScanned,
        filesProcessed,
        filesFailed,
      })
      .where(eq(scanHistory.id, scanId));
  } catch (error) {
    console.error("Scan folder error:", error);
    await db
      .update(scanHistory)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      })
      .where(eq(scanHistory.id, scanId));
  }
}

/**
 * Recursively get all files with supported extensions
 */
async function getAllFiles(
  dirPath: string,
  supportedExtensions: string[]
): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await getAllFiles(fullPath, supportedExtensions);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (supportedExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return files;
}

/**
 * Process a single document
 */
async function processDocument(userId: number, filePath: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get file stats
  const stats = await fs.stat(filePath);
  const fileName = path.basename(filePath);
  const fileType = path.extname(fileName).toLowerCase().replace(".", "");

  // Calculate file hash for duplicate detection
  const fileBuffer = await fs.readFile(filePath);
  const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // Check if document already exists
  const [existing] = await db
    .select()
    .from(documents)
    .where(
      and(eq(documents.userId, userId), eq(documents.fileHash, fileHash))
    );

  if (existing) {
    console.log(`Document already exists: ${fileName}`);
    return existing;
  }

  // Extract text content
  let extractedText = "";
  try {
    extractedText = await extractTextFromFile(filePath, fileType);
  } catch (error) {
    console.error(`Failed to extract text from ${fileName}:`, error);
  }

  // Insert document record
  const [doc] = await db
    .insert(documents)
    .values({
      userId,
      fileName,
      filePath,
      fileSize: stats.size,
      fileType,
      fileHash,
      extractedText,
      modifiedAt: stats.mtime,
      processingStatus: "pending",
    })
    .$returningId();

  // Trigger AI tagging (async, don't wait)
  tagDocumentWithAI(doc.id, extractedText).catch((error) => {
    console.error(`AI tagging failed for ${fileName}:`, error);
  });

  return doc;
}

/**
 * Extract text from various file types using Python script
 */
async function extractTextFromFile(
  filePath: string,
  fileType: string
): Promise<string> {
  if (fileType === "txt") {
    return await fs.readFile(filePath, "utf-8");
  }

  try {
    const scriptPath = path.join(process.cwd(), "server", "services", "document_extractor.py");
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn("python3", [scriptPath, filePath]);
      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          if (result.success) {
            resolve(result.text || "");
          } else {
            reject(new Error(result.error || "Unknown extraction error"));
          }
        } catch (error) {
          reject(new Error(`Failed to parse extraction result: ${error}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error("Extraction timeout"));
      }, 30000);
    });
  } catch (error) {
    console.error(`Extraction error for ${filePath}:`, error);
    return `[Failed to extract content from ${path.basename(filePath)}]`;
  }
}

/**
 * Tag document with AI using LLM
 */
async function tagDocumentWithAI(documentId: number, extractedText: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Mark as processing
  await db
    .update(documents)
    .set({ processingStatus: "processing" })
    .where(eq(documents.id, documentId));

  try {
    // Skip AI tagging if text is too short or empty
    if (!extractedText || extractedText.length < 50) {
      await db
        .update(documents)
        .set({
          processingStatus: "completed",
          documentType: "unknown",
        })
        .where(eq(documents.id, documentId));
      return;
    }

    // Use LLM to analyze document and extract metadata
    const { invokeLLM } = await import("../_core/llm");
    
    const prompt = `Analyze this document and extract key metadata. Return a JSON object with:
- documentType: one of [pitch_deck, strategy, proposal, report, contract, invoice, presentation, spreadsheet, email, letter, other]
- topics: array of 2-5 main topics/themes
- categories: array of 1-3 broad categories (e.g., business, finance, marketing, legal, hr, technical)
- targetAudience: brief description of intended audience
- organizations: array of company/organization names mentioned
- geographicFocus: array of countries/regions mentioned

Document text (first 3000 chars):
${extractedText.substring(0, 3000)}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a document analysis assistant. Extract metadata from documents and return structured JSON." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "document_metadata",
          strict: true,
          schema: {
            type: "object",
            properties: {
              documentType: { type: "string" },
              topics: { type: "array", items: { type: "string" } },
              categories: { type: "array", items: { type: "string" } },
              targetAudience: { type: "string" },
              organizations: { type: "array", items: { type: "string" } },
              geographicFocus: { type: "array", items: { type: "string" } }
            },
            required: ["documentType", "topics", "categories"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from LLM");
    if (typeof content !== "string") throw new Error("Invalid response format from LLM");

    const metadata = JSON.parse(content);

    await db
      .update(documents)
      .set({
        documentType: metadata.documentType || "other",
        topics: JSON.stringify(metadata.topics || []),
        categories: JSON.stringify(metadata.categories || []),
        targetAudience: metadata.targetAudience || null,
        organizations: JSON.stringify(metadata.organizations || []),
        geographicFocus: JSON.stringify(metadata.geographicFocus || []),
        processingStatus: "completed",
      })
      .where(eq(documents.id, documentId));
  } catch (error) {
    console.error(`AI tagging failed for document ${documentId}:`, error);
    await db
      .update(documents)
      .set({
        processingStatus: "failed",
        processingError: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(documents.id, documentId));
  }
}
