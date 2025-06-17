// دمج النظام فائق السرعة مع النظام الموجود
import { UltraFastPumpMonitor, type UltraFastTokenData } from "./ultra-fast-pump-monitor"
import { pumpFunWebSocketAPI } from "./pump-fun-websocket-api"
import { advancedAnalyzer } from "./advanced-analysis"

interface UltraFastToken extends UltraFastTokenData {
  // إضافة خصائص التحليل
  final_percentage?: number
  classification?: "recommended" | "classified" | "ignored"
  confidence_level?: number
  risk_factors?: string[]
  _dataSource: string
  _isVerified: boolean
  _isUltraFast: boolean
  _detectionSpeed: "instant" | "fast" | "normal"
}

class UltraFastIntegration {
  private monitor: UltraFastPumpMonitor | null = null
  private ultraFastTokens: UltraFastToken[] = []
  private listeners: ((tokens: UltraFastToken[]) => void)[] = []
  private maxTokens = 1000 // زيادة الحد الأقصى
  private tokensPerMinuteCounter = 0
  private lastMinuteTimestamp = Date.now()

  constructor() {
    console.log("⚡ Ultra-Fast Integration initialized - Target: 1000+ tokens/minute")
  }

  async startUltraFastMonitoring(apiKeys?: string[]): Promise<void> {
    try {
      console.log("🚀 Starting ULTRA-FAST pump.fun monitoring system...")
      console.log("🎯 Expected performance: 1000+ tokens per minute")

      // بدء WebSocket API
      await pumpFunWebSocketAPI.connectWebSocket()

      // إنشاء المراقب فائق السرعة
      this.monitor = new UltraFastPumpMonitor({
        apiKeys,
        onNewToken: this.handleUltraFastToken.bind(this),
        onError: this.handleError.bind(this),
      })

      // بدء المراقبة
      await this.monitor.startUltraFastMonitoring()

      // بدء جلب البيانات المتوازي
      this.startParallelDataFetching()

      // بدء مراقب الأداء
      this.startPerformanceTracking()

      console.log("✅ Ultra-fast monitoring system started successfully!")
      console.log("📊 System ready to detect 1000+ tokens per minute")
    } catch (error) {
      console.error("❌ Failed to start ultra-fast monitoring:", error)
      throw error
    }
  }

  private async handleUltraFastToken(tokenData: UltraFastTokenData): Promise<void> {
    try {
      const startTime = Date.now()

      // تحديد سرعة الكشف
      let detectionSpeed: "instant" | "fast" | "normal" = "normal"
      if (tokenData.detectionLatency < 100) detectionSpeed = "instant"
      else if (tokenData.detectionLatency < 500) detectionSpeed = "fast"

      console.log(`⚡ ULTRA-FAST: Processing token ${tokenData.mint} (${tokenData.detectionLatency}ms latency)`)

      // محاولة جلب metadata من pump.fun
      const metadata = await pumpFunWebSocketAPI.getTokenMetadata(tokenData.mint)

      // تحويل للتنسيق المطلوب للتحليل
      const tokenForAnalysis = {
        mint: tokenData.mint,
        name: metadata?.name || tokenData.name || `UltraFast-${tokenData.symbol || "TOKEN"}`,
        symbol: metadata?.symbol || tokenData.symbol || tokenData.mint.substring(0, 6).toUpperCase(),
        description: metadata?.description || `Ultra-fast detected token from pump.fun`,
        image_uri: metadata?.image_uri || tokenData.uri || this.generatePlaceholderImage(tokenData.symbol || "UF"),
        creator: tokenData.creator,
        created_timestamp: tokenData.timestamp / 1000,
        usd_market_cap: metadata?.usd_market_cap || tokenData.initialLiquidity * 1000,
        virtual_sol_reserves: metadata?.virtual_sol_reserves || tokenData.initialLiquidity,
        virtual_token_reserves: metadata?.virtual_token_reserves || 1000000000,
        complete: metadata?.complete || false,
        is_currently_live: metadata?.is_currently_live !== false,
        reply_count: metadata?.reply_count || 0,
        market_cap: metadata?.market_cap || tokenData.initialLiquidity * 1000,
        total_supply: metadata?.total_supply || 1000000000,
        bonding_curve: tokenData.bondingCurve,
        associated_bonding_curve: tokenData.associatedBondingCurve,
        nsfw: metadata?.nsfw || false,
        show_name: metadata?.show_name !== false,
      }

      // تحليل سريع باستخدام خوارزمية GREAT IDEA
      const analyzedToken = await advancedAnalyzer.analyzeToken(tokenForAnalysis)

      // إنشاء العملة النهائية
      const ultraFastToken: UltraFastToken = {
        ...tokenData,
        ...analyzedToken,
        _dataSource: "ultra-fast-solana-realtime",
        _isVerified: true,
        _isUltraFast: true,
        _detectionSpeed: detectionSpeed,
      }

      // إضافة للقائمة
      this.addUltraFastToken(ultraFastToken)

      // تحديث العداد
      this.tokensPerMinuteCounter++

      const processingTime = Date.now() - startTime
      console.log(
        `✅ ULTRA-FAST: Token processed in ${processingTime}ms total (${tokenData.detectionLatency}ms detection + ${processingTime - tokenData.detectionLatency}ms analysis)`,
      )
    } catch (error) {
      console.error("❌ Error processing ultra-fast token:", error)
    }
  }

  private addUltraFastToken(token: UltraFastToken): void {
    // إضافة في المقدمة (الأحدث أولاً)
    this.ultraFastTokens.unshift(token)

    // الحفاظ على الحد الأقصى
    if (this.ultraFastTokens.length > this.maxTokens) {
      this.ultraFastTokens = this.ultraFastTokens.slice(0, this.maxTokens)
    }

    // إشعار المستمعين
    this.notifyListeners()
  }

