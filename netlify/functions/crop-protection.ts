import type { Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  try {
    const payload = await req.json();
    const {
      cropName,
      cropVariety = "General / Local",
      growthStage = "Vegetative",
      location = "Tamil Nadu, India",
      weatherConditions = {},
      symptoms = [],
      customDescription = "",
      imageBase64,
      imageMimeType = "image/jpeg",
    } = payload;

    const weatherSummary = `Temperature: ${weatherConditions.temp || 30}°C, Relative Humidity: ${weatherConditions.humidity || 65}%, Rainfall/Condition: ${weatherConditions.condition || "Moderate"}`;

    const promptText = `
You are an expert Senior Agricultural Plant Pathologist and Agronomist specializing in Indian agriculture (Paddy/Rice, Cotton, Tomato, Sugarcane, Banana, Groundnut, Maize, Chilli, Pulses, Vegetables, Millets).

A farmer has requested diagnosis and guidance:
- Crop Name: ${cropName}
- Variety: ${cropVariety}
- Growth Stage: ${growthStage}
- Location: ${location}
- Ambient Weather: ${weatherSummary}
- Observed Symptoms: ${symptoms.join(", ") || "None specified"}
- Detailed Farmer Observation: ${customDescription || "None provided"}

TASK:
Provide a rigorous, structured, practical agronomic recommendation.
STRICT SAFETY & QUALITY RULES:
1. Clearly identify the problem with scientific name and common vernacular name in English and Tamil.
2. Provide confidence percentage (50-98). If prediction is uncertain or symptoms are ambiguous, mark "isUncertain": true and give clear cautionary guidance. Do not claim a disease is confirmed from an uncertain prediction.
3. NEVER recommend hazardous, banned, or unsafe pesticide dosages. Always emphasize organic remedies first (neem oil, Trichoderma, Pseudomonas, Panchagavya), followed by standard safe chemical treatments with strict PPE (gloves, mask) safety disclaimers.
4. Give specific irrigation recommendations attuned to the current weather.
5. Give fertilizer and nutrient guidance (e.g. halt excess nitrogen/urea during foliar blast/blight outbreaks, apply potash/micronutrients).
6. Provide weather-specific precautions (e.g. rain delays foliar spray; wind speed thresholds).
7. Outline recovery steps after crop damage to rejuvenate foliage.
8. Specify exact conditions for when to contact an agricultural expert, citing official helplines (Kisan Call Centre: 1800-180-1551).

Return ONLY valid JSON matching this schema:
{
  "cropDetectedEn": "${cropName}",
  "cropDetectedTa": "${cropName}",
  "growthStageEn": "${growthStage}",
  "growthStageTa": "${growthStage}",
  "problemTitleEn": "Identified Problem / Disease in English",
  "problemTitleTa": "Identified Problem / Disease in Tamil",
  "confidence": 88,
  "severity": "medium",
  "isUncertain": false,
  "limitationsDisclaimerEn": "AI screening advisory based on reported foliar lesions and weather correlation. Confirm symptoms with local Agriculture Extension Officer before high-cost chemical procurement.",
  "limitationsDisclaimerTa": "தெரிவிக்கப்பட்ட அறிகுறிகள் மற்றும் வானிலை அடிப்படையில் இந்த ஆலோசனை வழங்கப்பட்டுள்ளது. பூச்சிக்கொல்லி மருந்துகளை வாங்குவதற்கு முன் உள்ளூர் வேளாண் அலுவலரிடம் சரிபார்க்கவும்.",
  "possibleCausesEn": ["Cause 1", "Cause 2"],
  "possibleCausesTa": ["காரணம் 1", "காரணம் 2"],
  "preventiveMeasuresEn": ["Precaution 1", "Precaution 2"],
  "preventiveMeasuresTa": ["தடுப்பு முறை 1", "தடுப்பு முறை 2"],
  "diseasePestManagement": {
    "organicEn": ["Organic remedy 1", "Organic remedy 2"],
    "organicTa": ["இயற்கை முறை 1", "இயற்கை முறை 2"],
    "chemicalEn": ["Safe labeled chemical 1 with rate", "Alternative chemical with rate"],
    "chemicalTa": ["பாதுகாப்பான மருந்து 1 மற்றும் அளவு", "மாற்று மருந்து மற்றும் அளவு"],
    "dosageCautionEn": "Wear mask and gloves. Never exceed labeled dose. Observe 14-day pre-harvest interval.",
    "dosageCautionTa": "முகக்கவசம் மற்றும் கையுறை அணியவும். குறிப்பிட்ட அளவை விட அதிகம் தெளிக்க வேண்டாம்."
  },
  "irrigationGuidanceEn": ["Irrigation tip 1", "Irrigation tip 2"],
  "irrigationGuidanceTa": ["பாசன ஆலோசனை 1", "பாசன ஆலோசனை 2"],
  "fertilizerNutrientGuidanceEn": ["Nutrient tip 1", "Nutrient tip 2"],
  "fertilizerNutrientGuidanceTa": ["உர மேலாண்மை 1", "உர மேலாண்மை 2"],
  "weatherPrecautionsEn": ["Weather caution 1", "Weather caution 2"],
  "weatherPrecautionsTa": ["வானிலை முன்னெச்சரிக்கை 1", "வானிலை முன்னெச்சரிக்கை 2"],
  "recoveryStepsEn": ["Recovery step 1", "Recovery step 2"],
  "recoveryStepsTa": ["பயிர் மீட்பு நடவடிக்கை 1", "பயிர் மீட்பு நடவடிக்கை 2"],
  "expertContactGuidanceEn": {
    "whenToContact": "When symptoms persist after 4 days or spread to > 15% of the field.",
    "helplineName": "Kisan Call Centre (Toll-Free)",
    "helplineNumber": "1800-180-1551",
    "localOffice": "Block Assistant Director of Agriculture (ADA) / Krishi Vigyan Kendra (KVK)"
  },
  "expertContactGuidanceTa": {
    "whenToContact": "மருந்து தெளித்த 4 நாட்களுக்குள் நோய் குறையவில்லை என்றால் வேளாண் அதிகாரியை அணுகவும்.",
    "helplineName": "உழவர் சேவை மையம் (கட்டணமில்லா எண்)",
    "helplineNumber": "1800-180-1551",
    "localOffice": "வட்டார வேளாண் உதவி இயக்குனர் அலுவலகம் / வேளாண் அறிவியல் மையம் (KVK)"
  }
}
`;

    // Initialize GoogleGenAI SDK with zero config (AI Gateway auto-injects variables)
    const ai = new GoogleGenAI({});

    const contents: any[] = [];
    if (imageBase64) {
      let rawBase64 = imageBase64;
      let mime = imageMimeType;
      if (imageBase64.includes(";base64,")) {
        const parts = imageBase64.split(";base64,");
        mime = parts[0].replace("data:", "") || "image/jpeg";
        rawBase64 = parts[1];
      }
      contents.push({
        inlineData: {
          mimeType: mime,
          data: rawBase64,
        },
      });
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
    });

    const candidate = response.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text || "";

    // Extract JSON block if surrounded by markdown fences
    let jsonStr = rawText.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(jsonStr);

    return new Response(JSON.stringify(parsedData), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error: any) {
    console.warn("AI Gateway inference error, returning fallback response:", error);

    return new Response(
      JSON.stringify({
        fallbackAvailable: true,
        error: error.message || "AI Service currently busy",
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }
};
