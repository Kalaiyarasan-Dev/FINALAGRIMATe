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
  Loader2, 
  X, 
  HelpCircle, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  Copy, 
  Check, 
  Volume2, 
  RefreshCw,
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';
import { 
  classifyPlantDiseaseFromImage, 
  classifyPlantDiseaseFromSymptoms, 
  DiagnosisResult,
  GEMINI_MODEL,
  fallbackDiseaseDatabase 
} from '@/lib/geminiApi';
import { toast } from 'sonner';

const CropDoctor: React.FC = () => {
  const navigate = useNavigate();
  const { isTamil, language } = useLanguage();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
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

  // Sample quick demos for instant testing
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
    }
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        runImageAnalysis(dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleSelect = async (preset: typeof samplePresets[0]) => {
    setSelectedImage(preset.image);
    setIsAnalyzing(true);
    setDiagnosis(null);
    try {
      // Fetch the sample image and convert to base64 for Gemini
      const res = await fetch(preset.image);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        await runImageAnalysis(base64data, preset.hint);
      };
      reader.readAsDataURL(blob);
    } catch {
      // Fallback
      runImageAnalysis(preset.image, preset.hint);
    }
  };

  const runImageAnalysis = async (dataUrl: string, hint: string) => {
    setIsAnalyzing(true);
    setDiagnosis(null);
    
    try {
      const result = await classifyPlantDiseaseFromImage(dataUrl, hint);
      setDiagnosis(result);
      setAnalysisSource('gemini');

      if (user) {
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

      toast.success(
        isTamil 
          ? 'Gemini AI மூலம் வெற்றிகரமாக நோய் கண்டறியப்பட்டது!' 
          : 'Plant disease diagnosed successfully with Gemini AI!'
      );
    } catch (err) {
      console.error('Diagnosis error:', err);
      toast.error(
        isTamil 
          ? 'நோய் கண்டறிதலில் பிழை ஏற்பட்டது. மாதிரி தரவு காட்டப்படுகிறது.' 
          : 'AI diagnosis failed. Displaying offline backup analysis.'
      );
      setDiagnosis(fallbackDiseaseDatabase.paddy.blight);
      setAnalysisSource('local');
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
    const chemicalText = language === 'ta' ? diagnosis.chemicalRemedyTa : diagnosis.chemicalRemedyEn;
    const organicText = language === 'ta' ? diagnosis.organicRemedyTa : diagnosis.organicRemedyEn;
    
    const speechText = language === 'ta'
      ? `கண்டறியப்பட்ட நோய்: ${diseaseText}. இரசாயன தீர்வு: ${chemicalText}. இயற்கை தீர்வு: ${organicText}.`
      : `Diagnosed condition: ${diseaseText}. Chemical Remedy: ${chemicalText}. Organic Remedy: ${organicText}.`;

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
                    ? 'இலை புண்கள், நோய்க்கிருமிகள் மற்றும் இயற்கை & இரசாயன தீர்வுகள் வகைப்படுத்தப்படுகின்றன'
                    : 'Classifying plant pathology, identifying infection vectors, and calculating dosage remedies'}
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
                      : 'Take a clear close-up photo of the affected leaf, stem, or fruit'}
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
                  {isTamil ? 'அல்லது மாதிரி படங்களை உடனடியாக சோதிக்கவும்:' : 'Or test immediately with sample crop photos:'}
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleSelect(preset)}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
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
                      <span className="text-[10px] text-primary flex items-center gap-1 font-medium mt-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        {isTamil ? 'AI மூலம் சோதி' : 'Diagnose AI'}
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

        {/* Diagnosis Result Card */}
        {diagnosis && !isAnalyzing && (
          <div className="space-y-4 animate-slide-up">
            {/* Top Overview Card */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {analysisSource === 'gemini' ? 'Gemini 3.6 Flash Verified' : 'Offline Engine'}
                    </span>
                    {diagnosis.cropDetectedEn && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-muted text-foreground border border-border">
                        🌱 {language === 'ta' ? (diagnosis.cropDetectedTa || diagnosis.cropDetectedEn) : diagnosis.cropDetectedEn}
                      </span>
                    )}
                    {diagnosis.severity && (
                      <span className={cn('text-[11px] px-2.5 py-0.5 rounded-full font-semibold border', getSeverityBadge(diagnosis.severity).bg)}>
                        <ShieldAlert className="w-3 h-3 inline mr-1" />
                        {language === 'ta' ? getSeverityBadge(diagnosis.severity).labelTa : getSeverityBadge(diagnosis.severity).labelEn}
                      </span>
                    )}
                  </div>
                  <h3 className={cn(
                    'text-xl font-bold text-foreground mt-1',
                    isTamil && 'font-tamil'
                  )}>
                    {language === 'ta' ? diagnosis.diseaseTa : diagnosis.diseaseEn}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">{diagnosis.confidence}%</div>
                    <div className="text-[10px] text-muted-foreground">{isTamil ? 'நம்பகத்தன்மை' : 'Confidence'}</div>
                  </div>
                  <button
                    onClick={handleSpeakDiagnosis}
                    className={cn(
                      'p-2.5 rounded-xl border border-border transition-all flex items-center justify-center',
                      isSpeaking ? 'bg-primary text-white animate-pulse' : 'bg-muted/60 text-foreground hover:bg-muted'
                    )}
                    title="Audio readout"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Symptoms Identified */}
              {((language === 'ta' ? diagnosis.symptomsTa : diagnosis.symptomsEn)?.length > 0) && (
                <div>
                  <h4 className={cn('text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2', isTamil && 'font-tamil')}>
                    {isTamil ? 'கண்டறியப்பட்ட அறிகுறிகள்:' : 'Identified Symptoms:'}
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(language === 'ta' ? diagnosis.symptomsTa : diagnosis.symptomsEn).map((symptom, i) => (
                      <li key={i} className={cn(
                        'text-xs text-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50 flex items-start gap-2',
                        isTamil && 'font-tamil'
                      )}>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Chemical Treatment Remedy Card */}
            <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl p-5 border border-sky-200 dark:border-sky-800 shadow-sm relative group">
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
            </div>

            {/* Organic Treatment Remedy Card */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 shadow-sm relative group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn('text-sm font-bold text-emerald-900 dark:text-emerald-300', isTamil && 'font-tamil')}>
                      {isTamil ? 'இயற்கை & உயிரியல் தீர்வு (ஆர்கானிக்)' : 'Organic & Biological Treatment'}
                    </h3>
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

            {/* Preventative Measures */}
            {((language === 'ta' ? diagnosis.preventionTa : diagnosis.preventionEn)?.length > 0) && (
              <div className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-3">
                <h3 className={cn('text-xs font-bold uppercase tracking-wider text-muted-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'முன்னெச்சரிக்கை & தடுப்பு நடவடிக்கைகள்' : 'Preventative Measures & Best Practices'}
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
