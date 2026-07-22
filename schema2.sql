-- booking wale table ke andr do naye columns add hue hia cancel reason or cancelled by
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by TEXT;


ALTER TABLE public.profiles
ADD COLUMN account_status TEXT DEFAULT 'active';

-- caregiver deletion
ALTER TABLE public.profiles
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles
ADD COLUMN deleted_at TIMESTAMPTZ;

ALTER TABLE public.profiles
ADD COLUMN deleted_reason TEXT;

-- for age
ALTER TABLE public.caregiver_profiles
ADD CONSTRAINT caregiver_age_check
CHECK (
    date_of_birth >= CURRENT_DATE - INTERVAL '60 years'
    AND
    date_of_birth <= CURRENT_DATE - INTERVAL '18 years'
);
