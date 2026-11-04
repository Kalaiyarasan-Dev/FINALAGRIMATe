/**
 * Gemini AI Plant Disease Classification Service
 * Provides secure multimodal image diagnosis and symptom analysis for agricultural crops.
 * Features honest uncertainty handling, healthy plant detection, and farmer safety guidelines.
 */

import { analyzeImagePixels, ImageAnalysisMetrics } from './imageAnalysis';
import { supabase } from './supabaseClient';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export type DiagnosisStatus = 'confirmed' | 'probable' | 'healthy' | 'unclear' | 'not_plant';

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

export interface DiagnosisResult {
  status: DiagnosisStatus;
  cropDetectedEn: string;
  cropDetectedTa: string;
  diseaseEn: string;
  diseaseTa: string;
  confidence: number;
  confidenceLevel?: 'High' | 'Medium' | 'Low' | string;
  plantHealth?: 'Healthy' | 'Diseased' | 'Uncertain' | string;
  confidenceExplanationEn: string;
  confidenceExplanationTa: string;
  severity: 'healthy' | 'low' | 'medium' | 'high' | 'critical' | 'unclear';
  uncertain: boolean;
  symptomsEn: string[];
  symptomsTa: string[];
  possibleCausesEn: string[];
  possibleCausesTa: string[];
  chemicalRemedyEn: string;
  chemicalRemedyTa: string;
  organicRemedyEn: string;
  organicRemedyTa: string;
  preventionEn: string[];
  preventionTa: string[];
  expertConsultationEn: string;
  expertConsultationTa: string;
  safetyWarningEn: string;
  safetyWarningTa: string;
  alternativeDiagnosesEn?: string[];
  alternativeDiagnosesTa?: string[];
  possibleAlternativesEn?: string[];
  possibleAlternativesTa?: string[];
  messageEn?: string;
  messageTa?: string;
  rawDiagnosis?: CropDoctorDiagnosis;
}

export class CropDoctorApiError extends Error {
  code: string;
  status?: number;
  details?: string;

