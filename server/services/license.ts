/**
 * License Management Service
 * Handles trial tracking, license validation, and Gumroad integration
 */

export interface LicenseInfo {
  status: 'trial' | 'active' | 'expired' | 'invalid';
  licenseKey?: string;
  email?: string;
  activatedAt?: Date;
  expiresAt?: Date;
  trialStartedAt?: Date;
  trialEndsAt?: Date;
  daysRemaining?: number;
}

export interface GumroadVerifyResponse {
  success: boolean;
  uses: number;
  purchase: {
    seller_id: string;
    product_id: string;
    product_name: string;
    permalink: string;
    product_permalink: string;
    email: string;
    price: number;
    gumroad_fee: number;
    currency: string;
    quantity: number;
    discover_fee_charged: boolean;
    can_contact: boolean;
    referrer: string;
    card: {
      visual: string;
      type: string;
      bin: string;
      expiry_month: string;
      expiry_year: string;
    };
    order_number: number;
    sale_id: string;
    sale_timestamp: string;
    purchaser_id: string;
    subscription_id: string;
    variants: string;
    license_key: string;
    ip_country: string;
    recurrence: string;
    is_gift_receiver_purchase: boolean;
    refunded: boolean;
    disputed: boolean;
    dispute_won: boolean;
    id: string;
    created_at: string;
    custom_fields: Record<string, string>;
    chargebacked: boolean;
    subscription_ended_at: string | null;
    subscription_cancelled_at: string | null;
    subscription_failed_at: string | null;
  };
}

/**
 * Verify a license key with Gumroad API
 */
export async function verifyLicenseWithGumroad(
  licenseKey: string,
  productPermalink: string
): Promise<{ valid: boolean; email?: string; error?: string }> {
  try {
    // Gumroad license verification endpoint
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product_permalink: productPermalink,
        license_key: licenseKey,
        increment_uses_count: 'false', // Don't count this as a use
      }),
    });

    const data = await response.json() as GumroadVerifyResponse;

    if (data.success && data.purchase) {
      // Check if refunded, disputed, or chargebacked
      if (data.purchase.refunded || data.purchase.disputed || data.purchase.chargebacked) {
        return { valid: false, error: 'License has been refunded or disputed' };
      }

      // Check if subscription is active (for subscription products)
      if (data.purchase.subscription_id) {
        if (data.purchase.subscription_ended_at || data.purchase.subscription_cancelled_at) {
          return { valid: false, error: 'Subscription has ended' };
        }
      }

      return {
        valid: true,
        email: data.purchase.email,
      };
    }

    return { valid: false, error: 'Invalid license key' };
  } catch (error) {
    console.error('[License] Gumroad verification failed:', error);
    return { valid: false, error: 'Failed to verify license' };
  }
}

/**
 * Validate license key format (basic check before API call)
 */
export function isValidLicenseKeyFormat(licenseKey: string): boolean {
  // Gumroad license keys are typically 35 characters with dashes
  // Format: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
  const pattern = /^[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}$/;
  return pattern.test(licenseKey.toUpperCase());
}

/**
 * Calculate trial period
 */
export function calculateTrialPeriod(trialStartedAt: Date): {
  trialEndsAt: Date;
  daysRemaining: number;
  isExpired: boolean;
} {
  const TRIAL_DAYS = 7;
  const trialEndsAt = new Date(trialStartedAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const now = new Date();
  const msRemaining = trialEndsAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const isExpired = msRemaining <= 0;

  return {
    trialEndsAt,
    daysRemaining,
    isExpired,
  };
}

/**
 * Get license status for a user
 */
export function getLicenseStatus(user: {
  licenseKey?: string | null;
  licenseStatus?: string | null;
  trialStartDate?: Date | null;
  trialEndDate?: Date | null;
}): LicenseInfo {
  // If user has an active license
  if (user.licenseKey && user.licenseStatus === 'active') {
    return {
      status: 'active',
      licenseKey: user.licenseKey,
    };
  }

  // If user is in trial period
  if (user.licenseStatus === 'trial' && user.trialStartDate) {
    const { trialEndsAt, daysRemaining, isExpired } = calculateTrialPeriod(user.trialStartDate);

    if (isExpired) {
      return {
        status: 'expired',
        trialStartedAt: user.trialStartDate,
        trialEndsAt,
        daysRemaining: 0,
      };
    }

    return {
      status: 'trial',
      trialStartedAt: user.trialStartDate,
      trialEndsAt,
      daysRemaining,
    };
  }

  // If trial has expired
  if (user.licenseStatus === 'expired') {
    return {
      status: 'expired',
      trialStartedAt: user.trialStartDate || undefined,
      trialEndsAt: user.trialEndDate || undefined,
      daysRemaining: 0,
    };
  }

  // Default: start trial
  return {
    status: 'trial',
    daysRemaining: 7,
  };
}
