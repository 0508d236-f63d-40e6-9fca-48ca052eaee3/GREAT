// API محسن لجلب البيانات من pump.fun عبر WebSocket و REST
class PumpFunWebSocketAPI {
  private wsConnection: WebSocket | null = null
  private restEndpoints = ["https://frontend-api.pump.fun", "https://api.pump.fun", "https://pump-api.fun"]
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 10000 // 10 ثوان فقط للبيانات الحديثة

  async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // محاولة الاتصال بـ WebSocket الخاص بـ pump.fun
        this.wsConnection = new WebSocket("wss://frontend-api.pump.fun/ws")

        this.wsConnection.onopen = () => {
          console.log("🔌 Connected to pump.fun WebSocket")

          // طلب الاشتراك في العملات الجديدة
          this.wsConnection?.send(
            JSON.stringify({
              type: "subscribe",
              channel: "new_coins",
              params: {
                limit: 1000,
                sort: "created_timestamp",
                order: "DESC",
              },
            }),
          )

          resolve()
        }

        this.wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleWebSocketMessage(data)
          } catch (error) {
            console.warn("WebSocket message parse error:", error)
          }
        }

        this.wsConnection.onerror = (error) => {
          console.error("pump.fun WebSocket error:", error)
          reject(error)
        }

        this.wsConnection.onclose = () => {
          console.log("🔌 pump.fun WebSocket disconnected, attempting reconnect...")
          setTimeout(() => this.reconnectWebSocket(), 5000)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleWebSocketMessage(data: any): void {
    if (data.type === "new_coin") {
      console.log("🎯 New coin from pump.fun WebSocket:", data.coin)
      // معالجة العملة الجديدة
      this.processNewCoin(data.coin)
    } else if (data.type === "coins_batch") {
      console.log(`📦 Received ${data.coins.length} coins from pump.fun`)
      data.coins.forEach((coin: any) => this.processNewCoin(coin))
    }
  }

  private processNewCoin(coin: any): void {
    // تخزين في الكاش
    this.cache.set(coin.mint, {
      data: coin,
      timestamp: Date.now(),
    })
  }

  private async reconnectWebSocket(): Promise<void> {
    try {
      await this.connectWebSocket()
    } catch (error) {
      console.error("WebSocket reconnection failed:", error)
      setTimeout(() => this.reconnectWebSocket(), 10000)
    }
  }

  async fetchLatestTokensBatch(limit = 100): Promise<any[]> {
    // محاولة جلب من عدة endpoints بشكل متوازي
    const fetchPromises = this.restEndpoints.map(async (endpoint) => {
      try {
        const response = await fetch(`${endpoint}/coins?limit=${limit}&sort=created_timestamp&order=DESC`, {
          headers: {
            Accept: "application/json",
            "User-Agent": "UltraFastPumpMonitor/1.0",
            Referer: "https://pump.fun/",
            Origin: "https://pump.fun",
          },
        })

        if (response.ok) {
          const data = await response.json()
          return Array.isArray(data) ? data : data.coins || []
        }
        return []
      } catch (error) {
        console.warn(`Failed to fetch from ${endpoint}:`, error)
        return []
      }
    })

    const results = await Promise.allSettled(fetchPromises)

    // دمج النتائج من جميع المصادر
    const allTokens: any[] = []
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value.length > 0) {
        allTokens.push(...result.value)
      }
    })

    // إزالة المكررات
    const uniqueTokens = this.removeDuplicates(allTokens)

    // فلترة العملات الجديدة فقط (آخر 10 دقائق)
    const tenMinutesAgo = Date.now() / 1000 - 600
    const recentTokens = uniqueTokens.filter((token) => token.created_timestamp > tenMinutesAgo)

    console.log(`📊 Fetched ${recentTokens.length} recent tokens from ${this.restEndpoints.length} sources`)
    return recentTokens
  }

  private removeDuplicates(tokens: any[]): any[] {
    const seen = new Set<string>()
    return tokens.filter((token) => {
      if (seen.has(token.mint)) return false
      seen.add(token.mint)
      return true
    })
  }

  async getTokenMetadata(mint: string): Promise<any> {
    // فحص الكاش أولاً
    const cached = this.cache.get(mint)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    // جلب من API
    for (const endpoint of this.restEndpoints) {
      try {
        const response = await fetch(`${endpoint}/coins/${mint}`, {
          headers: {
            Accept: "application/json",
            "User-Agent": "UltraFastPumpMonitor/1.0",
          },
        })

        if (response.ok) {
          const data = await response.json()
          this.cache.set(mint, { data, timestamp: Date.now() })
          return data
        }
      } catch (error) {
        continue
      }
    }

    return null
  }

  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }
}

export const pumpFunWebSocketAPI = new PumpFunWebSocketAPI()
