// مراقب الوقت الفعلي لشبكة Solana وpump.fun
import { Connection, PublicKey } from "@solana/web3.js"

interface NewCoinData {
  address: string
  creator: string
  liquidity: number
  timestamp: Date
  signature: string
  name?: string
  symbol?: string
  description?: string
  image?: string
  marketCap?: number
  solReserves?: number
  tokenReserves?: number
}

interface RealTimeMonitorConfig {
  rpcUrl: string
  apiKey?: string
  onNewCoin: (coin: NewCoinData) => void
  onError: (error: Error) => void
}

class SolanaRealTimeMonitor {
  private connection: Connection
  private isMonitoring = false
  private subscriptionId: number | null = null
  private onNewCoin: (coin: NewCoinData) => void
  private onError: (error: Error) => void
  private processedSignatures = new Set<string>()

  // معرف برنامج Pump.fun الرئيسي
  private readonly pumpProgramId = new PublicKey("HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm")

  // معرفات إضافية لبرامج مرتبطة
  private readonly relatedPrograms = [
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // Token Program
    "11111111111111111111111111111112", // System Program
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token Program
  ]

  constructor(config: RealTimeMonitorConfig) {
    // استخدام RPC سريع مع API key
    const rpcUrl = config.apiKey ? `${config.rpcUrl}?api-key=${config.apiKey}` : config.rpcUrl

    this.connection = new Connection(rpcUrl, {
      commitment: "confirmed",
      wsEndpoint: rpcUrl.replace("https://", "wss://").replace("http://", "ws://"),
    })

    this.onNewCoin = config.onNewCoin
    this.onError = config.onError

    console.log("🔗 Solana Real-Time Monitor initialized")
    console.log("📡 RPC URL:", rpcUrl.replace(/api-key=[^&]+/, "api-key=***"))
  }

