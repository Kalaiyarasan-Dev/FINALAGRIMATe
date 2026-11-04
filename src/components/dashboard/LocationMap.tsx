import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ZoomIn, ZoomOut, Layers, ExternalLink, Navigation, Compass } from 'lucide-react';
import { LocationData } from '@/lib/locationWeatherService';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationMapProps {
  location: LocationData;
  className?: string;
  height?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ location, className, height = '220px' }) => {
  const { isTamil } = useLanguage();
  const [zoom, setZoom] = useState(14);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const googleMapRef = useRef<HTMLDivElement>(null);
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const lat = location.latitude;
  const lon = location.longitude;

  // Try initializing Google Maps if API key is provided
  useEffect(() => {
    if (!googleApiKey || !googleMapRef.current) return;

    const loadGoogleMaps = () => {
      const win = window as unknown as { google?: { maps?: { Map: unknown; Marker: unknown; LatLng: unknown } } };
      if (win.google?.maps) {
        initMap();
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
      }
    };

    const initMap = () => {
      try {
        const win = window as unknown as {
          google: {
            maps: {
              Map: new (el: HTMLElement, opts: object) => unknown;
              Marker: new (opts: object) => unknown;
              MapTypeId: { ROADMAP: string; SATELLITE: string };
            };
          };
        };
        if (googleMapRef.current && win.google?.maps) {
          const map = new win.google.maps.Map(googleMapRef.current, {
            center: { lat, lng: lon },
            zoom,
            mapTypeId: mapType === 'satellite' ? win.google.maps.MapTypeId.SATELLITE : win.google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: false,
          });

          new win.google.maps.Marker({
            position: { lat, lng: lon },
            map,
            title: location.formattedAddress || 'Your Location',
            animation: 1 // DROP
          });

          setIsGoogleLoaded(true);
        }
      } catch (err) {
        console.warn('Google Maps JS init failed, using interactive tile layer', err);
        setIsGoogleLoaded(false);
      }
    };

    loadGoogleMaps();
  }, [lat, lon, zoom, mapType, googleApiKey]);

  // OpenStreetMap / Leaflet embedded interactive tile viewer fallback
  // Generates smooth OSM bounding box
  const delta = 0.015 * Math.pow(2, 14 - zoom);
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn("relative rounded-2xl overflow-hidden border border-border shadow-card bg-muted/40", className)}>
      {/* Map Surface */}
      {googleApiKey && isGoogleLoaded ? (
        <div ref={googleMapRef} style={{ height }} className="w-full" />
      ) : (
        <div style={{ height }} className="w-full relative overflow-hidden bg-slate-900">
          <iframe
            title="Interactive Location Map"
            src={embedUrl}
            className="w-full h-full border-0 pointer-events-auto"
            loading="lazy"
          />

          {/* Center Pulsing Marker Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative -mt-6">
              {/* Radar pulse rings */}
              <div className="absolute -inset-3 bg-primary/30 rounded-full animate-ping" />
              <div className="absolute -inset-1.5 bg-primary/40 rounded-full animate-pulse" />
              {/* Pin Icon */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-primary text-white shadow-lg flex items-center justify-center border-2 border-white ring-2 ring-primary/20">
                <Navigation className="w-4 h-4 fill-white -rotate-45 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Left: Coordinates & Accuracy Pill */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
        <span className="px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-md text-[11px] font-mono font-semibold text-foreground shadow-sm border border-border/80 flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-primary animate-spin-slow" />
          {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
        </span>
        {location.accuracy && (
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 backdrop-blur-md">
            ±{Math.round(location.accuracy)}m {isTamil ? 'துல்லியம்' : 'Accuracy'}
          </span>
        )}
      </div>

      {/* Top Right: Open in Google Maps Button */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
        <button
          onClick={openInGoogleMaps}
          className="px-2.5 py-1 rounded-lg bg-background/90 hover:bg-background backdrop-blur-md text-[11px] font-medium text-foreground shadow-sm border border-border flex items-center gap-1.5 transition-all touch-feedback"
          title="Open in Google Maps"
        >
          <ExternalLink className="w-3 h-3 text-primary" />
          <span className="hidden sm:inline">{isTamil ? 'Google மேப்பில் பார்' : 'Google Maps'}</span>
        </button>
      </div>

      {/* Bottom Right: Zoom & Layer Controls */}
      <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-md p-1 rounded-xl border border-border shadow-md">
        <button
          onClick={() => setZoom(z => Math.min(18, z + 1))}
          className="p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3 bg-border" />
        <button
          onClick={() => setZoom(z => Math.max(8, z - 1))}
          className="p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Left: Location Address Bar */}
      <div className="absolute bottom-2.5 left-2.5 right-20 z-10 pointer-events-none">
        <div className="px-2.5 py-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border shadow-sm truncate flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-[11px] font-medium text-foreground truncate">
            {location.formattedAddress || `${location.city}, ${location.state}, ${location.country}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
