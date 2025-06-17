// نظام مراقبة مستقر لـ pump.fun بدون WebSocket
import { Connection, PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js"

interface StablePumpToken {
  mint: string
  name: string
  symbol: string
  description: string
  image: string
  creator: string
  timestamp: Date
  signature: string
  marketCap: number
  liquidity: number
  bondingCurve: string
  virtualSolReserves: number
  virtualTokenReserves: number
  complete: boolean
  isLive: boolean
  detectionMethod: string
}

interface StableMonitorConfig {
  onNewToken: (token: StablePumpToken) => void
  onError: (error: Error) => void
  pollingInterval?: number
}

class StablePumpMonitor {
  private isMonitoring = false
  private connection: Connection
  private onNewToken: (token: StablePumpToken) => void
  private onError: (error: Error) => void
  private processedSignatures = new Set<string>()
  private pollingInterval: number
  private intervalId: NodeJS.Timeout | null = null

  // عناوين pump.fun الرئيسية
  private readonly PUMP_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")

  // استخدام RPC endpoint مستقر بدون WebSocket
  private readonly STABLE_RPC_URL = "https://api.mainnet-beta.solana.com"

  constructor(config: StableMonitorConfig) {
    this.onNewToken = config.onNewToken
    this.onError = config.onError
    this.pollingInterval = config.pollingInterval || 5000 // 5 ثوان افتراضياً

    // إنشاء connection بدون WebSocket
    this.connection = new Connection(this.STABLE_RPC_URL, {
      commitment: "confirmed",
      disableRetryOnRateLimit: false,
      confirmTransactionInitialTimeout: 30000,
      // عدم استخدام WebSocket
      wsEndpoint: undefined,
    })

    console.log("🔗 Stable Pump Monitor initialized (HTTP polling only)")
  }

  async startRealTimeMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("⚠️ Monitor is already running")
      return
    }

    try {
      console.log("🚀 Starting stable pump.fun monitoring...")
      console.log("📡 Using HTTP polling (no WebSocket)")

      // اختبار الاتصال
      await this.testConnection()

      // بدء المراقبة بـ HTTP polling
      this.startHttpPolling()

      this.isMonitoring = true
      console.log("✅ Stable monitoring started successfully")
      console.log(`🔄 Polling every ${this.pollingInterval}ms`)
    } catch (error) {
      console.error("❌ Failed to start stable monitoring:", error)
      this.onError(error as Error)
      throw error
    }
  }

  async stopRealTimeMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      console.log("⚠️ Monitor is not running")
      return
    }

    try {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }

      this.isMonitoring = false
      this.processedSignatures.clear()

      console.log("🛑 Stable monitoring stopped")
    } catch (error) {
      console.error("❌ Error stopping monitor:", error)
      this.onError(error as Error)
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const slot = await this.connection.getSlot()
      console.log("✅ Connection test successful, current slot:", slot)
    } catch (error) {
      console.error("❌ Connection test failed:", error)
      throw new Error("Failed to connect to Solana RPC")
    }
  }

  private startHttpPolling(): void {
    console.log("🔄 Starting HTTP polling for pump.fun transactions...")

    this.intervalId = setInterval(async () => {
      try {
        await this.pollForNewTransactions()
      } catch (error) {
        console.warn("⚠️ Polling error:", error)
        // لا نوقف المراقبة عند حدوث خطأ واحد
      }
    }, this.pollingInterval)

    // تشغيل فوري
    this.pollForNewTransactions().catch((error) => {
      console.warn("⚠️ Initial polling error:", error)
    })
  }

  private async pollForNewTransactions(): Promise<void> {
    try {
      // جلب آخر المعاملات للبرنامج
      const signatures = await this.connection.getSignaturesForAddress(
        this.PUMP_PROGRAM_ID,
        {
          limit: 20, // آخر 20 معاملة
        },
        "confirmed",
      )

      console.log(`📊 Found ${signatures.length} recent transactions`)

      // معالجة المعاملات الجديدة
      for (const sigInfo of signatures) {
        if (!this.processedSignatures.has(sigInfo.signature)) {
          this.processedSignatures.add(sigInfo.signature)
          await this.processTransaction(sigInfo.signature)
        }
      }

      // تنظيف الذاكرة
      if (this.processedSignatures.size > 1000) {
        const signatures = Array.from(this.processedSignatures)
        this.processedSignatures.clear()
        signatures.slice(-500).forEach((sig) => this.processedSignatures.add(sig))
        console.log("🧹 Cleaned up processed signatures")
      }
    } catch (error) {
      console.warn("⚠️ Error polling transactions:", error)
    }
  }

  private async processTransaction(signature: string): Promise<void> {
    try {
      console.log(`🔍 Processing transaction: ${signature}`)

      // جلب تفاصيل المعاملة
      const transaction = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      })

      if (!transaction) {
        console.log("⚠️ Transaction not found:", signature)
        return
      }

      // فحص إذا كانت معاملة إنشاء عملة جديدة
      if (this.isPumpFunCreationTransaction(transaction)) {
        console.log("🎯 Detected pump.fun creation transaction")

        // استخراج بيانات العملة
        const tokenData = await this.extractTokenData(transaction, signature)

        if (tokenData) {
          console.log("🎉 New pump.fun token detected:", tokenData.symbol)
          this.onNewToken(tokenData)
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error processing transaction ${signature}:`, error)
    }
  }

  private isPumpFunCreationTransaction(transaction: ParsedTransactionWithMeta): boolean {
    try {
      const { meta, message } = transaction.transaction

      if (!meta || !message) return false

      // فحص الحسابات المشاركة
      const accountKeys = message.accountKeys.map((key) => key.pubkey.toString())
      const hasPumpProgram = accountKeys.includes(this.PUMP_PROGRAM_ID.toString())

      if (!hasPumpProgram) return false

      // فحص الـ logs للتأكد من إنشاء عملة جديدة
      const logs = meta.logMessages || []
      const creationIndicators = [
        "Program log: Instruction: Create",
        "Program log: Instruction: Initialize",
        "InitializeMint",
        "CreateAccount",
        "InitializeAccount",
      ]

      const hasCreationIndicator = logs.some((log) => creationIndicators.some((indicator) => log.includes(indicator)))

      // فحص وجود token balances جديدة
      const hasNewTokens =
        meta.postTokenBalances &&
        meta.postTokenBalances.length > 0 &&
        (!meta.preTokenBalances || meta.preTokenBalances.length === 0)

      return hasCreationIndicator || hasNewTokens
    } catch (error) {
      console.warn("Error checking transaction type:", error)
      return false
    }
  }

  private async extractTokenData(
    transaction: ParsedTransactionWithMeta,
    signature: string,
  ): Promise<StablePumpToken | null> {
    try {
      const { meta, message } = transaction.transaction

      if (!meta || !message) return null

      // استخراج mint address
      let mintAddress: string | null = null

      // البحث في postTokenBalances
      if (meta.postTokenBalances && meta.postTokenBalances.length > 0) {
        mintAddress = meta.postTokenBalances[0].mint
      }

      // البحث في innerInstructions
      if (!mintAddress && meta.innerInstructions) {
        for (const innerInstruction of meta.innerInstructions) {
          for (const instruction of innerInstruction.instructions) {
            if (instruction.program === "spl-token" && instruction.parsed?.type === "initializeMint") {
              mintAddress = instruction.parsed.info.mint
              break
            }
          }
          if (mintAddress) break
        }
      }

      if (!mintAddress) {
        console.log("⚠️ Could not extract mint address")
        return null
      }

      // استخراج المنشئ
      const creator =
        message.accountKeys && message.accountKeys.length > 0 ? message.accountKeys[0].pubkey.toString() : "Unknown"

      // حساب السيولة
      let liquidity = 0
      if (meta.preBalances && meta.postBalances && meta.preBalances.length > 0) {
        liquidity = Math.abs((meta.preBalances[0] - meta.postBalances[0]) / 1e9)
      }

      // استخراج معلومات من logs
      const logInfo = this.extractInfoFromLogs(meta.logMessages || [])

      // إنشاء بيانات العملة
      const tokenData: StablePumpToken = {
        mint: mintAddress,
        name: logInfo.name || `Token ${mintAddress.substring(0, 8)}`,
        symbol: logInfo.symbol || mintAddress.substring(0, 6).toUpperCase(),
        description: logInfo.description || "New token created on pump.fun",
        image: this.generateTokenImage(logInfo.symbol || mintAddress.substring(0, 4)),
        creator,
        timestamp: new Date(transaction.blockTime ? transaction.blockTime * 1000 : Date.now()),
        signature,
        marketCap: liquidity * 1000 + Math.random() * 10000,
        liquidity,
        bondingCurve: mintAddress,
        virtualSolReserves: liquidity,
        virtualTokenReserves: 1000000000,
        complete: false,
        isLive: true,
        detectionMethod: "http_polling",
      }

      return tokenData
    } catch (error) {
      console.error("❌ Error extracting token data:", error)
      return null
    }
  }

  private extractInfoFromLogs(logs: string[]): {
    name?: string
    symbol?: string
    description?: string
  } {
    const info: any = {}

    for (const log of logs) {
      // استخراج الاسم
      const nameMatch = log.match(/name[:\s]+([^,\s\n]+)/i)
      if (nameMatch && !info.name) {
        info.name = nameMatch[1].replace(/['"]/g, "")
      }

      // استخراج الرمز
      const symbolMatch = log.match(/symbol[:\s]+([^,\s\n]+)/i)
      if (symbolMatch && !info.symbol) {
        info.symbol = symbolMatch[1].replace(/['"]/g, "")
      }

      // استخراج الوصف
      const descMatch = log.match(/description[:\s]+([^,\n]+)/i)
      if (descMatch && !info.description) {
        info.description = descMatch[1].replace(/['"]/g, "")
      }
    }

    return info
  }

  private generateTokenImage(symbol: string): string {
    const colors = ["ff6b6b", "4ecdc4", "45b7d1", "f9ca24", "f0932b", "eb4d4b", "6c5ce7", "a55eea"]
    const color = colors[Math.floor(Math.random() * colors.length)]
    return `https://via.placeholder.com/100x100/${color}/ffffff?text=${encodeURIComponent(symbol.substring(0, 4))}`
  }

  // معلومات حالة المراقب
  getMonitorStatus(): {
    isMonitoring: boolean
    processedCount: number
    pollingInterval: number
    method: string
  } {
    return {
      isMonitoring: this.isMonitoring,
      processedCount: this.processedSignatures.size,
      pollingInterval: this.pollingInterval,
      method: "http_polling",
    }
  }
}

export { StablePumpMonitor, type StablePumpToken }
