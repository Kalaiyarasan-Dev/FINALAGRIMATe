import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { DetailedCrop, CropTimeline } from '@/lib/cropData';
import { 
  Calendar, Clock, Droplets, Pill, Sprout, Sun, 
  TrendingUp, Leaf, AlertTriangle, CheckCircle2 
} from 'lucide-react';

interface CropDetailSheetProps {
  crop: DetailedCrop | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CropDetailSheet: React.FC<CropDetailSheetProps> = ({ crop, open, onOpenChange }) => {
  const { isTamil, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  if (!crop) return null;

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'nursery':
      case 'preparation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'sowing':
      case 'transplanting':
      case 'planting':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'germination':
      case 'establishment':
        return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'vegetative':
      case 'tillering':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'flowering':
      case 'squaring':
      case 'tasseling':
      case 'silking':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'reproductive':
      case 'pegging':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fruiting':
      case 'pod':
      case 'boll':
      case 'grain':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ripening':
      case 'maturity':
      case 'grand_growth':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'harvest':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <SheetTitle className={cn(
                  'text-xl font-bold text-foreground',
                  isTamil && 'font-tamil'
                )}>
                  {language === 'ta' ? crop.nameTa : crop.nameEn}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {crop.totalDays} {isTamil ? 'நாட்கள்' : 'days'} • ₹{crop.pricePerQuintal}/Q
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-3 grid grid-cols-3 h-10">
              <TabsTrigger value="overview" className={cn('text-xs', isTamil && 'font-tamil')}>
                {isTamil ? 'கண்ணோட்டம்' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="timeline" className={cn('text-xs', isTamil && 'font-tamil')}>
                {isTamil ? 'கால அட்டவணை' : 'Timeline'}
              </TabsTrigger>
              <TabsTrigger value="medicine" className={cn('text-xs', isTamil && 'font-tamil')}>
                {isTamil ? 'மருந்துகள்' : 'Medicine'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1 overflow-y-auto px-4 pb-6 mt-4">
              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-sky-600" />
                      <span className={cn('text-xs text-sky-600 font-medium', isTamil && 'font-tamil')}>
                        {isTamil ? 'மொத்த காலம்' : 'Duration'}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-sky-700">{crop.totalDays} {isTamil ? 'நாட்கள்' : 'days'}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className={cn('text-xs text-green-600 font-medium', isTamil && 'font-tamil')}>
                        {isTamil ? 'எதிர்பார்க்கப்படும் விளைச்சல்' : 'Expected Yield'}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-700">{crop.expectedYield}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span className={cn('text-xs text-blue-600 font-medium', isTamil && 'font-tamil')}>
                        {isTamil ? 'நீர் தேவை' : 'Water Need'}
                      </span>
                    </div>
                    <p className={cn('text-lg font-bold text-blue-700 capitalize', isTamil && 'font-tamil')}>
                      {crop.waterNeed === 'low' ? (isTamil ? 'குறைவு' : 'Low') : 
                       crop.waterNeed === 'medium' ? (isTamil ? 'நடுத்தரம்' : 'Medium') : 
                       (isTamil ? 'அதிகம்' : 'High')}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <span className={cn('text-xs text-amber-600 font-medium', isTamil && 'font-tamil')}>
                        {isTamil ? 'சிறந்த பருவம்' : 'Best Season'}
                      </span>
                    </div>
                    <p className={cn('text-xs font-medium text-amber-700', isTamil && 'font-tamil')}>
                      {language === 'ta' ? crop.bestSeasonTa : crop.bestSeason}
                    </p>
                  </div>
                </div>

                {/* Phase Summary */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className={cn('text-sm font-semibold mb-3', isTamil && 'font-tamil')}>
                    {isTamil ? 'வளர்ச்சி நிலைகள்' : 'Growth Phases'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(crop.timeline.map(t => t.phase))).map(phase => {
                      const phaseData = crop.timeline.find(t => t.phase === phase);
                      return (
                        <span 
                          key={phase}
                          className={cn('px-3 py-1 rounded-full text-xs font-medium border', getPhaseColor(phase))}
                        >
                          {language === 'ta' ? phaseData?.phaseTa.split(' ')[0] : phaseData?.phaseEn.split(' ')[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="flex-1 overflow-y-auto px-4 pb-6 mt-4">
              <div className="space-y-3">
                {crop.timeline.map((item, index) => (
                  <TimelineCard key={index} item={item} isTamil={isTamil} language={language} />
                ))}
              </div>
            </TabsContent>

            {/* Medicine Tab */}
            <TabsContent value="medicine" className="flex-1 overflow-y-auto px-4 pb-6 mt-4">
              <div className="space-y-3">
                {crop.timeline.filter(t => t.medicine).map((item, index) => (
                  <div key={index} className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-5 h-5 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn('font-semibold text-foreground', isTamil && 'font-tamil')}>
                            {language === 'ta' ? item.medicine?.nameTa : item.medicine?.name}
                          </h4>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {isTamil ? `நாள் ${item.day}` : `Day ${item.day}`}
                          </span>
                        </div>
                        <p className="text-xs text-primary font-medium mb-1">
                          {item.medicine?.dosage}
                        </p>
                        <p className={cn('text-sm text-muted-foreground', isTamil && 'font-tamil')}>
                          {language === 'ta' ? item.medicine?.purposeTa : item.medicine?.purpose}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {crop.timeline.filter(t => t.medicine).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Pill className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className={isTamil ? 'font-tamil' : ''}>
                      {isTamil ? 'மருந்து தகவல் இல்லை' : 'No medicine information'}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface TimelineCardProps {
  item: CropTimeline;
  isTamil: boolean;
  language: 'en' | 'ta';
}

const TimelineCard: React.FC<TimelineCardProps> = ({ item, isTamil, language }) => {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'nursery':
      case 'preparation':
        return 'bg-amber-500';
      case 'sowing':
      case 'transplanting':
      case 'planting':
        return 'bg-green-500';
      case 'germination':
      case 'establishment':
        return 'bg-lime-500';
      case 'vegetative':
      case 'tillering':
        return 'bg-emerald-500';
      case 'flowering':
      case 'squaring':
      case 'tasseling':
      case 'silking':
        return 'bg-pink-500';
      case 'reproductive':
      case 'pegging':
        return 'bg-purple-500';
      case 'fruiting':
      case 'pod':
      case 'boll':
      case 'grain':
        return 'bg-orange-500';
      case 'ripening':
      case 'maturity':
      case 'grand_growth':
        return 'bg-yellow-500';
      case 'harvest':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      {/* Day Badge & Phase */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm', getPhaseColor(item.phase))}>
          {item.day}
        </div>
        <div>
          <h4 className={cn('font-semibold text-foreground', isTamil && 'font-tamil')}>
            {language === 'ta' ? item.phaseTa : item.phaseEn}
          </h4>
          <p className="text-xs text-muted-foreground">
            {isTamil ? `நாள் ${item.day}` : `Day ${item.day}`}
          </p>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2 mb-3">
        {item.tasks.map((task, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className={cn('text-sm text-foreground', isTamil && 'font-tamil')}>
              {language === 'ta' ? task.ta : task.en}
            </span>
          </div>
        ))}
      </div>

      {/* Irrigation */}
      <div className="flex items-center gap-2 py-2 px-3 bg-sky-50 rounded-lg mb-2">
        <Droplets className="w-4 h-4 text-sky-600" />
        <span className={cn('text-xs text-sky-700', isTamil && 'font-tamil')}>
          {language === 'ta' ? item.irrigation.frequencyTa : item.irrigation.frequency}
        </span>
        {item.irrigation.required ? (
          <span className="ml-auto text-[10px] bg-sky-200 text-sky-700 px-2 py-0.5 rounded-full font-medium">
            {isTamil ? 'தேவை' : 'Required'}
          </span>
        ) : (
          <span className="ml-auto text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {isTamil ? 'தேவையில்லை' : 'Not needed'}
          </span>
        )}
      </div>

      {/* Medicine if exists */}
      {item.medicine && (
        <div className="flex items-center gap-2 py-2 px-3 bg-rose-50 rounded-lg">
          <Pill className="w-4 h-4 text-rose-600" />
          <div className="flex-1">
            <span className={cn('text-xs font-medium text-rose-700', isTamil && 'font-tamil')}>
              {language === 'ta' ? item.medicine.nameTa : item.medicine.name}
            </span>
            <span className="text-xs text-rose-500 ml-2">({item.medicine.dosage})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDetailSheet;