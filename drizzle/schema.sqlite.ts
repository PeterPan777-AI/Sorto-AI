import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  
  // License and trial management
  licenseKey: text("licenseKey"),
  licenseStatus: text("licenseStatus", { enum: ["trial", "active", "expired", "cancelled"] }).default("trial").notNull(),
  trialStartDate: integer("trialStartDate", { mode: "timestamp" }),
  trialEndDate: integer("trialEndDate", { mode: "timestamp" }),
  subscriptionEndDate: integer("subscriptionEndDate", { mode: "timestamp" }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documents table - stores metadata about each scanned document
 */
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  
  // File information
  fileName: text("fileName").notNull(),
  filePath: text("filePath").notNull(),
  fileSize: integer("fileSize").notNull(), // in bytes
  fileType: text("fileType").notNull(), // docx, pptx, xlsx, etc.
  fileHash: text("fileHash").notNull(), // SHA-256 for duplicate detection
  
  // Content
  extractedText: text("extractedText"), // Full extracted text content
  
  // Metadata
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  modifiedAt: integer("modifiedAt", { mode: "timestamp" }).notNull(),
  scannedAt: integer("scannedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  
  // AI-generated tags and classifications
  documentType: text("documentType"), // pitch_deck, strategy, proposal, etc.
  topics: text("topics"), // JSON array of main topics
  categories: text("categories"), // JSON array of categories
  geographicFocus: text("geographicFocus"), // JSON array of locations
  targetAudience: text("targetAudience"),
  organizations: text("organizations"), // JSON array of mentioned orgs
  extractedDates: text("extractedDates"), // JSON array of important dates
  
  // Duplicate detection
  duplicateGroupId: integer("duplicateGroupId"),
  similarityScore: integer("similarityScore"), // 0-100, how similar to master document
  
  // Processing status
  processingStatus: text("processingStatus", { enum: ["pending", "processing", "completed", "failed"] }).default("pending").notNull(),
  processingError: text("processingError"),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Tags table - user-defined or AI-suggested tags
 */
export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  name: text("name").notNull(),
  color: text("color"), // Hex color code
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Document-Tag relationship (many-to-many)
 */
export const documentTags = sqliteTable("document_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("documentId").notNull(),
  tagId: integer("tagId").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DocumentTag = typeof documentTags.$inferSelect;
export type InsertDocumentTag = typeof documentTags.$inferInsert;

/**
 * Scan history - tracks folder scanning operations
 */
export const scanHistory = sqliteTable("scan_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  folderPath: text("folderPath").notNull(),
  status: text("status", { enum: ["running", "completed", "failed"] }).notNull(),
  startedAt: integer("startedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  filesScanned: integer("filesScanned"),
  filesProcessed: integer("filesProcessed"),
  filesFailed: integer("filesFailed"),
  errorMessage: text("errorMessage"),
});

export type ScanHistory = typeof scanHistory.$inferSelect;
export type InsertScanHistory = typeof scanHistory.$inferInsert;

/**
 * Duplicate groups - clusters of similar/duplicate documents
 */
export const duplicateGroups = sqliteTable("duplicate_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  masterDocumentId: integer("masterDocumentId").notNull(), // The "best" version
  groupType: text("groupType", { enum: ["exact", "version", "similar"] }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  resolvedAt: integer("resolvedAt", { mode: "timestamp" }),
  isResolved: integer("isResolved", { mode: "boolean" }).default(false).notNull(),
});

export type DuplicateGroup = typeof duplicateGroups.$inferSelect;
export type InsertDuplicateGroup = typeof duplicateGroups.$inferInsert;
