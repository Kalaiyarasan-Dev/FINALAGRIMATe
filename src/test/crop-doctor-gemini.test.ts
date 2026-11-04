import { describe, it, expect } from 'vitest';
import {
  extractBase64AndMime,
  safeParseGeminiJson,
  handleCropDoctorRequest,
  CropDoctorDiagnosis,
} from '../../netlify/functions/crop-doctor-handler';
import { mapToDiagnosisResult } from '@/lib/geminiApi';

describe('AI Crop Doctor Backend & Gemini Multimodal Diagnostics', () => {
  // Test 1: Image extraction & MIME validation (JPEG, JPG, PNG, WebP)
  it('correctly validates and normalizes image MIME types and base64 payloads', () => {
    // Normal JPEG
    const jpeg = extractBase64AndMime('data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    expect(jpeg.isValid).toBe(true);
    expect(jpeg.mimeType).toBe('image/jpeg');

    // JPG normalization to JPEG
    const jpg = extractBase64AndMime('data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    expect(jpg.isValid).toBe(true);
    expect(jpg.mimeType).toBe('image/jpeg');

    // PNG
    const png = extractBase64AndMime('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    expect(png.isValid).toBe(true);
    expect(png.mimeType).toBe('image/png');

    // WebP
    const webp = extractBase64AndMime('data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA/v/ZAAD+/9kA/v/ZAAD+/9kA/v/ZAAD+/9kA');
    expect(webp.isValid).toBe(true);
    expect(webp.mimeType).toBe('image/webp');

    // Reject unsupported formats
    const gif = extractBase64AndMime('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    expect(gif.isValid).toBe(false);
    expect(gif.error).toContain('Unsupported image format');

    // Reject empty payload
    const empty = extractBase64AndMime('');
    expect(empty.isValid).toBe(false);
  });

  // Test 2: Safe JSON parsing & schema compliance (TASK 4)
  it('parses valid Gemini JSON responses and extracts all TASK 4 required fields safely', () => {
    const rawJson = `
\`\`\`json
{
  "crop_name": "Tomato (Solanum lycopersicum)",
  "plant_health": "Diseased",
  "disease_name": "Tomato Early Blight (Alternaria solani)",
  "confidence": "High",
  "visible_symptoms": [
    "Concentric dark target rings on lower foliage",
    "Chlorotic yellow halo surrounding circular spots"
  ],
  "possible_causes": [
    "Warm humid weather with extended leaf wetness",
    "Fungal spores splashing from soil"
  ],
  "alternative_diagnoses": [
    "Septoria leaf spot",
    "Bacterial spot"
  ],
  "recommended_actions": [
    "Prune and destroy infected lower leaves",
    "Apply organic neem formulation or bio-fungicide Trichoderma",
    "Consult local agricultural extension officer before applying chemical fungicides such as Mancozeb following product label instructions"
  ],
  "prevention": [
    "Apply straw mulch to prevent soil splashing onto bottom leaves",
    "Irrigate at ground level using drip irrigation rather than overhead sprinklers"
  ],
  "needs_expert_review": true,
  "message": "The tomato leaf exhibits early blight fungal infection. Remove lower blighted leaves.",
  "crop_name_ta": "தக்காளி",
  "plant_health_ta": "நோய் தாக்கமுள்ளது",
  "disease_name_ta": "தக்காளி ஆரம்ப இலை கருகல் நோய்",
  "confidence_ta": "அதிகம்",
  "visible_symptoms_ta": ["கீழ் இலைகளில் வளைய வடிவில் கரும்பழுப்பு புள்ளிகள்"],
  "possible_causes_ta": ["ஈரப்பதமான தட்பவெப்பம்"],
  "alternative_diagnoses_ta": ["செப்டோரியா புள்ளி நோய்"],
  "recommended_actions_ta": ["பாதிக்கப்பட்ட கீழ் இலைகளை அகற்றி அழிக்கவும்"],
  "prevention_ta": ["வைக்கோல் மூடாக்கு இடவும்"],
  "message_ta": "தக்காளி இலையில் ஆரம்ப கருகல் பூஞ்சை நோய் உள்ளது."
}
\`\`\`
`;
    const parsed: CropDoctorDiagnosis = safeParseGeminiJson(rawJson);

    expect(parsed.crop_name).toContain('Tomato');
    expect(parsed.plant_health).toBe('Diseased');
    expect(parsed.disease_name).toContain('Early Blight');
    expect(parsed.confidence).toBe('High');
    expect(parsed.visible_symptoms.length).toBeGreaterThanOrEqual(2);
    expect(parsed.possible_causes.length).toBeGreaterThanOrEqual(2);
    expect(parsed.alternative_diagnoses.length).toBeGreaterThanOrEqual(2);
    expect(parsed.recommended_actions.length).toBeGreaterThanOrEqual(2);
    expect(parsed.prevention.length).toBeGreaterThanOrEqual(2);
    expect(parsed.needs_expert_review).toBe(true);
    expect(parsed.message.length).toBeGreaterThan(10);
    expect(parsed.crop_name_ta).toBe('தக்காளி');
    expect(parsed.disease_name_ta).toContain('கருகல்');

    // Test frontend mapping
    const result = mapToDiagnosisResult(parsed);
    expect(result.status).toBe('confirmed');
    expect(result.confidence).toBeGreaterThanOrEqual(90);
    expect(result.cropDetectedEn).toContain('Tomato');
    expect(result.cropDetectedTa).toBe('தக்காளி');
  });

  // Test 3: Healthy leaf diagnosis (zero chemical pesticides)
  it('identifies healthy leaves with plant_health="Healthy" and prohibits chemical spraying', () => {
    const rawHealthyJson = JSON.stringify({
      crop_name: "Healthy Tomato Foliage",
      plant_health: "Healthy",
      disease_name: "None / Healthy Plant",
      confidence: "High",
      visible_symptoms: [
        "Vibrant uniform chlorophyll green coloration",
        "Intact leaf margins and smooth surface without lesions"
      ],
      possible_causes: [
        "Optimal balanced soil nutrition and proper aeration"
      ],
      alternative_diagnoses: [],
      recommended_actions: [
        "No chemical fungicides or pesticides required",
        "Maintain routine organic scouting and balanced drip irrigation"
      ],
      prevention: [
        "Continue bi-weekly crop monitoring"
      ],
      needs_expert_review: false,
      message: "The plant foliage is in healthy physiological condition.",
      crop_name_ta: "ஆரோக்கியமான தக்காளி இலை",
      plant_health_ta: "ஆரோக்கியமானது",
      disease_name_ta: "நோய் எதுவும் இல்லை",
      confidence_ta: "அதிகம்",
      recommended_actions_ta: [
        "எந்தவித இரசாயன மருந்துகளும் தேவை இல்லை",
        "வழக்கமான நீர்ப்பாசனம் மற்றும் கரிம உரமிடுதலை தொடரவும்"
      ]
    });

    const parsed = safeParseGeminiJson(rawHealthyJson);
    const result = mapToDiagnosisResult(parsed);

    expect(result.status).toBe('healthy');
    expect(result.plantHealth).toBe('Healthy');
    expect(result.severity).toBe('healthy');
    expect(result.chemicalRemedyEn.toLowerCase()).toContain('no chemical');
    expect(result.chemicalRemedyTa).toContain('தேவை இல்லை');
  });

  // Test 4: Blurry / Unclear photo handling (honest uncertainty)
  it('honestly rejects unclear or blurry photos with plant_health="Uncertain"', () => {
    const rawBlurryJson = JSON.stringify({
      crop_name: "Unknown Crop",
      plant_health: "Uncertain",
      disease_name: "Unable to identify accurately",
      confidence: "Low",
      visible_symptoms: [
        "Image is blurry and out-of-focus",
        "Insufficient resolution to inspect leaf veins or lesion margins"
      ],
      possible_causes: [
        "Camera shake or inadequate lighting during capture"
      ],
      alternative_diagnoses: [
        "Fungal leaf spot (possible)",
        "Nutrient deficiency (possible)"
      ],
      recommended_actions: [
        "Please retake a clear, well-lit photo of the affected plant leaf in daylight from 15-30 cm distance"
      ],
      prevention: [
        "Hold camera steady until auto-focus locks on the leaf"
      ],
      needs_expert_review: true,
      message: "Unable to identify accurately due to camera blur.",
      crop_name_ta: "தெரியாத பயிர்",
      plant_health_ta: "உறுதியற்றது",
      disease_name_ta: "துல்லியமாக அடையாளம் காண முடியவில்லை",
      confidence_ta: "குறைவு"
    });

    const parsed = safeParseGeminiJson(rawBlurryJson);
    const result = mapToDiagnosisResult(parsed);

    expect(result.status).toBe('unclear');
    expect(result.uncertain).toBe(true);
    expect(result.diseaseEn).toBe('Unable to identify accurately');
    expect(result.diseaseTa).toBe('துல்லியமாக அடையாளம் காண முடியவில்லை');
    expect(result.confidenceLevel).toBe('Low');
  });

  // Test 5: Non-agricultural image handling
  it('honestly identifies non-agricultural/non-plant images', () => {
    const rawNonPlantJson = JSON.stringify({
      crop_name: "Not a Crop",
      plant_health: "Uncertain",
      disease_name: "Unable to identify accurately (Not a Plant)",
      confidence: "Low",
      visible_symptoms: [
        "No plant tissue, foliage, stem, or agricultural crop detected"
      ],
      possible_causes: [
        "Non-agricultural object photographed"
      ],
      alternative_diagnoses: [],
      recommended_actions: [
        "Please upload a photo of a farm crop or diseased plant leaf"
      ],
      prevention: [],
      needs_expert_review: false,
      message: "This photo does not appear to contain a crop or plant.",
      crop_name_ta: "தாவரம் அல்ல",
      disease_name_ta: "துல்லியமாக அடையாளம் காண முடியவில்லை (தாவரம் அல்ல)"
    });

    const parsed = safeParseGeminiJson(rawNonPlantJson);
    const result = mapToDiagnosisResult(parsed);

    expect(result.status).toBe('not_plant');
    expect(result.uncertain).toBe(true);
    expect(result.diseaseEn).toContain('Not a Plant');
    expect(result.diseaseTa).toContain('தாவரம் அல்ல');
  });

  // Test 6: Backend handler missing API key error response
  it('returns clean HTTP 401 API_KEY_MISSING error without exposing keys if API key is not configured', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    const originalGoogleKey = process.env.GOOGLE_API_KEY;
    const originalViteKey = process.env.VITE_GEMINI_API_KEY;

    try {
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_API_KEY;
      delete process.env.VITE_GEMINI_API_KEY;

      const result = await handleCropDoctorRequest({
        mode: 'image',
        imageBase64: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      });

      expect(result.status).toBe(401);
      expect(result.body.success).toBe(false);
      expect(result.body.code).toBe('API_KEY_MISSING');
      expect(result.body.error).toContain('GEMINI_API_KEY');
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      if (originalGoogleKey) process.env.GOOGLE_API_KEY = originalGoogleKey;
      if (originalViteKey) process.env.VITE_GEMINI_API_KEY = originalViteKey;
    }
  });
});
