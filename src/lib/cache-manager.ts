
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private static instance: CacheManager;
  
  private constructor() {
    // Clean expired items every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = CacheManager.getInstance();

// React Query cache keys
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  BLOGS: 'blogs',
  POSTS: 'posts',
  USERS: 'users',
  FEED: 'feed',
  SEARCH: 'search',
  TEMPLATES: 'templates',
  VIDEOS: 'videos',
} as const;
