import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { tamilNaduDistricts, soilTypes } from '@/lib/i18n';
import { detailedCrops, DetailedCrop, CropTimeline } from '@/lib/cropData';
import CropDetailSheet from '@/components/planner/CropDetailSheet';
import { SoilExplorerModal } from '@/components/planner/SoilExplorerModal';
import { SoilCardPreview } from '@/components/planner/SoilCardPreview';
import { cn } from '@/lib/utils';
import { Leaf, MapPin, Mountain, Ruler, ChevronRight, Droplets, Clock, Images, Sparkles } from 'lucide-react';

const soilSuitabilityMap: Record<string, string[]> = {
  paddy: ['alluvial', 'clay', 'loamy', 'marshy'],
  groundnut: ['red', 'sandy', 'loamy', 'gravelly'],
  tomato: ['loamy', 'red', 'sandy', 'alluvial'],
  sugarcane: ['alluvial', 'black', 'clay', 'loamy'],
  cotton: ['black', 'red', 'alluvial', 'loamy'],
  maize: ['alluvial', 'loamy', 'red', 'sandy'],
  chilli: ['loamy', 'red', 'sandy', 'black'],
  onion: ['sandy', 'loamy', 'alluvial', 'red'],
  banana: ['alluvial', 'clay', 'loamy', 'marshy'],
  turmeric: ['loamy', 'alluvial', 'red'],
  coconut: ['coastal', 'alluvial', 'sandy', 'loamy'],
  mango: ['red', 'alluvial', 'loamy', 'laterite'],
  brinjal: ['loamy', 'sandy', 'red', 'alluvial'],
  okra: ['loamy', 'sandy', 'alluvial', 'red'],
  cabbage: ['loamy', 'alluvial', 'clay', 'mountain'],
  cauliflower: ['loamy', 'alluvial', 'clay', 'mountain'],
  ragi: ['red', 'gravelly', 'sandy', 'desert'],
  sorghum: ['black', 'red', 'loamy', 'desert'],
  blackgram: ['alluvial', 'black', 'loamy'],
  greengram: ['alluvial', 'black', 'loamy'],
  redgram: ['red', 'loamy', 'sandy'],
  sunflower: ['black', 'alluvial', 'loamy'],
  sesame: ['sandy', 'red', 'loamy'],
  castor: ['red', 'sandy', 'gravelly', 'desert'],
  tapioca: ['red', 'laterite', 'gravelly', 'loamy'],
  drumstick: ['sandy', 'loamy', 'red', 'gravelly'],
  papaya: ['loamy', 'alluvial', 'red', 'sandy'],
  watermelon: ['sandy', 'coastal', 'alluvial'],
  ginger: ['loamy', 'laterite', 'red', 'alluvial']
};

const districtRegionalMap: Record<string, string[]> = {
  paddy: ['Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Mayiladuthurai', 'Cuddalore', 'Pudukkottai', 'Ariyalur', 'Tiruchirappalli', 'Tiruvallur', 'Kancheepuram', 'Chengalpattu', 'Vellore', 'Tiruvannamalai'],
  coconut: ['Thanjavur', 'Tiruvarur', 'Coimbatore', 'Tiruppur', 'Kanniyakumari', 'Dindigul'],
  sugarcane: ['Thanjavur', 'Cuddalore', 'Villupuram', 'Erode', 'Coimbatore', 'Tiruppur', 'Trichy'],
  cotton: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Namakkal', 'Virudhunagar', 'Thoothukudi'],
  maize: ['Perambalur', 'Dindigul', 'Tiruppur', 'Erode', 'Salem'],
  turmeric: ['Erode', 'Salem', 'Namakkal', 'Dharmapuri'],
  tomato: ['Dindigul', 'Krishnagiri', 'Coimbatore', 'Theni', 'Dharmapuri'],
  chilli: ['Ramanathapuram', 'Thoothukudi', 'Virudhunagar', 'Sivagangai'],
  onion: ['Tiruppur', 'Perambalur', 'Coimbatore', 'Trichy', 'Namakkal'],
  banana: ['Tiruchirappalli', 'Thoothukudi', 'Theni', 'Coimbatore', 'Erode'],
  mango: ['Krishnagiri', 'Dharmapuri', 'Salem', 'Dindigul', 'Vellore'],
  tapioca: ['Salem', 'Namakkal', 'Dharmapuri', 'Erode'],
  ragi: ['Krishnagiri', 'Dharmapuri', 'Vellore', 'Salem'],
  sorghum: ['Coimbatore', 'Tiruppur', 'Dindigul', 'Karur'],
  cabbage: ['Nilgiris', 'Dindigul'],
  cauliflower: ['Nilgiris', 'Dindigul'],
  ginger: ['Nilgiris', 'Kanniyakumari']
};

