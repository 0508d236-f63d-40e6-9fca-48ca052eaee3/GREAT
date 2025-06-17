// محسن الأداء المتقدم
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
}

interface RequestQueue {
  id: string
  url: string
  options: RequestInit
  resolve: (value: any) => void
  reject: (reason: any) => void
  timestamp: number
  retries: number
}

interface PerformanceStats {
  cacheSize: number
  cacheHits: number
  cacheMisses: number
  activeRequests: number
  queueLength: number
  totalRequests: number
  averageResponseTime: number
  errorRate: number
}

class PerformanceOptimizer {
  private cache = new Map<string, CacheEntry<any>>()
  private requestQueue: RequestQueue[] = []
  private activeRequests = new Set<string>()
  private stats: PerformanceStats
  private maxConcurrentRequests = 5
  private defaultTTL = 30000 // 30 seconds
  private maxCacheSize = 100
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.stats = {
      cacheSize: 0,
      cacheHits: 0,
      cacheMisses: 0,
      activeRequests: 0,
      queueLength: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
    }

    this.startCleanupInterval()
    console.log("⚡ Performance Optimizer initialized")
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredCache()
      this.processQueue()
    }, 5000) // Clean every 5 seconds
  }

  private cleanExpiredCache(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`)
    }

    this.updateCacheStats()
  }

  private updateCacheStats(): void {
    this.stats.cacheSize = this.cache.size
    this.stats.activeRequests = this.activeRequests.size
    this.stats.queueLength = this.requestQueue.length
  }

  private generateCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || "GET"
    const headers = JSON.stringify(options?.headers || {})
    const body = options?.body || ""
    return `${method}:${url}:${headers}:${body}`
  }

  public async optimizedFetch<T>(
    url: string,
    options?: RequestInit & { ttl?: number; skipCache?: boolean },
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(url, options)
    const ttl = options?.ttl || this.defaultTTL

    // فحص Cache أولاً
    if (!options?.skipCache) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) {
        this.stats.cacheHits++
        console.log(`💾 Cache hit for: ${url}`)
        return cached
      }
    }

    this.stats.cacheMisses++
    this.stats.totalRequests++

    // إذا كان هناك طلب مماثل قيد التنفيذ، انتظر نتيجته
    if (this.activeRequests.has(cacheKey)) {
      console.log(`⏳ Waiting for existing request: ${url}`)
      return this.waitForActiveRequest<T>(cacheKey)
    }

    // إذا تجاوزنا الحد الأقصى للطلبات المتزامنة، أضف إلى الطابور
    if (this.activeRequests.size >= this.maxConcurrentRequests) {
      console.log(`📋 Queuing request: ${url}`)
      return this.queueRequest<T>(url, options || {})
    }

    // تنفيذ الطلب
    return this.executeRequest<T>(url, options || {}, cacheKey, ttl)
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    entry.accessCount++
    return entry.data as T
  }

  private async waitForActiveRequest<T>(cacheKey: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.activeRequests.has(cacheKey)) {
          clearInterval(checkInterval)
          const cached = this.getFromCache<T>(cacheKey)
          if (cached) {
            resolve(cached)
          } else {
            reject(new Error("Request completed but no cached result"))
          }
        }
      }, 100)

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        reject(new Error("Timeout waiting for active request"))
      }, 30000)
    })
  }

  private queueRequest<T>(url: string, options: RequestInit): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueItem: RequestQueue = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
        retries: 0,
      }

      this.requestQueue.push(queueItem)
      this.updateCacheStats()
    })
  }

  private async executeRequest<T>(url: string, options: RequestInit, cacheKey: string, ttl: number): Promise<T> {
    const startTime = Date.now()
    this.activeRequests.add(cacheKey)
    this.updateCacheStats()

    try {
      console.log(`🚀 Executing request: ${url}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // Reduced to 5 seconds

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Cache-Control": "no-cache",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime

      // تحديث إحصائيات الاستجابة
      this.updateResponseTime(responseTime)

      // حفظ في Cache
      this.setCache(cacheKey, data, ttl)

      console.log(`✅ Request completed: ${url} (${responseTime}ms)`)
      return data as T
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`❌ Request failed: ${url} (${responseTime}ms)`, error)
      this.stats.errorRate = this.stats.errorRate * 0.9 + 0.1 // Exponential moving average
      throw error
    } finally {
      this.activeRequests.delete(cacheKey)
      this.updateCacheStats()
    }
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    // إزالة أقدم العناصر إذا تجاوزنا الحد الأقصى
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.findOldestCacheKey()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
    })

    this.updateCacheStats()
  }

  private findOldestCacheKey(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  private updateResponseTime(responseTime: number): void {
    if (this.stats.averageResponseTime === 0) {
      this.stats.averageResponseTime = responseTime
    } else {
      // Exponential moving average
      this.stats.averageResponseTime = this.stats.averageResponseTime * 0.9 + responseTime * 0.1
    }
  }

  private async processQueue(): Promise<void> {
    while (this.requestQueue.length > 0 && this.activeRequests.size < this.maxConcurrentRequests) {
      const queueItem = this.requestQueue.shift()
      if (!queueItem) break

      try {
        const cacheKey = this.generateCacheKey(queueItem.url, queueItem.options)
        const result = await this.executeRequest(queueItem.url, queueItem.options, cacheKey, this.defaultTTL)
        queueItem.resolve(result)
      } catch (error) {
        if (queueItem.retries < 2) {
          queueItem.retries++
          this.requestQueue.unshift(queueItem) // إعادة إلى بداية الطابور
        } else {
          queueItem.reject(error)
        }
      }
    }

    this.updateCacheStats()
  }

  public cleanCache(): void {
    const sizeBefore = this.cache.size
    this.cleanExpiredCache()

    // إزالة العناصر الأقل استخداماً إذا كان Cache كبيراً جداً
    if (this.cache.size > this.maxCacheSize * 0.8) {
      this.evictLeastUsed()
    }

    const sizeAfter = this.cache.size
    if (sizeBefore !== sizeAfter) {
      console.log(`🧹 Cache cleaned: ${sizeBefore} → ${sizeAfter} entries`)
    }
  }

  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].accessCount - b[1].accessCount)

    const toRemove = Math.floor(this.cache.size * 0.2) // إزالة 20%
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  private isValidResponse(data: any): boolean {
    if (!data) return false

    // Check if it's an array or has expected structure
    if (Array.isArray(data)) return data.length > 0
    if (data.coins && Array.isArray(data.coins)) return data.coins.length > 0
    if (data.data && Array.isArray(data.data)) return data.data.length > 0

    return false
  }

  public getStats(): PerformanceStats {
    this.updateCacheStats()
    return { ...this.stats }
  }

  public clearCache(): void {
    this.cache.clear()
    this.updateCacheStats()
    console.log("🗑️ Cache cleared")
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    this.cache.clear()
    this.requestQueue.forEach((item) => {
      item.reject(new Error("Performance optimizer destroyed"))
    })
    this.requestQueue = []
    this.activeRequests.clear()

    console.log("🛑 Performance Optimizer destroyed")
  }
}

// إنشاء مثيل واحد للاستخدام العام
export const performanceOptimizer = new PerformanceOptimizer()

// تصدير الكلاس للاستخدام المخصص
export { PerformanceOptimizer, type PerformanceStats }
