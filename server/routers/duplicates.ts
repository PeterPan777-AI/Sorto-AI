import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const duplicatesRouter = router({
  /**
   * Get all duplicate groups for current user
   */
  list: protectedProcedure
    .input(
      z.object({
        includeResolved: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const groups = await db.getDuplicateGroupsByUserId(
        ctx.user.id,
        input.includeResolved
      );
      
      // Get documents for each group
      const groupsWithDocs = await Promise.all(
        groups.map(async (group: any) => {
          const docs = await db.getDocumentsByDuplicateGroup(group.id);
          return {
            ...group,
            documents: docs,
          };
        })
      );
      
      return groupsWithDocs;
    }),

  /**
   * Get documents in a specific duplicate group
   */
  getGroupDocuments: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .query(async ({ input, ctx }) => {
      const docs = await db.getDocumentsByDuplicateGroup(input.groupId);
      
      // Verify ownership (check first document)
      if (docs.length > 0 && docs[0].userId !== ctx.user.id) {
        throw new Error("Access denied");
      }
      
      return docs;
    }),

  /**
   * Mark a duplicate group as resolved
   */
  resolve: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Add ownership verification
      await db.markDuplicateGroupResolved(input.groupId);
      return { success: true };
    }),
});
