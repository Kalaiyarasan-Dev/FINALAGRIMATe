import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  TrendingUp, 
  Stethoscope, 
  Calculator, 
  CloudRain,
  Sparkles,
  Landmark,
  ShieldAlert,
  Sprout,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ElementType;
  labelEn: string;
  labelTa: string;
  path: string;
  gradient: string;
  iconColor: string;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { isTamil, language } = useLanguage();

  const assistantActions: QuickAction[] = [
    {
      icon: CloudRain,
      labelEn: 'Weather Alerts',
      labelTa: 'வானிலை எச்சரிக்கை',
      path: '/weather-alerts',
      gradient: 'bg-gradient-to-br from-sky-500/10 to-sky-500/5 hover:border-sky-500/30',
      iconColor: 'text-sky-600',
    },
    {
      icon: Sparkles,
      labelEn: 'Crop Protection',
      labelTa: 'பயிர் பாதுகாப்பு',
      path: '/crop-protection',
      gradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:border-emerald-500/30',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Landmark,
      labelEn: 'Insurance Assistant',
      labelTa: 'காப்பீட்டு வழிகாட்டி',
      path: '/insurance-assistant',
      gradient: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:border-blue-500/30',
      iconColor: 'text-blue-600',
    },
    {
      icon: ShieldAlert,
      labelEn: 'Damage Reporting',
      labelTa: 'சேத அறிக்கை (72h)',
      path: '/damage-reporting',
      gradient: 'bg-gradient-to-br from-rose-500/10 to-rose-500/5 hover:border-rose-500/30',
      iconColor: 'text-rose-600',
    },
  ];

  const secondaryActions: QuickAction[] = [
    {
      icon: Calendar,
      labelEn: 'Plan Crop',
      labelTa: 'பயிர் திட்டம்',
      path: '/planner',
      gradient: 'bg-gradient-to-br from-primary/10 to-primary/5',
      iconColor: 'text-primary',
    },
    {
      icon: TrendingUp,
      labelEn: 'Market',
      labelTa: 'சந்தை',
      path: '/market',
      gradient: 'bg-gradient-to-br from-harvest/10 to-harvest/5',
      iconColor: 'text-harvest',
    },
    {
      icon: Stethoscope,
      labelEn: 'Crop Doctor',
      labelTa: 'பயிர் மருத்துவர்',
      path: '/doctor',
      gradient: 'bg-gradient-to-br from-danger/10 to-danger/5',
      iconColor: 'text-danger',
    },
    {
      icon: Calculator,
      labelEn: 'Calculator',
      labelTa: 'கணிப்பான்',
      path: '/calculator',
      gradient: 'bg-gradient-to-br from-earth/10 to-earth/5',
      iconColor: 'text-earth',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Smart Crop Protection & Insurance Featured Spotlight */}
      <div 
        onClick={() => navigate('/crop-assistant')}
        className="cursor-pointer bg-gradient-to-r from-emerald-600/15 via-primary/15 to-teal-600/15 rounded-2xl p-4 border border-primary/25 shadow-soft hover:shadow-md transition-all touch-feedback flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-primary flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                {isTamil ? 'புதிய சேவை' : 'New Module'}
              </span>
            </div>
            <h4 className={cn("text-sm font-bold text-foreground mt-0.5", isTamil && "font-tamil")}>
              {isTamil ? 'ஸ்மார்ட் பயிர் பாதுகாப்பு & காப்பீட்டு வழிகாட்டி' : 'Smart Crop Protection & Insurance Assistant'}
            </h4>
            <p className={cn("text-[11px] text-muted-foreground", isTamil && "font-tamil")}>
              {isTamil ? 'வானிலை அபாயங்கள், பூச்சி மேலாண்மை, PMFBY & 72h சேத அறிவிப்பு' : 'Weather perils, pest advisory, PMFBY & 72-hour claim intimation'}
            </p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-background/80 group-hover:bg-primary group-hover:text-primary-foreground text-foreground transition-colors flex-shrink-0">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 4 Core Assistant Navigation Sections */}
      <div>
        <p className={cn("text-xs font-bold text-foreground mb-2 flex items-center gap-1.5", isTamil && "font-tamil")}>
          <ShieldAlert className="w-3.5 h-3.5 text-primary" />
          {isTamil ? 'பயிர் பாதுகாப்பு மற்றும் காப்பீட்டு சேவைகள்:' : 'Crop Protection & Insurance Modules:'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {assistantActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-border transition-all duration-200 touch-feedback text-center',
                  action.gradient
                )}
              >
                <div className={cn('p-2.5 rounded-xl bg-card shadow-soft', action.iconColor)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'text-xs font-bold text-foreground line-clamp-1',
                  isTamil && 'font-tamil'
                )}>
                  {language === 'ta' ? action.labelTa : action.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* General Farming Tools */}
      <div>
        <p className={cn("text-xs font-bold text-foreground mb-2", isTamil && "font-tamil")}>
          {isTamil ? 'பிற விவசாய கருவிகள்:' : 'Other Farming Tools:'}
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {secondaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border border-border transition-all duration-200 touch-feedback text-center',
                  action.gradient
                )}
              >
                <div className={cn('p-2 rounded-xl bg-card shadow-soft', action.iconColor)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn(
                  'text-[11px] font-medium text-foreground line-clamp-1',
                  isTamil && 'font-tamil'
                )}>
                  {language === 'ta' ? action.labelTa : action.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
