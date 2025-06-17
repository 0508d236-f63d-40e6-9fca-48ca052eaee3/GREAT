// مراقب محدد لعملات pump.fun فقط
import { Connection, PublicKey } from "@solana/web3.js"

interface PumpFunTokenData {
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
  bondingCurve?: string
  associatedBondingCurve?: string
  isPumpFunVerified: boolean
  pumpFunData?: any
}

class PumpFunSpecificMonitor {
  private connection: Connection
  private isMonitoring = false
  private subscriptionId: number | null = null
  private onNewCoin: (coin: PumpFunTokenData) => void
  private onError: (error: Error) => void
  private processedSignatures = new Set<string>()

  // معرفات pump.fun الصحيحة والمحدثة
  private readonly PUMP_FUN_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
  private readonly PUMP_FUN_PROGRAM_ID_V2 = new PublicKey("HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm")

  // عناوين pump.fun المعروفة
  private readonly PUMP_FUN_ADDRESSES = [
    "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", // البرنامج الرئيسي
    "HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm", // البرنامج الثاني
    "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1", // Global account
    "4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf", // Fee recipient
    "TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM", // Event authority
  ]

  // أنماط المعاملات الخاصة بـ pump.fun
  private readonly PUMP_FUN_INSTRUCTION_PATTERNS = [
    "initialize", // إنشاء عملة جديدة
    "create", // إنشاء
    "buy", // شراء
    "sell", // بيع
    "withdraw", // سحب
    "set_params", // تعديل المعاملات
  ]

  // أنماط الـ logs الخاصة بـ pump.fun
  private readonly PUMP_FUN_LOG_PATTERNS = [
    "Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
    "Program HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm",
    "InitializeTokenAccount",
    "CreateTokenAccount",
    "pump.fun",
    "bonding curve",
    "virtual reserves",
  ]

  constructor(config: {
    rpcUrl: string
    apiKey?: string
    onNewCoin: (coin: PumpFunTokenData) => void
    onError: (error: Error) => void
  }) {
    const rpcUrl = config.apiKey ? `${config.rpcUrl}?api-key=${config.apiKey}` : config.rpcUrl

    this.connection = new Connection(rpcUrl, {
      commitment: "confirmed",
      wsEndpoint: rpcUrl.replace("https://", "wss://").replace("http://", "ws://"),
    })

    this.onNewCoin = config.onNewCoin
    this.onError = config.onError

    console.log("🎯 Pump.fun Specific Monitor initialized")
    console.log("📡 Monitoring programs:", [
      this.PUMP_FUN_PROGRAM_ID.toString(),
      this.PUMP_FUN_PROGRAM_ID_V2.toString(),
    ])
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("⚠️ Pump.fun monitor is already running")
      return
    }

    try {
      console.log("🚀 Starting pump.fun specific monitoring...")

      // اختبار الاتصال
      await this.testConnection()

      // مراقبة البرنامج الرئيسي
      this.subscriptionId = this.connection.onLogs(
        this.PUMP_FUN_PROGRAM_ID,
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

          // فحص إذا كانت المعاملة من pump.fun
          if (this.isPumpFunTransaction(logs)) {
            console.log("🎯 Detected pump.fun transaction:", signature)
            await this.processPumpFunTransaction(signature, logs)
          }
        },
        "confirmed",
      )

      // مراقبة البرنامج الثاني أيضاً
      const subscription2 = this.connection.onLogs(
        this.PUMP_FUN_PROGRAM_ID_V2,
        async ({ logs, signature, err }) => {
          if (err) return

          if (this.processedSignatures.has(signature)) return
          this.processedSignatures.add(signature)

          if (this.isPumpFunTransaction(logs)) {
            console.log("🎯 Detected pump.fun V2 transaction:", signature)
            await this.processPumpFunTransaction(signature, logs)
          }
        },
        "confirmed",
      )

      this.isMonitoring = true
      console.log("✅ Pump.fun specific monitoring started successfully")
      console.log("🎯 Primary subscription ID:", this.subscriptionId)
      console.log("🎯 Secondary subscription ID:", subscription2)

