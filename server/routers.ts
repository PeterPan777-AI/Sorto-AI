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
import { scanRouter } from "./routers/scan";
import { documentsRouter } from "./routers/documents";
import { duplicatesRouter } from "./routers/duplicates";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

export const appRouter = router({
  system: systemRouter,
  scan: scanRouter,
  documents: documentsRouter,
  duplicates: duplicatesRouter,
  
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
