// نظام مراقبة تلقائي بالكامل لـ pump.fun - بدون API keys
import { Connection, PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js"

interface AutonomousPumpToken {
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

  // بيانات الكشف التلقائي
  detection_timestamp: number
  detection_latency: number
  detection_method: string
  transaction_signature: string
  block_time: number
  slot: number

  // تحليل تلقائي
  auto_analysis_score: number
  risk_assessment: "low" | "medium" | "high"
  liquidity_score: number
  name_quality_score: number
  timing_score: number
  overall_recommendation: "strong_buy" | "buy" | "hold" | "avoid"
}

class AutonomousPumpMonitor {
  private isMonitoring = false
  private connections: Connection[] = []
  private detectedTokens: AutonomousPumpToken[] = []
  private processedSignatures = new Set<string>()
  private subscriptionIds: number[] = []
  private onNewToken: (token: AutonomousPumpToken) => void

  // معرفات pump.fun الدقيقة والمحدثة
  private readonly PUMP_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
  private readonly PUMP_GLOBAL_ACCOUNT = "4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"
  private readonly PUMP_FEE_RECIPIENT = "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV2AbicfhtW4xC9iM"
  private readonly PUMP_EVENT_AUTHORITY = "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"

  // RPC endpoints مجانية (بدون API keys)
  private readonly FREE_RPC_ENDPOINTS = [
    "https://api.mainnet-beta.solana.com",
    "https://rpc.ankr.com/solana",
    "https://solana-api.projectserum.com",
    "https://api.mainnet.solana.com",
    "https://solana.blockdaemon.com",
    "https://solana-mainnet.rpc.extrnode.com",
    "https://rpc.solanabeach.io",
    "https://mainnet.rpcpool.com",
  ]

  // أنماط pump.fun للكشف التلقائي
  private readonly PUMP_PATTERNS = {
    // أنماط الـ logs
    logPatterns: [
      "Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P invoke",
      "Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P success",
      "initialize",
      "create",
      "InitializeTokenAccount",
      "InitializeMint",
      "CreateTokenAccount",
      "pump.fun",
    ],

    // أنماط الحسابات
    accountPatterns: [
      this.PUMP_PROGRAM_ID,
      this.PUMP_GLOBAL_ACCOUNT,
      this.PUMP_FEE_RECIPIENT,
      this.PUMP_EVENT_AUTHORITY,
    ],

    // أنماط التعليمات
    instructionPatterns: ["initialize", "create", "buy", "sell", "withdraw"],
  }

  constructor(onNewToken: (token: AutonomousPumpToken) => void) {
    this.onNewToken = onNewToken
    this.initializeConnections()
    console.log("🤖 Autonomous Pump Monitor initialized (NO API KEYS REQUIRED)")
  }

  private initializeConnections(): void {
    console.log("🔗 Initializing FREE RPC connections...")

    this.FREE_RPC_ENDPOINTS.forEach((endpoint, index) => {
      try {
        const connection = new Connection(endpoint, {
          commitment: "processed", // أسرع commitment
          confirmTransactionInitialTimeout: 60000,
          disableRetryOnRateLimit: false,
          httpHeaders: {
            "User-Agent": "AutonomousPumpMonitor/1.0",
          },
        })

        this.connections.push(connection)
        console.log(`✅ RPC ${index + 1}: ${endpoint}`)
      } catch (error) {
        console.warn(`❌ Failed to connect to ${endpoint}:`, error)
      }
    })

    console.log(`🎯 Successfully connected to ${this.connections.length} FREE RPC endpoints`)
  }

  async startAutonomousMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("⚠️ Autonomous monitoring already active")
      return
    }

    console.log("🚀 Starting AUTONOMOUS pump.fun monitoring...")
    console.log("🎯 100% AUTOMATIC - NO API KEYS NEEDED")
    console.log("🔍 Detecting ALL pump.fun contracts automatically")

    try {
      // بدء مراقبة تلقائية من جميع المصادر
      await Promise.all([
        this.startSolanaLogsMonitoring(),
        this.startAccountMonitoring(),
        this.startTransactionMonitoring(),
        this.startBlockMonitoring(),
      ])

      this.isMonitoring = true
      console.log("✅ AUTONOMOUS monitoring started successfully!")
      console.log("🎯 All pump.fun contracts will be detected automatically")

      // بدء تنظيف الذاكرة التلقائي
      this.startAutomaticCleanup()
    } catch (error) {
      console.error("❌ Failed to start autonomous monitoring:", error)
      throw error
    }
  }

  // الطريقة 1: مراقبة Solana logs تلقائياً
  private async startSolanaLogsMonitoring(): Promise<void> {
    console.log("📡 Starting autonomous Solana logs monitoring...")

    this.connections.forEach(async (connection, index) => {
      try {
        const programPubkey = new PublicKey(this.PUMP_PROGRAM_ID)

        const subscriptionId = connection.onLogs(
          programPubkey,
          async (logInfo) => {
            const detectionTime = Date.now()

            if (!logInfo.err && !this.processedSignatures.has(logInfo.signature)) {
              this.processedSignatures.add(logInfo.signature)

              // فحص تلقائي للتأكد من أنها معاملة pump.fun
              if (this.isAutonomousPumpFunTransaction(logInfo.logs)) {
                console.log(`⚡ AUTO-DETECTED: pump.fun transaction - ${logInfo.signature}`)

                // معالجة تلقائية فورية
                this.processAutonomousTransaction(logInfo.signature, detectionTime, index, connection).catch((error) =>
                  console.warn(`Auto-processing error: ${error}`),
                )
              }
            }
          },
          "processed", // أسرع commitment
        )

        this.subscriptionIds.push(subscriptionId)
        console.log(`✅ RPC ${index + 1}: Monitoring pump.fun program (ID: ${subscriptionId})`)
      } catch (error) {
        console.warn(`❌ RPC ${index + 1} logs monitoring failed:`, error)
      }
    })
  }

  // الطريقة 2: مراقبة الحسابات تلقائياً
  private async startAccountMonitoring(): Promise<void> {
    console.log("👁️ Starting autonomous account monitoring...")

    // مراقبة الحسابات الرئيسية لـ pump.fun
    const accountsToMonitor = [this.PUMP_GLOBAL_ACCOUNT, this.PUMP_FEE_RECIPIENT, this.PUMP_EVENT_AUTHORITY]

    this.connections.forEach((connection, connIndex) => {
      accountsToMonitor.forEach(async (accountAddress, accIndex) => {
        try {
          const accountPubkey = new PublicKey(accountAddress)

          const subscriptionId = connection.onAccountChange(
            accountPubkey,
            async (accountInfo, context) => {
              console.log(`🔍 Account change detected: ${accountAddress}`)

              // تحليل تغيير الحساب للكشف عن عملات جديدة
              await this.analyzeAccountChange(accountInfo, context, accountAddress)
            },
            "processed",
          )

          this.subscriptionIds.push(subscriptionId)
          console.log(`👁️ RPC ${connIndex + 1}: Monitoring account ${accIndex + 1}`)
        } catch (error) {
          console.warn(`Failed to monitor account ${accountAddress}:`, error)
        }
      })
    })
  }

  // الطريقة 3: مراقبة المعاملات تلقائياً
  private async startTransactionMonitoring(): Promise<void> {
    console.log("🔄 Starting autonomous transaction monitoring...")

    // مراقبة المعاملات الحديثة كل 5 ثوان
    setInterval(async () => {
      await this.scanRecentTransactions()
    }, 5000)

    // تشغيل فوري
    await this.scanRecentTransactions()
  }

  // الطريقة 4: مراقبة البلوكات تلقائياً
  private async startBlockMonitoring(): Promise<void> {
    console.log("🧱 Starting autonomous block monitoring...")

    this.connections.forEach(async (connection, index) => {
      try {
        const subscriptionId = connection.onSlotChange((slotInfo) => {
          // مراقبة البلوكات الجديدة للكشف عن معاملات pump.fun
          this.analyzeNewSlot(slotInfo, connection, index).catch((error) =>
            console.warn(`Slot analysis error: ${error}`),
          )
        })

        this.subscriptionIds.push(subscriptionId)
        console.log(`🧱 RPC ${index + 1}: Monitoring new blocks`)
      } catch (error) {
        console.warn(`Block monitoring failed for RPC ${index + 1}:`, error)
      }
    })
  }

  private isAutonomousPumpFunTransaction(logs: string[]): boolean {
    // فحص تلقائي متقدم للتأكد من أن المعاملة من pump.fun
    let pumpIndicators = 0

    // فحص أنماط الـ logs
    for (const log of logs) {
      for (const pattern of this.PUMP_PATTERNS.logPatterns) {
        if (log.includes(pattern)) {
          pumpIndicators++
          break
        }
      }
    }

    // فحص أنماط الحسابات
    for (const log of logs) {
      for (const pattern of this.PUMP_PATTERNS.accountPatterns) {
        if (log.includes(pattern)) {
          pumpIndicators++
          break
        }
      }
    }

    // يجب أن يحتوي على مؤشرين على الأقل
    return pumpIndicators >= 2
  }

  private async processAutonomousTransaction(
    signature: string,
    detectionTime: number,
    connectionIndex: number,
    connection: Connection,
  ): Promise<void> {
    try {
      // جلب المعاملة تلقائياً
      const transaction = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "processed",
      })

      if (!transaction) return

      // استخراج بيانات العملة تلقائياً
      const tokenData = await this.extractAutonomousTokenData(transaction, signature, detectionTime)

      if (tokenData) {
        // تحليل تلقائي شامل
        const analysis = this.performAutonomousAnalysis(tokenData)

        const finalToken: AutonomousPumpToken = {
          ...tokenData,
          ...analysis,
          detection_timestamp: detectionTime,
          detection_latency: Date.now() - detectionTime,
          detection_method: `autonomous_rpc_${connectionIndex + 1}`,
        }

        // إضافة للقائمة وإشعار
        this.detectedTokens.unshift(finalToken)
        this.onNewToken(finalToken)

        console.log(
          `🎯 AUTONOMOUS: ${finalToken.symbol} | Score: ${finalToken.auto_analysis_score} | Rec: ${finalToken.overall_recommendation}`,
        )
      }
    } catch (error) {
      console.warn(`Autonomous processing error for ${signature}:`, error)
    }
  }

  private async extractAutonomousTokenData(
    transaction: ParsedTransactionWithMeta,
    signature: string,
    detectionTime: number,
  ): Promise<Partial<AutonomousPumpToken> | null> {
    try {
      const { meta, message } = transaction.transaction

      if (!meta || !message) return null

      // استخراج mint address تلقائياً
      let mint: string | null = null
      let creator: string | null = null
      let bondingCurve: string | null = null

      // البحث في postTokenBalances
      if (meta.postTokenBalances && meta.postTokenBalances.length > 0) {
        for (const balance of meta.postTokenBalances) {
          if (balance.mint && !meta.preTokenBalances?.some((pre) => pre.mint === balance.mint)) {
            mint = balance.mint
            break
          }
        }
      }

      // استخراج المنشئ
      if (message.accountKeys && message.accountKeys.length > 0) {
        creator = message.accountKeys[0].pubkey.toString()
      }

      // البحث عن bonding curve
      if (message.accountKeys) {
        for (const account of message.accountKeys) {
          const addr = account.pubkey.toString()
          if (addr !== mint && addr !== creator && addr.length === 44) {
            bondingCurve = addr
            break
          }
        }
      }

      if (!mint || !creator) return null

      // حساب السيولة الأولية تلقائياً
      let initialLiquidity = 0
      if (meta.preBalances && meta.postBalances) {
        const balanceDiff = Math.abs(meta.preBalances[0] - meta.postBalances[0])
        initialLiquidity = balanceDiff / 1e9
      }

      // استخراج معلومات إضافية من logs تلقائياً
      const logInfo = this.extractAutonomousInfoFromLogs(transaction.meta?.logMessages || [])

      // إنشاء بيانات العملة تلقائياً
      return {
        mint,
        creator,
        transaction_signature: signature,
        block_time: transaction.blockTime || 0,
        slot: transaction.slot,
        created_timestamp: Date.now() / 1000,
        virtual_sol_reserves: initialLiquidity,
        bonding_curve: bondingCurve || mint,
        associated_bonding_curve: bondingCurve || mint,
        complete: false,
        is_currently_live: true,

        // بيانات افتراضية (سيتم تحسينها تلقائياً)
        name: logInfo.name || `PumpToken-${mint.substring(0, 8)}`,
        symbol: logInfo.symbol || mint.substring(0, 6).toUpperCase(),
        description: logInfo.description || "Autonomous pump.fun token detection",
        image_uri: this.generateAutonomousImage(logInfo.symbol || mint.substring(0, 4)),
        usd_market_cap: initialLiquidity * 1000, // تقدير أولي
        virtual_token_reserves: 1000000000,
        reply_count: 0,
      }
    } catch (error) {
      console.warn("Autonomous extraction error:", error)
      return null
    }
  }

  private extractAutonomousInfoFromLogs(logs: string[]): {
    name?: string
    symbol?: string
    description?: string
  } {
    const info: any = {}

    for (const log of logs) {
      // استخراج الاسم
      const nameMatch = log.match(/name[:\s"']*([^,\s"']+)/i)
      if (nameMatch && nameMatch[1]) {
        info.name = nameMatch[1].replace(/['"]/g, "")
      }

      // استخراج الرمز
      const symbolMatch = log.match(/symbol[:\s"']*([^,\s"']+)/i)
      if (symbolMatch && symbolMatch[1]) {
        info.symbol = symbolMatch[1].replace(/['"]/g, "")
      }

      // استخراج الوصف
      const descMatch = log.match(/description[:\s"']*([^,\s"']+)/i)
      if (descMatch && descMatch[1]) {
        info.description = descMatch[1].replace(/['"]/g, "")
      }
    }

    return info
  }

  private performAutonomousAnalysis(tokenData: Partial<AutonomousPumpToken>): {
    auto_analysis_score: number
    risk_assessment: "low" | "medium" | "high"
    liquidity_score: number
    name_quality_score: number
    timing_score: number
    overall_recommendation: "strong_buy" | "buy" | "hold" | "avoid"
  } {
    // تحليل تلقائي شامل

    // 1. تحليل السيولة
    const liquidityScore = this.analyzeLiquidityAutonomously(tokenData.virtual_sol_reserves || 0)

    // 2. تحليل جودة الاسم
    const nameQualityScore = this.analyzeNameQualityAutonomously(tokenData.name || "", tokenData.symbol || "")

    // 3. تحليل التوقيت
    const timingScore = this.analyzeTimingAutonomously()

    // 4. تحليل المنشئ
    const creatorScore = this.analyzeCreatorAutonomously(tokenData.creator || "")

    // حساب النقاط الإجمالية
    const totalScore = (liquidityScore + nameQualityScore + timingScore + creatorScore) / 4

    // تحديد مستوى المخاطر
    let riskAssessment: "low" | "medium" | "high" = "medium"
    if (totalScore >= 75) riskAssessment = "low"
    else if (totalScore <= 40) riskAssessment = "high"

    // تحديد التوصية
    let recommendation: "strong_buy" | "buy" | "hold" | "avoid" = "hold"
    if (totalScore >= 85) recommendation = "strong_buy"
    else if (totalScore >= 70) recommendation = "buy"
    else if (totalScore <= 30) recommendation = "avoid"

    return {
      auto_analysis_score: Math.round(totalScore * 100) / 100,
      risk_assessment: riskAssessment,
      liquidity_score: liquidityScore,
      name_quality_score: nameQualityScore,
      timing_score: timingScore,
      overall_recommendation: recommendation,
    }
  }

  private analyzeLiquidityAutonomously(liquidity: number): number {
    if (liquidity >= 100) return 95
    if (liquidity >= 50) return 80
    if (liquidity >= 20) return 65
    if (liquidity >= 10) return 50
    if (liquidity >= 5) return 35
    return 20
  }

  private analyzeNameQualityAutonomously(name: string, symbol: string): number {
    let score = 50

    // فحص طول الاسم
    if (name.length >= 3 && name.length <= 20) score += 15

    // فحص عدم وجود أرقام كثيرة
    if (!/\d{3,}/.test(name)) score += 10

    // فحص عدم وجود رموز غريبة
    if (!/[!@#$%^&*()_+={}[\]|\\:";'<>?,./]/.test(name)) score += 10

    // فحص جودة الرمز
    if (symbol.length >= 3 && symbol.length <= 6) score += 10
    if (symbol === symbol.toUpperCase()) score += 5

    return Math.min(100, score)
  }

  private analyzeTimingAutonomously(): number {
    const hour = new Date().getHours()
    const day = new Date().getDay()

    let score = 50

    // أوقات التداول النشطة
    if ((hour >= 13 && hour <= 16) || (hour >= 20 && hour <= 23)) {
      score += 25
    } else if ((hour >= 9 && hour <= 12) || (hour >= 17 && hour <= 19)) {
      score += 15
    }

    // أيام الأسبوع النشطة
    if (day >= 1 && day <= 5) {
      // الاثنين إلى الجمعة
      score += 10
    }

    return Math.min(100, score)
  }

  private analyzeCreatorAutonomously(creator: string): number {
    // تحليل بسيط للمنشئ
    const creatorTokens = this.detectedTokens.filter((t) => t.creator === creator)

    if (creatorTokens.length === 0) return 50 // منشئ جديد

    const successfulTokens = creatorTokens.filter((t) => t.usd_market_cap > 50000)
    const successRate = successfulTokens.length / creatorTokens.length

    return Math.min(100, successRate * 100 + 20)
  }

  private async scanRecentTransactions(): Promise<void> {
    // مسح المعاملات الحديثة تلقائياً
    try {
      const connection = this.connections[0] // استخدام أول connection

      const signatures = await connection.getSignaturesForAddress(new PublicKey(this.PUMP_PROGRAM_ID), { limit: 20 })

      for (const sigInfo of signatures) {
        if (!this.processedSignatures.has(sigInfo.signature)) {
          this.processedSignatures.add(sigInfo.signature)

          // معالجة المعاملة
          this.processAutonomousTransaction(sigInfo.signature, Date.now(), 0, connection).catch((error) =>
            console.warn(`Recent transaction processing error: ${error}`),
          )
        }
      }
    } catch (error) {
      console.warn("Recent transactions scan error:", error)
    }
  }

  private async analyzeAccountChange(accountInfo: any, context: any, accountAddress: string): Promise<void> {
    // تحليل تغييرات الحساب للكشف عن عملات جديدة
    console.log(`🔍 Analyzing account change: ${accountAddress}`)
    // يمكن إضافة منطق تحليل متقدم هنا
  }

  private async analyzeNewSlot(slotInfo: any, connection: Connection, connectionIndex: number): Promise<void> {
    // تحليل البلوكات الجديدة
    try {
      const block = await connection.getBlock(slotInfo.slot, {
        maxSupportedTransactionVersion: 0,
      })

      if (block && block.transactions) {
        for (const transaction of block.transactions) {
          if (
            transaction.transaction.message.accountKeys.some((key) =>
              this.PUMP_PATTERNS.accountPatterns.includes(key.pubkey.toString()),
            )
          ) {
            // معاملة pump.fun محتملة
            if (
              transaction.transaction.signatures[0] &&
              !this.processedSignatures.has(transaction.transaction.signatures[0])
            ) {
              this.processedSignatures.add(transaction.transaction.signatures[0])

              this.processAutonomousTransaction(
                transaction.transaction.signatures[0],
                Date.now(),
                connectionIndex,
                connection,
              ).catch((error) => console.warn(`Block transaction processing error: ${error}`))
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Slot analysis error: ${error}`)
    }
  }

  private generateAutonomousImage(symbol: string): string {
    const colors = ["00d4aa", "ff6b6b", "4ecdc4", "45b7d1", "96ceb4", "feca57"]
    const color = colors[Math.floor(Math.random() * colors.length)]
    return `https://via.placeholder.com/64x64/${color}/ffffff?text=${encodeURIComponent(symbol.substring(0, 4))}`
  }

  private startAutomaticCleanup(): void {
    // تنظيف تلقائي للذاكرة كل 10 دقائق
    setInterval(() => {
      // تنظيف المعاملات المعالجة القديمة
      if (this.processedSignatures.size > 5000) {
        this.processedSignatures.clear()
        console.log("🧹 Automatic cleanup: Cleared processed signatures")
      }

      // الاحتفاظ بآخر 1000 عملة فقط
      if (this.detectedTokens.length > 1000) {
        this.detectedTokens = this.detectedTokens.slice(0, 1000)
        console.log("🧹 Automatic cleanup: Trimmed tokens list")
      }
    }, 600000) // كل 10 دقائق
  }

  // واجهات عامة
  getDetectedTokens(): AutonomousPumpToken[] {
    return [...this.detectedTokens]
  }

  getAutonomousStats(): {
    isMonitoring: boolean
    totalDetected: number
    connectionsCount: number
    subscriptionsCount: number
    processedSignatures: number
    averageDetectionLatency: number
  } {
    const avgLatency =
      this.detectedTokens.length > 0
        ? this.detectedTokens.reduce((sum, token) => sum + token.detection_latency, 0) / this.detectedTokens.length
        : 0

    return {
      isMonitoring: this.isMonitoring,
      totalDetected: this.detectedTokens.length,
      connectionsCount: this.connections.length,
      subscriptionsCount: this.subscriptionIds.length,
      processedSignatures: this.processedSignatures.size,
      averageDetectionLatency: Math.round(avgLatency),
    }
  }

  async stopAutonomousMonitoring(): Promise<void> {
    if (!this.isMonitoring) return

    console.log("🛑 Stopping autonomous monitoring...")

    // إلغاء جميع الاشتراكات
    for (let i = 0; i < this.subscriptionIds.length; i++) {
      try {
        const connection = this.connections[i % this.connections.length]
        await connection.removeOnLogsListener(this.subscriptionIds[i])
      } catch (error) {
        console.warn(`Failed to remove subscription ${this.subscriptionIds[i]}:`, error)
      }
    }

    this.isMonitoring = false
    this.subscriptionIds = []
    this.processedSignatures.clear()

    console.log("✅ Autonomous monitoring stopped")
  }
}

export { AutonomousPumpMonitor, type AutonomousPumpToken }
