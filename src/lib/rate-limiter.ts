
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private storage = new Map<string, RateLimitEntry>();
  
  private constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }
  
  checkLimit(key: string, config: RateLimitConfig): { allowed: boolean; resetTime: number } {
    const now = Date.now();
    const entry = this.storage.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      this.storage.set(key, newEntry);
      return { allowed: true, resetTime: newEntry.resetTime };
    }
    
    if (entry.count >= config.maxRequests) {
      return { allowed: false, resetTime: entry.resetTime };
    }
    
    entry.count++;
    this.storage.set(key, entry);
    return { allowed: true, resetTime: entry.resetTime };
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  POST_CREATE: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 posts per minute
  COMMENT_CREATE: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 comments per minute
  LIKE_ACTION: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 likes per minute
  MESSAGE_SEND: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 messages per minute
} as const;

export const rateLimiter = RateLimiter.getInstance();
