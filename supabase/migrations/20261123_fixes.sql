-- =========================================================================
-- DOMICCARE CONSOLIDATED DATABASE MIGRATION SCRIPT
-- Generated: 2026-11-23
-- Idempotent & Safe to Re-run
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------------------------
-- Phase 1 Foundation Check: Types & Columns
-- -------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'caregiver', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'awaiting_payment', 'accepted', 'rejected', 'completed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- Phase 3: Caregiver Verification, Storage Policies & DB Constraints
-- -------------------------------------------------------------------------

-- 1. Ensure caregiver_documents has both legacy and new column names
ALTER TABLE public.caregiver_documents
    ADD COLUMN IF NOT EXISTS file_path TEXT,
    ADD COLUMN IF NOT EXISTS doc_type TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Backfill doc_type and file_path if missing
UPDATE public.caregiver_documents
SET doc_type = document_type
WHERE doc_type IS NULL AND document_type IS NOT NULL;

UPDATE public.caregiver_documents
SET file_path = file_url
WHERE file_path IS NULL AND file_url IS NOT NULL;

-- 2. Configure private storage bucket 'caregiver-documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'caregiver-documents',
    'caregiver-documents',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- Storage RLS policies for caregiver-documents
DROP POLICY IF EXISTS "Caregivers can upload own documents" ON storage.objects;
CREATE POLICY "Caregivers can upload own documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'caregiver-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Caregivers can view own documents" ON storage.objects;
CREATE POLICY "Caregivers can view own documents" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'caregiver-documents'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
);

-- 3. Backfill and apply Bio minimum length constraint (Issue #12)
UPDATE public.caregiver_profiles
SET bio = 'Experienced and dedicated home caregiver committed to delivering supportive, high quality care.'
WHERE bio IS NOT NULL AND length(trim(bio)) > 0 AND length(trim(bio)) < 30;

ALTER TABLE public.caregiver_profiles
    DROP CONSTRAINT IF EXISTS caregiver_bio_min_length;

ALTER TABLE public.caregiver_profiles
    ADD CONSTRAINT caregiver_bio_min_length
    CHECK (bio IS NULL OR length(trim(bio)) = 0 OR length(trim(bio)) >= 30);

-- 4. Delete existing duplicate "Application Submitted" notifications (Issue #13)
DELETE FROM public.notifications n1
USING public.notifications n2
WHERE n1.id < n2.id
  AND n1.user_id = n2.user_id
  AND n1.title = n2.title
  AND n1.title = 'Application Submitted';

-- -------------------------------------------------------------------------
-- Phase 4: Services Seed, Bookings & Payment Columns
-- -------------------------------------------------------------------------

-- 1. Ensure core service categories exist
INSERT INTO public.services (name, description) VALUES
('Daily Care', 'Assistance with bathing, dressing, grooming, eating, and general hygiene.'),
('Nursing Care', 'Professional nursing care, medication management, and medical assistance.'),
('Companionship', 'Social interaction, emotional support, walks, and recreational activities.'),
('Medical Assistance', 'Physical therapy assistance, vital signs monitoring, and wound care.'),
('Physiotherapy', 'Therapeutic physical exercises and mobility recovery support.'),
('Elder care', 'Comprehensive senior home care and daily living assistance.')
ON CONFLICT (name) DO NOTHING;

-- 2. Ensure all columns for bookings table exist
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS caregiver_payout DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
    ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
    ADD COLUMN IF NOT EXISTS transfer_id TEXT;


-- -------------------------------------------------------------------------
-- Phase 8 Addendum: Fix Sample Caregiver Locations & Search Coverage
-- -------------------------------------------------------------------------
UPDATE public.caregiver_profiles
SET city = 'Pleven',
    address = 'Pleven, Bulgaria',
    latitude = 43.4170,
    longitude = 24.6067
WHERE id = 'f07fadcd-b9af-4eec-abeb-3563d6e15a71';
