# Vivasayi Genz – Smart Crop Protection & Insurance Assistant

Vivasayi Genz is a full-stack, mobile-first agricultural intelligence web application designed for farmers in India (with special support for Tamil Nadu and bilingual English/Tamil interfaces).

The application features the **Smart Crop Protection & Insurance Assistant** module, enabling farmers to monitor real-time weather risks, obtain AI-guided crop protection recommendations, discover verified government and private crop insurance schemes (PMFBY), and file crop damage intimations with strict statutory 72-hour deadline guidance.

---

## Key Features

### 1. Smart Weather Alerts
- Real-time meteorological data powered by Open-Meteo satellite & radar telemetry.
- Location detection via GPS or manual selection across all 38 districts of Tamil Nadu and major Indian agricultural centers.
- Dynamic crop risk evaluation for 10+ crops (Paddy, Cotton, Tomato, Sugarcane, Banana, Groundnut, Maize, Chilli, Pulses, Turmeric).
- Automated risk alerts for:
  - Heavy rainfall (> 30 mm/day)
  - Flood & waterlogging risk (> 90 mm in 72h)
  - Drought conditions and extended soil moisture deficit
  - Extreme heatwaves (> 37°C / 39°C)
  - Low temperature / chill injury (< 14°C)
  - Strong gale winds (> 35 km/h / lodging risk)
- Crop-specific impact explanations and step-by-step actionable farmer recommendations.
- 7-day weather & daily crop risk forecast.

### 2. AI-Based Crop Protection Recommendations
- Agronomic diagnostics taking into account crop name, variety, growth stage, ambient weather conditions, and visible symptoms.
- Optional field photograph upload with file type (JPEG, PNG, WebP) and size validation (< 5 MB).
- Structured actionable guidance:
  - Problem identification with scientific and common names
  - Possible causes and predisposing weather triggers
  - Preventive field hygiene and agronomic practices
  - Disease and pest management (organic bio-control agents prioritized, followed by labeled chemical remedies with safety precautions)
  - Weather-attuned irrigation scheduling
  - Fertilizer and nutrient management (e.g. nitrogen suspension during blast outbreaks, potash cell wall reinforcement)
  - Weather-specific spray precautions
  - Crop rejuvenation and damage recovery steps
  - Expert contact thresholds and verified KVK / Kisan Call Centre (1800-180-1551) contacts
- Multi-tier inference: powered by Netlify AI Gateway (`gemini-3.8-flash`) with client-side agronomic rule engine fallback.

### 3. Government and Private Crop Insurance Assistant
- Verified statutory information for Pradhan Mantri Fasal Bima Yojana (PMFBY), Restructured Weather Based Crop Insurance Scheme (RWBCIS), State Disaster Response Fund (SDRF), and empaneled private insurers (AIC of India, HDFC ERGO Agri, ICICI Lombard Rural).
- Interactive Statutory Premium Calculator:
  - Kharif food & oilseeds: 2.0% statutory farmer cap
  - Rabi food & oilseeds: 1.5% statutory farmer cap
  - Commercial / Horticultural crops: 5.0% statutory farmer cap
  - Actuarial balance subsidized 50:50 by Central and State Governments
- Step-by-step application walkthrough, mandatory documents checklist, official links (`https://pmfby.gov.in`), and verified helplines (14447).
- Guided instructions on checking application, policy certificate, and claim DBT status.

### 4. Crop Damage Reporting and Claim Guidance
- Guided damage intimation wizard capturing farmer contact, revenue village, survey numbers, crop, variety, damage date, affected area, and incident description.
- Multi-photo attachment for close-up crop damage and wide field overview.
- Nuanced claim guidance distinguishing:
  - **PMFBY Localized Calamities** (Hailstorm, Landslide, Inundation, Cloudburst) & **Post-Harvest Losses**: Strict 72-hour intimation requirement.
  - **PMFBY Widespread Calamities** (Drought, generalized pest epidemics): Settled automatically at season-end via official Crop Cutting Experiments (CCEs).
  - **Private Insurance Policies**: Specific policy schedule deadlines (24 to 48 hours).
- Persistent storage backed by **Netlify Database** (managed Postgres via Drizzle ORM) with local fallback.
- Auto-generates formal Claim Intimation Slip with unique reference number (`INT-PMFBY-YYYY-XXXXXX`) and printable summary.

---

## Key Technologies

- **Frontend Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS with custom nature-inspired theme and shadcn/ui components
- **Backend / Serverless**: Netlify Functions (Node.js ESM)
- **Database**: Netlify Database (managed Postgres) with Drizzle ORM
- **AI Inference**: Netlify AI Gateway (`gemini-3.8-flash` via `@google/genai`)
- **Weather API**: Open-Meteo REST API (zero-config, high-precision forecasting)
- **Internationalization**: Full English and Tamil (`ta`) bilingual translations

---

## Local Development Setup

### Prerequisites
- Node.js version 22 or higher
- Netlify CLI (`npm install -g netlify-cli`)

### Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vivasayi-genz-enhancement
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server with Netlify Dev:**
   ```bash
   npm run dev
   # or with Netlify CLI emulation:
   netlify dev --port 8889
   ```

4. **Access the application:**
   Open [http://localhost:8889](http://localhost:8889) or [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables & Configuration

- `GEMINI_API_KEY`: Automatically injected by Netlify AI Gateway in production.
- `NETLIFY_AI_GATEWAY_KEY` & `NETLIFY_AI_GATEWAY_URL`: Automatically configured by Netlify.
- `NETLIFY_DATABASE_URL`: Managed automatically by Netlify Database.
- `WEATHER_API_KEY` or `OPENWEATHER_API_KEY` (Optional): If configured, Netlify Weather function can proxy OpenWeather; otherwise Open-Meteo is used by default with zero configuration.

---

## License

MIT License. Developed for Indian farming communities.
