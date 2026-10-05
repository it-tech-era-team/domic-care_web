import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is missing from environment variables.");
}

export const stripe = new Stripe(stripeSecretKey || "", {
  typescript: true,
});

export const PLATFORM_FEE_PERCENTAGE = 0.12; // 12% Platform Fee

/**
 * Calculates platform fee (12%) and caregiver payout (88%)
 */
export function calculateBookingSplit(totalAmountUSD: number) {
  const amountCents = Math.round(totalAmountUSD * 100);
  const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_PERCENTAGE);
  const caregiverPayoutCents = amountCents - platformFeeCents;

  return {
    totalAmountUSD: Number(totalAmountUSD.toFixed(2)),
    platformFeeUSD: Number((platformFeeCents / 100).toFixed(2)),
    caregiverPayoutUSD: Number((caregiverPayoutCents / 100).toFixed(2)),
    totalCents: amountCents,
    platformFeeCents,
    caregiverPayoutCents,
  };
}

/**
 * Ensures a caregiver has a valid Stripe Connected Account ID
 */
export async function ensureStripeCaregiverAccount(
  caregiverId: string,
  email: string,
  fullName: string,
  existingAccountId?: string | null
): Promise<string | null> {
  if (existingAccountId) {
    return existingAccountId;
  }

  // 1. Try Custom account creation with full US test capability configuration
  try {
    const account = await stripe.accounts.create({
      type: "custom",
      country: "US",
      email: email || `caregiver_${caregiverId.slice(0, 8)}@example.com`,
      business_type: "individual",
      individual: {
        first_name: fullName.split(" ")[0] || "Caregiver",
        last_name: fullName.split(" ").slice(1).join(" ") || "Pro",
        email: email || `caregiver_${caregiverId.slice(0, 8)}@example.com`,
        dob: { day: 1, month: 1, year: 1990 },
        address: {
          line1: "123 Health St",
          city: "San Francisco",
          state: "CA",
          postal_code: "94111",
          country: "US",
        },
        ssn_last_4: "0000",
      },
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_profile: {
        mcc: "8099",
        url: "https://domicare.com",
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: "127.0.0.1",
      },
    });
    if (account?.id) return account.id;
  } catch (err: any) {
    console.warn("[Stripe] Custom account creation note:", err?.message || err);
  }

  // 2. Try Express account creation
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: email || `caregiver_${caregiverId.slice(0, 8)}@example.com`,
      capabilities: {
        transfers: { requested: true },
      },
    });
    if (account?.id) return account.id;
  } catch (err: any) {
    console.warn("[Stripe] Express account creation note:", err?.message || err);
  }

  return null;
}

/**
 * Attaches bank account details to caregiver's Stripe Account
 */
export async function attachCaregiverBankAccount(
  stripeAccountId: string,
  routingNumber: string,
  accountNumber: string,
  accountHolderName: string
) {
  const token = await stripe.tokens.create({
    bank_account: {
      country: "US",
      currency: "usd",
      routing_number: routingNumber,
      account_number: accountNumber,
      account_holder_name: accountHolderName,
      account_holder_type: "individual",
    },
  });

  const externalAccount = await stripe.accounts.createExternalAccount(stripeAccountId, {
    external_account: token.id,
  });

  return externalAccount;
}

/**
 * Executes transfer of 88% booking payout to caregiver's Stripe account
 * Handles multi-currency platform conversion (e.g. USD charge -> EUR balance transaction)
 */
export async function transferPayoutToCaregiver({
  caregiverStripeAccountId,
  paymentIntentId,
  payoutAmountUSD,
  bookingId,
}: {
  caregiverStripeAccountId: string;
  paymentIntentId?: string | null;
  payoutAmountUSD: number;
  bookingId: string;
}) {
  let sourceChargeId: string | undefined = undefined;
  let transferCurrency = "usd";
  let payoutCents = Math.round(payoutAmountUSD * 100);

  // If PaymentIntent exists, inspect charge & balance transaction currency
  if (paymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      const chargeId = typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id;

      if (chargeId) {
        sourceChargeId = chargeId;
        const charge = await stripe.charges.retrieve(chargeId);
        
        if (charge.balance_transaction) {
          const balanceTxnId = typeof charge.balance_transaction === "string" 
            ? charge.balance_transaction 
            : charge.balance_transaction.id;
            
          const balanceTxn = await stripe.balanceTransactions.retrieve(balanceTxnId);
          if (balanceTxn) {
            transferCurrency = balanceTxn.currency;
            payoutCents = Math.round(balanceTxn.amount * 0.88); // 88% of actual platform balance amount
          }
        }
      }
    } catch (err: any) {
      console.warn("[Stripe Transfer Helper] PaymentIntent inspect warning:", err?.message || err);
    }
  }

  const transferParams: Stripe.TransferCreateParams = {
    amount: payoutCents,
    currency: transferCurrency,
    destination: caregiverStripeAccountId,
    transfer_group: bookingId,
    description: `Caregiver Payout (88%) for Booking ${bookingId.slice(0, 8)}`,
  };

  if (sourceChargeId) {
    transferParams.source_transaction = sourceChargeId;
  }

  const transfer = await stripe.transfers.create(transferParams);
  return transfer;
}
