import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CloudRain, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Sparkles,
  Sprout,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { WeatherAlertsSection } from '@/components/crop-assistant/WeatherAlertsSection';
import { CropProtectionSection } from '@/components/crop-assistant/CropProtectionSection';
import { InsuranceAssistantSection } from '@/components/crop-assistant/InsuranceAssistantSection';
import { DamageReportingSection } from '@/components/crop-assistant/DamageReportingSection';
import { cn } from '@/lib/utils';

export type AssistantTab = 'weather' | 'protection' | 'insurance' | 'damage';

const CropAssistant: React.FC = () => {
  const { isTamil, language } = useLanguage();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab from URL pathname, query param, or default
  const getInitialTab = (): AssistantTab => {
    if (location.pathname === '/weather-alerts') return 'weather';
    if (location.pathname === '/crop-protection') return 'protection';
    if (location.pathname === '/insurance-assistant') return 'insurance';
    if (location.pathname === '/damage-reporting') return 'damage';
    const param = searchParams.get('tab') as AssistantTab | null;
    if (param && ['weather', 'protection', 'insurance', 'damage'].includes(param)) {
      return param;
    }
    return 'weather';
  };

  const [activeTab, setActiveTab] = useState<AssistantTab>(getInitialTab);

  // Shared weather context
  const [weatherContext, setWeatherContext] = useState<{
    temp?: number;
    humidity?: number;
    condition?: string;
  }>({ temp: 31, humidity: 68, condition: 'Partly Cloudy' });

  useEffect(() => {
    if (location.pathname === '/weather-alerts') setActiveTab('weather');
    else if (location.pathname === '/crop-protection') setActiveTab('protection');
    else if (location.pathname === '/insurance-assistant') setActiveTab('insurance');
    else if (location.pathname === '/damage-reporting') setActiveTab('damage');
    else {
      const param = searchParams.get('tab') as AssistantTab | null;
      if (param && ['weather', 'protection', 'insurance', 'damage'].includes(param)) {
        setActiveTab(param);
      }
    }
  }, [location.pathname, searchParams]);

  const handleTabChange = (tab: AssistantTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const navTabs = [
    {
      id: 'weather' as AssistantTab,
      labelEn: 'Weather Alerts',
      labelTa: 'வானிலை எச்சரிக்கைகள்',
      icon: CloudRain,
      descEn: 'Rain, flood, wind & drought monitoring',
      descTa: 'மழை, வெள்ளம், காற்று & வறட்சி கண்காணிப்பு',
    },
    {
      id: 'protection' as AssistantTab,
      labelEn: 'Crop Protection',
      labelTa: 'பயிர் பாதுகாப்பு',
      icon: Sparkles,
      descEn: 'AI disease & pest guidance',
      descTa: 'AI நோய் & பூச்சி மேலாண்மை ஆலோசனை',
    },
    {
      id: 'insurance' as AssistantTab,
      labelEn: 'Insurance Assistant',
      labelTa: 'காப்பீட்டு வழிகாட்டி',
      icon: Landmark,
      descEn: 'PMFBY eligibility & statutory rates',
      descTa: 'PMFBY தகுதி & சட்டப்பூர்வ பிரீமியம்',
    },
    {
      id: 'damage' as AssistantTab,
      labelEn: 'Damage Reporting',
      labelTa: 'பயிர் சேத அறிக்கை',
      icon: ShieldAlert,
      descEn: 'Guided 72h claim intimation',
      descTa: '72 மணி நேர இழப்பீட்டு அறிவிப்பு உதவி',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Flagship Header Banner */}
        <div className="bg-gradient-to-br from-primary/15 via-card to-emerald-700/10 rounded-3xl p-6 border border-primary/25 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
                <Sprout className="w-4 h-4" />
                <span>{isTamil ? 'அக்ரிமேட் ஸ்மார்ட் மாட்யூல்' : 'AgriMate Smart Module'}</span>
              </div>
              <h2 className={cn("text-xl md:text-2xl font-black text-foreground tracking-tight", isTamil && "font-tamil")}>
                {isTamil ? 'ஸ்மார்ட் பயிர் பாதுகாப்பு மற்றும் காப்பீட்டு வழிகாட்டி' : 'Smart Crop Protection & Insurance Assistant'}
              </h2>
              <p className={cn("text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed", isTamil && "font-tamil")}>
                {isTamil
                  ? 'வானிலை இடர்களை முன்கூட்டியே அறிந்து பயிர்களைப் பாதுகாக்கவும், தகுதியான அரசு காப்பீட்டுத் திட்டங்களைக் கண்டறியவும், மற்றும் பயிர் சேதங்களை உரிய காலத்திற்குள் அறிவிக்கவும் உதவும் உங்களின் பிரத்யேக தளம்.'
                  : 'An all-in-one agronomic suite to monitor real-time weather perils, receive AI-calibrated crop protection guidance, discover verified PMFBY schemes, and file damage intimations within strict statutory deadlines.'}
              </p>
            </div>
          </div>

          {/* 4 Navigation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {navTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={cn(
                    "flex flex-col items-start text-left p-3.5 rounded-2xl border transition-all duration-200 touch-feedback",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-primary ring-2 ring-primary/30"
                      : "bg-card/80 hover:bg-muted text-foreground border-border"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-xl mb-2 transition-colors",
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn("text-xs md:text-sm font-bold block leading-snug", isTamil && "font-tamil")}>
                    {isTamil ? t.labelTa : t.labelEn}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] mt-1 line-clamp-1",
                      isActive ? "text-white/80" : "text-muted-foreground",
                      isTamil && "font-tamil"
                    )}
                  >
                    {isTamil ? t.descTa : t.descEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section View Container */}
        <div>
          {activeTab === 'weather' && (
            <WeatherAlertsSection
              onSelectWeatherContext={(ctx) => setWeatherContext(ctx)}
            />
          )}

          {activeTab === 'protection' && (
            <CropProtectionSection
              initialWeatherContext={weatherContext}
            />
          )}

          {activeTab === 'insurance' && (
            <InsuranceAssistantSection />
          )}

          {activeTab === 'damage' && (
            <DamageReportingSection />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CropAssistant;
