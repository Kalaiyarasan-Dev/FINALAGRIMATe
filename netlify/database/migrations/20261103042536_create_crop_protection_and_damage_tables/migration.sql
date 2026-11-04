CREATE TABLE "crop_damage_reports" (
	"id" serial PRIMARY KEY,
	"report_number" varchar(50) NOT NULL UNIQUE,
	"farmer_name" text NOT NULL,
	"farmer_phone" varchar(20) NOT NULL,
	"state" text NOT NULL,
	"district" text NOT NULL,
	"village" text NOT NULL,
	"survey_number" varchar(100),
	"crop_name" text NOT NULL,
	"crop_variety" text,
	"affected_area_acres" text NOT NULL,
	"total_area_acres" text,
	"insurance_scheme" text NOT NULL,
	"policy_or_application_number" text,
	"damage_category" text NOT NULL,
	"damage_date" varchar(30) NOT NULL,
	"description" text NOT NULL,
	"damage_images" jsonb,
	"field_images" jsonb,
	"status" varchar(30) DEFAULT 'Intimated' NOT NULL,
	"intimation_channel" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_protection_consultations" (
	"id" serial PRIMARY KEY,
	"crop_name" text NOT NULL,
	"crop_variety" text,
	"growth_stage" text,
	"location" text,
	"symptoms" jsonb,
	"ai_diagnosis" jsonb,
	"image_url" text,
	"source" varchar(30) DEFAULT 'ai_assistant',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_alert_subscriptions" (
	"id" serial PRIMARY KEY,
	"farmer_name" text,
	"phone_number" varchar(20),
	"state" text NOT NULL,
	"district" text NOT NULL,
	"selected_crops" jsonb NOT NULL,
	"latitude" text,
	"longitude" text,
	"notification_pref" varchar(20) DEFAULT 'browser',
	"created_at" timestamp DEFAULT now() NOT NULL
);
