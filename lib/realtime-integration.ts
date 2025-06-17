// دمج المراقب مع النظام الموجود
import { PumpFunDirectMonitor, type PumpFunToken } from "./pump-fun-direct-monitor"
import { advancedAnalyzer } from "./advanced-analysis"

interface RealTimeToken extends PumpFunToken {
  // إضافة خصائص التحليل
  final_percentage?: number
  classification?: "recommended" | "classified" | "ignored"
  confidence_level?: number
  risk_factors?: string[]
  _dataSource: string
  _isVerified: boolean
  _isRealTime: boolean
}

class RealTimeIntegration {
  private monitor: PumpFunDirectMonitor | null = null
  private realtimeTokens: RealTimeToken[] = []
  private listeners: ((tokens: RealTimeToken[]) => void)[] = []
  private maxTokens = 100 // الحد الأقصى للعملات المحفوظة

  constructor() {
    console.log("🔗 Real-Time Integration initialized")
  }

  async startRealTimeMonitoring(apiKey?: string): Promise<void> {
    try {
      // إعداد المراقب
      this.monitor = new PumpFunDirectMonitor({
        onNewToken: this.handleNewToken.bind(this),
        onError: this.handleError.bind(this),
      })

      // بدء المراقبة
      await this.monitor.startRealTimeMonitoring()

      console.log("✅ Real-time monitoring started successfully")
    } catch (error) {
      console.error("❌ Failed to start real-time monitoring:", error)
      throw error
    }
  }

  async stopRealTimeMonitoring(): Promise<void> {
    if (this.monitor) {
      await this.monitor.stopRealTimeMonitoring() // كان stopMonitoring
      this.monitor = null
      console.log("🛑 Real-time monitoring stopped")
    }
  }

  private async handleNewToken(tokenData: PumpFunToken): Promise<void> {
    try {
      console.log("🎉 Processing new pump.fun token:", tokenData.mint)

      // تحويل البيانات للتحليل
      const tokenForAnalysis = {
        mint: tokenData.mint,
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        image_uri: tokenData.image,
        creator: tokenData.creator,
        created_timestamp: tokenData.timestamp.getTime() / 1000,
        usd_market_cap: tokenData.marketCap,
        virtual_sol_reserves: tokenData.virtualSolReserves,
        virtual_token_reserves: tokenData.virtualTokenReserves,
        complete: tokenData.complete,
        is_currently_live: tokenData.isLive,
        reply_count: 0,
        market_cap: tokenData.marketCap,
        total_supply: tokenData.virtualTokenReserves,
        bonding_curve: tokenData.bondingCurve,
        associated_bonding_curve: tokenData.bondingCurve,
        nsfw: false,
        show_name: true,
      }

      // تحليل العملة
      const analyzedToken = await advancedAnalyzer.analyzeToken(tokenForAnalysis)

      // إنشاء العملة النهائية
      const realtimeToken: RealTimeToken = {
        address: tokenData.mint,
        name: tokenData.name,
        symbol: tokenData.symbol,
        creator: tokenData.creator,
        liquidity: tokenData.liquidity,
        timestamp: tokenData.timestamp,
        signature: tokenData.signature,
        ...analyzedToken,
        _dataSource: "pump-fun-direct",
        _isVerified: true,
        _isRealTime: true,
      }

      // إضافة العملة للقائمة
      this.addRealtimeToken(realtimeToken)

      console.log("✅ Pump.fun token processed:", {
        mint: realtimeToken.address,
        name: realtimeToken.name,
        symbol: realtimeToken.symbol,
        percentage: realtimeToken.final_percentage,
        classification: realtimeToken.classification,
      })
    } catch (error) {
      console.error("❌ Error processing pump.fun token:", error)
    }
  }

  private handleError(error: Error): void {
    console.error("❌ Real-time monitor error:", error)

    setTimeout(async () => {
      try {
        console.log("🔄 Attempting to restart real-time monitor...")
        if (this.monitor) {
          await this.monitor.stopRealTimeMonitoring() // إيقاف أولاً
          await new Promise((resolve) => setTimeout(resolve, 2000))
          await this.monitor.startRealTimeMonitoring() // ثم إعادة تشغيل
        }
      } catch (restartError) {
        console.error("❌ Failed to restart monitor:", restartError)
      }
    }, 10000)
  }

  private addRealtimeToken(token: RealTimeToken): void {
    // إضافة العملة في المقدمة
    this.realtimeTokens.unshift(token)

    // الحفاظ على الحد الأقصى
    if (this.realtimeTokens.length > this.maxTokens) {
      this.realtimeTokens = this.realtimeTokens.slice(0, this.maxTokens)
    }

    // إشعار المستمعين
    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener([...this.realtimeTokens])
      } catch (error) {
        console.error("❌ Error notifying listener:", error)
      }
    })
  }

  private generatePlaceholderImage(symbol: string): string {
    const colors = ["ff6b6b", "4ecdc4", "45b7d1", "f9ca24", "f0932b", "eb4d4b", "6c5ce7"]
    const color = colors[Math.floor(Math.random() * colors.length)]
    return `https://via.placeholder.com/64x64/${color}/ffffff?text=${encodeURIComponent(symbol.substring(0, 4))}`
  }

  // واجهات للتفاعل مع النظام
  getRealtimeTokens(): RealTimeToken[] {
    return [...this.realtimeTokens]
  }

  addListener(listener: (tokens: RealTimeToken[]) => void): void {
    this.listeners.push(listener)
  }

  removeListener(listener: (tokens: RealTimeToken[]) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  getMonitorStatus(): any {
    return this.monitor ? this.monitor.getMonitorStatus() : null
  }

  clearRealtimeTokens(): void {
    this.realtimeTokens = []
    this.notifyListeners()
  }
}

// إنشاء instance واحد للاستخدام العام
export const realTimeIntegration = new RealTimeIntegration()
export type { RealTimeToken }
