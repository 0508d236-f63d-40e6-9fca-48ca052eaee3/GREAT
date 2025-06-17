// دمج محسن للمراقبة مع التركيز على pump.fun فقط
import { PumpFunSpecificMonitor, type PumpFunTokenData } from "./pump-fun-specific-monitor"
import { pumpFunAPIEnhanced } from "./pump-fun-api-enhanced"
import { advancedAnalyzer } from "./advanced-analysis"

interface EnhancedRealTimeToken extends PumpFunTokenData {
  // إضافة خصائص التحليل
  final_percentage?: number
  classification?: "recommended" | "classified" | "ignored"
  confidence_level?: number
  risk_factors?: string[]
  _dataSource: string
  _isVerified: boolean
  _isRealTime: boolean
  _isPumpFunOnly: boolean
}

class RealTimeIntegrationEnhanced {
  private monitor: PumpFunSpecificMonitor | null = null
  private realtimeTokens: EnhancedRealTimeToken[] = []
  private listeners: ((tokens: EnhancedRealTimeToken[]) => void)[] = []
  private maxTokens = 100
  private pumpFunOnlyMode = true // وضع pump.fun فقط

  constructor() {
    console.log("🎯 Enhanced Real-Time Integration initialized (Pump.fun ONLY)")
  }

  async startPumpFunOnlyMonitoring(apiKey?: string): Promise<void> {
    try {
      console.log("🎯 Starting PUMP.FUN ONLY real-time monitoring...")

      // إعداد المراقب المخصص لـ pump.fun
      this.monitor = new PumpFunSpecificMonitor({
        rpcUrl: "https://rpc.helius.xyz",
        apiKey: apiKey || process.env.HELIUS_API_KEY,
        onNewCoin: this.handleNewPumpFunCoin.bind(this),
        onError: this.handleError.bind(this),
      })

      // بدء المراقبة
      await this.monitor.startMonitoring()

      console.log("✅ Pump.fun ONLY real-time monitoring started successfully")
    } catch (error) {
      console.error("❌ Failed to start pump.fun only monitoring:", error)
      throw error
    }
  }

  async stopPumpFunOnlyMonitoring(): Promise<void> {
    if (this.monitor) {
      await this.monitor.stopMonitoring()
      this.monitor = null
      console.log("🛑 Pump.fun only monitoring stopped")
    }
  }

  private async handleNewPumpFunCoin(coinData: PumpFunTokenData): Promise<void> {
    try {
      console.log("🎯 Processing new PUMP.FUN ONLY coin:", coinData.address)

      // التحقق المضاعف من أن العملة من pump.fun
      if (!coinData.isPumpFunVerified) {
        console.log("⚠️ Coin failed pump.fun verification, skipping...")
        return
      }

      // محاولة جلب بيانات إضافية من pump.fun API
      const pumpFunDetails = await pumpFunAPIEnhanced.getPumpFunTokenDetails(coinData.address)

      // تحويل البيانات إلى تنسيق النظام
      const tokenForAnalysis = {
        mint: coinData.address,
        name: pumpFunDetails?.name || coinData.name || `PumpFun-${coinData.symbol || "TOKEN"}`,
        symbol: pumpFunDetails?.symbol || coinData.symbol || coinData.address.substring(0, 6).toUpperCase(),
        description:
          pumpFunDetails?.description ||
          coinData.description ||
          `Real-time pump.fun token: ${coinData.name || coinData.symbol}`,
        image_uri:
          pumpFunDetails?.image_uri || coinData.image || this.generatePumpFunPlaceholder(coinData.symbol || "PF"),
        creator: coinData.creator,
        created_timestamp: coinData.timestamp.getTime() / 1000,
        usd_market_cap: pumpFunDetails?.usd_market_cap || coinData.marketCap || coinData.liquidity * 1000,
        virtual_sol_reserves: pumpFunDetails?.virtual_sol_reserves || coinData.solReserves || coinData.liquidity,
        virtual_token_reserves: pumpFunDetails?.virtual_token_reserves || coinData.tokenReserves || 1000000000,
        complete: pumpFunDetails?.complete || false,
        is_currently_live: pumpFunDetails?.is_currently_live !== false,
        reply_count: pumpFunDetails?.reply_count || 0,
        market_cap: pumpFunDetails?.market_cap || coinData.marketCap || coinData.liquidity * 1000,
        total_supply: pumpFunDetails?.total_supply || coinData.tokenReserves || 1000000000,
        bonding_curve: pumpFunDetails?.bonding_curve || coinData.bondingCurve || coinData.address,
        associated_bonding_curve:
          pumpFunDetails?.associated_bonding_curve || coinData.associatedBondingCurve || coinData.address,
        nsfw: pumpFunDetails?.nsfw || false,
        show_name: pumpFunDetails?.show_name !== false,
      }

      // تحليل العملة باستخدام خوارزمية GREAT IDEA
      const analyzedToken = await advancedAnalyzer.analyzeToken(tokenForAnalysis)

      // إنشاء العملة النهائية مع تأكيد pump.fun
      const enhancedRealtimeToken: EnhancedRealTimeToken = {
        ...coinData,
        ...analyzedToken,
        _dataSource: "pump-fun-realtime-only",
        _isVerified: true,
        _isRealTime: true,
        _isPumpFunOnly: true,
      }

      // إضافة العملة للقائمة
      this.addPumpFunRealtimeToken(enhancedRealtimeToken)

      console.log("✅ Pump.fun ONLY token processed and analyzed:", {
        address: enhancedRealtimeToken.address,
        name: enhancedRealtimeToken.name,
        symbol: enhancedRealtimeToken.symbol,
        percentage: enhancedRealtimeToken.final_percentage,
        classification: enhancedRealtimeToken.classification,
        isPumpFunVerified: enhancedRealtimeToken.isPumpFunVerified,
      })
    } catch (error) {
      console.error("❌ Error processing pump.fun only coin:", error)
    }
  }

