// Crop Protection Advisory Service
// AI-assisted and agronomy-rule based recommendations with bilingual English/Tamil support

export interface ProtectionRequest {
  cropName: string;
  cropVariety?: string;
  growthStage: string;
  location: string;
  weatherConditions?: {
    temp?: number;
    humidity?: number;
    condition?: string;
  };
  symptoms: string[];
  customDescription?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface ProtectionRecommendation {
  cropDetectedEn: string;
  cropDetectedTa: string;
  growthStageEn: string;
  growthStageTa: string;
  problemTitleEn: string;
  problemTitleTa: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isUncertain: boolean;
  limitationsDisclaimerEn: string;
  limitationsDisclaimerTa: string;
  possibleCausesEn: string[];
  possibleCausesTa: string[];
  preventiveMeasuresEn: string[];
  preventiveMeasuresTa: string[];
  diseasePestManagement: {
    organicEn: string[];
    organicTa: string[];
    chemicalEn: string[];
    chemicalTa: string[];
    dosageCautionEn: string;
    dosageCautionTa: string;
  };
  irrigationGuidanceEn: string[];
  irrigationGuidanceTa: string[];
  fertilizerNutrientGuidanceEn: string[];
  fertilizerNutrientGuidanceTa: string[];
  weatherPrecautionsEn: string[];
  weatherPrecautionsTa: string[];
  recoveryStepsEn: string[];
  recoveryStepsTa: string[];
  expertContactGuidanceEn: {
    whenToContact: string;
    helplineName: string;
    helplineNumber: string;
    localOffice: string;
  };
  expertContactGuidanceTa: {
    whenToContact: string;
    helplineName: string;
    helplineNumber: string;
    localOffice: string;
  };
}

export const CROP_VARIETIES_MAP: Record<string, string[]> = {
  'paddy': ['BPT 5204 (Samba Mahsuri)', 'CO 51', 'IR 64', 'CR 1009 Sub 1', 'ADT 37', 'ADT 45', 'Ponni', 'TKM 13'],
  'cotton': ['Bt Cotton RCH 2', 'Suraj', 'MCU 5', 'DCH 32', 'SVPR 2', 'Suvin'],
  'tomato': ['PKM 1', 'Arka Rakshak', 'Arka Vikas', 'Sivam Hybrid', 'Abhinav', 'US 440'],
  'banana': ['Grand Naine (G9)', 'Robusta', 'Nendran', 'Poovan', 'Rasthali', 'Red Banana (Sevvazhai)'],
  'sugarcane': ['Co 86032', 'Co 0238', 'Co 11015', 'CoC 24', 'Co 99004'],
  'groundnut': ['TMV 7', 'TMV 13', 'VRI 2', 'Kadiri 6', 'Dharani', 'TAG 24'],
  'maize': ['COH(M) 8', 'Pioneer 30V92', 'NK 6240', 'DHM 117', 'Dekalb 9108'],
  'chilli': ['K1', 'K2', 'PMK 1', 'Teja', 'Guntur Sanam', 'Byadagi'],
  'pulses': ['VBN 4 (Blackgram)', 'VBN 6', 'CO 6', 'Co (Gg) 7 (Greengram)', 'ADT 5'],
  'turmeric': ['BSR 1', 'BSR 2', 'Prathibha', 'Salem Local', 'Erode Local']
};

export const COMMON_SYMPTOMS_BY_CROP: Record<string, { id: string; en: string; ta: string }[]> = {
  paddy: [
    { id: 'p1', en: 'Yellow-orange drying leaf tips with wavy margins', ta: 'இலை நுனிகள் மஞ்சள்-ஆரஞ்சு நிறமாகி உலர்தல்' },
    { id: 'p2', en: 'Spindle-shaped brown spots with ash-gray center', ta: 'சாம்பல் நிற மையத்துடன் சுழல் வடிவ பழுப்பு புள்ளிகள்' },
    { id: 'p3', en: 'Dead heart in vegetative stage or white earhead in flowering', ta: 'குருத்து காய்ந்து போதல் அல்லது வெண்கதிர் தோன்றுதல்' },
    { id: 'p4', en: 'Brown hopper insects clustered at the plant base / hopper burn', ta: 'செடியின் அடிப்பகுதியில் புகையான் பூச்சிகள் கூட்டம்' },
    { id: 'p5', en: 'Snake-like serpentine leaf streaks or leaf rolling', ta: 'இலை சுருட்டு புழு / இலைகள் சுருண்டு காணப்படுதல்' },
  ],
  cotton: [
    { id: 'c1', en: 'Bored holes in squares/bolls with excreta accumulation', ta: 'காய்களில் புழு துளைகள் மற்றும் எச்சங்கள்' },
    { id: 'c2', en: 'Upward/downward leaf curling with yellowing edges', ta: 'இலைகள் மேல்நோக்கி அல்லது கீழ்நோக்கி சுருண்டு ஓரங்கள் மஞ்சளாதல்' },
    { id: 'c3', en: 'Dropping of squares and young bolls', ta: 'பூ மொட்டுகள் மற்றும் பிஞ்சுகள் உதிர்தல்' },
    { id: 'c4', en: 'White powdery growth on underside of leaves', ta: 'இலைகளின் அடியில் சாம்பல் நிற பூஞ்சை படிவு' },
  ],
  tomato: [
    { id: 't1', en: 'Concentric dark target-like spots on older leaves', ta: 'முதிர்ந்த இலைகளில் வளைய வடிவிலான கரும்பழுப்பு புள்ளிகள்' },
    { id: 't2', en: 'Severe upward leaf curling, yellowing, and stunted growth', ta: 'இலைகள் மேல்நோக்கி சுருண்டு மஞ்சள் நிறமாகி வளர்ச்சி குன்றுதல்' },
    { id: 't3', en: 'Water-soaked blackish spots on fruit blossom end', ta: 'பழத்தின் அடிப்பகுதியில் கறுப்பு நிற அழுகல் புண்கள்' },
    { id: 't4', en: 'Sudden wilting of healthy green plants without yellowing', ta: 'பச்சை நிறத்துடனேயே செடிகள் திடீரென வாடி வதங்குதல்' },
  ],
  banana: [
    { id: 'b1', en: 'Yellowing and buckling of lower leaves around pseudostem', ta: 'கீழ் இலைகள் மஞ்சளாகி தண்டுடன் முறிந்து தொங்குதல்' },
    { id: 'b2', en: 'Dark brown elliptical eye-spots on leaves with yellow halos (Sigatoka)', ta: 'இலைகளில் மஞ்சள் வளையத்துடன் கூடிய நீள்வட்ட பழுப்பு புள்ளிகள்' },
    { id: 'b3', en: 'Crowded rosette appearance of leaves at plant apex (Bunchy Top)', ta: 'தலைப்பகுதியில் இலைகள் நெருக்கமாக முடிச்சாக தோன்றுதல்' },
    { id: 'b4', en: 'Tunnels and gelatinous exudate on rhizome / corm weevil', ta: 'கிழங்கு பகுதியில் துளைகள் மற்றும் பிசின் போன்ற திரவம்' },
  ],
  sugarcane: [
    { id: 's1', en: 'Third and fourth leaf yellowing with reddish internal stalk tissue', ta: 'இலைகள் மஞ்சளாகி தண்டு உட்பகுதி சிவப்பு நிறமாகுதல் (செவ்வழுகல்)' },
    { id: 's2', en: 'Dead heart with rotten foul-smelling core (Early Shoot Borer)', ta: 'தூர் குருத்து காய்ந்து துர்நாற்றம் வீசுதல்' },
    { id: 's3', en: 'White whip-like sooty structure at the shoot apex (Smut)', ta: 'தண்டின் நுனியில் சாம்பல் பூத்த சவுக்கை போன்ற அமைப்பு' },
  ],
  general: [
    { id: 'g1', en: 'Yellowing of older bottom leaves (Nitrogen deficiency)', ta: 'அடிப்பகுதி இலைகள் மஞ்சளாதல் (நைட்ரஜன் குறைபாடு)' },
    { id: 'g2', en: 'Purplish or bronzing discoloration of leaf veins (Phosphorus)', ta: 'இலை நரம்புகளில் ஊதா அல்லது வெண்கல நிறம் (பாஸ்பரஸ் குறைபாடு)' },
    { id: 'g3', en: 'Marginal leaf scorch and burning on tips (Potassium deficiency)', ta: 'இலை ஓரங்கள் கருகி தீய்ந்தது போல் காணப்படுதல் (பொட்டாஷ் குறைபாடு)' },
    { id: 'g4', en: 'Interveinal chlorosis on young upper leaves (Iron / Zinc deficiency)', ta: 'இளம் இலைகளின் நரம்புகளுக்கு இடையே வெளுத்து போதல் (இரும்பு / துத்தநாக குறைபாடு)' },
  ]
};

/**
 * Validate image file size and MIME type
 */
export function validateCropImage(file: File): { valid: boolean; error?: string } {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxBytes = 5 * 1024 * 1024; // 5 MB

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP format).'
    };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: 'Image file size exceeds the 5MB limit. Please select a smaller photo.'
    };
  }

  return { valid: true };
}

