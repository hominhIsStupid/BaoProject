import { LRUCache } from '../../src/utils/cache';

describe('LRUCache', () => {
   beforeEach(() => {
      jest.useFakeTimers();
   });

   afterEach(() => {
      jest.useRealTimers();
   });

   test('should set and get a value', () => {
      const cache = new LRUCache(5);
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
   });

   test('should return null for non-existent key', () => {
      const cache = new LRUCache(5);
      expect(cache.get('non-existent')).toBeNull();
   });

   test('should return false for has on non-existent key', () => {
      const cache = new LRUCache(5);
      expect(cache.has('non-existent')).toBeFalsy();
   });

   test('should return true for has on existing key', () => {
      const cache = new LRUCache(5);
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBeTruthy();
   });

   test('should clear the cache', () => {
      const cache = new LRUCache(5);
      cache.set('key1', 'value1');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.has('key1')).toBeFalsy();
   });

   test('should evict the least recently used item when limit is reached', () => {
      const cache = new LRUCache(3);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Limit is reached. Add one more.
      cache.set('key4', 'value4');

      // key1 should be evicted
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
   });

   test('should update recency on get', () => {
      const cache = new LRUCache(3);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key1, making it the most recently used
      cache.get('key1');

      // Add a new item, forcing eviction
      cache.set('key4', 'value4');

      // key2 should be evicted, because key1 was recently accessed
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
   });

   test('should expire items based on TTL on get', () => {
      const cache = new LRUCache(5);
      const TTL = 1000; // 1 second
      cache.set('key1', 'value1', TTL);

      expect(cache.get('key1')).toBe('value1');

      // Advance time beyond TTL
      jest.advanceTimersByTime(1500);

      expect(cache.get('key1')).toBeNull();
   });

   test('should expire items based on TTL on has', () => {
      const cache = new LRUCache(5);
      const TTL = 1000;
      cache.set('key1', 'value1', TTL);

      expect(cache.has('key1')).toBeTruthy();

      jest.advanceTimersByTime(1500);

      expect(cache.has('key1')).toBeFalsy();
   });

   test('should update an existing key and reset its recency', () => {
      const cache = new LRUCache(3);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Update key1
      cache.set('key1', 'newValue1');

      // Add a new item
      cache.set('key4', 'value4');

      // key2 should be evicted since key1 was just updated
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key1')).toBe('newValue1');
   });
});
