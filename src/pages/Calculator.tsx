import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { Calculator as CalcIcon, Droplets, Package, IndianRupee, Leaf, TrendingUp, Scale, ChevronDown } from 'lucide-react';

const Calculator: React.FC = () => {
  const { isTamil, language } = useLanguage();
  const { user } = useAuth();
  const [activeCalc, setActiveCalc] = useState<'profit' | 'fertilizer' | 'water' | 'seed'>('profit');

  // Profit Calculator State
  const [cropType, setCropType] = useState('paddy');
  const [landSize, setLandSize] = useState('');
  const [expectedYield, setExpectedYield] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [totalCost, setTotalCost] = useState('');

  // Fertilizer Calculator State
  const [fertLandSize, setFertLandSize] = useState('');
  const [fertCropType, setFertCropType] = useState('paddy');

  // Water Calculator State
  const [waterLandSize, setWaterLandSize] = useState('');
  const [waterCropType, setWaterCropType] = useState('paddy');
  const [irrigationType, setIrrigationType] = useState('flood');

  // Seed Calculator State
  const [seedLandSize, setSeedLandSize] = useState('');
  const [seedCropType, setSeedCropType] = useState('paddy');
  const [sowingMethod, setSowingMethod] = useState('transplanting');

  // Calculation History State
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('vivasayi_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('profit_estimates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            type: d.calculation_data?.type || 'profit',
            date: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent',
            details: d.calculation_data?.details || {}
          }));
          setHistory(mapped);
        }
      } catch (err) {
        console.warn('Calculation history fetch error:', err);
      }
    };
    fetchHistory();
  }, [user]);

  const saveToHistory = async (type: 'profit' | 'fertilizer' | 'water' | 'seed', details: any) => {
    const newRecord = {
      id: Date.now(),
      type,
      date: new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      details
    };
    const updated = [newRecord, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('vivasayi_calc_history', JSON.stringify(updated));

    if (user) {
      try {
        await supabase.from('profit_estimates').insert({
          user_id: user.id,
          crop_name: cropType || 'Crop',
          calculation_data: { type, details },
          estimated_profit: details.netProfit ? Number(details.netProfit) : null,
        });
      } catch (err) {
        console.warn('Profit estimate save error:', err);
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('vivasayi_calc_history');
  };

  const crops = [
    { key: 'paddy', en: 'Paddy/Rice', ta: 'நெல்' },
    { key: 'cotton', en: 'Cotton', ta: 'பருத்தி' },
    { key: 'sugarcane', en: 'Sugarcane', ta: 'கரும்பு' },
    { key: 'groundnut', en: 'Groundnut', ta: 'நிலக்கடலை' },
    { key: 'maize', en: 'Maize', ta: 'மக்காச்சோளம்' },
    { key: 'tomato', en: 'Tomato', ta: 'தக்காளி' },
    { key: 'chilli', en: 'Chilli', ta: 'மிளகாய்' },
    { key: 'onion', en: 'Onion', ta: 'வெங்காயம்' },
  ];

  const fertilizerRates: Record<string, { urea: number; dap: number; potash: number }> = {
    paddy: { urea: 90, dap: 50, potash: 40 },
    cotton: { urea: 60, dap: 50, potash: 30 },
    sugarcane: { urea: 130, dap: 70, potash: 50 },
    groundnut: { urea: 25, dap: 100, potash: 50 },
    maize: { urea: 100, dap: 50, potash: 40 },
    tomato: { urea: 80, dap: 60, potash: 80 },
    chilli: { urea: 60, dap: 50, potash: 50 },
    onion: { urea: 50, dap: 50, potash: 60 },
  };

  const waterRates: Record<string, Record<string, number>> = {
    paddy: { flood: 1500000, drip: 800000, sprinkler: 1000000 },
    cotton: { flood: 600000, drip: 350000, sprinkler: 450000 },
    sugarcane: { flood: 2000000, drip: 1200000, sprinkler: 1500000 },
    groundnut: { flood: 400000, drip: 250000, sprinkler: 300000 },
    maize: { flood: 500000, drip: 300000, sprinkler: 400000 },
    tomato: { flood: 450000, drip: 280000, sprinkler: 350000 },
    chilli: { flood: 400000, drip: 250000, sprinkler: 300000 },
    onion: { flood: 350000, drip: 220000, sprinkler: 280000 },
  };

  const seedRates: Record<string, Record<string, number>> = {
    paddy: { transplanting: 20, broadcasting: 40, drilling: 30 },
    cotton: { transplanting: 3, broadcasting: 4, drilling: 3 },
    sugarcane: { transplanting: 30000, broadcasting: 30000, drilling: 30000 },
    groundnut: { transplanting: 50, broadcasting: 60, drilling: 50 },
    maize: { transplanting: 8, broadcasting: 10, drilling: 8 },
    tomato: { transplanting: 0.15, broadcasting: 0.2, drilling: 0.15 },
    chilli: { transplanting: 0.5, broadcasting: 0.6, drilling: 0.5 },
    onion: { transplanting: 8, broadcasting: 10, drilling: 8 },
  };

  const calculators = [
    { key: 'profit', icon: IndianRupee, labelEn: 'Profit', labelTa: 'லாபம்' },
    { key: 'fertilizer', icon: Package, labelEn: 'Fertilizer', labelTa: 'உரம்' },
    { key: 'water', icon: Droplets, labelEn: 'Water', labelTa: 'நீர்' },
    { key: 'seed', icon: Leaf, labelEn: 'Seed', labelTa: 'விதை' },
  ];

  // Calculate Profit
  const calculateProfit = () => {
    const yield_ = parseFloat(expectedYield) || 0;
    const price = parseFloat(sellingPrice) || 0;
    const cost = parseFloat(totalCost) || 0;
    const revenue = yield_ * price;
    const profit = revenue - cost;
    return { revenue, profit, profitPerAcre: landSize ? profit / parseFloat(landSize) : 0 };
  };

  // Calculate Fertilizer
  const calculateFertilizer = () => {
    const size = parseFloat(fertLandSize) || 0;
    const rates = fertilizerRates[fertCropType] || fertilizerRates.paddy;
    return {
      urea: Math.round(size * rates.urea),
      dap: Math.round(size * rates.dap),
      potash: Math.round(size * rates.potash),
      total: Math.round(size * (rates.urea + rates.dap + rates.potash))
    };
  };

  // Calculate Water
  const calculateWater = () => {
    const size = parseFloat(waterLandSize) || 0;
    const rate = waterRates[waterCropType]?.[irrigationType] || 1000000;
    const liters = size * rate;
    return {
      liters,
      litersFormatted: liters >= 1000000 ? `${(liters / 1000000).toFixed(2)} ML` : `${(liters / 1000).toFixed(0)} KL`,
      savings: irrigationType === 'drip' ? '40-60%' : irrigationType === 'sprinkler' ? '20-30%' : '0%'
    };
  };

  // Calculate Seeds
  const calculateSeeds = () => {
    const size = parseFloat(seedLandSize) || 0;
    const rate = seedRates[seedCropType]?.[sowingMethod] || 20;
    const amount = size * rate;
    const unit = seedCropType === 'sugarcane' ? 'setts' : 'kg';
    return { amount: amount.toFixed(2), unit };
  };

  const profitResult = calculateProfit();
  const fertResult = calculateFertilizer();
  const waterResult = calculateWater();
  const seedResult = calculateSeeds();

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className={cn('text-2xl font-bold text-foreground font-heading', isTamil && 'font-tamil')}>
            {isTamil ? 'விவசாய கணிப்பான்' : 'Farm Calculator'}
          </h1>
          <p className={cn('text-sm text-muted-foreground mt-1', isTamil && 'font-tamil')}>
            {isTamil ? 'லாபம், உரம், நீர் மற்றும் விதை தேவைகளை கணக்கிடுங்கள்' : 'Calculate profit, fertilizer, water and seed requirements'}
          </p>
        </div>

        {/* Calculator Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <button
                key={calc.key}
                onClick={() => setActiveCalc(calc.key as any)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl transition-all touch-feedback',
                  activeCalc === calc.key
                    ? 'bg-primary text-primary-foreground shadow-primary'
                    : 'bg-card border border-border text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className={cn('text-xs font-medium', isTamil && 'font-tamil')}>
                  {language === 'ta' ? calc.labelTa : calc.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Profit Calculator */}
        {activeCalc === 'profit' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-4">
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'பயிர் வகை' : 'Crop Type'}
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                >
                  {crops.map(c => (
                    <option key={c.key} value={c.key}>{language === 'ta' ? c.ta : c.en}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                    {isTamil ? 'நிலம் (ஏக்கர்)' : 'Land (Acres)'}
                  </label>
                  <input
                    type="number"
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                    {isTamil ? 'மகசூல் (குவிண்டால்)' : 'Yield (Quintal)'}
                  </label>
                  <input
                    type="number"
                    value={expectedYield}
                    onChange={(e) => setExpectedYield(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                    {isTamil ? 'விலை (₹/Q)' : 'Price (₹/Q)'}
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                    placeholder="2200"
                  />
                </div>
                <div>
                  <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                    {isTamil ? 'மொத்த செலவு (₹)' : 'Total Cost (₹)'}
                  </label>
                  <input
                    type="number"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                    placeholder="50000"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-primary rounded-2xl p-4 text-white">
              <h3 className={cn('text-sm font-medium opacity-90 mb-3', isTamil && 'font-tamil')}>
                {isTamil ? 'கணக்கீடு முடிவுகள்' : 'Calculation Results'}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">₹{profitResult.revenue.toLocaleString()}</p>
                  <p className={cn('text-[10px] opacity-80', isTamil && 'font-tamil')}>{isTamil ? 'வருமானம்' : 'Revenue'}</p>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <p className={cn('text-xl font-bold', profitResult.profit >= 0 ? '' : 'text-red-300')}>
                    ₹{profitResult.profit.toLocaleString()}
                  </p>
                  <p className={cn('text-[10px] opacity-80', isTamil && 'font-tamil')}>{isTamil ? 'லாபம்' : 'Profit'}</p>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">₹{Math.round(profitResult.profitPerAcre).toLocaleString()}</p>
                  <p className={cn('text-[10px] opacity-80', isTamil && 'font-tamil')}>{isTamil ? '/ஏக்கர்' : '/Acre'}</p>
                </div>
              </div>
              <button
                onClick={() => saveToHistory('profit', {
                  crop: crops.find(c => c.key === cropType)?.en,
                  cropTa: crops.find(c => c.key === cropType)?.ta,
                  landSize,
                  profit: profitResult.profit
                })}
                disabled={!landSize || !expectedYield || !sellingPrice}
                className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white rounded-xl py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isTamil ? 'பதிவை சேமி' : 'Save Calculation Log'}
              </button>
            </div>
          </div>
        )}

        {/* Fertilizer Calculator */}
        {activeCalc === 'fertilizer' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-4">
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'பயிர் வகை' : 'Crop Type'}
                </label>
                <select
                  value={fertCropType}
                  onChange={(e) => setFertCropType(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                >
                  {crops.map(c => (
                    <option key={c.key} value={c.key}>{language === 'ta' ? c.ta : c.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'நிலம் (ஏக்கர்)' : 'Land Size (Acres)'}
                </label>
                <input
                  type="number"
                  value={fertLandSize}
                  onChange={(e) => setFertLandSize(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div className="bg-card rounded-2xl p-4 border border-border">
                <Package className="w-6 h-6 text-primary mb-2" />
                <p className="text-xl font-bold text-foreground">{fertResult.urea} kg</p>
                <p className={cn('text-xs text-muted-foreground', isTamil && 'font-tamil')}>{isTamil ? 'யூரியா' : 'Urea'}</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border">
                <Package className="w-6 h-6 text-sky mb-2" />
                <p className="text-xl font-bold text-foreground">{fertResult.dap} kg</p>
                <p className={cn('text-xs text-muted-foreground', isTamil && 'font-tamil')}>DAP</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border">
                <Package className="w-6 h-6 text-warning mb-2" />
                <p className="text-xl font-bold text-foreground">{fertResult.potash} kg</p>
                <p className={cn('text-xs text-muted-foreground', isTamil && 'font-tamil')}>{isTamil ? 'பொட்டாஷ்' : 'Potash'}</p>
              </div>
              <div className="bg-gradient-primary rounded-2xl p-4 text-white flex flex-col justify-between">
                <div>
                  <Scale className="w-6 h-6 mb-1 opacity-90" />
                  <p className="text-xl font-bold">{fertResult.total} kg</p>
                  <p className={cn('text-xs opacity-80', isTamil && 'font-tamil')}>{isTamil ? 'மொத்தம்' : 'Total'}</p>
                </div>
                <button
                  onClick={() => saveToHistory('fertilizer', {
                    crop: crops.find(c => c.key === fertCropType)?.en,
                    cropTa: crops.find(c => c.key === fertCropType)?.ta,
                    landSize: fertLandSize,
                    total: fertResult.total
                  })}
                  disabled={!fertLandSize}
                  className="mt-2 w-full bg-white/20 hover:bg-white/30 text-white rounded-lg py-1 text-[10px] font-semibold transition-colors disabled:opacity-50"
                >
                  {isTamil ? 'சேமி' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Water Calculator */}
        {activeCalc === 'water' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-4">
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'பயிர் வகை' : 'Crop Type'}
                </label>
                <select
                  value={waterCropType}
                  onChange={(e) => setWaterCropType(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                >
                  {crops.map(c => (
                    <option key={c.key} value={c.key}>{language === 'ta' ? c.ta : c.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'நிலம் (ஏக்கர்)' : 'Land Size (Acres)'}
                </label>
                <input
                  type="number"
                  value={waterLandSize}
                  onChange={(e) => setWaterLandSize(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                  placeholder="5"
                />
              </div>
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'நீர்ப்பாசன வகை' : 'Irrigation Type'}
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { key: 'flood', en: 'Flood', ta: 'வெள்ளம்' },
                    { key: 'drip', en: 'Drip', ta: 'சொட்டு' },
                    { key: 'sprinkler', en: 'Sprinkler', ta: 'தெளிப்பு' }
                  ].map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setIrrigationType(type.key)}
                      className={cn(
                        'py-2 rounded-xl text-sm font-medium transition-all',
                        irrigationType === type.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                        isTamil && 'font-tamil'
                      )}
                    >
                      {language === 'ta' ? type.ta : type.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-sky rounded-2xl p-4 text-white">
              <div className="flex items-center gap-3">
                <Droplets className="w-8 h-8" />
                <div className="flex-1">
                  <p className="text-3xl font-bold">{waterResult.litersFormatted}</p>
                  <p className={cn('text-xs opacity-80', isTamil && 'font-tamil')}>
                    {isTamil ? 'மொத்த நீர் தேவை' : 'Total Water Required'}
                  </p>
                </div>
                <button
                  onClick={() => saveToHistory('water', {
                    crop: crops.find(c => c.key === waterCropType)?.en,
                    cropTa: crops.find(c => c.key === waterCropType)?.ta,
                    landSize: waterLandSize,
                    method: irrigationType,
                    amount: waterResult.litersFormatted
                  })}
                  disabled={!waterLandSize}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isTamil ? 'சேமி' : 'Save'}
                </button>
              </div>
              {irrigationType !== 'flood' && (
                <div className="bg-white/20 rounded-xl p-2 mt-3 text-center text-xs">
                  <p className={isTamil ? 'font-tamil' : ''}>
                    {isTamil ? 'நீர் சேமிப்பு:' : 'Water Savings:'} <span className="font-bold">{waterResult.savings}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seed Calculator */}
        {activeCalc === 'seed' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-4">
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'பயிர் வகை' : 'Crop Type'}
                </label>
                <select
                  value={seedCropType}
                  onChange={(e) => setSeedCropType(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                >
                  {crops.map(c => (
                    <option key={c.key} value={c.key}>{language === 'ta' ? c.ta : c.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'நிலம் (ஏக்கர்)' : 'Land Size (Acres)'}
                </label>
                <input
                  type="number"
                  value={seedLandSize}
                  onChange={(e) => setSeedLandSize(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-border bg-background"
                  placeholder="5"
                />
              </div>
              <div>
                <label className={cn('text-sm font-medium text-foreground', isTamil && 'font-tamil')}>
                  {isTamil ? 'விதைப்பு முறை' : 'Sowing Method'}
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { key: 'transplanting', en: 'Transplant', ta: 'நடவு' },
                    { key: 'broadcasting', en: 'Broadcast', ta: 'தூவுதல்' },
                    { key: 'drilling', en: 'Drilling', ta: 'துளையிடுதல்' }
                  ].map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setSowingMethod(method.key)}
                      className={cn(
                        'py-2 rounded-xl text-sm font-medium transition-all',
                        sowingMethod === method.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                        isTamil && 'font-tamil'
                      )}
                    >
                      {language === 'ta' ? method.ta : method.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-harvest rounded-2xl p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Leaf className="w-8 h-8" />
                <div>
                  <p className="text-3xl font-bold">{seedResult.amount} {seedResult.unit}</p>
                  <p className={cn('text-xs opacity-80', isTamil && 'font-tamil')}>
                    {isTamil ? 'தேவையான விதை அளவு' : 'Required Seed Amount'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => saveToHistory('seed', {
                  crop: crops.find(c => c.key === seedCropType)?.en,
                  cropTa: crops.find(c => c.key === seedCropType)?.ta,
                  landSize: seedLandSize,
                  method: sowingMethod,
                  amount: `${seedResult.amount} ${seedResult.unit}`
                })}
                disabled={!seedLandSize}
                className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isTamil ? 'சேமி' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Calculation History Logs */}
        {history.length > 0 && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-3 mt-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className={cn('text-sm font-bold text-foreground', isTamil && 'font-tamil')}>
                {isTamil ? 'கடந்த கால கணிப்புகள்' : 'Calculation Log History'}
              </span>
              <button 
                onClick={clearHistory}
                className={cn('text-xs text-danger font-semibold', isTamil && 'font-tamil')}
              >
                {isTamil ? 'அழி' : 'Clear All'}
              </button>
            </div>
            <div className="space-y-2">
              {history.map((record) => (
                <div key={record.id} className="p-3 bg-muted/50 rounded-xl border border-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground uppercase tracking-wide text-[9px] bg-muted px-1.5 py-0.5 rounded mr-2">
                      {record.type === 'profit' ? (isTamil ? 'லாபம்' : 'Profit') :
                       record.type === 'fertilizer' ? (isTamil ? 'உரம்' : 'Fertilizer') :
                       record.type === 'water' ? (isTamil ? 'நீர்' : 'Water') : (isTamil ? 'விதை' : 'Seed')}
                    </span>
                    <span className={cn('text-foreground font-medium', isTamil && 'font-tamil')}>
                      {language === 'ta' ? record.details.cropTa : record.details.crop} ({record.details.landSize} ac)
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      {record.type === 'profit' ? `₹${record.details.profit.toLocaleString()}` :
                       record.type === 'fertilizer' ? `${record.details.total} kg` :
                       record.type === 'water' ? record.details.amount : record.details.amount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{record.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Calculator;
