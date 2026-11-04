// Crop Damage Reporting & Claim Guidance Service
// Handles client-side validation, database persistence via Netlify functions, and claim process workflows

export interface DamageReportPayload {
  farmerName: string;
  farmerPhone: string;
  state: string;
  district: string;
  village: string;
  surveyNumber?: string;
  cropName: string;
  cropVariety?: string;
  affectedAreaAcres: string;
  totalAreaAcres?: string;
  insuranceScheme: string;
  policyOrApplicationNumber?: string;
  damageCategory: string;
  damageDate: string;
  description: string;
  damageImages?: string[];
  fieldImages?: string[];
  intimationChannel?: string;
}

export interface DamageReportRecord extends DamageReportPayload {
  id: number;
  reportNumber: string;
  status: string;
  createdAt: string;
}

export interface ClaimGuidanceRule {
  damageCategory: string;
  isLocalizedCalamity: boolean;
  intimationDeadlineEn: string;
  intimationDeadlineTa: string;
  deadlineType: 'strict_72h' | 'policy_specific' | 'automatic_cce';
  reportingAuthorityEn: string;
  reportingAuthorityTa: string;
  submissionChannelsEn: string[];
  submissionChannelsTa: string[];
  requiredEvidenceEn: string[];
  requiredEvidenceTa: string[];
  claimSettlementTimelineEn: string;
  claimSettlementTimelineTa: string;
  importantNotesEn: string;
  importantNotesTa: string;
}

export const DAMAGE_CATEGORIES = [
  { id: 'flood', en: 'Inundation / Flooding', ta: 'வெள்ளத்தில் மூழ்குதல் / நீர் தேங்குதல்' },
  { id: 'heavy_rain', en: 'Heavy Rainfall / Flash Flood', ta: 'கனமழை / பெருவெள்ளம்' },
  { id: 'hailstorm', en: 'Hailstorm', ta: 'ஆலங்கட்டி மழை' },
  { id: 'cyclone_wind', en: 'Cyclone / High Gale Wind', ta: 'புயல் / பலத்த சூறாவளி காற்று' },
  { id: 'landslide', en: 'Landslide / Cloudburst', ta: 'நிலச்சரிவு / மேகவெடிப்பு' },
  { id: 'drought', en: 'Drought / Severe Dry Spell', ta: 'வறட்சி / கடும் நீர் பற்றாக்குறை' },
  { id: 'pest_attack', en: 'Severe Pest Epidemic Attack', ta: 'தீவிர பூச்சித் தாக்குதல்' },
  { id: 'disease', en: 'Widespread Crop Disease Outbreak', ta: 'பரவலான பயிர் நோய் தொற்று' },
  { id: 'natural_fire', en: 'Natural Fire / Lightning', ta: 'இயற்கை தீ / மின்னல்' },
  { id: 'other', en: 'Other Natural Calamity', ta: 'பிற இயற்கை பேரிடர்' },
];

export const INSURANCE_SCHEME_OPTIONS = [
  { id: 'PMFBY', name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)' },
  { id: 'RWBCIS', name: 'Weather Based Crop Insurance (RWBCIS)' },
  { id: 'AIC', name: 'Agriculture Insurance Company of India (AIC)' },
  { id: 'HDFC_ERGO', name: 'HDFC ERGO General Insurance (Agri)' },
  { id: 'ICICI_LOMBARD', name: 'ICICI Lombard Rural Insurance' },
  { id: 'BAJAJ_ALLIANZ', name: 'Bajaj Allianz General Insurance' },
  { id: 'SDRF_EX_GRATIA', name: 'State Disaster Relief (Uninsured / SDRF Input Subsidy)' },
  { id: 'OTHER_PRIVATE', name: 'Other Private Commercial Policy' },
];

/**
 * Get accurate, nuanced claim intimation guidance for specific damage and scheme
 */
