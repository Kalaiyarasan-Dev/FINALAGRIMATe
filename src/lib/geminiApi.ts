/**
 * Gemini AI Plant Disease Classification Service
 * Provides multimodal image diagnosis and symptom-based diagnosis for agricultural crops.
 */

// Gemini API key from environment configuration
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
export const GEMINI_MODEL = "gemini-3.6-flash";

export interface DiagnosisResult {
  diseaseEn: string;
  diseaseTa: string;
  confidence: number;
  symptomsEn: string[];
  symptomsTa: string[];
  chemicalRemedyEn: string;
  chemicalRemedyTa: string;
  organicRemedyEn: string;
  organicRemedyTa: string;
  preventionEn: string[];
  preventionTa: string[];
  cropDetectedEn?: string;
  cropDetectedTa?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Built-in offline fallback database in case of network unavailability
export const fallbackDiseaseDatabase: Record<string, Record<string, DiagnosisResult>> = {
  paddy: {
    blight: {
      diseaseEn: 'Bacterial Leaf Blight',
      diseaseTa: 'பாக்டீரியா இலை கருகல் நோய்',
      confidence: 91,
      cropDetectedEn: 'Paddy / Rice',
      cropDetectedTa: 'நெல்',
      severity: 'high',
      symptomsEn: ['Yellow-orange lesions on leaf tips', 'Wilting of seedlings (Kresek stage)', 'Grayish-white wavy leaf streaks'],
      symptomsTa: ['இலை நுனியில் மஞ்சள்-ஆரஞ்சு புண்கள்', 'நாற்றுகள் வாடுதல் (கிரேசெக் நிலை)', 'சாம்பல்-வெள்ளை அலை போன்ற இலை கோடுகள்'],
      chemicalRemedyEn: 'Spray Streptocycline (0.5g/L) + Copper Oxychloride (2.5g/L) or Copper Hydroxide (2g/L)',
      chemicalRemedyTa: 'ஸ்ட்ரெப்டோசைக்ளின் (0.5கி/லி) + காப்பர் ஆக்சிகுளோரைடு (2.5கி/லி) கலந்து தெளிக்கவும்',
      organicRemedyEn: 'Apply fresh cow dung slurry supernatant (5%) or spray Pseudomonas fluorescens (20g/L)',
      organicRemedyTa: 'புதிய மாட்டு சாண கரைசல் தெளிவு (5%) அல்லது சூடோமோனாஸ் புளோரசன்ஸ் (20கி/லி) தெளிக்கவும்',
      preventionEn: ['Use disease-resistant varieties (e.g. IR 64, CO 43)', 'Avoid excessive nitrogen fertilizer application', 'Maintain optimum field drainage and sanitize irrigation water'],
      preventionTa: ['நோய் எதிர்ப்பு திறன் கொண்ட ரகங்களை பயிரிடவும்', 'அதிக நைட்ரஜன் உரம் இடுவதை தவிர்க்கவும்', 'வயலில் சரியான வடிகால் வசதி அமைக்கவும்']
    },
    blast: {
      diseaseEn: 'Rice Blast (Magnaporthe oryzae)',
      diseaseTa: 'நெல் குலை நோய் (பூஞ்சை)',
      confidence: 88,
      cropDetectedEn: 'Paddy / Rice',
      cropDetectedTa: 'நெல்',
      severity: 'critical',
      symptomsEn: ['Spindle-shaped lesions on leaves with gray/whitish centers and dark borders', 'Brown lesions on node joints', 'Neck rot causing hanging empty panicles'],
      symptomsTa: ['சாம்பல் மையத்துடன் இலைகளில் சுழல் வடிவ புண்கள்', 'கணு பகுதிகளில் பழுப்பு நிற புண்கள்', 'கழுத்து அழுகல் காரணமாக கதிர்கள் தொங்கி மணிகள் பதராகுதல்'],
      chemicalRemedyEn: 'Spray Tricyclazole 75 WP (1g/L) or Azoxystrobin + Difenoconazole (1ml/L) or Carbendazim (1g/L)',
      chemicalRemedyTa: 'ட்ரைசைக்ளசோல் 75 WP (1கி/லி) அல்லது அஸாக்சிஸ்ட்ரோபின் + டைபினோகோனசோல் (1மிலி/லி) தெளிக்கவும்',
      organicRemedyEn: 'Foliar spray of neem seed kernel extract (NSKE 5%) or Pseudomonas fluorescens formulation (10g/L)',
      organicRemedyTa: 'வேப்பங்கொட்டை சாறு (5%) அல்லது சூடோமோனாஸ் கலவை தெளிக்கவும்',
      preventionEn: ['Clean cultivation and removal of grass weed hosts', 'Optimal plant spacing during transplanting', 'Avoid night-time water logging in susceptible stages'],
      preventionTa: ['சுத்தமான சாகுபடி மற்றும் களைகளை அகற்றுதல்', 'நடவின் போது சரியான இடைவெளி பராமரிக்கவும்', 'பூஞ்சை பரவும் பருவத்தில் அதிக தழைச்சத்தை தவிர்க்கவும்']
    }
  },
  tomato: {
    early_blight: {
      diseaseEn: 'Tomato Early Blight (Alternaria solani)',
      diseaseTa: 'தக்காளி ஆரம்ப இலை கருகல் நோய்',
      confidence: 94,
      cropDetectedEn: 'Tomato',
      cropDetectedTa: 'தக்காளி',
      severity: 'medium',
      symptomsEn: ['Concentric dark circular spots on older leaves (target spots)', 'Collar rot on seedling stems', 'Dark leathery sunken spots near fruit stem calyx'],
      symptomsTa: ['முதிர்ந்த இலைகளில் வளைய வடிவில் கரும்பழுப்பு புள்ளிகள்', 'தண்டு அழுகல் மற்றும் தண்டு புண்கள்', 'கனி காம்பின் அருகில் கரும்பழுப்பு நிற தடித்த புள்ளிகள்'],
      chemicalRemedyEn: 'Spray Mancozeb 75 WP (2g/L) or Copper Oxychloride 50 WP (3g/L) or Chlorothalonil (2g/L)',
      chemicalRemedyTa: 'மன்கோசெப் (2கி/லி) அல்லது காப்பர் ஆக்சிகுளோரைடு (3கி/லி) தெளிக்கவும்',
      organicRemedyEn: 'Foliar application of Trichoderma viride (5g/L) or neem leaf decoction (5%)',
      organicRemedyTa: 'டிரைக்கோடெர்மா விரிடி (5கி/லி) அல்லது வேப்ப இலை சாறு தெளிக்கவும்',
      preventionEn: ['Crop rotation with non-solanaceous crops for 2-3 years', 'Prune lower leaves to avoid soil splash', 'Adopt drip irrigation instead of overhead sprinkler watering'],
      preventionTa: ['மாற்று பயிர் சுழற்சி முறை பின்பற்றவும்', 'கீழ் இலைகளை கவாத்து செய்து மண்ணிலிருந்து படுவதை தவிர்க்கவும்', 'சொட்டு நீர்ப்பாசன முறையை பயன்படுத்தவும்']
    },
    curl_virus: {
      diseaseEn: 'Tomato Leaf Curl Virus (TYLCV)',
      diseaseTa: 'தக்காளி இலை சுருட்டு வைரஸ்',
      confidence: 92,
      cropDetectedEn: 'Tomato',
      cropDetectedTa: 'தக்காளி',
      severity: 'critical',
      symptomsEn: ['Severe upward curling and crinkling of leaves', 'Stunted plant growth and bushy bunching', 'Yellowing chlorosis along leaf margins and flower drop'],
      symptomsTa: ['இலைகள் மேல்நோக்கி சுருண்டு சுருங்குதல்', 'செடி வளர்ச்சி குன்றி புதர் போல் காணப்படுதல்', 'இலை விளிம்புகள் மஞ்சளாக மாறுதல் மற்றும் பூ உதிர்தல்'],
      chemicalRemedyEn: 'Control whitefly vectors: Spray Imidacloprid 17.8% SL (0.3ml/L) or Diafenthiuron 50% WP (1g/L) or Thiamethoxam (0.3g/L)',
      chemicalRemedyTa: 'வெள்ளை ஈக்களை கட்டுப்படுத்த இமிடாக்ளோபிரிட் (0.3மிலி/லி) அல்லது தயாமெதாக்சாம் (0.3கி/லி) தெளிக்கவும்',
      organicRemedyEn: 'Foliar spray of 3% Neem oil + soap solution or setup 15-20 yellow sticky traps per acre',
      organicRemedyTa: '3% வேப்ப எண்ணெய் கரைசல் தெளிக்கவும் மற்றும் ஏக்கருக்கு 15-20 மஞ்சள் ஒட்டும் பொறிகளை வைக்கவும்',
      preventionEn: ['Use insect-proof 40-mesh nylon nets in seedling nurseries', 'Uproot and bury/burn infected plants immediately', 'Keep field borders free from weeds like Parthenium'],
      preventionTa: ['நாற்றங்காலில் பூச்சி தடுப்பு வலைகளைப் பயன்படுத்தவும்', 'பாதிக்கப்பட்ட செடிகளை பிடுங்கி அழிக்கவும்', 'வயல் விளிம்பு களைகளை அகற்றவும்']
    }
  },
  cotton: {
    bollworm: {
      diseaseEn: 'Cotton Bollworm Pest Infestation (Helicoverpa armigera)',
      diseaseTa: 'பருத்தி காய்ப்புழு தாக்குதல்',
      confidence: 90,
      cropDetectedEn: 'Cotton',
      cropDetectedTa: 'பருத்தி',
      severity: 'high',
      symptomsEn: ['Bored circular holes on squares, bolls, and floral buds', 'Presence of larval entry holes plugged with granular frass/excreta', 'Flaring and premature dropping of squares and flowers'],
      symptomsTa: ['பூ மொட்டுகள் மற்றும் காய்களில் துளைகள் விழுதல்', 'புழுக்கள் நுழைந்த துளைகளில் புழுக்கை கழிவுகள் இருத்தல்', 'பூ மொட்டுகள் விரிந்து முன்கூட்டியே உதிர்தல்'],
      chemicalRemedyEn: 'Spray Spinosad 45 SC (0.5ml/L) or Emamectin Benzoate 5 SG (0.4g/L) or Chlorantraniliprole 18.5 SC (0.3ml/L)',
      chemicalRemedyTa: 'ஸ்பினோசாட் 45 SC (0.5மிலி/லி) அல்லது எமமெக்டின் பென்சோயேட் (0.4கி/லி) தெளிக்கவும்',
      organicRemedyEn: 'Release Trichogramma chilonis egg parasitoids (60,000/acre) or spray Bacillus thuringiensis (Bt) formulation (2g/L) or HaNPV (250 LE/acre)',
      organicRemedyTa: 'டிரைக்கோகிரம்மா முட்டை ஒட்டுண்ணிகளை வெளியிடவும் அல்லது பேசிலஸ் துரிஞ்சியென்சிஸ் (Bt) / வேப்ப எண்ணெய் தெளிக்கவும்',
      preventionEn: ['Install pheromone traps @ 5 per acre for monitoring moth activity', 'Grow border trap crops like Okra / Castor / Marigold', 'Avoid excessive nitrogen fertilization and avoid monoculture'],
      preventionTa: ['ஏக்கருக்கு 5 பெரோமோன் கவர்ச்சி பொறிகளை அமைக்கவும்', 'வரப்பு பயிராக வெண்டை அல்லது செண்டுமல்லி பயிரிடவும்', 'சமச்சீர் உர நிர்வாகம் மேற்கொள்ளவும்']
    }
  }
};

/**
 * Clean & extract JSON from Gemini text response
 */
function cleanJsonOutput(text: string): DiagnosisResult {
  let cleaned = text.trim();
  // Strip markdown code block fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  return {
    diseaseEn: parsed.diseaseEn || 'Identified Plant Condition',
    diseaseTa: parsed.diseaseTa || 'கண்டறியப்பட்ட பயிர் நிலை',
    confidence: Number(parsed.confidence) || 90,
    symptomsEn: Array.isArray(parsed.symptomsEn) ? parsed.symptomsEn : [parsed.symptomsEn].filter(Boolean),
    symptomsTa: Array.isArray(parsed.symptomsTa) ? parsed.symptomsTa : [parsed.symptomsTa].filter(Boolean),
    chemicalRemedyEn: parsed.chemicalRemedyEn || 'Consult local agriculture extension officer for chemical prescription.',
    chemicalRemedyTa: parsed.chemicalRemedyTa || 'இரசாயன முறை மருந்துகளுக்கு உள்ளூர் வேளாண்மை அலுவலரை அணுகவும்.',
    organicRemedyEn: parsed.organicRemedyEn || 'Apply 3-5% Neem oil formulation or organic bio-fungicide.',
    organicRemedyTa: parsed.organicRemedyTa || '3-5% வேப்ப எண்ணெய் அல்லது இயற்கை உயிர் பூஞ்சாணக்கொல்லி தெளிக்கவும்.',
    preventionEn: Array.isArray(parsed.preventionEn) ? parsed.preventionEn : [parsed.preventionEn].filter(Boolean),
    preventionTa: Array.isArray(parsed.preventionTa) ? parsed.preventionTa : [parsed.preventionTa].filter(Boolean),
    cropDetectedEn: parsed.cropDetectedEn,
    cropDetectedTa: parsed.cropDetectedTa,
    severity: parsed.severity || 'medium'
  };
}

