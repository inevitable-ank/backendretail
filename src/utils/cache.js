/**
 * Simple in-memory cache with TTL for stats queries
 * This significantly improves performance for repeated queries
 */

class SimpleCache {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 30 * 1000 // 30 seconds default TTL
  }

  /**
   * Generate cache key from filters object
   */
  generateKey(prefix, filters) {
    // Sort filter arrays to ensure consistent keys
    const normalized = JSON.stringify(filters, (key, value) => {
      if (Array.isArray(value)) {
        return value.sort()
      }
      return value
    })
    return `${prefix}:${normalized}`
  }

  /**
   * Get value from cache
   */
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  /**
   * Set value in cache with TTL
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    })
  }

  /**
   * Clear cache (useful for testing or manual invalidation)
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Clean expired entries (call periodically)
   */
  clean() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Export singleton instance
export const cache = new SimpleCache()

// Clean expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.clean()
  }, 5 * 60 * 1000)
}


