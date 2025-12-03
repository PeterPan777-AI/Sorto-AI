import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import {
  verifyLicenseWithGumroad,
  isValidLicenseKeyFormat,
  getLicenseStatus,
  calculateTrialPeriod,
} from '../services/license';
import { getDb } from '../db_connection';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Gumroad product permalink - UPDATE THIS with your actual product permalink
const GUMROAD_PRODUCT_PERMALINK = process.env.GUMROAD_PRODUCT_PERMALINK || 'sorto';

export const licenseRouter = router({
  /**
   * Get current license status for the logged-in user
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const licenseInfo = getLicenseStatus(ctx.user);
    return licenseInfo;
  }),

  /**
   * Start trial for a new user
   */
  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();

    // Check if user already has a trial or license
    if (ctx.user.licenseStatus === 'trial' || ctx.user.licenseStatus === 'active') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Trial already started or license already active',
      });
    }

    // Start trial
    const trialStart = new Date();
    const { trialEndsAt } = calculateTrialPeriod(trialStart);

    await db
      .update(users)
      .set({
        licenseStatus: 'trial',
        trialStartDate: trialStart,
        trialEndDate: trialEndsAt,
      })
      .where(eq(users.id, ctx.user.id));

    return {
      success: true,
      trialStartedAt: trialStart,
      trialEndsAt,
      daysRemaining: 7,
    };
  }),

  /**
   * Activate license with a Gumroad license key
   */
  activateLicense: protectedProcedure
    .input(
      z.object({
        licenseKey: z.string().min(1, 'License key is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Validate format first
      if (!isValidLicenseKeyFormat(input.licenseKey)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid license key format',
        });
      }

      // Verify with Gumroad
      const verification = await verifyLicenseWithGumroad(
        input.licenseKey,
        GUMROAD_PRODUCT_PERMALINK
      );

      if (!verification.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: verification.error || 'Invalid license key',
        });
      }

      // Update user with license
      await db
        .update(users)
        .set({
          licenseKey: input.licenseKey,
          licenseStatus: 'active',
          email: verification.email || ctx.user.email,
        })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: 'License activated successfully!',
        email: verification.email,
      };
    }),

  /**
   * Deactivate license (for testing or user request)
   */
  deactivateLicense: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();

    await db
      .update(users)
      .set({
        licenseKey: null,
        licenseStatus: 'expired',
      })
      .where(eq(users.id, ctx.user.id));

    return {
      success: true,
      message: 'License deactivated',
    };
  }),

  /**
   * Check if user can access features (trial not expired or has active license)
   */
  canAccessFeatures: protectedProcedure.query(async ({ ctx }) => {
    const licenseInfo = getLicenseStatus(ctx.user);

    const canAccess = licenseInfo.status === 'trial' || licenseInfo.status === 'active';

    return {
      canAccess,
      status: licenseInfo.status,
      daysRemaining: licenseInfo.daysRemaining,
      message: !canAccess
        ? 'Your trial has expired. Please activate a license to continue using Sorto.'
        : undefined,
    };
  }),
});