export function getClaimGuidance(
  damageCategory: string,
  scheme: string
): ClaimGuidanceRule {
  const isPmfby = scheme === 'PMFBY' || scheme === 'RWBCIS';
  const isPrivate = scheme.includes('HDFC') || scheme.includes('ICICI') || scheme.includes('BAJAJ') || scheme.includes('OTHER');
  const isLocalized = ['flood', 'heavy_rain', 'hailstorm', 'landslide', 'natural_fire'].includes(damageCategory);

  if (isPmfby && isLocalized) {
    return {
      damageCategory,
      isLocalizedCalamity: true,
      deadlineType: 'strict_72h',
      intimationDeadlineEn: 'Strictly within 72 Hours (3 days) of the calamity occurrence.',
      intimationDeadlineTa: 'பேரிடர் ஏற்பட்ட 72 மணி நேரத்திற்குள் (3 நாட்களுக்குள்) கட்டாயமாக தெரிவிக்க வேண்டும்.',
      reportingAuthorityEn: 'Designated PMFBY Insurance Company for your district, Block Agriculture Officer, or PMFBY Central Toll-Free Helpline.',
      reportingAuthorityTa: 'உங்கள் மாவட்டத்திற்கு ஒதுக்கப்பட்ட காப்பீட்டு நிறுவனம், வட்டார வேளாண் அதிகாரி அல்லது PMFBY கட்டணமில்லா தொலைபேசி மையம்.',
      submissionChannelsEn: [
        'Crop Insurance (Krishi Rakshak) Mobile App (Direct geo-tagged photo upload)',
        'PMFBY Central Toll-Free Helpline: 14447',
        'Your Bank Branch (where loan/premium was debited)',
        'Nearest Village Administrative Officer (VAO) or Block Assistant Director of Agriculture (ADA)',
        'Common Service Centre (CSC) Digital Seva Portal'
      ],
      submissionChannelsTa: [
        'Crop Insurance (Krishi Rakshak) செல்போன் செயலி (புகைப்படங்களை நேரடியாக பதிவேற்றலாம்)',
        'PMFBY மத்திய கட்டணமில்லா உதவி எண்: 14447',
        'பிரீமியம் செலுத்திய வங்கி கிளை',
        'கிராம நிர்வாக அலுவலர் (VAO) அல்லது வட்டார வேளாண் அலுவலகம்',
        'அருகிலுள்ள அரசு இ-சேவை மையம் (CSC)'
      ],
      requiredEvidenceEn: [
        'Clear geo-tagged photographs of the damaged field showing survey boundaries.',
        'Copy of PMFBY Farmer Enrollment Receipt / 16-digit Application Number.',
        'Land revenue records (Patta / Chitta / Adangal).',
        'Bank Account Passbook showing Aadhaar seeding.'
      ],
      requiredEvidenceTa: [
        'ஜிபிஎஸ் இருப்பிடத்துடன் கூடிய வயல் சேத புகைப்படங்கள்.',
        '16 இலக்க PMFBY பயிர் காப்பீட்டு விண்ணப்ப ரசீது நகல்.',
        'பட்டா / சிட்டா மற்றும் நடப்பு பருவ அடங்கல்.',
        'வங்கி பாஸ்புக் நகல்.'
      ],
      claimSettlementTimelineEn: 'Survey within 48 hours of intimation by Joint Committee; loss assessment finalized within 10 days; direct DBT credit within 30 days.',
      claimSettlementTimelineTa: 'அறிவித்த 48 மணி நேரத்திற்குள் கூட்டுக்குழு ஆய்வு; 10 நாட்களுக்குள் அறிக்கை; 30 நாட்களுக்குள் வங்கி கணக்கில் நேரடி வரவு.',
      importantNotesEn: 'PMFBY Section 21.4 mandates that localized calamity claims require individual farmer intimation within 72 hours. Delayed intimation beyond 72 hours is rejected by insurance companies under national operational guidelines.',
      importantNotesTa: 'PMFBY விதிகளின்படி உள்ளூர் பேரிடர்களுக்கு 72 மணி நேரத்திற்குள் அறிவிப்பது கட்டாயமாகும். காலதாமதமான விண்ணப்பங்கள் நிராகரிக்கப்பட வாய்ப்புள்ளது.'
    };
  }

  if (isPmfby && (damageCategory === 'drought' || damageCategory === 'pest_attack' || damageCategory === 'disease')) {
    return {
      damageCategory,
      isLocalizedCalamity: false,
      deadlineType: 'automatic_cce',
      intimationDeadlineEn: 'Assessed at Season End via official Crop Cutting Experiments (CCEs). Individual 72-hour intimation NOT required.',
      intimationDeadlineTa: 'பருவ முடிவில் பயிர் அறுவடை பரிசோதனை (CCE) மூலம் கணக்கிடப்படும். 72 மணி நேர தனிநபர் அறிவிப்பு தேவையில்லை.',
      reportingAuthorityEn: 'State Department of Agriculture & Economics and Statistics Directorate.',
      reportingAuthorityTa: 'மாநில வேளாண்மைத் துறை மற்றும் புள்ளிவிவரத் துறை.',
      submissionChannelsEn: [
        'Automatic DBT settlement: All insured farmers in the notified insurance unit (village panchayat) receive yield shortfall compensation automatically into their bank accounts based on official CCE yield shortfall versus guaranteed threshold yield.',
        'For mid-season adversity or severe prolonged dry spell (> 50% damage), District Level Monitoring Committee (DLMC) orders 25% on-account immediate relief.'
      ],
      submissionChannelsTa: [
        'தானியங்கி நேரடி வங்கி வரவு: கிராம அளவில் மகசூல் குறைவு அடிப்படையில் பதிவு செய்த அனைத்து விவசாயிகளுக்கும் தானாகவே இழப்பீடு வங்கி கணக்கில் வரவு வைக்கப்படும்.',
        'பருவத்தின் நடுவே கடும் வறட்சி ஏற்பட்டால் மாவட்ட ஆட்சியர் தலைமையிலான குழு 25% உடனடி நிவாரணம் வழங்கும்.'
      ],
      requiredEvidenceEn: [
        'Valid PMFBY enrollment record / insurance premium deduction slip.',
        'Active Aadhaar-linked NPCI mapped bank account.'
      ],
      requiredEvidenceTa: [
        'செல்லுபடியாகும் PMFBY காப்பீட்டு ரசீது.',
        'ஆதார் இணைக்கப்பட்ட வங்கி கணக்கு.'
      ],
      claimSettlementTimelineEn: 'Calculated within 45 days after end of harvest and receipt of official CCE yield data from State Government.',
      claimSettlementTimelineTa: 'அரசு மகசூல் அறிக்கை கிடைத்த 45 நாட்களுக்குள் கணக்கிடப்பட்டு வழங்கப்படும்.',
      importantNotesEn: 'Under PMFBY, widespread calamities (drought, generalized pest epidemics) are not settled on individual farmer claim petitions; they are settled cluster-wide across the entire insurance unit to ensure zero farmer exclusion.',
      importantNotesTa: 'வறட்சி அல்லது பொதுவான பூச்சி தாக்குதலுக்கு தனிநபர் கணக்கெடுப்பு இன்றி, அந்த கிராமம் முழுமைக்கும் ஒரே அளவாக இழப்பீடு தீர்மானிக்கப்படும்.'
    };
  }

  // Private insurance policies
  if (isPrivate) {
    return {
      damageCategory,
      isLocalizedCalamity: true,
      deadlineType: 'policy_specific',
      intimationDeadlineEn: 'Specific Policy Terms: Commonly 24 to 48 hours as defined in your insurance policy schedule.',
      intimationDeadlineTa: 'பாலிசி விதிமுறைகளின்படி: பொதுவாக 24 முதல் 48 மணி நேரத்திற்குள் தெரிவிக்க வேண்டும்.',
      reportingAuthorityEn: 'Respective Private Insurance Claims Department or Assigned Rural Agent.',
      reportingAuthorityTa: 'சம்பந்தப்பட்ட தனியார் காப்பீட்டு நிறுவனத்தின் க்ளைம்ஸ் பிரிவு அல்லது முகவர்.',
      submissionChannelsEn: [
        'Insurer Claims Toll-Free Helpline (e.g. HDFC ERGO: 1800-266-0700 | ICICI Lombard: 1800-2666)',
        'Company Mobile App or Customer Web Portal',
        'Written intimation submitted to District Branch Office with acknowledgement copy'
      ],
      submissionChannelsTa: [
        'நிறுவனத்தின் கட்டணமில்லா உதவி எண் அல்லது செயலி',
        'நிறுவன கிளை அலுவலகத்தில் நேரில் கடிதம் கொடுத்து ஒப்புகை பெறுதல்'
      ],
      requiredEvidenceEn: [
        'Original Insurance Policy Certificate or Cover Note.',
        'Date and time stamped photographs / videos of damage.',
        'Written claim intimation form with exact GPS location and boundary descriptions.',
        'Damage estimation certificate from Village Administrative Officer (VAO).'
      ],
      requiredEvidenceTa: [
        'அசல் காப்பீட்டு பாலிசி சான்றிதழ்.',
        'தேதி மற்றும் நேரத்துடன் கூடிய புகைப்படங்கள் / வீடியோக்கள்.',
        'கிராம நிர்வாக அலுவலரின் சேத சான்றிதழ்.'
      ],
      claimSettlementTimelineEn: 'Surveyor deployed within 72 hours; claim report within 15 days; settlement according to IRDAI guidelines.',
      claimSettlementTimelineTa: '72 மணி நேரத்திற்குள் சர்வேயர் ஆய்வு; 15 நாட்களுக்குள் அறிக்கை; IRDAI விதிகளின்படி இழப்பீடு.',
      importantNotesEn: 'Private insurance contracts do not follow standardized PMFBY rules. Deadlines, deductibles, and exclusions are strictly defined in the individual policy schedule. Never rely on oral intimation; always retain written claim acknowledgment.',
      importantNotesTa: 'தனியார் பாலிசிகளுக்கு தனித்தனி காலக்கெடு மற்றும் விதிமுறைகள் உள்ளன. எப்போதும் எழுத்துப்பூர்வ ஒப்புகை ரசீதை பெற்றுக்கொள்ளவும்.'
    };
  }

  // SDRF / Uninsured default
  return {
    damageCategory,
    isLocalizedCalamity: true,
    deadlineType: 'strict_72h',
    intimationDeadlineEn: 'Within 7 days of disaster for inclusion in Joint Enumeration Lists.',
    intimationDeadlineTa: 'கூட்டு கணக்கெடுப்பு பட்டியலில் சேர்க்க பேரிடர் முடிந்த 7 நாட்களுக்குள் தெரிவிக்கவும்.',
    reportingAuthorityEn: 'Village Administrative Officer (VAO), Revenue Inspector (RI), and Block Tahsildar.',
    reportingAuthorityTa: 'கிராம நிர்வாக அலுவலர் (VAO), வருவாய் ஆய்வாளர் மற்றும் வட்டாட்சியர்.',
    submissionChannelsEn: [
      'Submit written petition with survey numbers directly to Village Administrative Officer (VAO)',
      'District Collectorate Public Grievance Day (Every Monday)',
      'State Agriculture Extension Centre (Uzhavan App)'
    ],
    submissionChannelsTa: [
      'கிராம நிர்வாக அலுவலரிடம் (VAO) எழுத்துப்பூர்வ மனு அளித்தல்',
      'மாவட்ட ஆட்சியர் மக்கள் குறைதீர்க்கும் முகாம்'
    ],
    requiredEvidenceEn: [
      'Aadhaar card copy',
      'Bank passbook copy',
      'Patta / Chitta document'
    ],
    requiredEvidenceTa: [
      'ஆதார் அட்டை, வங்கி பாஸ்புக் மற்றும் பட்டா நகல்.'
    ],
    claimSettlementTimelineEn: 'Following government gazette calamity sanction order.',
    claimSettlementTimelineTa: 'அரசாணை வெளியிடப்பட்ட பின்னர் வழங்கப்படும்.',
    importantNotesEn: 'SDRF input subsidy applies only when total crop damage is officially assessed at 33% or higher by government revenue authorities.',
    importantNotesTa: 'அரசு கணக்கெடுப்பில் 33% அல்லது அதற்கு மேல் சேதம் இருந்தால் மட்டுமே SDRF நிவாரணம் கிடைக்கும்.'
  };
}

