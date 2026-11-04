// Supabase Edge Function: Crop Doctor
// Follows Deno runtime environment with CORS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "API_KEY_MISSING",
        error: "GEMINI_API_KEY is not set in Supabase project secrets.",
      }),
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const { imageBase64, mimeType = "image/jpeg" } = await req.json();

    let cleanBase64 = imageBase64;
    let cleanMime = mimeType;
    if (imageBase64 && imageBase64.startsWith("data:")) {
      const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        cleanMime = match[1];
        cleanBase64 = match[2];
      }
    }

    const systemInstruction = `You are Agrimate Crop Doctor, an AI agricultural image analysis assistant.
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

    const schemaPrompt = `Carefully examine the uploaded plant image and return your diagnosis strictly in this structured JSON format:
{
  "crop_name": "Identified crop",
  "plant_health": "Healthy / Diseased / Uncertain",
  "disease_name": "Identified disease or Unknown",
  "confidence": "High / Medium / Low",
  "visible_symptoms": ["Symptom observed in the image"],
  "possible_causes": ["Possible cause"],
  "alternative_diagnoses": ["Other possible explanations"],
  "recommended_actions": ["Practical recommended action"],
  "prevention": ["Prevention methods"],
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
Return ONLY valid JSON.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: cleanBase64,
                },
              },
              {
                text: `${systemInstruction}\n\n${schemaPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ success: false, error: "Gemini API error", details: errText }),
        { status: geminiRes.status, headers: CORS_HEADERS }
      );
    }

    const data = await geminiRes.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(candidateText.trim());

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal error" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

