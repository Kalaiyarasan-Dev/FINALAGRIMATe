// Smart Weather Service for Agricultural Crop Risk Monitoring
// Uses Open-Meteo API (free, reliable, global coverage) and Netlify Weather Function proxy

export interface DistrictLocation {
  district: string;
  state: string;
  districtTa: string;
  stateTa: string;
  lat: number;
  lon: number;
}

export const POPULAR_DISTRICTS: DistrictLocation[] = [
  { district: 'Thanjavur', state: 'Tamil Nadu', districtTa: 'தஞ்சாவூர்', stateTa: 'தமிழ்நாடு', lat: 10.7870, lon: 79.1378 },
  { district: 'Tiruvarur', state: 'Tamil Nadu', districtTa: 'திருவாரூர்', stateTa: 'தமிழ்நாடு', lat: 10.7725, lon: 79.6365 },
  { district: 'Nagapattinam', state: 'Tamil Nadu', districtTa: 'நாகப்பட்டினம்', stateTa: 'தமிழ்நாடு', lat: 10.7672, lon: 79.8449 },
  { district: 'Coimbatore', state: 'Tamil Nadu', districtTa: 'கோயம்புத்தூர்', stateTa: 'தமிழ்நாடு', lat: 11.0168, lon: 76.9558 },
  { district: 'Madurai', state: 'Tamil Nadu', districtTa: 'மதுரை', stateTa: 'தமிழ்நாடு', lat: 9.9252, lon: 78.1198 },
  { district: 'Tiruchirappalli', state: 'Tamil Nadu', districtTa: 'திருச்சிராப்பள்ளி', stateTa: 'தமிழ்நாடு', lat: 10.7905, lon: 78.7047 },
  { district: 'Salem', state: 'Tamil Nadu', districtTa: 'சேலம்', stateTa: 'தமிழ்நாடு', lat: 11.6643, lon: 78.1460 },
  { district: 'Erode', state: 'Tamil Nadu', districtTa: 'ஈரோடு', stateTa: 'தமிழ்நாடு', lat: 11.3410, lon: 77.7172 },
  { district: 'Tirunelveli', state: 'Tamil Nadu', districtTa: 'திருநெல்வேலி', stateTa: 'தமிழ்நாடு', lat: 8.7139, lon: 77.7567 },
  { district: 'Cuddalore', state: 'Tamil Nadu', districtTa: 'கடலூர்', stateTa: 'தமிழ்நாடு', lat: 11.7480, lon: 79.7714 },
  { district: 'Villupuram', state: 'Tamil Nadu', districtTa: 'விழுப்புரம்', stateTa: 'தமிழ்நாடு', lat: 11.9401, lon: 79.4861 },
  { district: 'Dindigul', state: 'Tamil Nadu', districtTa: 'திண்டுக்கல்', stateTa: 'தமிழ்நாடு', lat: 10.3673, lon: 77.9803 },
  { district: 'Tiruppur', state: 'Tamil Nadu', districtTa: 'திருப்பூர்', stateTa: 'தமிழ்நாடு', lat: 11.1085, lon: 77.3411 },
  { district: 'Kanchipuram', state: 'Tamil Nadu', districtTa: 'காஞ்சிபுரம்', stateTa: 'தமிழ்நாடு', lat: 12.8342, lon: 79.7036 },
  { district: 'Vellore', state: 'Tamil Nadu', districtTa: 'வேலூர்', stateTa: 'தமிழ்நாடு', lat: 12.9165, lon: 79.1325 },
  { district: 'Theni', state: 'Tamil Nadu', districtTa: 'தேனி', stateTa: 'தமிழ்நாடு', lat: 10.0104, lon: 77.4768 },
  { district: 'Pudukkottai', state: 'Tamil Nadu', districtTa: 'புதுக்கோட்டை', stateTa: 'தமிழ்நாடு', lat: 10.3797, lon: 78.8208 },
  { district: 'Ramanathapuram', state: 'Tamil Nadu', districtTa: 'ராமநாதபுரம்', stateTa: 'தமிழ்நாடு', lat: 9.3639, lon: 78.8395 },
  { district: 'Thoothukudi', state: 'Tamil Nadu', districtTa: 'தூத்துக்குடி', stateTa: 'தமிழ்நாடு', lat: 8.7642, lon: 78.1348 },
  { district: 'Dharmapuri', state: 'Tamil Nadu', districtTa: 'தர்மபுரி', stateTa: 'தமிழ்நாடு', lat: 12.1211, lon: 78.1582 },
  { district: 'Krishnagiri', state: 'Tamil Nadu', districtTa: 'கிருஷ்ணகிரி', stateTa: 'தமிழ்நாடு', lat: 12.5186, lon: 78.2137 },
  { district: 'Karur', state: 'Tamil Nadu', districtTa: 'கரூர்', stateTa: 'தமிழ்நாடு', lat: 10.9601, lon: 78.0766 },
  { district: 'Namakkal', state: 'Tamil Nadu', districtTa: 'நாமக்கல்', stateTa: 'தமிழ்நாடு', lat: 11.2189, lon: 78.1674 },
  { district: 'Virudhunagar', state: 'Tamil Nadu', districtTa: 'விருதுநகர்', stateTa: 'தமிழ்நாடு', lat: 9.5872, lon: 77.9514 },
  { district: 'Sivaganga', state: 'Tamil Nadu', districtTa: 'சிவகங்கை', stateTa: 'தமிழ்நாடு', lat: 9.8433, lon: 78.4809 },
  { district: 'Perambalur', state: 'Tamil Nadu', districtTa: 'பெரம்பலூர்', stateTa: 'தமிழ்நாடு', lat: 11.2342, lon: 78.8820 },
  { district: 'Ariyalur', state: 'Tamil Nadu', districtTa: 'அரியலூர்', stateTa: 'தமிழ்நாடு', lat: 11.1401, lon: 79.0786 },
  { district: 'Tiruvallur', state: 'Tamil Nadu', districtTa: 'திருவள்ளூர்', stateTa: 'தமிழ்நாடு', lat: 13.1432, lon: 79.9083 },
  { district: 'Tiruvannamalai', state: 'Tamil Nadu', districtTa: 'திருவண்ணாமலை', stateTa: 'தமிழ்நாடு', lat: 12.2253, lon: 79.0747 },
  { district: 'Mayiladuthurai', state: 'Tamil Nadu', districtTa: 'மயிலாடுதுறை', stateTa: 'தமிழ்நாடு', lat: 11.1018, lon: 79.6522 },
  { district: 'Kallakurichi', state: 'Tamil Nadu', districtTa: 'கள்ளக்குறிச்சி', stateTa: 'தமிழ்நாடு', lat: 11.7383, lon: 78.9639 },
  { district: 'Tenkasi', state: 'Tamil Nadu', districtTa: 'தென்காசி', stateTa: 'தமிழ்நாடு', lat: 8.9594, lon: 77.3152 },
  { district: 'Kanyakumari', state: 'Tamil Nadu', districtTa: 'கன்னியாகுமரி', stateTa: 'தமிழ்நாடு', lat: 8.0883, lon: 77.5385 },
  { district: 'Nilgiris', state: 'Tamil Nadu', districtTa: 'நீலகிரி', stateTa: 'தமிழ்நாடு', lat: 11.4102, lon: 76.6950 },
  { district: 'Chennai', state: 'Tamil Nadu', districtTa: 'சென்னை', stateTa: 'தமிழ்நாடு', lat: 13.0827, lon: 80.2707 },
  // Key Other States
  { district: 'Guntur', state: 'Andhra Pradesh', districtTa: 'குண்டூர்', stateTa: 'ஆந்திரப் பிரதேசம்', lat: 16.3067, lon: 80.4365 },
  { district: 'Dharwad', state: 'Karnataka', districtTa: 'தார்வாட்', stateTa: 'கர்நாடகா', lat: 15.4589, lon: 75.0078 },
  { district: 'Nashik', state: 'Maharashtra', districtTa: 'நாசிக்', stateTa: 'மகாராஷ்டிரா', lat: 19.9975, lon: 73.7898 },
  { district: 'Palakkad', state: 'Kerala', districtTa: 'பாலக்காடு', stateTa: 'கேரளா', lat: 10.7867, lon: 76.6548 },
];

