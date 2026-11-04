/**
 * Netlify Serverless Function: Secure AI Crop Doctor
 * Endpoint: /.netlify/functions/crop-doctor
 * 
 * Powered by Netlify AI Gateway with Google Gemini (gemini-3.8-flash).
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

Your task is to analyze the image or symptoms and provide structured diagnostic advice.
Strict Requirements:
1. Identify the crop name in English and Tamil.
2. Identify the specific disease, pest infestation, or nutrient deficiency. If the plant is healthy, set diseaseEn to "Healthy Plant" and diseaseTa to "ஆரோக்கியமான பயிர்".
3. Provide confidence percentage (70 to 98).
4. Provide visible symptoms in English and Tamil.
5. Provide actionable Chemical treatments (with standard application advice) in English and Tamil.
6. Provide Organic remedies (Neem oil, Panchagavya, bio-agents) in English and Tamil.
7. Provide preventive measures in English and Tamil.
8. Set severity: "low", "medium", "high", or "critical".
9. If the image is blurry, does not contain a crop or leaf, or cannot be identified with reasonable certainty, set "uncertain": true. Otherwise set "uncertain": false.

Output ONLY a single valid JSON object matching this schema:
{
  "cropDetectedEn": "Tomato",
  "cropDetectedTa": "தக்காளி",
  "diseaseEn": "Tomato Early Blight",
  "diseaseTa": "தக்காளி ஆரம்ப இலை கருகல் நோய்",
  "confidence": 92,
  "severity": "medium",
  "uncertain": false,
  "symptomsEn": ["Concentric dark spots on leaves"],
  "symptomsTa": ["இலைகளில் வளைய வடிவில் கரும்பழுப்பு புள்ளிகள்"],
  "chemicalRemedyEn": "Spray Mancozeb 75 WP (2g/L) or Copper Oxychloride (3g/L)",
  "chemicalRemedyTa": "மன்கோசெப் 75 WP (2கி/லி) அல்லது காப்பர் ஆக்சிகுளோரைடு (3கி/லி) தெளிக்கவும்",
  "organicRemedyEn": "Spray 3% Neem oil formulation or Trichoderma viride",
  "organicRemedyTa": "3% வேப்ப எண்ணெய் அல்லது டிரைக்கோடெர்மா விரிடி தெளிக்கவும்",
  "preventionEn": ["Practice crop rotation", "Avoid water logging"],
  "preventionTa": ["பயிர் சுழற்சி முறை பின்பற்றவும்", "நீர் தேங்குவதை தவிர்க்கவும்"]
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
      model: 'gemini-3.8-flash',
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
