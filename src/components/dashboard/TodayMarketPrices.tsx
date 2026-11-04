import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  MapPin, 
  RefreshCw, 
  SlidersHorizontal, 
  Building2, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  Filter,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  MandiRecord, 
  fetchMandiPrices, 
  getCommodityEmoji, 
  getCommodityTamil, 
  getStateTamil 
} from '@/lib/mandiPriceService';

interface TodayMarketPricesProps {
  userState?: string;
  userDistrict?: string;
  className?: string;
  limitDisplay?: number;
  showFilters?: boolean;
}

const TodayMarketPrices: React.FC<TodayMarketPricesProps> = ({
  userState,
  userDistrict,
  className,
  limitDisplay,
  showFilters = true
}) => {
  const { isTamil, language } = useLanguage();
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sourceAttribution, setSourceAttribution] = useState('Government of India — AGMARKNET / data.gov.in');

  // Filter states
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price_high' | 'price_low' | 'trend'>('name');

  // Available options
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [availableCommodities, setAvailableCommodities] = useState<string[]>([]);

  // Categories map
  const categories = [
    { key: 'all', en: 'All Crops', ta: 'அனைத்து பயிர்கள்' },
    { key: 'vegetables', en: 'Vegetables', ta: 'காய்கறிகள்', keys: ['tomato', 'onion', 'potato', 'brinjal', 'okra', 'cabbage', 'cauliflower', 'carrot'] },
    { key: 'cereals', en: 'Cereals & Grains', ta: 'தானியங்கள்', keys: ['paddy', 'wheat', 'maize', 'ragi'] },
    { key: 'spices', en: 'Spices & Condiments', ta: 'மசாலா பொருட்கள்', keys: ['turmeric', 'chilli', 'garlic', 'ginger'] },
    { key: 'cash', en: 'Cash Crops & Oilseeds', ta: 'பணப்பயிர்கள்', keys: ['cotton', 'sugarcane', 'groundnut', 'coconut', 'cashewnuts'] },
    { key: 'fruits', en: 'Fruits', ta: 'பழங்கள்', keys: ['banana', 'pomegranate', 'mango'] },
  ];

  // Auto-detect user state/district on load if provided
  useEffect(() => {
    if (userState && userState.toLowerCase().includes('tamil')) {
      setSelectedState('Tamil Nadu');
    }
  }, [userState]);

  // Load Mandi Prices
  const loadPrices = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetchMandiPrices({
        state: selectedState !== 'all' ? selectedState : undefined,
        district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
        market: selectedMarket !== 'all' ? selectedMarket : undefined,
        commodity: selectedCommodity !== 'all' ? selectedCommodity : undefined,
        search: searchQuery || undefined
      });

      setRecords(response.records);
      setSourceAttribution(response.source);
      setAvailableStates(response.filters.states);
      setAvailableDistricts(response.filters.districts);
      setAvailableMarkets(response.filters.markets);
      setAvailableCommodities(response.filters.commodities);
      setLastUpdated(new Date());

      if (isManualRefresh) {
        toast.success(isTamil ? 'அரசு மண்டி விலை விவரங்கள் புதுப்பிக்கப்பட்டன!' : 'AGMARKNET mandi prices updated!');
      }
    } catch (err) {
      console.error('Failed to load mandi prices:', err);
      toast.error(isTamil ? 'மண்டி விலையைப் பெற முடியவில்லை' : 'Failed to fetch mandi prices');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [selectedState, selectedDistrict, selectedMarket, selectedCommodity]);

  // Filter and sort records
  const filteredAndSortedRecords = useMemo(() => {
    let list = [...records];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => 
        r.commodity.toLowerCase().includes(q) ||
        getCommodityTamil(r.commodity).includes(q) ||
        r.market.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      const cat = categories.find(c => c.key === activeCategory);
      if (cat?.keys) {
        list = list.filter(r => cat.keys.some(k => r.commodity.toLowerCase().includes(k)));
      }
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'price_high') return b.modal_price - a.modal_price;
      if (sortBy === 'price_low') return a.modal_price - b.modal_price;
      if (sortBy === 'trend') return (b.price_change || 0) - (a.price_change || 0);
      return a.commodity.localeCompare(b.commodity);
    });

    if (limitDisplay && limitDisplay > 0) {
      return list.slice(0, limitDisplay);
    }

    return list;
  }, [records, searchQuery, activeCategory, sortBy, limitDisplay]);

  // Trend formatting helper
  const renderTrendBadge = (record: MandiRecord) => {
    const change = record.price_change ?? 0;
    if (change > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          +{change.toFixed(2)}%
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
          <TrendingDown className="w-3.5 h-3.5" />
          {change.toFixed(2)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
        <Minus className="w-3.5 h-3.5" />
        0.00%
      </span>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border border-border p-4 sm:p-5 rounded-3xl shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <h2 className={cn(
              'text-lg sm:text-xl font-bold text-foreground font-heading tracking-tight flex items-center gap-2',
              isTamil && 'font-tamil'
            )}>
              {isTamil ? 'இன்றைய சந்தை விலைகள் (Mandi Prices)' : "Today's Mandi Market Prices"}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE AGMARKNET
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-primary font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              {sourceAttribution}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              {isTamil ? 'கடைசியாக புதுப்பிக்கப்பட்டது:' : 'Updated:'} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPrices(true)}
            disabled={isRefreshing || isLoading}
            className="rounded-xl border-border hover:bg-muted font-medium text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-primary")} />
            <span>{isTamil ? 'விலை புதுப்பி' : 'Refresh Mandi Prices'}</span>
          </Button>
        </div>
      </div>

      {/* Filter Controls (If enabled) */}
      {showFilters && (
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
          {/* Search and Dropdowns Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTamil ? 'பயிர் அல்லது சந்தை தேடுக...' : 'Search crop or mandi...'}
                className={cn(
                  'w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isTamil && 'font-tamil'
                )}
              />
            </div>

            {/* State Filter */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict('all');
                  setSelectedMarket('all');
                }}
                className={cn(
                  'w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isTamil && 'font-tamil'
                )}
              >
                <option value="all">{isTamil ? 'அனைத்து மாநிலங்கள் (All India)' : 'All States (National)'}</option>
                {availableStates.map(st => (
                  <option key={st} value={st}>
                    {language === 'ta' ? getStateTamil(st) : st}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedMarket('all');
                }}
                className={cn(
                  'w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isTamil && 'font-tamil'
                )}
              >
                <option value="all">{isTamil ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</option>
                {availableDistricts.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className={cn(
                  'w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                  isTamil && 'font-tamil'
                )}
              >
                <option value="name">{isTamil ? 'வரிசை: பெயர் வாரியாக' : 'Sort: Crop Name'}</option>
                <option value="price_high">{isTamil ? 'வரிசை: அதிக விலை' : 'Sort: Highest Price'}</option>
                <option value="price_low">{isTamil ? 'வரிசை: குறைந்த விலை' : 'Sort: Lowest Price'}</option>
                <option value="trend">{isTamil ? 'வரிசை: அதிக வளர்ச்சி (+%)' : 'Sort: Top Gainers (+%)'}</option>
              </select>
            </div>
          </div>

          {/* Category Quick Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-feedback',
                  activeCategory === cat.key 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60',
                  isTamil && 'font-tamil'
                )}
              >
                {language === 'ta' ? cat.ta : cat.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-44 rounded-md" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedRecords.length > 0 ? (
        /* Real Mandi Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAndSortedRecords.map((record, index) => {
            const emoji = getCommodityEmoji(record.commodity);
            const tamilName = getCommodityTamil(record.commodity);
            return (
              <div
                key={`${record.market}-${record.commodity}-${index}`}
                className="bg-card hover:bg-card/90 rounded-2xl p-4 sm:p-5 border border-border hover:border-primary/40 shadow-card transition-all duration-200 flex flex-col justify-between group hover:shadow-md"
              >
                {/* Top: Crop Emoji, Name, Trend Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {emoji}
                      </div>
                      <div>
                        <h3 className={cn(
                          'text-base font-bold text-foreground leading-tight',
                          isTamil && 'font-tamil'
                        )}>
                          {language === 'ta' ? tamilName : record.commodity}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {language === 'ta' ? record.commodity : tamilName}
                          {record.variety ? ` • ${record.variety}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {renderTrendBadge(record)}
                    </div>
                  </div>

                  {/* Market & Location Line */}
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="truncate font-semibold text-foreground">
                      {record.market}
                    </span>
                    <span className="opacity-60 truncate">({record.district}, {record.state})</span>
                  </div>
                </div>

                {/* Center: Modal Wholesale Price (Prominent) */}
                <div className="my-3.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {isTamil ? 'சராசரி மண்டி விலை (Modal Price)' : 'Modal Wholesale Price'}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-extrabold text-foreground tracking-tight">
                      ₹{record.modal_price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      /{isTamil ? 'குவிண்டால்' : 'Quintal'}
                    </span>
                  </div>

                  {/* Previous Price comparison if available */}
                  {record.previous_modal_price && (
                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                      <span>{isTamil ? 'முந்தைய விலை:' : 'Previous:'} ₹{record.previous_modal_price.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Bottom: Min - Max Price Range & Date */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {isTamil ? 'குறைந்த - அதிக வரம்பு' : 'Min — Max Range'}
                    </div>
                    <div className="font-semibold text-foreground text-xs">
                      ₹{record.min_price.toLocaleString()} — ₹{record.max_price.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {isTamil ? 'தேதி' : 'Price Date'}
                    </div>
                    <div className="font-medium text-foreground text-xs flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {record.arrival_date}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className={cn('text-sm font-semibold text-foreground', isTamil && 'font-tamil')}>
              {isTamil ? 'தேர்ந்தெடுக்கப்பட்ட விவரங்களுக்கு மண்டி தரவு இல்லை' : 'No current market data available for this selection.'}
            </h4>
            <p className={cn('text-xs text-muted-foreground mt-1', isTamil && 'font-tamil')}>
              {isTamil 
                ? 'வடிகட்டிகளை மாற்றி பிற மாநிலங்கள் அல்லது பயிர்களை சோதிக்கவும்.' 
                : 'Try adjusting your state, district, or crop filters to view available government mandi rates.'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedState('all');
              setSelectedDistrict('all');
              setSelectedMarket('all');
              setSelectedCommodity('all');
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="rounded-xl text-xs"
          >
            {isTamil ? 'அனைத்து வடிகட்டிகளையும் நீக்கு' : 'Reset All Filters'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TodayMarketPrices;
