-- =========================================================================
-- DOMICCARE BIDIRECTIONAL REVIEWS MIGRATION
-- Generated: 2026-11-26
-- Allows both User (Client) and Caregiver to review a completed booking
-- =========================================================================

-- 1. Drop existing single booking unique constraint
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_key;

-- 2. Add reviewer_role column (defaults to 'user' for existing records)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_role TEXT NOT NULL DEFAULT 'user';

-- 3. Composite unique constraint so each role reviews at most once per booking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reviews_booking_reviewer_role_unique'
    ) THEN
        ALTER TABLE public.reviews ADD CONSTRAINT reviews_booking_reviewer_role_unique UNIQUE (booking_id, reviewer_role);
    END IF;
END $$;