      // تنظيف الذاكرة
      setInterval(() => {
        if (this.processedSignatures.size > 1000) {
          this.processedSignatures.clear()
          console.log("🧹 Cleared processed signatures cache")
        }
      }, 600000)
    } catch (error) {
      console.error("❌ Failed to start pump.fun monitoring:", error)
      this.onError(error as Error)
      throw error
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const slot = await this.connection.getSlot()
      console.log("✅ Connection test successful, current slot:", slot)

      // اختبار وجود برنامج pump.fun
      const programAccount = await this.connection.getAccountInfo(this.PUMP_FUN_PROGRAM_ID)
      if (programAccount) {
        console.log("✅ Pump.fun program found on-chain")
      } else {
        console.warn("⚠️ Pump.fun program not found, using fallback")
      }
    } catch (error) {
      console.error("❌ Connection test failed:", error)
      throw new Error("Failed to connect to Solana RPC")
    }
  }

  private isPumpFunTransaction(logs: string[]): boolean {
    // فحص متعدد المستويات للتأكد من أن المعاملة من pump.fun

    // 1. فحص معرف البرنامج في الـ logs
    const hasPumpFunProgram = logs.some((log) => this.PUMP_FUN_ADDRESSES.some((address) => log.includes(address)))

    // 2. فحص أنماط الـ logs الخاصة بـ pump.fun
    const hasPumpFunPattern = logs.some((log) =>
      this.PUMP_FUN_LOG_PATTERNS.some((pattern) => log.toLowerCase().includes(pattern.toLowerCase())),
    )

    // 3. فحص كلمات مفتاحية محددة
    const hasPumpFunKeywords = logs.some((log) => {
      const lowerLog = log.toLowerCase()
      return (
        lowerLog.includes("pump") ||
        lowerLog.includes("bonding") ||
        lowerLog.includes("curve") ||
        lowerLog.includes("virtual") ||
        lowerLog.includes("reserves")
      )
    })

    // 4. فحص أنماط إنشاء العملات
    const hasTokenCreation = logs.some((log) => {
      const lowerLog = log.toLowerCase()
      return (
        lowerLog.includes("initialize") ||
        lowerLog.includes("create") ||
        lowerLog.includes("mint") ||
        lowerLog.includes("token")
      )
    })

    // يجب أن تحتوي على معرف pump.fun + نمط من الأنماط الأخرى
    const isPumpFun = hasPumpFunProgram && (hasPumpFunPattern || hasPumpFunKeywords) && hasTokenCreation

    if (isPumpFun) {
      console.log("🎯 Confirmed pump.fun transaction:", {
        hasPumpFunProgram,
        hasPumpFunPattern,
        hasPumpFunKeywords,
        hasTokenCreation,
      })
    }

    return isPumpFun
  }

  private async processPumpFunTransaction(signature: string, logs: string[]): Promise<void> {
    try {
      console.log("🔍 Processing pump.fun transaction:", signature)

      // جلب تفاصيل المعاملة
      const transaction = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      })

      if (!transaction) {
        console.log("⚠️ Transaction not found:", signature)
        return
      }

      // التحقق المضاعف من أن المعاملة من pump.fun
      if (!this.verifyPumpFunTransaction(transaction)) {
        console.log("⚠️ Transaction verification failed - not from pump.fun")
        return
      }

      // استخراج بيانات العملة
      const coinData = this.extractPumpFunCoin(transaction, signature, logs)

      if (coinData) {
        console.log("🎉 New pump.fun coin detected:", coinData)

        // تحسين البيانات
        const enhancedCoin = await this.enhancePumpFunCoinData(coinData)

        // إرسال البيانات
        this.onNewCoin(enhancedCoin)
      } else {
        console.log("⚠️ Could not extract pump.fun coin data")
      }
    } catch (error) {
      console.error("❌ Error processing pump.fun transaction:", error)
    }
  }

  private verifyPumpFunTransaction(transaction: any): boolean {
    try {
      const { message } = transaction.transaction

      if (!message || !message.accountKeys) {
        return false
      }

      // فحص أن أحد الحسابات في المعاملة هو برنامج pump.fun
      const hasPumpFunProgram = message.accountKeys.some((account: any) =>
        this.PUMP_FUN_ADDRESSES.includes(account.pubkey.toString()),
      )

      // فحص التعليمات للتأكد من أنها من pump.fun
      const hasPumpFunInstructions = message.instructions?.some((instruction: any) => {
        const programId = message.accountKeys[instruction.programIdIndex]?.pubkey?.toString()
        return this.PUMP_FUN_ADDRESSES.includes(programId)
      })

      return hasPumpFunProgram || hasPumpFunInstructions
    } catch (error) {
      console.error("❌ Error verifying pump.fun transaction:", error)
      return false
    }
  }

  private extractPumpFunCoin(transaction: any, signature: string, logs: string[]): PumpFunTokenData | null {
    try {
      const { meta, message } = transaction.transaction

      if (!meta || !message) {
        return null
      }

      // استخراج عنوان العملة الجديدة
      let mintAddress: string | null = null
      let bondingCurve: string | null = null
      let associatedBondingCurve: string | null = null

      // البحث في postTokenBalances
      if (meta.postTokenBalances && meta.postTokenBalances.length > 0) {
        // البحث عن أول عملة جديدة
        for (const balance of meta.postTokenBalances) {
          if (balance.mint && !meta.preTokenBalances?.some((pre: any) => pre.mint === balance.mint)) {
            mintAddress = balance.mint
            break
          }
        }
      }

      // البحث في الحسابات المنشأة حديثاً
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

      // البحث في الـ logs عن معلومات pump.fun
      const pumpFunInfo = this.extractPumpFunInfoFromLogs(logs)

      if (!mintAddress) {
        console.log("⚠️ Could not find mint address in pump.fun transaction")
        return null
      }

      // استخراج معلومات المنشئ
      const creator =
        message.accountKeys && message.accountKeys.length > 0 ? message.accountKeys[0].pubkey.toString() : "Unknown"

      // حساب السيولة
      let liquidity = 0
      if (meta.preBalances && meta.postBalances && meta.preBalances.length > 0 && meta.postBalances.length > 0) {
        liquidity = Math.abs(meta.preBalances[0] - meta.postBalances[0]) / 1e9
      }

      // البحث عن bonding curve في الحسابات
      if (message.accountKeys) {
        for (const account of message.accountKeys) {
          const accountStr = account.pubkey.toString()
          // bonding curve عادة ما يكون حساب مشتق
          if (accountStr.length === 44 && accountStr !== mintAddress && accountStr !== creator) {
            if (!bondingCurve) {
              bondingCurve = accountStr
            } else if (!associatedBondingCurve) {
              associatedBondingCurve = accountStr
            }
          }
        }
      }

      return {
        address: mintAddress,
        creator,
        liquidity,
        timestamp: new Date(),
        signature,
        bondingCurve: bondingCurve || mintAddress,
        associatedBondingCurve: associatedBondingCurve || bondingCurve || mintAddress,
        isPumpFunVerified: true,
        pumpFunData: pumpFunInfo,
        ...pumpFunInfo,
      }
    } catch (error) {
      console.error("❌ Error extracting pump.fun coin:", error)
      return null
    }
  }

  private extractPumpFunInfoFromLogs(logs: string[]): Partial<PumpFunTokenData> {
    const info: Partial<PumpFunTokenData> = {}

    for (const log of logs) {
      // استخراج اسم العملة
      const nameMatch = log.match(/name[:\s]+([^,\s\]]+)/i)
      if (nameMatch && nameMatch[1]) {
        info.name = nameMatch[1].replace(/['"]/g, "")
      }

      // استخراج رمز العملة
      const symbolMatch = log.match(/symbol[:\s]+([^,\s\]]+)/i)
      if (symbolMatch && symbolMatch[1]) {
        info.symbol = symbolMatch[1].replace(/['"]/g, "")
      }

      // استخراج معلومات السيولة
      const reserveMatch = log.match(/reserve[s]?[:\s]+(\d+\.?\d*)/i)
      if (reserveMatch && reserveMatch[1]) {
        info.solReserves = Number.parseFloat(reserveMatch[1])
      }

      // استخراج القيمة السوقية
      const marketCapMatch = log.match(/market[_\s]?cap[:\s]+(\d+\.?\d*)/i)
      if (marketCapMatch && marketCapMatch[1]) {
        info.marketCap = Number.parseFloat(marketCapMatch[1])
      }

      // استخراج معلومات الـ bonding curve
      const bondingMatch = log.match(/bonding[_\s]?curve[:\s]+([A-Za-z0-9]{32,44})/i)
      if (bondingMatch && bondingMatch[1]) {
        info.bondingCurve = bondingMatch[1]
      }
    }

    return info
  }

  private async enhancePumpFunCoinData(coin: PumpFunTokenData): Promise<PumpFunTokenData> {
    try {
      // محاولة جلب metadata من pump.fun API
      const pumpFunData = await this.fetchPumpFunMetadata(coin.address)

      if (pumpFunData) {
        return {
          ...coin,
          name: pumpFunData.name || coin.name || `PumpFun-${coin.symbol || coin.address.substring(0, 8)}`,
          symbol: pumpFunData.symbol || coin.symbol || coin.address.substring(0, 6).toUpperCase(),
          description:
            pumpFunData.description || coin.description || `New token created on pump.fun: ${coin.name || coin.symbol}`,
          image: pumpFunData.image_uri || coin.image || this.generatePumpFunPlaceholder(coin.symbol || "PF"),
          marketCap: pumpFunData.usd_market_cap || coin.marketCap || coin.liquidity * 1000,
          solReserves: pumpFunData.virtual_sol_reserves || coin.solReserves || coin.liquidity,
          tokenReserves: pumpFunData.virtual_token_reserves || coin.tokenReserves || 1000000000,
          pumpFunData,
        }
      }

      // إضافة معلومات افتراضية إذا لم نجد بيانات من API
      return {
        ...coin,
        name: coin.name || `PumpFun-${coin.symbol || coin.address.substring(0, 8)}`,
        symbol: coin.symbol || coin.address.substring(0, 6).toUpperCase(),
        description: coin.description || `New token created on pump.fun`,
        image: coin.image || this.generatePumpFunPlaceholder(coin.symbol || "PF"),
        marketCap: coin.marketCap || coin.liquidity * 1000,
        solReserves: coin.solReserves || coin.liquidity,
        tokenReserves: coin.tokenReserves || 1000000000,
      }
    } catch (error) {
      console.error("❌ Error enhancing pump.fun coin data:", error)
      return coin
    }
  }

  private async fetchPumpFunMetadata(mintAddress: string): Promise<any> {
    try {
      // محاولة جلب البيانات من pump.fun API
      const response = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; PumpFunMonitor/1.0)",
          Referer: "https://pump.fun/",
          Origin: "https://pump.fun",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Fetched pump.fun metadata:", data.name || data.symbol)
        return data
      } else {
        console.log("⚠️ Could not fetch pump.fun metadata:", response.status)
        return null
      }
    } catch (error) {
      console.error("❌ Error fetching pump.fun metadata:", error)
      return null
    }
  }

  private generatePumpFunPlaceholder(symbol: string): string {
    // ألوان pump.fun المميزة
    const pumpColors = ["00d4aa", "ff6b6b", "4ecdc4", "45b7d1", "96ceb4", "feca57", "ff9ff3", "54a0ff"]
    const color = pumpColors[Math.floor(Math.random() * pumpColors.length)]
    return `https://via.placeholder.com/64x64/${color}/ffffff?text=${encodeURIComponent(symbol.substring(0, 4))}`
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      console.log("⚠️ Pump.fun monitor is not running")
      return
    }

    try {
      if (this.subscriptionId !== null) {
        await this.connection.removeOnLogsListener(this.subscriptionId)
        console.log("🛑 Stopped pump.fun logs subscription:", this.subscriptionId)
      }

      this.isMonitoring = false
      this.subscriptionId = null
      this.processedSignatures.clear()

      console.log("✅ Pump.fun specific monitoring stopped")
    } catch (error) {
      console.error("❌ Error stopping pump.fun monitor:", error)
      this.onError(error as Error)
    }
  }

  getMonitorStatus(): {
    isMonitoring: boolean
    subscriptionId: number | null
    processedCount: number
    programIds: string[]
    isPumpFunSpecific: boolean
  } {
    return {
      isMonitoring: this.isMonitoring,
      subscriptionId: this.subscriptionId,
      processedCount: this.processedSignatures.size,
      programIds: [this.PUMP_FUN_PROGRAM_ID.toString(), this.PUMP_FUN_PROGRAM_ID_V2.toString()],
      isPumpFunSpecific: true,
    }
  }

  async restart(): Promise<void> {
    console.log("🔄 Restarting pump.fun monitor...")
    await this.stopMonitoring()
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await this.startMonitoring()
  }
}

export { PumpFunSpecificMonitor, type PumpFunTokenData }
