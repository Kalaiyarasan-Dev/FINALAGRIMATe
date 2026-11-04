# AGENTS.md – Project Architecture & Technical Guide

This document describes the codebase architecture, design patterns, and operational rules for AI agents and developers working on **Vivasayi Genz**.

---

## 1. Architectural Overview

Vivasayi Genz is an agricultural intelligence and farmer assistance web platform built with:
- **Client**: React 18 SPA bundled via Vite, written in TypeScript.
- **Styling**: Tailwind CSS, `@tailwindcss/typography`, `tailwindcss-animate`, Lucide React icons, and accessible shadcn/ui (Radix UI) component primitives.
- **State & Internationalization**: Custom React Contexts (`LanguageContext.tsx` supporting English and Tamil `ta`, `AuthContext.tsx`).
- **Data Persistence**: **Netlify Database** (managed Postgres) with Drizzle ORM (`drizzle-orm@beta`, `drizzle-kit@beta`).
- **Serverless Backend**: Netlify Functions (`netlify/functions/`) using modern Node.js ESM v2 syntax.
- **AI Inference**: **Netlify AI Gateway** utilizing Google Gemini (`gemini-3.8-flash`) via the official `@google/genai` SDK.
- **Meteorology**: Open-Meteo API (zero-configuration, high-precision numerical weather predictions) with optional OpenWeather proxy.

---

## 2. Key Directories & File Structure

```
├── db/
│   ├── index.ts                     # Drizzle ORM client initialized with drizzle-orm/netlify-db adapter
│   └── schema.ts                    # Postgres table definitions (cropDamageReports, weatherAlertSubscriptions, cropProtectionConsultations)
├── netlify/
│   ├── database/
│   │   └── migrations/              # Drizzle SQL migrations automatically executed by Netlify deployment pipeline
│   └── functions/
│       ├── weather.ts               # Open-Meteo & OpenWeather serverless proxy with district coordinate mapping
│       ├── crop-protection.ts       # Netlify AI Gateway (Gemini 3.8 Flash) agronomic diagnostic function
│       └── damage-reports.ts        # Netlify Database CRUD endpoint for crop damage intimations
├── src/
│   ├── components/
│   │   ├── crop-assistant/          # Smart Crop Protection & Insurance Assistant module components
│   │   │   ├── WeatherAlertsSection.tsx       # Live weather monitoring, risk thresholds & 7-day forecast
│   │   │   ├── CropProtectionSection.tsx      # Diagnostic inputs, photo upload & structured advice display
│   │   │   ├── InsuranceAssistantSection.tsx  # PMFBY dashboard, statutory premium calculator, tracking guide
│   │   │   └── DamageReportingSection.tsx     # 72-hour claim intimation wizard, photo attachments & slip generator
│   │   ├── dashboard/               # Home dashboard components (QuickActions, AlertsCard, WeatherCard, MarketTicker)
│   │   ├── layout/                  # Header, BottomNav, AppLayout
│   │   └── ui/                      # shadcn/ui components (cards, dialogs, buttons, tabs, inputs)
│   ├── contexts/
│   │   ├── LanguageContext.tsx      # Bilingual language provider (en/ta)
│   │   └── AuthContext.tsx          # Authentication state
│   ├── services/
│   │   ├── weatherService.ts        # Open-Meteo client, crop vulnerability profiles, risk evaluation algorithm
│   │   ├── cropProtectionService.ts # Agronomic advisory service with client-side fallback rule engine
│   │   ├── insuranceService.ts      # PMFBY verified statutory rules, premium calculator formulas & contacts
│   │   └── damageReportingService.ts# Claim intimation workflows, 72h rules, and database integration
│   ├── lib/
│   │   ├── i18n.ts                  # Bilingual dictionaries for English and Tamil
│   │   └── utils.ts                 # Utility helpers (cn class merger)
│   ├── pages/
│   │   ├── CropAssistant.tsx        # Flagship Smart Crop Protection & Insurance Assistant page
│   │   ├── Index.tsx                # Home page
│   │   ├── Alerts.tsx               # Weather & crop alerts page
│   │   ├── Schemes.tsx              # Government agricultural schemes page
│   │   └── CropDoctor.tsx           # Crop doctor consultation page
├── drizzle.config.ts                # Drizzle kit configuration pointing to netlify/database/migrations
└── netlify.toml                     # Netlify publish and redirect configuration
```

---

## 3. Critical Conventions & Non-Obvious Decisions

### A. Netlify Database & Drizzle ORM Rules
- Always use the `@beta` dist-tag for `drizzle-orm` and `drizzle-kit` (`drizzle-orm/netlify-db` adapter only exists on this release line).
- Any schema changes in `db/schema.ts` **must** be followed by generating a migration:
  ```bash
  npx drizzle-kit generate --name <descriptive_action_name>
  ```
- The migration folder **must** always output to `netlify/database/migrations` for Netlify to automatically apply it on deploy.
- Never write credentials into database configuration.

### B. Netlify AI Gateway Rules
- Always write AI serverless functions using modern **v2** syntax (`export default async (req: Request, context: Context) => Response`). Legacy `exports.handler` does not receive injected runtime credentials.
- Use zero-config constructor `new GoogleGenAI({})`. Do not hardcode API keys or test keys in client or server files.
- Pin supported models from the official AI Gateway list (e.g. `gemini-3.8-flash`, `gemini-3.6-flash`).

### C. Agronomic & Insurance Domain Precision
- **PMFBY Localized Calamities** (Hailstorm, Landslide, Inundation, Cloudburst) & **Post-Harvest Losses** require strict **72-hour individual intimation** under Section 21.4 of PMFBY Operational Guidelines.
- **Widespread Yield Losses** (Drought, generalized pest epidemics) do **not** require individual 72-hour intimation; they are settled automatically at the end of the season based on State Government Crop Cutting Experiments (CCEs).
- **Statutory Premium Rates**: Maximum 2.0% for Kharif food/oilseeds, 1.5% for Rabi food/oilseeds, and 5.0% for commercial/horticultural crops. The remainder is subsidized 50:50 by Central and State Governments. Never display arbitrary commercial rates for PMFBY.
- Do not claim a disease is definitively confirmed from an ambiguous image or symptom; always show diagnosis confidence, limitations notice, and recommend field verification by local Agriculture Extension Officers (Kisan Call Centre 1800-180-1551).
- Pesticide dosage: Avoid hazardous, off-label, or banned agrochemicals. Prioritize bio-control and organic solutions (Neem oil, Pseudomonas fluorescens, Trichoderma viride), followed by labeled chemicals with strict PPE warnings.

### D. Navigation & Routing
- New routes added:
  - `/crop-assistant`: Main hub for the 4 modules
  - `/weather-alerts`: Direct view of Weather Alerts section
  - `/crop-protection`: Direct view of Crop Protection section
  - `/insurance-assistant`: Direct view of Insurance Assistant section
  - `/damage-reporting`: Direct view of Damage Reporting section
- Existing routes (`/`, `/alerts`, `/schemes`, `/doctor`, `/planner`, `/market`, `/profile`) remain fully intact with cross-navigation enhancements.
