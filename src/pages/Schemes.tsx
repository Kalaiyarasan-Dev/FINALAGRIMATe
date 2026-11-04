import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  IndianRupee, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Filter, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Sun, 
  Sparkles, 
  Droplets, 
  Tractor, 
  CreditCard, 
  Coins, 
  Sprout 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Scheme {
  id: string;
  nameEn: string;
  nameTa: string;
  departmentEn: string;
  departmentTa: string;
  descriptionEn: string;
  descriptionTa: string;
  benefitEn: string;
  benefitTa: string;
  eligibilityEn: string[];
  eligibilityTa: string[];
  category: 'insurance' | 'subsidy' | 'loan' | 'income' | 'solar' | 'organic';
  amountMin: number;
  amountMax: number;
  deadlineEn: string;
  deadlineTa: string;
  applyLink: string;
  mySchemeLink?: string;
  isCentral: boolean;
  maxLandAcres?: number;
  minLandAcres?: number;
  scstBonus?: boolean;
}

const Schemes: React.FC = () => {
  const navigate = useNavigate();
  const { isTamil, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAuthority, setSelectedAuthority] = useState<'all' | 'central' | 'state'>('all');
  
  // Eligibility Filter Form state
  const [showEligibilityForm, setShowEligibilityForm] = useState(false);
  const [userLandSize, setUserLandSize] = useState('');
  const [userCategory, setUserCategory] = useState<'general' | 'scst'>('general');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);

  const schemes: Scheme[] = [
    {
      id: '1',
      nameEn: 'PM-KISAN Samman Nidhi',
      nameTa: 'பிரதமர் கிசான் சம்மான் நிதி திட்டம்',
      departmentEn: 'Ministry of Agriculture & Farmers Welfare',
      departmentTa: 'மத்திய வேளாண்மை மற்றும் உழவர் நலத்துறை',
      descriptionEn: 'Direct income support of ₹6,000 per year in 3 equal installments of ₹2,000 directly transferred to farmer Aadhaar-linked bank accounts.',
      descriptionTa: 'அனைத்து நிலமுள்ள விவசாய குடும்பங்களுக்கும் ஆண்டுக்கு ₹6,000 நேரடி வருமான ஆதரவு (3 தவணைகளில் தலா ₹2,000).',
      benefitEn: '₹6,000 per annum directly deposited via DBT without any intermediary.',
      benefitTa: 'ஆண்டுக்கு ₹6,000 நேரடியாக வங்கிக் கணக்கில் வரவு வைக்கப்படுகிறது.',
      eligibilityEn: ['All landholding farmer families across India', 'Valid land revenue records (Patta/Chitta)', 'Aadhaar-seeded active bank account'],
      eligibilityTa: ['நாடு முழுவதும் உள்ள அனைத்து நில உரிமையாளர் விவசாயிகள்', 'செல்லுபடியாகும் பட்டா / சிட்டா ஆவணங்கள்', 'ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கு'],
      category: 'income',
      amountMin: 6000,
      amountMax: 6000,
      deadlineEn: 'Continuous Open Enrollment',
      deadlineTa: 'தொடர் பதிவு வசதி',
      applyLink: 'https://pmkisan.gov.in',
      mySchemeLink: 'https://www.myscheme.gov.in/schemes/pm-kisan',
      isCentral: true
    },
    {
      id: '2',
      nameEn: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      nameTa: 'பிரதமர் பயிர் காப்பீட்டு திட்டம்',
      departmentEn: 'Department of Agriculture & Cooperation',
      departmentTa: 'வேளாண்மை மற்றும் விவசாயிகள் நலத்துறை',
      descriptionEn: 'Comprehensive insurance coverage against non-preventable natural risks, flood, drought, pest attack, and unseasonal rains.',
      descriptionTa: 'வறட்சி, வெள்ளம், புயல், பூச்சி தாக்குதல் போன்ற இயற்கை இடர்பாடுகளால் ஏற்படும் பயிர் இழப்பிற்கு முழுமையான காப்பீடு.',
      benefitEn: 'Full sum insured reimbursement for crop loss. Minimal farmer premium: 2% for Kharif, 1.5% for Rabi, 5% for Horticulture.',
      benefitTa: 'பயிர் இழப்பிற்கு முழு காப்பீட்டுத் தொகை. விவசாயி பங்கு: காரிஃப் 2%, ரபி 1.5%, தோட்டக்கலை 5% மட்டுமே.',
      eligibilityEn: ['All farmers growing notified crops in notified areas', 'Sharecroppers and tenant farmers eligible', 'Must enroll within notified cut-off dates'],
      eligibilityTa: ['அறிவிக்கப்பட்ட பகுதிகளில் பயிரிடும் அனைத்து விவசாயிகள்', 'குத்தகை விவசாயிகள் மற்றும் பங்கு பயிரிடுபவர்கள் தகுதியானவர்கள்', 'பருவ விதைப்பு காலக்கெடுவிற்குள் பதிவு செய்தல் வேண்டும்'],
      category: 'insurance',
      amountMin: 10000,
      amountMax: 300000,
      deadlineEn: 'Within 15 days of crop sowing',
      deadlineTa: 'விதைப்பு முடிந்து 15 நாட்களுக்குள்',
      applyLink: 'https://pmfby.gov.in',
      mySchemeLink: 'https://www.myscheme.gov.in/schemes/pmfby',
      isCentral: true
    },
    {
      id: '3',
      nameEn: 'PM-KUSUM Solar Agricultural Pumps',
      nameTa: 'பிரதமர் குசும் சூரிய ஒளி பம்புசெட் திட்டம்',
      departmentEn: 'Ministry of New & Renewable Energy',
      departmentTa: 'புதிய மற்றும் புதுப்பிக்கத்தக்க எரிசக்தி அமைச்சகம்',
      descriptionEn: 'Provides up to 60-90% subsidy for setting up standalone solar agricultural pumps and solarizing existing grid-connected tube wells.',
      descriptionTa: 'விவசாய பயன்பாட்டிற்கு சூரிய ஒளி மின் மோட்டார் மற்றும் ஆழ்துளை பம்புசெட்டுகளுக்கு 60% முதல் 90% வரை அரசு மானியம்.',
      benefitEn: 'Zero electricity bill for farming. Standalone solar pumps from 3 HP to 10 HP with 60-90% combined Central & State subsidy.',
      benefitTa: 'விவசாயத்திற்கு இலவச சூரிய மின்சாரம். 3 HP முதல் 10 HP வரை 60-90% மத்திய-மாநில அரசு மானியம்.',
      eligibilityEn: ['Individual farmers, water user associations, FPOs', 'Cultivable agricultural land with water source', 'Grid or diesel pump replacement'],
      eligibilityTa: ['தனிநபர் விவசாயிகள், பாசன சங்கங்கள், FPO குழுக்கள்', 'நீர் ஆதாரம் கொண்ட விவசாய நிலம்', 'டீசல் அல்லது மின் மோட்டார் மாற்றுதல்'],
      category: 'solar',
      amountMin: 50000,
      amountMax: 350000,
      deadlineEn: 'State allocation quota basis',
      deadlineTa: 'மாநில ஒதுக்கீட்டு முன்னுரிமை அடிப்படையில்',
      applyLink: 'https://pmkusum.mnre.gov.in',
      mySchemeLink: 'https://www.myscheme.gov.in/schemes/pm-kusum',
      isCentral: true
    },
    {
      id: '4',
      nameEn: 'Kisan Credit Card (KCC)',
      nameTa: 'கிசான் கடன் அட்டை (KCC)',
      departmentEn: 'Reserve Bank of India & NABARD',
      departmentTa: 'ரிசர்வ் வங்கி & நபார்டு',
      descriptionEn: 'Provides timely credit to farmers for crop cultivation, fertilizer purchase, post-harvest expenses, and animal husbandry at subsidized interest.',
      descriptionTa: 'பயிர் செலவு, உரம் வாங்குதல் மற்றும் கால்நடை பராமரிப்பிற்கு 4% குறைந்த வட்டியில் கடன் வசதி.',
      benefitEn: 'Credit up to ₹3 Lakh at effective 4% interest rate with prompt repayment incentive. No collateral needed up to ₹1.6 Lakh.',
      benefitTa: '₹3 லட்சம் வரை 4% சலுகை வட்டியில் கடன். ₹1.6 லட்சம் வரை பிணையம் தேவையில்லை.',
      eligibilityEn: ['Owner cultivators, tenant farmers, dairy & poultry farmers', 'Valid Aadhaar, land record (Pahani/Chitta)', 'Good credit history'],
      eligibilityTa: ['நில உரிமையாளர்கள், குத்தகை விவசாயிகள், பால் பண்ணை & கால்நடை வளர்ப்பவர்கள்', 'ஆதார் மற்றும் நில ஆவணங்கள்'],
      category: 'loan',
      amountMin: 25000,
      amountMax: 300000,
      deadlineEn: 'Apply anytime at nearest bank branch',
      deadlineTa: 'வங்கி கிளைகளில் எப்போது வேண்டுமானாலும்',
      applyLink: 'https://www.pmkisan.gov.in',
      mySchemeLink: 'https://www.myscheme.gov.in/schemes/kcc',
      isCentral: true
    },
    {
      id: '5',
      nameEn: 'PM Krishi Sinchayee Yojana (Drip & Sprinkler)',
      nameTa: 'சொட்டு & தெளிப்பு நீர்ப்பாசன மானியம் (PMKSY)',
      departmentEn: 'Department of Agriculture & Farmers Welfare',
      departmentTa: 'வேளாண்மை மற்றும் உழவர் நலத்துறை',
      descriptionEn: '100% subsidy for Small & Marginal farmers and 75% for other farmers to install micro-irrigation systems.',
      descriptionTa: 'சிறு, குறு விவசாயிகளுக்கு 100% மற்றும் இதர விவசாயிகளுக்கு 75% மானியத்தில் சொட்டு நீர் பாசனம் அமைத்தல்.',
      benefitEn: '100% subsidy for farmers having < 5 acres of land. Saves 40-50% water and boosts crop yield by 30-40%.',
      benefitTa: '5 ஏக்கருக்கு உட்பட்ட விவசாயிகளுக்கு 100% முழு மானியம். 40-50% நீர் சேமிப்பு மற்றும் கூடுதல் விளைச்சல்.',
      eligibilityEn: ['Farmers with cultivable land and valid irrigation water source', 'Not availed micro irrigation subsidy in last 7-10 years', 'Land holding up to 12.35 acres'],
      eligibilityTa: ['பாசன நீர் வசதியுள்ள விவசாயிகள்', 'கடந்த 7-10 ஆண்டுகளில் நுண்ணீர்ப்பாசன மானியம் பெறாதவர்கள்', '12.35 ஏக்கர் வரை நிலம்'],
      category: 'subsidy',
      amountMin: 30000,
      amountMax: 180000,
      deadlineEn: 'First-Come First-Served basis',
      deadlineTa: 'முன்னுரிமை பதிவு அடிப்படையில்',
      applyLink: 'https://pmksy.gov.in',
      mySchemeLink: 'https://www.myscheme.gov.in/schemes/pmksy-pdmc',
      isCentral: true,
      maxLandAcres: 12.35
    },
    {
      id: '6',
      nameEn: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      nameTa: 'வேளாண் இயந்திரமயமாக்கல் திட்டம் (SMAM)',
      departmentEn: 'Ministry of Agriculture',
      departmentTa: 'மத்திய வேளாண்மை அமைச்சகம்',
      descriptionEn: 'Financial assistance for purchasing tractors, power tillers, rotavators, paddy transplanters, and harvesters.',
      descriptionTa: 'டிராக்டர், பவர் டில்லர், நெல் நடவு இயந்திரம் மற்றும் அறுவடை இயந்திரங்கள் வாங்க 40% முதல் 50% மானியம்.',
      benefitEn: '40% to 50% subsidy on farm machinery. Extra 10% bonus subsidy for Women, SC, ST, and Small farmers.',
      benefitTa: 'இயந்திர விலையில் 40% முதல் 50% வரை மானியம். பெண்கள், SC/ST மற்றும் சிறு விவசாயிகளுக்கு கூடுதலாக 10% சலுகை.',
      eligibilityEn: ['Registered farmers with valid land records', 'Direct purchase from approved empanelled dealers', 'Not availed machinery subsidy in last 5 years'],
      eligibilityTa: ['நில ஆவணங்களுடன் பதிவு செய்த விவசாயிகள்', 'அங்கீகரிக்கப்பட்ட விற்பனையாளர்களிடம் வாங்குதல்'],
      category: 'subsidy',
      amountMin: 20000,
      amountMax: 500000,
      deadlineEn: 'Annual district quota allotment',
      deadlineTa: 'வருடாந்திர மாவட்ட ஒதுக்கீட்டின்படி',
      applyLink: 'https://agrimachinery.nic.in',
      mySchemeLink: 'https://www.myscheme.gov.in/schemes/smam',
      isCentral: true,
      scstBonus: true
    },
    {
      id: '7',
      nameEn: 'Paramparagat Krishi Vikas Yojana (PKVY Organic)',
      nameTa: 'பாரம்பரிய வேளாண் வளர்ச்சி திட்டம் (இயற்கை விவசாயம்)',
      departmentEn: 'National Centre of Organic Farming',
      departmentTa: 'தேசிய இயற்கை விவசாய மையம்',
      descriptionEn: 'Promotes organic farming through cluster approach and Participatory Guarantee System (PGS) certification with financial aid.',
      descriptionTa: 'குழுவாக இயற்கை விவசாயம் செய்ய மற்றும் PGS இயற்கை சான்றிதழ் பெற விவசாயிகளுக்கு நிதி உதவி.',
      benefitEn: '₹50,000 per hectare over 3 years for organic inputs, Panchagavya preparation, bio-fertilizers, and marketing assistance.',
      benefitTa: '3 ஆண்டுகளில் ஒரு ஹெக்டேருக்கு ₹50,000 வரை இயற்கை உரம், பஞ்சகாவ்யா தயாரிப்பு மற்றும் சந்தைப்படுத்தலுக்கு நிதி.',
      eligibilityEn: ['Farmers willing to form 50-acre clusters for chemical-free organic farming', 'Small and marginal farmers given priority'],
      eligibilityTa: ['ரசாயனமற்ற இயற்கை விவசாயம் செய்ய விரும்பும் விவசாய குழுக்கள்'],
      category: 'organic',
      amountMin: 15000,
      amountMax: 50000,
      deadlineEn: 'Cluster enrollment basis',
      deadlineTa: 'குழு சேர்க்கை அடிப்படையில்',
      applyLink: 'https://pgsindia-ncof.gov.in',
      mySchemeLink: 'https://www.myscheme.gov.in/schemes/pkvy',
      isCentral: true
    },
    {
      id: '8',
      nameEn: 'Tamil Nadu Kalaignar All Village Agri Scheme',
      nameTa: 'கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டம்',
      departmentEn: 'Government of Tamil Nadu - Agriculture Department',
      departmentTa: 'தமிழ்நாடு அரசு - வேளாண்மை துறை',
      descriptionEn: 'Integrated agricultural development in selected village panchayats converting fallow lands into cultivable lands, distribution of free tree saplings and seed kits.',
      descriptionTa: 'கிராம பஞ்சாயத்துகளில் தரிசு நிலங்களை விளைநிலமாக மாற்றுதல், இலவச பழச்செடிகள் மற்றும் தரமான விதை தொகுப்பு வழங்குதல்.',
      benefitEn: 'Free tarpaulin sheets, sprayers, certified seed kits, and solar pump set subsidies for small farmers.',
      benefitTa: 'இலவச தார்பாலின், தெளிப்பான், தரமான விதை தொகுப்புகள் மற்றும் தரிசு நில மேம்பாட்டு மானியங்கள்.',
      eligibilityEn: ['Resident farmers of selected notified village panchayats in Tamil Nadu', 'Registered with Uzhavan App'],
      eligibilityTa: ['தமிழ்நாட்டில் தேர்ந்தெடுக்கப்பட்ட கிராம ஊராட்சிகளில் உள்ள விவசாயிகள்', 'உழவன் செயலியில் பதிவு செய்தவர்கள்'],
      category: 'subsidy',
      amountMin: 5000,
      amountMax: 60000,
      deadlineEn: 'Gram Panchayat season cycle',
      deadlineTa: 'கிராம ஊராட்சி பருவ சுழற்சியின்படி',
      applyLink: 'https://agri.tn.gov.in',
      isCentral: false
    }
  ];

  const categories = [
    { key: 'all', labelEn: 'All Schemes', labelTa: 'அனைத்து திட்டங்கள்' },
    { key: 'income', labelEn: 'Income Support', labelTa: 'வருமான ஆதரவு' },
    { key: 'insurance', labelEn: 'Crop Insurance', labelTa: 'பயிர் காப்பீடு' },
    { key: 'solar', labelEn: 'Solar & Energy', labelTa: 'சூரிய ஒளி பாசனம்' },
    { key: 'subsidy', labelEn: 'Subsidies & Equipment', labelTa: 'மானியங்கள்' },
    { key: 'loan', labelEn: 'Credit & Loans', labelTa: 'விவசாய கடன்' },
    { key: 'organic', labelEn: 'Organic Farming', labelTa: 'இயற்கை விவசாயம்' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'income':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'insurance':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'solar':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'subsidy':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'loan':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'organic':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const isUserEligible = (scheme: Scheme) => {
    if (!filterEligibleOnly) return true;

    if (userLandSize) {
      const land = parseFloat(userLandSize);
      if (scheme.maxLandAcres && land > scheme.maxLandAcres) return false;
      if (scheme.minLandAcres && land < scheme.minLandAcres) return false;
    }

    return true;
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = 
      scheme.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.nameTa.includes(searchQuery) ||
      scheme.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.departmentEn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesAuthority = 
      selectedAuthority === 'all' || 
      (selectedAuthority === 'central' && scheme.isCentral) || 
      (selectedAuthority === 'state' && !scheme.isCentral);

    const matchesEligibility = isUserEligible(scheme);

    return matchesSearch && matchesCategory && matchesAuthority && matchesEligibility;
  });

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in pb-12 max-w-6xl mx-auto">
        {/* Header with Verified Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border border-border p-4 sm:p-5 rounded-3xl shadow-card">
          <div>
            <div className="flex items-center gap-2">
              <h1 className={cn('text-2xl font-bold text-foreground font-heading', isTamil && 'font-tamil')}>
                {isTamil ? 'அரசு விவசாய திட்டங்கள்' : 'Government Farmer Schemes'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                myScheme & OGD Verified
              </span>
            </div>
            <p className={cn('text-xs sm:text-sm text-muted-foreground mt-1', isTamil && 'font-tamil')}>
              {isTamil 
                ? 'மத்திய மற்றும் மாநில அரசுகளின் அதிகாரப்பூர்வ நிதி உதவி, காப்பீடு மற்றும் மானிய திட்டங்கள்' 
                : 'Official Government of India & State welfare schemes, subsidies, direct benefit transfers, and loans'}
            </p>
          </div>

          {/* myScheme.gov.in Official Platform Link */}
          <a
            href="https://www.myscheme.gov.in/search/category/Agriculture,Rural%20&%20Environment"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isTamil ? 'myScheme.gov.in தளத்தில் தேடுக' : 'myScheme Discovery Portal'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Smart Crop Insurance Assistant Highlight */}
        <div 
          onClick={() => navigate('/insurance-assistant')}
          className="cursor-pointer bg-gradient-to-r from-emerald-600/15 via-primary/15 to-blue-600/15 rounded-2xl p-4 border border-primary/25 shadow-soft hover:shadow-md transition-all touch-feedback flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                {isTamil ? 'சிறப்பு வழிகாட்டி' : 'Interactive Assistant'}
              </span>
              <h4 className={cn("text-sm font-bold text-foreground mt-0.5", isTamil && "font-tamil")}>
                {isTamil ? 'PMFBY பிரீமியம் கணக்கீடு மற்றும் காப்பீட்டு வழிகாட்டி' : 'PMFBY Statutory Premium & Insurance Assistant'}
              </h4>
              <p className={cn("text-xs text-muted-foreground", isTamil && "font-tamil")}>
                {isTamil ? 'பயிர்க்கான பிரீமியம் கணக்கிட்டு 72 மணி நேர சேத அறிவிப்பு வழிகாட்டலைப் பெறுங்கள்' : 'Calculate exact subsidized premium share and 72-hour claim intimation guidelines'}
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
        </div>

        {/* Eligibility Matcher Box */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-3">
          <button 
            onClick={() => setShowEligibilityForm(!showEligibilityForm)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <span className={cn('font-semibold text-sm text-foreground', isTamil && 'font-tamil')}>
                {isTamil ? 'தகுதி சரிபார்ப்பு வடிகட்டி (Eligibility Matcher)' : 'Farmer Eligibility Matcher'}
              </span>
            </div>
            <span className="text-xs text-primary font-semibold">
              {showEligibilityForm ? (isTamil ? 'மறை' : 'Hide') : (isTamil ? 'தொடங்கு' : 'Open')}
            </span>
          </button>

          {showEligibilityForm && (
            <div className="pt-2 border-t border-border space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={cn('text-xs font-medium text-foreground block mb-1', isTamil && 'font-tamil')}>
                    {isTamil ? 'நில அளவு (ஏக்கர்)' : 'Your Land Size (Acres)'}
                  </label>
                  <input
                    type="number"
                    value={userLandSize}
                    onChange={(e) => setUserLandSize(e.target.value)}
                    placeholder="e.g. 3.5"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className={cn('text-xs font-medium text-foreground block mb-1', isTamil && 'font-tamil')}>
                    {isTamil ? 'விவசாயி பிரிவு' : 'Farmer Category'}
                  </label>
                  <select
                    value={userCategory}
                    onChange={(e) => setUserCategory(e.target.value as typeof userCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="general">{isTamil ? 'பொது / இதர (General / OBC)' : 'General / OBC'}</option>
                    <option value="scst">{isTamil ? 'ஆதிதிராவிடர் / பழங்குடியினர் (SC / ST)' : 'SC / ST'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="eligible-only"
                  checked={filterEligibleOnly}
                  onChange={(e) => setFilterEligibleOnly(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4"
                />
                <label htmlFor="eligible-only" className={cn('text-xs font-semibold text-foreground cursor-pointer', isTamil && 'font-tamil')}>
                  {isTamil ? 'எனக்கு தகுதியான திட்டங்களை மட்டும் காட்டு' : 'Show only schemes matching my land size & category'}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Search & Central/State Toggle Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTamil ? 'திட்டம் அல்லது மானியத்தை தேடுக...' : 'Search PM-KISAN, PMFBY, solar, drip irrigation...'}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm',
                isTamil && 'font-tamil'
              )}
            />
          </div>

          <div className="flex gap-1.5 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setSelectedAuthority('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                selectedAuthority === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              {isTamil ? 'அனைத்தும்' : 'All'}
            </button>
            <button
              onClick={() => setSelectedAuthority('central')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                selectedAuthority === 'central' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              {isTamil ? 'மத்திய அரசு' : 'Central Gov'}
            </button>
            <button
              onClick={() => setSelectedAuthority('state')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                selectedAuthority === 'state' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              {isTamil ? 'மாநில அரசு' : 'State Gov'}
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-feedback',
                selectedCategory === cat.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground',
                isTamil && 'font-tamil'
              )}
            >
              {language === 'ta' ? cat.labelTa : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Schemes List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchemes.map((scheme) => {
            const hasBonus = scheme.scstBonus && userCategory === 'scst';
            return (
              <div 
                key={scheme.id} 
                className="bg-card rounded-2xl border border-border hover:border-primary/40 shadow-card overflow-hidden flex flex-col justify-between transition-all group"
              >
                {/* Scheme Header */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={cn('text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border', getCategoryColor(scheme.category))}>
                        {language === 'ta' 
                          ? categories.find(c => c.key === scheme.category)?.labelTa 
                          : categories.find(c => c.key === scheme.category)?.labelEn}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {scheme.isCentral ? (isTamil ? 'மத்திய அரசு' : 'Central Gov') : (isTamil ? 'மாநில அரசு' : 'State Gov')}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 text-primary font-bold text-sm bg-primary/10 px-2.5 py-0.5 rounded-lg">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>
                        {scheme.amountMin === scheme.amountMax 
                          ? `₹${scheme.amountMax.toLocaleString()}`
                          : `₹${scheme.amountMin.toLocaleString()} - ₹${scheme.amountMax.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className={cn('text-base font-bold text-foreground leading-snug', isTamil && 'font-tamil')}>
                      {language === 'ta' ? scheme.nameTa : scheme.nameEn}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {language === 'ta' ? scheme.departmentTa : scheme.departmentEn}
                    </p>
                  </div>

                  <p className={cn('text-xs text-muted-foreground leading-relaxed', isTamil && 'font-tamil')}>
                    {language === 'ta' ? scheme.descriptionTa : scheme.descriptionEn}
                  </p>

                  {/* Benefit Card */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <span className={cn('text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block', isTamil && 'font-tamil')}>
                      {isTamil ? 'முக்கிய நன்மைகள் (Key Benefits):' : 'Key Financial & Subsidized Benefits:'}
                    </span>
                    <p className={cn('text-xs text-foreground font-medium mt-1 leading-relaxed', isTamil && 'font-tamil')}>
                      {language === 'ta' ? scheme.benefitTa : scheme.benefitEn}
                    </p>
                    {hasBonus && (
                      <span className="inline-block mt-2 text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                        {isTamil ? '+10% கூடுதல் மானியம் தகுதியானது (SC/ST)' : '+10% Additional SC/ST Subsidy Eligible'}
                      </span>
                    )}
                  </div>

                  {/* Eligibility List */}
                  <div>
                    <span className={cn('text-xs font-semibold text-foreground block mb-1.5', isTamil && 'font-tamil')}>
                      {isTamil ? 'தகுதி வரம்புகள்:' : 'Eligibility Criteria:'}
                    </span>
                    <ul className="space-y-1">
                      {(language === 'ta' ? scheme.eligibilityTa : scheme.eligibilityEn).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className={isTamil ? 'font-tamil' : ''}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className={isTamil ? 'font-tamil' : ''}>
                      {isTamil ? 'காலக்கெடு:' : 'Timeline:'} {language === 'ta' ? scheme.deadlineTa : scheme.deadlineEn}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="p-4 sm:p-5 pt-0 flex gap-2">
                  <a
                    href={scheme.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all touch-feedback shadow-sm',
                      isTamil && 'font-tamil'
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'அதிகாரப்பூர்வ தளம்' : 'Official Portal'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {scheme.mySchemeLink && (
                    <a
                      href={scheme.mySchemeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                      title="View on myScheme"
                    >
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="hidden sm:inline">myScheme</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <p className={cn('text-muted-foreground text-sm', isTamil && 'font-tamil')}>
              {isTamil ? 'தேர்ந்தெடுக்கப்பட்ட விவரங்களுக்கு திட்டங்கள் எதுவும் இல்லை' : 'No government schemes found matching your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Schemes;