const generateFallbackTimeline = (cropKey: string, totalDays: number): CropTimeline[] => {
  return [
    { day: 1, phase: 'preparation', phaseEn: 'Field Preparation', phaseTa: 'நிலம் தயாரிப்பு',
      tasks: [{ en: 'Plough field, apply organic compost', ta: 'நிலத்தை உழுது, இயற்கை உரம் இடவும்' }],
      irrigation: { required: false, frequency: 'None', frequencyTa: 'இல்லை' }
    },
    { day: 5, phase: 'sowing', phaseEn: 'Sowing / Planting', phaseTa: 'விதைப்பு / நடுகை',
      tasks: [{ en: 'Sow quality seeds with correct spacing', ta: 'சரியான இடைவெளியில் தரமான விதைகளை விதைக்கவும்' }],
      irrigation: { required: true, frequency: 'Light watering after planting', frequencyTa: 'நட்ட பின் லேசான நீர்ப்பாசனம்' }
    },
    { day: 25, phase: 'vegetative', phaseEn: 'First Weeding & Care', phaseTa: 'முதல் களை நீக்கம்',
      tasks: [{ en: 'Perform manual weeding, monitor pest infestation', ta: 'கை களை எடுத்தல், பூச்சி தாக்குதலை கண்காணிக்கவும்' }],
      irrigation: { required: true, frequency: 'Every 7-10 days', frequencyTa: '7-10 நாட்களுக்கு ஒருமுறை' }
    },
    { day: Math.round(totalDays * 0.5), phase: 'flowering', phaseEn: 'Flowering Phase', phaseTa: 'பூக்கும் நிலை',
      tasks: [{ en: 'Apply nitrogenous top dressing fertilizer', ta: 'நைட்ரஜன் மேலுரம் இடவும்' }],
      irrigation: { required: true, frequency: 'Maintain proper soil moisture', frequencyTa: 'மண் ஈரப்பதத்தை பராமரிக்கவும்' }
    },
    { day: totalDays - 10, phase: 'maturity', phaseEn: 'Maturity stage', phaseTa: 'பயிர் முதிர்ச்சி',
      tasks: [{ en: 'Stop irrigation, allow grains/fruits to mature', ta: 'நீர்ப்பாசனம் நிறுத்தவும், பயிரை முதிர விடவும்' }],
      irrigation: { required: false, frequency: 'Drain excess water', frequencyTa: 'அதிகப்படியான நீரை வடிகட்டவும்' }
    },
    { day: totalDays, phase: 'harvest', phaseEn: 'Harvesting', phaseTa: 'அறுவடை',
      tasks: [{ en: 'Harvest crops at optimum maturity level', ta: 'சரியான முதிர்வு காலத்தில் பயிரை அறுவடை செய்க' }],
      irrigation: { required: false, frequency: 'Field should be dry', frequencyTa: 'வயல் உலர்ந்திருக்க வேண்டும்' }
    }
  ];
};

