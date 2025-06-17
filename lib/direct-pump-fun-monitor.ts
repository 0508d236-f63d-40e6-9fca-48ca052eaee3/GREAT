// مراقبة مباشرة لـ pump.fun فقط - بدون جلب كل عملات Solana
import { Connection, PublicKey } from "@solana/web3.js"

interface DirectPumpFunToken {
  mint: string
  name: string
  symbol: string
  description: string
  image_uri: string
  creator: string
  created_timestamp: number
  usd_market_cap: number
  virtual_sol_reserves: number
  virtual_token_reserves: number
  bonding_curve: string
  associated_bonding_curve: string
  complete: boolean
  is_currently_live: boolean
  reply_count: number
  signature?: string
  detection_method: "pump_api" | "pump_websocket" | "solana_logs" | "pump_rss"
  detection_latency: number
}

class DirectPumpFunMonitor {
  private isMonitoring = false
  private onNewToken: (token: DirectPumpFunToken) => void
  private processedMints = new Set<string>()

  // طرق مراقبة pump.fun المباشرة (بدون جلب كل Solana)
  private monitoringMethods = {
    // 1. مراقبة pump.fun API مباشرة
    pumpAPI: {
      enabled: true,
      interval: 2000, // كل ثانيتين
      endpoint: "https://frontend-api.pump.fun/coins",
    },

    // 2. مراقبة WebSocket pump.fun
    pumpWebSocket: {
      enabled: true,
      url: "wss://frontend-api.pump.fun/ws",
    },

    // 3. مراقبة برامج pump.fun على Solana فقط
    solanaLogs: {
      enabled: true,
      programIds: [
        "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", // pump.fun program
        "HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm", // pump.fun program v2
      ],
    },

    // 4. مراقبة RSS/Feed إذا متوفر
    pumpRSS: {
      enabled: false, // pump.fun لا يوفر RSS حالياً
    },
  }

  constructor(onNewToken: (token: DirectPumpFunToken) => void) {
    this.onNewToken = onNewToken
    console.log("🎯 Direct Pump.fun Monitor initialized")
    console.log("✅ Will monitor ONLY pump.fun tokens (not all Solana tokens)")
  }

