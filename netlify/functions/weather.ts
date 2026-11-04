/**
 * Netlify Serverless Function for Weather & Geocoding Proxy
 * Path: /.netlify/functions/weather
 * 
 * Supports Open-Meteo for real-time and 7-day crop risk monitoring,
 * and OpenWeather if API key is configured.
 */

const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  thanjavur: { lat: 10.7870, lon: 79.1378 },
  tiruvarur: { lat: 10.7725, lon: 79.6365 },
  nagapattinam: { lat: 10.7672, lon: 79.8449 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  madurai: { lat: 9.9252, lon: 78.1198 },
  trichy: { lat: 10.7905, lon: 78.7047 },
  tiruchirappalli: { lat: 10.7905, lon: 78.7047 },
  salem: { lat: 11.6643, lon: 78.1460 },
  erode: { lat: 11.3410, lon: 77.7172 },
  tirunelveli: { lat: 8.7139, lon: 77.7567 },
  cuddalore: { lat: 11.7480, lon: 79.7714 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  villupuram: { lat: 11.9401, lon: 79.4861 },
  dindigul: { lat: 10.3673, lon: 77.9803 },
  tiruppur: { lat: 11.1085, lon: 77.3411 },
  kanchipuram: { lat: 12.8342, lon: 79.7036 },
  vellore: { lat: 12.9165, lon: 79.1325 }
};

export const handler = async (event: { queryStringParameters?: Record<string, string> }) => {
  const params = event.queryStringParameters || {};
  let lat = params.lat;
  let lon = params.lon;
  const district = (params.district || '').toLowerCase().trim();

  if ((!lat || !lon) && district && DISTRICT_COORDS[district]) {
    lat = DISTRICT_COORDS[district].lat.toString();
    lon = DISTRICT_COORDS[district].lon.toString();
  }

  // Default to Thanjavur (Tamil Nadu Delta) if no coordinates provided
  if (!lat || !lon) {
    lat = '10.7870';
    lon = '79.1378';
  }

  const weatherApiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;

  try {
    if (weatherApiKey && params.provider === 'openweather') {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
      );
      const data = await res.json();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
      };
    }

    // High-accuracy Open-Meteo with comprehensive 7-day crop-relevant forecast metrics
    const omRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=auto`
    );
    const omData = await omRes.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(omData)
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: message })
    };
  }
};

export default async (req: Request) => {
  const url = new URL(req.url);
  const lat = url.searchParams.get('lat') || undefined;
  const lon = url.searchParams.get('lon') || undefined;
  const district = url.searchParams.get('district') || undefined;
  const provider = url.searchParams.get('provider') || undefined;

  const result = await handler({
    queryStringParameters: {
      ...(lat ? { lat } : {}),
      ...(lon ? { lon } : {}),
      ...(district ? { district } : {}),
      ...(provider ? { provider } : {}),
    }
  });

  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers,
  });
};