  private startParallelDataFetching(): void {
    // جلب البيانات كل 5 ثوان من pump.fun API
    setInterval(async () => {
      try {
        const latestTokens = await pumpFunWebSocketAPI.fetchLatestTokensBatch(200)

        if (latestTokens.length > 0) {
          console.log(`📦 Fetched ${latestTokens.length} tokens from pump.fun API`)

          // معالجة العملات الجديدة التي لم نكتشفها بعد
          const newTokens = latestTokens.filter(
            (token) => !this.ultraFastTokens.some((existing) => existing.mint === token.mint),
          )

          if (newTokens.length > 0) {
            console.log(`🆕 Found ${newTokens.length} new tokens from API`)

            // معالجة متوازية للعملات الجديدة
            newTokens.forEach((token) => {
              const ultraFastData: UltraFastTokenData = {
                mint: token.mint,
                creator: token.creator,
                signature: `api-${token.mint}`,
                timestamp: Date.now(),
                blockTime: token.created_timestamp,
                slot: 0,
                bondingCurve: token.bonding_curve,
                associatedBondingCurve: token.associated_bonding_curve,
                initialLiquidity: token.virtual_sol_reserves || 0,
                name: token.name,
                symbol: token.symbol,
                uri: token.image_uri,
                isVerifiedPumpFun: true,
                detectionLatency: 0, // من API
              }

              this.handleUltraFastToken(ultraFastData)
            })
          }
        }
      } catch (error) {
        console.warn("Parallel data fetching error:", error)
      }
    }, 5000) // كل 5 ثوان
  }

  private startPerformanceTracking(): void {
    setInterval(() => {
      const currentTime = Date.now()
      const timeDiff = currentTime - this.lastMinuteTimestamp

      if (timeDiff >= 60000) {
        // كل دقيقة
        const tokensPerMinute = this.tokensPerMinuteCounter

        console.log(`📊 ULTRA-FAST PERFORMANCE:`)
        console.log(`   🎯 Tokens detected: ${tokensPerMinute}/minute`)
        console.log(
          `   ⚡ Instant detections: ${this.ultraFastTokens.filter((t) => t._detectionSpeed === "instant").length}`,
        )
        console.log(`   🚀 Fast detections: ${this.ultraFastTokens.filter((t) => t._detectionSpeed === "fast").length}`)
        console.log(`   📈 Total tokens: ${this.ultraFastTokens.length}`)
        console.log(`   🏆 Target achieved: ${tokensPerMinute >= 1000 ? "YES ✅" : "NO ❌"}`)

        // إعادة تعيين العدادات
        this.tokensPerMinuteCounter = 0
        this.lastMinuteTimestamp = currentTime
      }
    }, 10000) // فحص كل 10 ثوان
  }

  private handleError(error: Error): void {
    console.error("❌ Ultra-fast monitor error:", error)

    // محاولة إعادة التشغيل
    setTimeout(async () => {
      try {
        console.log("🔄 Attempting to restart ultra-fast monitor...")
        if (this.monitor) {
          await this.monitor.stopMonitoring()
          await this.monitor.startUltraFastMonitoring()
        }
      } catch (restartError) {
        console.error("❌ Failed to restart ultra-fast monitor:", restartError)
      }
    }, 5000)
  }

  private generatePlaceholderImage(symbol: string): string {
    const colors = ["00d4aa", "ff6b6b", "4ecdc4", "45b7d1", "96ceb4", "feca57", "ff9ff3", "54a0ff"]
    const color = colors[Math.floor(Math.random() * colors.length)]
    return `https://via.placeholder.com/64x64/${color}/ffffff?text=${encodeURIComponent(symbol.substring(0, 4))}`
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener([...this.ultraFastTokens])
      } catch (error) {
        console.error("❌ Error notifying listener:", error)
      }
    })
  }

  // واجهات للتفاعل مع النظام
  getUltraFastTokens(): UltraFastToken[] {
    return [...this.ultraFastTokens]
  }

  addListener(listener: (tokens: UltraFastToken[]) => void): void {
    this.listeners.push(listener)
  }

  removeListener(listener: (tokens: UltraFastToken[]) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  getPerformanceStats(): {
    totalTokens: number
    tokensPerMinute: number
    instantDetections: number
    fastDetections: number
    averageDetectionLatency: number
    isTargetAchieved: boolean
  } {
    const instantCount = this.ultraFastTokens.filter((t) => t._detectionSpeed === "instant").length
    const fastCount = this.ultraFastTokens.filter((t) => t._detectionSpeed === "fast").length
    const avgLatency =
      this.ultraFastTokens.reduce((sum, t) => sum + t.detectionLatency, 0) / this.ultraFastTokens.length

    return {
      totalTokens: this.ultraFastTokens.length,
      tokensPerMinute: this.tokensPerMinuteCounter,
      instantDetections: instantCount,
      fastDetections: fastCount,
      averageDetectionLatency: avgLatency || 0,
      isTargetAchieved: this.tokensPerMinuteCounter >= 1000,
    }
  }

  async stopUltraFastMonitoring(): Promise<void> {
    if (this.monitor) {
      await this.monitor.stopMonitoring()
      this.monitor = null
    }

    pumpFunWebSocketAPI.disconnect()

    this.ultraFastTokens = []
    this.tokensPerMinuteCounter = 0

    console.log("🛑 Ultra-fast monitoring stopped")
  }
}

// إنشاء instance واحد للاستخدام العام
export const ultraFastIntegration = new UltraFastIntegration()
export type { UltraFastToken }
