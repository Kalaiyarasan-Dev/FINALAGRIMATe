/**
 * Secure Backend Handler for AgriMate AI Crop Doctor
 * Used by Netlify serverless functions and Vite local development middleware.
 * Never exposes the Gemini API key to frontend code or browser network requests.
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

/**
 * Resolves the Gemini API key from environment or local .env file
 */
function resolveGeminiApiKey(): string {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    return process.env.GEMINI_API_KEY;
  }
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your_gemini_api_key_here') {
    return process.env.GOOGLE_API_KEY;
  }
  if (process.env.VITE_GEMINI_API_KEY && process.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    return process.env.VITE_GEMINI_API_KEY;
  }

  // In test suites, do not inspect local .env if env vars were intentionally cleared
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return '';
  }

  try {
    const envPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '../../.env'),
      path.resolve(__dirname, '../.env'),
    ];
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match =
          content.match(/^GEMINI_API_KEY=(.*)$/m) ||
          content.match(/^GOOGLE_API_KEY=(.*)$/m) ||
          content.match(/^VITE_GEMINI_API_KEY=(.*)$/m);
        if (match && match[1]?.trim()) {
          const key = match[1].trim();
          if (key && key !== 'your_gemini_api_key_here') {
            process.env.GEMINI_API_KEY = key;
            return key;
          }
        }
      }
    }
  } catch {}

  return '';
}

export interface CropDoctorDiagnosis {
  crop_name: string;
  plant_health: 'Healthy' | 'Diseased' | 'Uncertain' | string;
  disease_name: string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  visible_symptoms: string[];
  possible_causes: string[];
  alternative_diagnoses: string[];
  recommended_actions: string[];
  prevention: string[];
  needs_expert_review: boolean;
  message: string;
  // Bilingual Tamil mirrors
  crop_name_ta?: string;
  plant_health_ta?: string;
  disease_name_ta?: string;
  confidence_ta?: string;
  visible_symptoms_ta?: string[];
  possible_causes_ta?: string[];
  alternative_diagnoses_ta?: string[];
  recommended_actions_ta?: string[];
  prevention_ta?: string[];
  message_ta?: string;
}

export interface CropDoctorHandlerResult {
  status: number;
  body: {
    success: boolean;
    data?: CropDoctorDiagnosis;
    error?: string;
    code?: string;
    details?: string;
  };
}

export const CROP_DOCTOR_SYSTEM_INSTRUCTION = `You are Agrimate Crop Doctor, an AI agricultural image analysis assistant.

Your responsibility is to analyse actual plant images uploaded by farmers and provide careful, evidence-based crop disease assessments.

Follow these rules:

- Always analyse the uploaded image before providing a diagnosis.
- Never generate a diagnosis without examining the image.
- Identify the crop first, if possible.
- Identify only diseases supported by visible symptoms.
- Do not confuse nutrient deficiencies with fungal, bacterial, or viral diseases.
- Do not assume every damaged leaf has a disease.
- If the image does not provide enough evidence, say that the diagnosis is uncertain.
- Never fabricate disease names, symptoms, or treatments.
- Do not claim 100% accuracy.
- If the image is unrelated to plants, clearly explain that it is not a suitable crop image.`;

