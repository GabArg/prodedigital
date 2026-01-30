-- Add Alias column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS alias text UNIQUE;

-- Add Birth Date column with Age Constraint
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date date;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_age_18') THEN 
        ALTER TABLE public.profiles 
        ADD CONSTRAINT check_age_18 CHECK (birth_date <= (current_date - interval '18 years'));
    END IF;
END $$;

-- Add WhatsApp column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp text;

-- Add Optional columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nationality text;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS favorite_team text;