export interface CropInfo {
  id: string;
  nameEn: string;
  nameTa: string;
  optimalTempMin: number;
  optimalTempMax: number;
  waterNeed: 'low' | 'moderate' | 'high' | 'very_high';
  floodSensitivity: 'low' | 'medium' | 'high' | 'critical';
  windSensitivity: 'low' | 'medium' | 'high' | 'critical';
  growthStages: string[];
}

export const MONITORED_CROPS: CropInfo[] = [
  {
    id: 'paddy',
    nameEn: 'Paddy / Rice',
    nameTa: 'நெல்',
    optimalTempMin: 20,
    optimalTempMax: 35,
    waterNeed: 'very_high',
    floodSensitivity: 'medium',
    windSensitivity: 'high',
    growthStages: ['Nursery / Seedling', 'Tillering', 'Panicle Initiation', 'Flowering / Heading', 'Maturity / Harvest']
  },
  {
    id: 'cotton',
    nameEn: 'Cotton',
    nameTa: 'பருத்தி',
    optimalTempMin: 21,
    optimalTempMax: 35,
    waterNeed: 'moderate',
    floodSensitivity: 'critical',
    windSensitivity: 'high',
    growthStages: ['Seedling', 'Vegetative', 'Square Formation', 'Boll Development', 'Boll Bursting']
  },
  {
    id: 'tomato',
    nameEn: 'Tomato',
    nameTa: 'தக்காளி',
    optimalTempMin: 18,
    optimalTempMax: 30,
    waterNeed: 'moderate',
    floodSensitivity: 'critical',
    windSensitivity: 'medium',
    growthStages: ['Nursery', 'Vegetative', 'Flowering', 'Fruit Setting', 'Harvesting']
  },
  {
    id: 'sugarcane',
    nameEn: 'Sugarcane',
    nameTa: 'கரும்பு',
    optimalTempMin: 20,
    optimalTempMax: 38,
    waterNeed: 'high',
    floodSensitivity: 'low',
    windSensitivity: 'high',
    growthStages: ['Germination', 'Formative / Tillering', 'Grand Growth', 'Maturity / Ripening']
  },
  {
    id: 'banana',
    nameEn: 'Banana',
    nameTa: 'வாழை',
    optimalTempMin: 20,
    optimalTempMax: 35,
    waterNeed: 'high',
    floodSensitivity: 'high',
    windSensitivity: 'critical',
    growthStages: ['Shooting / Vegetative', 'Bunch Emergence', 'Finger Development', 'Harvesting']
  },
  {
    id: 'groundnut',
    nameEn: 'Groundnut',
    nameTa: 'நிலக்கடலை',
    optimalTempMin: 22,
    optimalTempMax: 34,
    waterNeed: 'low',
    floodSensitivity: 'critical',
    windSensitivity: 'low',
    growthStages: ['Emergence', 'Vegetative', 'Flowering & Pegging', 'Pod Development', 'Maturity']
  },
  {
    id: 'maize',
    nameEn: 'Maize / Corn',
    nameTa: 'மக்காச்சோளம்',
    optimalTempMin: 18,
    optimalTempMax: 34,
    waterNeed: 'moderate',
    floodSensitivity: 'high',
    windSensitivity: 'high',
    growthStages: ['Seedling', 'Knee-high Vegetative', 'Tasseling / Silking', 'Grain Filling', 'Harvest']
  },
  {
    id: 'chilli',
    nameEn: 'Chilli',
    nameTa: 'மிளகாய்',
    optimalTempMin: 20,
    optimalTempMax: 32,
    waterNeed: 'moderate',
    floodSensitivity: 'critical',
    windSensitivity: 'medium',
    growthStages: ['Nursery', 'Vegetative', 'Flowering', 'Fruit Formation', 'Picking']
  },
  {
    id: 'pulses',
    nameEn: 'Blackgram / Greengram',
    nameTa: 'உளுந்து / பாசிப்பயறு',
    optimalTempMin: 22,
    optimalTempMax: 35,
    waterNeed: 'low',
    floodSensitivity: 'critical',
    windSensitivity: 'low',
    growthStages: ['Vegetative', 'Branching', 'Flowering', 'Pod Development', 'Maturity']
  },
  {
    id: 'turmeric',
    nameEn: 'Turmeric',
    nameTa: 'மஞ்சள்',
    optimalTempMin: 20,
    optimalTempMax: 35,
    waterNeed: 'moderate',
    floodSensitivity: 'high',
    windSensitivity: 'low',
    growthStages: ['Sprouting', 'Tillering', 'Rhizome Development', 'Maturity']
  }
];