  private handleError(error: Error): void {
    console.error("❌ Pump.fun only monitor error:", error)

    // محاولة إعادة التشغيل
    setTimeout(async () => {
      try {
        console.log("🔄 Attempting to restart pump.fun only monitor...")
        if (this.monitor) {
          await this.monitor.restart()
        }
      } catch (restartError) {
        console.error("❌ Failed to restart pump.fun monitor:", restartError)
      }
    }, 10000)
  }

  private addPumpFunRealtimeToken(token: EnhancedRealTimeToken): void {
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

  private generatePumpFunPlaceholder(symbol: string): string {
    const pumpColors = ["00d4aa", "ff6b6b", "4ecdc4", "45b7d1", "96ceb4", "feca57", "ff9ff3", "54a0ff"]
    const color = pumpColors[Math.floor(Math.random() * pumpColors.length)]
    return `https://via.placeholder.com/64x64/${color}/ffffff?text=${encodeURIComponent(symbol.substring(0, 4))}`
  }

  // واجهات للتفاعل مع النظام
  getPumpFunRealtimeTokens(): EnhancedRealTimeToken[] {
    return [...this.realtimeTokens]
  }

  addListener(listener: (tokens: EnhancedRealTimeToken[]) => void): void {
    this.listeners.push(listener)
  }

  removeListener(listener: (tokens: EnhancedRealTimeToken[]) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  getMonitorStatus(): any {
    const status = this.monitor ? this.monitor.getMonitorStatus() : null
    return {
      ...status,
      isPumpFunOnly: this.pumpFunOnlyMode,
      tokensCount: this.realtimeTokens.length,
      pumpFunVerifiedCount: this.realtimeTokens.filter((t) => t.isPumpFunVerified).length,
    }
  }

  clearPumpFunRealtimeTokens(): void {
    this.realtimeTokens = []
    this.notifyListeners()
  }

  // فحص حالة pump.fun API
  async checkPumpFunAPIStatus(): Promise<any> {
    return await pumpFunAPIEnhanced.checkPumpFunAPIStatus()
  }

  // جلب العملات من pump.fun API فقط
  async fetchPumpFunTokensOnly(limit = 50): Promise<any[]> {
    try {
      console.log("🎯 Fetching tokens from pump.fun API ONLY...")
      const tokens = await pumpFunAPIEnhanced.getPumpFunTokensOnly(limit)
      console.log(`✅ Fetched ${tokens.length} verified pump.fun tokens`)
      return tokens
    } catch (error) {
      console.error("❌ Error fetching pump.fun only tokens:", error)
      return []
    }
  }
}

// إنشاء instance واحد للاستخدام العام
export const realTimeIntegrationEnhanced = new RealTimeIntegrationEnhanced()
export type { EnhancedRealTimeToken }
