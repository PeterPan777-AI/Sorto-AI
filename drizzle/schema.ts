import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
  // License and trial management
  licenseKey: varchar("licenseKey", { length: 255 }),
  licenseStatus: mysqlEnum("licenseStatus", ["trial", "active", "expired", "cancelled"]).default("trial").notNull(),
  trialStartDate: timestamp("trialStartDate"),
  trialEndDate: timestamp("trialEndDate"),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documents table - stores metadata about each scanned document
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // File information
  fileName: varchar("fileName", { length: 500 }).notNull(),
  filePath: text("filePath").notNull(),
  fileSize: int("fileSize").notNull(), // in bytes
  fileType: varchar("fileType", { length: 50 }).notNull(), // docx, pptx, xlsx, etc.
  fileHash: varchar("fileHash", { length: 64 }).notNull(), // SHA-256 for duplicate detection
  
  // Content
  extractedText: text("extractedText"), // Full extracted text content
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  modifiedAt: timestamp("modifiedAt").notNull(), // File's last modified date
  scannedAt: timestamp("scannedAt").defaultNow().notNull(),
  
  // AI-generated tags and classifications
  documentType: varchar("documentType", { length: 100 }), // pitch_deck, strategy, proposal, etc.
  topics: text("topics"), // JSON array of topics
  categories: text("categories"), // JSON array of categories
  geographicFocus: text("geographicFocus"), // JSON array of locations
  targetAudience: varchar("targetAudience", { length: 200 }),
  extractedDates: text("extractedDates"), // JSON array of dates found in content
  organizations: text("organizations"), // JSON array of company/org names
  
  // Duplicate detection
  duplicateGroupId: int("duplicateGroupId"), // Groups similar documents together
  similarityScore: int("similarityScore"), // 0-100 similarity to group master
  
  // Status
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  processingError: text("processingError"),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  fileHashIdx: index("fileHash_idx").on(table.fileHash),
  duplicateGroupIdx: index("duplicateGroup_idx").on(table.duplicateGroupId),
  documentTypeIdx: index("documentType_idx").on(table.documentType),
}));

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Tags table - custom tags that can be applied to documents
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }), // hex color for UI
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Document tags junction table - many-to-many relationship
 */
export const documentTags = mysqlTable("document_tags", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  documentIdIdx: index("documentId_idx").on(table.documentId),
  tagIdIdx: index("tagId_idx").on(table.tagId),
}));

export type DocumentTag = typeof documentTags.$inferSelect;
export type InsertDocumentTag = typeof documentTags.$inferInsert;

/**
 * Scan history - tracks folder scans
 */
export const scanHistory = mysqlTable("scan_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  folderPath: text("folderPath").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  filesScanned: int("filesScanned").default(0).notNull(),
  filesProcessed: int("filesProcessed").default(0).notNull(),
  filesFailed: int("filesFailed").default(0).notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed", "cancelled"]).default("running").notNull(),
  errorMessage: text("errorMessage"),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type ScanHistory = typeof scanHistory.$inferSelect;
export type InsertScanHistory = typeof scanHistory.$inferInsert;

/**
 * Duplicate groups - groups of similar/duplicate documents
 */
export const duplicateGroups = mysqlTable("duplicate_groups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  masterDocumentId: int("masterDocumentId"), // The "main" version in the group
  groupType: mysqlEnum("groupType", ["exact", "similar", "version"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolved: boolean("resolved").default(false).notNull(), // User has handled this group
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type DuplicateGroup = typeof duplicateGroups.$inferSelect;
export type InsertDuplicateGroup = typeof duplicateGroups.$inferInsert;
