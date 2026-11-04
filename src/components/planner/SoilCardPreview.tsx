import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { detailedSoilData, SoilInfo } from '@/lib/soilData';
import { cn } from '@/lib/utils';
import { Droplets, Sparkles, Sprout, Images, ExternalLink, ShieldCheck } from 'lucide-react';

interface SoilCardPreviewProps {
  soilKey: string;
  onOpenExplorer: () => void;
}

export const SoilCardPreview: React.FC<SoilCardPreviewProps> = ({ soilKey, onOpenExplorer }) => {
  const { isTamil, language } = useLanguage();
  const soil: SoilInfo = detailedSoilData[soilKey];

  if (!soil) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm transition-all duration-300">
      {/* Top Banner with Image and Title */}
      <div className="relative h-32 w-full overflow-hidden bg-neutral-900 group">
        <img
          src={soil.image}
          alt={soil.nameEn}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = soil.fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
              <ShieldCheck className="w-3 h-3" />
              {isTamil ? 'மண் புகைப்படம்' : 'Soil Preview'}
            </span>
            <button
              type="button"
              onClick={onOpenExplorer}
              className="inline-flex items-center gap-1 rounded-full bg-white/20 hover:bg-white/30 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur transition-all"
            >
              <Images className="w-3 h-3" />
              {isTamil ? 'அனைத்து மண் படங்கள்' : 'View Soil Gallery'}
            </button>
          </div>

          <div>
            <h4 className={cn("text-base font-bold text-white leading-tight", isTamil && "font-tamil")}>
              {language === 'ta' ? soil.nameTa : soil.nameEn}
            </h4>
            <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
              {language === 'ta' ? soil.descriptionTa : soil.descriptionEn}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-card/60 border-b border-border text-[11px]">
        <div className="text-center p-1.5 rounded-lg bg-background border border-border/60">
          <span className="text-muted-foreground block text-[10px]">pH Value</span>
          <span className="font-bold text-foreground">{soil.ph}</span>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-background border border-border/60">
          <span className="text-muted-foreground block text-[10px]">
            {isTamil ? 'ஈரப்பதம்' : 'Moisture'}
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">
            {language === 'ta' ? (soil.waterRetentionTa.includes('அதிக') ? 'அதிகம்' : 'மிதம்') : (soil.waterRetentionEn.includes('High') ? 'High' : 'Moderate')}
          </span>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-background border border-border/60">
          <span className="text-muted-foreground block text-[10px]">
            {isTamil ? 'வளம்' : 'Fertility'}
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">
            {language === 'ta' ? soil.fertilityTa : soil.fertilityEn}
          </span>
        </div>
      </div>

      {/* Recommended Crops Tags */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sprout className="w-3 h-3 text-primary" />
            {isTamil ? 'பரிந்துரைக்கப்படும் பயிர்கள்' : 'Recommended Crops'}:
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(language === 'ta' ? soil.bestCropsTa : soil.bestCropsEn).slice(0, 4).map((crop, index) => (
            <span
              key={index}
              className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium"
            >
              {crop}
            </span>
          ))}
          {(soil.bestCropsEn.length > 4) && (
            <button
              type="button"
              onClick={onOpenExplorer}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground font-medium"
            >
              +{soil.bestCropsEn.length - 4} {isTamil ? 'மேலும்' : 'more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