export const CROP_DOCTOR_SCHEMA_PROMPT = `Carefully examine the uploaded plant image and return your diagnosis strictly in this structured JSON format:
{
  "crop_name": "Identified crop",
  "plant_health": "Healthy / Diseased / Uncertain",
  "disease_name": "Identified disease or Unknown",
  "confidence": "High / Medium / Low",
  "visible_symptoms": [
    "Symptom observed in the image"
  ],
  "possible_causes": [
    "Possible cause"
  ],
  "alternative_diagnoses": [
    "Other possible explanations"
  ],
  "recommended_actions": [
    "Practical recommended action"
  ],
  "prevention": [
    "Prevention methods"
  ],
  "needs_expert_review": true,
  "message": "Simple explanation for the farmer",
  "crop_name_ta": "பயிரின் பெயர் தமிழில்",
  "plant_health_ta": "ஆரோக்கிய நிலை (Healthy / Diseased / Uncertain)",
  "disease_name_ta": "நோயின் பெயர் தமிழில்",
  "confidence_ta": "நம்பகத்தன்மை (High / Medium / Low)",
  "visible_symptoms_ta": ["கண்டறியப்பட்ட அறிகுறிகள் தமிழில்"],
  "possible_causes_ta": ["காரணங்கள் தமிழில்"],
  "alternative_diagnoses_ta": ["மாற்று சாத்தியங்கள் தமிழில்"],
  "recommended_actions_ta": ["பரிந்துரைக்கப்படும் தீர்வுகள் தமிழில்"],
  "prevention_ta": ["தடுப்பு முறைகள் தமிழில்"],
  "message_ta": "விவசாயிக்கான எளிய விளக்கம் தமிழில்"
}

FARMER SAFETY & PESTICIDE RULES:
- Never recommend chemical pesticides or fungicides if plant_health is "Healthy". Recommend only organic maintenance (e.g. balanced irrigation, Panchagavya, seaweed tonic).
- If prescribing chemical remedies for diseased crops, always include caution: "Follow statutory product label instructions, wear rubber gloves and respirator mask, observe pre-harvest intervals (PHI), and consult your local Agricultural Extension Officer or Krishi Vigyan Kendra (KVK)."
- Prioritize organic and bio-fungicide remedies (Trichoderma, Pseudomonas, Neem kernel extract 3-5%) before chemical interventions.
- If the image is blurry, dark, or out-of-focus, set plant_health to "Uncertain", disease_name to "Unable to identify accurately", confidence to "Low", needs_expert_review to true, and ask the farmer to upload a sharper photo taken in bright daylight.
- If the image is not an agricultural plant (e.g. car, person, animal, room, furniture, screenshot), set plant_health to "Uncertain", disease_name to "Unable to identify accurately (Not a Plant)", confidence to "Low", and explain that an agricultural crop photo is required.

Return ONLY the single valid JSON object. No surrounding markdown backticks or commentary.`;

/**
 * Validates and extracts base64 data and MIME type from input
 */
export function extractBase64AndMime(
  rawInput: string,
  providedMime?: string
): { base64: string; mimeType: string; isValid: boolean; error?: string } {
  if (!rawInput || typeof rawInput !== 'string') {
    return { base64: '', mimeType: 'image/jpeg', isValid: false, error: 'No image data provided.' };
  }

  let mimeType = (providedMime || 'image/jpeg').toLowerCase();
  let base64 = rawInput.trim();

  if (rawInput.startsWith('data:')) {
    const match = rawInput.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1].toLowerCase();
      base64 = match[2];
    } else {
      return { base64: '', mimeType, isValid: false, error: 'Malformed base64 data URI format.' };
    }
  }

  // Normalize JPEG variants
  if (mimeType === 'image/jpg') {
    mimeType = 'image/jpeg';
  }

  const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validMimes.includes(mimeType)) {
    return {
      base64: '',
      mimeType,
      isValid: false,
      error: `Unsupported image format: "${mimeType}". Only JPEG, PNG, and WebP are supported.`,
    };
  }

  if (base64.length < 50) {
    return { base64: '', mimeType, isValid: false, error: 'Image payload is too small or empty.' };
  }

  return { base64, mimeType, isValid: true };
}

/**
 * Safely parses JSON response from Gemini
 */
export function safeParseGeminiJson(rawText: string): CropDoctorDiagnosis {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '').trim();
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(cleaned);

  return {
    crop_name: parsed.crop_name || 'Unknown Crop',
    plant_health: parsed.plant_health || 'Uncertain',
    disease_name: parsed.disease_name || 'Unknown',
    confidence: parsed.confidence || 'Medium',
    visible_symptoms: Array.isArray(parsed.visible_symptoms)
      ? parsed.visible_symptoms
      : [parsed.visible_symptoms].filter(Boolean),
    possible_causes: Array.isArray(parsed.possible_causes)
      ? parsed.possible_causes
      : [parsed.possible_causes].filter(Boolean),
    alternative_diagnoses: Array.isArray(parsed.alternative_diagnoses)
      ? parsed.alternative_diagnoses
      : [parsed.alternative_diagnoses].filter(Boolean),
    recommended_actions: Array.isArray(parsed.recommended_actions)
      ? parsed.recommended_actions
      : [parsed.recommended_actions].filter(Boolean),
    prevention: Array.isArray(parsed.prevention)
      ? parsed.prevention
      : [parsed.prevention].filter(Boolean),
    needs_expert_review: Boolean(parsed.needs_expert_review),
    message: parsed.message || 'Analysis complete.',
    crop_name_ta: parsed.crop_name_ta,
    plant_health_ta: parsed.plant_health_ta,
    disease_name_ta: parsed.disease_name_ta,
    confidence_ta: parsed.confidence_ta,
    visible_symptoms_ta: Array.isArray(parsed.visible_symptoms_ta) ? parsed.visible_symptoms_ta : undefined,
    possible_causes_ta: Array.isArray(parsed.possible_causes_ta) ? parsed.possible_causes_ta : undefined,
    alternative_diagnoses_ta: Array.isArray(parsed.alternative_diagnoses_ta) ? parsed.alternative_diagnoses_ta : undefined,
    recommended_actions_ta: Array.isArray(parsed.recommended_actions_ta) ? parsed.recommended_actions_ta : undefined,
    prevention_ta: Array.isArray(parsed.prevention_ta) ? parsed.prevention_ta : undefined,
    message_ta: parsed.message_ta,
  };
}

