import { NextResponse } from 'next/server';

export interface WeatherDataPoint {
  time: string;
  timestamp: number;
  tempF: number;
  humidity: number;
  windSpeedMph: number;
  windGustMph: number;
  pressureInHg: number;
  rainDailyIn: number;
  solarRadiation: number;
}

export interface WeatherResponse {
  deviceInfo: {
    name: string;
    location?: string;
    macAddress: string;
    model: string;
  };
  current: {
    timestamp: string;
    tempF: number;
    feelsLikeF: number;
    dewPointF: number;
    humidity: number;
    windSpeedMph: number;
    windGustMph: number;
    windDirectionDeg: number;
    maxDailyGustMph: number;
    rainHourlyIn: number;
    rainDailyIn: number;
    rainEventIn: number;
    rainWeeklyIn: number;
    rainMonthlyIn: number;
    rainYearlyIn: number;
    uvIndex: number;
    solarRadiation: number;
    pressureRelInHg: number;
    pressureAbsInHg: number;
    pressureTrend: 'rising' | 'falling' | 'steady';
    tempIndoorF: number;
    humidityIndoor: number;
    batteryOutdoorOk: boolean;
    batteryIndoorOk: boolean;
  };
  history: WeatherDataPoint[];
  isMockData: boolean;
  message?: string;
}

// In-memory cache for API responses (60s TTL to prevent hitting 1 req/sec rate limit)
let cachedData: { timestamp: number; data: WeatherResponse } | null = null;
const CACHE_TTL_MS = 60 * 1000;

// Cached station metadata so we don't need to call /devices on every cycle
let cachedStationMeta: { name: string; location: string; mac: string } | null = null;

function generateMockData(): WeatherResponse {
  const now = new Date();
  const history: WeatherDataPoint[] = [];

  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = t.getHours();
    const baseTemp = 64 + Math.sin(((hour - 8) / 24) * 2 * Math.PI) * 12;
    const tempF = parseFloat((baseTemp + (Math.random() * 2 - 1)).toFixed(1));
    const humidity = Math.min(95, Math.max(30, Math.round(75 - Math.sin(((hour - 8) / 24) * 2 * Math.PI) * 25)));
    const windSpeedMph = parseFloat((6 + Math.random() * 5).toFixed(1));
    const windGustMph = parseFloat((windSpeedMph + 3 + Math.random() * 6).toFixed(1));
    const pressureInHg = parseFloat((29.92 + Math.sin(i / 10) * 0.12 + (Math.random() * 0.04 - 0.02)).toFixed(2));
    const solarRadiation = hour >= 6 && hour <= 19 
      ? Math.round(Math.sin(((hour - 6) / 13) * Math.PI) * 750 + Math.random() * 50)
      : 0;

    history.push({
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: t.getTime(),
      tempF,
      humidity,
      windSpeedMph,
      windGustMph,
      pressureInHg,
      rainDailyIn: 0.14,
      solarRadiation,
    });
  }

  const latest = history[history.length - 1];
  const previousPressure = history[history.length - 4]?.pressureInHg || latest.pressureInHg;
  const pressureDiff = latest.pressureInHg - previousPressure;
  const pressureTrend = pressureDiff > 0.02 ? 'rising' : pressureDiff < -0.02 ? 'falling' : 'steady';

  return {
    deviceInfo: {
      name: 'Home Weather Station (WS-5000)',
      location: 'Local Station',
      macAddress: '8C:4F:00:XX:XX:XX',
      model: 'Ambient Weather WS-5000 Ultrasonic',
    },
    current: {
      timestamp: now.toISOString(),
      tempF: latest.tempF,
      feelsLikeF: parseFloat((latest.tempF + 1.2).toFixed(1)),
      dewPointF: 52.8,
      humidity: latest.humidity,
      windSpeedMph: latest.windSpeedMph,
      windGustMph: latest.windGustMph,
      windDirectionDeg: 235,
      maxDailyGustMph: 21.4,
      rainHourlyIn: 0.0,
      rainDailyIn: 0.14,
      rainEventIn: 0.14,
      rainWeeklyIn: 0.58,
      rainMonthlyIn: 1.22,
      rainYearlyIn: 14.85,
      uvIndex: 4,
      solarRadiation: latest.solarRadiation,
      pressureRelInHg: latest.pressureInHg,
      pressureAbsInHg: parseFloat((latest.pressureInHg - 0.08).toFixed(2)),
      pressureTrend,
      tempIndoorF: 71.4,
      humidityIndoor: 44,
      batteryOutdoorOk: true,
      batteryIndoorOk: true,
    },
    history,
    isMockData: true,
    message: 'Displaying demo data. Add AMBIENT_API_KEY and AMBIENT_APPLICATION_KEY to .env.local to stream live data.',
  };
}

