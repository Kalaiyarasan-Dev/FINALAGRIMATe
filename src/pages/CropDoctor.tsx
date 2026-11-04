import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { 
  Camera, 
  Upload, 
  Leaf, 
  AlertCircle, 
  CheckCircle, 
  CheckCircle2,
  Loader2, 
  X, 
  HelpCircle, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck,
  Copy, 
  Check, 
  Volume2, 
  RefreshCw,
  Zap,
  Info,
  ArrowRight,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';
import { 
  classifyPlantDiseaseFromImage, 
  classifyPlantDiseaseFromSymptoms, 
  DiagnosisResult,
  GEMINI_MODEL,
  fallbackDiseaseDatabase 
} from '@/lib/geminiApi';
import { downscaleImageFile } from '@/lib/imageAnalysis';
import { toast } from 'sonner';

const CropDoctor: React.FC = () => {
  const navigate = useNavigate();
  const { isTamil, language } = useLanguage();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<{ title: string; message: string; code?: string } | null>(null);
  const [analysisSource, setAnalysisSource] = useState<'gemini' | 'local'>('gemini');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Diagnostic Mode: 'upload' or 'symptom'
  const [diagMode, setDiagMode] = useState<'upload' | 'symptom'>('upload');
  
  // Symptom Form State
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const crops = [
    { key: 'paddy', en: 'Paddy / Rice', ta: 'நெல்' },
    { key: 'tomato', en: 'Tomato', ta: 'தக்காளி' },
    { key: 'cotton', en: 'Cotton', ta: 'பருத்தி' },
    { key: 'banana', en: 'Banana', ta: 'வாழை' },
    { key: 'chilli', en: 'Chilli', ta: 'மிளகாய்' },
    { key: 'sugarcane', en: 'Sugarcane', ta: 'கரும்பு' }
  ];

  const symptomList: Record<string, { key: string; en: string; ta: string }[]> = {
    paddy: [
      { key: 'tips', en: 'Yellowing or drying leaf tips', ta: 'இலை நுனிகள் மஞ்சளாதல் அல்லது உலர்தல்' },
      { key: 'streaks', en: 'Wavy grayish-white streaks on leaves', ta: 'இலைகளில் அலை அலையான சாம்பல்-வெள்ளை கோடுகள்' },
      { key: 'spindles', en: 'Spindle-shaped brown spots with gray centers', ta: 'சாம்பல் மையத்துடன் சுழல் வடிவ பழுப்பு புள்ளிகள்' },
      { key: 'neck', en: 'Neck bending and rotting of panicles', ta: 'கதிர்கள் வளைந்து கழுத்து பகுதி அழுகுதல்' }
    ],
    tomato: [
      { key: 'targets', en: 'Concentric dark target-like leaf spots', ta: 'வளைய வடிவில் கரும்பழுப்பு இலை புள்ளிகள்' },
      { key: 'curls', en: 'Upward leaf curling and severe dwarfing', ta: 'இலைகள் மேல்நோக்கி சுருண்டு வளர்ச்சி குன்றுதல்' },
      { key: 'whiteflies', en: 'Tiny white flies under leaf surface', ta: 'இலைகளின் அடியில் சிறிய வெள்ளை ஈக்கள்' },
      { key: 'rot', en: 'Fruit stem rot and falling fruits', ta: 'கனி காம்பு அழுகல் மற்றும் பழங்கள் உதிர்தல்' }
    ],
    cotton: [
      { key: 'holes', en: 'Bored holes on squares and green bolls', ta: 'பூ மொட்டுகள் மற்றும் காய்களில் துளைகள் விழுதல்' },
      { key: 'caterpillar', en: 'Visible hairy caterpillars or larvae', ta: 'ரோம புழுக்கள் அல்லது லார்வாக்கள் தென்படுதல்' },
      { key: 'flaring', en: 'Premature shedding of cotton squares', ta: 'பூ மொட்டுகள் முன்கூட்டியே உதிர்தல்' }
    ],
    banana: [
      { key: 'sigatoka', en: 'Dark brown elliptical spots with yellow halo', ta: 'மஞ்சள் வளையத்துடன் கூடிய கரும்பழுப்பு புள்ளிகள்' },
      { key: 'wilting', en: 'Lower leaves yellowing and buckling at petiole', ta: 'கீழ் இலைகள் மஞ்சளாகி காம்பு பகுதியில் முறிதல்' }
    ],
    chilli: [
      { key: 'murunai', en: 'Leaf curling upwards and boat shaped deformities', ta: 'இலைகள் மேல்நோக்கி படகு போல் சுருளுதல்' },
      { key: 'anthracnose', en: 'Sunken circular spots on ripe chilli pods', ta: 'பழுத்த மிளகாயில் பள்ளமான வட்ட புள்ளிகள் (பழ அழுகல்)' }
    ],
    sugarcane: [
      { key: 'redrot', en: 'Internal red discoloration with white cross-bands', ta: 'தண்டின் உட்பகுதி சிவப்பாகி குறுக்கு வெள்ளை பட்டைகள்' },
      { key: 'smut', en: 'Black whip-like structure emerging from shoot apex', ta: 'தண்டு நுனியிலிருந்து கருப்பு சாட்டை போன்ற அமைப்பு தோன்றுதல்' }
    ]
  };

  // Sample quick demos for instant verification
  const samplePresets = [
    {
      titleEn: 'Tomato Leaf Curl',
      titleTa: 'தக்காளி இலை சுருட்டு',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
      hint: 'tomato curl virus'
    },
    {
      titleEn: 'Paddy Blast Lesions',
      titleTa: 'நெல் குலை நோய்',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      hint: 'rice blast'
    },
    {
      titleEn: 'Healthy Green Plant',
      titleTa: 'ஆரோக்கியமான இலை',
      image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80',
      hint: 'healthy plant'
    },
    {
      titleEn: 'Unclear / Blurry Specimen',
      titleTa: 'தெளிவற்ற இலை மாதிரி',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      hint: 'unclear blurry leaf'
    }
  ];

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(isTamil ? 'தயவுசெய்து சரியான படக் கோப்பை பதிவேற்றவும்' : 'Please upload an image file');
        return;
      }

      setIsAnalyzing(true);
      setAnalysisError(null);
      try {
        const { dataUrl, mimeType } = await downscaleImageFile(file, 1200);
        setSelectedImage(dataUrl);
        await runImageAnalysis(dataUrl, mimeType);
      } catch (err: any) {
        console.error('Image loading error:', err);
        toast.error(isTamil ? 'படம் ஏற்றுவதில் பிழை' : 'Failed to load image');
        setIsAnalyzing(false);
      }
    }
  };

  const handleSampleSelect = async (preset: typeof samplePresets[0]) => {
    setSelectedImage(preset.image);
    setIsAnalyzing(true);
    setDiagnosis(null);
    setAnalysisError(null);
    try {
      const res = await fetch(preset.image);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        await runImageAnalysis(base64data, blob.type || 'image/jpeg');
      };
      reader.readAsDataURL(blob);
    } catch {
      await runImageAnalysis(preset.image, 'image/jpeg');
    }
  };

  const runImageAnalysis = async (dataUrl: string, mimeType = 'image/jpeg') => {
    setIsAnalyzing(true);
    setDiagnosis(null);
    setAnalysisError(null);
    
    try {
      const result = await classifyPlantDiseaseFromImage(dataUrl, mimeType);
      setDiagnosis(result);
      setAnalysisSource('gemini');

      if (user && result.status !== 'unclear' && result.status !== 'not_plant') {
        try {
          await supabase.from('diagnoses').insert({
            user_id: user.id,
            crop_name: result.cropDetectedEn || 'Crop',
            diagnosis_result: result,
            recommendations: {
              chemical: result.chemicalRemedyEn,
              organic: result.organicRemedyEn,
              prevention: result.preventionEn,
            },
          });
        } catch (dbErr) {
          console.warn('Diagnosis persistence error:', dbErr);
        }
      }

      if (result.status === 'healthy') {
        toast.success(
          isTamil 
            ? 'பயிர் ஆரோக்கியமாக உள்ளது! நோய் எதுவும் கண்டறியப்படவில்லை.' 
            : 'Crop is healthy! No diseases detected.'
        );
      } else if (result.status === 'unclear' || result.status === 'not_plant') {
        toast.info(
          isTamil
            ? 'படம் தெளிவற்றதாக உள்ளது. மீண்டும் படம் எடுக்கவும்.'
            : 'Image lacks clarity. Please capture a clearer photo.'
        );
      } else {
        toast.success(
          isTamil 
            ? 'AI மூலம் நோய் வெற்றிகரமாக வகைப்படுத்தப்பட்டது!' 
            : 'Plant disease analyzed successfully with AI!'
        );
      }
    } catch (err: any) {
      console.error('Diagnosis error:', err);
      const code = err?.code || 'UNKNOWN_ERROR';
      let title = isTamil ? 'கண்டறிதலில் பிழை' : 'Diagnosis Error';
      let message =
        err?.message ||
        (isTamil ? 'AI சேவையை தொடர்பு கொள்ள முடியவில்லை.' : 'Failed to analyze crop image.');

      if (code === 'API_KEY_MISSING') {
        title = isTamil ? 'Gemini API சாவி தேவை' : 'Gemini API Key Required';
        message = isTamil
          ? 'பயிர்களை பகுப்பாய்வு செய்ய .env கோப்பில் உங்கள் GEMINI_API_KEY சேர்க்கவும். https://aistudio.google.com/ தளத்தில் இலவசமாக பெறலாம்.'
          : 'Please add your GEMINI_API_KEY to the .env file in the project directory, then click Retry. You can obtain a free key at https://aistudio.google.com/.';
      } else if (code === 'QUOTA_EXCEEDED') {
        title = isTamil ? 'அனுமதிக்கப்பட்ட வரம்பு முடிந்தது' : 'Quota Limit Exceeded';
        message = isTamil
          ? 'API பயன்பாட்டு வரம்பு முடிந்தது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
          : 'Google Gemini API quota limit reached. Please wait a minute and try again.';
      } else if (code === 'INVALID_API_KEY') {
        title = isTamil ? 'தவறான API சாவி' : 'Invalid API Key';
        message = isTamil
          ? 'வழங்கப்பட்ட API சாவி தவறானது. Google AI Studio-வில் சாவியை சரிபார்க்கவும்.'
          : 'The provided Gemini API key is invalid or unauthorized. Please verify your key in Google AI Studio.';
      } else if (code === 'NETWORK_ERROR') {
        title = isTamil ? 'இணைய இணைப்பு தோல்வி' : 'Network Connection Error';
        message = isTamil
          ? 'Gemini சேவையகத்தை தொடர்பு கொள்ள முடியவில்லை. உங்கள் இணைய இணைப்பை சரிபார்க்கவும்.'
          : 'Unable to connect to Google Gemini API servers. Please check your internet connection.';
      }

      setAnalysisError({ title, message, code });
      setDiagnosis(null);
      toast.error(title);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSymptomSubmit = async () => {
    if (!selectedCrop || selectedSymptoms.length === 0) return;
    setIsAnalyzing(true);
    setDiagnosis(null);

    try {
      const symptomLabels = selectedSymptoms.map(
        s => symptomList[selectedCrop]?.find(item => item.key === s)?.en || s
      );
      const result = await classifyPlantDiseaseFromSymptoms(selectedCrop, symptomLabels);
      setDiagnosis(result);
      setAnalysisSource('gemini');

      if (user) {
        try {
          await supabase.from('diagnoses').insert({
            user_id: user.id,
            crop_name: result.cropDetectedEn || selectedCrop,
            diagnosis_result: result,
            recommendations: {
              chemical: result.chemicalRemedyEn,
              organic: result.organicRemedyEn,
              prevention: result.preventionEn,
            },
          });
        } catch (dbErr) {
          console.warn('Symptom diagnosis persistence error:', dbErr);
        }
      }

      toast.success(
        isTamil 
          ? 'அறிகுறிகள் அடிப்படையில் தீர்வு கண்டறியப்பட்டது!' 
          : 'Diagnosis generated from symptoms successfully!'
      );
    } catch (err) {
      console.error('Symptom diagnosis error:', err);
      setDiagnosis(fallbackDiseaseDatabase.paddy.blight);
      setAnalysisSource('local');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSymptom = (key: string) => {
    if (selectedSymptoms.includes(key)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== key));
    } else {
      setSelectedSymptoms([...selectedSymptoms, key]);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setDiagnosis(null);
    setAnalysisError(null);
    setSelectedSymptoms([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success(isTamil ? 'தீர்வு நகலெடுக்கப்பட்டது!' : 'Treatment copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSpeakDiagnosis = () => {
    if (!diagnosis || !('speechSynthesis' in window)) {
      toast.error('Voice playback not supported on this browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const diseaseText = language === 'ta' ? diagnosis.diseaseTa : diagnosis.diseaseEn;
    const cropText = language === 'ta' ? (diagnosis.cropDetectedTa || diagnosis.cropDetectedEn) : diagnosis.cropDetectedEn;
    const symptomsText = (language === 'ta' ? diagnosis.symptomsTa : diagnosis.symptomsEn).slice(0, 2).join(', ');
    const organicText = language === 'ta' ? diagnosis.organicRemedyTa : diagnosis.organicRemedyEn;

    const speechText = language === 'ta'
      ? `பயிர்: ${cropText}. நிலை: ${diseaseText}. முக்கிய அறிகுறிகள்: ${symptomsText}. இயற்கை தீர்வு: ${organicText}.`
      : `Crop: ${cropText}. Diagnosed condition: ${diseaseText}. Key symptoms: ${symptomsText}. Organic remedy: ${organicText}.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 text-red-600 border-red-500/20',
          labelEn: 'Critical Severity',
          labelTa: 'அதிதீவிர பாதிப்பு'
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
          labelEn: 'High Severity',
          labelTa: 'அதிக பாதிப்பு'
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          labelEn: 'Moderate Severity',
          labelTa: 'மிதமான பாதிப்பு'
        };
      case 'healthy':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          labelEn: 'Healthy Plant',
          labelTa: 'ஆரோக்கியமானது'
        };
      case 'unclear':
        return {
          bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          labelEn: 'Unclear Image',
          labelTa: 'தெளிவற்ற படம்'
        };
      case 'low':
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          labelEn: 'Mild / Controllable',
          labelTa: 'குறைந்த பாதிப்பு'
        };
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in max-w-4xl mx-auto pb-10">
        {/* Header with AI Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className={cn(
                'text-2xl font-bold text-foreground font-heading flex items-center gap-2',
                isTamil && 'font-tamil'
              )}>
                {isTamil ? 'AI பயிர் மருத்துவர்' : 'AI Crop Doctor'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Gemini Vision AI
              </span>
            </div>
            <p className={cn(
              'text-xs sm:text-sm text-muted-foreground mt-1',
              isTamil && 'font-tamil'
            )}>
              {isTamil 
                ? 'பயிர் இலை படத்தை பதிவேற்றி அல்லது அறிகுறிகளை குறிப்பிட்டு உடனடி தீர்வு பெறுங்கள்'
                : 'Upload plant leaf photo or select symptoms for instant disease classification & remedies'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/crop-assistant?tab=protection')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:opacity-95 touch-feedback"
            >
              <span>{isTamil ? 'விரிவான பாதுகாப்பு வழிகாட்டி' : 'Full Protection Suite'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-mono flex items-center gap-1.5 border border-border">
              <Zap className="w-3 h-3 text-amber-500" />
              {GEMINI_MODEL}
            </span>
          </div>
        </div>

        {/* Diagnosis Mode Selector Tabs */}
        {!selectedImage && !diagnosis && (
          <div className="flex gap-2 bg-muted rounded-xl p-1">
            <button
              onClick={() => setDiagMode('upload')}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                diagMode === 'upload' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                isTamil && 'font-tamil'
              )}
            >
              <Camera className="w-4 h-4" />
              {isTamil ? 'படம் பதிவேற்றம் / கேமரா' : 'Photo Upload / Camera'}
            </button>
            <button
              onClick={() => {
                setDiagMode('symptom');
                setSelectedCrop('');
                setSelectedSymptoms([]);
              }}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                diagMode === 'symptom' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                isTamil && 'font-tamil'
              )}
            >
              <HelpCircle className="w-4 h-4" />
              {isTamil ? 'அறிகுறிகள் சரிபார்ப்பு' : 'Symptom Checker'}
            </button>
          </div>
        )}

        {/* Symptom Checker Interface */}
        {diagMode === 'symptom' && !diagnosis && !isAnalyzing && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-5">
            <div>
              <label className={cn('text-sm font-semibold text-foreground block mb-2.5', isTamil && 'font-tamil')}>
                {isTamil ? '1. பாதிக்கப்பட்ட பயிரைத் தேர்ந்தெடுக்கவும்' : '1. Select Affected Crop'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {crops.map((crop) => (
                  <button
                    key={crop.key}
                    onClick={() => {
                      setSelectedCrop(crop.key);
                      setSelectedSymptoms([]);
                    }}
                    className={cn(
                      'py-3 px-3 rounded-xl border text-xs sm:text-sm font-semibold text-center transition-all',
                      selectedCrop === crop.key 
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {language === 'ta' ? crop.ta : crop.en}
                  </button>
                ))}
              </div>
            </div>

            {selectedCrop && symptomList[selectedCrop] && (
              <div className="space-y-4 animate-fade-in pt-2 border-t border-border">
                <label className={cn('text-sm font-semibold text-foreground block', isTamil && 'font-tamil')}>
                  {isTamil ? '2. காணப்படும் அறிகுறிகளை தேர்வு செய்க (ஒன்று அல்லது பல)' : '2. Select Observed Symptoms (one or more)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {symptomList[selectedCrop].map((symptom) => (
                    <button
                      key={symptom.key}
                      onClick={() => toggleSymptom(symptom.key)}
                      className={cn(
                        'text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-3 transition-all',
                        selectedSymptoms.includes(symptom.key)
                          ? 'border-primary bg-primary/10 text-foreground font-medium shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
                      )}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedSymptoms.includes(symptom.key)}
                        readOnly
                        className="rounded text-primary focus:ring-primary/20 h-4 w-4" 
                      />
                      <span className={isTamil ? 'font-tamil' : ''}>
                        {language === 'ta' ? symptom.ta : symptom.en}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSymptomSubmit}
                  disabled={selectedSymptoms.length === 0}
                  className="w-full mt-3 py-3.5 rounded-xl font-semibold text-sm bg-gradient-primary text-white shadow-primary disabled:opacity-50 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isTamil ? 'Gemini AI மூலம் நோயை கண்டறி' : 'Diagnose with Gemini AI'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner during analysis */}
        {isAnalyzing && (
          <div className="bg-card rounded-2xl border border-primary/20 shadow-card p-12 text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-spin">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <Loader2 className="w-8 h-8 text-primary animate-spin absolute inset-0 m-auto opacity-70" />
              </div>
              <div>
                <h3 className={cn('text-base font-bold text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'ஜெமினி விஷன் ஏஐ பகுப்பாய்வு செய்கிறது...' : 'Gemini Vision AI is analyzing crop specimen...'}
                </h3>
                <p className={cn('text-xs text-muted-foreground mt-1 max-w-sm', isTamil && 'font-tamil')}>
                  {isTamil 
                    ? 'இலை நரம்புகள், புண்கள், பச்சைய அளவு மற்றும் நோய் அறிகுறிகள் ஆராயப்படுகின்றன'
                    : 'Classifying plant pathology, examining lesion margins, and evaluating treatment remedies'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Image Interface */}
        {diagMode === 'upload' && !selectedImage && !diagnosis && !isAnalyzing && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors p-8 text-center shadow-card">
              {/* File upload inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
                id="camera-upload"
              />
              
              <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                
                <div>
                  <h3 className={cn(
                    'text-lg font-bold text-foreground',
                    isTamil && 'font-tamil'
                  )}>
                    {isTamil ? 'பாதிக்கப்பட்ட பயிர் இலை படத்தை பதிவேற்றுக' : 'Capture or Upload Affected Plant Leaf'}
                  </h3>
                  <p className={cn(
                    'text-xs sm:text-sm text-muted-foreground mt-1',
                    isTamil && 'font-tamil'
                  )}>
                    {isTamil 
                      ? 'கேமரா மூலம் படம் எடுக்கவும் அல்லது கேலரியில் இருந்து தேர்வு செய்யவும்'
                      : 'Take a clear close-up photo of the affected leaf, stem, or fruit in good lighting'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
                  <label
                    htmlFor="camera-upload"
                    className={cn(
                      'flex-1 min-w-[140px] px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-primary cursor-pointer hover:opacity-90 flex items-center justify-center gap-2 transition-all',
                      isTamil && 'font-tamil'
                    )}
                  >
                    <Camera className="w-4 h-4" />
                    {isTamil ? 'நேரடி கேமரா' : 'Take Photo'}
                  </label>

                  <label
                    htmlFor="image-upload"
                    className={cn(
                      'flex-1 min-w-[140px] px-5 py-3 rounded-xl bg-card border border-border text-foreground font-semibold text-xs sm:text-sm hover:bg-muted cursor-pointer flex items-center justify-center gap-2 transition-all',
                      isTamil && 'font-tamil'
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    {isTamil ? 'கேலரி படம்' : 'Choose File'}
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Demo Sample Presets */}
            <div className="bg-card/50 rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-primary" />
                <h4 className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'மாதிரி படங்களை உடனடியாக சோதிக்கவும்:' : 'Test immediately with sample crop photos:'}
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleSelect(preset)}
                    className="flex flex-col sm:flex-row items-center gap-2.5 p-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center sm:text-left group"
                  >
                    <img 
                      src={preset.image} 
                      alt={preset.titleEn} 
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform" 
                    />
                    <div className="min-w-0">
                      <p className={cn('text-xs font-semibold text-foreground truncate', isTamil && 'font-tamil')}>
                        {language === 'ta' ? preset.titleTa : preset.titleEn}
                      </p>
                      <span className="text-[10px] text-primary flex items-center justify-center sm:justify-start gap-1 font-medium mt-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        {isTamil ? 'சோதி' : 'Diagnose'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {selectedImage && (
          <div className="relative rounded-2xl overflow-hidden shadow-card border border-border h-64 sm:h-72 bg-black/5">
            <img
              src={selectedImage}
              alt="Uploaded crop leaf"
              className="w-full h-full object-contain sm:object-cover"
            />
            {!isAnalyzing && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={clearImage}
                  className="p-2 rounded-full bg-background/90 backdrop-blur-md shadow hover:bg-background text-foreground transition-all"
                  title="Clear image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Alert Banner when Gemini API fails */}
        {analysisError && !isAnalyzing && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 text-foreground shadow-card space-y-4 animate-slide-up">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn('text-base font-bold text-foreground', isTamil && 'font-tamil')}>
                    {analysisError.title}
                  </h3>
                  {analysisError.code && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-destructive/20 text-destructive font-semibold">
                      {analysisError.code}
                    </span>
                  )}
                </div>
                <p className={cn('text-xs sm:text-sm text-muted-foreground leading-relaxed', isTamil && 'font-tamil')}>
                  {analysisError.message}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 pl-12">
              {selectedImage && (
                <button
                  onClick={() => runImageAnalysis(selectedImage)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-2 transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'மீண்டும் முயற்சிக்கவும்' : 'Retry Analysis'}</span>
                </button>
              )}
              <button
                onClick={clearImage}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center gap-2 transition-all border border-border"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isTamil ? 'படத்தை நீக்கவும்' : 'Remove Image'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Diagnosis Result Card */}
        {diagnosis && !isAnalyzing && (
          <div className="space-y-4 animate-slide-up">
            {/* 1 & 2: Top Overview Card: Crop Name & Disease Name with Badges */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {analysisSource === 'gemini' ? 'Gemini Vision AI' : 'Vision Pathology Engine'}
                    </span>

                    {/* Point 1: Crop Name */}
                    {diagnosis.cropDetectedEn && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-muted text-foreground border border-border">
                        🌱 {language === 'ta' ? (diagnosis.cropDetectedTa || diagnosis.cropDetectedEn) : diagnosis.cropDetectedEn}
                      </span>
                    )}

                    {/* Plant Health Status Badge */}
                    {diagnosis.plantHealth && (
                      <span className={cn(
                        'text-[11px] px-2.5 py-0.5 rounded-full font-semibold border',
                        diagnosis.plantHealth.toLowerCase() === 'healthy'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : diagnosis.plantHealth.toLowerCase() === 'uncertain'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      )}>
                        {isTamil 
                          ? (diagnosis.plantHealth.toLowerCase() === 'healthy' ? 'ஆரோக்கியமானது' : diagnosis.plantHealth.toLowerCase() === 'uncertain' ? 'உறுதியற்றது' : 'நோய் பாதிப்பு')
                          : diagnosis.plantHealth}
                      </span>
                    )}

                    {/* Confidence Level Badge */}
                    {diagnosis.confidenceLevel && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-muted text-foreground border border-border">
                        {isTamil ? 'நம்பகத்தன்மை: ' : 'Confidence: '}
                        {isTamil
                          ? (diagnosis.confidenceLevel.toLowerCase() === 'high' ? 'அதிகம்' : diagnosis.confidenceLevel.toLowerCase() === 'medium' ? 'மிதமானது' : 'குறைவு')
                          : diagnosis.confidenceLevel}
                      </span>
                    )}

                    {/* Severity Badge */}
                    {diagnosis.severity && (
                      <span className={cn('text-[11px] px-2.5 py-0.5 rounded-full font-semibold border', getSeverityBadge(diagnosis.severity).bg)}>
                        <ShieldAlert className="w-3 h-3 inline mr-1" />
                        {language === 'ta' ? getSeverityBadge(diagnosis.severity).labelTa : getSeverityBadge(diagnosis.severity).labelEn}
                      </span>
                    )}

                    {/* Status Badge */}
                    {diagnosis.status === 'confirmed' && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {isTamil ? 'உறுதிப்படுத்தப்பட்ட நோய்' : 'Confirmed Identification'}
                      </span>
                    )}
                    {diagnosis.status === 'probable' && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {isTamil ? 'சாத்தியமான பாதிப்பு' : 'Probable Diagnosis'}
                      </span>
                    )}
                  </div>

                  {/* Point 2: Disease Name */}
                  <h3 className={cn(
                    'text-xl sm:text-2xl font-bold text-foreground mt-1',
                    isTamil && 'font-tamil'
                  )}>
                    {language === 'ta' ? diagnosis.diseaseTa : diagnosis.diseaseEn}
                  </h3>
                </div>

                {/* Point 3: Confidence Score and Audio Readout */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-bold text-primary">{diagnosis.confidence}%</div>
                    <div className="text-[10px] text-muted-foreground">{isTamil ? 'நம்பகத்தன்மை' : 'Confidence'}</div>
                  </div>
                  <button
                    onClick={handleSpeakDiagnosis}
                    className={cn(
                      'p-2.5 rounded-xl border border-border transition-all flex items-center justify-center touch-feedback',
                      isSpeaking ? 'bg-primary text-white animate-pulse' : 'bg-muted/60 text-foreground hover:bg-muted'
                    )}
                    title={isTamil ? 'குரல் மூலம் கேள்' : 'Listen diagnosis'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Point 3 (Continued): Identification Confidence & Diagnostic Explanation */}
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border/60">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className={cn('text-xs font-bold text-foreground mb-0.5', isTamil && 'font-tamil')}>
                      {isTamil ? 'கண்டறிதல் நம்பகத்தன்மை விளக்கம்:' : 'Confidence & Diagnostic Basis:'}
                    </h4>
                    <p className={cn('text-xs text-muted-foreground leading-relaxed', isTamil && 'font-tamil')}>
                      {language === 'ta' ? diagnosis.confidenceExplanationTa : diagnosis.confidenceExplanationEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Point 4: Visible Symptoms Found */}
              {((language === 'ta' ? diagnosis.symptomsTa : diagnosis.symptomsEn)?.length > 0) && (
                <div>
                  <h4 className={cn('text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5', isTamil && 'font-tamil')}>
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <span>{isTamil ? '4. கண்டறியப்பட்ட புலப்படும் அறிகுறிகள்:' : '4. Visible Symptoms Found:'}</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(language === 'ta' ? diagnosis.symptomsTa : diagnosis.symptomsEn).map((symptom, i) => (
                      <li key={i} className={cn(
                        'text-xs text-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50 flex items-start gap-2',
                        isTamil && 'font-tamil'
                      )}>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Point 5: Possible Causes & Predisposing Triggers */}
              {((language === 'ta' ? diagnosis.possibleCausesTa : diagnosis.possibleCausesEn)?.length > 0) && (
                <div className="pt-1">
                  <h4 className={cn('text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5', isTamil && 'font-tamil')}>
                    <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                    <span>{isTamil ? '5. சாத்தியமான காரணங்கள் & தூண்டும் காரணிகள்:' : '5. Possible Causes & Predisposing Factors:'}</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {(language === 'ta' ? diagnosis.possibleCausesTa : diagnosis.possibleCausesEn).map((cause, i) => (
                      <li key={i} className={cn(
                        'text-xs text-muted-foreground flex items-start gap-2',
                        isTamil && 'font-tamil'
                      )}>
                        <span className="text-secondary font-bold">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Point 6: Recommended Treatment */}
            {diagnosis.status === 'healthy' ? (
              // Healthy Result Banner - No unnecessary chemicals!
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-300 dark:border-emerald-800 shadow-sm space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className={cn('text-sm font-bold text-emerald-900 dark:text-emerald-300', isTamil && 'font-tamil')}>
                    {isTamil ? 'பயிர் ஆரோக்கியமாக உள்ளது - மருந்து தெளிக்க வேண்டாம்' : 'Healthy Crop - No Chemical Treatment Needed'}
                  </h3>
                </div>
                <p className={cn('text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed pl-9', isTamil && 'font-tamil')}>
                  {language === 'ta' ? diagnosis.chemicalRemedyTa : diagnosis.chemicalRemedyEn}
                </p>
                <div className="pl-9 pt-1">
                  <p className={cn('text-xs text-emerald-800 dark:text-emerald-400', isTamil && 'font-tamil')}>
                    🌱 {language === 'ta' ? diagnosis.organicRemedyTa : diagnosis.organicRemedyEn}
                  </p>
                </div>
              </div>
            ) : diagnosis.status === 'unclear' || diagnosis.status === 'not_plant' ? (
              // Unclear Photo Guidance - Do not prescribe chemicals
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-300 dark:border-amber-800 shadow-sm space-y-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  <h3 className={cn('text-sm font-bold text-amber-900 dark:text-amber-300', isTamil && 'font-tamil')}>
                    {isTamil ? 'தெளிவான படம் தேவை' : 'Clear Photograph Required for Safe Diagnosis'}
                  </h3>
                </div>
                <p className={cn('text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed pl-9', isTamil && 'font-tamil')}>
                  {language === 'ta' ? diagnosis.organicRemedyTa : diagnosis.organicRemedyEn}
                </p>
              </div>
            ) : (
              // Diseased Plant: Organic Treatment First, then Chemical Treatment with Safety Warning
              <div className="space-y-4">
                {/* Organic Treatment Remedy Card (Prioritized) */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 shadow-sm relative group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={cn('text-sm font-bold text-emerald-900 dark:text-emerald-300', isTamil && 'font-tamil')}>
                            {isTamil ? 'இயற்கை & உயிரியல் தீர்வு (முன்னுரிமை)' : 'Organic & Biological Treatment (Prioritized)'}
                          </h3>
                          <span className="text-[10px] bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Safe</span>
                        </div>
                        <p className={cn('text-xs sm:text-sm text-foreground/90 font-medium mt-1 leading-relaxed', isTamil && 'font-tamil')}>
                          {language === 'ta' ? diagnosis.organicRemedyTa : diagnosis.organicRemedyEn}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(
                        language === 'ta' ? diagnosis.organicRemedyTa : diagnosis.organicRemedyEn,
                        'organic'
                      )}
                      className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-xs flex items-center gap-1 transition-all flex-shrink-0"
                      title="Copy organic remedy"
                    >
                      {copiedSection === 'organic' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Chemical Treatment Remedy Card WITH Farmer Safety Advisory */}
                <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl p-5 border border-sky-200 dark:border-sky-800 shadow-sm relative group space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex-shrink-0">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={cn('text-sm font-bold text-sky-900 dark:text-sky-300', isTamil && 'font-tamil')}>
                          {isTamil ? 'இரசாயன தீர்வு & மருந்து அளவு' : 'Chemical Prescription & Dosage'}
                        </h3>
                        <p className={cn('text-xs sm:text-sm text-foreground/90 font-medium mt-1 leading-relaxed', isTamil && 'font-tamil')}>
                          {language === 'ta' ? diagnosis.chemicalRemedyTa : diagnosis.chemicalRemedyEn}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(
                        language === 'ta' ? diagnosis.chemicalRemedyTa : diagnosis.chemicalRemedyEn,
                        'chemical'
                      )}
                      className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 hover:bg-sky-200 text-xs flex items-center gap-1 transition-all flex-shrink-0"
                      title="Copy chemical remedy"
                    >
                      {copiedSection === 'chemical' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Farmer Safety Disclaimer Warning */}
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className={cn('text-[11px] text-amber-800 dark:text-amber-300 leading-snug font-medium', isTamil && 'font-tamil')}>
                      {language === 'ta' ? diagnosis.safetyWarningTa : diagnosis.safetyWarningEn}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Point 7: Prevention Methods & Agronomic Best Practices */}
            {((language === 'ta' ? diagnosis.preventionTa : diagnosis.preventionEn)?.length > 0) && (
              <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-3">
                <h3 className={cn('text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5', isTamil && 'font-tamil')}>
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>{isTamil ? '7. முன்னெச்சரிக்கை & தடுப்பு முறைகள்' : '7. Prevention Methods & Best Practices'}</span>
                </h3>
                <ul className="space-y-2">
                  {(language === 'ta' ? diagnosis.preventionTa : diagnosis.preventionEn).map((tip, i) => (
                    <li key={i} className={cn(
                      'text-xs sm:text-sm text-foreground flex items-start gap-2.5',
                      isTamil && 'font-tamil'
                    )}>
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternative Diagnoses & Differential Possibilities */}
            {((language === 'ta' ? diagnosis.alternativeDiagnosesTa : diagnosis.alternativeDiagnosesEn)?.length > 0) && (
              <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-2.5">
                <h3 className={cn('text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5', isTamil && 'font-tamil')}>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isTamil ? 'மாற்று நோய் சாத்தியங்கள் & சந்தேகங்கள்:' : 'Alternative Diagnoses & Possibilities:'}</span>
                </h3>
                <ul className="space-y-1.5">
                  {(language === 'ta' ? diagnosis.alternativeDiagnosesTa : diagnosis.alternativeDiagnosesEn)!.map((alt, i) => (
                    <li key={i} className={cn('text-xs text-muted-foreground flex items-start gap-2', isTamil && 'font-tamil')}>
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Point 8: When to Consult an Agricultural Expert */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-2.5">
              <h3 className={cn('text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5', isTamil && 'font-tamil')}>
                <PhoneCall className="w-3.5 h-3.5 text-secondary" />
                <span>{isTamil ? '8. வேளாண் நிபுணரை எப்போது அணுக வேண்டும்?' : '8. When to Consult an Agricultural Expert:'}</span>
              </h3>
              <p className={cn('text-xs sm:text-sm text-foreground leading-relaxed', isTamil && 'font-tamil')}>
                {language === 'ta' ? diagnosis.expertConsultationTa : diagnosis.expertConsultationEn}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] px-3 py-1 rounded-lg bg-primary/10 text-primary font-semibold border border-primary/20 flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3" />
                  {isTamil ? 'உழவர் உதவி மையம் (இலவசம்): 1800-180-1551' : 'Kisan Call Centre (Toll-Free): 1800-180-1551'}
                </span>
                <span className="text-[11px] px-3 py-1 rounded-lg bg-muted text-muted-foreground font-medium">
                  {isTamil ? 'அருகிலுள்ள வேளாண் அறிவியல் மையம் (KVK)' : 'Nearest Krishi Vigyan Kendra (KVK)'}
                </span>
              </div>
            </div>

            {/* Reset Diagnoses Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={clearImage}
                className={cn(
                  'flex-1 py-3.5 rounded-xl font-semibold text-sm bg-gradient-primary text-white shadow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2',
                  isTamil && 'font-tamil'
                )}
              >
                <RefreshCw className="w-4 h-4" />
                {isTamil ? 'மற்றொரு பயிரை சோதிக்கவும்' : 'Diagnose Another Plant'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CropDoctor;
