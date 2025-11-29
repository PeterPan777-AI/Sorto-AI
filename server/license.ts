import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import crypto from "crypto";

/**
 * License management system
 * Handles trial periods, license activation, and validation
 */

// Generate a license key (for future use when implementing payment)
export function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = crypto.randomBytes(4).toString('hex').toUpperCase();
    segments.push(segment);
  }
  return segments.join('-');
}

// Validate license key format
export function isValidLicenseKeyFormat(key: string): boolean {
  const pattern = /^[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/;
  return pattern.test(key);
}

export const licenseRouter = router({
  // Get current license status
  status: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    
    const now = new Date();
    let status = user.licenseStatus;
    let daysRemaining = 0;
    let message = '';
    
    if (user.licenseStatus === 'trial') {
      if (user.trialEndDate) {
        const trialEnd = new Date(user.trialEndDate);
        if (now > trialEnd) {
          status = 'expired';
          message = 'Your free trial has expired. Please upgrade to continue using the app.';
        } else {
          daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          message = `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining in your free trial.`;
        }
      }
    } else if (user.licenseStatus === 'active') {
      if (user.subscriptionEndDate) {
        const subEnd = new Date(user.subscriptionEndDate);
        if (now > subEnd) {
          status = 'expired';
          message = 'Your subscription has expired. Please renew to continue using the app.';
        } else {
          daysRemaining = Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          message = `Your subscription is active. Renews in ${daysRemaining} days.`;
        }
      } else {
        message = 'Your subscription is active.';
      }
    } else if (user.licenseStatus === 'expired') {
      message = 'Your access has expired. Please upgrade or renew your subscription.';
    } else if (user.licenseStatus === 'cancelled') {
      message = 'Your subscription has been cancelled.';
    }
    
    return {
      status,
      daysRemaining,
      message,
      trialStartDate: user.trialStartDate,
      trialEndDate: user.trialEndDate,
      subscriptionEndDate: user.subscriptionEndDate,
      licenseKey: user.licenseKey
    };
  }),
  
  // Activate a license key (for future payment integration)
  activate: protectedProcedure
    .input(z.object({
      licenseKey: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate license key format
      if (!isValidLicenseKeyFormat(input.licenseKey)) {
        throw new Error('Invalid license key format');
      }
      
      // TODO: In production, validate with payment provider API
      // For now, we'll accept any valid format and activate for 30 days
      
      const now = new Date();
      const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      await db.updateUserLicense(ctx.user.id, {
        licenseKey: input.licenseKey,
        licenseStatus: 'active',
        subscriptionEndDate: subscriptionEnd
      });
      
      return {
        success: true,
        message: 'License activated successfully!',
        subscriptionEndDate: subscriptionEnd
      };
    }),
  
  // Get upgrade URL (placeholder for future payment integration)
  getUpgradeUrl: protectedProcedure.query(async ({ ctx }) => {
    // TODO: In production, generate Stripe checkout URL or similar
    // For now, return a placeholder
    return {
      url: 'https://example.com/upgrade',
      message: 'Payment integration coming soon'
    };
  })
});
