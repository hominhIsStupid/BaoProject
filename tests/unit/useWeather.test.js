/** @jest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { useWeather } from '../../src/client/hooks/useWeather';

describe('useWeather hook', () => {
   beforeEach(() => {
      // Clear sessionStorage before each test
      sessionStorage.clear();
      // Reset fetch mock
      global.fetch = jest.fn();
   });

   afterEach(() => {
      jest.restoreAllMocks();
   });

   test('should return loading state initially', async () => {
      // Mock fetch to just wait so we can check loading state
      global.fetch.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useWeather('Hanoi'));

      expect(result.current.loading).toBe(true);
      expect(result.current.weather).toBeNull();
      expect(result.current.error).toBeNull();
   });

   test('should fetch weather data and cache it', async () => {
      const mockWeatherData = {
         conditionCode: 1000,
         isDay: 1,
         temp_c: 25,
      };

      global.fetch.mockResolvedValueOnce({
         ok: true,
         json: async () => mockWeatherData,
      });

      const { result } = renderHook(() => useWeather('Hanoi'));

      await waitFor(() => {
         expect(result.current.loading).toBe(false);
      });

      expect(result.current.weather).toEqual({
         ...mockWeatherData,
         icon: '☀️',
         label: 'Nắng',
      });
      expect(result.current.error).toBeNull();

      // Check if it was saved to sessionStorage
      const cached = sessionStorage.getItem('weather_cache');
      expect(cached).toBeTruthy();

      const parsedCache = JSON.parse(cached);
      expect(parsedCache.data).toEqual(result.current.weather);
      expect(parsedCache.ts).toBeLessThanOrEqual(Date.now());
   });

   test('should use cached data if valid', async () => {
      const cachedWeather = {
         conditionCode: 1003,
         isDay: 0,
         icon: '⛅',
         label: 'Có mây',
         temp_c: 20,
      };

      sessionStorage.setItem(
         'weather_cache',
         JSON.stringify({
            data: cachedWeather,
            ts: Date.now(), // Valid timestamp
         })
      );

      const { result } = renderHook(() => useWeather('Hanoi'));

      // Should not fetch if cached
      expect(global.fetch).not.toHaveBeenCalled();

      expect(result.current.loading).toBe(false);
      expect(result.current.weather).toEqual(cachedWeather);
      expect(result.current.error).toBeNull();
   });

   test('should ignore expired cache and fetch fresh data', async () => {
      const expiredWeather = { conditionCode: 1000 };
      sessionStorage.setItem(
         'weather_cache',
         JSON.stringify({
            data: expiredWeather,
            ts: Date.now() - 40 * 60 * 1000, // 40 minutes ago (expired)
         })
      );

      const freshWeatherData = {
         conditionCode: 1063,
         isDay: 1,
      };

      global.fetch.mockResolvedValueOnce({
         ok: true,
         json: async () => freshWeatherData,
      });

      const { result } = renderHook(() => useWeather('Hanoi'));

      await waitFor(() => {
         expect(result.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result.current.weather.conditionCode).toBe(1063);
      expect(result.current.weather.icon).toBe('🌧️');
   });

   test('should handle API errors', async () => {
      global.fetch.mockResolvedValueOnce({
         ok: false,
         json: async () => ({ message: 'City not found' }),
      });

      const { result } = renderHook(() => useWeather('InvalidCity'));

      await waitFor(() => {
         expect(result.current.loading).toBe(false);
      });

      expect(result.current.weather).toBeNull();
      expect(result.current.error).toBe('City not found');
   });

   test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useWeather('Hanoi'));

      await waitFor(() => {
         expect(result.current.loading).toBe(false);
      });

      expect(result.current.weather).toBeNull();
      expect(result.current.error).toBe('Network error');
   });
});