export interface LiveWeatherData {
  locationName: string;
  stateName: string;
  lat: number;
  lon: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  conditionText: string;
  conditionTextTa: string;
  isLive: boolean;
  fetchedAt: string;
  dailyForecast: DailyForecastItem[];
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbMax: number;
  windSpeedMax: number;
  weatherCode: number;
  conditionText: string;
  conditionTextTa: string;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface WeatherCropAlert {
  id: string;
  category: 'heavy_rain' | 'flood_risk' | 'drought' | 'high_temp' | 'low_temp' | 'strong_wind';
  severity: AlertSeverity;
  titleEn: string;
  titleTa: string;
  weatherConditionEn: string;
  weatherConditionTa: string;
  cropImpactEn: string;
  cropImpactTa: string;
  recommendationsEn: string[];
  recommendationsTa: string[];
  forecastDate: string;
  metricValue: string;
}

const WMO_CODE_MAP: Record<number, { en: string; ta: string }> = {
  0: { en: 'Clear sky', ta: 'தெளிவான வானம்' },
  1: { en: 'Mainly clear', ta: 'பெரும்பாலும் தெளிவானது' },
  2: { en: 'Partly cloudy', ta: 'பகுதி மேகமூட்டம்' },
  3: { en: 'Overcast', ta: 'முழு மேகமூட்டம்' },
  45: { en: 'Foggy', ta: 'பனிமூட்டம்' },
  48: { en: 'Depositing rime fog', ta: 'உறைபனி மூட்டம்' },
  51: { en: 'Light drizzle', ta: 'லேசான தூறல்' },
  53: { en: 'Moderate drizzle', ta: 'மிதமான தூறல்' },
  55: { en: 'Dense drizzle', ta: 'அடர்ந்த தூறல்' },
  61: { en: 'Slight rain', ta: 'லேசான மழை' },
  63: { en: 'Moderate rain', ta: 'மிதமான மழை' },
  65: { en: 'Heavy rain', ta: 'கனமழை' },
  71: { en: 'Slight snow fall', ta: 'லேசான பனிப்பொழிவு' },
  80: { en: 'Slight rain showers', ta: 'லேசான மழைச்சாரல்' },
  81: { en: 'Moderate rain showers', ta: 'மிதமான மழைச்சாரல்' },
  82: { en: 'Violent rain showers', ta: 'மிக கனமழை சாரல்' },
  95: { en: 'Thunderstorm', ta: 'இடியுடன் கூடிய மழை' },
  96: { en: 'Thunderstorm with slight hail', ta: 'ஆலங்கட்டி இடிமழை' },
  99: { en: 'Thunderstorm with heavy hail', ta: 'கடும் ஆலங்கட்டி புயல்' },
};

export const getWeatherCondition = (code: number) => {
  return WMO_CODE_MAP[code] || { en: 'Moderate Weather', ta: 'மிதமான வானிலை' };
};

/**
 * Fetch real-time weather and 7-day forecast from Open-Meteo
 */
export async function fetchLiveWeather(lat: number, lon: number, locationName: string = 'Current Location', stateName: string = 'Tamil Nadu'): Promise<LiveWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  let response: Response;
  try {
    response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }
  } catch (directErr) {
    // Attempt fallback via Netlify serverless function
    const proxyUrl = `/.netlify/functions/weather?lat=${lat}&lon=${lon}`;
    response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error('Failed to retrieve live weather data');
    }
  }

  const data = await response.json();
  const current = data.current || {};
  const daily = data.daily || {};

  const weatherCode = current.weather_code ?? 0;
  const condition = getWeatherCondition(weatherCode);

  const forecastItems: DailyForecastItem[] = [];
  const dates = daily.time || [];
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const code = daily.weather_code?.[i] ?? 0;
    const cond = getWeatherCondition(code);

    forecastItems.push({
      date: dates[i],
      dayName,
      tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 30),
      tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 22),
      precipitationSum: Math.round((daily.precipitation_sum?.[i] ?? 0) * 10) / 10,
      precipitationProbMax: daily.precipitation_probability_max?.[i] ?? 0,
      windSpeedMax: Math.round(daily.wind_speed_10m_max?.[i] ?? 12),
      weatherCode: code,
      conditionText: cond.en,
      conditionTextTa: cond.ta,
    });
  }

  return {
    locationName,
    stateName,
    lat,
    lon,
    temperature: Math.round(current.temperature_2m ?? 30),
    apparentTemperature: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 30),
    humidity: Math.round(current.relative_humidity_2m ?? 65),
    precipitation: Math.round((current.precipitation ?? 0) * 10) / 10,
    windSpeed: Math.round(current.wind_speed_10m ?? 10),
    windDirection: Math.round(current.wind_direction_10m ?? 0),
    weatherCode,
    conditionText: condition.en,
    conditionTextTa: condition.ta,
    isLive: true,
    fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dailyForecast: forecastItems,
  };
}

