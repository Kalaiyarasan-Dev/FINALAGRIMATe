import React, { useState, useRef } from 'react';
import { 
  Leaf, 
  Sparkles, 
  Camera, 
  Upload, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  PhoneCall, 
  Droplet, 
  Thermometer, 
  Info, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ProtectionRequest, 
  ProtectionRecommendation, 
  getCropProtectionRecommendations,
  validateCropImage,
  fileToBase64,
  CROP_VARIETIES_MAP,
  COMMON_SYMPTOMS_BY_CROP 
} from '@/services/cropProtectionService';
import { MONITORED_CROPS } from '@/services/weatherService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CropProtectionSectionProps {
  initialWeatherContext?: { temp?: number; humidity?: number; condition?: string };
}

export const CropProtectionSection: React.FC<CropProtectionSectionProps> = ({ initialWeatherContext }) => {
  const { isTamil, language } = useLanguage();

  // Form Inputs
  const [selectedCropKey, setSelectedCropKey] = useState<string>('paddy');
  const [cropVariety, setCropVariety] = useState<string>('');
  const [growthStage, setGrowthStage] = useState<string>('Tillering / Vegetative');
  const [locationName, setLocationName] = useState<string>('Thanjavur, Tamil Nadu');
  
  // Weather
  const [temp, setTemp] = useState<number>(initialWeatherContext?.temp ?? 31);
  const [humidity, setHumidity] = useState<number>(initialWeatherContext?.humidity ?? 68);
  const [weatherCondition, setWeatherCondition] = useState<string>(initialWeatherContext?.condition ?? 'Partly Cloudy');

  // Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState<string>('');

  // Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recommendation State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<ProtectionRecommendation | null>(null);

  const currentCropObj = MONITORED_CROPS.find(c => c.id === selectedCropKey) || MONITORED_CROPS[0];
  const varieties = CROP_VARIETIES_MAP[selectedCropKey] || [];
  const commonSymptoms = COMMON_SYMPTOMS_BY_CROP[selectedCropKey] || COMMON_SYMPTOMS_BY_CROP.general;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateCropImage(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    try {
      const b64 = await fileToBase64(file);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageBase64(b64);
      toast.success(isTamil ? 'பயிர் புகைப்படம் வெற்றிகரமாக பதிவேற்றப்பட்டது' : 'Crop photo uploaded successfully');
    } catch (err) {
      console.error('Image reading error:', err);
      toast.error('Failed to read image');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleSymptom = (symptomText: string) => {
    if (selectedSymptoms.includes(symptomText)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptomText));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomText]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCropKey) {
      toast.error(isTamil ? 'பயிரைத் தேர்ந்தெடுக்கவும்' : 'Please select a crop');
      return;
    }

    setIsLoading(true);
    try {
      const payload: ProtectionRequest = {
        cropName: currentCropObj.nameEn,
        cropVariety: cropVariety || 'Standard Cultivar',
        growthStage,
        location: locationName,
        weatherConditions: {
          temp,
          humidity,
          condition: weatherCondition
        },
        symptoms: selectedSymptoms,
        customDescription,
        imageBase64: imageBase64 || undefined,
        imageMimeType: imageFile?.type || 'image/jpeg'
      };

      const result = await getCropProtectionRecommendations(payload);
      setRecommendation(result);
      toast.success(isTamil ? 'பயிர் பாதுகாப்பு வழிகாட்டுதல் தயாராக உள்ளது' : 'Crop protection advisory generated');
      
      // Smooth scroll to recommendation output
      setTimeout(() => {
        document.getElementById('protection-result-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      console.error('Diagnosis failed:', err);
      toast.error(isTamil ? 'பரிந்துரை பெறுவதில் தோல்வி' : 'Could not generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-primary/10 to-teal-600/10 rounded-2xl p-5 border border-primary/20 shadow-soft">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-primary flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className={cn("text-base font-bold text-foreground", isTamil && "font-tamil")}>
              {isTamil ? 'AI பயிர் பாதுகாப்பு மற்றும் பூச்சி-நோய் மேலாண்மை வழிகாட்டி' : 'AI-Based Crop Protection & Health Advisor'}
            </h3>
            <p className={cn("text-xs text-muted-foreground mt-1 leading-relaxed", isTamil && "font-tamil")}>
              {isTamil
                ? 'பயிர் விவரங்கள், வளர்ச்சி பருவம், வானிலை மற்றும் அறிகுறிகளை உள்ளிட்டு அல்லது புகைப்படம் பதிவேற்றி விரிவான பாதுகாப்பு ஆலோசனையைப் பெறுங்கள்.'
                : 'Input your crop details, growth stage, ambient weather, and symptoms or upload a field photograph for comprehensive agronomic advice.'}
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <form onSubmit={handleAnalyze} className="bg-card rounded-2xl p-5 border border-border shadow-soft space-y-5">
        <h4 className={cn("text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2", isTamil && "font-tamil")}>
          <Leaf className="w-4 h-4 text-primary" />
          {isTamil ? 'பயிர் மற்றும் நில விவரங்கள்' : 'Crop Information & Symptoms'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Crop Selection */}
          <div>
            <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
              {isTamil ? 'பயிர் பெயர் *' : 'Crop Name *'}
            </label>
            <select
              value={selectedCropKey}
              onChange={(e) => {
                setSelectedCropKey(e.target.value);
                setCropVariety('');
                setSelectedSymptoms([]);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {MONITORED_CROPS.map(c => (
                <option key={c.id} value={c.id}>
                  {isTamil ? c.nameTa : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Variety */}
          <div>
            <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
              {isTamil ? 'பயிர் ரகம் (விருப்பத்தேர்வு)' : 'Crop Variety (Optional)'}
            </label>
            {varieties.length > 0 ? (
              <select
                value={cropVariety}
                onChange={(e) => setCropVariety(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">{isTamil ? 'ரகம் தேர்ந்தெடுக்கவும் (அல்லது தட்டச்சு செய்க)' : 'Select Variety (or common local)'}</option>
                {varieties.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={isTamil ? 'எ.கா. நாட்டு ரகம், ஹைப்ரிட்' : 'e.g. Local Variety, Hybrid'}
                value={cropVariety}
                onChange={(e) => setCropVariety(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            )}
          </div>

          {/* Growth Stage */}
          <div>
            <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
              {isTamil ? 'வளர்ச்சி பருவம் *' : 'Growth Stage *'}
            </label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {currentCropObj.growthStages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Current Weather Bar */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-bold text-foreground flex items-center gap-1.5", isTamil && "font-tamil")}>
              <Thermometer className="w-4 h-4 text-primary" />
              {isTamil ? 'சூழல் வானிலை காரணிகள்' : 'Ambient Weather Conditions'}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {isTamil ? 'துல்லியமான பாசன பரிந்துரைக்காக' : 'Calibrated for accurate irrigation advisory'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={cn("block text-[11px] text-muted-foreground mb-1", isTamil && "font-tamil")}>
                {isTamil ? 'பகுதி / மாவட்டம்' : 'Farm Location'}
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className={cn("block text-[11px] text-muted-foreground mb-1", isTamil && "font-tamil")}>
                {isTamil ? 'வெப்பநிலை (°C)' : 'Temperature (°C)'}
              </label>
              <input
                type="number"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className={cn("block text-[11px] text-muted-foreground mb-1", isTamil && "font-tamil")}>
                {isTamil ? 'ஈரப்பதம் (%)' : 'Humidity (%)'}
              </label>
              <input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Visible Symptoms */}
        <div>
          <label className={cn("block text-xs font-semibold text-foreground mb-2", isTamil && "font-tamil")}>
            {isTamil ? 'தென்படும் அறிகுறிகளை தேர்ந்தெடுக்கவும் (ஒன்று அல்லது பல)' : 'Select Visible Symptoms (Tap matching symptoms)'}
          </label>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map(sym => {
              const label = isTamil ? sym.ta : sym.en;
              const isSelected = selectedSymptoms.includes(label);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(label)}
                  className={cn(
                    "text-xs px-3 py-2 rounded-xl border text-left transition-all touch-feedback flex items-center gap-1.5",
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : "bg-muted/40 hover:bg-muted text-foreground border-border"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full", isSelected ? "bg-white" : "bg-primary/40")} />
                  <span className={cn(isTamil && "font-tamil")}>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <textarea
              rows={2}
              placeholder={isTamil 
                ? 'கூடுதல் அறிகுறிகள் அல்லது உங்கள் கருத்துக்களை விரிவாக விவரிக்கவும்...' 
                : 'Describe any other visible symptoms, leaf discoloration, pest webs, or field observations in detail...'}
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
            {isTamil ? 'பயிர் / இலை புகைப்படம் பதிவேற்றவும் (விரும்பினால்)' : 'Upload Crop / Leaf Photo (Optional, JPEG/PNG/WebP, max 5MB)'}
          </label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Camera className="w-6 h-6" />
              </div>
              <p className={cn("text-xs font-medium text-foreground", isTamil && "font-tamil")}>
                {isTamil ? 'புகைப்படம் எடுக்க அல்லது பதிவேற்ற இங்கே கிளிக் செய்யவும்' : 'Click to take a photo or select an image file'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Supported formats: JPEG, PNG, WebP (Up to 5 MB)
              </p>
            </div>
          ) : (
            <div className="relative inline-block border border-border rounded-2xl overflow-hidden shadow-soft">
              <img
                src={imagePreview}
                alt="Selected crop"
                className="max-h-56 w-auto object-cover rounded-2xl"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground shadow transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2 touch-feedback disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className={cn(isTamil && "font-tamil")}>
                {isTamil ? 'AI ஆலோசனை பகுப்பாய்வு செய்யப்படுகிறது...' : 'Analyzing crop health & generating recommendations...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span className={cn(isTamil && "font-tamil")}>
                {isTamil ? 'பயிர் பாதுகாப்பு வழிகாட்டுதலைப் பெறுக' : 'Analyze Crop & Get Recommendations'}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Output Results Anchor */}
      <div id="protection-result-anchor" />

      {/* Structured Recommendation Display */}
      {recommendation && (
        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-6 animate-fade-in">
          {/* Header Summary & Confidence */}
          <div className="pb-4 border-b border-border space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {isTamil ? recommendation.cropDetectedTa : recommendation.cropDetectedEn}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isTamil ? `பருவம்: ${recommendation.growthStageTa}` : `Stage: ${recommendation.growthStageEn}`}
                </span>
              </div>

              {/* Confidence Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {isTamil ? 'துல்லிய நம்பிக்கை:' : 'Confidence:'}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {recommendation.confidence}%
                </span>
              </div>
            </div>

            <div>
              <h3 className={cn("text-lg font-bold text-foreground", isTamil && "font-tamil")}>
                {isTamil ? recommendation.problemTitleTa : recommendation.problemTitleEn}
              </h3>
            </div>

            {/* AI Limitation & Safety Notice */}
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className={cn("leading-relaxed", isTamil && "font-tamil")}>
                {isTamil ? recommendation.limitationsDisclaimerTa : recommendation.limitationsDisclaimerEn}
              </p>
            </div>
          </div>

          {/* 1. Possible Causes */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              {isTamil ? 'சாத்தியமான காரணங்கள்:' : 'Possible Causes:'}
            </h4>
            <ul className="space-y-1.5 pl-2">
              {(isTamil ? recommendation.possibleCausesTa : recommendation.possibleCausesEn).map((cause, idx) => (
                <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Preventive Measures */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
              <ShieldCheck className="w-4 h-4 text-primary" />
              {isTamil ? 'தடுப்பு நடவடிக்கைகள்:' : 'Preventive Measures:'}
            </h4>
            <ul className="space-y-1.5 pl-2">
              {(isTamil ? recommendation.preventiveMeasuresTa : recommendation.preventiveMeasuresEn).map((prev, idx) => (
                <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>{prev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Disease and Pest Management (Organic & Safe Chemical) */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border">
            <h4 className={cn("text-sm font-bold text-foreground flex items-center gap-2", isTamil && "font-tamil")}>
              <Leaf className="w-4 h-4 text-emerald-600" />
              {isTamil ? 'பூச்சி மற்றும் நோய் மேலாண்மை வழிகாட்டுதல்' : 'Pest & Disease Management Solutions'}
            </h4>

            {/* Organic Remedies */}
            <div className="space-y-1.5">
              <span className={cn("text-xs font-bold text-emerald-700 dark:text-emerald-400 block", isTamil && "font-tamil")}>
                {isTamil ? '1. இயற்கை / உயிரியல் தீர்வுகள் (முதன்மை பரிந்துரை):' : '1. Organic & Bio-Control Remedies (Preferred):'}
              </span>
              <ul className="space-y-1 pl-2">
                {(isTamil ? recommendation.diseasePestManagement.organicTa : recommendation.diseasePestManagement.organicEn).map((org, idx) => (
                  <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{org}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safe Chemical Remedies */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className={cn("text-xs font-bold text-sky-700 dark:text-sky-400 block", isTamil && "font-tamil")}>
                {isTamil ? '2. பாதுகாப்பான ரசாயன பயன்பாடு (தேவைப்படின் மட்டும்):' : '2. Targeted Chemical Remedies (If severe):'}
              </span>
              <ul className="space-y-1 pl-2">
                {(isTamil ? recommendation.diseasePestManagement.chemicalTa : recommendation.diseasePestManagement.chemicalEn).map((chem, idx) => (
                  <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                    <span>{chem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dosage Caution Note */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300">
              <span className="font-bold">{isTamil ? 'பாதுகாப்பு எச்சரிக்கை: ' : 'Safety Caution: '}</span>
              {isTamil ? recommendation.diseasePestManagement.dosageCautionTa : recommendation.diseasePestManagement.dosageCautionEn}
            </div>
          </div>

          {/* 4. Irrigation Recommendations */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
              <Droplet className="w-4 h-4 text-sky-500" />
              {isTamil ? 'பாசன பரிந்துரைகள்:' : 'Irrigation Guidance:'}
            </h4>
            <ul className="space-y-1.5 pl-2">
              {(isTamil ? recommendation.irrigationGuidanceTa : recommendation.irrigationGuidanceEn).map((irr, idx) => (
                <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                  <span>{irr}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Fertilizer and Nutrient Guidance */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              {isTamil ? 'உர மற்றும் ஊட்டச்சத்து மேலாண்மை:' : 'Fertilizer & Nutrient Guidance:'}
            </h4>
            <ul className="space-y-1.5 pl-2">
              {(isTamil ? recommendation.fertilizerNutrientGuidanceTa : recommendation.fertilizerNutrientGuidanceEn).map((fert, idx) => (
                <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  <span>{fert}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 6. Weather-Specific Precautions */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
              <Thermometer className="w-4 h-4 text-orange-500" />
              {isTamil ? 'வானிலை சார்ந்த முன்னெச்சரிக்கைகள்:' : 'Weather-Specific Precautions:'}
            </h4>
            <ul className="space-y-1.5 pl-2">
              {(isTamil ? recommendation.weatherPrecautionsTa : recommendation.weatherPrecautionsEn).map((wp, idx) => (
                <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <span>{wp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 7. Damage Recovery Steps */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5", isTamil && "font-tamil")}>
              <FileCheck className="w-4 h-4 text-indigo-500" />
              {isTamil ? 'சேதத்திற்கு பிந்தைய பயிர் மீட்பு படிகள்:' : 'Recovery Steps After Crop Damage:'}
            </h4>
            <ul className="space-y-1.5 pl-2">
              {(isTamil ? recommendation.recoveryStepsTa : recommendation.recoveryStepsEn).map((rec, idx) => (
                <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 8. When to Contact Agricultural Expert */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <PhoneCall className="w-4 h-4" />
              {isTamil ? 'வேளாண் நிபுணரை எப்போது தொடர்பு கொள்ள வேண்டும்?' : 'When to Contact an Agricultural Expert:'}
            </div>
            <p className={cn("text-xs text-foreground/90 leading-relaxed", isTamil && "font-tamil")}>
              {isTamil 
                ? recommendation.expertContactGuidanceTa.whenToContact 
                : recommendation.expertContactGuidanceEn.whenToContact}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`tel:${recommendation.expertContactGuidanceEn.helplineNumber}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm touch-feedback hover:opacity-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {recommendation.expertContactGuidanceEn.helplineName}: {recommendation.expertContactGuidanceEn.helplineNumber}
              </a>
              <span className={cn("text-[11px] text-muted-foreground", isTamil && "font-tamil")}>
                {isTamil ? recommendation.expertContactGuidanceTa.localOffice : recommendation.expertContactGuidanceEn.localOffice}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