/**
 * Primary handler for AI Crop Doctor requests
 */
export async function handleCropDoctorRequest(payload: any): Promise<CropDoctorHandlerResult> {
  const apiKey = resolveGeminiApiKey();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      status: 401,
      body: {
        success: false,
        code: 'API_KEY_MISSING',
        error:
          'Google Gemini API key is not configured on the server. Please add your GEMINI_API_KEY to the .env file in the project directory.',
        details: 'Missing GEMINI_API_KEY environment variable on backend.',
      },
    };
  }

  const { imageBase64, mimeType = 'image/jpeg', mode = 'image', crop, symptoms } = payload || {};

  let contents: any[] = [];

  if (mode === 'image') {
    const extracted = extractBase64AndMime(imageBase64, mimeType);
    if (!extracted.isValid) {
      return {
        status: 400,
        body: {
          success: false,
          code: 'INVALID_IMAGE',
          error: extracted.error || 'Invalid image data provided.',
        },
      };
    }

    contents = [
      {
        inlineData: {
          mimeType: extracted.mimeType,
          data: extracted.base64,
        },
      },
      {
        text: `${CROP_DOCTOR_SYSTEM_INSTRUCTION}\n\n${CROP_DOCTOR_SCHEMA_PROMPT}`,
      },
    ];
  } else {
    // Symptom-based consultation
    const userMessage = `Farmer reported crop: ${crop || 'Unknown'}. Observed Symptoms: ${
      Array.isArray(symptoms) ? symptoms.join(', ') : symptoms || 'None specified'
    }.`;
    contents = [
      {
        text: `${CROP_DOCTOR_SYSTEM_INSTRUCTION}\n\n${userMessage}\n\n${CROP_DOCTOR_SCHEMA_PROMPT}`,
      },
    ];
  }

  const candidateModels = Array.from(
    new Set([
      process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ])
  );

  const ai = new GoogleGenAI({ apiKey });

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: CROP_DOCTOR_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const candidate = response.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text || '';

      if (!rawText.trim()) {
        continue;
      }

      const diagnosis = safeParseGeminiJson(rawText);

      return {
        status: 200,
        body: {
          success: true,
          data: diagnosis,
        },
      };
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const lower = errMsg.toLowerCase();

      // If invalid API key, fail immediately without retrying other models
      if (
        errMsg.includes('API_KEY_INVALID') ||
        errMsg.includes('API key not valid') ||
        errMsg.includes('PERMISSION_DENIED')
      ) {
        return {
          status: 401,
          body: {
            success: false,
            code: 'API_KEY_INVALID',
            error:
              'The provided Gemini API key is invalid or unauthorized. Please verify your API key in Google AI Studio.',
            details: errMsg,
          },
        };
      }

      // If rate limited, fail immediately with 429
      if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429') || errMsg.includes('quota')) {
        return {
          status: 429,
          body: {
            success: false,
            code: 'QUOTA_EXCEEDED',
            error: 'Google Gemini API quota limit reached. Please wait a minute and try again.',
            details: errMsg,
          },
        };
      }

      // If model not found or temporarily unavailable, try next candidate model
      if (
        lower.includes('not found') ||
        lower.includes('not_found') ||
        lower.includes('404') ||
        lower.includes('no longer available') ||
        lower.includes('unsupported') ||
        lower.includes('unavailable') ||
        lower.includes('503') ||
        err?.status === 404 ||
        err?.status === 503
      ) {
        continue;
      }

      // If network failure
      if (errMsg.includes('fetch failed') || errMsg.includes('ENOTFOUND') || errMsg.includes('ECONNREFUSED')) {
        return {
          status: 503,
          body: {
            success: false,
            code: 'NETWORK_ERROR',
            error: 'Unable to reach Google Gemini API servers. Please check your internet connection.',
            details: errMsg,
          },
        };
      }
    }
  }

  // All candidate models failed
  const finalMessage = lastError?.message || 'Gemini Vision AI failed to process the request.';
  return {
    status: 500,
    body: {
      success: false,
      code: 'API_ERROR',
      error: finalMessage,
      details: String(lastError),
    },
  };
}

