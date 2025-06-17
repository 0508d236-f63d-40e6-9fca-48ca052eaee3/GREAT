// محسن الأداء المتقدم لجلب البيانات
export class PerformanceOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private requestQueue: Array<{ url: string; options: any; resolve: Function; reject: Function }> = []
  private activeRequests = new Set<string>()
  private maxConcurrentRequests = 5
  private requestDelay = 100 // milliseconds between requests
  private lastRequestTime = 0

  constructor() {
    console.log("🚀 Performance Optimizer initialized")
    this.startRequestProcessor()
  }

  // Cache with TTL
  setCache(key: string, data: any, ttl = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  getCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  // Optimized fetch with caching, deduplication, and rate limiting
  async optimizedFetch(url: string, options: any = {}): Promise<any> {
    const cacheKey = `${url}_${JSON.stringify(options)}`

    // Check cache first
    const cached = this.getCache(cacheKey)
    if (cached) {
      console.log(`📦 Cache hit for: ${url}`)
      return cached
    }

    // Check if request is already in progress
    if (this.activeRequests.has(cacheKey)) {
      console.log(`⏳ Request already in progress: ${url}`)
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ url: cacheKey, options, resolve, reject })
      })
    }

    // Add to queue for rate limiting
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject })
    })
  }

  private startRequestProcessor(): void {
    setInterval(() => {
      this.processRequestQueue()
    }, this.requestDelay)
  }

  private async processRequestQueue(): Promise<void> {
    if (this.requestQueue.length === 0) return
    if (this.activeRequests.size >= this.maxConcurrentRequests) return

    const now = Date.now()
    if (now - this.lastRequestTime < this.requestDelay) return

    const request = this.requestQueue.shift()
    if (!request) return

    this.lastRequestTime = now
    this.activeRequests.add(request.url)

    try {
      const response = await this.executeRequest(request.url, request.options)
      this.setCache(request.url, response, 30000) // 30 second cache
      request.resolve(response)
    } catch (error) {
      request.reject(error)
    } finally {
      this.activeRequests.delete(request.url)
    }
  }

  private async executeRequest(url: string, options: any): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; GREAT-IDEA-Bot/2.0)",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // Batch processing for multiple requests
  async batchFetch(urls: string[], options: any = {}): Promise<any[]> {
    const promises = urls.map((url) => this.optimizedFetch(url, options))
    return Promise.allSettled(promises)
  }

  // Clear expired cache entries
  cleanCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key)
      }
    }
  }

  getStats(): any {
    return {
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests.size,
      queueLength: this.requestQueue.length,
      maxConcurrent: this.maxConcurrentRequests,
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer()