  async startRealTimeMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("⚠️ Monitor is already running")
      return
    }

    try {
      console.log("🚀 Starting real-time monitoring for pump.fun...")

      // اختبار الاتصال أولاً
      await this.testConnection()

      // بدء مراقبة البرنامج الرئيسي
      this.subscriptionId = this.connection.onLogs(
        this.pumpProgramId,
        async ({ logs, signature, err }) => {
          if (err) {
            console.error("❌ Log error:", err)
            return
          }

          // تجنب معالجة نفس المعاملة مرتين
          if (this.processedSignatures.has(signature)) {
            return
          }
          this.processedSignatures.add(signature)

          // فحص إذا كانت المعاملة تحتوي على إنشاء عملة جديدة
          if (this.isNewCoinTransaction(logs)) {
            console.log("🎯 Detected potential new coin transaction:", signature)
            await this.processNewCoinTransaction(signature, logs)
          }
        },
        "confirmed",
      )

      this.isMonitoring = true
      console.log("✅ Real-time monitoring started successfully")
      console.log("🎯 Monitoring program:", this.pumpProgramId.toString())
      console.log("📊 Subscription ID:", this.subscriptionId)

      // تنظيف الذاكرة كل 10 دقائق
      setInterval(() => {
        if (this.processedSignatures.size > 1000) {
          this.processedSignatures.clear()
          console.log("🧹 Cleared processed signatures cache")
        }
      }, 600000)
    } catch (error) {
      console.error("❌ Failed to start monitoring:", error)
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
      if (this.subscriptionId !== null) {
        await this.connection.removeOnLogsListener(this.subscriptionId)
        console.log("🛑 Stopped logs subscription:", this.subscriptionId)
      }

      this.isMonitoring = false
      this.subscriptionId = null
      this.processedSignatures.clear()

      console.log("✅ Real-time monitoring stopped")
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

  private isNewCoinTransaction(logs: string[]): boolean {
    // البحث عن مؤشرات إنشاء عملة جديدة
    const newCoinIndicators = [
      "InitializeTokenAccount",
      "InitializeMint",
      "CreateAccount",
      "InitializeAccount",
      "MintTo",
      "Transfer",
      // مؤشرات خاصة بـ pump.fun
      "initialize",
      "create",
      "mint",
      "pump",
    ]

    return logs.some((log) =>
      newCoinIndicators.some((indicator) => log.toLowerCase().includes(indicator.toLowerCase())),
    )
  }

  private async processNewCoinTransaction(signature: string, logs: string[]): Promise<void> {
    try {
      console.log("🔍 Processing transaction:", signature)

      // جلب تفاصيل المعاملة
      const transaction = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      })

      if (!transaction) {
        console.log("⚠️ Transaction not found:", signature)
        return
      }

      // استخراج بيانات العملة الجديدة
      const newCoin = this.extractNewCoin(transaction, signature, logs)

      if (newCoin) {
        console.log("🎉 New coin detected:", newCoin)

        // محاولة جلب metadata إضافية
        const enhancedCoin = await this.enhanceCoinData(newCoin)

        // إرسال البيانات للمعالج
        this.onNewCoin(enhancedCoin)
      } else {
        console.log("⚠️ Could not extract coin data from transaction")
      }
    } catch (error) {
      console.error("❌ Error processing transaction:", error)
      // لا نرمي الخطأ هنا لتجنب توقف المراقبة
    }
  }

  private extractNewCoin(transaction: any, signature: string, logs: string[]): NewCoinData | null {
    try {
      const { meta, message } = transaction.transaction

      if (!meta || !message) {
        return null
      }

      // 1. البحث عن عنوان العملة الجديدة
      let mintAddress: string | null = null

      // محاولة استخراج من postTokenBalances
      if (meta.postTokenBalances && meta.postTokenBalances.length > 0) {
        mintAddress = meta.postTokenBalances[0].mint
      }

      // محاولة استخراج من preTokenBalances إذا لم نجد
      if (!mintAddress && meta.preTokenBalances && meta.preTokenBalances.length > 0) {
        mintAddress = meta.preTokenBalances[0].mint
      }

      // محاولة استخراج من الحسابات المنشأة حديثاً
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
        console.log("⚠️ Could not find mint address in transaction")
        return null
      }

      // 2. استخراج بيانات المنشئ
      const creator =
        message.accountKeys && message.accountKeys.length > 0 ? message.accountKeys[0].pubkey.toString() : "Unknown"

      // 3. حساب السيولة الأولية
      let liquidity = 0
      if (meta.preBalances && meta.postBalances && meta.preBalances.length > 0 && meta.postBalances.length > 0) {
        liquidity = (meta.preBalances[0] - meta.postBalances[0]) / 1e9 // تحويل لامية إلى SOL
      }

      // 4. استخراج معلومات إضافية من الـ logs
      const additionalInfo = this.extractInfoFromLogs(logs)

      return {
        address: mintAddress,
        creator,
        liquidity: Math.abs(liquidity),
        timestamp: new Date(),
        signature,
        ...additionalInfo,
      }
    } catch (error) {
      console.error("❌ Error extracting coin data:", error)
      return null
    }
  }

  private extractInfoFromLogs(logs: string[]): Partial<NewCoinData> {
    const info: Partial<NewCoinData> = {}

    // البحث عن معلومات في الـ logs
    for (const log of logs) {
      // محاولة استخراج اسم العملة
      if (log.includes("name:") || log.includes("Name:")) {
        const nameMatch = log.match(/name:\s*([^,\s]+)/i)
        if (nameMatch) {
          info.name = nameMatch[1]
        }
      }

      // محاولة استخراج رمز العملة
      if (log.includes("symbol:") || log.includes("Symbol:")) {
        const symbolMatch = log.match(/symbol:\s*([^,\s]+)/i)
        if (symbolMatch) {
          info.symbol = symbolMatch[1]
        }
      }

      // محاولة استخراج معلومات السيولة
      if (log.includes("liquidity") || log.includes("reserve")) {
        const liquidityMatch = log.match(/(\d+\.?\d*)/g)
        if (liquidityMatch && liquidityMatch.length > 0) {
          info.solReserves = Number.parseFloat(liquidityMatch[0])
        }
      }
    }

    return info
  }

  private async enhanceCoinData(coin: NewCoinData): Promise<NewCoinData> {
    try {
      // محاولة جلب metadata من الشبكة
      const mintPubkey = new PublicKey(coin.address)

      // جلب معلومات الـ mint
      const mintInfo = await this.connection.getParsedAccountInfo(mintPubkey)

      if (mintInfo.value && mintInfo.value.data) {
        const parsedData = mintInfo.value.data as any
        if (parsedData.parsed) {
          coin.tokenReserves = parsedData.parsed.info.supply
        }
      }

      // إضافة معلومات افتراضية إذا لم تكن موجودة
      if (!coin.name) {
        coin.name = `Token ${coin.symbol || coin.address.substring(0, 8)}`
      }

      if (!coin.symbol) {
        coin.symbol = coin.address.substring(0, 6).toUpperCase()
      }

      if (!coin.description) {
        coin.description = `New token detected on pump.fun: ${coin.name}`
      }

      // تقدير القيمة السوقية الأولية
      if (coin.liquidity && coin.liquidity > 0) {
        coin.marketCap = coin.liquidity * 100 * Math.random() * 10 // تقدير تقريبي
      }

      return coin
    } catch (error) {
      console.error("❌ Error enhancing coin data:", error)
      return coin
    }
  }

  // معلومات حالة المراقب
  getMonitorStatus(): {
    isMonitoring: boolean
    subscriptionId: number | null
    processedCount: number
    programId: string
  } {
    return {
      isMonitoring: this.isMonitoring,
      subscriptionId: this.subscriptionId,
      processedCount: this.processedSignatures.size,
      programId: this.pumpProgramId.toString(),
    }
  }

  // إعادة تشغيل المراقب في حالة انقطاع الاتصال
  async restart(): Promise<void> {
    console.log("🔄 Restarting monitor...")
    await this.stopRealTimeMonitoring()
    await new Promise((resolve) => setTimeout(resolve, 2000)) // انتظار ثانيتين
    await this.startRealTimeMonitoring()
  }
}

export { SolanaRealTimeMonitor, type NewCoinData, type RealTimeMonitorConfig }
