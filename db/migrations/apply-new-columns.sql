-- Add new columns to contacts table (skip if they already exist)
DO $$
BEGIN
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'first_name') THEN
        ALTER TABLE "contacts" ADD COLUMN "first_name" varchar(100);
    END IF;

    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'last_name') THEN
        ALTER TABLE "contacts" ADD COLUMN "last_name" varchar(150);
    END IF;

    -- Add position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'position') THEN
        ALTER TABLE "contacts" ADD COLUMN "position" varchar(255);
    END IF;

    -- Add linkedin_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_url') THEN
        ALTER TABLE "contacts" ADD COLUMN "linkedin_url" text;
    END IF;

    -- Add organization_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'organization_name') THEN
        ALTER TABLE "contacts" ADD COLUMN "organization_name" varchar(255);
    END IF;
END $$;

-- Add new column to companies table (skip if it already exists)
DO $$
BEGIN
    -- Add specialities column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'specialities') THEN
        ALTER TABLE "companies" ADD COLUMN "specialities" jsonb;
    END IF;
END $$;

-- Set default for users role column (safe to run multiple times)
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'sales';
