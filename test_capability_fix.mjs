import Stripe from 'stripe';
import fs from 'fs';

// Dynamically read Stripe secret key from environment or .env.local
let secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey && fs.existsSync('.env.local')) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2 && parts[0].trim() === 'STRIPE_SECRET_KEY') {
      secretKey = parts.slice(1).join('=').trim();
    }
  });
}

if (!secretKey) {
  console.error('Error: STRIPE_SECRET_KEY not found in .env.local or environment');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

async function testEurTransfer() {
  console.log('1. Creating Custom Connected Account in US...');
  const account = await stripe.accounts.create({
    type: 'custom',
    country: 'US',
    email: `caregiver_${Date.now()}@example.com`,
    business_type: 'individual',
    individual: {
      first_name: 'Caregiver',
      last_name: 'Pro',
      email: `caregiver_${Date.now()}@example.com`,
      dob: { day: 1, month: 1, year: 1990 },
      address: {
        line1: '123 Health St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94111',
        country: 'US'
      },
      ssn_last_4: '0000'
    },
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true }
    },
    business_profile: {
      mcc: '8099',
      url: 'https://domicare.com'
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: '127.0.0.1'
    }
  });

  console.log('Created Account ID:', account.id);

  console.log('2. Creating Charge ($44.00 USD)...');
  const charge = await stripe.charges.create({
    amount: 4400,
    currency: 'usd',
    source: 'tok_visa',
    description: 'Booking payment'
  });

  const balanceTxn = await stripe.balanceTransactions.retrieve(charge.balance_transaction);
  console.log('Converted Platform Balance Transaction Amount:', balanceTxn.amount, balanceTxn.currency.toUpperCase());

  // 88% payout of the platform balance amount
  const payoutCents = Math.round(balanceTxn.amount * 0.88);

  console.log(`3. Executing Transfer of 88% (${payoutCents} cents ${balanceTxn.currency.toUpperCase()}) to Caregiver Account...`);
  const transfer = await stripe.transfers.create({
    amount: payoutCents,
    currency: balanceTxn.currency,
    destination: account.id,
    source_transaction: charge.id,
    description: 'Caregiver Payout (88%) for Domicare Booking'
  });

  console.log('🎉🎉🎉 SUCCESS! STRIPE TRANSFER CREATED! Transfer ID:', transfer.id);
  console.log('Check your dashboard at https://dashboard.stripe.com/test/connect/transfers !');
}

testEurTransfer();