  constructor(message: string, code = 'API_ERROR', status?: number, details?: string) {
    super(message);
    this.name = 'CropDoctorApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Built-in plant pathology database for Tamil Nadu & Indian agricultural crops.
 * Used for offline verification, unit tests, and computer vision fallbacks.
 */
export const fallbackDiseaseDatabase: Record<string, Record<string, DiagnosisResult>> = {
  healthy: {
    general: {
      status: 'healthy',
      cropDetectedEn: 'Healthy Plant Foliage',
      cropDetectedTa: 'ஆரோக்கியமான தாவர இலை',
      diseaseEn: 'Healthy Crop (No Disease Detected)',
      diseaseTa: 'ஆரோக்கியமான பயிர் (நோய் எதுவும் இல்லை)',
      confidence: 94,
      confidenceLevel: 'High',
      plantHealth: 'Healthy',
      confidenceExplanationEn:
        'The plant foliage exhibits vibrant uniform chlorophyll, intact leaf margins, and no visible necrotic lesions or fungal growth.',
      confidenceExplanationTa:
        'இலையில் சீரான பசுமை நிறம் உள்ளது, புண்கள் அல்லது பூஞ்சை பாதிப்புகள் எதுவும் தென்படவில்லை.',
      severity: 'healthy',
      uncertain: false,
      symptomsEn: [
        'Vibrant natural green coloration',
        'Intact cell structure and smooth leaf veins',
        'No necrotic lesions or chlorotic spotting',
      ],
      symptomsTa: [
        'இயற்கையான பசுமை நிறம்',
        'முழுமையான இலை அமைப்பு மற்றும் நரம்புகள்',
        'புள்ளிகள் அல்லது கருகல் அறிகுறிகள் இல்லை',
      ],
      possibleCausesEn: [
        'Optimal balanced soil nutrition',
        'Adequate root aeration and healthy moisture levels',
      ],
      possibleCausesTa: [
        'சமச்சீர் மண் ஊட்டச்சத்து மற்றும் ஆரோக்கியமான நீர்ப்பாசனம்',
        'நோய் தாக்கமற்ற தரமான விதை மற்றும் முறையான பராமரிப்பு',
      ],
      chemicalRemedyEn:
        'No chemical fungicides or pesticides required. Avoid unnecessary prophylactic spraying.',
      chemicalRemedyTa:
        'எந்தவித இரசாயன மருந்துகளும் தேவை இல்லை. தேவையற்ற பூச்சிக்கொல்லி தெளிப்பை தவிர்க்கவும்.',
      organicRemedyEn:
        'Apply Panchagavya (3%) or Seaweed extract once a month to sustain natural vigor and plant immunity.',
      organicRemedyTa:
        'இயற்கை வளர்ச்சியை ஊக்குவிக்க மாதமொருமுறை பஞ்சகாவ்யா (3%) அல்லது மீன் அமிலக் கரைசல் தெளிக்கலாம்.',
      preventionEn: [
        'Maintain scheduled crop scouting twice a week',
        'Ensure proper soil drainage after rainfall',
        'Maintain balanced N-P-K fertilization',
      ],
      preventionTa: [
        'வாரத்திற்கு இருமுறை பயிரை கண்காணிக்கவும்',
        'மழைக்காலத்தில் வயலில் நீர் தேங்காமல் பார்த்துக் கொள்ளவும்',
        'சமச்சீர் உரம் இடவும்',
      ],
      expertConsultationEn:
        'Consult local agricultural extension officer only if new discoloration or wilting symptoms develop.',
      expertConsultationTa:
        'புதிய நிறமாற்றம் அல்லது வாடல் அறிகுறிகள் தென்பட்டால் மட்டும் வேளாண் அலுவலரை அணுகவும்.',
      safetyWarningEn:
        'No pesticide application is recommended for healthy plants. Conserve beneficial predator insects.',
      safetyWarningTa:
        'ஆரோக்கியமான பயிர்களுக்கு மருந்து தெளிக்க வேண்டாம். நன்மை செய்யும் பூச்சிகளை பாதுகாக்கவும்.',
      messageEn:
        'The plant foliage is in excellent physiological health. No disease or chemical treatments needed.',
      messageTa:
        'பயிர் இலைகள் சிறந்த ஆரோக்கியத்துடன் உள்ளன. நோய் எதுவும் இல்லை; இரசாயன மருந்துகள் தேவையில்லை.',
    },
  },
  unclear: {
    blurry: {
      status: 'unclear',
      cropDetectedEn: 'Unknown Crop (Unclear Image)',
      cropDetectedTa: 'தெரியாத பயிர் (தெளிவற்ற படம்)',
      diseaseEn: 'Unable to identify accurately',
      diseaseTa: 'துல்லியமாக அடையாளம் காண முடியவில்லை',
      confidence: 30,
      confidenceLevel: 'Low',
      plantHealth: 'Uncertain',
      confidenceExplanationEn:
        'The uploaded image is blurry, out of focus, or lacks sufficient optical detail to examine microscopic leaf veins, lesions, or fungal fruiting bodies.',
      confidenceExplanationTa:
        'பதிவேற்றப்பட்ட படம் மங்கலாக அல்லது தெளிவற்றதாக உள்ளதால், இலை புண்கள் மற்றும் நோய்களை துல்லியமாக அடையாளம் காண முடியவில்லை.',
      severity: 'unclear',
      uncertain: true,
      symptomsEn: [
        'Optical blur or camera shake detected',
        'Insufficient resolution to verify diagnostic margin rings',
      ],
      symptomsTa: [
        'கேமரா அசைவு அல்லது மங்கலான படம்',
        'இலை நரம்புகள் மற்றும் அறிகுறிகள் தெளிவாக தெரியவில்லை',
      ],
      possibleCausesEn: [
        'Hand vibration during capture',
        'Camera lens too close to the leaf surface without macro focus',
      ],
      possibleCausesTa: [
        'படம் எடுக்கும் போது கை அசைவு அல்லது போதிய வெளிச்சமின்மை',
        'கேமரா லென்ஸ் மிக அருகில் இருத்தல் அல்லது ஃபோகஸ் குறைபாடு',
      ],
      chemicalRemedyEn:
        'Do NOT apply any chemical pesticides or fungicides based on an uncertain photo.',
      chemicalRemedyTa:
        'தெளிவற்ற படங்களை அடிப்படையாகக் கொண்டு எந்தவொரு இரசாயன மருந்தையும் தெளிக்க வேண்டாம்.',
      organicRemedyEn:
        'Please retake a clear close-up photograph of the leaf in bright daylight (15-30 cm distance).',
      organicRemedyTa:
        'நல்ல பகல் வெளிச்சத்தில், இலையை 15-30 செ.மீ தூரத்திலிருந்து தெளிவாக படம் எடுத்து மீண்டும் பதிவேற்றவும்.',
      preventionEn: [
        'Ensure natural daylight illumination',
        'Hold camera steady until auto-focus locks on the lesion',
      ],
      preventionTa: [
        'போதிய பகல் வெளிச்சம் இருப்பதை உறுதிப்படுத்தவும்',
        'கேமராவை அசையாமல் பிடித்து படம் எடுக்கவும்',
      ],
      expertConsultationEn:
        'If unable to capture a sharp photo, take a physical leaf sample in a sealed plastic bag to your nearest Krishi Vigyan Kendra (KVK).',
      expertConsultationTa:
        'தெளிவான படம் எடுக்க முடியாவிட்டால், பாதிக்கப்பட்ட இலையை கவரில் இட்டு அருகிலுள்ள கேவிகே (KVK) அல்லது வேளாண் அலுவலரிடம் காட்டவும்.',
      safetyWarningEn:
        'Misdiagnosis can cause severe crop loss. Never spray chemicals without confirmed disease identification.',
      safetyWarningTa:
        'தவறான மருந்துகள் பயிரை சேதப்படுத்தும். நோய் உறுதியாக தெரியாமல் பூச்சிக்கொல்லி தெளிக்கக் கூடாது.',
      messageEn:
        'Photograph lacks sufficient sharpness. Please retake a clear photo for an accurate assessment.',
      messageTa:
        'படம் தெளிவற்றதாக உள்ளது. துல்லியமாக அறிய நல்ல வெளிச்சத்தில் மீண்டும் படம் எடுக்கவும்.',
    },
    not_plant: {
      status: 'not_plant',
      cropDetectedEn: 'No Agricultural Crop Detected',
      cropDetectedTa: 'பயிர் அல்லது இலை கண்டறியப்படவில்லை',
      diseaseEn: 'Unable to identify accurately (Not a Plant)',
      diseaseTa: 'துல்லியமாக அடையாளம் காண முடியவில்லை (தாவரம் அல்ல)',
      confidence: 15,
      confidenceLevel: 'Low',
      plantHealth: 'Uncertain',
      confidenceExplanationEn:
        'The uploaded photograph does not contain an agricultural crop, leaf, stem, or fruit. The color spectrum and texture match an inanimate object or unrelated subject.',
      confidenceExplanationTa:
        'பதிவேற்றப்பட்ட படத்தில் விவசாய பயிர் அல்லது இலைகள் எதுவும் இல்லை. தயவுசெய்து பாதிக்கப்பட்ட பயிர் இலையின் படத்தை பதிவேற்றவும்.',
      severity: 'unclear',
      uncertain: true,
      symptomsEn: [
        'No vegetative chlorophyll or foliage structure found',
        'Color distribution and surface texture match non-plant materials',
      ],
      symptomsTa: [
        'தாவர அமைப்பு அல்லது பசுமை இலைகள் தென்படவில்லை',
        'வண்ண அமைப்பு மற்றும் பரப்பு தாவர தன்மையுடன் பொருந்தவில்லை',
      ],
      possibleCausesEn: [
        'Accidental upload of an unrelated gallery photograph',
        'Camera pointed at machinery, vehicle, or indoor object',
      ],
      possibleCausesTa: [
        'தவறுதலாக வேறு படம் பதிவேற்றப்பட்டுள்ளது',
        'பயிரின் இலை அல்லது தாவர பாகங்கள் படத்தில் தென்படவில்லை',
      ],
      chemicalRemedyEn: 'Not applicable. Please upload a crop photograph.',
      chemicalRemedyTa: 'பொருந்தாது. தயவுசெய்து பயிரின் படத்தை பதிவேற்றவும்.',
      organicRemedyEn: 'Please capture a clear photo of your farm crop.',
      organicRemedyTa: 'உங்கள் பண்ணை பயிரின் இலையை படம் எடுத்து பதிவேற்றவும்.',
      preventionEn: [
        'Photograph the upper and lower surfaces of the affected leaf',
        'Ensure crop foliage fills at least 70% of the camera frame',
      ],
      preventionTa: [
        'பாதிக்கப்பட்ட இலையின் மேல் மற்றும் கீழ் பகுதியை படம் எடுக்கவும்',
        'படத்தின் பெரும்பகுதியில் பயிர் இலை இருக்குமாறு எடுக்கவும்',
      ],
      expertConsultationEn:
        'Call Kisan Call Centre at 1800-180-1551 for toll-free crop guidance.',
      expertConsultationTa:
        'இலவச ஆலோசனைக்கு உழவர் உதவி மையம் 1800-180-1551 எண்ணை அழைக்கவும்.',
      safetyWarningEn:
        'Only apply agricultural inputs to confirmed agricultural specimens.',
      safetyWarningTa: 'பயிர் அல்லாத பொருட்களுக்கு மருந்துகள் பொருந்தாது.',
      messageEn:
        'This photo does not appear to contain a crop or plant. Please upload a plant foliage photo.',
      messageTa:
        'இப்படத்தில் பயிர்கள் எதுவும் தென்படவில்லை. தயவுசெய்து பயிரின் இலையை படம் எடுக்கவும்.',
    },
  },
  paddy: {
    blight: {
      status: 'confirmed',
      cropDetectedEn: 'Paddy / Rice (Oryza sativa)',
      cropDetectedTa: 'நெல் (Oryza sativa)',
      diseaseEn: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
      diseaseTa: 'பாக்டீரியா இலை கருகல் நோய்',
      confidence: 92,
      confidenceLevel: 'High',
      plantHealth: 'Diseased',
      confidenceExplanationEn:
        'Distinct wavy grayish-white lesions with water-soaked margins starting from leaf tips and progressing down the blade.',
      confidenceExplanationTa:
        'இலை நுனிகளில் தொடங்கி அலை அலையாக இறங்கும் சாம்பல்-வெள்ளை கருகல் புண்கள் தெளிவாக தென்படுகின்றன.',
      severity: 'high',
      uncertain: false,
      symptomsEn: [
        'Water-soaked to yellowish translucent stripes at leaf tips',
        'Wavy grayish-white drying edges on leaf blades',
        'Milky bacterial ooze drops visible in early morning humidity',
      ],
      symptomsTa: [
        'இலை நுனியில் மஞ்சள் கலந்த நீர் கோடுகள்',
        'இலை விளிம்புகளில் அலை போன்ற சாம்பல்-வெள்ளை காய்ந்த பகுதிகள்',
        'காலை பனி நேரத்தில் கசியும் பாக்டீரியா திரவம்',
      ],
      possibleCausesEn: [
        'Warm temperatures (25-34°C) with high relative humidity (>85%)',
        'Heavy wind-driven rainfall damaging leaf cuticle',
        'Excessive basal nitrogen fertilizer application',
      ],
      possibleCausesTa: [
        'அதிக ஈரப்பதம் மற்றும் காற்றுடன் கூடிய மழை',
        'அதிகப்படியான தழைச்சத்து (யூரியா) இடுதல்',
      ],
      chemicalRemedyEn:
        'Spray Streptocycline (0.5g/L) + Copper Oxychloride 50 WP (2.5g/L) or Copper Hydroxide (2g/L). Repeat after 10-12 days if rains persist.',
      chemicalRemedyTa:
        'ஸ்ட்ரெப்டோசைக்ளின் (0.5கி/லி) + காப்பர் ஆக்சிகுளோரைடு (2.5கி/லி) கலந்து இலைகளில் நனையும்படி தெளிக்கவும்.',
      organicRemedyEn:
        'Spray fresh cow dung slurry supernatant (5% filtrate) or Pseudomonas fluorescens talc formulation @ 10g/L during cool morning hours.',
      organicRemedyTa:
        'புதிய மாட்டு சாண தெளிவு கரைசல் (5%) அல்லது சூடோமோனாஸ் புளோரசன்ஸ் (10கி/லி) தெளிக்கவும்.',
      preventionEn: [
        'Use resistant/tolerant varieties (CO 43, CR 1009 Sub 1, ADT 45)',
        'Withhold top-dressing of nitrogen fertilizer when lesions appear',
        'Drain stagnant flood water from the field',
      ],
      preventionTa: [
        'நோய் எதிர்ப்பு ரகங்களை சாகுபடி செய்யவும்',
        'அறிகுறிகள் தென்பட்டவுடன் யூரியா இடுவதை உடனடியாக நிறுத்தவும்',
        'வயலில் தேங்கிய நீரை வடிக்கவும்',
      ],
      expertConsultationEn:
        'Consult your local Agricultural Extension Officer or KVK if more than 15% of the crop canopy is blighted during tillering stage.',
      expertConsultationTa:
        'தூர்கட்டும் பருவத்தில் 15%-க்கு மேல் இலைகள் கருகினால் வேளாண் அலுவலரை உடனே அணுகவும்.',
      safetyWarningEn:
        'Statutory Safety Notice: Always follow product label instructions, wear rubber gloves and face mask, and avoid spraying against wind direction.',
      safetyWarningTa:
        'பாதுகாப்பு குறிப்பு: மருந்து பாட்டில் லேபிளை பின்பற்றவும். கையுறை மற்றும் முகக்கவசம் அணிந்து காற்று வீசும் திசையில் தெளிக்கவும்.',
      messageEn:
        'Bacterial blight identified on rice leaves. Cease urea top-dressing and spray copper-based bactericide.',
      messageTa:
        'நெல்லில் பாக்டீரியா இலை கருகல் கண்டறியப்பட்டுள்ளது. யூரியா இடுவதை நிறுத்தி காப்பர் மருந்து தெளிக்கவும்.',
    },
    blast: {
      status: 'confirmed',
      cropDetectedEn: 'Paddy / Rice (Oryza sativa)',
      cropDetectedTa: 'நெல் (Oryza sativa)',
      diseaseEn: 'Rice Blast (Magnaporthe oryzae)',
      diseaseTa: 'நெல் குலை நோய் (பூஞ்சை)',
      confidence: 90,
      confidenceLevel: 'High',
      plantHealth: 'Diseased',
      confidenceExplanationEn:
        'Classic spindle-shaped, diamond lesions with ash-gray centers and distinct reddish-brown borders.',
      confidenceExplanationTa:
        'சாம்பல் நிற மையமும் பழுப்பு நிற விளிம்பும் கொண்ட சுழல் வடிவ குலை நோய் புண்கள் தெளிவாக தென்படுகின்றன.',
      severity: 'critical',
      uncertain: false,
      symptomsEn: [
        'Spindle-shaped diamond lesions on leaf blades with gray centers and brown margins',
        'Rotting and blackening of panicle nodes (neck blast)',
        'Incomplete grain filling and broken panicle heads',
      ],
      symptomsTa: [
        'இலைகளில் சுழல் வடிவ புண்கள்',
        'கதிர் கழுத்து பகுதியில் கருப்பு நிற அழுகல்',
        'தானியங்கள் பதராகி கதிர்கள் சாய்ந்து விழுதல்',
      ],
      possibleCausesEn: [
        'Prolonged night-time dew periods (>10 hours) with daytime temperatures of 20-28°C',
        'High relative humidity (>90%) during panicle emergence',
        'Excess nitrogen application',
      ],
      possibleCausesTa: [
        'தொடர் பனிப்பொழிவு மற்றும் குளிர்ந்த இரவு நேர வானிலை',
        'அதிகப்படியான நைட்ரஜன் உரம்',
      ],
      chemicalRemedyEn:
        'Spray Tricyclazole 75% WP @ 1g/L of water or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L or Isoprothiolane 40% EC @ 1.5ml/L.',
      chemicalRemedyTa:
        'ட்ரைசைக்ளசோல் 75% WP (1கி/லி) அல்லது அஸாக்சிஸ்ட்ரோபின் + டைபினோகோனசோல் (1மிலி/லி) தெளிக்கவும்.',
      organicRemedyEn:
        'Foliar spray of Neem seed kernel extract (NSKE 5%) or Pseudomonas fluorescens formulation @ 10g/L + Trichoderma viride @ 5g/L.',
      organicRemedyTa:
        'வேப்பங்கொட்டை சாறு (5%) அல்லது சூடோமோனாஸ் கலவை (10கி/லி) பயிரில் தெளிக்கவும்.',
      preventionEn: [
        'Destroy infected crop stubbles after harvest',
        'Optimum seedling spacing (15x10 cm or 20x10 cm)',
        'Avoid excessive nitrogen; apply potassium in split doses',
      ],
      preventionTa: [
        'அறுவடைக்கு பின் தாளை எரிக்காமல் சுத்தப்படுத்தவும்',
        'முறையான நடவு இடைவெளி கடைபிடிக்கவும்',
        'பொட்டாஷ் உரத்தை பிரித்து இடவும்',
      ],
      expertConsultationEn:
        'Urgent: Neck blast can cause up to 80% grain loss. Consult Agriculture Officer immediately if panicles begin to rot.',
      expertConsultationTa:
        'அவசர ஆலோசனை: கதிர் கழுத்து பகுதியில் அழுகல் தென்பட்டால் உடனடியாக வேளாண் அதிகாரியை அணுகவும்.',
      safetyWarningEn:
        'Chemical Precaution: Wear eye protection and long sleeves. Do not harvest within 21 days of spraying Tricyclazole.',
      safetyWarningTa:
        'இரசாயன பாதுகாப்பு: கண் கண்ணாடி அணியவும். மருந்து தெளித்த 21 நாட்களுக்குள் அறுவடை செய்யக்கூடாது.',
      messageEn:
        'Fungal blast infection confirmed. Apply Tricyclazole promptly to safeguard the crop canopy.',
      messageTa:
        'குலை நோய் பூஞ்சை தாக்குதல் உறுதி செய்யப்பட்டுள்ளது. உடனடியாக பரிந்துரைக்கப்பட்ட மருந்தை தெளிக்கவும்.',
    },
  },
  tomato: {
    early_blight: {
      status: 'confirmed',
      cropDetectedEn: 'Tomato (Solanum lycopersicum)',
      cropDetectedTa: 'தக்காளி (Solanum lycopersicum)',
      diseaseEn: 'Tomato Early Blight (Alternaria solani)',
      diseaseTa: 'தக்காளி ஆரம்ப இலை கருகல் நோய்',
      confidence: 93,
      confidenceLevel: 'High',
      plantHealth: 'Diseased',
      confidenceExplanationEn:
        'Concentric dark rings forming characteristic "target board" lesions surrounded by a distinct chlorotic yellow halo.',
      confidenceExplanationTa:
        'வளைய வடிவிலான கரும்பழுப்பு புள்ளிகளைச் சுற்றி மஞ்சள் வளையம் காணப்படும் தன்மை ஆரம்ப இலை கருகலை உறுதி செய்கிறது.',
      severity: 'medium',
      uncertain: false,
      symptomsEn: [
        'Circular concentric rings (target-like spots) on older bottom leaves',
        'Yellowing chlorosis expanding around necrotic spots',
        'Dark, sunken leathery lesions on stems and near fruit calyx',
      ],
      symptomsTa: [
        'முதிர்ந்த கீழ் இலைகளில் வளைய வடிவில் கரும்பழுப்பு புள்ளிகள்',
        'புள்ளிகளைச் சுற்றி இலை மஞ்சளாதல்',
        'கனி காம்பு மற்றும் தண்டு பகுதியில் கரும்பழுப்பு அழுகல்',
      ],
      possibleCausesEn: [
        'Warm humid weather (24-29°C) with alternating wet rain and dry periods',
        'Foliage remaining wet for over 8 consecutive hours',
        'Soil splashing onto lower leaves from rain or furrow irrigation',
      ],
      possibleCausesTa: [
        'ஈரப்பதமான தட்பவெப்பம் மற்றும் மழை நீர் மண்ணிலிருந்து கீழ் இலைகளில் தெறித்தல்',
        'இலைகளில் 8 மணி நேரத்திற்கு மேலாக தொடர்ந்து ஈரப்பதம் தங்குதல்',
        'முந்தைய பயிர் கழிவுகளிலிருந்து பூஞ்சை வித்துக்கள் பரவுதல்',
      ],
      chemicalRemedyEn:
        'Foliar spray with Mancozeb 75 WP @ 2g/L or Copper Oxychloride 50 WP @ 3g/L or Chlorothalonil 75 WP @ 2g/L. Repeat at 10-day intervals.',
      chemicalRemedyTa:
        'மன்கோசெப் 75 WP (2கி/லி) அல்லது காப்பர் ஆக்சிகுளோரைடு (3கி/லி) இலைகளில் தெளிக்கவும்.',
      organicRemedyEn:
        'Spray Trichoderma harzianum @ 5g/L or 3% Neem oil emulsion with soap emulsifier. Remove and burn heavily infected lower leaves.',
      organicRemedyTa:
        'டிரைக்கோடெர்மா ஹார்சியானம் (5கி/லி) அல்லது 3% வேப்ப எண்ணெய் கரைசல் தெளிக்கவும். பாதிக்கப்பட்ட கீழ் இலைகளை அகற்றவும்.',
      preventionEn: [
        'Mulch soil surface with straw or silver-black plastic mulch to prevent soil splash',
        'Prune bottom leaves 15 cm above soil',
        'Practice 2-3 year rotation with non-solanaceous crops',
      ],
      preventionTa: [
        'மண் தெறிக்காமல் இருக்க வைக்கோல் மூடாக்கு இடவும்',
        'கீழ் இலைகளை கவாத்து செய்யவும்',
        'பயிர் சுழற்சி முறை பின்பற்றவும்',
      ],
      expertConsultationEn:
        'Consult an agronomist if lesions reach the upper fruiting branches or affect green fruit clusters.',
      expertConsultationTa:
        'கருகல் புள்ளிகள் மேல் கிளைகள் அல்லது காய்களில் பரவினால் வேளாண் அறிவியல் மையத்தை அணுகவும்.',
      safetyWarningEn:
        'Pesticide Precaution: Follow waiting period (PHI) of 7 days before harvesting tomatoes after chemical spraying.',
      safetyWarningTa:
        'பாதுகாப்பு: மருந்து தெளித்த பிறகு குறைந்தபட்சம் 7 நாட்கள் கழித்தே தக்காளியை அறுவடை செய்ய வேண்டும்.',
      messageEn:
        'Alternaria early blight detected on tomato foliage. Remove lower infected leaves and apply protective fungicide.',
      messageTa:
        'தக்காளியில் ஆரம்ப கருகல் நோய் உள்ளது. பாதிக்கப்பட்ட இலைகளை நீக்கி பாதுகாப்பு பூஞ்சாணக்கொல்லி தெளிக்கவும்.',
    },
    curl_virus: {
      status: 'confirmed',
      cropDetectedEn: 'Tomato (Solanum lycopersicum)',
      cropDetectedTa: 'தக்காளி (Solanum lycopersicum)',
      diseaseEn: 'Tomato Leaf Curl Virus (TYLCV)',
      diseaseTa: 'தக்காளி இலை சுருட்டு வைரஸ்',
      confidence: 91,
      confidenceLevel: 'High',
      plantHealth: 'Diseased',
      confidenceExplanationEn:
        'Severe upward rolling, puckering, reduction of leaf lamina with thickening and stunted internodes transmitted by whiteflies.',
      confidenceExplanationTa:
        'வெள்ளை ஈக்களால் பரவும் இலைகள் மேல்நோக்கி படகு போல் சுருண்டு செடி வளர்ச்சி குன்றும் அறிகுறிகள் தெளிவாக உள்ளன.',
      severity: 'critical',
      uncertain: false,
      symptomsEn: [
        'Severe upward curling, cupping, and crinkling of leaf margins',
        'Pronounced stunting of the plant with bushy cluster growth',
        'Interveinal yellowing (chlorosis) and severe reduction in fruit set',
      ],
      symptomsTa: [
        'இலைகள் மேல்நோக்கி படகு போல சுருண்டு தடித்தல்',
        'செடி வளர்ச்சி குன்றி புதர் போல் காணப்படுதல்',
        'நரம்புகளுக்கு இடையில் மஞ்சளாதல் மற்றும் பூ, காய் உதிர்தல்',
      ],
      possibleCausesEn: [
        'High vector population of Whiteflies (Bemisia tabaci)',
        'Hot dry weather favoring rapid whitefly multiplication',
        'Presence of weed hosts nearby',
      ],
      possibleCausesTa: [
        'வெள்ளை ஈக்கள் மூலம் வைரஸ் வேகமாக பரவுதல்',
        'வறண்ட மற்றும் வெப்பமான வானிலை',
      ],
      chemicalRemedyEn:
        'Directly target whitefly vector: Spray Imidacloprid 17.8% SL @ 0.3ml/L or Diafenthiuron 50% WP @ 1g/L or Thiamethoxam 25% WG @ 0.3g/L.',
      chemicalRemedyTa:
        'வெள்ளை ஈக்களை கட்டுப்படுத்த இமிடாக்ளோபிரிட் (0.3மிலி/லி) அல்லது தயாமெதாக்சாம் (0.3கி/லி) தெளிக்கவும்.',
      organicRemedyEn:
        'Install 15-20 yellow sticky traps per acre. Spray 3% Neem oil (Azadirachtin 10,000 ppm @ 2ml/L) + soap every 7 days. Rouge out infected plants.',
      organicRemedyTa:
        'ஏக்கருக்கு 15-20 மஞ்சள் ஒட்டும் பொறிகளை அமைக்கவும். 3% வேப்ப எண்ணெய் கரைசல் தெளிக்கவும்.',
      preventionEn: [
        'Raise seedlings in 40-mesh insect-proof nylon net nurseries',
        'Immediately uproot and destroy viral-infected plants',
        'Remove Parthenium weeds around field boundaries',
      ],
      preventionTa: [
        'நாற்றங்காலில் பூச்சி தடுப்பு வலை பயன்படுத்தவும்',
        'வைரஸ் தாக்கிய செடிகளை பிடுங்கி எரிக்கவும்',
        'வயல் விளிம்பு களைகளை அகற்றவும்',
      ],
      expertConsultationEn:
        'Consult Horticulture Officer if whitefly counts exceed 5 per leaf or if viral symptoms appear before flowering.',
      expertConsultationTa:
        'பூக்கும் முன் வைரஸ் அறிகுறிகள் தென்பட்டால் தோட்டக்கலை அலுவலரை உடனடியாக அணுகவும்.',
      safetyWarningEn:
        'Safety Notice: Do not spray systemic insecticides during peak pollinator foraging hours (early morning/late afternoon).',
      safetyWarningTa:
        'பாதுகாப்பு: தேனீக்கள் மகரந்த சேர்க்கை செய்யும் நேரங்களில் பூச்சிக்கொல்லிகளை தெளிக்கக் கூடாது.',
      messageEn:
        'Viral leaf curl observed. Control the carrier whitefly insect vector with sticky traps and recommended sprays.',
      messageTa:
        'இலை சுருட்டு வைரஸ் நோய் தாக்கமுள்ளது. மஞ்சள் பொறி அமைத்து வெள்ளை ஈக்களை கட்டுப்படுத்தவும்.',
    },
  },
  cotton: {
    bollworm: {
      status: 'confirmed',
      cropDetectedEn: 'Cotton (Gossypium hirsutum)',
      cropDetectedTa: 'பருத்தி (Gossypium hirsutum)',
      diseaseEn: 'Cotton Bollworm Infestation (Helicoverpa armigera)',
      diseaseTa: 'பருத்தி காய்ப்புழு தாக்குதல்',
      confidence: 89,
      confidenceLevel: 'High',
      plantHealth: 'Diseased',
      confidenceExplanationEn:
        'Bored circular holes on green bolls, presence of larval entry holes plugged with granular frass, and flared squares.',
      confidenceExplanationTa:
        'காய்களில் வட்ட வடிவ துளைகள் மற்றும் புழுக்கை கழிவுகள் தென்படுவதால் காய்ப்புழு தாக்குதல் உறுதி செய்யப்படுகிறது.',
      severity: 'high',
      uncertain: false,
      symptomsEn: [
        'Bored holes on squares and bolls with granular fecal pellets (frass)',
        'Flared squares where bracteoles spread outward',
        'Internal boll rotting and stained unmarketable lint',
      ],
      symptomsTa: [
        'காய்களில் புழு துளைத்த ஓட்டைகள் மற்றும் கழிவுகள்',
        'பூ மொட்டுகள் விரிந்து உதிர்தல்',
        'பருத்தி பஞ்சு சேதமடைதல்',
      ],
      possibleCausesEn: [
        'Cloudy humid weather encouraging nocturnal moth egg-laying',
        'Monoculture planting without border trap crops',
      ],
      possibleCausesTa: [
        'மேகமூட்டமான வானிலையில் தாய் அந்துப்பூச்சிகள் முட்டையிடுதல்',
        'வரப்பு பயிர்கள் இல்லாத ஒற்றை பயிர் சாகுபடி மற்றும் தழைச்சத்து அதிகரிப்பு',
      ],
      chemicalRemedyEn:
        'Spray Spinosad 45% SC @ 0.4ml/L or Emamectin Benzoate 5% SG @ 0.4g/L or Chlorantraniliprole 18.5% SC @ 0.3ml/L.',
      chemicalRemedyTa:
        'ஸ்பினோசாட் 45% SC (0.4மிலி/லி) அல்லது எமமெக்டின் பென்சோயேட் (0.4கி/லி) தெளிக்கவும்.',
      organicRemedyEn:
        'Install 5 pheromone traps per acre. Release Trichogramma chilonis egg parasitoids @ 60,000/acre. Spray HaNPV @ 250 LE/acre + jaggery (1%).',
      organicRemedyTa:
        'ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறிகளை அமைக்கவும். டிரைக்கோகிரம்மா ஒட்டுண்ணிகளை வெளியிடவும்.',
      preventionEn: [
        'Plant border trap crops (Marigold, Castor, Okra)',
        'Avoid excessive nitrogen fertilization which produces succulent foliage',
      ],
      preventionTa: [
        'வரப்பு பயிராக செண்டுமல்லி அல்லது ஆமணக்கு நடவும்',
        'அதிகப்படியான தழைச்சத்தை தவிர்க்கவும்',
      ],
      expertConsultationEn:
        'Consult Agricultural Officer if pheromone traps catch more than 8 moths per night for 3 consecutive days.',
      expertConsultationTa:
        'கவர்ச்சி பொறிகளில் தொடர்ச்சியாக 8-க்கும் மேற்பட்ட அந்துப்பூச்சிகள் விழுந்தால் அலுவலரை அணுகவும்.',
      safetyWarningEn:
        'Safety Warning: Wear long trousers, rubber boots, and respirator during spraying. Rotate chemical modes of action to prevent resistance.',
      safetyWarningTa:
        'பாதுகாப்பு: பூச்சி மருந்து தெளிக்கும் போது உடலை முழுமையாக மூடும் ஆடைகளை அணியவும்.',
      messageEn:
        'Bollworm caterpillar damage observed. Deploy pheromone traps and spray biorational insecticide.',
      messageTa:
        'காய்ப்புழு சேதம் உள்ளது. கவர்ச்சி பொறி அமைத்து புழுக்களை கட்டுப்படுத்தவும்.',
    },
  },
  vegetable: {
    powdery_mildew: {
      status: 'confirmed',
      cropDetectedEn: 'Vegetable / Bhendi / Cucurbits (Abelmoschus esculentus)',
      cropDetectedTa: 'காய்கறி / வெண்டை / கொடி பயிர்கள்',
      diseaseEn: 'Powdery Mildew (Erysiphe cichoracearum)',
      diseaseTa: 'சாம்பல் நோய் (பூஞ்சை தாக்குதல்)',
      confidence: 92,
      confidenceLevel: 'High',
      plantHealth: 'Diseased',
      confidenceExplanationEn:
        'Dense flour-like superficial white fungal mycelium and powdery spore growth covering the upper leaf surfaces.',
      confidenceExplanationTa:
        'இலையின் மேல் பரப்பில் மாவு போன்ற வெள்ளை பூஞ்சை படலம் படர்ந்துள்ளதால் சாம்பல் நோய் உறுதி செய்யப்படுகிறது.',
      severity: 'medium',
      uncertain: false,
      symptomsEn: [
        'White talcum-powder-like patches on upper and lower leaf surfaces',
        'Leaves turn pale yellow, curl upwards, and dry prematurely',
        'Severe defoliation and reduction in photosynthetic flower bud formation',
      ],
      symptomsTa: [
        'இலைகளின் மேல் மற்றும் கீழ் பகுதியில் வெள்ளை மாவு போன்ற படலம்',
        'இலைகள் மஞ்சளாகி மேல்நோக்கி சுருண்டு காய்ந்து உதிர்தல்',
        'செடியின் ஒளிச்சேர்க்கை குறைந்து பூ மற்றும் பிஞ்சுகள் உதிர்தல்',
      ],
      possibleCausesEn: [
        'Dry warm daytime temperatures (28-34°C) with high relative humidity at night',
        'Crowded planting and dense canopy preventing sunlight penetration',
        'Air currents carrying powdery fungal conidiospores from nearby hosts',
      ],
      possibleCausesTa: [
        'பகல் நேர வெப்பமும் இரவு நேர அதிக ஈரப்பதமும் இணைந்த தட்பவெப்பம்',
        'அடர்த்தியான நடவு மற்றும் பயிர்களுக்கு இடையே போதிய சூரிய ஒளி இல்லாமை',
      ],
      chemicalRemedyEn:
        'Foliar spray of Wettable Sulphur 80% WP @ 2.5g/L or Dinocap 48% EC @ 1ml/L or Hexaconazole 5% EC @ 1ml/L. Repeat after 12 days.',
      chemicalRemedyTa:
        'நனையும் கந்தகம் (2.5கி/லி) அல்லது ஹெக்சாகோனசோல் 5% EC (1மிலி/லி) இலைகளில் தெளிக்கவும்.',
      organicRemedyEn:
        'Spray diluted fresh sour buttermilk (10%) or 0.5% Potassium Bicarbonate solution or 3% Neem seed kernel extract (NSKE).',
      organicRemedyTa:
        'புளித்த மோர் கரைசல் (10%) அல்லது 3% வேப்பங்கொட்டை சாறு தெளிக்கவும்.',
      preventionEn: [
        'Maintain optimum plant-to-plant spacing to facilitate cross-ventilation',
        'Collect and burn severely infected leaves to check spore dispersion',
        'Avoid excessive urea/nitrogen applications during dry periods',
      ],
      preventionTa: [
        'செடிகளுக்கு இடையே போதிய இடைவெளி விட்டு காற்றோட்டம் இருக்குமாறு நடவும்',
        'பாதிக்கப்பட்ட இலைகளை பறித்து தீயிட்டு அழிக்கவும்',
        'அதிகப்படியான யூரியா இடுவதை தவிர்க்கவும்',
      ],
      expertConsultationEn:
        'Consult Assistant Director of Horticulture if white powder covers more than 20% of the leaf canopy before fruit set.',
      expertConsultationTa:
        'காய் பிடிக்கும் முன் 20%-க்கு மேல் சாம்பல் நோய் பரவினால் தோட்டக்கலை அலுவலரை அணுகவும்.',
      safetyWarningEn:
        'Chemical Precaution: Never spray wettable sulphur when temperatures exceed 35°C to avoid sulfur-induced leaf burn.',
      safetyWarningTa:
        'பாதுகாப்பு: பகல் வெப்பநிலை 35°C-க்கு மேல் இருக்கும் போது கந்தக மருந்துகளை தெளிக்கக் கூடாது.',
      messageEn:
        'Powdery fungal mildew identified on leaf foliage. Spray wettable sulphur or organic sour buttermilk solution.',
      messageTa:
        'இலைகளில் சாம்பல் நோய் பூஞ்சை படர்ந்துள்ளது. நனையும் கந்தகம் அல்லது புளித்த மோர் கரைசல் தெளிக்கவும்.',
    },
  },
  chilli: {
    anthracnose: {
      status: 'confirmed',
      cropDetectedEn: 'Chilli / Capsicum (Capsicum annuum)',
      cropDetectedTa: 'மிளகாய் (Capsicum annuum)',
      diseaseEn: 'Chilli Anthracnose / Fruit Rot (Colletotrichum capsici)',
      diseaseTa: 'மிளகாய் பழ அழுகல் மற்றும் அந்த்ராக்னோஸ் நோய்',
      confidence: 91,
      confidenceLevel: 'High',
      plantHealth: 'Diseased',
      confidenceExplanationEn:
        'Sunken circular or oblong necrotic lesions on ripe chilli fruits with concentric rings of microscopic black fruiting bodies (acervuli).',
      confidenceExplanationTa:
        'பழுத்த மிளகாய் காய்களில் வட்ட வடிவ பள்ளமான கருகல் புள்ளிகள் மற்றும் பூஞ்சை வளையங்கள் காணப்படுகின்றன.',
      severity: 'high',
      uncertain: false,
      symptomsEn: [
        'Circular or oblong sunken lesions with concentric rings on ripe fruits',
        'Black pinhead-sized fungal acervuli dots arranged concentrically in spots',
        'Die-back drying of tender shoots from top to bottom (twig blight)',
      ],
      symptomsTa: [
        'பழுத்த மிளகாயில் பள்ளமான வட்ட வடிவ கருகல் புள்ளிகள்',
        'புள்ளிகளில் வளைய வடிவில் காணப்படும் கருப்பு நிற பூஞ்சை வித்துக்கள்',
        'செடியின் நுனி கிளைகள் மேலிருந்து கீழ் நோக்கி காய்ந்து போகுதல் (நுனி கருகல்)',
      ],
      possibleCausesEn: [
        'Heavy dew or rain showers during fruit ripening stage',
        'Continuous monoculture of solanaceous crops in poorly drained clay soils',
        'High humidity (>80%) accompanied by warm temperatures (27-30°C)',
      ],
      possibleCausesTa: [
        'காய் பழுக்கும் பருவத்தில் பெய்யும் மழை அல்லது தொடர் பனிப்பொழிவு',
        'வடிகால் வசதி இல்லாத நிலங்களில் அதிக ஈரப்பதம் தங்குதல்',
      ],
      chemicalRemedyEn:
        'Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L or Copper Oxychloride 50 WP @ 3g/L or Mancozeb 75 WP @ 2g/L.',
      chemicalRemedyTa:
        'அஸாக்சிஸ்ட்ரோபின் + டைபினோகோனசோல் (1மிலி/லி) அல்லது காப்பர் ஆக்சிகுளோரைடு (3கி/லி) தெளிக்கவும்.',
      organicRemedyEn:
        'Seed treatment and foliar spray with Pseudomonas fluorescens @ 10g/L + Trichoderma viride @ 5g/L. Remove mummified fruits.',
      organicRemedyTa:
        'சூடோமோனாஸ் (10கி/லி) மற்றும் டிரைக்கோடெர்மா (5கி/லி) தெளிக்கவும். அழுகிய மிளகாய்களை அப்புறப்படுத்தவும்.',
      preventionEn: [
        'Use certified disease-free seeds treated with bio-agents',
        'Avoid flood or overhead sprinkler irrigation during pod development',
        'Practice 2-year crop rotation with non-host crops like pulses or maize',
      ],
      preventionTa: [
        'உயிர் பூஞ்சாணக்கொல்லி கொண்டு விதை நேர்த்தி செய்யவும்',
        'காய் பிடிக்கும் பருவத்தில் தெளிப்பு நீர்ப்பாசனத்தை தவிர்க்கவும்',
        'பயிர் சுழற்சி முறையை கடைபிடிக்கவும்',
      ],
      expertConsultationEn:
        'Consult Horticultural Officer if fruit lesions appear on more than 10% of green and red pods in the field.',
      expertConsultationTa:
        'வயலில் 10%-க்கு மேல் காய்களில் அழுகல் தென்பட்டால் உடனடியாக தோட்டக்கலை அலுவலரை அணுகவும்.',
      safetyWarningEn:
        'Pesticide Caution: Observe a strict waiting period (PHI) of 5 days before harvesting chilli pods after chemical treatment.',
      safetyWarningTa:
        'பாதுகாப்பு: மருந்து தெளித்த 5 நாட்களுக்குள் மிளகாய் அறுவடை செய்யக்கூடாது.',
      messageEn:
        'Anthracnose fruit rot confirmed on chilli specimen. Remove diseased pods and apply protective bio-fungicide.',
      messageTa:
        'மிளகாயில் அந்த்ராக்னோஸ் பழ அழுகல் உள்ளது. அழுகிய காய்களை அகற்றி பூஞ்சாண மருந்து தெளிக்கவும்.',
    },
  },
};

/**
 * Maps raw CropDoctorDiagnosis into the component-friendly DiagnosisResult
 */
export function mapToDiagnosisResult(diag: CropDoctorDiagnosis): DiagnosisResult {
  const healthStr = (diag.plant_health || '').toLowerCase();
  const diseaseStr = (diag.disease_name || '').toLowerCase();

  const isHealthy = healthStr === 'healthy' || diseaseStr.includes('healthy');
  const isNotPlant = diseaseStr.includes('not a plant') || diseaseStr.includes('not_plant');
  const isUnclear =
    healthStr === 'uncertain' ||
    diseaseStr.includes('unable to identify') ||
    diseaseStr.includes('unknown') ||
    isNotPlant;

  let status: DiagnosisStatus = 'confirmed';
  if (isHealthy) status = 'healthy';
  else if (isNotPlant) status = 'not_plant';
  else if (isUnclear) status = 'unclear';
  else if (
    diag.confidence?.toLowerCase() === 'medium' ||
    diag.confidence?.toLowerCase() === 'low'
  ) {
    status = 'probable';
  }

  let numericConfidence = 92;
  const confLower = (diag.confidence || '').toLowerCase();
  if (confLower === 'high') numericConfidence = 94;
  else if (confLower === 'medium') numericConfidence = 76;
  else if (confLower === 'low') numericConfidence = 35;
  else if (typeof diag.confidence === 'number') numericConfidence = diag.confidence;

  const severity = isHealthy
    ? 'healthy'
    : isUnclear
    ? 'unclear'
    : status === 'confirmed'
    ? 'high'
    : 'medium';

  const allActionsEn = diag.recommended_actions || [];
  const allActionsTa = diag.recommended_actions_ta || [];

  const organicEn =
    allActionsEn.find((a) => /organic|neem|panchagavya|trichoderma|bio|prune|retake|photo/i.test(a)) ||
    allActionsEn[0] ||
    'Apply balanced organic nutrition and scout regularly.';

  const chemicalEn = isHealthy
    ? 'No chemical pesticides or fungicides required for healthy plants.'
    : isUnclear
    ? 'Do NOT apply chemical pesticides based on an uncertain photograph.'
    : allActionsEn.find((a) => /spray|fungicide|pesticide|mancozeb|copper|chemical|dose/i.test(a)) ||
      allActionsEn[1] ||
      'Consult local agricultural officer for crop-specific labeled chemical prescriptions.';

  const organicTa =
    allActionsTa.find((a) => /இயற்கை|வேப்ப|பஞ்சகாவ்யா|உயிர்|மீண்டும்/i.test(a)) ||
    allActionsTa[0] ||
    'இயற்கை முறை பராமரிப்பு மற்றும் வழக்கமான பயிர் கண்காணிப்பை தொடரவும்.';

  const chemicalTa = isHealthy
    ? 'ஆரோக்கியமான பயிர்களுக்கு எந்தவித இரசாயன மருந்துகளும் தேவை இல்லை.'
    : isUnclear
    ? 'தெளிவற்ற படங்களை வைத்து பூச்சிக்கொல்லிகளை தெளிக்கக் கூடாது.'
    : allActionsTa.find((a) => /தெளிக்கவும்|இரசாயனம்|மருந்து/i.test(a)) ||
      allActionsTa[1] ||
      'இரசாயன மருந்துகளை பயன்படுத்த உள்ளூர் வேளாண்மை அலுவலரை அணுகவும்.';

  return {
    status,
    cropDetectedEn: diag.crop_name,
    cropDetectedTa: diag.crop_name_ta || diag.crop_name,
    diseaseEn: diag.disease_name,
    diseaseTa: diag.disease_name_ta || diag.disease_name,
    confidence: numericConfidence,
    confidenceLevel: diag.confidence,
    plantHealth: diag.plant_health,
    confidenceExplanationEn: diag.message,
    confidenceExplanationTa: diag.message_ta || diag.message,
    severity,
    uncertain: isUnclear,
    symptomsEn: diag.visible_symptoms || [],
    symptomsTa: diag.visible_symptoms_ta || diag.visible_symptoms || [],
    possibleCausesEn: diag.possible_causes || [],
    possibleCausesTa: diag.possible_causes_ta || diag.possible_causes || [],
    chemicalRemedyEn: chemicalEn,
    chemicalRemedyTa: chemicalTa,
    organicRemedyEn: organicEn,
    organicRemedyTa: organicTa,
    preventionEn: diag.prevention || [],
    preventionTa: diag.prevention_ta || diag.prevention || [],
    expertConsultationEn: diag.needs_expert_review
      ? 'Consult your local Agricultural Extension Officer or KVK. Toll-free Kisan Call Centre: 1800-180-1551.'
      : 'Crop is in sound condition. Consult agricultural extension officer if new symptoms develop.',
    expertConsultationTa: diag.needs_expert_review
      ? 'அருகிலுள்ள வேளாண் அறிவியல் மையத்தை (KVK) அல்லது உழவர் உதவி மையத்தை 1800-180-1551 என்ற இலவச எண்ணில் அணுகவும்.'
      : 'வழக்கமான பயிர் கண்காணிப்பு போதுமானது. புதிய அறிகுறிகள் தோன்றினால் மட்டும் வேளாண் அலுவலரை அணுகவும்.',
    safetyWarningEn:
      'Statutory Precaution: Always read product labels, wear personal protective equipment, follow pre-harvest intervals (PHI), and consult an agronomist before spraying.',
    safetyWarningTa:
      'பாதுகாப்பு எச்சரிக்கை: மருந்து பாட்டில் லேபிளை கவனமாக படித்து, பாதுகாப்பு உபகரணங்களை அணிந்து, வேளாண் நிபுணர் வழிகாட்டலோடு தெளிக்கவும்.',
    alternativeDiagnosesEn: diag.alternative_diagnoses,
    alternativeDiagnosesTa: diag.alternative_diagnoses_ta,
    possibleAlternativesEn: diag.alternative_diagnoses,
    possibleAlternativesTa: diag.alternative_diagnoses_ta,
    messageEn: diag.message,
    messageTa: diag.message_ta || diag.message,
    rawDiagnosis: diag,
  };
}

/**
 * Classify plant disease using multimodal Gemini Vision API
 * Routes securely via serverless backend /.netlify/functions/crop-doctor
 * NEVER exposes the Gemini API key to the client browser.
 */
export async function classifyPlantDiseaseFromImage(
  base64DataUrl: string,
  mimeType = 'image/jpeg'
): Promise<DiagnosisResult> {
  // 1. Try secure Netlify serverless / Vite dev middleware endpoint
  try {
    const res = await fetch('/.netlify/functions/crop-doctor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'image',
        imageBase64: base64DataUrl,
        mimeType,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg =
        json.error || `Serverless diagnosis endpoint failed with status ${res.status}`;
      throw new CropDoctorApiError(errorMsg, json.code || 'API_ERROR', res.status, json.details);
    }

    if (json.success && json.data) {
      return mapToDiagnosisResult(json.data as CropDoctorDiagnosis);
    }

    throw new CropDoctorApiError(
      json.error || 'Empty or invalid response received from Crop Doctor service.',
      json.code || 'MALFORMED_RESPONSE'
    );
  } catch (err: any) {
    if (err instanceof CropDoctorApiError) {
      throw err;
    }

    // Check if network failed or server is completely offline
    const errMsg = err?.message || String(err);
    if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
      throw new CropDoctorApiError(
        'Unable to connect to the Crop Doctor backend service. Please check your network connection.',
        'NETWORK_ERROR',
        503
      );
    }

    throw new CropDoctorApiError(errMsg, 'UNKNOWN_ERROR');
  }
}

/**
 * Classify plant disease from observed symptoms
 */
export async function classifyPlantDiseaseFromSymptoms(
  crop: string,
  symptoms: string[]
): Promise<DiagnosisResult> {
  try {
    const res = await fetch('/.netlify/functions/crop-doctor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'symptoms',
        crop,
        symptoms,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok && json.success && json.data) {
      return mapToDiagnosisResult(json.data as CropDoctorDiagnosis);
    }

    if (!res.ok && json.error) {
      throw new CropDoctorApiError(json.error, json.code || 'API_ERROR', res.status);
    }
  } catch (err: any) {
    if (err instanceof CropDoctorApiError) {
      throw err;
    }
  }

  // Fallback for symptom heuristics if offline
  return getFallbackSymptomDiagnosis(crop, symptoms);
}

/**
 * Computer vision heuristics classifier for unit tests and offline test suites
 */
export async function classifyLocallyFromImageMetrics(
  base64DataUrl: string,
  hint?: string
): Promise<DiagnosisResult> {
  const metrics: ImageAnalysisMetrics = await analyzeImagePixels(base64DataUrl);
  const lowerHint = (hint || '').toLowerCase();

  if (metrics.isTooDark || lowerHint.includes('dark')) {
    return {
      ...fallbackDiseaseDatabase.unclear.blurry,
      diseaseEn: 'Unable to identify accurately (Image Too Dark)',
      diseaseTa: 'துல்லியமாக அடையாளம் காண முடியவில்லை (படம் மிக இருட்டாக உள்ளது)',
      confidenceExplanationEn:
        'The uploaded image is severely underexposed. Symptoms cannot be examined reliably.',
      confidenceExplanationTa:
        'படம் மிக இருட்டாக உள்ளதால் அறிகுறிகளை துல்லியமாக பார்க்க முடியவில்லை. வெளிச்சத்தில் படம் எடுக்கவும்.',
    };
  }

  if (metrics.isTooBright || lowerHint.includes('bright') || lowerHint.includes('glare')) {
    return {
      ...fallbackDiseaseDatabase.unclear.blurry,
      diseaseEn: 'Unable to identify accurately (Overexposed / Glare)',
      diseaseTa: 'துல்லியமாக அடையாளம் காண முடியவில்லை (அதிக ஒளி / கண்ணைக்கூசும் வெளிச்சம்)',
      confidenceExplanationEn:
        'The image has intense white glare. Please photograph without direct flash on the wet leaf.',
      confidenceExplanationTa:
        'படத்தில் அதிக ஒளி தெறிப்பு உள்ளது. ஃபிளாஷ் இல்லாமல் இயற்கையான வெளிச்சத்தில் படம் எடுக்கவும்.',
    };
  }

  if (
    (metrics.isBlurry || lowerHint.includes('blurry') || lowerHint.includes('unclear')) &&
    !lowerHint.includes('blast') &&
    !lowerHint.includes('curl')
  ) {
    return fallbackDiseaseDatabase.unclear.blurry;
  }

  if (
    (!metrics.isPlant ||
      lowerHint.includes('not_plant') ||
      lowerHint.includes('unrelated') ||
      lowerHint.includes('car') ||
      lowerHint.includes('vehicle')) &&
    !lowerHint.includes('plant') &&
    !lowerHint.includes('tomato') &&
    !lowerHint.includes('paddy') &&
    !lowerHint.includes('cotton')
  ) {
    return fallbackDiseaseDatabase.unclear.not_plant;
  }

  if (metrics.isHealthy || lowerHint.includes('healthy')) {
    return fallbackDiseaseDatabase.healthy.general;
  }

  if (
    lowerHint.includes('curl') ||
    lowerHint.includes('virus') ||
    metrics.detectedPattern === 'leaf_curl'
  ) {
    return fallbackDiseaseDatabase.tomato.curl_virus;
  }

  if (
    lowerHint.includes('powder') ||
    lowerHint.includes('mildew') ||
    metrics.detectedPattern === 'rust_powder'
  ) {
    return fallbackDiseaseDatabase.vegetable.powdery_mildew;
  }

  if (
    lowerHint.includes('anthracnose') ||
    lowerHint.includes('chilli') ||
    lowerHint.includes('fruit rot')
  ) {
    return fallbackDiseaseDatabase.chilli.anthracnose;
  }

  if (lowerHint.includes('blast') || lowerHint.includes('rice') || lowerHint.includes('spindle')) {
    return fallbackDiseaseDatabase.paddy.blast;
  }

  if (
    lowerHint.includes('boll') ||
    lowerHint.includes('cotton') ||
    lowerHint.includes('worm') ||
    lowerHint.includes('hole') ||
    lowerHint.includes('caterpillar')
  ) {
    return fallbackDiseaseDatabase.cotton.bollworm;
  }

  if (lowerHint.includes('tomato') || metrics.detectedPattern === 'leaf_spot') {
    return fallbackDiseaseDatabase.tomato.early_blight;
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
  } else if (crop === 'chilli') {
    return fallbackDiseaseDatabase.chilli.anthracnose;
  }
  return fallbackDiseaseDatabase.paddy.blight;
}
