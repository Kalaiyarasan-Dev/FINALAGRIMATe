import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { AlertTriangle, Bug, CloudRain, Leaf, Thermometer, Wind, Droplets, MapPin, Calendar, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { WeatherAlertsSection } from '@/components/crop-assistant/WeatherAlertsSection';

interface Alert {
  id: string;
  type: 'pest' | 'weather' | 'crop' | 'disease';
  severity: 'high' | 'medium' | 'low';
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  affectedCropsEn: string[];
  affectedCropsTa: string[];
  regionEn: string;
  regionTa: string;
  date: string;
  preventionEn: string[];
  preventionTa: string[];
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'pest',
    severity: 'high',
    titleEn: 'Brown Planthopper Alert',
    titleTa: 'பழுப்பு தாவர நத்தை எச்சரிக்கை',
    descriptionEn: 'High risk of brown planthopper infestation detected. Immediate action required to protect paddy crops.',
    descriptionTa: 'பழுப்பு தாவர நத்தை தொற்று அதிக ஆபத்து கண்டறியப்பட்டது. நெல் பயிர்களைப் பாதுகாக்க உடனடி நடவடிக்கை தேவை.',
    affectedCropsEn: ['Paddy', 'Rice'],
    affectedCropsTa: ['நெல்'],
    regionEn: 'Thanjavur, Tiruvarur, Nagapattinam',
    regionTa: 'தஞ்சாவூர், திருவாரூர், நாகப்பட்டினம்',
    date: '2026-08-25',
    preventionEn: ['Apply neem-based pesticide', 'Drain excess water', 'Install light traps', 'Avoid excessive nitrogen fertilizer'],
    preventionTa: ['வேப்பம் பூச்சிக்கொல்லி பயன்படுத்தவும்', 'அதிகப்படியான நீரை வடிகட்டவும்', 'ஒளி பொறிகளை நிறுவுங்கள்', 'அதிகப்படியான நைட்ரஜன் உரம் தவிர்க்கவும்']
  },
  {
    id: '2',
    type: 'weather',
    severity: 'high',
    titleEn: 'Heavy Rainfall Warning',
    titleTa: 'கனமழை எச்சரிக்கை',
    descriptionEn: 'IMD predicts heavy to very heavy rainfall for the next 48 hours. Prepare drainage and protect harvested crops.',
    descriptionTa: 'அடுத்த 48 மணி நேரத்திற்கு கனமழை முதல் மிக கனமழை வரை பெய்யும் என IMD கணித்துள்ளது.',
    affectedCropsEn: ['All crops', 'Especially Paddy', 'Vegetables'],
    affectedCropsTa: ['அனைத்து பயிர்கள்', 'குறிப்பாக நெல்', 'காய்கறிகள்'],
    regionEn: 'Chennai, Kanchipuram, Chengalpattu',
    regionTa: 'சென்னை, காஞ்சிபுரம், செங்கல்பட்டு',
    date: '2026-08-24',
    preventionEn: ['Clear drainage channels', 'Cover harvested produce', 'Postpone fertilizer application', 'Stake tall crops'],
    preventionTa: ['வடிகால் சேனல்களை சுத்தம் செய்யுங்கள்', 'அறுவடை செய்த விளைபொருட்களை மூடுங்கள்', 'உர பயன்பாட்டை தள்ளி வைக்கவும்', 'உயரமான பயிர்களுக்கு கம்பு ஊன்றுங்கள்']
  }
];

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const { t, isTamil, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'smart_weather' | 'bulletins'>('smart_weather');

  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: Alert[] = data.map((a: any) => ({
            id: a.id,
            type: (['pest', 'weather', 'crop', 'disease'].includes(a.severity) ? a.severity : 'pest') as Alert['type'],
            severity: (['high', 'medium', 'low'].includes(a.severity) ? a.severity : 'medium') as Alert['severity'],
            titleEn: a.title,
            titleTa: a.title,
            descriptionEn: a.message,
            descriptionTa: a.message,
            affectedCropsEn: a.crops || ['All crops'],
            affectedCropsTa: a.crops || ['அனைத்து பயிர்கள்'],
            regionEn: a.district ? `${a.district}, ${a.state || 'Tamil Nadu'}` : 'Tamil Nadu',
            regionTa: a.district ? `${a.district}, ${a.state || 'தமிழ்நாடு'}` : 'தமிழ்நாடு',
            date: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '2026-08-25',
            preventionEn: ['Follow agricultural advisory guidelines', 'Consult local extension officer'],
            preventionTa: ['வேளாண் வழிகாட்டுதல்களைப் பின்பற்றவும்', 'உள்ளூர் வேளாண் அலுவலரை அணுகவும்']
          }));
          setAlerts(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Alerts fetch fallback:', err);
      }

      setAlerts(mockAlerts);
      setLoading(false);
    };

    fetchAlerts();
  }, []);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'pest':
        return <Bug className="w-5 h-5" />;
      case 'weather':
        return <CloudRain className="w-5 h-5" />;
      case 'crop':
        return <Leaf className="w-5 h-5" />;
      case 'disease':
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertColors = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return { bg: 'bg-danger-light', border: 'border-danger/20', icon: 'text-danger', badge: 'bg-danger text-white' };
      case 'medium':
        return { bg: 'bg-warning-light', border: 'border-warning/20', icon: 'text-warning', badge: 'bg-warning text-white' };
      case 'low':
        return { bg: 'bg-success-light', border: 'border-success/20', icon: 'text-success', badge: 'bg-success text-white' };
    }
  };

  const getTypeLabel = (type: Alert['type']) => {
    const labels = {
      pest: { en: 'Pest Alert', ta: 'பூச்சி எச்சரிக்கை' },
      weather: { en: 'Weather', ta: 'வானிலை' },
      crop: { en: 'Advisory', ta: 'ஆலோசனை' },
      disease: { en: 'Disease', ta: 'நோய்' }
    };
    return language === 'ta' ? labels[type].ta : labels[type].en;
  };

  const getSeverityLabel = (severity: Alert['severity']) => {
    const labels = {
      high: { en: 'High Risk', ta: 'அதிக ஆபத்து' },
      medium: { en: 'Medium', ta: 'நடுத்தரம்' },
      low: { en: 'Low', ta: 'குறைவு' }
    };
    return language === 'ta' ? labels[severity].ta : labels[severity].en;
  };

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={cn('text-2xl font-bold text-foreground font-heading', isTamil && 'font-tamil')}>
              {isTamil ? 'வானிலை & பயிர் ஆபத்து எச்சரிக்கைகள்' : 'Weather & Crop-Risk Alerts'}
            </h1>
            <p className={cn('text-sm text-muted-foreground mt-0.5', isTamil && 'font-tamil')}>
              {isTamil ? 'கனமழை, வெள்ளம், வறட்சி, தீவிர வெப்பநிலை மற்றும் பலத்த காற்று நேரடி எச்சரிக்கைகள்' : 'Real-time monitoring for heavy rainfall, flood risk, drought, heat & high winds'}
            </p>
          </div>

          <button
            onClick={() => navigate('/crop-assistant')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm touch-feedback hover:opacity-95 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isTamil ? 'முழுமையான பயிர் வழிகாட்டி' : 'Full Crop Assistant Hub'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-muted p-1 border border-border">
          <button
            onClick={() => setActiveTab('smart_weather')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all touch-feedback",
              activeTab === 'smart_weather' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isTamil ? 'ஸ்மார்ட் நேரடி வானிலை எச்சரிக்கைகள் (Open-Meteo)' : 'Smart Live Weather & Crop Alerts'}
          </button>
          <button
            onClick={() => setActiveTab('bulletins')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all touch-feedback",
              activeTab === 'bulletins' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isTamil ? 'மண்டல வேளாண் அறிக்கைகள்' : 'Regional Bulletins'}
          </button>
        </div>

        {activeTab === 'smart_weather' ? (
          <WeatherAlertsSection />
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-danger-light rounded-xl p-3 text-center">
                <span className="text-2xl font-bold text-danger">{alerts.filter(a => a.severity === 'high').length}</span>
                <p className={cn('text-xs text-danger/80', isTamil && 'font-tamil')}>{isTamil ? 'அதிக ஆபத்து' : 'High Risk'}</p>
              </div>
              <div className="bg-warning-light rounded-xl p-3 text-center">
                <span className="text-2xl font-bold text-warning">{alerts.filter(a => a.severity === 'medium').length}</span>
                <p className={cn('text-xs text-warning/80', isTamil && 'font-tamil')}>{isTamil ? 'நடுத்தரம்' : 'Medium'}</p>
              </div>
              <div className="bg-success-light rounded-xl p-3 text-center">
                <span className="text-2xl font-bold text-success">{alerts.filter(a => a.severity === 'low').length}</span>
                <p className={cn('text-xs text-success/80', isTamil && 'font-tamil')}>{isTamil ? 'ஆலோசனை' : 'Advisory'}</p>
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {loading ? (
            // Loading Skeletons
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border shadow-card p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-20 bg-muted animate-pulse rounded-xl" />
              </div>
            ))
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-dashed">
              <p className={cn('text-muted-foreground', isTamil && 'font-tamil')}>
                {isTamil ? 'தற்போது புதிய எச்சரிக்கைகள் எதுவும் இல்லை' : 'No alerts right now'}
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const colors = getAlertColors(alert.severity);
              return (
                <div key={alert.id} className={cn('bg-card rounded-2xl border shadow-card overflow-hidden', colors.border)}>
                  {/* Alert Header */}
                  <div className={cn('p-4', colors.bg)}>
                    <div className="flex items-start gap-3">
                      <div className={cn('p-2 rounded-xl bg-card/50', colors.icon)}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colors.badge)}>
                            {getSeverityLabel(alert.severity)}
                          </span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-card/50">
                            {getTypeLabel(alert.type)}
                          </span>
                        </div>
                        <h3 className={cn('text-base font-semibold text-foreground', isTamil && 'font-tamil')}>
                          {language === 'ta' ? alert.titleTa : alert.titleEn}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Alert Body */}
                  <div className="p-4 space-y-3">
                    <p className={cn('text-sm text-muted-foreground', isTamil && 'font-tamil')}>
                      {language === 'ta' ? alert.descriptionTa : alert.descriptionEn}
                    </p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className={isTamil ? 'font-tamil' : ''}>{language === 'ta' ? alert.regionTa : alert.regionEn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(alert.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Affected Crops */}
                    <div>
                      <span className={cn('text-xs font-medium text-foreground', isTamil && 'font-tamil')}>
                        {isTamil ? 'பாதிக்கப்பட்ட பயிர்கள்:' : 'Affected Crops:'}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(language === 'ta' ? alert.affectedCropsTa : alert.affectedCropsEn).map((crop, idx) => (
                          <span key={idx} className={cn('text-xs px-2 py-0.5 rounded-full bg-muted', isTamil && 'font-tamil')}>
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Prevention Tips */}
                    <div className="bg-muted/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                          {isTamil ? 'தடுப்பு நடவடிக்கைகள்' : 'Prevention Measures'}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {(language === 'ta' ? alert.preventionTa : alert.preventionEn).map((tip, idx) => (
                          <li key={idx} className={cn('text-xs text-muted-foreground flex items-start gap-2', isTamil && 'font-tamil')}>
                            <span className="text-primary mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </>
      )}
      </div>
    </AppLayout>
  );
};

export default Alerts;
