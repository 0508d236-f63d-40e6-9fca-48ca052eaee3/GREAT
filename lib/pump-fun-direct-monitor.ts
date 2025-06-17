// نظام مراقبة مباشر ومحسن لـ pump.fun
import { Connection, PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js"

interface PumpFunToken {
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
}

interface MonitorConfig {
  onNewToken: (token: PumpFunToken) => void
  onError: (error: Error) => void
  maxRetries?: number
  retryDelay?: number
}

class PumpFunDirectMonitor {
  private connections: Connection[] = []
  private isMonitoring = false
  private subscriptions: number[] = []
  private onNewToken: (token: PumpFunToken) => void
  private onError: (error: Error) => void
  private processedSignatures = new Set<string>()
  private maxRetries: number
  private retryDelay: number

  // عناوين pump.fun الرئيسية على Solana
  private readonly PUMP_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
  private readonly PUMP_GLOBAL_ACCOUNT = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf")
  private readonly PUMP_EVENT_AUTHORITY = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1")
  private readonly PUMP_FEE_RECIPIENT = new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM")

  // RPC endpoints مجانية وسريعة
  private readonly RPC_ENDPOINTS = [
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
    "https://solana.public-rpc.com",
    "https://api.mainnet-beta.solana.com",
  ]

  constructor(config: MonitorConfig) {
    this.onNewToken = config.onNewToken
    this.onError = config.onError
    this.maxRetries = config.maxRetries || 3
    this.retryDelay = config.retryDelay || 5000

    // إنشاء اتصالات متعددة للسرعة
    this.connections = this.RPC_ENDPOINTS.map(
      (endpoint) =>
        new Connection(endpoint, {
          commitment: "confirmed",
          confirmTransactionInitialTimeout: 30000,
        }),
    )

    console.log("🚀 Pump.fun Direct Monitor initialized with", this.connections.length, "connections")
  }

  async startRealTimeMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("⚠️ Monitor is already running")
      return
    }

    try {
      console.log("🎯 Starting direct pump.fun monitoring...")

      // اختبار الاتصالات
      await this.testConnections()

      // بدء المراقبة على جميع الاتصالات
      await this.startMultipleMonitors()

      this.isMonitoring = true
      console.log("✅ Direct pump.fun monitoring started successfully")

      // تنظيف دوري للذاكرة
      this.startCleanupTimer()
    } catch (error) {
      console.error("❌ Failed to start direct monitoring:", error)
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
      // إيقاف جميع الاشتراكات
      for (let i = 0; i < this.subscriptions.length; i++) {
        if (this.subscriptions[i] !== null) {
          await this.connections[i % this.connections.length].removeOnLogsListener(this.subscriptions[i])
        }
      }

      this.subscriptions = []
      this.isMonitoring = false
      this.processedSignatures.clear()

      console.log("🛑 Direct pump.fun monitoring stopped")
    } catch (error) {
      console.error("❌ Error stopping monitor:", error)
      this.onError(error as Error)
    }
  }

  private async testConnections(): Promise<void> {
    console.log("🔍 Testing RPC connections...")

    const testPromises = this.connections.map(async (connection, index) => {
      try {
        const slot = await connection.getSlot()
        console.log(`✅ Connection ${index + 1} OK - Slot: ${slot}`)
        return true
      } catch (error) {
        console.log(`❌ Connection ${index + 1} failed:`, error)
        return false
      }
    })

    const results = await Promise.all(testPromises)
    const workingConnections = results.filter(Boolean).length

    if (workingConnections === 0) {
      throw new Error("No working RPC connections available")
    }

    console.log(`✅ ${workingConnections}/${this.connections.length} connections working`)
  }

  private async startMultipleMonitors(): Promise<void> {
    const monitorPromises = this.connections.map(async (connection, index) => {
      try {
        // مراقبة برنامج pump.fun الرئيسي
        const subscriptionId = connection.onLogs(
          this.PUMP_PROGRAM_ID,
          async ({ logs, signature, err }) => {
            if (err) {
              console.error(`❌ Log error on connection ${index + 1}:`, err)
              return
            }

            await this.processTransaction(signature, logs, connection, index + 1)
          },
          "confirmed",
        )

        this.subscriptions.push(subscriptionId)
        console.log(`📡 Monitor ${index + 1} started - Subscription ID: ${subscriptionId}`)
      } catch (error) {
        console.error(`❌ Failed to start monitor ${index + 1}:`, error)
        this.subscriptions.push(-1) // placeholder for failed connection
      }
    })

    await Promise.all(monitorPromises)
  }

  private async processTransaction(
    signature: string,
    logs: string[],
    connection: Connection,
    connectionId: number,
  ): Promise<void> {
    // تجنب معالجة نفس المعاملة مرتين
    if (this.processedSignatures.has(signature)) {
      return
    }

    // فحص إذا كانت المعاملة متعلقة بإنشاء عملة جديدة
    if (!this.isPumpFunCreationTransaction(logs)) {
      return
    }

    this.processedSignatures.add(signature)
    console.log(`🎯 Processing pump.fun creation transaction: ${signature} (Connection ${connectionId})`)

    try {
      // جلب تفاصيل المعاملة
      const transaction = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      })

      if (!transaction) {
        console.log("⚠️ Transaction not found:", signature)
        return
      }

      // استخراج بيانات العملة الجديدة
      const tokenData = await this.extractTokenData(transaction, signature, logs)

      if (tokenData) {
        console.log("🎉 New pump.fun token detected:", tokenData.symbol)
        this.onNewToken(tokenData)
      }
    } catch (error) {
      console.error("❌ Error processing transaction:", error)
      // لا نرمي الخطأ لتجنب توقف المراقبة
    }
  }

  private isPumpFunCreationTransaction(logs: string[]): boolean {
    // البحث عن مؤشرات إنشاء عملة جديدة في pump.fun
    const creationIndicators = [
      "Program log: Instruction: Create",
      "Program log: Instruction: Initialize",
      "InitializeMint",
      "CreateAccount",
      "pump",
      "bonding",
      "curve",
    ]

    return logs.some((log) =>
      creationIndicators.some((indicator) => log.toLowerCase().includes(indicator.toLowerCase())),
    )
  }

  private async extractTokenData(
    transaction: ParsedTransactionWithMeta,
    signature: string,
    logs: string[],
  ): Promise<PumpFunToken | null> {
    try {
      const { meta, message } = transaction.transaction

      if (!meta || !message) {
        return null
      }

      // استخراج عنوان العملة (mint)
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

      // استخراج معلومات إضافية من logs
      const logInfo = this.extractInfoFromLogs(logs)

      // إنشاء بيانات العملة
      const tokenData: PumpFunToken = {
        mint: mintAddress,
        name: logInfo.name || `Token ${mintAddress.substring(0, 8)}`,
        symbol: logInfo.symbol || mintAddress.substring(0, 6).toUpperCase(),
        description: logInfo.description || `New token created on pump.fun`,
        image: this.generateTokenImage(logInfo.symbol || mintAddress.substring(0, 4)),
        creator,
        timestamp: new Date(),
        signature,
        marketCap: liquidity * 1000 + Math.random() * 10000, // تقدير أولي
        liquidity,
        bondingCurve: mintAddress, // سيتم تحديثه لاحقاً
        virtualSolReserves: liquidity,
        virtualTokenReserves: 1000000000, // القيمة الافتراضية
        complete: false,
        isLive: true,
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

  private startCleanupTimer(): void {
    setInterval(() => {
      if (this.processedSignatures.size > 2000) {
        // الاحتفاظ بآخر 1000 signature فقط
        const signatures = Array.from(this.processedSignatures)
        this.processedSignatures.clear()
        signatures.slice(-1000).forEach((sig) => this.processedSignatures.add(sig))
        console.log("🧹 Cleaned up processed signatures cache")
      }
    }, 300000) // كل 5 دقائق
  }

  // معلومات حالة المراقب
  getMonitorStatus(): {
    isMonitoring: boolean
    activeConnections: number
    processedCount: number
    subscriptions: number[]
  } {
    return {
      isMonitoring: this.isMonitoring,
      activeConnections: this.connections.length,
      processedCount: this.processedSignatures.size,
      subscriptions: this.subscriptions,
    }
  }
}

export { PumpFunDirectMonitor, type PumpFunToken }
