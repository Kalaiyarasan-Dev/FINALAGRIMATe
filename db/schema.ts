import { pgTable, serial, text, timestamp, integer, varchar, jsonb } from "drizzle-orm/pg-core";

export const cropDamageReports = pgTable("crop_damage_reports", {
  id: serial("id").primaryKey(),
  reportNumber: varchar("report_number", { length: 50 }).notNull().unique(),
  farmerName: text("farmer_name").notNull(),
  farmerPhone: varchar("farmer_phone", { length: 20 }).notNull(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  village: text("village").notNull(),
  surveyNumber: varchar("survey_number", { length: 100 }),
  cropName: text("crop_name").notNull(),
  cropVariety: text("crop_variety"),
  affectedAreaAcres: text("affected_area_acres").notNull(),
  totalAreaAcres: text("total_area_acres"),
  insuranceScheme: text("insurance_scheme").notNull(),
  policyOrApplicationNumber: text("policy_or_application_number"),
  damageCategory: text("damage_category").notNull(),
  damageDate: varchar("damage_date", { length: 30 }).notNull(),
  description: text("description").notNull(),
  damageImages: jsonb("damage_images").$type<string[]>(),
  fieldImages: jsonb("field_images").$type<string[]>(),
  status: varchar("status", { length: 30 }).notNull().default("Intimated"),
  intimationChannel: text("intimation_channel"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weatherAlertSubscriptions = pgTable("weather_alert_subscriptions", {
  id: serial("id").primaryKey(),
  farmerName: text("farmer_name"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  state: text("state").notNull(),
  district: text("district").notNull(),
  selectedCrops: jsonb("selected_crops").$type<string[]>().notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  notificationPref: varchar("notification_pref", { length: 20 }).default("browser"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cropProtectionConsultations = pgTable("crop_protection_consultations", {
  id: serial("id").primaryKey(),
  cropName: text("crop_name").notNull(),
  cropVariety: text("crop_variety"),
  growthStage: text("growth_stage"),
  location: text("location"),
  symptoms: jsonb("symptoms").$type<string[]>(),
  aiDiagnosis: jsonb("ai_diagnosis"),
  imageUrl: text("image_url"),
  source: varchar("source", { length: 30 }).default("ai_assistant"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