/**
 * Analyze weather and compute crop-risk alerts
 */
export function evaluateCropWeatherAlerts(
  weather: LiveWeatherData,
  selectedCropId: string
): WeatherCropAlert[] {
  const alerts: WeatherCropAlert[] = [];
  const crop = MONITORED_CROPS.find(c => c.id === selectedCropId) || MONITORED_CROPS[0];
  const forecast = weather.dailyForecast || [];

  // 1. Heavy Rainfall & Inundation Evaluation
  const maxRainDay = forecast.reduce((prev, curr) => curr.precipitationSum > prev.precipitationSum ? curr : prev, forecast[0] || { precipitationSum: 0, date: 'Today' });
  const total3DayRain = forecast.slice(0, 3).reduce((sum, d) => sum + d.precipitationSum, 0);

  if (maxRainDay && maxRainDay.precipitationSum >= 65) {
    alerts.push({
      id: `alert-heavy-rain-critical-${maxRainDay.date}`,
      category: 'heavy_rain',
      severity: 'critical',
      titleEn: `Critical Heavy Rainfall Alert (${maxRainDay.precipitationSum} mm)`,
      titleTa: `அதிதீவிர கனமழை எச்சரிக்கை (${maxRainDay.precipitationSum} மி.மீ)`,
      weatherConditionEn: `Very heavy precipitation expected on ${maxRainDay.date} with continuous rain.`,
      weatherConditionTa: `${maxRainDay.date} அன்று அதிதீவிர கனமழை பெய்ய வாய்ப்புள்ளது.`,
      cropImpactEn: crop.id === 'paddy'
        ? 'Severe waterlogging may submerge seedlings or cause grain discoloration/sprouting if near harvest.'
        : `${crop.nameEn} roots will suffocate due to prolonged soil inundation; risk of damping off and root rot.`,
      cropImpactTa: crop.id === 'paddy'
        ? 'நெல் பயிரில் வயலில் அதிக நீர் தேங்குவதால் இளம் நாற்றுகள் அழுகும் அல்லது முதிர்ந்த கதிர்கள் முளைக்கும் அபாயம்.'
        : `${crop.nameTa} பயிரில் வேரழுகல், இலை உதிர்தல் மற்றும் மண்ணில் காற்று பற்றாக்குறை ஏற்படும்.`,
      recommendationsEn: [
        'Open all farm drainage outlets immediately to prevent water stagnancy.',
        'Postpone all scheduled pesticide spraying and basal/top-dress fertilizer application.',
        'Move harvested produce and bags to elevated, waterproof covered storage.',
        'Keep fuel pumps and drainage trenches operational.'
      ],
      recommendationsTa: [
        'வயலில் நீர் தேங்காமல் இருக்க உடனடியாக அனைத்து வடிகால்களையும் திறந்துவிடவும்.',
        'உரமிடுதல் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை உடனடியாக ஒத்திவைக்கவும்.',
        'அறுவடை செய்யப்பட்ட விளைபொருட்களை மேடான தார்பாலின் பாதுகாப்பு இடத்திற்கு மாற்றவும்.'
      ],
      forecastDate: maxRainDay.date,
      metricValue: `${maxRainDay.precipitationSum} mm rain`
    });
  } else if (maxRainDay && maxRainDay.precipitationSum >= 30) {
    alerts.push({
      id: `alert-heavy-rain-high-${maxRainDay.date}`,
      category: 'heavy_rain',
      severity: 'high',
      titleEn: `Heavy Rainfall Forecast (${maxRainDay.precipitationSum} mm)`,
      titleTa: `கனமழை முன்னறிவிப்பு (${maxRainDay.precipitationSum} மி.மீ)`,
      weatherConditionEn: `Significant rainfall forecasted on ${maxRainDay.date}.`,
      weatherConditionTa: `${maxRainDay.date} அன்று கனமழை பெய்ய வாய்ப்புள்ளது.`,
      cropImpactEn: `Excess moisture increases fungal spore multiplication in ${crop.nameEn} canopy.`,
      cropImpactTa: `${crop.nameTa} பயிரில் அதிக ஈரப்பதம் காரணமாக பூஞ்சை மற்றும் பாக்டீரியா நோய்கள் வேகமாக பரவும்.`,
      recommendationsEn: [
        'Clear field bund drainage channels before rainfall begins.',
        'Avoid irrigation for the next 48 to 72 hours.',
        'Check field bunds for breach risks.'
      ],
      recommendationsTa: [
        'மழை தொடங்கும் முன் வயல் வரப்பு வடிகால்களை சுத்தம் செய்யவும்.',
        'அடுத்த 48 முதல் 72 மணி நேரத்திற்கு பாசனத்தை நிறுத்தவும்.'
      ],
      forecastDate: maxRainDay.date,
      metricValue: `${maxRainDay.precipitationSum} mm rain`
    });
  }

  // 2. Flood Risk Evaluation
  if (total3DayRain >= 90) {
    alerts.push({
      id: 'alert-flood-risk',
      category: 'flood_risk',
      severity: 'critical',
      titleEn: `High Flood & Waterlogging Risk (${Math.round(total3DayRain)} mm in 72h)`,
      titleTa: `வெள்ளப்பெருக்கு மற்றும் நீர் தேக்க அபாயம் (${Math.round(total3DayRain)} மி.மீ)`,
      weatherConditionEn: `Cumulative 3-day rainfall exceeds 90 mm, saturating soil drainage limits.`,
      weatherConditionTa: `அடுத்த 3 நாட்களில் 90 மி.மீ மேல் மழை பெய்து நிலத்தடி நீர்மட்டம் பெருமளவு உயரும்.`,
      cropImpactEn: `${crop.nameEn} root aeration will be cut off; risk of collar rot and total crop lodging.`,
      cropImpactTa: `${crop.nameTa} பயிரில் வேர் சுவாசம் தடைபட்டு பயிர்கள் சாய்ந்து அழுகும் பெரும் அபாயம்.`,
      recommendationsEn: [
        'Coordinate with village irrigation panchayat/PWD for community canal desilting.',
        'Keep documentation and geo-tagged photos ready for insurance intimation if inundation occurs.',
        'Ensure diesel pumps are ready for emergency field dewatering.'
      ],
      recommendationsTa: [
        'கிராம வாய்க்கால்களில் அடைப்புகளை நீக்க உடனடியாக நடவடிக்கை எடுக்கவும்.',
        'வெள்ள சேதம் ஏற்பட்டால் காப்பீட்டு அறிவிப்பிற்கு வயல் புகைப்படங்களை எடுத்து வைக்கவும்.'
      ],
      forecastDate: 'Next 72 Hours',
      metricValue: `${Math.round(total3DayRain)} mm total`
    });
  }

  // 3. High Temperature / Heat Stress Evaluation
  const maxTempDay = forecast.reduce((prev, curr) => curr.tempMax > prev.tempMax ? curr : prev, forecast[0] || { tempMax: 30, date: 'Today' });
  if (maxTempDay && maxTempDay.tempMax >= 39) {
    alerts.push({
      id: `alert-heat-high-${maxTempDay.date}`,
      category: 'high_temp',
      severity: 'high',
      titleEn: `Extreme Heatwave Alert (${maxTempDay.tempMax}°C)`,
      titleTa: `கடும் வெப்ப அலை எச்சரிக்கை (${maxTempDay.tempMax}°C)`,
      weatherConditionEn: `Maximum daytime temperature reaching ${maxTempDay.tempMax}°C.`,
      weatherConditionTa: `பகல் நேர அதிகபட்ச வெப்பநிலை ${maxTempDay.tempMax}°C வரை உயரும்.`,
      cropImpactEn: crop.id === 'tomato' || crop.id === 'chilli'
        ? 'High temperatures cause flower drop, poor pollen viability, and blossom end rot.'
        : `Causes severe evapotranspiration stress, leaf scorching, and grain desiccation in ${crop.nameEn}.`,
      cropImpactTa: crop.id === 'tomato' || crop.id === 'chilli'
        ? 'அதிக வெப்பம் காரணமாக பூக்கள் உதிர்தல் மற்றும் மகரந்தச் சேர்க்கை பாதிப்பு ஏற்படும்.'
        : `${crop.nameTa} பயிரில் நீர்ச்சத்து விரைவாக குறைந்து இலைகள் கருகும் அபாயம்.`,
      recommendationsEn: [
        'Provide light, frequent evening or early morning irrigations.',
        'Apply organic straw/coir pith mulching to conserve root zone moisture.',
        'Foliar spray of 1% potassium nitrate (KNO3) or Kaolin to reduce heat stress.'
      ],
      recommendationsTa: [
        'காலை அல்லது மாலை வேளையில் லேசான நீர் பாசனம் செய்யவும்.',
        'ஈரப்பதத்தை பாதுகாக்க வைக்கோல் அல்லது தென்னை நார் கழிவு மூடாக்கு அமைக்கவும்.'
      ],
      forecastDate: maxTempDay.date,
      metricValue: `${maxTempDay.tempMax}°C`
    });
  } else if (maxTempDay && maxTempDay.tempMax >= 36) {
    alerts.push({
      id: `alert-heat-medium-${maxTempDay.date}`,
      category: 'high_temp',
      severity: 'medium',
      titleEn: `Elevated Temperature Advisory (${maxTempDay.tempMax}°C)`,
      titleTa: `அதிக வெப்பநிலை ஆலோசனை (${maxTempDay.tempMax}°C)`,
      weatherConditionEn: `Daytime temperature reaching ${maxTempDay.tempMax}°C with moderate humidity.`,
      weatherConditionTa: `பகல் வெப்பநிலை ${maxTempDay.tempMax}°C வரை உயரும்.`,
      cropImpactEn: `Higher evaporation rates increase water demand for ${crop.nameEn}.`,
      cropImpactTa: `${crop.nameTa} பயிரில் நீர்த் தேவை அதிகரிக்கும்.`,
      recommendationsEn: [
        'Maintain optimum soil moisture; avoid midday water stress.',
        'Schedule all field spraying operations early before 9:00 AM.'
      ],
      recommendationsTa: [
        'பகல் நேர நீர் பற்றாக்குறையை தவிர்க்க சரியான பாசனம் உறுதி செய்யவும்.',
        'மருந்து தெளிப்பதை காலை 9 மணிக்கு முன் முடிக்கவும்.'
      ],
      forecastDate: maxTempDay.date,
      metricValue: `${maxTempDay.tempMax}°C`
    });
  }

  // 4. Low Temperature / Chill Stress Evaluation
  const minTempDay = forecast.reduce((prev, curr) => curr.tempMin < prev.tempMin ? curr : prev, forecast[0] || { tempMin: 22, date: 'Today' });
  if (minTempDay && minTempDay.tempMin <= 14) {
    alerts.push({
      id: `alert-low-temp-${minTempDay.date}`,
      category: 'low_temp',
      severity: minTempDay.tempMin <= 10 ? 'high' : 'medium',
      titleEn: `Low Temperature / Chill Advisory (${minTempDay.tempMin}°C)`,
      titleTa: `குறைந்த வெப்பநிலை / குளிர் எச்சரிக்கை (${minTempDay.tempMin}°C)`,
      weatherConditionEn: `Night-time temperature dropping to ${minTempDay.tempMin}°C.`,
      weatherConditionTa: `இரவு நேர வெப்பநிலை ${minTempDay.tempMin}°C வரை குறையும்.`,
      cropImpactEn: `Slows root nutrient uptake and causes stunting or delayed flowering in ${crop.nameEn}.`,
      cropImpactTa: `${crop.nameTa} பயிரில் ஊட்டச்சத்து உறிஞ்சுதல் குறைந்து வளர்ச்சி மந்தமாகும்.`,
      recommendationsEn: [
        'Provide evening light irrigation to warm soil surface through latent heat.',
        'Create mild smoke screens around field borders at night if frost is anticipated.'
      ],
      recommendationsTa: [
        'மண்ணின் வெப்பநிலையை தக்கவைக்க மாலை வேளையில் லேசான பாசனம் செய்யவும்.'
      ],
      forecastDate: minTempDay.date,
      metricValue: `${minTempDay.tempMin}°C`
    });
  }

  // 5. Strong Winds / Lodging Risk Evaluation
  const maxWindDay = forecast.reduce((prev, curr) => curr.windSpeedMax > prev.windSpeedMax ? curr : prev, forecast[0] || { windSpeedMax: 10, date: 'Today' });
  if (maxWindDay && maxWindDay.windSpeedMax >= 35) {
    alerts.push({
      id: `alert-wind-${maxWindDay.date}`,
      category: 'strong_wind',
      severity: maxWindDay.windSpeedMax >= 50 ? 'critical' : 'high',
      titleEn: `High Wind Speed Warning (${maxWindDay.windSpeedMax} km/h)`,
      titleTa: `பலத்த காற்று எச்சரிக்கை (${maxWindDay.windSpeedMax} கி.மீ/மணி)`,
      weatherConditionEn: `Wind gusts up to ${maxWindDay.windSpeedMax} km/h expected on ${maxWindDay.date}.`,
      weatherConditionTa: `${maxWindDay.date} அன்று மணிக்கு ${maxWindDay.windSpeedMax} கி.மீ வேகத்தில் பலத்த காற்று வீசக்கூடும்.`,
      cropImpactEn: crop.id === 'banana'
        ? 'Critical danger of banana pseudostem snapping and bunch damage.'
        : crop.id === 'sugarcane' || crop.id === 'paddy' || crop.id === 'maize'
        ? 'Severe risk of crop lodging (falling over), leading to heavy yield loss.'
        : 'Mechanical damage to flowering shoots and rapid moisture drying.',
      cropImpactTa: crop.id === 'banana'
        ? 'வாழை மரங்கள் முறிந்து விழும் அபாயம் மிக அதிகம்; தார் சேதம் ஏற்படும்.'
        : `${crop.nameTa} பயிர்கள் சாய்ந்து விழும் (Lodging) அபாயம் உள்ளது.`,
      recommendationsEn: [
        crop.id === 'banana' ? 'Immediately provide bamboo or casuarina propping to all fruiting banana plants.' : 'Stake tall crops and secure border windbreaks.',
        'Avoid irrigation immediately prior to high wind events as wet soil increases lodging susceptibility.',
        'Postpone foliar sprays to prevent chemical drift.'
      ],
      recommendationsTa: [
        crop.id === 'banana' ? 'வாழை மரங்களுக்கு உடனடியாக முட்டுக்கொடுத்து பாதுகாக்கவும்.' : 'உயரமான பயிர்களுக்கு முட்டு கொடுக்கவும்.',
        'காற்று வீசும் சமயத்தில் நீர் பாசனம் செய்வதை தவிர்க்கவும்.'
      ],
      forecastDate: maxWindDay.date,
      metricValue: `${maxWindDay.windSpeedMax} km/h`
    });
  }

  // 6. Drought / Moisture Stress Evaluation
  const total7DayRain = forecast.reduce((sum, d) => sum + d.precipitationSum, 0);
  if (total7DayRain < 2 && weather.temperature >= 34) {
    alerts.push({
      id: 'alert-drought-stress',
      category: 'drought',
      severity: 'medium',
      titleEn: 'Dry Spell & Soil Moisture Deficit',
      titleTa: 'வறண்ட வானிலை மற்றும் மண் ஈரப்பத பற்றாக்குறை',
      weatherConditionEn: 'Negligible rainfall predicted across the 7-day forecast horizon.',
      weatherConditionTa: 'அடுத்த 7 நாட்களுக்கு மழை இல்லாத வறண்ட வானிலை நீடிக்கும்.',
      cropImpactEn: `Accelerated depletion of available root-zone moisture in ${crop.nameEn}.`,
      cropImpactTa: `${crop.nameTa} பயிரில் வேர் மண்டல ஈரப்பதம் வேகமாக வற்றி வாடல் ஏற்படும்.`,
      recommendationsEn: [
        'Shift to alternate furrow irrigation or drip systems to conserve water.',
        'Spray anti-transpirants or 2% DAP/Urea solution in evening to sustain crop vigour.',
        'Weed fields promptly to avoid moisture competition.'
      ],
      recommendationsTa: [
        'சொட்டு நீர் பாசனம் அல்லது மாற்று சால் பாசன முறையை பின்பற்றவும்.',
        'களைகளை உடனடியாக அகற்றி நீர் விரயத்தை தடுக்கவும்.'
      ],
      forecastDate: '7-Day Window',
      metricValue: `${total7DayRain.toFixed(1)} mm / 7 days`
    });
  }

  return alerts;
}
