import { eq, and, desc, like, inArray, sql } from "drizzle-orm";
import { getDb as getDbConnection } from "./db_connection";
// Import from SQLite schema for desktop app
import { 
  InsertUser, users, 
  documents, InsertDocument, Document,
  tags, InsertTag, Tag,
  documentTags, InsertDocumentTag,
  scanHistory, InsertScanHistory, ScanHistory,
  duplicateGroups, InsertDuplicateGroup, DuplicateGroup
} from "../drizzle/schema.sqlite";
import { ENV } from './_core/env';

export async function getDb() {
  return await getDbConnection();
}

// ============ User Operations ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // Initialize trial for new users
    if (!values.trialStartDate) {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      values.trialStartDate = now;
      values.trialEndDate = trialEnd;
      values.licenseStatus = 'trial';
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // SQLite uses onConflictDoUpdate instead of onDuplicateKeyUpdate
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLicense(userId: number, licenseData: {
  licenseKey?: string;
  licenseStatus?: 'trial' | 'active' | 'expired' | 'cancelled';
  subscriptionEndDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(licenseData).where(eq(users.id, userId));
}

// ============ Document Operations ============

export async function insertDocument(doc: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(documents).values(doc);
  return result;
}

export async function getDocumentsByUserId(userId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.scannedAt))
    .limit(limit)
    .offset(offset);
}

export async function getDocumentById(documentId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDocument(documentId: number, updates: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(documents).set(updates).where(eq(documents.id, documentId));
}

export async function searchDocuments(userId: number, searchTerm: string, filters?: {
  documentType?: string;
  fileType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(documents.userId, userId)];

  // Add search term condition
  if (searchTerm) {
    conditions.push(
      sql`(${documents.fileName} LIKE ${`%${searchTerm}%`} OR ${documents.extractedText} LIKE ${`%${searchTerm}%`})`
    );
  }

  // Apply filters
  if (filters?.documentType) {
    conditions.push(eq(documents.documentType, filters.documentType));
  }
  if (filters?.fileType) {
    conditions.push(eq(documents.fileType, filters.fileType));
  }

  return await db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.scannedAt))
    .limit(100);
}

export async function getDocumentsByHash(userId: number, fileHash: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.fileHash, fileHash)));
}

export async function getDocumentStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, byType: {}, byStatus: {} };

  const allDocs = await db.select().from(documents).where(eq(documents.userId, userId));

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  allDocs.forEach((doc: Document) => {
    if (doc.documentType) {
      byType[doc.documentType] = (byType[doc.documentType] || 0) + 1;
    }
    byStatus[doc.processingStatus] = (byStatus[doc.processingStatus] || 0) + 1;
  });

  return {
    total: allDocs.length,
    byType,
    byStatus,
  };
}

// ============ Tag Operations ============

export async function insertTag(tag: InsertTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tags).values(tag);
  return result;
}

export async function getTagsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tags).where(eq(tags.userId, userId));
}

export async function addTagToDocument(documentId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(documentTags).values({ documentId, tagId });
}

export async function getDocumentTags(documentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({ tag: tags })
    .from(documentTags)
    .innerJoin(tags, eq(documentTags.tagId, tags.id))
    .where(eq(documentTags.documentId, documentId));
}

// ============ Scan History Operations ============

export async function insertScanHistory(scan: InsertScanHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scanHistory).values(scan);
  return result;
}

export async function updateScanHistory(scanId: number, updates: Partial<InsertScanHistory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(scanHistory).set(updates).where(eq(scanHistory.id, scanId));
}

export async function getScanHistoryByUserId(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scanHistory)
    .where(eq(scanHistory.userId, userId))
    .orderBy(desc(scanHistory.startedAt))
    .limit(limit);
}

// ============ Duplicate Group Operations ============

export async function insertDuplicateGroup(group: InsertDuplicateGroup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(duplicateGroups).values(group);
  return result;
}

export async function getDuplicateGroupsByUserId(userId: number, includeResolved = false) {
  const db = await getDb();
  if (!db) return [];

  const conditions = includeResolved
    ? eq(duplicateGroups.userId, userId)
    : and(eq(duplicateGroups.userId, userId), eq(duplicateGroups.isResolved, false));

  return await db
    .select()
    .from(duplicateGroups)
    .where(conditions)
    .orderBy(desc(duplicateGroups.createdAt));
}

export async function getDocumentsByDuplicateGroup(groupId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(documents)
    .where(eq(documents.duplicateGroupId, groupId))
    .orderBy(desc(documents.similarityScore));
}

export async function markDuplicateGroupResolved(groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(duplicateGroups).set({ resolved: true }).where(eq(duplicateGroups.id, groupId));
}
