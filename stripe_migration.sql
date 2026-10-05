-- Stripe Payment Integration & Caregiver Bank Payout Migration SQL
-- Run this in the Supabase SQL Editor

-- 1. Add 'awaiting_payment' value to booking_status enum if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'booking_status'::regtype 
        AND enumlabel = 'awaiting_payment'
    ) THEN
        ALTER TYPE booking_status ADD VALUE 'awaiting_payment' BEFORE 'accepted';
    END IF;
END $$;

-- 2. Add Payment & Financial Columns to Bookings Table
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS caregiver_payout DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
    ADD COLUMN IF NOT EXISTS transfer_id TEXT;

-- 3. Add Stripe & Bank Details Columns to Caregiver Profiles Table
ALTER TABLE public.caregiver_profiles
    ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
    ADD COLUMN IF NOT EXISTS routing_number TEXT,
    ADD COLUMN IF NOT EXISTS account_number_last4 TEXT,
    ADD COLUMN IF NOT EXISTS payouts_enabled BOOLEAN DEFAULT false;
