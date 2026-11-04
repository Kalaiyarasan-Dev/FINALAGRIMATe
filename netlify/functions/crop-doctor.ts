/**
 * Netlify Serverless Function: Secure AI Crop Doctor
 * Endpoint: /.netlify/functions/crop-doctor
 * 
 * Powered by Netlify AI Gateway with Google Gemini.
 * Uses modern v2 function syntax (export default async (req: Request) => Response).
 */

import { GoogleGenAI } from '@google/genai';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async (req: Request): Promise<Response> => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // 2. Validate Method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers: CORS_HEADERS,
      }
    );
  }

  try {
    const payload = await req.json();
    const { imageBase64, mimeType = 'image/jpeg', mode = 'image', crop, symptoms } = payload;

    const systemPrompt = `
You are a senior agricultural plant pathologist and agronomist specializing in Indian and tropical crops (Paddy/Rice, Tomato, Cotton, Sugarcane, Banana, Chilli, Groundnut, Pulses, Millets, Vegetables).

STRICT DIAGNOSTIC PROTOCOL:
1. Examine the actual image pixels. Check if it contains an agricultural plant or leaf. If NOT a plant (e.g. vehicle, human, animal, furniture, screenshot), set:
   "status": "not_plant", "diseaseEn": "Unable to identify accurately (Not a Plant)", "diseaseTa": "துல்லியமாக அடையாளம் காண முடியவில்லை (தாவரம் அல்ல)", "confidence": 15, "uncertain": true.
2. Check image clarity. If blurry, severely underexposed, or lacking sufficient detail to examine lesions/veins, set:
   "status": "unclear", "diseaseEn": "Unable to identify accurately", "diseaseTa": "துல்லியமாக அடையாளம் காண முடியவில்லை", "confidence": 30, "uncertain": true.
3. If the plant foliage is healthy without disease lesions, pest damage, or chlorotic deficiency, set:
   "status": "healthy", "diseaseEn": "Healthy Crop (No Disease Detected)", "diseaseTa": "ஆரோக்கியமான பயிர் (நோய் எதுவும் இல்லை)", "severity": "healthy", "uncertain": false, and do NOT recommend any chemical pesticides.
4. If diseased:
   - Identify crop name in English and Tamil.
   - Identify the exact disease, pest, or nutrient deficiency.
   - Explain confidence percentage and the diagnostic rationale.
   - List visible symptoms found in English and Tamil.
   - List possible causes (weather, moisture, fungal vectors) in English and Tamil.
   - Recommended treatment: Organic remedy first, then labeled Chemical remedy with application advice.
   - Prevention methods in English and Tamil.
   - State clearly when to consult an agricultural expert (thresholds and helpline).
   - Include farmer safety precautions for chemical handling.

Output ONLY a single valid JSON object matching this schema:
{
  "status": "confirmed" | "probable" | "healthy" | "unclear" | "not_plant",
  "cropDetectedEn": "Crop Name in English",
  "cropDetectedTa": "Crop Name in Tamil",
  "diseaseEn": "Disease Name in English",
  "diseaseTa": "Disease Name in Tamil",
  "confidence": 92,
  "confidenceExplanationEn": "Clear explanation of how symptoms were identified",
  "confidenceExplanationTa": "அறிகுறிகள் எவ்வாறு கண்டறியப்பட்டன என்பதற்கான விளக்கம்",
  "severity": "healthy" | "low" | "medium" | "high" | "critical" | "unclear",
  "uncertain": false,
  "symptomsEn": ["Symptom 1", "Symptom 2"],
  "symptomsTa": ["அறிகுறி 1", "அறிகுறி 2"],
  "possibleCausesEn": ["Cause 1", "Cause 2"],
  "possibleCausesTa": ["காரணம் 1", "காரணம் 2"],
  "chemicalRemedyEn": "Chemical remedy with dosage",
  "chemicalRemedyTa": "இரசாயன மருந்து அளவுடன்",
  "organicRemedyEn": "Organic remedy with dosage",
  "organicRemedyTa": "இயற்கை தீர்வு",
  "preventionEn": ["Tip 1", "Tip 2"],
  "preventionTa": ["தடுப்பு முறை 1", "தடுப்பு முறை 2"],
  "expertConsultationEn": "When to consult expert guidance",
  "expertConsultationTa": "வேளாண் நிபுணரை எப்போது அணுக வேண்டும்",
  "safetyWarningEn": "Safety warning for chemical handling",
  "safetyWarningTa": "இரசாயன பாதுகாப்பு எச்சரிக்கை"
}
`;

    // Initialize GoogleGenAI SDK with zero-config (Netlify AI Gateway auto-injects credentials)
    const ai = new GoogleGenAI({});

    const contents: any[] = [];

    if (mode === 'image' && imageBase64) {
      let cleanBase64 = imageBase64;
      let actualMime = mimeType;
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        actualMime = parts[0].replace('data:', '') || 'image/jpeg';
        cleanBase64 = parts[1];
      }

      contents.push({
        inlineData: {
          mimeType: actualMime,
          data: cleanBase64,
        },
      });
      contents.push({ text: systemPrompt });
    } else {
      // Symptom mode
      const userMessage = `Crop: ${crop || 'Unknown'}. Observed Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms || 'None specified'}. Provide diagnostic advice.`;
      contents.push({ text: `${systemPrompt}\n\n${userMessage}` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
    });

    const candidate = response.candidates?.[0];
    const candidateText = candidate?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return new Response(
        JSON.stringify({ success: false, error: 'Empty response from AI Gateway.' }),
        { status: 502, headers: CORS_HEADERS }
      );
    }

    let jsonStr = candidateText.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(jsonStr);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsed,
      }),
      {
        status: 200,
        headers: CORS_HEADERS,
      }
    );
  } catch (error: any) {
    console.error('Crop doctor function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
};
