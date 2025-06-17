// مراقب الاتصال المتقدم
interface ConnectionStatus {
  isOnline: boolean
  lastCheck: Date
  responseTime: number
  errorCount: number
  quality: "excellent" | "good" | "poor" | "offline"
}

interface ConnectionMonitorConfig {
  checkInterval: number
  timeout: number
  maxRetries: number
  endpoints: string[]
}

class ConnectionMonitor {
  private status: ConnectionStatus
  private config: ConnectionMonitorConfig
  private checkInterval: NodeJS.Timeout | null = null
  private listeners: {
    onConnectionChange: ((isOnline: boolean) => void)[]
    onApiError: ((error: any) => void)[]
    onQualityChange: ((quality: string) => void)[]
  }

  constructor(config?: Partial<ConnectionMonitorConfig>) {
    this.config = {
      checkInterval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      maxRetries: 3,
      endpoints: [
        "https://api.pump.fun/health",
        "https://frontend-api.pump.fun/health",
        "https://www.google.com/favicon.ico",
      ],
      ...config,
    }

    this.status = {
      isOnline: navigator.onLine,
      lastCheck: new Date(),
      responseTime: 0,
      errorCount: 0,
      quality: "good",
    }

    this.listeners = {
      onConnectionChange: [],
      onApiError: [],
      onQualityChange: [],
    }

    this.initialize()
  }

  private initialize(): void {
    // مراقبة حالة المتصفح
    window.addEventListener("online", () => {
      console.log("🌐 Browser online event detected")
      this.handleConnectionChange(true)
    })

    window.addEventListener("offline", () => {
      console.log("🌐 Browser offline event detected")
      this.handleConnectionChange(false)
    })

    // بدء الفحص الدوري
    this.startPeriodicCheck()

    console.log("🔍 Connection Monitor initialized")
  }

  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(() => {
      this.performConnectionCheck()
    }, this.config.checkInterval)

    // فحص أولي
    this.performConnectionCheck()
  }

  private async performConnectionCheck(): Promise<void> {
    const startTime = Date.now()
    let isOnline = false
    let responseTime = 0
    let errorCount = 0

    // فحص عدة endpoints
    for (const endpoint of this.config.endpoints) {
      try {
        const checkStart = Date.now()
        const response = await fetch(endpoint, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
          signal: AbortSignal.timeout(this.config.timeout),
        })

        responseTime = Date.now() - checkStart
        isOnline = true
        break // نجح الاتصال، لا حاجة لفحص باقي endpoints
      } catch (error) {
        errorCount++
        console.warn(`Connection check failed for ${endpoint}:`, error)

        // إشعار المستمعين بالخطأ
        this.notifyApiError(error)
      }
    }

    // تحديث الحالة
    const wasOnline = this.status.isOnline
    const oldQuality = this.status.quality

    this.status = {
      isOnline,
      lastCheck: new Date(),
      responseTime,
      errorCount: this.status.errorCount + errorCount,
      quality: this.calculateQuality(isOnline, responseTime, errorCount),
    }

    // إشعار المستمعين بالتغييرات
    if (wasOnline !== isOnline) {
      this.notifyConnectionChange(isOnline)
    }

    if (oldQuality !== this.status.quality) {
      this.notifyQualityChange(this.status.quality)
    }

    console.log(
      `🔍 Connection check: ${isOnline ? "Online" : "Offline"} (${responseTime}ms, Quality: ${this.status.quality})`,
    )
  }

  private calculateQuality(
    isOnline: boolean,
    responseTime: number,
    errorCount: number,
  ): "excellent" | "good" | "poor" | "offline" {
    if (!isOnline) return "offline"

    if (responseTime < 1000 && errorCount === 0) return "excellent"
    if (responseTime < 3000 && errorCount < 2) return "good"
    return "poor"
  }

  private handleConnectionChange(isOnline: boolean): void {
    if (this.status.isOnline !== isOnline) {
      this.status.isOnline = isOnline
      this.status.lastCheck = new Date()
      this.notifyConnectionChange(isOnline)
    }
  }

  private notifyConnectionChange(isOnline: boolean): void {
    console.log(`🔄 Connection status changed: ${isOnline ? "Online" : "Offline"}`)
    this.listeners.onConnectionChange.forEach((listener) => {
      try {
        listener(isOnline)
      } catch (error) {
        console.error("Error notifying connection change listener:", error)
      }
    })
  }

  private notifyApiError(error: any): void {
    this.listeners.onApiError.forEach((listener) => {
      try {
        listener(error)
      } catch (err) {
        console.error("Error notifying API error listener:", err)
      }
    })
  }

  private notifyQualityChange(quality: string): void {
    this.listeners.onQualityChange.forEach((listener) => {
      try {
        listener(quality)
      } catch (error) {
        console.error("Error notifying quality change listener:", error)
      }
    })
  }

  // واجهات عامة
  public getStatus(): ConnectionStatus {
    return { ...this.status }
  }

  public onConnectionChange(callback: (isOnline: boolean) => void): void {
    this.listeners.onConnectionChange.push(callback)
  }

  public onApiError(callback: (error: any) => void): void {
    this.listeners.onApiError.push(callback)
  }

  public onQualityChange(callback: (quality: string) => void): void {
    this.listeners.onQualityChange.push(callback)
  }

  public async forceCheck(): Promise<ConnectionStatus> {
    await this.performConnectionCheck()
    return this.getStatus()
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    // إزالة مستمعي الأحداث
    window.removeEventListener("online", this.handleConnectionChange)
    window.removeEventListener("offline", this.handleConnectionChange)

    // مسح المستمعين
    this.listeners.onConnectionChange = []
    this.listeners.onApiError = []
    this.listeners.onQualityChange = []

    console.log("🛑 Connection Monitor destroyed")
  }

  public getStats(): {
    isOnline: boolean
    quality: string
    responseTime: number
    errorCount: number
    uptime: number
    lastCheck: string
  } {
    return {
      isOnline: this.status.isOnline,
      quality: this.status.quality,
      responseTime: this.status.responseTime,
      errorCount: this.status.errorCount,
      uptime: Date.now() - this.status.lastCheck.getTime(),
      lastCheck: this.status.lastCheck.toISOString(),
    }
  }
}

// إنشاء مثيل واحد للاستخدام العام
export const connectionMonitor = new ConnectionMonitor()

// تصدير الكلاس للاستخدام المخصص
export { ConnectionMonitor, type ConnectionStatus, type ConnectionMonitorConfig }