export async function GET() {
  const apiKey = process.env.AMBIENT_API_KEY?.trim();
  const applicationKey = process.env.AMBIENT_APPLICATION_KEY?.trim();
  const configuredMac = process.env.AMBIENT_MAC_ADDRESS?.trim();

  // If credentials are not provided, return mock data
  if (!apiKey || !applicationKey) {
    return NextResponse.json(generateMockData());
  }

  // Return cached live data if still valid
  const now = Date.now();
  if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedData.data);
  }

  try {
    let mac = configuredMac || cachedStationMeta?.mac;
    let stationName = cachedStationMeta?.name || 'WS-5000 Weather Station';
    let stationLocation = cachedStationMeta?.location || 'Local Station';

    // If MAC is not known, fetch /devices once to discover MAC and station info
    if (!mac) {
      const devicesUrl = `https://rt.ambientweather.net/v1/devices?apiKey=${encodeURIComponent(apiKey)}&applicationKey=${encodeURIComponent(applicationKey)}`;
      const devicesRes = await fetch(devicesUrl, { headers: { Accept: 'application/json' } });
      
      if (devicesRes.ok) {
        const devices = await devicesRes.json();
        if (Array.isArray(devices) && devices.length > 0) {
          mac = devices[0].macAddress;
          stationName = devices[0].info?.name || 'WS-5000 Weather Station';
          stationLocation = devices[0].info?.location || 'Local Station';
          cachedStationMeta = { name: stationName, location: stationLocation, mac };
        }
      }
    }

    if (!mac) {
      return NextResponse.json(cachedData ? cachedData.data : generateMockData());
    }

    // Single unified API call: fetch device history + current data in 1 request
    const historyUrl = `https://rt.ambientweather.net/v1/devices/${encodeURIComponent(mac)}?apiKey=${encodeURIComponent(apiKey)}&applicationKey=${encodeURIComponent(applicationKey)}&limit=288`;
    const res = await fetch(historyUrl, { headers: { Accept: 'application/json' } });

    if (!res.ok) {
      console.warn('Ambient API request status:', res.status);
      if (cachedData) {
        return NextResponse.json(cachedData.data);
      }
      return NextResponse.json(generateMockData());
    }

    const records: Array<Record<string, unknown>> = await res.json();
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(cachedData ? cachedData.data : generateMockData());
    }

    // records[0] is the latest observation
    const latest = records[0];

    // Build historical array (chronological order)
    const chronological = [...records].reverse();
    const stride = Math.max(1, Math.floor(chronological.length / 36));
    const history: WeatherDataPoint[] = chronological
      .filter((_, idx) => idx % stride === 0 || idx === chronological.length - 1)
      .map((item) => {
        const d = new Date(item.date as string || Number(item.dateutc));
        return {
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: d.getTime(),
          tempF: Number(item.tempf ?? item.tempF ?? 0),
          humidity: Number(item.humidity ?? 0),
          windSpeedMph: Number(item.windspeedmph ?? 0),
          windGustMph: Number(item.windgustmph ?? 0),
          pressureInHg: Number(item.baromrelin ?? item.baromabsin ?? 29.92),
          rainDailyIn: Number(item.dailyrainin ?? 0),
          solarRadiation: Number(item.solarradiation ?? 0),
        };
      });

    // Calculate pressure trend
    let pressureTrend: 'rising' | 'falling' | 'steady' = 'steady';
    if (history.length >= 3) {
      const curP = history[history.length - 1].pressureInHg;
      const prevP = history[Math.max(0, history.length - 4)].pressureInHg;
      const diff = curP - prevP;
      if (diff > 0.02) pressureTrend = 'rising';
      else if (diff < -0.02) pressureTrend = 'falling';
    }

    const payload: WeatherResponse = {
      deviceInfo: {
        name: stationName,
        location: stationLocation,
        macAddress: mac,
        model: 'Ambient Weather WS-5000',
      },
      current: {
        timestamp: (latest.date as string) || new Date(Number(latest.dateutc) || Date.now()).toISOString(),
        tempF: Number(latest.tempf ?? 0),
        feelsLikeF: Number(latest.feelsLike ?? latest.feelslike ?? latest.tempf ?? 0),
        dewPointF: Number(latest.dewPoint ?? latest.dewpoint ?? 0),
        humidity: Number(latest.humidity ?? 0),
        windSpeedMph: Number(latest.windspeedmph ?? 0),
        windGustMph: Number(latest.windgustmph ?? 0),
        windDirectionDeg: Number(latest.winddir ?? 0),
        maxDailyGustMph: Number(latest.maxdailygust ?? 0),
        rainHourlyIn: Number(latest.hourlyrainin ?? 0),
        rainDailyIn: Number(latest.dailyrainin ?? 0),
        rainEventIn: Number(latest.eventrainin ?? 0),
        rainWeeklyIn: Number(latest.weeklyrainin ?? 0),
        rainMonthlyIn: Number(latest.monthlyrainin ?? 0),
        rainYearlyIn: Number(latest.yearlyrainin ?? 0),
        uvIndex: Number(latest.uv ?? 0),
        solarRadiation: Number(latest.solarradiation ?? 0),
        pressureRelInHg: Number(latest.baromrelin ?? 29.92),
        pressureAbsInHg: Number(latest.baromabsin ?? 29.85),
        pressureTrend,
        tempIndoorF: Number(latest.tempinf ?? 0),
        humidityIndoor: Number(latest.humidityin ?? 0),
        batteryOutdoorOk: latest.battout === undefined || latest.battout === 1,
        batteryIndoorOk: latest.battin === undefined || latest.battin === 1,
      },
      history,
      isMockData: false,
    };

    cachedData = {
      timestamp: Date.now(),
      data: payload,
    };

    return NextResponse.json(payload);
  } catch (err: unknown) {
    console.error('Failed to proxy Ambient Weather request:', err);
    if (cachedData) {
      return NextResponse.json(cachedData.data);
    }
    return NextResponse.json({
      ...generateMockData(),
      message: `Error connecting to Ambient Weather API: ${err instanceof Error ? err.message : String(err)}. Showing mock preview.`,
    });
  }
}
