import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Compass, 
  Calendar, 
  RefreshCw,
  Sun,
  CloudSun,
  CloudLightning,
  Info,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  fetchLiveWeather, 
  evaluateCropWeatherAlerts, 
  LiveWeatherData, 
  WeatherCropAlert, 
  POPULAR_DISTRICTS, 
  MONITORED_CROPS, 
  DistrictLocation,
  CropInfo 
} from '@/services/weatherService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WeatherAlertsSectionProps {
  onSelectWeatherContext?: (context: { temp: number; humidity: number; condition: string }) => void;
}

export const WeatherAlertsSection: React.FC<WeatherAlertsSectionProps> = ({ onSelectWeatherContext }) => {
  const { isTamil, language } = useLanguage();
  
  // Selected location and crop
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictLocation>(POPULAR_DISTRICTS[0]);
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(MONITORED_CROPS[0]);
  
  // Weather state
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherCropAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchDistrict, setSearchDistrict] = useState<string>('');

  // Load weather when district or crop changes
  useEffect(() => {
    loadWeather(selectedDistrict.lat, selectedDistrict.lon, selectedDistrict.district, selectedDistrict.state);
  }, [selectedDistrict]);

  // Re-evaluate crop alerts when crop changes
  useEffect(() => {
    if (weatherData) {
      const generatedAlerts = evaluateCropWeatherAlerts(weatherData, selectedCrop.id);
      setAlerts(generatedAlerts);
      if (onSelectWeatherContext) {
        onSelectWeatherContext({
          temp: weatherData.temperature,
          humidity: weatherData.humidity,
          condition: weatherData.conditionText,
        });
      }
    }
  }, [selectedCrop, weatherData]);

  const loadWeather = async (lat: number, lon: number, districtName: string, stateName: string) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveWeather(lat, lon, districtName, stateName);
      setWeatherData(data);
      const generatedAlerts = evaluateCropWeatherAlerts(data, selectedCrop.id);
      setAlerts(generatedAlerts);
      
      if (onSelectWeatherContext) {
        onSelectWeatherContext({
          temp: data.temperature,
          humidity: data.humidity,
          condition: data.conditionText,
        });
      }
    } catch (err) {
      console.error('Failed to load weather:', err);
      toast.error(isTamil ? 'வானிலை தகவல்களைப் பெறுவதில் சிக்கல்' : 'Could not fetch live weather data');
    } finally {
      setIsLoading(false);
    }
  };

  // GPS Location detection with browser permissions
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error(isTamil ? 'உங்கள் சாதனத்தில் ஜிபிஎஸ் வசதி கிடைக்கவில்லை' : 'Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        toast.success(isTamil ? 'ஜிபிஎஸ் இருப்பிடம் கண்டறியப்பட்டது' : 'Detected your current GPS location');
        await loadWeather(latitude, longitude, 'Detected GPS Location', 'Current Region');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        toast.error(isTamil ? 'இருப்பிட அனுமதி வழங்கப்படவில்லை' : 'Location permission denied. Please select district manually.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const filteredDistricts = POPULAR_DISTRICTS.filter(d => 
    d.district.toLowerCase().includes(searchDistrict.toLowerCase()) || 
    d.districtTa.includes(searchDistrict)
  );

  return (
    <div className="space-y-6">
      {/* Selection Control Card */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className={cn("text-base font-bold text-foreground flex items-center gap-2", isTamil && "font-tamil")}>
              <MapPin className="w-5 h-5 text-primary" />
              {isTamil ? 'விவசாய பகுதி மற்றும் பயிர் தேர்வு' : 'Farm Location & Crop Selection'}
            </h3>
            <p className={cn("text-xs text-muted-foreground mt-0.5", isTamil && "font-tamil")}>
              {isTamil ? 'உங்கள் பகுதி வானிலை மற்றும் பயிர் ஆபத்துகளை கண்காணிக்கவும்' : 'Track weather parameters and localized crop risk triggers'}
            </p>
          </div>

          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all touch-feedback self-start sm:self-auto"
          >
            <Compass className={cn("w-4 h-4", isLocating && "animate-spin")} />
            {isLocating 
              ? (isTamil ? 'கண்டறிகிறது...' : 'Locating...') 
              : (isTamil ? 'ஜிபிஎஸ் இருப்பிடம்' : 'Use GPS Location')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* District Selector */}
          <div>
            <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
              {isTamil ? 'மாவட்டம் தேர்ந்தெடுக்கவும்' : 'Select District'}
            </label>
            <div className="relative">
              <select
                value={selectedDistrict.district}
                onChange={(e) => {
                  const found = POPULAR_DISTRICTS.find(d => d.district === e.target.value);
                  if (found) setSelectedDistrict(found);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none appearance-none pr-10"
              >
                {filteredDistricts.map(d => (
                  <option key={d.district} value={d.district}>
                    {isTamil ? `${d.districtTa} (${d.stateTa})` : `${d.district}, ${d.state}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Crop Selector */}
          <div>
            <label className={cn("block text-xs font-semibold text-foreground mb-1.5", isTamil && "font-tamil")}>
              {isTamil ? 'கண்காணிக்க வேண்டிய பயிர்' : 'Select Crop Type to Monitor'}
            </label>
            <div className="relative">
              <select
                value={selectedCrop.id}
                onChange={(e) => {
                  const found = MONITORED_CROPS.find(c => c.id === e.target.value);
                  if (found) setSelectedCrop(found);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none appearance-none pr-10"
              >
                {MONITORED_CROPS.map(c => (
                  <option key={c.id} value={c.id}>
                    {isTamil ? c.nameTa : c.nameEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Weather Indicator Card */}
      {isLoading ? (
        <div className="bg-card rounded-2xl p-8 border border-border flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className={cn("text-sm text-muted-foreground", isTamil && "font-tamil")}>
            {isTamil ? 'நேரடி வானிலை தகவல்கள் பெறப்படுகின்றன...' : 'Retrieving live weather satellite & radar data...'}
          </p>
        </div>
      ) : weatherData ? (
        <div className="bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl p-5 border border-primary/20 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  {weatherData.isLive ? (isTamil ? 'நேரடி வானிலை தரவு' : 'Verified Live Data') : 'Weather Station Data'}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {isTamil ? `புதுப்பிக்கப்பட்டது: ${weatherData.fetchedAt}` : `Updated at: ${weatherData.fetchedAt}`}
                </span>
              </div>
            </div>

            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {isTamil ? selectedDistrict.districtTa : weatherData.locationName}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
              <div className="p-2.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("text-[11px] text-muted-foreground", isTamil && "font-tamil")}>
                  {isTamil ? 'வெப்பநிலை' : 'Temperature'}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {weatherData.temperature}°C
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isTamil ? `உணரப்படுவது ${weatherData.apparentTemperature}°C` : `Feels like ${weatherData.apparentTemperature}°C`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
              <div className="p-2.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("text-[11px] text-muted-foreground", isTamil && "font-tamil")}>
                  {isTamil ? 'ஈரப்பதம்' : 'Humidity'}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {weatherData.humidity}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {weatherData.humidity > 75 ? (isTamil ? 'அதிக ஈரப்பதம்' : 'High') : (isTamil ? 'சாதாரண அளவு' : 'Normal')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("text-[11px] text-muted-foreground", isTamil && "font-tamil")}>
                  {isTamil ? 'மழைப்பொழிவு' : 'Precipitation'}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {weatherData.precipitation} mm
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {isTamil ? weatherData.conditionTextTa : weatherData.conditionText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
              <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("text-[11px] text-muted-foreground", isTamil && "font-tamil")}>
                  {isTamil ? 'காற்று வேகம்' : 'Wind Speed'}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {weatherData.windSpeed} km/h
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {weatherData.windSpeed > 30 ? (isTamil ? 'பலத்த காற்று' : 'High Gusts') : (isTamil ? 'மிதமான காற்று' : 'Gentle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Weather Crop Risk Alerts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={cn("text-base font-bold text-foreground flex items-center gap-2", isTamil && "font-tamil")}>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {isTamil ? `${selectedCrop.nameTa} பயிருக்கான நேரடி வானிலை எச்சரிக்கைகள்` : `Active Weather Alerts for ${selectedCrop.nameEn}`}
          </h3>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className={cn("text-sm font-bold text-emerald-900 dark:text-emerald-100", isTamil && "font-tamil")}>
                {isTamil ? 'கடுமையான வானிலை ஆபத்துகள் ஏதுமில்லை' : 'No Severe Weather Risks Detected'}
              </h4>
              <p className={cn("text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed", isTamil && "font-tamil")}>
                {isTamil
                  ? `தற்போதைய வானிலை முன்னறிவிப்பு ${selectedCrop.nameTa} பயிருக்கு உகந்ததாக உள்ளது. வழக்கமான பாசனம் மற்றும் சாகுபடி பணிகளை தொடரலாம்.`
                  : `Current meteorological forecast parameters remain within safe agronomic thresholds for ${selectedCrop.nameEn}. Scheduled farming activities may proceed normally.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const isCrit = alert.severity === 'critical';
              const isHigh = alert.severity === 'high';
              const isMed = alert.severity === 'medium';

              const severityBadge = (
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                  isCrit && "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
                  isHigh && "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
                  isMed && "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
                  !isCrit && !isHigh && !isMed && "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                )}>
                  {isCrit ? (isTamil ? 'அதிதீவிரம்' : 'Critical') :
                   isHigh ? (isTamil ? 'அதிக ஆபத்து' : 'High') :
                   isMed ? (isTamil ? 'மிதமானது' : 'Medium') : (isTamil ? 'ஆலோசனை' : 'Advisory')}
                </span>
              );

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "bg-card rounded-2xl p-5 border transition-all shadow-soft space-y-3",
                    isCrit && "border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20",
                    isHigh && "border-orange-300 dark:border-orange-900 bg-orange-50/20 dark:bg-orange-950/20",
                    isMed && "border-amber-300 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/20",
                    !isCrit && !isHigh && !isMed && "border-blue-200 dark:border-blue-900"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {severityBadge}
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {alert.forecastDate}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                      {alert.metricValue}
                    </span>
                  </div>

                  <div>
                    <h4 className={cn("text-base font-bold text-foreground", isTamil && "font-tamil")}>
                      {isTamil ? alert.titleTa : alert.titleEn}
                    </h4>
                    <p className={cn("text-xs text-muted-foreground mt-0.5", isTamil && "font-tamil")}>
                      {isTamil ? alert.weatherConditionTa : alert.weatherConditionEn}
                    </p>
                  </div>

                  {/* Crop Impact Box */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className={cn("text-xs font-bold text-amber-900 dark:text-amber-200", isTamil && "font-tamil")}>
                          {isTamil ? `${selectedCrop.nameTa} பயிருக்கு ஏற்படும் தாக்கம்:` : `Impact on ${selectedCrop.nameEn}:`}
                        </p>
                        <p className={cn("text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed", isTamil && "font-tamil")}>
                          {isTamil ? alert.cropImpactTa : alert.cropImpactEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <p className={cn("text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5", isTamil && "font-tamil")}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      {isTamil ? 'விவசாயிகளுக்கான பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்:' : 'Recommended Farmer Actions:'}
                    </p>
                    <ul className="space-y-1.5 pl-1">
                      {(isTamil ? alert.recommendationsTa : alert.recommendationsEn).map((rec, idx) => (
                        <li key={idx} className={cn("text-xs text-foreground/90 flex items-start gap-2", isTamil && "font-tamil")}>
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7-Day Weather & Crop Advisory Forecast */}
      {weatherData && weatherData.dailyForecast.length > 0 && (
        <div className="bg-card rounded-2xl p-5 border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className={cn("text-base font-bold text-foreground flex items-center gap-2", isTamil && "font-tamil")}>
                <Calendar className="w-5 h-5 text-primary" />
                {isTamil ? '7-நாள் வானிலை & பயிர் முன்னறிவிப்பு' : '7-Day Weather & Crop Advisory Forecast'}
              </h3>
              <p className={cn("text-xs text-muted-foreground mt-0.5", isTamil && "font-tamil")}>
                {isTamil ? `${selectedCrop.nameTa} பயிருக்கான தினசரி வானிலை மற்றும் மழை அளவு` : `Daily temperature, rainfall metrics, and advisory for ${selectedCrop.nameEn}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {weatherData.dailyForecast.map((day, idx) => {
              const isToday = idx === 0;
              const hasRain = day.precipitationSum > 1.0;
              const isHeavy = day.precipitationSum > 25.0;

              return (
                <div
                  key={day.date}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col items-center text-center transition-all",
                    isToday ? "bg-primary/10 border-primary/40 shadow-sm" : "bg-muted/30 border-border hover:bg-muted/60",
                    isHeavy && "border-rose-400 bg-rose-50/40 dark:bg-rose-950/20"
                  )}
                >
                  <span className={cn("text-xs font-bold text-foreground", isToday && "text-primary")}>
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>

                  <div className="my-2 text-primary">
                    {hasRain ? (
                      <CloudRain className={cn("w-6 h-6", isHeavy ? "text-rose-500" : "text-sky-500")} />
                    ) : day.tempMax > 36 ? (
                      <Sun className="w-6 h-6 text-amber-500" />
                    ) : (
                      <CloudSun className="w-6 h-6 text-sky-500" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <span>{day.tempMax}°</span>
                    <span className="text-muted-foreground text-[10px]">/ {day.tempMin}°</span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                    <Droplets className="w-3 h-3" />
                    <span>{day.precipitationSum} mm</span>
                  </div>

                  <span className={cn("text-[9px] text-muted-foreground mt-1 line-clamp-1", isTamil && "font-tamil")}>
                    {isTamil ? day.conditionTextTa : day.conditionText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
