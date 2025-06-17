// جلب مستمر من pump.fun مباشرة - بدون مسح كل Solana
class PumpFunContinuousFetcher {
  private isRunning = false
  private lastFetchTimestamp = 0
  private fetchInterval = 3000 // كل 3 ثوان
  private onNewTokens: (tokens: any[]) => void
  private processedMints = new Set<string>()

  // endpoints pump.fun المتعددة للموثوقية
  private endpoints = [
    "https://frontend-api.pump.fun/coins",
    "https://api.pump.fun/coins",
    "https://pump-api.fun/coins",
  ]

  constructor(onNewTokens: (tokens: any[]) => void) {
    this.onNewTokens = onNewTokens
    console.log("🔄 Pump.fun Continuous Fetcher initialized")
  }

  async startContinuousFetching(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Continuous fetching already running")
      return
    }

    console.log("🚀 Starting continuous pump.fun fetching...")
    console.log("🎯 Strategy: Fetch from pump.fun every 3 seconds")

    this.isRunning = true
    this.lastFetchTimestamp = Date.now() / 1000

    // بدء الجلب المستمر
    this.continuousFetchLoop()
  }

  private async continuousFetchLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.fetchLatestTokens()
        await this.sleep(this.fetchInterval)
      } catch (error) {
        console.warn("Continuous fetch error:", error)
        await this.sleep(5000) // انتظار أطول في حالة الخطأ
      }
    }
  }

  private async fetchLatestTokens(): Promise<void> {
    const startTime = Date.now()

    // محاولة جلب من عدة endpoints
    for (const endpoint of this.endpoints) {
      try {
        const response = await fetch(
          `${endpoint}?offset=0&limit=100&sort=created_timestamp&order=DESC&includeNsfw=false`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "ContinuousPumpFetcher/1.0",
              Referer: "https://pump.fun/",
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          const tokens = Array.isArray(data) ? data : data.coins || []

          if (tokens.length > 0) {
            // فلترة العملات الجديدة فقط
            const newTokens = tokens.filter((token) => {
              // العملات المنشأة بعد آخر جلب
              const isNew = token.created_timestamp > this.lastFetchTimestamp
              const notProcessed = !this.processedMints.has(token.mint)
              const isPumpFun = this.isPumpFunToken(token)

              return isNew && notProcessed && isPumpFun
            })

            if (newTokens.length > 0) {
              console.log(`🎯 Continuous: Found ${newTokens.length} new tokens from ${endpoint}`)

              // تسجيل العملات المعالجة
              newTokens.forEach((token) => {
                this.processedMints.add(token.mint)
              })

              // إرسال العملات الجديدة
              this.onNewTokens(
                newTokens.map((token) => ({
                  ...token,
                  detection_method: "continuous_api",
                  detection_latency: Date.now() - startTime,
                })),
              )

              // تحديث timestamp
              this.lastFetchTimestamp = Math.max(...newTokens.map((t) => t.created_timestamp))
            }

            // نجح الجلب، لا نحتاج لتجربة endpoints أخرى
            break
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${endpoint}:`, error)
        continue
      }
    }
  }

  private isPumpFunToken(token: any): boolean {
    return (
      token.mint &&
      token.bonding_curve &&
      token.virtual_sol_reserves !== undefined &&
      token.creator &&
      token.created_timestamp
    )
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  stopContinuousFetching(): void {
    this.isRunning = false
    console.log("🛑 Continuous pump.fun fetching stopped")
  }

  getStats(): {
    isRunning: boolean
    processedTokens: number
    lastFetchTimestamp: number
    fetchInterval: number
  } {
    return {
      isRunning: this.isRunning,
      processedTokens: this.processedMints.size,
      lastFetchTimestamp: this.lastFetchTimestamp,
      fetchInterval: this.fetchInterval,
    }
  }

  // تعديل فترة الجلب
  setFetchInterval(intervalMs: number): void {
    this.fetchInterval = Math.max(1000, intervalMs) // حد أدنى ثانية واحدة
    console.log(`🔄 Fetch interval updated to ${this.fetchInterval}ms`)
  }
}

export { PumpFunContinuousFetcher }
