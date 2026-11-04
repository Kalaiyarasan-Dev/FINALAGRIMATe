import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Droplets, 
  MapPin, 
  Loader2, 
  Navigation, 
  RefreshCw, 
  Compass, 
  Gauge, 
  Eye, 
  Sunrise, 
  Sunset, 
  Thermometer, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Sparkles,
  Map as MapIcon
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  LocationData, 
  DetailedWeatherData, 
  reverseGeocodeLocation, 
  fetchWeatherByCoordinates 
} from '@/lib/locationWeatherService';
import LocationMap from './LocationMap';

type LoadingStep = 'idle' | 'detecting_location' | 'geocoding' | 'fetching_weather';

const WeatherCard: React.FC = () => {
  const { isTamil, language } = useLanguage();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<DetailedWeatherData | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<{ messageEn: string; messageTa: string; code?: number } | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load weather using exact latitude and longitude
   */
  const loadWeatherData = useCallback(async (lat: number, lon: number, isSilentRefresh = false) => {
    if (isSilentRefresh) {
      setIsRefreshing(true);
    } else {
      setLoadingStep('fetching_weather');
    }
    setWeatherError(null);

    try {
      const weatherResult = await fetchWeatherByCoordinates(lat, lon);
      setWeather(weatherResult);
      if (isSilentRefresh) {
        toast.success(isTamil ? 'வானிலை தரவு புதுப்பிக்கப்பட்டது!' : 'Weather data updated!');
      }
    } catch (err) {
      console.error('Weather load error:', err);
      setWeatherError(isTamil ? 'வானிலை தரவைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to fetch weather data. Please retry.');
      if (isSilentRefresh) {
        toast.error(isTamil ? 'வானிலையை புதுப்பிக்க முடியவில்லை' : 'Failed to refresh weather');
      }
    } finally {
      setLoadingStep('idle');
      setIsRefreshing(false);
    }
  }, [isTamil]);

  /**
   * Full Flow: Detect Browser Location -> Geocode -> Fetch Weather
   */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      const err = {
        messageEn: 'Geolocation is not supported by your browser.',
        messageTa: 'உங்கள் உலாவியில் இருப்பிட வசதி ஆதரிக்கப்படவில்லை.'
      };
      setLocationError(err);
      toast.error(isTamil ? err.messageTa : err.messageEn);
      return;
    }

    setLoadingStep('detecting_location');
    setLocationError(null);
    setWeatherError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLoadingStep('geocoding');

        try {
          // 1. Reverse Geocode for City, District, State, Country, Postal Code
          const locData = await reverseGeocodeLocation(latitude, longitude);
          locData.accuracy = accuracy;
          setLocation(locData);

          // 2. Fetch Weather using exact coordinates
          await loadWeatherData(latitude, longitude, false);
          toast.success(
            isTamil 
              ? `${locData.district || locData.city} வானிலை கண்டறியப்பட்டது` 
              : `Located ${locData.district || locData.city} successfully`
          );
        } catch (err) {
          console.error('Geocoding or weather initialization failed:', err);
          // Fallback location object
          const fallbackLoc: LocationData = {
            latitude,
            longitude,
            accuracy,
            city: `${latitude.toFixed(3)}°N`,
            district: `${longitude.toFixed(3)}°E`,
            state: '',
            country: '',
            formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            source: 'gps'
          };
          setLocation(fallbackLoc);
          await loadWeatherData(latitude, longitude, false);
        }
      },
      (error) => {
        console.error('Browser Geolocation error:', error);
        setLoadingStep('idle');

        let messageEn = 'Location access is required to detect your current weather. Please allow location access in your browser.';
        let messageTa = 'உள்ளூர் வானிலையைக் கண்டறிய இருப்பிட அனுமதி தேவை. உலாவியில் இருப்பிட அனுமதியை வழங்கவும்.';

        if (error.code === error.PERMISSION_DENIED) {
          messageEn = 'Location access was denied. Please allow location permissions in browser settings.';
          messageTa = 'இருப்பிட அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் அனுமதியை இயக்கவும்.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          messageEn = 'GPS position is currently unavailable. Please check your network or device GPS.';
          messageTa = 'இருப்பிட தகவலை பெற இயலவில்லை. GPS அல்லது இணைய இணைப்பை சரிபார்க்கவும்.';
        } else if (error.code === error.TIMEOUT) {
          messageEn = 'Location detection timed out. Please try again.';
          messageTa = 'இருப்பிடத்தைக் கண்டறிவதில் காலதாமதம் ஆனது. மீண்டும் முயற்சிக்கவும்.';
        }

        setLocationError({ messageEn, messageTa, code: error.code });
        toast.error(isTamil ? messageTa : messageEn);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  /**
   * Manual Refresh Weather Button (reuses detected coordinates without re-prompting)
   */
  const handleRefreshWeather = () => {
    if (!location) {
      handleUseCurrentLocation();
      return;
    }
    loadWeatherData(location.latitude, location.longitude, true);
  };

  /**
   * Auto-refresh weather every 12 minutes if coordinates exist
   */
  useEffect(() => {
    if (location) {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = setInterval(() => {
        loadWeatherData(location.latitude, location.longitude, true);
      }, 12 * 60 * 1000);
    }
    return () => {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
    };
  }, [location, loadWeatherData]);

  /**
   * Weather condition animated icon helper
   */
  const getWeatherIcon = (condition: DetailedWeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-14 h-14 sm:w-16 sm:h-16 text-amber-300 animate-pulse-soft flex-shrink-0" />;
      case 'cloudy':
        return <Cloud className="w-14 h-14 sm:w-16 sm:h-16 text-white/90 animate-float flex-shrink-0" />;
      case 'partlyCloudy':
        return (
          <div className="relative animate-float flex-shrink-0">
            <Sun className="w-14 h-14 sm:w-16 sm:h-16 text-amber-300" />
            <Cloud className="w-9 h-9 sm:w-10 sm:h-10 text-white/90 absolute -bottom-1 -right-2" />
          </div>
        );
      case 'rainy':
        return <CloudRain className="w-14 h-14 sm:w-16 sm:h-16 text-sky-200 animate-bounce flex-shrink-0" />;
      case 'stormy':
        return <CloudLightning className="w-14 h-14 sm:w-16 sm:h-16 text-yellow-300 animate-pulse flex-shrink-0" />;
      case 'foggy':
      case 'snowy':
      default:
        return <Cloud className="w-14 h-14 sm:w-16 sm:h-16 text-white/80 flex-shrink-0" />;
    }
  };

  /**
   * Format last updated time
   */
  const formatLastUpdated = (date: Date) => {
    try {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    } catch {
      return 'Just now';
    }
  };

  // 1. Loading Skeleton State
  if (loadingStep !== 'idle' && !weather) {
    return (
      <div className="bg-gradient-primary rounded-3xl p-6 text-white shadow-primary relative overflow-hidden min-h-[260px] flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 bg-white/20 rounded-lg" />
            <Skeleton className="h-4 w-28 bg-white/15 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-12 rounded-2xl bg-white/20" />
        </div>

        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className={cn("text-sm font-semibold text-white/90", isTamil && "font-tamil")}>
            {loadingStep === 'detecting_location' && (isTamil ? 'ஜிபிஎஸ் மூலம் இருப்பிடத்தைக் கண்டறிகிறது...' : 'Detecting your GPS location...')}
            {loadingStep === 'geocoding' && (isTamil ? 'வரைபடம் & முகவரியை பெறுகிறது...' : 'Identifying your city & state...')}
            {loadingStep === 'fetching_weather' && (isTamil ? 'நேரலை வானிலை தரவை ஏற்றுகிறது...' : 'Loading accurate local weather...')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <Skeleton className="h-16 rounded-2xl bg-white/20" />
          <Skeleton className="h-16 rounded-2xl bg-white/20" />
          <Skeleton className="h-16 rounded-2xl bg-white/20" />
        </div>
      </div>
    );
  }

  // 2. Location Permission / Un-initialized State
  if (!location || !weather || locationError) {
    return (
      <div className="bg-gradient-primary rounded-3xl p-6 sm:p-7 text-primary-foreground shadow-primary relative overflow-hidden min-h-[260px] flex flex-col items-center justify-center text-center">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-emerald-300 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3.5 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
            {locationError ? (
              <AlertCircle className="w-8 h-8 text-amber-300 animate-pulse" />
            ) : (
              <Navigation className="w-8 h-8 text-white -rotate-45" />
            )}
          </div>

          <div>
            <h3 className={cn("text-xl font-bold tracking-tight text-white mb-1.5", isTamil && "font-tamil")}>
              {locationError 
                ? (isTamil ? 'இருப்பிட அனுமதி தேவை' : 'Location Access Required')
                : (isTamil ? 'நேரலை வானிலை & பயிர் ஆலோசனை' : 'Real-Time Farm Weather')}
            </h3>
            <p className={cn("text-xs sm:text-sm text-white/85 leading-relaxed", isTamil && "font-tamil")}>
              {locationError
                ? (language === 'ta' ? locationError.messageTa : locationError.messageEn)
                : (isTamil 
                    ? 'துல்லியமான ஜிபிஎஸ் ஆயத்தொலைவுகள் மூலம் நிகழ்நேர உள்ளூர் வானிலை மற்றும் வரைபடத்தைக் காணுங்கள்.' 
                    : 'Get hyper-local, real-time weather, humidity, and interactive map by using your device GPS coordinates.')}
            </p>
          </div>

          <Button
            onClick={handleUseCurrentLocation}
            className="mt-2 px-6 py-6 rounded-2xl bg-white text-primary hover:bg-white/95 font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Navigation className="w-4 h-4 fill-primary" />
            <span className={cn(isTamil && "font-tamil")}>
              {locationError
                ? (isTamil ? 'மீண்டும் முயற்சிக்கவும் (Try Again)' : 'Try Again')
                : (isTamil ? '📍 எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்து' : '📍 Use My Current Location')}
            </span>
          </Button>

          <p className="text-[10px] text-white/60 font-mono">
            GPS Lat/Lon → Google Maps → Real-time Weather API
          </p>
        </div>
      </div>
    );
  }

  // 3. Active Weather & Location Card (Production UI)
  return (
    <div className="space-y-3">
      {/* Primary Weather Widget */}
      <div className="bg-gradient-primary rounded-3xl p-5 sm:p-6 text-white shadow-primary overflow-hidden relative transition-all duration-300">
        {/* Background Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-400 blur-3xl" />
        </div>

        <div className="relative z-10 space-y-4">
          {/* Top Bar: Location Title & Refresh Controls */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                <span className={cn("truncate font-semibold text-white", isTamil && "font-tamil")}>
                  {location.city || location.district}
                  {location.state ? `, ${location.state}` : ''}
                </span>
                {location.country && (
                  <span className="opacity-75 hidden sm:inline">({location.country})</span>
                )}
              </div>

              {/* Coordinates Pill */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-[10px] text-white/70">
                <span className="px-1.5 py-0.5 rounded bg-black/15">
                  {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                </span>
                {location.accuracy && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200">
                    ±{Math.round(location.accuracy)}m
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Refresh Weather & Toggle Map */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowMap(!showMap)}
                className={cn(
                  "px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-1.5",
                  showMap 
                    ? "bg-white text-primary border-white shadow-md" 
                    : "bg-white/15 hover:bg-white/25 text-white border-white/20"
                )}
                title="Toggle Google Map"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isTamil ? 'வரைபடம்' : 'Map'}</span>
                {showMap ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                onClick={handleRefreshWeather}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all disabled:opacity-50"
                title="Refresh Real-time Weather"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Center Main Temp & Condition */}
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                  {weather.temperature}
                </span>
                <span className="text-2xl sm:text-3xl font-semibold opacity-90">°C</span>
                <span className="ml-2 text-xs sm:text-sm text-white/80 font-medium self-end pb-1.5">
                  ({isTamil ? 'உணர்வு:' : 'Feels like'} {weather.feelsLike}°C)
                </span>
              </div>

              <div className="mt-1">
                <p className={cn("text-base sm:text-lg font-bold text-white tracking-wide", isTamil && "font-tamil")}>
                  {language === 'ta' ? weather.conditionTextTa : weather.conditionTextEn}
                </p>
                <p className={cn("text-xs text-white/75 line-clamp-1 mt-0.5", isTamil && "font-tamil")}>
                  {language === 'ta' ? weather.descriptionTa : weather.descriptionEn}
                </p>
              </div>
            </div>

            {getWeatherIcon(weather.condition)}
          </div>

          {/* Primary Quick Stats Grid (Humidity, Rain, Wind) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            {/* Humidity */}
            <div className="bg-white/15 hover:bg-white/20 rounded-2xl p-2.5 sm:p-3 backdrop-blur-md border border-white/10 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1.5 text-white/75 text-[11px] mb-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-200" />
                <span className={cn(isTamil && "font-tamil")}>{isTamil ? 'ஈரப்பதம்' : 'Humidity'}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white">{weather.humidity}%</p>
            </div>

            {/* Rainfall */}
            <div className="bg-white/15 hover:bg-white/20 rounded-2xl p-2.5 sm:p-3 backdrop-blur-md border border-white/10 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1.5 text-white/75 text-[11px] mb-1">
                <CloudRain className="w-3.5 h-3.5 text-sky-200" />
                <span className={cn(isTamil && "font-tamil")}>{isTamil ? 'மழைப்பொழிவு' : 'Rainfall'}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white">{weather.rainfall} <span className="text-[10px] font-normal">mm</span></p>
            </div>

            {/* Wind */}
            <div className="bg-white/15 hover:bg-white/20 rounded-2xl p-2.5 sm:p-3 backdrop-blur-md border border-white/10 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1.5 text-white/75 text-[11px] mb-1">
                <Wind className="w-3.5 h-3.5 text-emerald-200" />
                <span className={cn(isTamil && "font-tamil")}>{isTamil ? 'காற்று' : 'Wind'}</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white">
                {weather.windSpeed} <span className="text-[10px] font-normal">km/h ({weather.windDirection})</span>
              </p>
            </div>
          </div>

          {/* Secondary Agricultural Weather Metrics (Pressure, Visibility, Cloudiness, Sun) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/15 text-[11px]">
            {/* Pressure */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/10">
              <Gauge className="w-3.5 h-3.5 text-amber-200 flex-shrink-0" />
              <div>
                <div className="text-white/60 text-[10px]">{isTamil ? 'காற்றழுத்தம்' : 'Pressure'}</div>
                <div className="font-semibold text-white">{weather.pressure} hPa</div>
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/10">
              <Eye className="w-3.5 h-3.5 text-cyan-200 flex-shrink-0" />
              <div>
                <div className="text-white/60 text-[10px]">{isTamil ? 'பார்வை தூரம்' : 'Visibility'}</div>
                <div className="font-semibold text-white">{weather.visibility} km</div>
              </div>
            </div>

            {/* Sunrise */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/10">
              <Sunrise className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <div>
                <div className="text-white/60 text-[10px]">{isTamil ? 'சூரிய உதயம்' : 'Sunrise'}</div>
                <div className="font-semibold text-white">{weather.sunrise}</div>
              </div>
            </div>

            {/* Sunset */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/10">
              <Sunset className="w-3.5 h-3.5 text-orange-300 flex-shrink-0" />
              <div>
                <div className="text-white/60 text-[10px]">{isTamil ? 'சூரிய மறைவு' : 'Sunset'}</div>
                <div className="font-semibold text-white">{weather.sunset}</div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Source & Last Updated timestamp */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-white/60 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              GPS Weather • {weather.apiSource.toUpperCase()}
            </span>
            <span>
              {isTamil ? 'கடைசியாக புதுப்பிக்கப்பட்டது:' : 'Last updated:'} {formatLastUpdated(weather.lastUpdated)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Google Map / OpenStreetMap Component */}
      {showMap && (
        <div className="animate-slide-down">
          <LocationMap location={location} height="240px" />
        </div>
      )}

      {/* Weather Error State Warning Banner (if refresh failed but cached coordinates exist) */}
      {weatherError && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{weatherError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshWeather}
            className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/10"
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
