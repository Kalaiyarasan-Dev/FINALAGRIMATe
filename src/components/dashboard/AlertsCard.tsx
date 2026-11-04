import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bug, CloudRain, Leaf, ChevronRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'pest' | 'weather' | 'crop';
  severity: 'high' | 'medium' | 'low';
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
}

const defaultAlerts: Alert[] = [
  {
    id: '1',
    type: 'pest',
    severity: 'high',
    titleEn: 'Brown Planthopper Alert',
    titleTa: 'பழுப்பு தாவர நத்தை எச்சரிக்கை',
    descriptionEn: 'High risk in Thanjavur region. Apply neem-based pesticide.',
    descriptionTa: 'தஞ்சாவூர் பகுதியில் அதிக ஆபத்து. வேப்பம் பூச்சிக்கொல்லி பயன்படுத்தவும்.',
  },
  {
    id: '2',
    type: 'weather',
    severity: 'medium',
    titleEn: 'Heavy Rainfall Expected',
    titleTa: 'கனமழை எதிர்பார்க்கப்படுகிறது',
    descriptionEn: 'Prepare drainage for paddy fields this week.',
    descriptionTa: 'இந்த வாரம் நெல் வயல்களுக்கு வடிகால் தயார் செய்யுங்கள்.',
  },
  {
    id: '3',
    type: 'crop',
    severity: 'low',
    titleEn: 'Optimal Sowing Time',
    titleTa: 'சிறந்த விதைப்பு நேரம்',
    descriptionEn: 'Best time to sow groundnut in red soil areas.',
    descriptionTa: 'செம்மண் பகுதிகளில் நிலக்கடலை விதைக்க சிறந்த நேரம்.',
  },
];

const AlertsCard: React.FC = () => {
  const navigate = useNavigate();
  const { t, isTamil, language } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          const mapped: Alert[] = data.map((a: any) => ({
            id: a.id,
            type: (['pest', 'weather', 'crop'].includes(a.severity) ? a.severity : 'pest') as Alert['type'],
            severity: (['high', 'medium', 'low'].includes(a.severity) ? a.severity : 'medium') as Alert['severity'],
            titleEn: a.title,
            titleTa: a.title,
            descriptionEn: a.message,
            descriptionTa: a.message,
          }));
          setAlerts(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('AlertsCard fetch fallback:', err);
      }

      setAlerts(defaultAlerts);
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
    }
  };

  const getAlertColors = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-danger-light',
          border: 'border-danger/20',
          icon: 'text-danger',
        };
      case 'medium':
        return {
          bg: 'bg-warning-light',
          border: 'border-warning/20',
          icon: 'text-warning',
        };
      case 'low':
        return {
          bg: 'bg-success-light',
          border: 'border-success/20',
          icon: 'text-success',
        };
    }
  };

  const getAlertTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'pest':
        return t('pestAlert');
      case 'weather':
        return t('weatherWarning');
      case 'crop':
        return t('cropAdvisory');
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div 
        onClick={() => navigate('/weather-alerts')}
        className="py-3 px-4 flex items-center justify-between border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className={cn(
            'text-sm font-semibold text-foreground',
            isTamil && 'font-tamil'
          )}>
            {t('alerts')}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary font-semibold">
          <span>{isTamil ? 'அனைத்தும்' : 'View All'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))
        ) : alerts.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {t('noAlerts')}
          </div>
        ) : (
          alerts.map((alert) => {
            const colors = getAlertColors(alert.severity);
            return (
              <button
                key={alert.id}
                onClick={() => navigate('/weather-alerts')}
                className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors touch-feedback text-left"
              >
                <div className={cn(
                  'p-2 rounded-xl flex-shrink-0',
                  colors.bg
                )}>
                  <span className={colors.icon}>
                    {getAlertIcon(alert.type)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full',
                      colors.bg,
                      colors.icon
                    )}>
                      {getAlertTypeLabel(alert.type)}
                    </span>
                  </div>
                  <h4 className={cn(
                    'text-sm font-semibold text-foreground mb-0.5 line-clamp-1',
                    isTamil && 'font-tamil'
                  )}>
                    {language === 'ta' ? alert.titleTa : alert.titleEn}
                  </h4>
                  <p className={cn(
                    'text-xs text-muted-foreground line-clamp-2',
                    isTamil && 'font-tamil'
                  )}>
                    {language === 'ta' ? alert.descriptionTa : alert.descriptionEn}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2" />
              </button>
            );
          }))}
      </div>
    </div>
  );
};

export default AlertsCard;