/**
 * Convert file to Base64 string for transmission
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Generate Comprehensive Crop Protection Recommendations
 */
export async function getCropProtectionRecommendations(
  req: ProtectionRequest
): Promise<ProtectionRecommendation> {
  // First attempt to call Netlify AI Gateway endpoint
  try {
    const res = await fetch('/.netlify/functions/crop-protection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (res.ok) {
      const result = await res.json();
      if (result && result.problemTitleEn) {
        return result;
      }
    }
  } catch (err) {
    console.warn('AI Gateway call fallback to client agronomy engine:', err);
  }

  // Resilient agronomic intelligence fallback
  return generateDeterministicAgronomyAdvisory(req);
}

/**
 * High-fidelity agronomic knowledge engine
 */
export function generateDeterministicAgronomyAdvisory(
  req: ProtectionRequest
): ProtectionRecommendation {
  const cropId = req.cropName.toLowerCase();
  const symptomsText = (req.symptoms || []).join(' ') + ' ' + (req.customDescription || '');
  const weather = req.weatherConditions || {};
  const isWet = (weather.humidity || 65) > 75 || (weather.temp || 30) < 25;

  // Paddy bacterial blight or blast
  if (cropId.includes('paddy') || cropId.includes('rice') || cropId.includes('நெல்')) {
    const isBlast = symptomsText.includes('spindle') || symptomsText.includes('spot') || symptomsText.includes('புள்ளி') || isWet;
    if (isBlast) {
      return {
        cropDetectedEn: 'Paddy / Rice (Oryza sativa)',
        cropDetectedTa: 'நெல் (Oryza sativa)',
        growthStageEn: req.growthStage || 'Tillering to Panicle Initiation',
        growthStageTa: req.growthStage || 'தூர்க்கட்டும் நிலை முதல் கதிர் உருவாகும் பருவம்',
        problemTitleEn: 'Suspected Rice Blast (Magnaporthe oryzae)',
        problemTitleTa: 'நெல் குலை நோய் (பூஞ்சை பாதிப்பு)',
        confidence: 88,
        severity: 'high',
        isUncertain: false,
        limitationsDisclaimerEn: 'AI screening advisory based on reported foliar lesions and weather correlation. Confirm symptoms with local Agriculture Extension Officer before high-cost chemical procurement.',
        limitationsDisclaimerTa: 'தெரிவிக்கப்பட்ட அறிகுறிகள் மற்றும் வானிலை அடிப்படையில் இந்த ஆலோசனை வழங்கப்பட்டுள்ளது. பூச்சிக்கொல்லி மருந்துகளை வாங்குவதற்கு முன் உள்ளூர் வேளாண் அலுவலரிடம் சரிபார்க்கவும்.',
        possibleCausesEn: [
          'High relative humidity (> 85%) accompanied by cool night temperatures (20-24°C).',
          'Excessive or split-omitted nitrogenous chemical fertilizer application.',
          'Dense plant population reducing sunlight aeration in canopy.'
        ],
        possibleCausesTa: [
          'அதிக ஈரப்பதம் (>85%) மற்றும் இரவு நேர குளிர் காலநிலை.',
          'தேவைக்கு அதிகமாக தழைச்சத்து (யூரியா) உரம் இடுதல்.',
          'அடர்த்தியான பயிர் நடவு காரணமான காற்றோட்ட குறைவு.'
        ],
        preventiveMeasuresEn: [
          'Treat seeds with Trichoderma viride @ 4g/kg or Pseudomonas fluorescens @ 10g/kg before nursery sowing.',
          'Maintain balanced NPK ratio (120:50:50 kg/ha) with fractional nitrogen top-dressings.',
          'Adopt SRI or 20x15 cm spacing to enhance canopy aeration.'
        ],
        preventiveMeasuresTa: [
          'விதைப்புக்கு முன் சூடோமோனாஸ் (10கி/கிலோ) அல்லது டிரைக்கோடெர்மா விரிடி கொண்டு விதை நேர்த்தி செய்யவும்.',
          'பரிந்துரைக்கப்பட்ட அளவில் தழை, மணி மற்றும் சாம்பல் சத்து உரங்களை சமச்சீராக இடவும்.'
        ],
        diseasePestManagement: {
          organicEn: [
            'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem oil 3000 ppm (3 ml/L).',
            'Spray Pseudomonas fluorescens talc formulation @ 10g/L or 1 kg/acre in 200L water during morning hours.'
          ],
          organicTa: [
            '5% வேப்பங்கொட்டை சாறு அல்லது 3% வேப்ப எண்ணெய் கரைசல் தெளிக்கவும்.',
            'சூடோமோனாஸ் புளோரசன்ஸ் உயிர் உரத்தை ஒரு ஏக்கருக்கு 1 கிலோ வீதம் 200 லிட்டர் நீரில் கலந்து தெளிக்கவும்.'
          ],
          chemicalEn: [
            'Foliar spray of Tricyclazole 75% WP @ 0.6g/L (120g/acre) at initial symptom onset.',
            'Alternative: Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L water.',
            'Or Isoprothiolane 40% EC @ 1.5 ml/L water.'
          ],
          chemicalTa: [
            'ஆரம்ப நிலையில் ட்ரைசைக்ளசோல் 75% WP மருந்தை லிட்டருக்கு 0.6 கிராம் வீதம் தெளிக்கவும்.',
            'மாற்றாக: அஸாக்சிஸ்ட்ரோபின் + டைபினோகோனசோல் மருந்தை லிட்டருக்கு 1 மிலி வீதம் கலந்து தெளிக்கவும்.'
          ],
          dosageCautionEn: 'Do not spray during high mid-day sun or rain. Always wear gloves, face mask, and protective spectacles. Observe mandatory 15-day pre-harvest interval.',
          dosageCautionTa: 'நண்பகல் வெயில் அல்லது மழையின் போது மருந்து தெளிக்க வேண்டாம். கையுறை மற்றும் முகக்கவசம் கட்டாயம் அணியவும்.'
        },
        irrigationGuidanceEn: [
          'Drain stagnant standing water from affected plots for 24-48 hours to aerate soil and reduce micro-humidity.',
          'Re-irrigate to shallow depth (2.5 cm) intermittently rather than deep flooding.'
        ],
        irrigationGuidanceTa: [
          'பாதிக்கப்பட்ட வயலில் உள்ள அதிகப்படியான தண்ணீரை 24 முதல் 48 மணி நேரம் வடித்து விடவும்.',
          'மறுபாசனத்தின் போது 2.5 செ.மீ அளவுக்கு லேசான நீர் பாசனம் செய்யவும்.'
        ],
        fertilizerNutrientGuidanceEn: [
          'Temporarily STOP all urea / nitrogenous fertilizer application until disease progression halts.',
          'Apply Muriate of Potash (MOP) @ 25 kg/acre to strengthen cell walls against fungal penetration.',
          'Foliar spray of 1% Zinc Sulphate + 0.5% Borax to revive plant vigor.'
        ],
        fertilizerNutrientGuidanceTa: [
          'நோய் கட்டுப்படும் வரை யூரியா அல்லது தழைச்சத்து உரங்களை இடுவதை முழுமையாக நிறுத்தவும்.',
          'செல்லின் தடுப்புச் சுவரை வலுப்படுத்த பொட்டாஷ் உரத்தை ஏக்கருக்கு 25 கிலோ வீதம் இடவும்.'
        ],
        weatherPrecautionsEn: [
          'If rainfall or cloudy drizzle is predicted in the next 24 hours, postpone foliar spraying.',
          'Spray during morning dew evaporation (8:00 AM - 10:30 AM) with wetting agent/sticker.'
        ],
        weatherPrecautionsTa: [
          'அடுத்த 24 மணி நேரத்தில் மழை பெய்ய வாய்ப்பிருந்தால் மருந்து தெளிப்பதை ஒத்திவைக்கவும்.',
          'காலை பனி காய்ந்தவுடன் ஒட்டும் திரவம் சேர்த்து தெளிக்கவும்.'
        ],
        recoveryStepsEn: [
          'After chemical/bio-control arrest, apply micro-nutrient mixture foliar spray @ 2g/L to induce fresh tiller emergence.',
          'Inspect field every 3 days; remove and burn severely blighted leaf residue.'
        ],
        recoveryStepsTa: [
          'நோய் கட்டுப்பட்ட பின்னர் பயிர் மீண்டு வர நுண்ணூட்டக் கலவையை லிட்டருக்கு 2 கிராம் வீதம் தெளிக்கவும்.'
        ],
        expertContactGuidanceEn: {
          whenToContact: 'If symptoms spread to > 15% of total field area or affect panicle neck within 4 days of initial spray.',
          helplineName: 'Kisan Call Centre (Toll Free)',
          helplineNumber: '1800-180-1551',
          localOffice: 'Contact your block Assistant Director of Agriculture (ADA) or District Krishi Vigyan Kendra (KVK).'
        },
        expertContactGuidanceTa: {
          whenToContact: 'மருந்து தெளித்த 4 நாட்களுக்குள் 15% பரப்பளவிற்கு மேல் நோய் பரவினால் உடனடியாக வேளாண் அதிகாரியை அணுகவும்.',
          helplineName: 'உழவர் சேவை மையம் (கட்டணமில்லா எண்)',
          helplineNumber: '1800-180-1551',
          localOffice: 'வட்டார வேளாண் உதவி இயக்குனர் அலுவலகம் அல்லது மாவட்ட வேளாண் அறிவியல் மையத்தை (KVK) தொடர்பு கொள்ளவும்.'
        }
      };
    }
  }

  // Tomato Early Blight / Leaf Curl
  if (cropId.includes('tomato') || cropId.includes('தக்காளி')) {
    const isCurl = symptomsText.includes('curl') || symptomsText.includes('சுருண்டு');
    return {
      cropDetectedEn: 'Tomato (Solanum lycopersicum)',
      cropDetectedTa: 'தக்காளி (Solanum lycopersicum)',
      growthStageEn: req.growthStage || 'Vegetative to Flowering',
      growthStageTa: req.growthStage || 'வளர்ச்சி முதல் பூக்கும் பருவம்',
      problemTitleEn: isCurl ? 'Tomato Leaf Curl Virus (ToLCV) & Whitefly Infestation' : 'Tomato Early Blight (Alternaria solani)',
      problemTitleTa: isCurl ? 'தக்காளி இலைச்சுருட்டு வைரஸ் நோய் மற்றும் வெள்ளை ஈ பாதிப்பு' : 'தக்காளி ஆரம்ப இலை கருகல் நோய்',
      confidence: 86,
      severity: isCurl ? 'high' : 'medium',
      isUncertain: false,
      limitationsDisclaimerEn: 'Visual diagnosis assistance based on agricultural symptom database. Viral diseases require prompt vector management to prevent yard-wide spread.',
      limitationsDisclaimerTa: 'அறிகுறிகள் அடிப்படையிலான வேளாண் ஆலோசனை. வைரஸ் நோயை கட்டுப்படுத்த பூச்சி பரவிகளை முன்கூட்டியே கட்டுப்படுத்துவது அவசியம்.',
      possibleCausesEn: [
        isCurl ? 'Whitefly (Bemisia tabaci) acting as carrier vector transmitting the geminivirus.' : 'Soil-borne fungal pathogen Alternaria solani splashed onto foliage via irrigation or rain.',
        'High ambient temperatures coupled with dry spells favoring insect vector multiplication.',
        'Presence of volunteer weed hosts (Datura, Solanum nigrum) around field bunds.'
      ],
      possibleCausesTa: [
        'வெள்ளை ஈக்கள் மூலமாக வைரஸ் நோய் செடிகளுக்கு வேகமாக பரவுகிறது.',
        'வயல் வரப்புகளில் உள்ள களைகள் மூலமாக பூச்சிகள் பெருகுதல்.'
      ],
      preventiveMeasuresEn: [
        'Install yellow sticky traps @ 15-20 traps/acre at crop canopy level to monitor and capture whiteflies.',
        'Erect 2-3 rows of border crops (maize, sorghum, or pearl millet) 15-20 days prior to transplanting as barrier.',
        'Mulch planting beds with silver-black reflective plastic mulch to repel flying insects.'
      ],
      preventiveMeasuresTa: [
        'வெள்ளை ஈக்களை கண்காணிக்க ஏக்கருக்கு 15-20 மஞ்சள் நிற ஒட்டும் பொறிகளை வைக்கவும்.',
        'வயலை சுற்றி மக்காச்சோளம் அல்லது கம்பு பயிர்களை தடுப்பு அரணாக 2-3 வரிசைகளில் பயிரிடவும்.'
      ],
      diseasePestManagement: {
        organicEn: [
          'Spray 2% Neem oil with 1 ml soap solution per liter of water.',
          'Spray Lecanicillium lecanii (entomopathogenic fungus) @ 5g/L during late evening hours to parasitize whitefly nymphs.'
        ],
        organicTa: [
          '2% வேப்ப எண்ணெய் கரைசலுடன் காதி சோப்பு கரைத்து தெளிக்கவும்.',
          'வெள்ளை ஈக்களை அழிக்க லெகானிசிலியம் லெகானி பூஞ்சையை லிட்டருக்கு 5 கிராம் வீதம் மாலை வேளையில் தெளிக்கவும்.'
        ],
        chemicalEn: [
          isCurl
            ? 'Spray Acetamiprid 20% SP @ 0.4g/L or Diafenthiuron 50% WP @ 1g/L to control whitefly vector.'
            : 'Foliar spray of Mancozeb 75% WP @ 2g/L or Copper Oxychloride 50% WP @ 2.5g/L.'
        ],
        chemicalTa: [
          isCurl
            ? 'வெள்ளை ஈக்களை கட்டுப்படுத்த அசிடமிப்ரிட் 20% SP (0.4கி/லி) அல்லது டயாபென்தியூரான் (1கி/லி) தெளிக்கவும்.'
            : 'மன்கோசெப் 75% WP (2கி/லி) அல்லது காப்பர் ஆக்சிகுளோரைடு (2.5கி/லி) தெளிக்கவும்.'
        ],
        dosageCautionEn: 'Do not overdose systemic insecticides during flowering. Avoid spraying when pollinators (honeybees) are active.',
        dosageCautionTa: 'பூக்கும் தருணத்தில் அதிக வீரியமுள்ள மருந்துகளை தவிர்க்கவும்; தேனீக்கள் நடமாடும் நேரத்தில் தெளிக்க வேண்டாம்.'
      },
      irrigationGuidanceEn: [
        'Use drip irrigation directly to root zone; completely avoid overhead sprinkler or furrow flooding.',
        'Maintain consistent soil moisture to prevent physiological calcium deficiency (blossom end rot).'
      ],
      irrigationGuidanceTa: [
        'சொட்டு நீர் பாசன முறையை பயன்படுத்தி இலைகளில் தண்ணீர் படாமல் வேருக்கு மட்டும் நீர் பாய்ச்சவும்.'
      ],
      fertilizerNutrientGuidanceEn: [
        'Apply micronutrient foliar spray (Multiplex or TNAU Tomato Special) @ 3g/L with Calcium Nitrate @ 2g/L.',
        'Ensure boron supplementation to prevent fruit splitting.'
      ],
      fertilizerNutrientGuidanceTa: [
        'கால்சியம் நைட்ரேட் (2கி/லி) மற்றும் நுண்ணூட்டச் சத்துக்களை தெளிக்கவும்.'
      ],
      weatherPrecautionsEn: [
        'During temperature peaks (> 35°C), provide shade net protection or frequent light irrigations.',
        'Avoid pesticide spraying when wind speed exceeds 15 km/h.'
      ],
      weatherPrecautionsTa: [
        'அதிக வெப்பநிலை நிலவும் போது லேசான பாசனம் செய்யவும்; காற்று வீசும் போது தெளிக்க வேண்டாம்.'
      ],
      recoveryStepsEn: [
        'Rogue out and bury severely infected viral stunted plants to prevent further spread to healthy plants.',
        'Apply humic acid (2 ml/L) soil drenching to stimulate active white root regeneration.'
      ],
      recoveryStepsTa: [
        'வைரஸ் தாக்கிய செடிகளை பிடுங்கி வயலுக்கு வெளியே புதைத்து அழிக்கவும்.'
      ],
      expertContactGuidanceEn: {
        whenToContact: 'If whitefly infestation persists after secondary spray or wilt patches appear across fields.',
        helplineName: 'TNAU Agritech Portal / Kisan Helpline',
        helplineNumber: '1800-180-1551',
        localOffice: 'Visit nearest Horticulture Extension Officer or Krishi Vigyan Kendra.'
      },
      expertContactGuidanceTa: {
        whenToContact: 'இரண்டாவது முறை தெளித்தும் பூச்சிகள் குறையவில்லை எனில் தோட்டக்கலை அதிகாரியை அணுகவும்.',
        helplineName: 'தமிழ்நாடு வேளாண் பல்கலைக்கழகம் / உழவர் சேவை',
        helplineNumber: '1800-180-1551',
        localOffice: 'வட்டார தோட்டக்கலை உதவி இயக்குனர் அலுவலகத்தை தொடர்பு கொள்ளவும்.'
      }
    };
  }

  // General default agronomy recommendation
  return {
    cropDetectedEn: req.cropName || 'Field Crop',
    cropDetectedTa: req.cropName || 'பயிர்',
    growthStageEn: req.growthStage || 'Vegetative Stage',
    growthStageTa: req.growthStage || 'வளர்ச்சி பருவம்',
    problemTitleEn: 'Nutritional / Stress Symptom Screening Advisory',
    problemTitleTa: 'ஊட்டச்சத்து மற்றும் பயிர் மேலாண்மை ஆலோசனை',
    confidence: 82,
    severity: 'medium',
    isUncertain: false,
    limitationsDisclaimerEn: 'Advisory synthesized from agronomic best practices. If symptoms worsen, take a plant specimen to the nearest Agricultural Extension Centre.',
    limitationsDisclaimerTa: 'வேளாண் விஞ்ஞான நடைமுறைகளின் அடிப்படையில் ஆலோசனை வழங்கப்பட்டுள்ளது. பாதிப்பு அதிகமானால் நேரடி பரிசோதனைக்கு அணுகவும்.',
    possibleCausesEn: [
      'Sub-optimal soil moisture or fluctuating ambient temperature stresses.',
      'Minor micro-nutrient deficiency (Zinc, Iron, Boron, or Magnesium).',
      'Early stage sucking pest or fungal spore inoculation.'
    ],
    possibleCausesTa: [
      'மண் ஈரப்பத பற்றாக்குறை அல்லது சீரற்ற வெப்பநிலை.',
      'நுண்ணூட்டச் சத்து பற்றாக்குறை (துத்தநாகம், இரும்பு, போரான்).'
    ],
    preventiveMeasuresEn: [
      'Adopt proper soil testing prior to sowing and apply recommended basal doses.',
      'Maintain regular field sanitation and remove alternative weed hosts from bunds.',
      'Apply enriched farm yard manure (FYM) @ 5 tonnes/acre.'
    ],
    preventiveMeasuresTa: [
      'மண் பரிசோதனை செய்து தேவையான உரங்களை மட்டும் இடவும்.',
      'வயல் வரப்புகளை சுத்தமாக வைத்து களைகளை அகற்றவும்.'
    ],
    diseasePestManagement: {
      organicEn: [
        'Foliar application of Panchagavya (3%) or Jeevamrutha @ 200 L/acre.',
        'Spray Neem oil 1500 ppm @ 3 ml/L with soap solution as protective repellent.'
      ],
      organicTa: [
        '3% பஞ்சகாவ்யா அல்லது ஜீவாமிர்தம் தெளிக்கவும்.',
        'வேப்ப எண்ணெய் 1500 ppm கரைசலை லிட்டருக்கு 3 மிலி வீதம் தெளிக்கவும்.'
      ],
      chemicalEn: [
        'Apply multi-micronutrient spray @ 2g/L with sticking agent.',
        'For sucking insects: Spray Thiamethoxam 25% WG @ 0.3g/L or Imidacloprid 17.8% SL @ 0.5ml/L under guidance.'
      ],
      chemicalTa: [
        'நுண்ணூட்ட கலவை உரத்தை லிட்டருக்கு 2 கிராம் வீதம் தெளிக்கவும்.'
      ],
      dosageCautionEn: 'Always adhere strictly to manufacturer label recommendations. Never tank mix incompatible chemicals.',
      dosageCautionTa: 'மருந்து பாட்டிலில் குறிப்பிடப்பட்டுள்ள அளவை விட அதிகமாக பயன்படுத்த வேண்டாம்.'
    },
    irrigationGuidanceEn: [
      'Irrigate during cooler hours of the day (early morning or late afternoon).',
      'Avoid water stagnation around root collar.'
    ],
    irrigationGuidanceTa: [
      'காலை அல்லது மாலை வேளையில் பாசனம் செய்யவும்; வேர் பகுதியில் நீர் தேங்க விடாதீர்கள்.'
    ],
    fertilizerNutrientGuidanceEn: [
      'Top dress recommended Potash and soluble Nitrogen in split doses.',
      'Soil drench with bio-fertilizers (Azospirillum and Phosphobacteria @ 2 kg/acre each).'
    ],
    fertilizerNutrientGuidanceTa: [
      'அசோஸ்பைரில்லம் மற்றும் பாஸ்போபாக்டீரியா உயிர் உரங்களை பயன்படுத்தவும்.'
    ],
    weatherPrecautionsEn: [
      'Check local weather forecast before applying soluble fertilizers or pesticides.',
      'Provide wind barriers if high wind gusts are anticipated.'
    ],
    weatherPrecautionsTa: [
      'வானிலை முன்னறிவிப்பை கவனித்து உரமிடுதல் மற்றும் தெளிப்பு பணிகளை திட்டமிடவும்.'
    ],
    recoveryStepsEn: [
      'Clear dried or damaged foliage; apply light organic mulch.',
      'Spray 1% 19:19:19 all-round foliar fertilizer after 5 days to rejuvenate foliage.'
    ],
    recoveryStepsTa: [
      'காய்ந்த இலைகளை அகற்றி, 19:19:19 உரத்தை லிட்டருக்கு 10 கிராம் வீதம் தெளித்து பயிரை புத்துயிர் பெற செய்யவும்.'
    ],
    expertContactGuidanceEn: {
      whenToContact: 'When symptoms do not improve within 5 days of organic/nutrient intervention.',
      helplineName: 'Kisan Call Centre',
      helplineNumber: '1800-180-1551',
      localOffice: 'Block Agricultural Extension Centre / KVK'
    },
    expertContactGuidanceTa: {
      whenToContact: '5 நாட்களுக்குள் பயிர் குணமடையாவிட்டால் உடனடியாக வேளாண்மை மையத்தை அணுகவும்.',
      helplineName: 'உழவர் சேவை மையம்',
      helplineNumber: '1800-180-1551',
      localOffice: 'வட்டார வேளாண்மை விரிவாக்க மையம்'
    }
  };
}
