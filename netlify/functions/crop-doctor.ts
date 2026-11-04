/**
 * Netlify Serverless Function: Secure AI Crop Doctor
 * Endpoint: /.netlify/functions/crop-doctor
 * 
 * Powered by Google Gemini Vision API.
 * Uses modern v2 function syntax (export default async (req: Request) => Response).
 */

import { handleCropDoctorRequest } from './crop-doctor-handler';

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
      JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers: CORS_HEADERS,
      }
    );
  }

  try {
    const payload = await req.json();
    const result = await handleCropDoctorRequest(payload);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: CORS_HEADERS,
    });
  } catch (error: any) {
    console.error('Crop doctor serverless error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
};
