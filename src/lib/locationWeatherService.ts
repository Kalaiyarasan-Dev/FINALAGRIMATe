/**
 * Location & Accurate Real-time Weather Service
 * 
 * CORE FLOW:
 * Browser HTML5 Geolocation (exact lat & lon)
 * -> Google Maps / Reverse Geocoding
 * -> Real-time Weather API (lat, lon)
 * -> High-accuracy weather card + interactive map
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number; // in meters
  city: string;
  district: string;
  state: string;
  country: string;
  postcode?: string;
  formattedAddress: string;
  source: 'google' | 'nominatim' | 'gps';
}

export interface DetailedWeatherData {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: 'sunny' | 'partlyCloudy' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy';
  conditionTextEn: string;
  conditionTextTa: string;
  descriptionEn: string;
  descriptionTa: string;
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  windDirection: string; // e.g. "NE", "SSW"
  windDegree: number;
  pressure: number; // hPa
  visibility: number; // km
  cloudiness: number; // %
  sunrise: string; // e.g. "05:57 AM"
  sunset: string; // e.g. "06:24 PM"
  uvIndex?: number;
  lastUpdated: Date;
  apiSource: 'openweather' | 'open-meteo' | 'netlify-function';
}

/**
 * Degrees to Compass Direction converter
 */
export function getWindDirectionLabel(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index] || 'N';
}

/**
 * Format ISO or epoch timestamp to 12-hour local time (e.g. 5:57 AM)
 */
function formatTime12H(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '--:--';
  }
}

/**
 * Reverse Geocoding using Google Geocoding API or OpenStreetMap Nominatim
 */
