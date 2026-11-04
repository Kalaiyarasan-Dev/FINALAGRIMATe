import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { detailedSoilData, SoilInfo } from '@/lib/soilData';
import { soilTypes } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Droplets, Sparkles, Sprout, Search, Check, Info, Layers } from 'lucide-react';

interface SoilExplorerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSoilKey?: string;
  onSelectSoil?: (soilKey: string) => void;
}

export const SoilExplorerModal: React.FC<SoilExplorerModalProps> = ({
  open,
  onOpenChange,
  selectedSoilKey,
  onSelectSoil,
}) => {
  const { isTamil, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSoilKey, setActiveSoilKey] = useState<string>(selectedSoilKey || 'alluvial');

  const activeSoil: SoilInfo = detailedSoilData[activeSoilKey] || detailedSoilData['alluvial'];

  const filteredSoilList = soilTypes.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.en.toLowerCase().includes(term) || s.ta.includes(term) || s.key.toLowerCase().includes(term);
  });

  const handleSelect = (key: string) => {
    setActiveSoilKey(key);
    if (onSelectSoil) {
      onSelectSoil(key);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-card border border-border shadow-2xl">
        <DialogHeader className="p-5 border-b border-border bg-muted/40 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className={cn("text-xl font-bold text-foreground", isTamil && "font-tamil")}>
                  {isTamil ? 'மண் வகைகள் மற்றும் புகைப்பட வழிகாட்டி' : 'Soil Types Visual Gallery & Guide'}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isTamil ? 'அனைத்து மண் வகைகளின் உண்மையான புகைப்படங்கள் மற்றும் பண்புகள்' : 'Authentic high-resolution photographs & agricultural characteristics'}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={isTamil ? 'மண் பெயரைத் தேடுக...' : 'Search soil types...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 p-5 gap-6">
          {/* Left Soil Types List */}
          <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              {isTamil ? 'மண் பட்டியல்' : 'Available Soils'} ({filteredSoilList.length})
            </span>
            <div className="grid grid-cols-1 gap-2">
              {filteredSoilList.map((item) => {
                const info = detailedSoilData[item.key] || detailedSoilData['alluvial'];
                const isCurrent = activeSoilKey === item.key;
                const isPicked = selectedSoilKey === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelect(item.key)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left w-full group",
                      isCurrent
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-background hover:bg-muted/60 border-border"
                    )}
                  >
                    {/* Thumbnail with image */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
                      <img
                        src={info.image}
                        alt={info.nameEn}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = info.fallbackImage;
                        }}
                      />
                      {isPicked && (
                        <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-sm font-semibold truncate text-foreground", isTamil && "font-tamil")}>
                          {language === 'ta' ? info.nameTa : info.nameEn}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        pH: {info.ph} • {language === 'ta' ? info.fertilityTa : info.fertilityEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Soil Detail & Large Photo Preview */}
          <div className="md:col-span-7 bg-muted/20 rounded-2xl border border-border p-4 flex flex-col justify-between">
            <div>
              {/* Main Photo Preview */}
              <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden shadow-md border border-border group bg-neutral-900">
                <img
                  src={activeSoil.image}
                  alt={activeSoil.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = activeSoil.fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-primary text-white inline-block mb-1">
                        {isTamil ? 'உயர் தெளிவுத்திறன் புகைப்படம்' : 'High Resolution Soil Photo'}
                      </span>
                      <h3 className={cn("text-lg font-bold text-white", isTamil && "font-tamil")}>
                        {language === 'ta' ? activeSoil.nameTa : activeSoil.nameEn}
                      </h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white font-medium">
                      pH: {activeSoil.ph}
                    </span>
                  </div>
                </div>
              </div>

              {/* Soil Properties Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-2.5 rounded-xl bg-background border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isTamil ? 'நீர் தக்கவைப்பு' : 'Water Retention'}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {language === 'ta' ? activeSoil.waterRetentionTa : activeSoil.waterRetentionEn}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-background border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isTamil ? 'மண் வளம்' : 'Soil Fertility'}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {language === 'ta' ? activeSoil.fertilityTa : activeSoil.fertilityEn}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-3 p-3 rounded-xl bg-background border border-border text-xs leading-relaxed text-foreground">
                <span className="font-semibold block text-muted-foreground mb-1">
                  {isTamil ? 'விளக்கம் & கட்டமைப்பு' : 'Description & Texture'}:
                </span>
                <p className="mb-1 text-foreground">
                  {language === 'ta' ? activeSoil.descriptionTa : activeSoil.descriptionEn}
                </p>
                <p className="text-muted-foreground italic">
                  <strong>{isTamil ? 'அமைப்பு' : 'Texture'}:</strong> {language === 'ta' ? activeSoil.textureTa : activeSoil.textureEn}
                </p>
              </div>

              {/* Best Suited Crops */}
              <div className="mt-3">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                  {isTamil ? 'பரிந்துரைக்கப்படும் பயிர்கள்' : 'Best Suited Crops'}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(language === 'ta' ? activeSoil.bestCropsTa : activeSoil.bestCropsEn).map((crop, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Select Action Button */}
            {onSelectSoil && (
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedSoilKey === activeSoilKey 
                    ? (isTamil ? '✓ இந்த மண் தேர்ந்தெடுக்கப்பட்டுள்ளது' : '✓ Currently selected in planner')
                    : (isTamil ? 'திட்டமிடலில் தேர்வு செய்ய பொத்தானை அழுத்தவும்' : 'Click to apply to crop planner')
                  }
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSoil(activeSoilKey);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all",
                    selectedSoilKey === activeSoilKey
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                  {selectedSoilKey === activeSoilKey
                    ? (isTamil ? 'தேர்வு செய்யப்பட்டது' : 'Selected')
                    : (isTamil ? 'இந்த மண்ணைத் தேர்வு செய்க' : 'Select This Soil')
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
