// دمج المراقب مع النظام الموجود
import { SolanaRealTimeMonitor, type NewCoinData } from "./solana-realtime-monitor"
import { advancedAnalyzer } from "./advanced-analysis"

interface RealTimeToken extends NewCoinData {
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
  private monitor: SolanaRealTimeMonitor | null = null
  private realtimeTokens: RealTimeToken[] = []
  private listeners: ((tokens: RealTimeToken[]) => void)[] = []
  private maxTokens = 100 // الحد الأقصى للعملات المحفوظة

  constructor() {
    console.log("🔗 Real-Time Integration initialized")
  }

  async startRealTimeMonitoring(apiKey?: string): Promise<void> {
    try {
      // إعداد المراقب
      this.monitor = new SolanaRealTimeMonitor({
        rpcUrl: "https://rpc.helius.xyz",
        apiKey: apiKey || process.env.HELIUS_API_KEY,
        onNewCoin: this.handleNewCoin.bind(this),
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
      await this.monitor.stopMonitoring()
      this.monitor = null
      console.log("🛑 Real-time monitoring stopped")
    }
  }

  private async handleNewCoin(coinData: NewCoinData): Promise<void> {
    try {
      console.log("🎉 Processing new real-time coin:", coinData.address)

      // تحويل البيانات إلى تنسيق النظام
      const tokenForAnalysis = {
        mint: coinData.address,
        name: coinData.name || `RT-${coinData.symbol || "TOKEN"}`,
        symbol: coinData.symbol || coinData.address.substring(0, 6).toUpperCase(),
        description: coinData.description || `Real-time detected token: ${coinData.name}`,
        image_uri: coinData.image || this.generatePlaceholderImage(coinData.symbol || "RT"),
        creator: coinData.creator,
        created_timestamp: coinData.timestamp.getTime() / 1000,
        usd_market_cap: coinData.marketCap || coinData.liquidity * 1000,
        virtual_sol_reserves: coinData.solReserves || coinData.liquidity,
        virtual_token_reserves: coinData.tokenReserves || 1000000000,
        complete: false,
        is_currently_live: true,
        reply_count: 0,
        market_cap: coinData.marketCap || coinData.liquidity * 1000,
        total_supply: coinData.tokenReserves || 1000000000,
        bonding_curve: coinData.address,
        associated_bonding_curve: coinData.address,
        nsfw: false,
        show_name: true,
      }

      // تحليل العملة باستخدام خوارزمية GREAT IDEA
      const analyzedToken = await advancedAnalyzer.analyzeToken(tokenForAnalysis)

      // إنشاء العملة النهائية
      const realtimeToken: RealTimeToken = {
        ...coinData,
        ...analyzedToken,
        _dataSource: "solana-realtime",
        _isVerified: true,
        _isRealTime: true,
      }

      // إضافة العملة للقائمة
      this.addRealtimeToken(realtimeToken)

      console.log("✅ Real-time token processed and analyzed:", {
        address: realtimeToken.address,
        name: realtimeToken.name,
        symbol: realtimeToken.symbol,
        percentage: realtimeToken.final_percentage,
        classification: realtimeToken.classification,
      })
    } catch (error) {
      console.error("❌ Error processing real-time coin:", error)
    }
  }

  private handleError(error: Error): void {
    console.error("❌ Real-time monitor error:", error)

    // محاولة إعادة التشغيل في حالة الخطأ
    setTimeout(async () => {
      try {
        console.log("🔄 Attempting to restart real-time monitor...")
        if (this.monitor) {
          await this.monitor.restart()
        }
      } catch (restartError) {
        console.error("❌ Failed to restart monitor:", restartError)
      }
    }, 10000) // إعادة المحاولة بعد 10 ثوان
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