/**
 * Classify plant disease using Gemini Vision API with an image DataURL
 */
export async function classifyPlantDiseaseFromImage(
  base64DataUrl: string,
  fallbackHint?: string
): Promise<DiagnosisResult> {
  // 1. Try secure serverless proxy first
  try {
    const res = await fetch('/.netlify/functions/crop-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'image',
        imageBase64: base64DataUrl,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          diseaseEn: json.data.diseaseEn || 'Diagnosed Plant Condition',
          diseaseTa: json.data.diseaseTa || 'கண்டறியப்பட்ட பயிர் நிலை',
          confidence: Number(json.data.confidence) || 90,
          symptomsEn: Array.isArray(json.data.symptomsEn) ? json.data.symptomsEn : [json.data.symptomsEn].filter(Boolean),
          symptomsTa: Array.isArray(json.data.symptomsTa) ? json.data.symptomsTa : [json.data.symptomsTa].filter(Boolean),
          chemicalRemedyEn: json.data.chemicalRemedyEn || 'Consult local agriculture extension officer.',
          chemicalRemedyTa: json.data.chemicalRemedyTa || 'உள்ளூர் வேளாண்மை அலுவலரை அணுகவும்.',
          organicRemedyEn: json.data.organicRemedyEn || 'Apply organic neem formulation.',
          organicRemedyTa: json.data.organicRemedyTa || 'இயற்கை வேப்ப எண்ணெய் கரைசல் தெளிக்கவும்.',
          preventionEn: Array.isArray(json.data.preventionEn) ? json.data.preventionEn : [json.data.preventionEn].filter(Boolean),
          preventionTa: Array.isArray(json.data.preventionTa) ? json.data.preventionTa : [json.data.preventionTa].filter(Boolean),
          cropDetectedEn: json.data.cropDetectedEn,
          cropDetectedTa: json.data.cropDetectedTa,
          severity: json.data.severity || 'medium'
        };
      }
    }
  } catch {
    // Fall through to direct client API if configured, or smart fallback
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackDiagnosis(fallbackHint || '');
  }

  try {
    // Parse data URL format: "data:image/jpeg;base64,..."
    let mimeType = 'image/jpeg';
    let base64Data = base64DataUrl;

    if (base64DataUrl.includes(';base64,')) {
      const parts = base64DataUrl.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/jpeg';
      base64Data = parts[1];
    }

    const systemPrompt = `
You are an expert Senior Agricultural Plant Pathologist and Agronomist specializing in Indian and tropical crops (Paddy/Rice, Tomato, Cotton, Sugarcane, Banana, Chilli, Maize, Groundnut, Pulses, Millets, Mango, etc.).

Analyze this plant leaf / crop image thoroughly:
1. Identify the crop name in English and Tamil.
2. Identify the specific disease, pest, nutrient deficiency, or fungal/bacterial infection. If the plant is completely healthy, report "Healthy Plant" / "ஆரோக்கியமான பயிர்".
3. Provide realistic confidence percentage (70 to 98%).
4. List visible symptoms in English and Tamil.
5. Provide precise, actionable Chemical treatments (standard doses e.g. g/L or ml/L) in English and Tamil.
6. Provide Organic / Natural farming / Panchagavya / Neem / Bio-agent remedies in English and Tamil.
7. Provide preventive crop management measures in English and Tamil.
8. Specify severity: "low", "medium", "high", or "critical".

Format your response strictly as valid JSON with this exact structure:
{
  "cropDetectedEn": "e.g. Tomato",
  "cropDetectedTa": "e.g. தக்காளி",
  "diseaseEn": "e.g. Tomato Early Blight (Alternaria solani)",
  "diseaseTa": "e.g. தக்காளி ஆரம்ப இலை கருகல் நோய்",
  "confidence": 93,
  "severity": "medium",
  "symptomsEn": ["Concentric dark rings on older leaves", "Yellowing around leaf lesions"],
  "symptomsTa": ["முதிர்ந்த இலைகளில் வளைய வடிவில் கரும்பழுப்பு புள்ளிகள்", "புண்களைச் சுற்றி இலை மஞ்சளாதல்"],
  "chemicalRemedyEn": "Spray Mancozeb 75 WP (2g/L) or Copper Oxychloride (3g/L). Repeat after 10-14 days if needed.",
  "chemicalRemedyTa": "மன்கோசெப் 75 WP (2கி/லி) அல்லது காப்பர் ஆக்சிகுளோரைடு (3கி/லி) தெளிக்கவும். தேவைப்பட்டால் 10-14 நாட்களுக்குப் பின் மீண்டும் தெளிக்கவும்.",
  "organicRemedyEn": "Spray 3% Neem oil with soap emulsifier or foliar spray of Trichoderma viride (5g/L).",
  "organicRemedyTa": "3% வேப்ப எண்ணெய் அல்லது டிரைக்கோடெர்மா விரிடி (5கி/லி) இலைகளில் தெளிக்கவும்.",
  "preventionEn": ["Practice 3-year crop rotation", "Remove bottom foliage to stop soil splash", "Use drip irrigation"],
  "preventionTa": ["3 வருட பயிர் சுழற்சி மேற்கொள்ளவும்", "மண் தெறிக்காமல் இருக்க கீழ் இலைகளை கவாத்து செய்யவும்", "சொட்டு நீர் பாசனம் பயன்படுத்தவும்"]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data
                  }
                },
                {
                  text: systemPrompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Gemini API returned error status:', response.status, errorText);
      throw new Error(`Gemini API error (${response.status})`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No diagnostic text returned by Gemini API');
    }

    return cleanJsonOutput(candidateText);
  } catch (err) {
    console.error('Gemini Vision classification failed, applying smart fallback:', err);
    return getFallbackDiagnosis(fallbackHint || '');
  }
}

/**
 * Classify plant disease from symptom description using Gemini API
 */
export async function classifyPlantDiseaseFromSymptoms(
  crop: string,
  symptoms: string[]
): Promise<DiagnosisResult> {
  // 1. Try secure serverless proxy first
  try {
    const res = await fetch('/.netlify/functions/crop-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'symptom',
        crop,
        symptoms,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          diseaseEn: json.data.diseaseEn || 'Diagnosed Plant Condition',
          diseaseTa: json.data.diseaseTa || 'கண்டறியப்பட்ட பயிர் நிலை',
          confidence: Number(json.data.confidence) || 90,
          symptomsEn: Array.isArray(json.data.symptomsEn) ? json.data.symptomsEn : [json.data.symptomsEn].filter(Boolean),
          symptomsTa: Array.isArray(json.data.symptomsTa) ? json.data.symptomsTa : [json.data.symptomsTa].filter(Boolean),
          chemicalRemedyEn: json.data.chemicalRemedyEn || 'Consult local agriculture extension officer.',
          chemicalRemedyTa: json.data.chemicalRemedyTa || 'உள்ளூர் வேளாண்மை அலுவலரை அணுகவும்.',
          organicRemedyEn: json.data.organicRemedyEn || 'Apply organic neem formulation.',
          organicRemedyTa: json.data.organicRemedyTa || 'இயற்கை வேப்ப எண்ணெய் கரைசல் தெளிக்கவும்.',
          preventionEn: Array.isArray(json.data.preventionEn) ? json.data.preventionEn : [json.data.preventionEn].filter(Boolean),
          preventionTa: Array.isArray(json.data.preventionTa) ? json.data.preventionTa : [json.data.preventionTa].filter(Boolean),
          cropDetectedEn: json.data.cropDetectedEn,
          cropDetectedTa: json.data.cropDetectedTa,
          severity: json.data.severity || 'medium'
        };
      }
    }
  } catch {
    // Fall through
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackSymptomDiagnosis(crop, symptoms);
  }

  try {
    const prompt = `
You are a senior agricultural crop disease doctor.
The farmer has reported the following crop and observed symptoms:
- Crop: ${crop}
- Observed Symptoms: ${symptoms.join(', ')}

Diagnose the most probable crop disease/pest/deficiency and provide actionable advice in both English and Tamil.
Return strictly valid JSON matching this schema:
{
  "cropDetectedEn": "${crop}",
  "cropDetectedTa": "${crop === 'paddy' ? 'நெல்' : crop === 'tomato' ? 'தக்காளி' : crop === 'cotton' ? 'பருத்தி' : crop}",
  "diseaseEn": "Disease Name in English",
  "diseaseTa": "Disease Name in Tamil",
  "confidence": 90,
  "severity": "medium",
  "symptomsEn": ["string", "string"],
  "symptomsTa": ["string in Tamil", "string in Tamil"],
  "chemicalRemedyEn": "Chemical Treatment with dose in English",
  "chemicalRemedyTa": "Chemical Treatment with dose in Tamil",
  "organicRemedyEn": "Organic Treatment with dose in English",
  "organicRemedyTa": "Organic Treatment with dose in Tamil",
  "preventionEn": ["string", "string"],
  "preventionTa": ["string in Tamil", "string in Tamil"]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error (${response.status})`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty diagnosis response from Gemini API');

    return cleanJsonOutput(text);
  } catch (err) {
    console.error('Gemini symptom diagnosis error, using local fallback:', err);
    return getFallbackSymptomDiagnosis(crop, symptoms);
  }
}

/**
 * Fallback helpers
 */
function getFallbackDiagnosis(hint: string): DiagnosisResult {
  const lower = hint.toLowerCase();
  if (lower.includes('tomato') && (lower.includes('curl') || lower.includes('virus'))) {
    return fallbackDiseaseDatabase.tomato.curl_virus;
  } else if (lower.includes('tomato') || lower.includes('early')) {
    return fallbackDiseaseDatabase.tomato.early_blight;
  } else if (lower.includes('cotton') || lower.includes('worm') || lower.includes('boll')) {
    return fallbackDiseaseDatabase.cotton.bollworm;
  } else if (lower.includes('blast') || lower.includes('spot')) {
    return fallbackDiseaseDatabase.paddy.blast;
  }
  return fallbackDiseaseDatabase.paddy.blight;
}

function getFallbackSymptomDiagnosis(crop: string, symptoms: string[]): DiagnosisResult {
  if (crop === 'paddy') {
    if (symptoms.includes('spindles') || symptoms.includes('neck')) {
      return fallbackDiseaseDatabase.paddy.blast;
    }
    return fallbackDiseaseDatabase.paddy.blight;
  } else if (crop === 'tomato') {
    if (symptoms.includes('curls') || symptoms.includes('whiteflies')) {
      return fallbackDiseaseDatabase.tomato.curl_virus;
    }
    return fallbackDiseaseDatabase.tomato.early_blight;
  } else if (crop === 'cotton') {
    return fallbackDiseaseDatabase.cotton.bollworm;
  }
  return fallbackDiseaseDatabase.paddy.blight;
}
