/**
 * 🚀 إعدادات الإنتاج - تحسين للنشر
 */

export const PRODUCTION_CONFIG = {
  // إعدادات API
  API: {
    PUMP_FUN: {
      PRIMARY_URL: "https://frontend-api.pump.fun",
      FALLBACK_URLS: ["https://pumpportal.fun/api", "https://api.pump.fun", "https://pump.fun/api"],
      TIMEOUT: 10000, // 10 ثوان
      RETRY_ATTEMPTS: 3,
      RATE_LIMIT: {
        REQUESTS_PER_MINUTE: 60,
        BURST_LIMIT: 10,
      },
    },
    SOLANA_RPC: {
      ENDPOINTS: [
        "https://api.mainnet-beta.solana.com",
        "https://solana-api.projectserum.com",
        "https://rpc.ankr.com/solana",
        "https://solana.public-rpc.com",
      ],
      TIMEOUT: 5000, // 5 ثوان
      RETRY_ATTEMPTS: 2,
    },
  },

  // إعدادات الأداء
  PERFORMANCE: {
    TOKEN_FETCH_INTERVAL: 30000, // 30 ثانية
    MAX_TOKENS_PER_REQUEST: 500,
    MAX_TOKENS_IN_MEMORY: 2000,
    ANALYSIS_BATCH_SIZE: 10,
    ANALYSIS_DELAY: 100, // مللي ثانية بين التحليلات
  },

  // إعدادات التحليل
  ANALYSIS: {
    AUTO_ANALYSIS: true,
    CRITERIA: {
      MAX_AGE_MINUTES: 20,
      MAX_MARKET_CAP: 15000,
      MIN_PRICE: 0.000001,
      MAX_PRICE: 1.0,
    },
    ACCURACY_TARGET: 85, // هدف دقة 85%
  },

  // إعدادات الأمان
  SECURITY: {
    ENABLE_CORS_FALLBACK: true,
    VALIDATE_DATA: true,
    SANITIZE_INPUTS: true,
    MAX_REQUEST_SIZE: 1024 * 1024, // 1MB
  },

  // إعدادات واجهة المستخدم
  UI: {
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 200,
    REFRESH_INTERVAL: 30000,
    SHOW_LOADING_AFTER: 1000, // مللي ثانية
  },

  // إعدادات التخزين المؤقت
  CACHE: {
    TOKEN_CACHE_TTL: 60000, // دقيقة واحدة
    ANALYSIS_CACHE_TTL: 300000, // 5 دقائق
    NETWORK_CACHE_TTL: 30000, // 30 ثانية
  },
}

/**
 * 🔧 تطبيق إعدادات الإنتاج
 */
export function applyProductionConfig() {
  console.log("🚀 تطبيق إعدادات الإنتاج...")

  // تعيين متغيرات البيئة إذا لم تكن موجودة
  if (typeof window === "undefined") {
    // إعدادات الخادم
    process.env.NODE_ENV = process.env.NODE_ENV || "production"
    process.env.NEXT_PUBLIC_APP_NAME = "GREAT"
    process.env.NEXT_PUBLIC_APP_VERSION = "2.0.0"
  }

  console.log("✅ تم تطبيق إعدادات الإنتاج")
}

/**
 * 📊 مراقبة الأداء
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  startTimer(operation: string): () => void {
    const startTime = Date.now()

    return () => {
      const duration = Date.now() - startTime
      this.recordMetric(operation, duration)
    }
  }

  recordMetric(operation: string, value: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }

    const values = this.metrics.get(operation)!
    values.push(value)

    // احتفظ بآخر 100 قياس فقط
    if (values.length > 100) {
      values.shift()
    }
  }

  getAverageMetric(operation: string): number {
    const values = this.metrics.get(operation) || []
    if (values.length === 0) return 0

    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  getAllMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {}

    this.metrics.forEach((values, operation) => {
      result[operation] = {
        average: this.getAverageMetric(operation),
        count: values.length,
        latest: values[values.length - 1] || 0,
      }
    })

    return result
  }
}

export const performanceMonitor = new PerformanceMonitor()