export async function reverseGeocodeLocation(lat: number, lon: number): Promise<LocationData> {
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || (window as unknown as { GOOGLE_MAPS_API_KEY?: string }).GOOGLE_MAPS_API_KEY;

  // 1. Try Google Maps Geocoding if API key is configured
  if (googleApiKey) {
    try {
      const gRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleApiKey}`);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.status === 'OK' && gData.results && gData.results.length > 0) {
          const first = gData.results[0];
          let city = '';
          let district = '';
          let state = '';
          let country = '';
          let postcode = '';

          for (const comp of first.address_components) {
            if (comp.types.includes('locality') || comp.types.includes('sublocality')) {
              city = comp.long_name;
            }
            if (comp.types.includes('administrative_area_level_2')) {
              district = comp.long_name;
            }
            if (comp.types.includes('administrative_area_level_1')) {
              state = comp.long_name;
            }
            if (comp.types.includes('country')) {
              country = comp.long_name;
            }
            if (comp.types.includes('postal_code')) {
              postcode = comp.long_name;
            }
          }

          return {
            latitude: lat,
            longitude: lon,
            city: city || district || 'Detected City',
            district: district || city || 'Local Region',
            state: state || '',
            country: country || 'India',
            postcode,
            formattedAddress: first.formatted_address,
            source: 'google'
          };
        }
      }
    } catch (e) {
      console.warn('Google Geocoding request failed, falling back to OSM Nominatim', e);
    }
  }

  // 2. OpenStreetMap Nominatim Reverse Geocoding (Highly accurate, globally supported)
  try {
    const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VivasayiAgriApp/1.0'
      }
    });

    if (osmRes.ok) {
      const data = await osmRes.json();
      const addr = data.address || {};

      const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || 'Detected Area';
      const district = (addr.state_district || addr.county || addr.district || city).replace(/\s*(District|Taluk|County|Division)/i, '');
      const state = addr.state || '';
      const country = addr.country || '';
      const postcode = addr.postcode || '';

      const cleanParts = [city, state, country].filter(Boolean);

      return {
        latitude: lat,
        longitude: lon,
        city: city.replace(/\s*(Corporation|Municipality)/i, ''),
        district,
        state,
        country,
        postcode,
        formattedAddress: cleanParts.join(', ') || data.display_name,
        source: 'nominatim'
      };
    }
  } catch (e) {
    console.warn('Nominatim reverse geocoding failed', e);
  }

  // 3. Fallback coordinates display
  return {
    latitude: lat,
    longitude: lon,
    city: `${lat.toFixed(3)}°N`,
    district: `${lon.toFixed(3)}°E`,
    state: '',
    country: '',
    formattedAddress: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    source: 'gps'
  };
}

/**
 * Fetch Real-Time Weather using exact latitude and longitude
 */
export async function fetchWeatherByCoordinates(lat: number, lon: number): Promise<DetailedWeatherData> {
  const openWeatherKey = import.meta.env.VITE_WEATHER_API_KEY || (window as unknown as { WEATHER_API_KEY?: string }).WEATHER_API_KEY;

  // Option A: If OpenWeather API key is configured, use OpenWeather API
  if (openWeatherKey) {
    try {
      const owRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherKey}`
      );

      if (owRes.ok) {
        const ow = await owRes.json();
        const condInfo = mapOpenWeatherCondition(ow.weather?.[0]?.id || 800, ow.weather?.[0]?.description);

        const sunriseTime = ow.sys?.sunrise ? formatTime12H(ow.sys.sunrise * 1000) : '--:--';
        const sunsetTime = ow.sys?.sunset ? formatTime12H(ow.sys.sunset * 1000) : '--:--';

        return {
          temperature: Math.round(ow.main.temp),
          feelsLike: Math.round(ow.main.feels_like),
          tempMin: Math.round(ow.main.temp_min),
          tempMax: Math.round(ow.main.temp_max),
          condition: condInfo.condition,
          conditionTextEn: condInfo.en,
          conditionTextTa: condInfo.ta,
          descriptionEn: ow.weather?.[0]?.description || condInfo.en,
          descriptionTa: condInfo.descriptionTa,
          humidity: Math.round(ow.main.humidity),
          rainfall: ow.rain ? (ow.rain['1h'] || ow.rain['3h'] || 0) : 0,
          windSpeed: Math.round(ow.wind.speed * 3.6), // m/s to km/h
          windDirection: getWindDirectionLabel(ow.wind.deg || 0),
          windDegree: ow.wind.deg || 0,
          pressure: Math.round(ow.main.pressure),
          visibility: Math.round((ow.visibility || 10000) / 100) / 10, // meters to km
          cloudiness: Math.round(ow.clouds?.all || 0),
          sunrise: sunriseTime,
          sunset: sunsetTime,
          lastUpdated: new Date(),
          apiSource: 'openweather'
        };
      }
    } catch (owErr) {
      console.warn('OpenWeather request failed, using high-precision Open-Meteo API', owErr);
    }
  }

  // Option B: High-Accuracy Global Real-Time Weather via Open-Meteo (No rate limit / 100% real live data)
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min&timezone=auto`
  );

  if (!weatherRes.ok) {
    throw new Error(`Weather service returned HTTP ${weatherRes.status}`);
  }

  const data = await weatherRes.json();
  const current = data.current;
  const daily = data.daily || {};

  const wmoCode = current.weather_code ?? 0;
  const condInfo = mapWmoWeatherCode(wmoCode);

  const sunriseIso = daily.sunrise?.[0];
  const sunsetIso = daily.sunset?.[0];

  const tempMax = daily.temperature_2m_max?.[0] !== undefined ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m + 2);
  const tempMin = daily.temperature_2m_min?.[0] !== undefined ? Math.round(daily.temperature_2m_min[0]) : Math.round(current.temperature_2m - 3);

  const visibilityKm = current.visibility !== undefined ? Math.round((current.visibility / 1000) * 10) / 10 : 10;

  return {
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m),
    tempMin,
    tempMax,
    condition: condInfo.condition,
    conditionTextEn: condInfo.en,
    conditionTextTa: condInfo.ta,
    descriptionEn: condInfo.descEn,
    descriptionTa: condInfo.descTa,
    humidity: Math.round(current.relative_humidity_2m),
    rainfall: parseFloat((current.rain ?? current.precipitation ?? 0).toFixed(1)),
    windSpeed: Math.round(current.wind_speed_10m ?? 0),
    windDirection: getWindDirectionLabel(current.wind_direction_10m ?? 0),
    windDegree: current.wind_direction_10m ?? 0,
    pressure: Math.round(current.pressure_msl ?? 1013),
    visibility: visibilityKm,
    cloudiness: Math.round(current.cloud_cover ?? 0),
    sunrise: sunriseIso ? formatTime12H(sunriseIso) : '05:45 AM',
    sunset: sunsetIso ? formatTime12H(sunsetIso) : '06:30 PM',
    lastUpdated: new Date(),
    apiSource: 'open-meteo'
  };
}

/**
 * Map WMO Weather Codes to Friendly Bilingual Labels
 */
function mapWmoWeatherCode(code: number): {
  condition: DetailedWeatherData['condition'];
  en: string;
  ta: string;
  descEn: string;
  descTa: string;
} {
  if (code === 0) {
    return {
      condition: 'sunny',
      en: 'Clear Sky',
      ta: 'தெளிவான வானம்',
      descEn: 'Clear sunny sky with optimum sunlight',
      descTa: 'பயிர் வளர்ச்சிக்கு உகந்த தெளிவான வெயில்'
    };
  }
  if (code === 1) {
    return {
      condition: 'sunny',
      en: 'Mainly Clear',
      ta: 'பெரும்பாலும் தெளிவு',
      descEn: 'Mostly clear with plenty of sunshine',
      descTa: 'பெரும்பாலும் தெளிவான மிதமான வெயில்'
    };
  }
  if (code === 2) {
    return {
      condition: 'partlyCloudy',
      en: 'Partly Cloudy',
      ta: 'பகுதி மேகமூட்டம்',
      descEn: 'Scattered clouds with mild breeze',
      descTa: 'மிதமான காற்றுடன் கூடிய பகுதி மேகமூட்டம்'
    };
  }
  if (code === 3) {
    return {
      condition: 'cloudy',
      en: 'Overcast',
      ta: 'முழு மேகமூட்டம்',
      descEn: 'Thick cloud cover, low direct sunlight',
      descTa: 'அடர்ந்த மேகமூட்டம், குறைவான நேரடி வெயில்'
    };
  }
  if (code === 45 || code === 48) {
    return {
      condition: 'foggy',
      en: 'Foggy / Mist',
      ta: 'பனிமூட்டம்',
      descEn: 'Dense fog or morning mist, monitor fungal humidity',
      descTa: 'அடர்ந்த மூடுபனி, பூஞ்சை ஈரப்பதத்தைக் கண்காணிக்கவும்'
    };
  }
  if (code >= 51 && code <= 55) {
    return {
      condition: 'rainy',
      en: 'Light Drizzle',
      ta: 'தூறல் மழை',
      descEn: 'Passing drizzle, favorable soil moisture',
      descTa: 'மிதமான தூறல், சாதகமான மண் ஈரப்பதம்'
    };
  }
  if (code >= 61 && code <= 65) {
    return {
      condition: 'rainy',
      en: 'Rain Showers',
      ta: 'மழைப்பொழிவு',
      descEn: 'Moderate to steady rain, postpone chemical spray',
      descTa: 'தொடர் மழை, மருந்து தெளிப்பதை ஒத்திவைக்கவும்'
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      condition: 'rainy',
      en: 'Heavy Showers',
      ta: 'கனமழை',
      descEn: 'Heavy rain showers, check field water drainage',
      descTa: 'கனமழை வாய்ப்பு, வயல் வடிகால் வசதியை சரிபார்க்கவும்'
    };
  }
  if (code >= 95) {
    return {
      condition: 'stormy',
      en: 'Thunderstorm',
      ta: 'இடியுடன் கூடிய மழை',
      descEn: 'Thunderstorm activity, secure farm equipment',
      descTa: 'இடி மின்னல் எச்சரிக்கை, கள உபகரணங்களை பாதுகாக்கவும்'
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      condition: 'snowy',
      en: 'Snow / Hail',
      ta: 'பனி / ஆலங்கட்டி மழை',
      descEn: 'Cold frost conditions',
      descTa: 'அதிக பனிப்பொழிவு'
    };
  }

  return {
    condition: 'sunny',
    en: 'Clear',
    ta: 'இயல்பு நிலை',
    descEn: 'Favorable agricultural conditions',
    descTa: 'விவசாயத்திற்கு உகந்த சூழ்நிலை'
  };
}

/**
 * Map OpenWeather Weather ID to Friendly Bilingual Labels
 */
function mapOpenWeatherCondition(id: number, rawDesc?: string): {
  condition: DetailedWeatherData['condition'];
  en: string;
  ta: string;
  descriptionTa: string;
} {
  if (id >= 200 && id < 300) {
    return {
      condition: 'stormy',
      en: 'Thunderstorm',
      ta: 'இடியுடன் கூடிய மழை',
      descriptionTa: 'இடி மின்னலுடன் கூடிய மழைப்பொழிவு'
    };
  }
  if (id >= 300 && id < 600) {
    return {
      condition: 'rainy',
      en: rawDesc || 'Rain',
      ta: 'மழை',
      descriptionTa: 'மழைப்பொழிவு, ஈரப்பதம் அதிகம்'
    };
  }
  if (id >= 600 && id < 700) {
    return {
      condition: 'snowy',
      en: 'Snow / Frost',
      ta: 'பனிப்பொழிவு',
      descriptionTa: 'அதிக குளிர் & பனி'
    };
  }
  if (id >= 700 && id < 800) {
    return {
      condition: 'foggy',
      en: 'Mist / Fog',
      ta: 'மூடுபனி',
      descriptionTa: 'குறைந்த பார்வை திறன் மற்றும் பனி'
    };
  }
  if (id === 800) {
    return {
      condition: 'sunny',
      en: 'Clear Sky',
      ta: 'தெளிவான வானம்',
      descriptionTa: 'பயிர் வளர்ச்சிக்கு உகந்த சூரிய ஒளி'
    };
  }
  if (id > 800 && id <= 802) {
    return {
      condition: 'partlyCloudy',
      en: 'Partly Cloudy',
      ta: 'பகுதி மேகமூட்டம்',
      descriptionTa: 'மிதமான வெயில் மற்றும் மேகங்கள்'
    };
  }
  return {
    condition: 'cloudy',
    en: 'Cloudy',
    ta: 'மேகமூட்டம்',
    descriptionTa: 'முழு மேகமூட்டம்'
  };
}
