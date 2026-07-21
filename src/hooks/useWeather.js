import { useState, useEffect } from 'react';

const CACHE_KEY = 'weather_cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 10 minutes

function getCache() {
   try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL_MS) return data;
      sessionStorage.removeItem(CACHE_KEY);
   } catch {
      // ignore bad cache
   }
   return null;
}

function setCache(data) {
   try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
   } catch {
      // ignore storage errors
   }
}

// Map weatherapi.com condition codes to a simple icon + label
function getConditionDisplay(code, isDay) {
   // Sunny / Clear
   if (code === 1000) return { icon: isDay ? '☀️' : '🌙', label: isDay ? 'Nắng' : 'Trời quang' };
   // Partly cloudy
   if (code === 1003) return { icon: '⛅', label: 'Có mây' };
   // Cloudy / overcast
   if ([1006, 1009].includes(code)) return { icon: '☁️', label: 'Nhiều mây' };
   // Mist / fog
   if ([1030, 1135, 1147].includes(code)) return { icon: '🌫️', label: 'Sương mù' };
   // Rain (light/moderate/heavy)
   if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code))
      return { icon: '🌧️', label: 'Có mưa' };
   // Drizzle
   if ([1072, 1087].includes(code)) return { icon: '🌦️', label: 'Mưa nhẹ' };
   // Thunder
   if ([1273, 1276, 1279, 1282].includes(code)) return { icon: '⛈️', label: 'Giông bão' };
   // Snow / sleet
   if (
      [1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(
         code
      )
   )
      return { icon: '❄️', label: 'Tuyết' };
   // fallback
   return { icon: '🌡️', label: 'Không rõ' };
}

export function useWeather(city = 'Hanoi') {
   const [weather, setWeather] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      let cancelled = false;

      async function fetchWeather() {
         // try cache first
         const cached = getCache();
         if (cached) {
            setWeather(cached);
            setLoading(false);
            return;
         }

         setLoading(true);
         setError(null);
         try {
            const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            if (!res.ok) {
               const err = await res.json();
               throw new Error(err.message || 'Weather unavailable');
            }
            const data = await res.json();
            const display = getConditionDisplay(data.conditionCode, data.isDay);
            const result = { ...data, ...display };
            if (!cancelled) {
               setWeather(result);
               setCache(result);
            }
         } catch (e) {
            if (!cancelled) setError(e.message);
         } finally {
            if (!cancelled) setLoading(false);
         }
      }

      fetchWeather();
      return () => {
         cancelled = true;
      };
   }, [city]);

   return { weather, loading, error };
}
