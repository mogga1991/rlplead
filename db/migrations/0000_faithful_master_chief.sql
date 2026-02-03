CREATE TABLE "companies" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"uei" varchar(50),
	"duns" varchar(50),
	"name" text NOT NULL,
	"recipient_type" varchar(255),
	"recipient_scope" varchar(50),
	"city" varchar(255),
	"state" varchar(2),
	"country" varchar(100),
	"zip_code" varchar(20),
	"congressional_district" varchar(10),
	"total_awards" numeric(20, 2) DEFAULT '0',
	"total_obligations" numeric(20, 2) DEFAULT '0',
	"total_outlays" numeric(20, 2) DEFAULT '0',
	"contract_count" integer DEFAULT 0,
	"avg_contract_value" numeric(20, 2) DEFAULT '0',
	"largest_contract_value" numeric(20, 2) DEFAULT '0',
	"first_contract_date" timestamp,
	"last_contract_date" timestamp,
	"active_contracts" integer DEFAULT 0,
	"years_in_business" integer DEFAULT 0,
	"top_agencies" jsonb,
	"agency_count" integer DEFAULT 0,
	"top_naics" jsonb,
	"top_psc" jsonb,
	"contract_types" jsonb,
	"set_aside_programs" jsonb,
	"competition_level" jsonb,
	"covid19_recipient" boolean DEFAULT false,
	"infrastructure_recipient" boolean DEFAULT false,
	"disaster_funding_recipient" boolean DEFAULT false,
	"performance_states" jsonb,
	"multi_state_operator" boolean DEFAULT false,
	"company_size" varchar(100),
	"industry" varchar(255),
	"website" text,
	"linkedin" text,
	"description" text,
	"opportunity_score" integer DEFAULT 0,
	"relationship_strength" varchar(50),
	"spending_trend" varchar(50),
	"key_insights" jsonb,
	"recommended_approach" text,
	"last_enriched" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_uei_unique" UNIQUE("uei")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"company_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"linkedin" text,
	"photo_url" text,
	"department" varchar(255),
	"seniority" varchar(100),
	"is_decision_maker" boolean DEFAULT false,
	"is_primary" boolean DEFAULT false,
	"source" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"company_id" varchar(50) NOT NULL,
	"award_type" varchar(50),
	"description" text,
	"award_amount" numeric(20, 2),
	"total_obligation" numeric(20, 2),
	"total_outlays" numeric(20, 2),
	"start_date" timestamp,
	"end_date" timestamp,
	"last_modified_date" timestamp,
	"awarding_agency_code" varchar(50),
	"awarding_agency_name" varchar(255),
	"funding_agency_code" varchar(50),
	"funding_agency_name" varchar(255),
	"naics_code" varchar(20),
	"naics_description" varchar(500),
	"psc_code" varchar(20),
	"psc_description" varchar(500),
	"contract_type" varchar(100),
	"contract_pricing_type" varchar(100),
	"set_aside_type" varchar(100),
	"extent_competed" varchar(100),
	"performance_city" varchar(255),
	"performance_state" varchar(2),
	"performance_country" varchar(100),
	"covid19_obligations" numeric(20, 2),
	"infrastructure_obligations" numeric(20, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_leads" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"company_id" varchar(50) NOT NULL,
	"user_id" varchar(100),
	"list_name" varchar(255),
	"tags" jsonb,
	"status" varchar(50),
	"priority" varchar(20),
	"notes" text,
	"next_action" text,
	"next_action_date" timestamp,
	"saved_at" timestamp DEFAULT now(),
	"last_contacted_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "searches" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"filters" jsonb,
	"results_count" integer DEFAULT 0,
	"companies_found" integer DEFAULT 0,
	"searched_at" timestamp DEFAULT now(),
	"user_id" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"role" varchar(50),
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now(),
	"last_login_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_leads" ADD CONSTRAINT "saved_leads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_uei_idx" ON "companies" USING btree ("uei");--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "companies_state_idx" ON "companies" USING btree ("state");--> statement-breakpoint
CREATE INDEX "companies_score_idx" ON "companies" USING btree ("opportunity_score");--> statement-breakpoint
CREATE INDEX "contacts_company_idx" ON "contacts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contacts_decision_maker_idx" ON "contacts" USING btree ("is_decision_maker");--> statement-breakpoint
CREATE INDEX "contracts_company_idx" ON "contracts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "contracts_agency_idx" ON "contracts" USING btree ("awarding_agency_code");--> statement-breakpoint
CREATE INDEX "contracts_naics_idx" ON "contracts" USING btree ("naics_code");--> statement-breakpoint
CREATE INDEX "contracts_date_idx" ON "contracts" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "saved_leads_company_idx" ON "saved_leads" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "saved_leads_user_idx" ON "saved_leads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_leads_status_idx" ON "saved_leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "saved_leads_list_idx" ON "saved_leads" USING btree ("list_name");--> statement-breakpoint
CREATE INDEX "searches_user_idx" ON "searches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "searches_date_idx" ON "searches" USING btree ("searched_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");