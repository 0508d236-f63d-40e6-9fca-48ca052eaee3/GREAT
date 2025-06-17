// نظام مراقبة فعال - pump.fun فقط بدون مسح كل Solana
import { DirectPumpFunMonitor, type DirectPumpFunToken } from "./direct-pump-fun-monitor"
import { PumpFunContinuousFetcher } from "./pump-fun-continuous-fetcher"

interface EfficientMonitorConfig {
  apiKeys?: string[]
  fetchInterval?: number // بالميلي ثانية
  onNewToken: (token: DirectPumpFunToken) => void
  onError: (error: Error) => void
}

class EfficientPumpMonitor {
  private directMonitor: DirectPumpFunMonitor
  private continuousFetcher: PumpFunContinuousFetcher
  private isRunning = false
  private tokenCount = 0
  private startTime = 0

  constructor(config: EfficientMonitorConfig) {
    console.log("🎯 Efficient Pump Monitor initialized")
    console.log("✅ Strategy: Monitor pump.fun DIRECTLY (not all Solana)")

    // إنشاء المراقب المباشر
    this.directMonitor = new DirectPumpFunMonitor(config.onNewToken)

    // إنشاء الجالب المستمر
    this.continuousFetcher = new PumpFunContinuousFetcher((tokens) => {
      tokens.forEach((token) => config.onNewToken(token))
    })

    // تعديل فترة الجلب إذا تم تحديدها
    if (config.fetchInterval) {
      this.continuousFetcher.setFetchInterval(config.fetchInterval)
    }
  }

  async startEfficientMonitoring(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Efficient monitoring already running")
      return
    }

    console.log("🚀 Starting EFFICIENT pump.fun monitoring...")
    console.log("📋 Monitoring strategy:")
    console.log("   1. ✅ pump.fun API continuous fetching")
    console.log("   2. ✅ pump.fun WebSocket real-time")
    console.log("   3. ✅ Solana logs for pump.fun programs ONLY")
    console.log("   4. ❌ NO scanning of all Solana tokens")

    try {
      this.startTime = Date.now()
      this.tokenCount = 0

      // بدء المراقبة المباشرة
      await this.directMonitor.startDirectMonitoring()

      // بدء الجلب المستمر
      await this.continuousFetcher.startContinuousFetching()

      // بدء مراقب الأداء
      this.startPerformanceMonitor()

      this.isRunning = true

      console.log("✅ Efficient pump.fun monitoring started!")
      console.log("🎯 Now monitoring pump.fun ONLY - maximum efficiency")
    } catch (error) {
      console.error("❌ Failed to start efficient monitoring:", error)
      throw error
    }
  }

  private startPerformanceMonitor(): void {
    setInterval(() => {
      const runtime = (Date.now() - this.startTime) / 1000 / 60 // بالدقائق
      const tokensPerMinute = runtime > 0 ? this.tokenCount / runtime : 0

      const directStats = this.directMonitor.getStats()
      const fetcherStats = this.continuousFetcher.getStats()

      console.log("📊 EFFICIENT MONITORING PERFORMANCE:")
      console.log(`   🎯 Tokens detected: ${this.tokenCount} (${tokensPerMinute.toFixed(1)}/min)`)
      console.log(`   📡 Direct monitor: ${directStats.processedTokens} tokens`)
      console.log(`   🔄 Continuous fetcher: ${fetcherStats.processedTokens} tokens`)
      console.log(`   ⚡ Methods: ${directStats.monitoringMethods.join(", ")}`)
      console.log(`   🚀 Efficiency: HIGH (pump.fun only, no Solana scanning)`)
    }, 30000) // كل 30 ثانية
  }

  async stopEfficientMonitoring(): Promise<void> {
    if (!this.isRunning) return

    console.log("🛑 Stopping efficient monitoring...")

    await this.directMonitor.stopMonitoring()
    this.continuousFetcher.stopContinuousFetching()

    this.isRunning = false
    console.log("✅ Efficient monitoring stopped")
  }

  getMonitoringStats(): {
    isRunning: boolean
    totalTokens: number
    tokensPerMinute: number
    runtime: number
    strategy: string
    efficiency: string
  } {
    const runtime = (Date.now() - this.startTime) / 1000 / 60
    const tokensPerMinute = runtime > 0 ? this.tokenCount / runtime : 0

    return {
      isRunning: this.isRunning,
      totalTokens: this.tokenCount,
      tokensPerMinute: Number(tokensPerMinute.toFixed(1)),
      runtime: Number(runtime.toFixed(1)),
      strategy: "pump.fun direct monitoring",
      efficiency: "HIGH (no unnecessary Solana scanning)",
    }
  }

  // تعديل إعدادات المراقبة
  updateSettings(settings: { fetchInterval?: number }): void {
    if (settings.fetchInterval) {
      this.continuousFetcher.setFetchInterval(settings.fetchInterval)
      console.log(`🔄 Updated fetch interval to ${settings.fetchInterval}ms`)
    }
  }
}

export { EfficientPumpMonitor, type EfficientMonitorConfig }
