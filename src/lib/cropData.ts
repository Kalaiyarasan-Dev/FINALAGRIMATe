// Comprehensive Crop Database with detailed farming information

export interface CropTimeline {
  day: number;
  phase: string;
  phaseEn: string;
  phaseTa: string;
  tasks: {
    en: string;
    ta: string;
  }[];
  irrigation: {
    required: boolean;
    frequency: string;
    frequencyTa: string;
  };
  medicine?: {
    name: string;
    nameTa: string;
    dosage: string;
    purpose: string;
    purposeTa: string;
  };
}

export interface DetailedCrop {
  key: string;
  nameEn: string;
  nameTa: string;
  matchScore: number;
  waterNeed: 'low' | 'medium' | 'high';
  totalDays: number;
  expectedYield: string;
  pricePerQuintal: number;
  bestSeason: string;
  bestSeasonTa: string;
  timeline: CropTimeline[];
}

// Paddy/Rice detailed timeline
const paddyTimeline: CropTimeline[] = [
  { day: 1, phase: 'nursery', phaseEn: 'Nursery Preparation', phaseTa: 'நாற்றங்கால் தயாரிப்பு',
    tasks: [{ en: 'Prepare seedbed, soak seeds for 24 hours', ta: 'விதை படுக்கை தயார், விதைகளை 24 மணி நேரம் ஊறவைக்கவும்' }],
    irrigation: { required: true, frequency: 'Keep moist', frequencyTa: 'ஈரமாக வைக்கவும்' }
  },
  { day: 7, phase: 'nursery', phaseEn: 'Seed Sowing', phaseTa: 'விதை விதைத்தல்',
    tasks: [{ en: 'Sow pre-germinated seeds in nursery', ta: 'முளைத்த விதைகளை நாற்றங்காலில் விதைக்கவும்' }],
    irrigation: { required: true, frequency: 'Daily light watering', frequencyTa: 'தினசரி லேசான நீர்ப்பாசனம்' },
    medicine: { name: 'Carbendazim', nameTa: 'கார்பன்டசிம்', dosage: '2g/kg seed', purpose: 'Seed treatment for fungal diseases', purposeTa: 'பூஞ்சை நோய்களுக்கு விதை நேர்த்தி' }
  },
  { day: 21, phase: 'transplanting', phaseEn: 'Transplanting', phaseTa: 'நாற்று நடவு',
    tasks: [
      { en: 'Pull 21-day old seedlings', ta: '21 நாள் வயது நாற்றுகளை பிடுங்கவும்' },
      { en: 'Transplant 2-3 seedlings per hill', ta: 'ஒரு குழிக்கு 2-3 நாற்றுகள் நடவும்' }
    ],
    irrigation: { required: true, frequency: '5cm standing water', frequencyTa: '5 செ.மீ தேங்கு நீர்' }
  },
  { day: 25, phase: 'vegetative', phaseEn: 'First Weeding', phaseTa: 'முதல் களை எடுத்தல்',
    tasks: [{ en: 'Manual or mechanical weeding', ta: 'கை அல்லது இயந்திர களை அகற்றல்' }],
    irrigation: { required: true, frequency: '5cm standing water', frequencyTa: '5 செ.மீ தேங்கு நீர்' },
    medicine: { name: 'Butachlor', nameTa: 'புட்டாக்ளோர்', dosage: '1.5kg/acre', purpose: 'Pre-emergence herbicide', purposeTa: 'முளைப்பதற்கு முன் களைக்கொல்லி' }
  },
  { day: 30, phase: 'vegetative', phaseEn: 'First Fertilizer', phaseTa: 'முதல் உரமிடுதல்',
    tasks: [
      { en: 'Apply Urea 45kg/acre', ta: 'யூரியா 45 கிலோ/ஏக்கர் இடவும்' },
      { en: 'Apply DAP 25kg/acre', ta: 'டிஏபி 25 கிலோ/ஏக்கர் இடவும்' }
    ],
    irrigation: { required: true, frequency: '5-7cm standing water', frequencyTa: '5-7 செ.மீ தேங்கு நீர்' }
  },
  { day: 45, phase: 'vegetative', phaseEn: 'Second Weeding + Fertilizer', phaseTa: 'இரண்டாம் களை + உரம்',
    tasks: [
      { en: 'Second weeding', ta: 'இரண்டாவது களை எடுத்தல்' },
      { en: 'Apply Urea 30kg/acre', ta: 'யூரியா 30 கிலோ/ஏக்கர் இடவும்' }
    ],
    irrigation: { required: true, frequency: '5-7cm standing water', frequencyTa: '5-7 செ.மீ தேங்கு நீர்' },
    medicine: { name: 'Chlorpyrifos', nameTa: 'குளோர்பைரிபாஸ்', dosage: '1.5L/acre', purpose: 'Stem borer control', purposeTa: 'தண்டு துளைப்பான் கட்டுப்பாடு' }
  },
  { day: 55, phase: 'vegetative', phaseEn: 'Pest Monitoring', phaseTa: 'பூச்சி கண்காணிப்பு',
    tasks: [
      { en: 'Check for BPH, leaf folder', ta: 'பழுப்பு புறத்தத்தி, இலை சுருட்டுப்புழு சோதனை' },
      { en: 'Install light traps', ta: 'ஒளி பொறி அமைக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Alternate wetting-drying', frequencyTa: 'மாற்று ஈரம்-உலர்த்தல்' },
    medicine: { name: 'Imidacloprid', nameTa: 'இமிடாக்ளோபிரிட்', dosage: '100ml/acre', purpose: 'BPH control', purposeTa: 'பழுப்பு புறத்தத்தி கட்டுப்பாடு' }
  },
  { day: 65, phase: 'reproductive', phaseEn: 'Panicle Initiation', phaseTa: 'கதிர் உருவாக்கம்',
    tasks: [
      { en: 'Apply Potash 20kg/acre', ta: 'பொட்டாஷ் 20 கிலோ/ஏக்கர் இடவும்' },
      { en: 'Micronutrient spray (Zinc)', ta: 'நுண்ணூட்ட தெளிப்பு (துத்தநாகம்)' }
    ],
    irrigation: { required: true, frequency: '5cm standing water', frequencyTa: '5 செ.மீ தேங்கு நீர்' }
  },
  { day: 75, phase: 'reproductive', phaseEn: 'Flowering', phaseTa: 'பூப்பூத்தல்',
    tasks: [{ en: 'Maintain water level, avoid spraying', ta: 'நீர் மட்டத்தை பராமரிக்கவும், தெளிப்பு தவிர்க்கவும்' }],
    irrigation: { required: true, frequency: '5cm standing water continuously', frequencyTa: 'தொடர்ந்து 5 செ.மீ தேங்கு நீர்' },
    medicine: { name: 'Propiconazole', nameTa: 'புரோப்பிகோனசோல்', dosage: '200ml/acre', purpose: 'Blast disease prevention', purposeTa: 'கருகல் நோய் தடுப்பு' }
  },
  { day: 90, phase: 'ripening', phaseEn: 'Grain Filling', phaseTa: 'தானிய நிரப்புதல்',
    tasks: [
      { en: 'Bird scaring', ta: 'பறவை விரட்டுதல்' },
      { en: 'Monitor grain filling', ta: 'தானிய நிரப்புதலை கண்காணிக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Reduce water gradually', frequencyTa: 'படிப்படியாக நீர் குறைக்கவும்' }
  },
  { day: 105, phase: 'ripening', phaseEn: 'Pre-Harvest', phaseTa: 'அறுவடைக்கு முன்',
    tasks: [
      { en: 'Stop irrigation', ta: 'நீர்ப்பாசனம் நிறுத்தவும்' },
      { en: 'Check grain maturity', ta: 'தானிய முதிர்ச்சி சோதனை' }
    ],
    irrigation: { required: false, frequency: 'Drain field', frequencyTa: 'வயலை வடிகட்டவும்' }
  },
  { day: 120, phase: 'harvest', phaseEn: 'Harvest', phaseTa: 'அறுவடை',
    tasks: [
      { en: 'Harvest at 20% moisture', ta: '20% ஈரப்பதத்தில் அறுவடை' },
      { en: 'Thresh and dry immediately', ta: 'உடனடியாக அடித்து உலர்த்தவும்' }
    ],
    irrigation: { required: false, frequency: 'Field should be dry', frequencyTa: 'வயல் உலர்ந்திருக்க வேண்டும்' }
  }
];

// Cotton detailed timeline
const cottonTimeline: CropTimeline[] = [
  { day: 1, phase: 'preparation', phaseEn: 'Field Preparation', phaseTa: 'நிலம் தயாரிப்பு',
    tasks: [
      { en: 'Deep ploughing 2-3 times', ta: '2-3 முறை ஆழ உழவு' },
      { en: 'Apply FYM 5 tonnes/acre', ta: 'தொழுவுரம் 5 டன்/ஏக்கர் இடவும்' }
    ],
    irrigation: { required: false, frequency: 'None', frequencyTa: 'இல்லை' }
  },
  { day: 7, phase: 'sowing', phaseEn: 'Sowing', phaseTa: 'விதைப்பு',
    tasks: [
      { en: 'Dibble seeds 3-4 per hill', ta: 'ஒரு குழிக்கு 3-4 விதைகள்' },
      { en: 'Spacing: 90cm x 60cm', ta: 'இடைவெளி: 90 செ.மீ x 60 செ.மீ' }
    ],
    irrigation: { required: true, frequency: 'Light irrigation after sowing', frequencyTa: 'விதைப்பு பின் லேசான நீர்ப்பாசனம்' },
    medicine: { name: 'Imidacloprid', nameTa: 'இமிடாக்ளோபிரிட்', dosage: '5ml/kg seed', purpose: 'Seed treatment for sucking pests', purposeTa: 'உறிஞ்சும் பூச்சிகளுக்கு விதை நேர்த்தி' }
  },
  { day: 15, phase: 'germination', phaseEn: 'Thinning', phaseTa: 'இழைத்தல்',
    tasks: [{ en: 'Retain 2 healthy plants per hill', ta: 'ஒரு குழிக்கு 2 ஆரோக்கியமான செடிகளை வைக்கவும்' }],
    irrigation: { required: true, frequency: 'Every 7-10 days', frequencyTa: 'ஒவ்வொரு 7-10 நாட்களுக்கும்' }
  },
  { day: 25, phase: 'vegetative', phaseEn: 'First Weeding + Fertilizer', phaseTa: 'முதல் களை + உரம்',
    tasks: [
      { en: 'Interculture operation', ta: 'இடைப்பண்படுத்தல்' },
      { en: 'Apply Urea 30kg/acre', ta: 'யூரியா 30 கிலோ/ஏக்கர்' },
      { en: 'Apply SSP 50kg/acre', ta: 'எஸ்எஸ்பி 50 கிலோ/ஏக்கர்' }
    ],
    irrigation: { required: true, frequency: 'Every 10 days', frequencyTa: 'ஒவ்வொரு 10 நாட்களுக்கும்' }
  },
  { day: 40, phase: 'vegetative', phaseEn: 'Second Weeding', phaseTa: 'இரண்டாம் களை',
    tasks: [
      { en: 'Weeding and earthing up', ta: 'களை எடுத்தல் மற்றும் மண் அணைத்தல்' },
      { en: 'Install pheromone traps', ta: 'பெரோமோன் பொறி அமைக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 10-12 days', frequencyTa: 'ஒவ்வொரு 10-12 நாட்களுக்கும்' },
    medicine: { name: 'Neem oil', nameTa: 'வேப்ப எண்ணெய்', dosage: '3ml/L', purpose: 'Jassid control', purposeTa: 'இலைப்பேன் கட்டுப்பாடு' }
  },
  { day: 55, phase: 'vegetative', phaseEn: 'Third Fertilizer', phaseTa: 'மூன்றாம் உரமிடுதல்',
    tasks: [
      { en: 'Apply Urea 20kg/acre', ta: 'யூரியா 20 கிலோ/ஏக்கர்' },
      { en: 'Apply MOP 15kg/acre', ta: 'எம்ஓபி 15 கிலோ/ஏக்கர்' }
    ],
    irrigation: { required: true, frequency: 'Every 10-12 days', frequencyTa: 'ஒவ்வொரு 10-12 நாட்களுக்கும்' }
  },
  { day: 70, phase: 'squaring', phaseEn: 'Square Formation', phaseTa: 'சதுர உருவாக்கம்',
    tasks: [
      { en: 'Monitor for bollworms', ta: 'காய்ப்புழுக்களை கண்காணிக்கவும்' },
      { en: 'Remove affected squares', ta: 'பாதிக்கப்பட்ட சதுரங்களை அகற்றவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' },
    medicine: { name: 'Spinosad', nameTa: 'ஸ்பினோசாட்', dosage: '75ml/acre', purpose: 'Bollworm control', purposeTa: 'காய்ப்புழு கட்டுப்பாடு' }
  },
  { day: 90, phase: 'flowering', phaseEn: 'Flowering', phaseTa: 'பூப்பூத்தல்',
    tasks: [
      { en: 'Spray micronutrients', ta: 'நுண்ணூட்டம் தெளிக்கவும்' },
      { en: 'Continue pest monitoring', ta: 'பூச்சி கண்காணிப்பு தொடரவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 7-8 days (critical)', frequencyTa: 'ஒவ்வொரு 7-8 நாட்களுக்கும் (முக்கியம்)' },
    medicine: { name: 'Emamectin benzoate', nameTa: 'எமமெக்டின் பென்சோயேட்', dosage: '80g/acre', purpose: 'American bollworm', purposeTa: 'அமெரிக்க காய்ப்புழு' }
  },
  { day: 110, phase: 'boll', phaseEn: 'Boll Development', phaseTa: 'காய் வளர்ச்சி',
    tasks: [
      { en: 'Protect bolls from pests', ta: 'காய்களை பூச்சிகளிடமிருந்து பாதுகாக்கவும்' },
      { en: 'Apply foliar Potash', ta: 'இலை வழி பொட்டாஷ் தெளிக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' }
  },
  { day: 130, phase: 'boll', phaseEn: 'Boll Bursting', phaseTa: 'காய் வெடித்தல்',
    tasks: [{ en: 'Reduce irrigation, prepare for picking', ta: 'நீர்ப்பாசனம் குறைக்கவும், பறிக்க தயாராகுங்கள்' }],
    irrigation: { required: true, frequency: 'Every 12-15 days', frequencyTa: 'ஒவ்வொரு 12-15 நாட்களுக்கும்' }
  },
  { day: 150, phase: 'harvest', phaseEn: 'First Picking', phaseTa: 'முதல் பறிப்பு',
    tasks: [
      { en: 'Pick fully opened bolls', ta: 'முழுமையாக திறந்த காய்களை பறிக்கவும்' },
      { en: 'Dry cotton before storage', ta: 'சேமிப்பதற்கு முன் பருத்தியை உலர்த்தவும்' }
    ],
    irrigation: { required: false, frequency: 'Stop irrigation', frequencyTa: 'நீர்ப்பாசனம் நிறுத்தவும்' }
  },
  { day: 170, phase: 'harvest', phaseEn: 'Final Picking', phaseTa: 'இறுதி பறிப்பு',
    tasks: [{ en: 'Complete 3-4 pickings', ta: '3-4 பறிப்புகளை முடிக்கவும்' }],
    irrigation: { required: false, frequency: 'None', frequencyTa: 'இல்லை' }
  }
];

// Tomato detailed timeline
const tomatoTimeline: CropTimeline[] = [
  { day: 1, phase: 'nursery', phaseEn: 'Nursery Preparation', phaseTa: 'நாற்றங்கால் தயாரிப்பு',
    tasks: [
      { en: 'Prepare raised nursery beds', ta: 'உயர்த்தப்பட்ட நாற்றங்கால் படுக்கைகளை தயார் செய்யவும்' },
      { en: 'Treat seeds with Trichoderma', ta: 'டிரைக்கோடெர்மாவுடன் விதைகளை நேர்த்தி செய்யவும்' }
    ],
    irrigation: { required: true, frequency: 'Daily light watering', frequencyTa: 'தினசரி லேசான நீர்ப்பாசனம்' },
    medicine: { name: 'Trichoderma viride', nameTa: 'டிரைக்கோடெர்மா விரிடி', dosage: '4g/kg seed', purpose: 'Damping off prevention', purposeTa: 'வாடல் நோய் தடுப்பு' }
  },
  { day: 7, phase: 'nursery', phaseEn: 'Seed Sowing', phaseTa: 'விதை விதைத்தல்',
    tasks: [{ en: 'Sow seeds in lines 5cm apart', ta: '5 செ.மீ இடைவெளியில் வரிசையில் விதைக்கவும்' }],
    irrigation: { required: true, frequency: 'Twice daily', frequencyTa: 'தினமும் இருமுறை' }
  },
  { day: 25, phase: 'transplanting', phaseEn: 'Transplanting', phaseTa: 'நாற்று நடவு',
    tasks: [
      { en: 'Transplant seedlings with 4-5 leaves', ta: '4-5 இலைகளுடன் நாற்றுகளை நடவும்' },
      { en: 'Spacing: 60cm x 45cm', ta: 'இடைவெளி: 60 செ.மீ x 45 செ.மீ' }
    ],
    irrigation: { required: true, frequency: 'Immediately after planting', frequencyTa: 'நடவு செய்த உடனேயே' }
  },
  { day: 30, phase: 'establishment', phaseEn: 'Establishment', phaseTa: 'நிலைப்படுத்தல்',
    tasks: [
      { en: 'Gap filling if needed', ta: 'தேவைப்பட்டால் இடைவெளி நிரப்புதல்' },
      { en: 'Apply basal fertilizer', ta: 'அடி உரம் இடவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 3-4 days', frequencyTa: 'ஒவ்வொரு 3-4 நாட்களுக்கும்' }
  },
  { day: 40, phase: 'vegetative', phaseEn: 'First Weeding + Fertilizer', phaseTa: 'முதல் களை + உரம்',
    tasks: [
      { en: 'Weeding and hoeing', ta: 'களை எடுத்தல் மற்றும் கொத்துதல்' },
      { en: 'Apply Urea 30kg/acre', ta: 'யூரியா 30 கிலோ/ஏக்கர்' }
    ],
    irrigation: { required: true, frequency: 'Every 4-5 days', frequencyTa: 'ஒவ்வொரு 4-5 நாட்களுக்கும்' },
    medicine: { name: 'Copper oxychloride', nameTa: 'காப்பர் ஆக்சிகுளோரைடு', dosage: '400g/acre', purpose: 'Bacterial wilt prevention', purposeTa: 'பாக்டீரியா வாடல் தடுப்பு' }
  },
  { day: 50, phase: 'vegetative', phaseEn: 'Staking', phaseTa: 'கம்பு கட்டுதல்',
    tasks: [
      { en: 'Stake plants for support', ta: 'செடிகளுக்கு கம்பு ஊன்றவும்' },
      { en: 'Remove side shoots', ta: 'பக்க கிளைகளை அகற்றவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 4-5 days', frequencyTa: 'ஒவ்வொரு 4-5 நாட்களுக்கும்' }
  },
  { day: 55, phase: 'flowering', phaseEn: 'Flowering', phaseTa: 'பூப்பூத்தல்',
    tasks: [
      { en: 'Spray Boron for better fruit set', ta: 'நல்ல கனி பிடிப்புக்கு போரான் தெளிக்கவும்' },
      { en: 'Monitor for fruit borer', ta: 'கனி துளைப்பானை கண்காணிக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 3-4 days (critical)', frequencyTa: 'ஒவ்வொரு 3-4 நாட்களுக்கும் (முக்கியம்)' },
    medicine: { name: 'Bacillus thuringiensis', nameTa: 'பேசில்லஸ் துரிங்கியன்சிஸ்', dosage: '250g/acre', purpose: 'Fruit borer control', purposeTa: 'கனி துளைப்பான் கட்டுப்பாடு' }
  },
  { day: 65, phase: 'fruiting', phaseEn: 'Fruit Development', phaseTa: 'கனி வளர்ச்சி',
    tasks: [
      { en: 'Apply Potash 20kg/acre', ta: 'பொட்டாஷ் 20 கிலோ/ஏக்கர்' },
      { en: 'Spray Calcium for quality', ta: 'தரத்திற்கு கால்சியம் தெளிக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 3-4 days', frequencyTa: 'ஒவ்வொரு 3-4 நாட்களுக்கும்' }
  },
  { day: 75, phase: 'fruiting', phaseEn: 'Pest Management', phaseTa: 'பூச்சி மேலாண்மை',
    tasks: [
      { en: 'Monitor for leaf curl virus', ta: 'இலை சுருட்டு வைரஸ் கண்காணிப்பு' },
      { en: 'Control whiteflies', ta: 'வெள்ளை ஈக்களை கட்டுப்படுத்தவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 3-4 days', frequencyTa: 'ஒவ்வொரு 3-4 நாட்களுக்கும்' },
    medicine: { name: 'Acetamiprid', nameTa: 'அசெட்டாமிப்ரிட்', dosage: '40g/acre', purpose: 'Whitefly control', purposeTa: 'வெள்ளை ஈ கட்டுப்பாடு' }
  },
  { day: 85, phase: 'harvest', phaseEn: 'First Harvest', phaseTa: 'முதல் அறுவடை',
    tasks: [
      { en: 'Harvest at breaker stage', ta: 'நிறம் மாற தொடங்கும் போது அறுவடை' },
      { en: 'Handle fruits carefully', ta: 'கனிகளை கவனமாக கையாளவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 4-5 days', frequencyTa: 'ஒவ்வொரு 4-5 நாட்களுக்கும்' }
  },
  { day: 100, phase: 'harvest', phaseEn: 'Continue Harvesting', phaseTa: 'அறுவடை தொடர்ச்சி',
    tasks: [{ en: 'Harvest every 4-5 days', ta: 'ஒவ்வொரு 4-5 நாட்களுக்கும் அறுவடை' }],
    irrigation: { required: true, frequency: 'Every 5-6 days', frequencyTa: 'ஒவ்வொரு 5-6 நாட்களுக்கும்' }
  },
  { day: 120, phase: 'harvest', phaseEn: 'Final Harvest', phaseTa: 'இறுதி அறுவடை',
    tasks: [{ en: 'Complete all harvesting, remove plants', ta: 'அனைத்து அறுவடையும் முடிக்கவும், செடிகளை அகற்றவும்' }],
    irrigation: { required: false, frequency: 'Reduce gradually', frequencyTa: 'படிப்படியாக குறைக்கவும்' }
  }
];

// Groundnut timeline
const groundnutTimeline: CropTimeline[] = [
  { day: 1, phase: 'preparation', phaseEn: 'Field Preparation', phaseTa: 'நிலம் தயாரிப்பு',
    tasks: [
      { en: 'Deep ploughing', ta: 'ஆழ உழவு' },
      { en: 'Apply Gypsum 200kg/acre', ta: 'ஜிப்சம் 200 கிலோ/ஏக்கர் இடவும்' }
    ],
    irrigation: { required: false, frequency: 'None', frequencyTa: 'இல்லை' }
  },
  { day: 5, phase: 'sowing', phaseEn: 'Sowing', phaseTa: 'விதைப்பு',
    tasks: [
      { en: 'Sow treated kernels', ta: 'நேர்த்தி செய்த பருப்புகளை விதைக்கவும்' },
      { en: 'Spacing: 30cm x 10cm', ta: 'இடைவெளி: 30 செ.மீ x 10 செ.மீ' }
    ],
    irrigation: { required: true, frequency: 'Light irrigation after sowing', frequencyTa: 'விதைப்பு பின் லேசான நீர்ப்பாசனம்' },
    medicine: { name: 'Thiram + Carbendazim', nameTa: 'தைரம் + கார்பன்டசிம்', dosage: '3g/kg seed', purpose: 'Collar rot prevention', purposeTa: 'கழுத்து அழுகல் தடுப்பு' }
  },
  { day: 15, phase: 'germination', phaseEn: 'Germination Complete', phaseTa: 'முளைப்பு முடிவு',
    tasks: [
      { en: 'Check germination percentage', ta: 'முளைப்பு சதவீதம் சோதிக்கவும்' },
      { en: 'Gap filling if needed', ta: 'தேவைப்பட்டால் இடைவெளி நிரப்புதல்' }
    ],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' }
  },
  { day: 25, phase: 'vegetative', phaseEn: 'First Weeding', phaseTa: 'முதல் களை எடுத்தல்',
    tasks: [
      { en: 'Hand weeding or hoeing', ta: 'கை களை அல்லது கொத்துதல்' },
      { en: 'Apply Urea 20kg/acre', ta: 'யூரியா 20 கிலோ/ஏக்கர்' }
    ],
    irrigation: { required: true, frequency: 'Every 10 days', frequencyTa: 'ஒவ்வொரு 10 நாட்களுக்கும்' }
  },
  { day: 35, phase: 'vegetative', phaseEn: 'Flowering Initiation', phaseTa: 'பூப்பூத்தல் தொடக்கம்',
    tasks: [{ en: 'No irrigation during flowering', ta: 'பூப்பூக்கும் போது நீர்ப்பாசனம் வேண்டாம்' }],
    irrigation: { required: false, frequency: 'Avoid for 3-4 days', frequencyTa: '3-4 நாட்கள் தவிர்க்கவும்' }
  },
  { day: 45, phase: 'pegging', phaseEn: 'Pegging Stage', phaseTa: 'ஊசி இறங்கும் நிலை',
    tasks: [
      { en: 'Earthing up essential', ta: 'மண் அணைத்தல் அவசியம்' },
      { en: 'Apply Gypsum 100kg/acre', ta: 'ஜிப்சம் 100 கிலோ/ஏக்கர்' }
    ],
    irrigation: { required: true, frequency: 'Every 8-10 days (critical)', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும் (முக்கியம்)' },
    medicine: { name: 'Chlorothalonil', nameTa: 'குளோரோதலோனில்', dosage: '400g/acre', purpose: 'Tikka leaf spot', purposeTa: 'டிக்கா இலை புள்ளி' }
  },
  { day: 60, phase: 'pod', phaseEn: 'Pod Development', phaseTa: 'காய் வளர்ச்சி',
    tasks: [
      { en: 'Apply micronutrients (Zinc, Boron)', ta: 'நுண்ணூட்டங்கள் (துத்தநாகம், போரான்) இடவும்' },
      { en: 'Monitor for red hairy caterpillar', ta: 'சிவப்பு ரோம புழுவை கண்காணிக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' }
  },
  { day: 75, phase: 'pod', phaseEn: 'Pod Filling', phaseTa: 'காய் நிரம்புதல்',
    tasks: [{ en: 'Maintain moisture for kernel filling', ta: 'பருப்பு நிரம்ப ஈரப்பதத்தை பராமரிக்கவும்' }],
    irrigation: { required: true, frequency: 'Every 7-8 days', frequencyTa: 'ஒவ்வொரு 7-8 நாட்களுக்கும்' }
  },
  { day: 90, phase: 'maturity', phaseEn: 'Pre-Harvest', phaseTa: 'அறுவடைக்கு முன்',
    tasks: [
      { en: 'Check pod maturity (scrape test)', ta: 'காய் முதிர்ச்சி சோதனை (சுரண்டல் சோதனை)' },
      { en: 'Stop irrigation 10 days before harvest', ta: 'அறுவடைக்கு 10 நாட்களுக்கு முன் நீர்ப்பாசனம் நிறுத்தவும்' }
    ],
    irrigation: { required: false, frequency: 'Stop irrigation', frequencyTa: 'நீர்ப்பாசனம் நிறுத்தவும்' }
  },
  { day: 105, phase: 'harvest', phaseEn: 'Harvest', phaseTa: 'அறுவடை',
    tasks: [
      { en: 'Harvest when 75% pods mature', ta: '75% காய்கள் முதிர்ச்சியடையும் போது அறுவடை' },
      { en: 'Sun dry pods for 3-4 days', ta: 'காய்களை 3-4 நாட்கள் வெயிலில் உலர்த்தவும்' }
    ],
    irrigation: { required: false, frequency: 'Field should be dry', frequencyTa: 'வயல் உலர்ந்திருக்க வேண்டும்' }
  }
];

// Sugarcane timeline
const sugarcaneTimeline: CropTimeline[] = [
  { day: 1, phase: 'preparation', phaseEn: 'Field Preparation', phaseTa: 'நிலம் தயாரிப்பு',
    tasks: [
      { en: 'Deep ploughing 3-4 times', ta: '3-4 முறை ஆழ உழவு' },
      { en: 'Form furrows 90cm apart', ta: '90 செ.மீ இடைவெளியில் வரப்புகள் அமைக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Wet furrows before planting', frequencyTa: 'நடவுக்கு முன் வரப்புகளை நனைக்கவும்' }
  },
  { day: 7, phase: 'planting', phaseEn: 'Sett Planting', phaseTa: 'கரணை நடவு',
    tasks: [
      { en: 'Plant 3-budded setts', ta: '3 கணு கரணைகளை நடவும்' },
      { en: 'Treat setts with fungicide', ta: 'கரணைகளை பூஞ்சைக்கொல்லியில் நனைக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Immediately after planting', frequencyTa: 'நடவு செய்த உடனேயே' },
    medicine: { name: 'Carbendazim', nameTa: 'கார்பன்டசிம்', dosage: '100g/100L water', purpose: 'Sett rot prevention', purposeTa: 'கரணை அழுகல் தடுப்பு' }
  },
  { day: 30, phase: 'germination', phaseEn: 'Germination', phaseTa: 'முளைப்பு',
    tasks: [
      { en: 'Gap filling with pre-germinated setts', ta: 'முளைத்த கரணைகளால் இடைவெளி நிரப்புதல்' },
      { en: 'First weeding', ta: 'முதல் களை எடுத்தல்' }
    ],
    irrigation: { required: true, frequency: 'Every 10-12 days', frequencyTa: 'ஒவ்வொரு 10-12 நாட்களுக்கும்' }
  },
  { day: 45, phase: 'tillering', phaseEn: 'Tillering Stage', phaseTa: 'கிளைத்தல் நிலை',
    tasks: [
      { en: 'Apply Urea 50kg/acre', ta: 'யூரியா 50 கிலோ/ஏக்கர்' },
      { en: 'Apply SSP 50kg/acre', ta: 'எஸ்எஸ்பி 50 கிலோ/ஏக்கர்' }
    ],
    irrigation: { required: true, frequency: 'Every 10 days', frequencyTa: 'ஒவ்வொரு 10 நாட்களுக்கும்' }
  },
  { day: 60, phase: 'tillering', phaseEn: 'Earthing Up', phaseTa: 'மண் அணைத்தல்',
    tasks: [
      { en: 'First earthing up', ta: 'முதல் மண் அணைத்தல்' },
      { en: 'Propping if needed', ta: 'தேவைப்பட்டால் ஊன்றுகோல் அமைக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' },
    medicine: { name: 'Chlorpyrifos', nameTa: 'குளோர்பைரிபாஸ்', dosage: '2L/acre in irrigation', purpose: 'Early shoot borer', purposeTa: 'ஆரம்ப தண்டு துளைப்பான்' }
  },
  { day: 90, phase: 'grand_growth', phaseEn: 'Grand Growth Phase', phaseTa: 'பெரும் வளர்ச்சி நிலை',
    tasks: [
      { en: 'Apply Urea 50kg/acre', ta: 'யூரியா 50 கிலோ/ஏக்கர்' },
      { en: 'Second earthing up', ta: 'இரண்டாம் மண் அணைத்தல்' }
    ],
    irrigation: { required: true, frequency: 'Every 7-8 days (critical)', frequencyTa: 'ஒவ்வொரு 7-8 நாட்களுக்கும் (முக்கியம்)' }
  },
  { day: 120, phase: 'grand_growth', phaseEn: 'Continue Growth', phaseTa: 'வளர்ச்சி தொடர்ச்சி',
    tasks: [
      { en: 'Apply MOP 40kg/acre', ta: 'எம்ஓபி 40 கிலோ/ஏக்கர்' },
      { en: 'Trash mulching', ta: 'குப்பை மூடாக்கு' }
    ],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' },
    medicine: { name: 'Fipronil', nameTa: 'ஃபிப்ரோனில்', dosage: '100g/acre', purpose: 'Internode borer', purposeTa: 'கணுப்பூச்சி' }
  },
  { day: 180, phase: 'grand_growth', phaseEn: 'Mid-Season', phaseTa: 'பருவ நடுப்பகுதி',
    tasks: [
      { en: 'Detrashing lower leaves', ta: 'கீழ் இலைகளை அகற்றுதல்' },
      { en: 'Propping canes', ta: 'கரும்புகளை ஊன்றுதல்' }
    ],
    irrigation: { required: true, frequency: 'Every 10-12 days', frequencyTa: 'ஒவ்வொரு 10-12 நாட்களுக்கும்' }
  },
  { day: 270, phase: 'maturity', phaseEn: 'Ripening', phaseTa: 'பக்குவமாதல்',
    tasks: [
      { en: 'Spray ripener (Ethephon) if needed', ta: 'தேவைப்பட்டால் பக்குவமாக்கி தெளிக்கவும்' },
      { en: 'Reduce irrigation', ta: 'நீர்ப்பாசனம் குறைக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 15-20 days', frequencyTa: 'ஒவ்வொரு 15-20 நாட்களுக்கும்' }
  },
  { day: 300, phase: 'maturity', phaseEn: 'Pre-Harvest', phaseTa: 'அறுவடைக்கு முன்',
    tasks: [
      { en: 'Check brix level (18-20%)', ta: 'பிரிக்ஸ் அளவு சோதனை (18-20%)' },
      { en: 'Stop irrigation 15-20 days before', ta: '15-20 நாட்களுக்கு முன் நீர்ப்பாசனம் நிறுத்தவும்' }
    ],
    irrigation: { required: false, frequency: 'Stop completely', frequencyTa: 'முற்றிலும் நிறுத்தவும்' }
  },
  { day: 330, phase: 'harvest', phaseEn: 'Harvest', phaseTa: 'அறுவடை',
    tasks: [
      { en: 'Cut at ground level', ta: 'தரை மட்டத்தில் வெட்டவும்' },
      { en: 'Transport to mill within 24 hours', ta: '24 மணி நேரத்தில் ஆலைக்கு கொண்டு செல்லவும்' }
    ],
    irrigation: { required: false, frequency: 'None', frequencyTa: 'இல்லை' }
  }
];

// Maize timeline
const maizeTimeline: CropTimeline[] = [
  { day: 1, phase: 'preparation', phaseEn: 'Field Preparation', phaseTa: 'நிலம் தயாரிப்பு',
    tasks: [
      { en: 'Plough and level field', ta: 'உழுது சமன் செய்யவும்' },
      { en: 'Apply FYM 4 tonnes/acre', ta: 'தொழுவுரம் 4 டன்/ஏக்கர் இடவும்' }
    ],
    irrigation: { required: false, frequency: 'None', frequencyTa: 'இல்லை' }
  },
  { day: 5, phase: 'sowing', phaseEn: 'Sowing', phaseTa: 'விதைப்பு',
    tasks: [
      { en: 'Sow seeds at 5cm depth', ta: '5 செ.மீ ஆழத்தில் விதைக்கவும்' },
      { en: 'Spacing: 60cm x 25cm', ta: 'இடைவெளி: 60 செ.மீ x 25 செ.மீ' }
    ],
    irrigation: { required: true, frequency: 'Light irrigation after sowing', frequencyTa: 'விதைப்பு பின் லேசான நீர்ப்பாசனம்' },
    medicine: { name: 'Thiram', nameTa: 'தைரம்', dosage: '3g/kg seed', purpose: 'Seed treatment', purposeTa: 'விதை நேர்த்தி' }
  },
  { day: 15, phase: 'vegetative', phaseEn: 'Thinning', phaseTa: 'இழைத்தல்',
    tasks: [{ en: 'Retain one plant per hill', ta: 'ஒரு குழிக்கு ஒரு செடி வைக்கவும்' }],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' }
  },
  { day: 25, phase: 'vegetative', phaseEn: 'First Fertilizer', phaseTa: 'முதல் உரமிடுதல்',
    tasks: [
      { en: 'Apply Urea 40kg/acre', ta: 'யூரியா 40 கிலோ/ஏக்கர்' },
      { en: 'First weeding', ta: 'முதல் களை எடுத்தல்' }
    ],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' }
  },
  { day: 40, phase: 'vegetative', phaseEn: 'Earthing Up', phaseTa: 'மண் அணைத்தல்',
    tasks: [
      { en: 'Earthing up operation', ta: 'மண் அணைத்தல் செய்யவும்' },
      { en: 'Apply Urea 40kg/acre', ta: 'யூரியா 40 கிலோ/ஏக்கர்' }
    ],
    irrigation: { required: true, frequency: 'Every 7-8 days', frequencyTa: 'ஒவ்வொரு 7-8 நாட்களுக்கும்' },
    medicine: { name: 'Carbofuran', nameTa: 'கார்போஃபுரான்', dosage: '4kg/acre', purpose: 'Stem borer', purposeTa: 'தண்டு துளைப்பான்' }
  },
  { day: 55, phase: 'tasseling', phaseEn: 'Tasseling', phaseTa: 'மகரந்த பூப்பு',
    tasks: [
      { en: 'Critical irrigation stage', ta: 'முக்கிய நீர்ப்பாசன நிலை' },
      { en: 'Monitor for fall armyworm', ta: 'வீழ்படை புழுவை கண்காணிக்கவும்' }
    ],
    irrigation: { required: true, frequency: 'Every 5-6 days (critical)', frequencyTa: 'ஒவ்வொரு 5-6 நாட்களுக்கும் (முக்கியம்)' },
    medicine: { name: 'Spinetoram', nameTa: 'ஸ்பினெட்டோரம்', dosage: '60ml/acre', purpose: 'Fall armyworm', purposeTa: 'வீழ்படை புழு' }
  },
  { day: 65, phase: 'silking', phaseEn: 'Silking', phaseTa: 'பட்டு நிலை',
    tasks: [{ en: 'Ensure adequate moisture', ta: 'போதுமான ஈரப்பதம் உறுதி செய்யவும்' }],
    irrigation: { required: true, frequency: 'Every 5-6 days (critical)', frequencyTa: 'ஒவ்வொரு 5-6 நாட்களுக்கும் (முக்கியம்)' }
  },
  { day: 80, phase: 'grain', phaseEn: 'Grain Filling', phaseTa: 'தானிய நிரப்புதல்',
    tasks: [{ en: 'Bird scaring', ta: 'பறவை விரட்டுதல்' }],
    irrigation: { required: true, frequency: 'Every 8-10 days', frequencyTa: 'ஒவ்வொரு 8-10 நாட்களுக்கும்' }
  },
  { day: 95, phase: 'maturity', phaseEn: 'Physiological Maturity', phaseTa: 'உடலியல் முதிர்ச்சி',
    tasks: [
      { en: 'Check black layer formation', ta: 'கருப்பு அடுக்கு உருவாக்கம் சோதிக்கவும்' },
      { en: 'Stop irrigation', ta: 'நீர்ப்பாசனம் நிறுத்தவும்' }
    ],
    irrigation: { required: false, frequency: 'Stop irrigation', frequencyTa: 'நீர்ப்பாசனம் நிறுத்தவும்' }
  },
  { day: 110, phase: 'harvest', phaseEn: 'Harvest', phaseTa: 'அறுவடை',
    tasks: [
      { en: 'Harvest at 20-22% moisture', ta: '20-22% ஈரப்பதத்தில் அறுவடை' },
      { en: 'Dry cobs before shelling', ta: 'உரிப்பதற்கு முன் கதிர்களை உலர்த்தவும்' }
    ],
    irrigation: { required: false, frequency: 'None', frequencyTa: 'இல்லை' }
  }
];

export const detailedCrops: DetailedCrop[] = [
  { key: 'paddy', nameEn: 'Paddy/Rice', nameTa: 'நெல்', matchScore: 95, waterNeed: 'high', totalDays: 120, expectedYield: '25-30 Q/acre', pricePerQuintal: 2183, bestSeason: 'June-July, Sep-Oct', bestSeasonTa: 'ஜூன்-ஜூலை, செப்-அக்', timeline: paddyTimeline },
  { key: 'groundnut', nameEn: 'Groundnut', nameTa: 'நிலக்கடலை', matchScore: 88, waterNeed: 'medium', totalDays: 105, expectedYield: '12-15 Q/acre', pricePerQuintal: 5650, bestSeason: 'Jun-Jul, Jan-Feb', bestSeasonTa: 'ஜூன்-ஜூலை, ஜன-பிப்', timeline: groundnutTimeline },
  { key: 'tomato', nameEn: 'Tomato', nameTa: 'தக்காளி', matchScore: 82, waterNeed: 'medium', totalDays: 120, expectedYield: '150-200 Q/acre', pricePerQuintal: 2800, bestSeason: 'Oct-Nov, Jan-Feb', bestSeasonTa: 'அக்-நவ, ஜன-பிப்', timeline: tomatoTimeline },
  { key: 'sugarcane', nameEn: 'Sugarcane', nameTa: 'கரும்பு', matchScore: 82, waterNeed: 'high', totalDays: 330, expectedYield: '350-400 Q/acre', pricePerQuintal: 315, bestSeason: 'Dec-Feb', bestSeasonTa: 'டிச-பிப்', timeline: sugarcaneTimeline },
  { key: 'cotton', nameEn: 'Cotton', nameTa: 'பருத்தி', matchScore: 75, waterNeed: 'medium', totalDays: 170, expectedYield: '8-12 Q/acre', pricePerQuintal: 6420, bestSeason: 'Apr-May, Sep-Oct', bestSeasonTa: 'ஏப்-மே, செப்-அக்', timeline: cottonTimeline },
  { key: 'maize', nameEn: 'Maize/Corn', nameTa: 'மக்காச்சோளம்', matchScore: 68, waterNeed: 'medium', totalDays: 110, expectedYield: '20-25 Q/acre', pricePerQuintal: 2090, bestSeason: 'Jun-Jul, Feb-Mar', bestSeasonTa: 'ஜூன்-ஜூலை, பிப்-மார்', timeline: maizeTimeline },
  { key: 'chilli', nameEn: 'Chilli', nameTa: 'மிளகாய்', matchScore: 72, waterNeed: 'medium', totalDays: 150, expectedYield: '15-20 Q/acre', pricePerQuintal: 12000, bestSeason: 'Aug-Sep', bestSeasonTa: 'ஆக-செப்', timeline: [] },
  { key: 'onion', nameEn: 'Onion', nameTa: 'வெங்காயம்', matchScore: 65, waterNeed: 'medium', totalDays: 120, expectedYield: '100-150 Q/acre', pricePerQuintal: 1800, bestSeason: 'Oct-Nov', bestSeasonTa: 'அக்-நவ', timeline: [] },
  { key: 'banana', nameEn: 'Banana', nameTa: 'வாழை', matchScore: 78, waterNeed: 'high', totalDays: 300, expectedYield: '250-300 Q/acre', pricePerQuintal: 1200, bestSeason: 'Year-round', bestSeasonTa: 'ஆண்டு முழுவதும்', timeline: [] },
  { key: 'turmeric', nameEn: 'Turmeric', nameTa: 'மஞ்சள்', matchScore: 70, waterNeed: 'medium', totalDays: 270, expectedYield: '80-100 Q/acre', pricePerQuintal: 8500, bestSeason: 'Jun-Jul', bestSeasonTa: 'ஜூன்-ஜூலை', timeline: [] },
  { key: 'coconut', nameEn: 'Coconut', nameTa: 'தேங்காய்', matchScore: 85, waterNeed: 'medium', totalDays: 1825, expectedYield: '80-100 nuts/tree', pricePerQuintal: 2500, bestSeason: 'Jun-Sep', bestSeasonTa: 'ஜூன்-செப்', timeline: [] },
  { key: 'mango', nameEn: 'Mango', nameTa: 'மாம்பழம்', matchScore: 60, waterNeed: 'low', totalDays: 1460, expectedYield: '100-150 kg/tree', pricePerQuintal: 4000, bestSeason: 'Jul-Aug', bestSeasonTa: 'ஜூலை-ஆக', timeline: [] },
  { key: 'brinjal', nameEn: 'Brinjal', nameTa: 'கத்தரிக்காய்', matchScore: 58, waterNeed: 'medium', totalDays: 100, expectedYield: '120-150 Q/acre', pricePerQuintal: 1500, bestSeason: 'Jun-Jul, Oct-Nov', bestSeasonTa: 'ஜூன்-ஜூலை, அக்-நவ', timeline: [] },
  { key: 'okra', nameEn: 'Okra/Ladies Finger', nameTa: 'வெண்டைக்காய்', matchScore: 55, waterNeed: 'medium', totalDays: 60, expectedYield: '40-50 Q/acre', pricePerQuintal: 2000, bestSeason: 'Feb-Mar, Jun-Jul', bestSeasonTa: 'பிப்-மார், ஜூன்-ஜூலை', timeline: [] },
  { key: 'cabbage', nameEn: 'Cabbage', nameTa: 'முட்டைக்கோஸ்', matchScore: 52, waterNeed: 'high', totalDays: 90, expectedYield: '150-200 Q/acre', pricePerQuintal: 1000, bestSeason: 'Sep-Oct', bestSeasonTa: 'செப்-அக்', timeline: [] },
  { key: 'cauliflower', nameEn: 'Cauliflower', nameTa: 'பூக்கோசு', matchScore: 48, waterNeed: 'high', totalDays: 100, expectedYield: '100-120 Q/acre', pricePerQuintal: 1800, bestSeason: 'Sep-Oct', bestSeasonTa: 'செப்-அக்', timeline: [] },
  { key: 'ragi', nameEn: 'Finger Millet/Ragi', nameTa: 'கேழ்வரகு', matchScore: 45, waterNeed: 'low', totalDays: 120, expectedYield: '10-15 Q/acre', pricePerQuintal: 3500, bestSeason: 'Jun-Jul', bestSeasonTa: 'ஜூன்-ஜூலை', timeline: [] },
  { key: 'sorghum', nameEn: 'Sorghum/Jowar', nameTa: 'சோளம்', matchScore: 42, waterNeed: 'low', totalDays: 110, expectedYield: '12-18 Q/acre', pricePerQuintal: 2800, bestSeason: 'Jun-Jul, Oct-Nov', bestSeasonTa: 'ஜூன்-ஜூலை, அக்-நவ', timeline: [] },
  { key: 'blackgram', nameEn: 'Black Gram/Urad', nameTa: 'உளுந்து', matchScore: 38, waterNeed: 'low', totalDays: 90, expectedYield: '5-8 Q/acre', pricePerQuintal: 6500, bestSeason: 'Sep-Oct', bestSeasonTa: 'செப்-அக்', timeline: [] },
  { key: 'greengram', nameEn: 'Green Gram/Moong', nameTa: 'பாசிப்பயறு', matchScore: 35, waterNeed: 'low', totalDays: 70, expectedYield: '4-6 Q/acre', pricePerQuintal: 7200, bestSeason: 'Jun-Jul', bestSeasonTa: 'ஜூன்-ஜூலை', timeline: [] },
  { key: 'redgram', nameEn: 'Red Gram/Tur', nameTa: 'துவரை', matchScore: 32, waterNeed: 'low', totalDays: 180, expectedYield: '6-8 Q/acre', pricePerQuintal: 6800, bestSeason: 'Jun-Jul', bestSeasonTa: 'ஜூன்-ஜூலை', timeline: [] },
  { key: 'sunflower', nameEn: 'Sunflower', nameTa: 'சூரியகாந்தி', matchScore: 28, waterNeed: 'medium', totalDays: 100, expectedYield: '6-10 Q/acre', pricePerQuintal: 5800, bestSeason: 'Jan-Feb, Jun-Jul', bestSeasonTa: 'ஜன-பிப், ஜூன்-ஜூலை', timeline: [] },
  { key: 'sesame', nameEn: 'Sesame/Gingelly', nameTa: 'எள்', matchScore: 25, waterNeed: 'low', totalDays: 95, expectedYield: '3-5 Q/acre', pricePerQuintal: 14000, bestSeason: 'Jun-Jul, Sep-Oct', bestSeasonTa: 'ஜூன்-ஜூலை, செப்-அக்', timeline: [] },
  { key: 'castor', nameEn: 'Castor', nameTa: 'ஆமணக்கு', matchScore: 22, waterNeed: 'low', totalDays: 150, expectedYield: '8-12 Q/acre', pricePerQuintal: 5500, bestSeason: 'Jun-Jul', bestSeasonTa: 'ஜூன்-ஜூலை', timeline: [] },
  { key: 'tapioca', nameEn: 'Tapioca/Cassava', nameTa: 'மரவள்ளிக்கிழங்கு', matchScore: 18, waterNeed: 'low', totalDays: 300, expectedYield: '150-200 Q/acre', pricePerQuintal: 800, bestSeason: 'Apr-Jun', bestSeasonTa: 'ஏப்-ஜூன்', timeline: [] },
  { key: 'drumstick', nameEn: 'Drumstick/Moringa', nameTa: 'முருங்கை', matchScore: 15, waterNeed: 'low', totalDays: 180, expectedYield: '200-300 kg/tree', pricePerQuintal: 3000, bestSeason: 'Jun-Jul', bestSeasonTa: 'ஜூன்-ஜூலை', timeline: [] },
  { key: 'papaya', nameEn: 'Papaya', nameTa: 'பப்பாளி', matchScore: 12, waterNeed: 'medium', totalDays: 270, expectedYield: '400-500 Q/acre', pricePerQuintal: 1000, bestSeason: 'Jun-Jul, Oct-Nov', bestSeasonTa: 'ஜூன்-ஜூலை, அக்-நவ', timeline: [] },
  { key: 'watermelon', nameEn: 'Watermelon', nameTa: 'தர்பூசணி', matchScore: 8, waterNeed: 'high', totalDays: 90, expectedYield: '200-300 Q/acre', pricePerQuintal: 600, bestSeason: 'Dec-Feb', bestSeasonTa: 'டிச-பிப்', timeline: [] },
  { key: 'ginger', nameEn: 'Ginger', nameTa: 'இஞ்சி', matchScore: 5, waterNeed: 'high', totalDays: 240, expectedYield: '80-100 Q/acre', pricePerQuintal: 4500, bestSeason: 'Apr-May', bestSeasonTa: 'ஏப்-மே', timeline: [] }
];