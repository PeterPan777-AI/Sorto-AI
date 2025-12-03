import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db_connection';
import * as db from './db';

describe('Database Operations', () => {
  beforeAll(async () => {
    // Ensure database is connected
    const database = await getDb();
    expect(database).toBeTruthy();
  });

  describe('User Operations', () => {
    it('should create and retrieve a user', async () => {
      const testUser = {
        openId: 'test-user-' + Date.now(),
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
      };

      await db.upsertUser(testUser);
      const retrieved = await db.getUserByOpenId(testUser.openId);

      expect(retrieved).toBeTruthy();
      expect(retrieved?.openId).toBe(testUser.openId);
      expect(retrieved?.name).toBe(testUser.name);
      expect(retrieved?.email).toBe(testUser.email);
    });
  });

  describe('Document Operations', () => {
    let testUserId: number;

    beforeAll(async () => {
      // Create a test user
      const testUser = {
        openId: 'test-doc-user-' + Date.now(),
        name: 'Doc Test User',
      };
      await db.upsertUser(testUser);
      const user = await db.getUserByOpenId(testUser.openId);
      testUserId = user!.id;
    });

    it('should create and retrieve a document', async () => {
      const testDoc = {
        userId: testUserId,
        fileName: 'test-document.docx',
        filePath: '/test/path/test-document.docx',
        fileSize: 1024,
        fileType: 'docx',
        fileHash: 'abc123hash',
        extractedText: 'This is test content',
        modifiedAt: new Date(),
        documentType: 'report',
        processingStatus: 'completed' as const,
      };

      const docId = await db.insertDocument(testDoc);
      expect(docId).toBeGreaterThan(0);

      const retrieved = await db.getDocumentById(docId);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.fileName).toBe(testDoc.fileName);
      expect(retrieved?.extractedText).toBe(testDoc.extractedText);
    });

    it('should search documents by query', async () => {
      const testDoc = {
        userId: testUserId,
        fileName: 'searchable-document.docx',
        filePath: '/test/path/searchable.docx',
        fileSize: 2048,
        fileType: 'docx',
        fileHash: 'search123',
        extractedText: 'This document contains searchable content about AI and machine learning',
        modifiedAt: new Date(),
        processingStatus: 'completed' as const,
      };

      await db.insertDocument(testDoc);

      const results = await db.searchDocuments(testUserId, 'machine learning');
      expect(results.length).toBeGreaterThan(0);
      
      const found = results.find(doc => doc.fileName === 'searchable-document.docx');
      expect(found).toBeTruthy();
    });

    it('should get document statistics', async () => {
      const stats = await db.getDocumentStats(testUserId);
      
      expect(stats).toBeTruthy();
      expect(stats.totalDocuments).toBeGreaterThan(0);
      expect(stats.byType).toBeDefined();
      expect(stats.byStatus).toBeDefined();
    });
  });

  describe('Tag Operations', () => {
    let testUserId: number;

    beforeAll(async () => {
      const testUser = {
        openId: 'test-tag-user-' + Date.now(),
        name: 'Tag Test User',
      };
      await db.upsertUser(testUser);
      const user = await db.getUserByOpenId(testUser.openId);
      testUserId = user!.id;
    });

    it('should create and retrieve tags', async () => {
      const testTag = {
        userId: testUserId,
        name: 'Important',
        color: '#FF0000',
      };

      const tagId = await db.insertTag(testTag);
      expect(tagId).toBeGreaterThan(0);

      const tags = await db.getTagsByUserId(testUserId);
      const found = tags.find(t => t.name === 'Important');
      expect(found).toBeTruthy();
      expect(found?.color).toBe('#FF0000');
    });
  });

  describe('Duplicate Detection', () => {
    let testUserId: number;

    beforeAll(async () => {
      const testUser = {
        openId: 'test-dup-user-' + Date.now(),
        name: 'Duplicate Test User',
      };
      await db.upsertUser(testUser);
      const user = await db.getUserByOpenId(testUser.openId);
      testUserId = user!.id;
    });

    it('should create duplicate group', async () => {
      // Create master document
      const masterDoc = {
        userId: testUserId,
        fileName: 'master-doc.docx',
        filePath: '/test/master.docx',
        fileSize: 1024,
        fileType: 'docx',
        fileHash: 'master123',
        extractedText: 'Master document content',
        modifiedAt: new Date(),
        processingStatus: 'completed' as const,
      };

      const masterDocId = await db.insertDocument(masterDoc);

      // Create duplicate group
      const groupData = {
        userId: testUserId,
        masterDocumentId: masterDocId,
        groupType: 'exact' as const,
      };

      const groupId = await db.insertDuplicateGroup(groupData);
      expect(groupId).toBeGreaterThan(0);

      // Verify group was created
      const groups = await db.getDuplicateGroupsByUserId(testUserId);
      expect(groups.length).toBeGreaterThan(0);
    });
  });
});