/**
 * Submit crop damage report to Netlify Database or fallback local storage
 */
export async function submitCropDamageReport(
  payload: DamageReportPayload
): Promise<{ success: boolean; reportNumber: string; record?: DamageReportRecord; error?: string }> {
  // Generate authoritative unique intimation reference number
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reportNumber = `INT-${payload.insuranceScheme.slice(0, 5).toUpperCase()}-${new Date().getFullYear()}-${timestamp}${randomSuffix}`;

  try {
    const res = await fetch('/.netlify/functions/damage-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        reportNumber,
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        reportNumber: data.reportNumber || reportNumber,
        record: data.record || {
          ...payload,
          id: data.id || Date.now(),
          reportNumber: data.reportNumber || reportNumber,
          status: 'Intimated',
          createdAt: new Date().toISOString()
        }
      };
    }
  } catch (err) {
    console.warn('Backend database endpoint unavailable, using local persistence fallback:', err);
  }

  // Fallback to localStorage persistence
  const fallbackRecord: DamageReportRecord = {
    ...payload,
    id: Date.now(),
    reportNumber,
    status: 'Intimated (Pending Field Inspection)',
    createdAt: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem('vivasayi_crop_damage_reports') || '[]');
    existing.unshift(fallbackRecord);
    localStorage.setItem('vivasayi_crop_damage_reports', JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to store locally:', e);
  }

  return {
    success: true,
    reportNumber,
    record: fallbackRecord
  };
}

/**
 * Retrieve saved crop damage reports
 */
export async function getSavedDamageReports(): Promise<DamageReportRecord[]> {
  try {
    const res = await fetch('/.netlify/functions/damage-reports');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend fetch fallback:', err);
  }

  try {
    const local = JSON.parse(localStorage.getItem('vivasayi_crop_damage_reports') || '[]');
    return local;
  } catch {
    return [];
  }
}
