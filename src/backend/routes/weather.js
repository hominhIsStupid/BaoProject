const express = require('express');
const router = express.Router();

// GET /api/weather?city=Hanoi
// Proxy to weatherapi.com — keeps API key off client
router.get('/', async (req, res) => {
   const city = req.query.city || 'Hanoi';
   const key = process.env.WEATHER_KEY;

   if (!key) {
      return res.status(503).json({ message: 'Weather API key not configured' });
   }

   try {
      const url = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(city)}&aqi=no`;
      const response = await fetch(url);

      if (!response.ok) {
         const err = await response.json();
         return res.status(response.status).json({ message: err.error?.message || 'Weather API error' });
      }

      const data = await response.json();

      res.json({
         city: data.location.name,
         country: data.location.country,
         tempC: Math.round(data.current.temp_c),
         condition: data.current.condition.text,
         conditionCode: data.current.condition.code,
         isDay: data.current.is_day,
         humidity: data.current.humidity,
         windKph: data.current.wind_kph,
      });
   } catch (err) {
      console.error('Weather fetch error:', err);
      res.status(500).json({ message: 'Failed to fetch weather' });
   }
});

module.exports = router;
