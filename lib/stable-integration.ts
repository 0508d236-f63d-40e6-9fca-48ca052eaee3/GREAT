// تكامل مستقر بدون WebSocket
import { StablePumpMonitor, type StablePumpToken } from "./stable-pump-monitor"

class StableIntegration {
  private monitor: StablePumpMonitor | null = null
  private detectedTokens: StablePumpToken[] = []
  private isActive = false

  constructor() {
    console.log("🔗 Stable Integration initialized")
  }

  async startRealTimeMonitoring(): Promise<void> {
    if (this.isActive) {
      console.log("⚠️ Stable monitoring already active")
      return
    }

    try {
      console.log("🚀 Starting stable real-time monitoring...")

      this.monitor = new StablePumpMonitor({
        onNewToken: (token) => {
          console.log("🎯 New token detected:", token.symbol)
          this.detectedTokens.unshift(token)

          // الاحتفاظ بآخر 500 عملة فقط
          if (this.detectedTokens.length > 500) {
            this.detectedTokens = this.detectedTokens.slice(0, 500)
          }
        },
        onError: (error) => {
          console.error("❌ Monitor error:", error)
        },
        pollingInterval: 3000, // كل 3 ثوان
      })

      await this.monitor.startRealTimeMonitoring()
      this.isActive = true

      console.log("✅ Stable real-time monitoring started")
    } catch (error) {
      console.error("❌ Failed to start stable monitoring:", error)
      throw error
    }
  }

  async stopRealTimeMonitoring(): Promise<void> {
    if (!this.isActive || !this.monitor) {
      console.log("⚠️ Stable monitoring not active")
      return
    }

    try {
      await this.monitor.stopRealTimeMonitoring()
      this.monitor = null
      this.isActive = false
      console.log("🛑 Stable monitoring stopped")
    } catch (error) {
      console.error("❌ Error stopping stable monitoring:", error)
      throw error
    }
  }

  getRealtimeTokens(): StablePumpToken[] {
    return [...this.detectedTokens]
  }

  getMonitorStatus(): boolean {
    return this.isActive && this.monitor !== null
  }

  clearRealtimeTokens(): void {
    this.detectedTokens = []
    console.log("🧹 Cleared detected tokens")
  }

  getStats(): {
    isActive: boolean
    totalDetected: number
    monitorStatus: any
  } {
    return {
      isActive: this.isActive,
      totalDetected: this.detectedTokens.length,
      monitorStatus: this.monitor?.getMonitorStatus() || null,
    }
  }
}

// إنشاء instance واحد
export const stableIntegration = new StableIntegration()
