import { getDb } from "../db";
import { documents, duplicateGroups } from "../../drizzle/schema";
import { eq, and, ne } from "drizzle-orm";

/**
 * Detect duplicates for a user's documents
 * Finds:
 * 1. Exact duplicates (same file hash)
 * 2. Similar documents (similar content)
 * 3. Version patterns (e.g., "v1", "v2", "final", "newest")
 */
export async function detectDuplicates(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all user documents
  const userDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId));

  // Group by file hash for exact duplicates
  const hashGroups = new Map<string, typeof userDocs>();
  for (const doc of userDocs) {
    const existing = hashGroups.get(doc.fileHash) || [];
    existing.push(doc);
    hashGroups.set(doc.fileHash, existing);
  }

  // Create duplicate groups for exact matches
  for (const [hash, docs] of Array.from(hashGroups.entries())) {
    if (docs.length > 1) {
      // Create duplicate group
      const [group] = await db
        .insert(duplicateGroups)
        .values({
          userId,
          masterDocumentId: docs[0].id, // First one is master
          groupType: "exact",
        })
        .$returningId();

      // Update all documents in group
      for (let i = 0; i < docs.length; i++) {
        await db
          .update(documents)
          .set({
            duplicateGroupId: group.id,
            similarityScore: i === 0 ? 100 : 100, // All exact matches have 100% similarity
          })
          .where(eq(documents.id, docs[i].id));
      }
    }
  }

  // Detect version patterns
  await detectVersionPatterns(userId, userDocs);

  // Detect similar documents (by content similarity)
  await detectSimilarDocuments(userId, userDocs);

  return {
    totalDocuments: userDocs.length,
    duplicateGroupsCreated: hashGroups.size,
  };
}

/**
 * Detect documents that follow version naming patterns
 * e.g., "Pitch Deck v1", "Pitch Deck v2", "Pitch Deck final"
 */
async function detectVersionPatterns(userId: number, userDocs: typeof documents.$inferSelect[]) {
  const db = await getDb();
  if (!db) return;

  // Common version patterns
  const versionPatterns = [
    /(.+?)[\s_-]v?(\d+)[\s_-]?/i,  // "filename v1", "filename_v2"
    /(.+?)[\s_-](final|newest|latest|current|old|new|draft)[\s_-]?/i,
    /(.+?)[\s_-](copy|backup|temp)[\s_-]?/i,
  ];

  // Group documents by base name
  const baseNameGroups = new Map<string, typeof userDocs>();

  for (const doc of userDocs) {
    // Skip if already in a duplicate group
    if (doc.duplicateGroupId) continue;

    let baseName = doc.fileName;

    // Try to extract base name using patterns
    for (const pattern of versionPatterns) {
      const match = doc.fileName.match(pattern);
      if (match) {
        baseName = match[1].trim();
        break;
      }
    }

    // Normalize base name (remove extension, lowercase, trim)
    baseName = baseName
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .trim();

    const existing = baseNameGroups.get(baseName) || [];
    existing.push(doc);
    baseNameGroups.set(baseName, existing);
  }

  // Create groups for version patterns
  for (const [baseName, docs] of Array.from(baseNameGroups.entries())) {
    if (docs.length > 1) {
      // Find the "newest" version (by modified date)
      const sortedDocs = docs.sort((a: typeof userDocs[0], b: typeof userDocs[0]) => {
        const dateA = new Date(a.modifiedAt).getTime();
        const dateB = new Date(b.modifiedAt).getTime();
        return dateB - dateA;
      });

      const [group] = await db
        .insert(duplicateGroups)
        .values({
          userId,
          masterDocumentId: sortedDocs[0].id, // Newest is master
          groupType: "version",
        })
        .$returningId();

      // Update all documents in group
      for (const doc of sortedDocs) {
        await db
          .update(documents)
          .set({
            duplicateGroupId: group.id,
            similarityScore: 90, // Version matches are highly similar
          })
          .where(eq(documents.id, doc.id));
      }
    }
  }
}

/**
 * Detect similar documents by comparing extracted text
 * Uses simple similarity scoring based on shared words
 */
async function detectSimilarDocuments(userId: number, userDocs: typeof documents.$inferSelect[]) {
  const db = await getDb();
  if (!db) return;

  // Only compare documents that aren't already in groups
  const ungroupedDocs = userDocs.filter(doc => !doc.duplicateGroupId && doc.extractedText);

  // Compare each pair of documents
  for (let i = 0; i < ungroupedDocs.length; i++) {
    for (let j = i + 1; j < ungroupedDocs.length; j++) {
      const doc1 = ungroupedDocs[i];
      const doc2 = ungroupedDocs[j];

      if (!doc1.extractedText || !doc2.extractedText) continue;

      const similarity = calculateTextSimilarity(doc1.extractedText, doc2.extractedText);

      // If similarity is high enough, create a group
      if (similarity >= 70) {
        // Check if either document is already in a similar group
        const [existingGroup] = await db
          .select()
          .from(duplicateGroups)
          .where(
            and(
              eq(duplicateGroups.userId, userId),
              eq(duplicateGroups.groupType, "similar")
            )
          )
          .limit(1);

        let groupId: number;

        if (existingGroup) {
          groupId = existingGroup.id;
        } else {
          const [newGroup] = await db
            .insert(duplicateGroups)
            .values({
              userId,
              masterDocumentId: doc1.id, // First doc is master
              groupType: "similar",
            })
            .$returningId();
          groupId = newGroup.id;
        }

        // Update both documents
        await db
          .update(documents)
          .set({
            duplicateGroupId: groupId,
            similarityScore: similarity,
          })
          .where(eq(documents.id, doc1.id));

        await db
          .update(documents)
          .set({
            duplicateGroupId: groupId,
            similarityScore: similarity,
          })
          .where(eq(documents.id, doc2.id));
      }
    }
  }
}

/**
 * Calculate similarity between two text strings
 * Returns a score from 0-100
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Normalize texts
  const normalize = (text: string) => 
    text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 3); // Ignore short words

  const words1 = new Set(normalize(text1));
  const words2 = new Set(normalize(text2));

  if (words1.size === 0 || words2.size === 0) return 0;

  // Calculate Jaccard similarity
  const words1Array = Array.from(words1);
  const words2Array = Array.from(words2);
  const intersection = new Set(words1Array.filter(word => words2.has(word)));
  const union = new Set([...words1Array, ...words2Array]);

  const similarity = (intersection.size / union.size) * 100;

  return Math.round(similarity);
}
