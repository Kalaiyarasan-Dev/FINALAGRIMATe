import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  MandiRecord, 
  fetchMandiPrices, 
  getCommodityEmoji, 
  getCommodityTamil 
} from '@/lib/mandiPriceService';

const MarketTicker: React.FC = () => {
  const { isTamil, language } = useLanguage();
  const [tickerItems, setTickerItems] = useState<MandiRecord[]>([]);

  useEffect(() => {
    const loadTicker = async () => {
      try {
        const res = await fetchMandiPrices();
        if (res.records && res.records.length > 0) {
          setTickerItems(res.records.slice(0, 15));
        }
      } catch (e) {
        console.warn('Ticker fetch fallback', e);
      }
    };
    loadTicker();
  }, []);

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-rose-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (change < 0) return 'text-rose-600 dark:text-rose-400';
    return 'text-muted-foreground';
  };

  if (tickerItems.length === 0) return null;

  return (
    <div className="overflow-hidden bg-card rounded-2xl shadow-card border border-border">
      <div className="py-2.5 px-4 flex items-center gap-2 border-b border-border bg-muted/20">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className={cn(
          'text-xs sm:text-sm font-semibold text-foreground',
          isTamil && 'font-tamil'
        )}>
          {isTamil ? 'அரசு மண்டி நேரடி சந்தை விலைகள்' : 'AGMARKNET Live Mandi Prices'}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="overflow-hidden py-1">
        <div className="flex animate-ticker">
          {[...tickerItems, ...tickerItems].map((item, index) => {
            const emoji = getCommodityEmoji(item.commodity);
            const tamil = getCommodityTamil(item.commodity);
            const change = item.price_change ?? 0;
            return (
              <div
                key={`${item.market}-${item.commodity}-${index}`}
                className="flex items-center gap-2.5 px-4 py-2 border-r border-border/60 whitespace-nowrap text-xs"
              >
                <span>{emoji}</span>
                <span className={cn(
                  'font-semibold text-foreground',
                  isTamil && 'font-tamil'
                )}>
                  {language === 'ta' ? tamil : item.commodity}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({item.market.replace(/\s*(Regulated Market|Wholesale Market|Central Market|Mandi|APMC)/i, '')})
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-bold text-foreground">
                    ₹{item.modal_price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">/Q</span>
                </div>
                <div className={cn('flex items-center gap-0.5 font-bold', getTrendColor(change))}>
                  {getTrendIcon(change)}
                  <span>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
