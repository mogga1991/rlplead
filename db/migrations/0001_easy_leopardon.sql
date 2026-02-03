ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'sales';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "specialities" jsonb;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_name" varchar(150);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "position" varchar(255);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "organization_name" varchar(255);