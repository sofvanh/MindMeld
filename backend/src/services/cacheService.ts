interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache: Record<string, CacheEntry<any>> = {};
  private maxEntries: number = 1000;
  private ttl: number = 60 * 60 * 1000;

  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns The cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache[key];
    const now = Date.now();

    if (entry && now - entry.timestamp < entry.ttl) {
      return entry.data as T;
    }

    if (entry) {
      delete this.cache[key];
    }

    return null;
  }

  /**
   * Store an item in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time-to-live in milliseconds
   */
  set<T>(key: string, data: T, ttl: number = this.ttl): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.enforceSizeLimit();
  }

  /**
   * Remove an item from the cache
   * @param key Cache key
   * @returns true if the item was removed, false if it didn't exist
   */
  delete(key: string): boolean {
    if (this.cache[key]) {
      delete this.cache[key];
      return true;
    }
    return false;
  }

  /**
   * Remove all items matching a pattern
   * @param pattern String pattern to match against keys
   * @returns Number of items removed
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;

    Object.keys(this.cache).forEach(key => {
      if (regex.test(key)) {
        delete this.cache[key];
        count++;
      }
    });

    return count;
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache = {};
  }

  /**
   * Get the number of items in the cache
   */
  size(): number {
    return Object.keys(this.cache).length;
  }

  /**
   * Enforce the maximum cache size by removing oldest entries
   */
  private enforceSizeLimit(): void {
    const keys = Object.keys(this.cache);
    if (keys.length <= this.maxEntries) return;

    // Sort entries by timestamp (oldest first)
    const sortedKeys = keys.sort((a, b) =>
      this.cache[a].timestamp - this.cache[b].timestamp
    );

    // Remove oldest entries until we're under the limit
    const keysToRemove = sortedKeys.slice(0, keys.length - this.maxEntries);
    keysToRemove.forEach(key => {
      delete this.cache[key];
    });
  }
}

// Export a singleton instance
export const memoryCache = new InMemoryCache();

/**
 * Helper function to get or set cache with a data fetching function
 * @param key Cache key
 * @param ttl Time-to-live in milliseconds
 * @param fetchFn Function to fetch data if not in cache
 * @returns The cached or freshly fetched data
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cachedData = memoryCache.get<T>(key);
  if (cachedData !== null) {
    console.log(`Cache hit for ${key}`);
    return cachedData;
  }

  // Cache miss - fetch fresh data
  const freshData = await fetchFn();

  // Store in cache for next time
  memoryCache.set(key, freshData, ttl);

  console.log(`Cache miss for ${key}`);

  return freshData;
}