const CropPlanner: React.FC = () => {
  const { t, isTamil, language } = useLanguage();
  const [district, setDistrict] = useState('');
  const [soilType, setSoilType] = useState('');
  const [landSize, setLandSize] = useState('');
  const [landUnit, setLandUnit] = useState<'acres' | 'hectares'>('acres');
  const [showResults, setShowResults] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<DetailedCrop | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [soilModalOpen, setSoilModalOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success bg-success-light';
    if (score >= 60) return 'text-warning bg-warning-light';
    return 'text-danger bg-danger-light';
  };

  const getWaterIcon = (need: 'low' | 'medium' | 'high') => {
    const baseClass = 'w-4 h-4';
    switch (need) {
      case 'low':
        return <Droplets className={cn(baseClass, 'text-sky/50')} />;
      case 'medium':
        return <Droplets className={cn(baseClass, 'text-sky/75')} />;
      case 'high':
        return <Droplets className={cn(baseClass, 'text-sky')} />;
    }
  };

  const handleSubmit = () => {
    if (district && soilType && landSize) {
      setShowResults(true);
    }
  };

  const handleCropClick = (crop: DetailedCrop) => {
    // Inject fallback timeline if empty
    const updatedCrop = {
      ...crop,
      timeline: crop.timeline && crop.timeline.length > 0
        ? crop.timeline
        : generateFallbackTimeline(crop.key, crop.totalDays)
    };
    setSelectedCrop(updatedCrop);
    setSheetOpen(true);
  };

  const getRecommendedCrops = () => {
    if (!district || !soilType) return [];

    return detailedCrops.map(crop => {
      // Calculate dynamic suitability score
      const suitableSoils = soilSuitabilityMap[crop.key] || [];
      const soilScore = suitableSoils.includes(soilType) ? 100 : 40;

      const preferredDistricts = districtRegionalMap[crop.key] || [];
      const districtScore = preferredDistricts.includes(district) ? 100 : 50;

      const matchScore = Math.round(0.6 * soilScore + 0.4 * districtScore);

      return {
        ...crop,
        matchScore
      };
    })
    .filter(crop => crop.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore);
  };

  const recommendedCrops = getRecommendedCrops();

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className={cn(
            'text-2xl font-bold text-foreground font-heading',
            isTamil && 'font-tamil'
          )}>
            {t('cropPlanner')}
          </h1>
          <p className={cn(
            'text-sm text-muted-foreground mt-1',
            isTamil && 'font-tamil'
          )}>
            {isTamil 
              ? 'உங்கள் நிலத்திற்கு ஏற்ற பயிர்களைக் கண்டறியுங்கள்'
              : 'Find the best crops for your land'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* District Select */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
            <label className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className={cn(
                'text-sm font-medium text-foreground',
                isTamil && 'font-tamil'
              )}>
                {t('selectDistrict')}
              </span>
            </label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setShowResults(false);
              }}
              className={cn(
                'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
                isTamil && 'font-tamil'
              )}
            >
              <option value="">
                {isTamil ? 'மாவட்டத்தை தேர்வு செய்க' : 'Select a district'}
              </option>
              {tamilNaduDistricts.map((d) => (
                <option key={d.en} value={d.en}>
                  {language === 'ta' ? d.ta : d.en}
                </option>
              ))}
            </select>
          </div>

          {/* Soil Type Select */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-earth" />
                <span className={cn(
                  'text-sm font-medium text-foreground',
                  isTamil && 'font-tamil'
                )}>
                  {t('selectSoil')}
                </span>
              </label>
              <button
                type="button"
                onClick={() => setSoilModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Images className="w-3.5 h-3.5" />
                {isTamil ? 'மண் படங்கள் / வழிகாட்டி' : 'View Soil Photos'}
              </button>
            </div>
            <select
              value={soilType}
              onChange={(e) => {
                setSoilType(e.target.value);
                setShowResults(false);
              }}
              className={cn(
                'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
                isTamil && 'font-tamil'
              )}
            >
              <option value="">
                {isTamil ? 'மண் வகையை தேர்வு செய்க' : 'Select soil type'}
              </option>
              {soilTypes.map((s) => (
                <option key={s.key} value={s.key}>
                  {language === 'ta' ? s.ta : s.en}
                </option>
              ))}
            </select>

            {/* Soil Photo & Details Preview Card */}
            {soilType && (
              <SoilCardPreview
                soilKey={soilType}
                onOpenExplorer={() => setSoilModalOpen(true)}
              />
            )}
          </div>

          {/* Land Size */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
            <label className="flex items-center gap-2 mb-3">
              <Ruler className="w-4 h-4 text-harvest" />
              <span className={cn(
                'text-sm font-medium text-foreground',
                isTamil && 'font-tamil'
              )}>
                {t('landSize')}
              </span>
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                value={landSize}
                onChange={(e) => {
                  setLandSize(e.target.value);
                  setShowResults(false);
                }}
                placeholder={isTamil ? 'அளவை உள்ளிடவும்' : 'Enter size'}
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <div className="flex rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => {
                    setLandUnit('acres');
                    setShowResults(false);
                  }}
                  className={cn(
                    'px-4 py-3 text-sm font-medium transition-colors',
                    landUnit === 'acres'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground',
                    isTamil && 'font-tamil'
                  )}
                >
                  {t('acres')}
                </button>
                <button
                  onClick={() => {
                    setLandUnit('hectares');
                    setShowResults(false);
                  }}
                  className={cn(
                    'px-4 py-3 text-sm font-medium transition-colors',
                    landUnit === 'hectares'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground',
                    isTamil && 'font-tamil'
                  )}
                >
                  {t('hectares')}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!district || !soilType || !landSize}
            className={cn(
              'w-full py-4 rounded-2xl font-semibold text-primary-foreground bg-gradient-primary shadow-primary transition-all touch-feedback',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isTamil && 'font-tamil'
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <Leaf className="w-5 h-5" />
              {t('findBestCrops')}
            </span>
          </button>
        </div>

        {/* Results */}
        {showResults && (
          <div className="space-y-4 animate-slide-up">
            <h2 className={cn(
              'text-lg font-bold text-foreground font-heading',
              isTamil && 'font-tamil'
            )}>
              {t('recommendedCrops')}
            </h2>

            {recommendedCrops.map((crop, index) => (
              <button
                key={crop.key}
                onClick={() => handleCropClick(crop)}
                className="w-full bg-card rounded-2xl p-4 border border-border shadow-card touch-feedback text-left hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Score Badge */}
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex flex-col items-center justify-center',
                    getScoreColor(crop.matchScore)
                  )}>
                    <span className="text-lg font-bold">{crop.matchScore}</span>
                    <span className="text-[8px] uppercase font-medium opacity-80">
                      {isTamil ? 'பொருத்தம்' : 'match'}
                    </span>
                  </div>

                  {/* Crop Info */}
                  <div className="flex-1">
                    <h3 className={cn(
                      'text-base font-semibold text-foreground',
                      isTamil && 'font-tamil'
                    )}>
                      {language === 'ta' ? crop.nameTa : crop.nameEn}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-light text-xs">
                        {getWaterIcon(crop.waterNeed)}
                        <span className="text-sky text-[11px] font-medium">
                          {crop.waterNeed === 'low' ? (isTamil ? 'குறைவு' : 'Low') : 
                           crop.waterNeed === 'medium' ? (isTamil ? 'நடுத்தரம்' : 'Medium') : 
                           (isTamil ? 'அதிகம்' : 'High')}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-muted-foreground text-[11px]">
                        <Clock className="w-3 h-3" />
                        {crop.totalDays} {isTamil ? 'நாட்கள்' : 'days'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">₹{crop.pricePerQuintal.toLocaleString()}</span>/Q
                      </span>
                      <span className="text-muted-foreground">
                        {crop.expectedYield}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground self-center" />
                </div>
              </button>
            ))}

            {recommendedCrops.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {isTamil ? 'இந்த மாவட்டத்திற்கும் மண் வகைக்கும் ஏற்ற பயிர்கள் எதுவும் கிடைக்கவில்லை.' : 'No recommended crops found for this district and soil type.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Crop Detail Sheet */}
      <CropDetailSheet 
        crop={selectedCrop}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Soil Types Visual Explorer & Gallery Modal */}
      <SoilExplorerModal
        open={soilModalOpen}
        onOpenChange={setSoilModalOpen}
        selectedSoilKey={soilType}
        onSelectSoil={(key) => {
          setSoilType(key);
          setShowResults(false);
        }}
      />
    </AppLayout>
  );
};

export default CropPlanner;