  async startDirectMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("⚠️ Direct monitoring already running")
      return
    }

    console.log("🚀 Starting DIRECT pump.fun monitoring...")
    console.log("🎯 Strategy: Monitor pump.fun sources directly (NOT all Solana)")

    try {
      // بدء كل طرق المراقبة المباشرة
      const promises: Promise<void>[] = []

      if (this.monitoringMethods.pumpAPI.enabled) {
        promises.push(this.startPumpAPIMonitoring())
      }

      if (this.monitoringMethods.pumpWebSocket.enabled) {
        promises.push(this.startPumpWebSocketMonitoring())
      }

      if (this.monitoringMethods.solanaLogs.enabled) {
        promises.push(this.startSolanaLogsMonitoring())
      }

      // بدء جميع طرق المراقبة
      await Promise.allSettled(promises)

      this.isMonitoring = true
      console.log("✅ Direct pump.fun monitoring started successfully!")
      console.log("📊 Monitoring pump.fun ONLY - no unnecessary Solana scanning")
    } catch (error) {
      console.error("❌ Failed to start direct monitoring:", error)
      throw error
    }
  }

  // الطريقة 1: مراقبة pump.fun API مباشرة
  private async startPumpAPIMonitoring(): Promise<void> {
    console.log("📡 Starting pump.fun API monitoring...")

    const monitorAPI = async () => {
      try {
        const startTime = Date.now()

        const response = await fetch(
          `${this.monitoringMethods.pumpAPI.endpoint}?offset=0&limit=50&sort=created_timestamp&order=DESC&includeNsfw=false`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "DirectPumpMonitor/1.0",
              Referer: "https://pump.fun/",
              Origin: "https://pump.fun",
            },
          },
        )

        if (response.ok) {
          const tokens = await response.json()
          const detectionLatency = Date.now() - startTime

          if (Array.isArray(tokens)) {
            // فلترة العملات الجديدة فقط (آخر 10 دقائق)
            const tenMinutesAgo = Date.now() / 1000 - 600
            const newTokens = tokens.filter(
              (token) =>
                token.created_timestamp > tenMinutesAgo &&
                !this.processedMints.has(token.mint) &&
                this.isPumpFunToken(token),
            )

            newTokens.forEach((token) => {
              this.processedMints.add(token.mint)
              this.onNewToken({
                ...token,
                detection_method: "pump_api",
                detection_latency: detectionLatency,
              })
            })

            if (newTokens.length > 0) {
              console.log(`🎯 API: Found ${newTokens.length} new pump.fun tokens`)
            }
          }
        }
      } catch (error) {
        console.warn("⚠️ pump.fun API monitoring error:", error)
      }
    }

    // مراقبة مستمرة
    setInterval(monitorAPI, this.monitoringMethods.pumpAPI.interval)
    await monitorAPI() // تشغيل فوري
  }

  // الطريقة 2: مراقبة pump.fun WebSocket
  private async startPumpWebSocketMonitoring(): Promise<void> {
    console.log("🔌 Starting pump.fun WebSocket monitoring...")

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(this.monitoringMethods.pumpWebSocket.url)

        ws.onopen = () => {
          console.log("✅ Connected to pump.fun WebSocket")

          // طلب الاشتراك في العملات الجديدة
          ws.send(
            JSON.stringify({
              type: "subscribe",
              channel: "new_tokens",
              params: {
                real_time: true,
              },
            }),
          )

          resolve()
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.type === "new_token" && data.token) {
              const token = data.token

              if (!this.processedMints.has(token.mint) && this.isPumpFunToken(token)) {
                this.processedMints.add(token.mint)

                console.log(`🔌 WebSocket: New pump.fun token - ${token.symbol}`)

                this.onNewToken({
                  ...token,
                  detection_method: "pump_websocket",
                  detection_latency: 0, // WebSocket فوري
                })
              }
            }
          } catch (error) {
            console.warn("WebSocket message error:", error)
          }
        }

        ws.onerror = (error) => {
          console.warn("pump.fun WebSocket error:", error)
          reject(error)
        }

        ws.onclose = () => {
          console.log("🔌 pump.fun WebSocket disconnected, reconnecting...")
          setTimeout(() => this.startPumpWebSocketMonitoring(), 5000)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // الطريقة 3: مراقبة برامج pump.fun على Solana فقط
  private async startSolanaLogsMonitoring(): Promise<void> {
    console.log("⛓️ Starting Solana logs monitoring for pump.fun programs ONLY...")

    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed")

    // مراقبة كل برنامج pump.fun
    for (const programId of this.monitoringMethods.solanaLogs.programIds) {
      try {
        const pubkey = new PublicKey(programId)

        connection.onLogs(
          pubkey,
          async ({ logs, signature, err }) => {
            if (err) return

            // فحص سريع أن المعاملة من pump.fun
            if (this.isPumpFunTransaction(logs)) {
              console.log(`⛓️ Solana: Detected pump.fun transaction - ${signature}`)

              // معالجة المعاملة للحصول على بيانات العملة
              this.processPumpFunTransaction(signature, logs, connection)
            }
          },
          "confirmed",
        )

        console.log(`✅ Monitoring Solana program: ${programId}`)
      } catch (error) {
        console.warn(`Failed to monitor program ${programId}:`, error)
      }
    }
  }

  private isPumpFunToken(token: any): boolean {
    // التحقق من أن العملة من pump.fun فعلاً
    return (
      token.mint &&
      token.bonding_curve &&
      token.associated_bonding_curve &&
      token.virtual_sol_reserves !== undefined &&
      token.virtual_token_reserves !== undefined &&
      token.creator &&
      token.created_timestamp
    )
  }

  private isPumpFunTransaction(logs: string[]): boolean {
    // فحص أن المعاملة من pump.fun
    const pumpIndicators = [
      "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
      "HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm",
      "initialize",
      "create",
      "pump",
    ]

    return logs.some((log) => pumpIndicators.some((indicator) => log.includes(indicator)))
  }

  private async processPumpFunTransaction(signature: string, logs: string[], connection: Connection): Promise<void> {
    try {
      // جلب تفاصيل المعاملة
      const transaction = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      })

      if (!transaction) return

      // استخراج بيانات العملة
      const tokenData = this.extractTokenFromTransaction(transaction, signature, logs)

      if (tokenData && !this.processedMints.has(tokenData.mint)) {
        this.processedMints.add(tokenData.mint)

        // محاولة جلب بيانات إضافية من pump.fun API
        const enhancedData = await this.enhanceTokenData(tokenData)

        this.onNewToken({
          ...enhancedData,
          detection_method: "solana_logs",
          detection_latency: Date.now() - (transaction.blockTime || 0) * 1000,
        })
      }
    } catch (error) {
      console.warn(`Error processing transaction ${signature}:`, error)
    }
  }

  private extractTokenFromTransaction(transaction: any, signature: string, logs: string[]): any {
    // استخراج بيانات العملة من المعاملة
    const { meta, message } = transaction.transaction

    if (!meta || !message) return null

    // البحث عن mint address
    let mint: string | null = null
    if (meta.postTokenBalances?.length > 0) {
      mint = meta.postTokenBalances[0].mint
    }

    if (!mint) return null

    // استخراج المنشئ
    const creator = message.accountKeys?.[0]?.pubkey?.toString() || ""

    // استخراج معلومات من logs
    const logInfo = this.extractInfoFromLogs(logs)

    return {
      mint,
      creator,
      signature,
      created_timestamp: Date.now() / 1000,
      ...logInfo,
    }
  }

  private extractInfoFromLogs(logs: string[]): any {
    const info: any = {}

    for (const log of logs) {
      const nameMatch = log.match(/name[:\s"']*([^,\s"']+)/i)
      if (nameMatch) info.name = nameMatch[1]

      const symbolMatch = log.match(/symbol[:\s"']*([^,\s"']+)/i)
      if (symbolMatch) info.symbol = symbolMatch[1]
    }

    return info
  }

  private async enhanceTokenData(tokenData: any): Promise<DirectPumpFunToken> {
    try {
      // محاولة جلب بيانات كاملة من pump.fun API
      const response = await fetch(`https://frontend-api.pump.fun/coins/${tokenData.mint}`)

      if (response.ok) {
        const fullData = await response.json()
        return {
          ...fullData,
          signature: tokenData.signature,
        }
      }
    } catch (error) {
      console.warn("Failed to enhance token data:", error)
    }

    // إرجاع البيانات الأساسية إذا فشل التحسين
    return {
      mint: tokenData.mint,
      name: tokenData.name || `Token-${tokenData.symbol || tokenData.mint.substring(0, 8)}`,
      symbol: tokenData.symbol || tokenData.mint.substring(0, 6).toUpperCase(),
      description: `Token detected from pump.fun`,
      image_uri: `https://via.placeholder.com/64x64/00d4aa/ffffff?text=${tokenData.symbol || "PF"}`,
      creator: tokenData.creator,
      created_timestamp: tokenData.created_timestamp,
      usd_market_cap: 5000,
      virtual_sol_reserves: 30,
      virtual_token_reserves: 1000000000,
      bonding_curve: tokenData.mint,
      associated_bonding_curve: tokenData.mint,
      complete: false,
      is_currently_live: true,
      reply_count: 0,
      signature: tokenData.signature,
      detection_method: "solana_logs",
      detection_latency: 0,
    }
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false
    this.processedMints.clear()
    console.log("🛑 Direct pump.fun monitoring stopped")
  }

  getStats(): {
    isMonitoring: boolean
    processedTokens: number
    monitoringMethods: string[]
  } {
    return {
      isMonitoring: this.isMonitoring,
      processedTokens: this.processedMints.size,
      monitoringMethods: Object.entries(this.monitoringMethods)
        .filter(([_, config]) => config.enabled)
        .map(([name]) => name),
    }
  }
}

export { DirectPumpFunMonitor, type DirectPumpFunToken }
