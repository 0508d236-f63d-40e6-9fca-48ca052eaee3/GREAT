/**
 * 🚀 خدمة العملات المحسنة مع معالجة الأخطاء والتحقق الشامل
 * نظام موثوق مع استشفاء تلقائي وتطبيق شامل للمعايير
 */

import { errorRecoveryService } from "./error-recovery-service"
import { criteriaValidationService, type ValidationResult } from "./criteria-validation-service"
import type { SimpleToken } from "./simple-token-service"

export interface EnhancedToken extends SimpleToken {
  validationResult?: ValidationResult
  lastValidated?: number
  validationStatus: "PENDING" | "VALIDATED" | "FAILED" | "EXPIRED"
  errorCount: number
  retryCount: number
  qualityScore: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  processingHistory: ProcessingEvent[]
}

export interface ProcessingEvent {
  timestamp: number
  event: "CREATED" | "VALIDATED" | "ERROR" | "RETRY" | "UPDATED"
  details: any
}

export interface ServiceStats {
  totalTokens: number
  validatedTokens: number
  pendingValidation: number
  failedValidation: number
  recommendedTokens: number
  classifiedTokens: number
  ignoredTokens: number
  averageQualityScore: number
  systemHealth: "HEALTHY" | "DEGRADED" | "CRITICAL"
  errorRate: number
  validationRate: number
  uptime: number
}

class EnhancedTokenService {
  private tokens: Map<string, EnhancedToken> = new Map()
  private isRunning = false
  private updateInterval: NodeJS.Timeout | null = null
  private validationInterval: NodeJS.Timeout | null = null
  private listeners: ((tokens: EnhancedToken[], stats: ServiceStats) => void)[] = []
  private startTime = Date.now()
  private stats: ServiceStats = {
    totalTokens: 0,
    validatedTokens: 0,
    pendingValidation: 0,
    failedValidation: 0,
    recommendedTokens: 0,
    classifiedTokens: 0,
    ignoredTokens: 0,
    averageQualityScore: 0,
    systemHealth: "HEALTHY",
    errorRate: 0,
    validationRate: 0,
    uptime: 0,
  }

  // بيانات العملات الواقعية
  private readonly TOKEN_NAMES = [
    "MAGA PEPE TRUMP",
    "AI Cat Destroyer",
    "Smoking Pepe",
    "Doge The Destroyer",
    "Unicorn Blast",
    "Retarded Ape",
    "Moon Rocket",
    "Crying Wojak",
    "Chad Thunder",
    "Banana Cat",
    "Diamond Hands",
    "Paper Hands",
    "Rocket Ship",
    "To The Moon",
    "HODL Forever",
    "Ape Strong",
    "Pepe King",
    "Doge Master",
    "Cat Coin",
    "Frog Token",
    "Shiba Destroyer",
    "Elon's Dog",
    "Pump It Up",
    "Moon Mission",
    "Ape Together",
    "Diamond Pepe",
    "Rocket Cat",
    "Chad Doge",
    "Banana Rocket",
    "Pepe Moon",
    "Solana Killer",
    "ETH Destroyer",
    "Bitcoin Baby",
    "Crypto King",
    "DeFi Master",
  ]

  private readonly TOKEN_SYMBOLS = [
    "MPT",
    "AICAT",
    "SMOKE",
    "DTD",
    "UBLAST",
    "RETAPE",
    "MOONR",
    "CWOJAK",
    "CHAD",
    "BANCAT",
    "DIAMOND",
    "PAPER",
    "ROCKET",
    "MOON",
    "HODL",
    "APE",
    "PEPEK",
    "DOGEM",
    "CAT",
    "FROG",
    "SHIBAD",
    "EDOG",
    "PUMP",
    "MISSION",
    "TOGETHER",
    "DPEPE",
    "RCAT",
    "CDOGE",
    "BROCK",
    "PMOON",
    "SOLKILL",
    "ETHD",
    "BTCBABY",
    "CKING",
    "DEFIM",
  ]

  private readonly EMOJIS = ["🐸", "🐕", "🐱", "🚀", "🌙", "💎", "🔥", "🦍", "🦄", "🍌", "⚡", "🎯", "🏆", "💰", "🎪"]

  /**
   * 🚀 بدء الخدمة المحسنة
   */
  async start(): Promise<void> {
    console.log("🚀 بدء خدمة العملات المحسنة مع معالجة الأخطاء...")

    if (this.isRunning) {
      console.log("⚠️ الخدمة تعمل بالفعل")
      return
    }

    try {
      // بدء خدمة معالجة الأخطاء
      errorRecoveryService.start()

      // إنشاء عملات أولية
      await this.generateInitialTokens()

      // بدء التحديثات المستمرة
      this.startContinuousUpdates()

      // بدء التحقق المستمر من المعايير
      this.startContinuousValidation()

      this.isRunning = true

      errorRecoveryService.logInfo("ENHANCED_TOKEN_SERVICE", "Service started successfully", {
        initialTokens: this.tokens.size,
        startTime: new Date().toISOString(),
      })

      console.log(`✅ تم بدء الخدمة المحسنة بنجاح - ${this.tokens.size} عملة جاهزة`)

      // إشعار المستمعين
      this.notifyListeners()
    } catch (error) {
      errorRecoveryService.logCritical("ENHANCED_TOKEN_SERVICE", "Failed to start service", error)
      throw error
    }
  }

  /**
   * 🎲 إنشاء عملات أولية مع معالجة الأخطاء
   */
  private async generateInitialTokens(): Promise<void> {
    console.log("🎲 إنشاء عملات أولية مع التحقق الشامل...")

    try {
      const now = Date.now()
      const tokensToCreate = 150

      for (let i = 0; i < tokensToCreate; i++) {
        try {
          const token = await this.createEnhancedToken(i)
          this.tokens.set(token.mint, token)

          // إضافة للتحقق من المعايير
          criteriaValidationService.addTokenForValidation(token)
        } catch (error) {
          errorRecoveryService.logError("TOKEN_CREATION", `Failed to create token ${i}`, error)
          // المتابعة مع العملات الأخرى
        }
      }

      console.log(`✅ تم إنشاء ${this.tokens.size} عملة من أصل ${tokensToCreate}`)
    } catch (error) {
      errorRecoveryService.logCritical("TOKEN_GENERATION", "Failed to generate initial tokens", error)
      throw error
    }
  }

  /**
   * 🏗️ إنشاء عملة محسنة
   */
  private async createEnhancedToken(index: number): Promise<EnhancedToken> {
    try {
      const now = Date.now()
      const nameIndex = Math.floor(Math.random() * this.TOKEN_NAMES.length)
      const symbolIndex = Math.floor(Math.random() * this.TOKEN_SYMBOLS.length)
      const emojiIndex = Math.floor(Math.random() * this.EMOJIS.length)

      // توزيع العملات على آخر ساعة
      const ageMinutes = Math.random() * 60
      const createdTime = now - ageMinutes * 60 * 1000
      const secondsSinceCreation = Math.floor((now - createdTime) / 1000)

      // أسعار واقعية
      const price = this.generateRealisticPrice()
      const supply = 1000000000
      const marketCap = price * supply

      const baseToken: SimpleToken = {
        mint: this.generateRandomMint(),
        name: this.TOKEN_NAMES[nameIndex] || `Token ${index + 1}`,
        symbol: this.TOKEN_SYMBOLS[symbolIndex] || `TK${index + 1}`,
        logo: this.EMOJIS[emojiIndex] || "🪙",
        price,
        marketCap,
        volume24h: this.generateRealisticVolume(marketCap),
        priceChange24h: (Math.random() - 0.5) * 200,
        holders: Math.floor(Math.random() * 1000) + 10,
        createdTimestamp: Math.floor(createdTime / 1000),
        secondsSinceCreation,
        ageInMinutes: Math.floor(ageMinutes),
        description: "A revolutionary new meme token on pump.fun",
        pumpFunUrl: `https://pump.fun/${this.generateRandomMint()}`,
        isLive: Math.random() > 0.2,
        complete: Math.random() > 0.8,
        creator: this.generateRandomMint(),
        analysisScore: Math.random() * 100,
        recommendation: this.getRandomRecommendation(),
      }

      const enhancedToken: EnhancedToken = {
        ...baseToken,
        validationStatus: "PENDING",
        errorCount: 0,
        retryCount: 0,
        qualityScore: 0,
        riskLevel: "MEDIUM",
        processingHistory: [
          {
            timestamp: now,
            event: "CREATED",
            details: { index, source: "initial_generation" },
          },
        ],
      }

      return enhancedToken
    } catch (error) {
      errorRecoveryService.logError("TOKEN_CREATION", `Failed to create enhanced token ${index}`, error)
      throw error
    }
  }

  /**
   * 💰 إنشاء سعر واقعي
   */
  private generateRealisticPrice(): number {
    const priceRanges = [
      { min: 0.0001, max: 0.001, weight: 0.4 }, // أسعار منخفضة جداً
      { min: 0.001, max: 0.01, weight: 0.3 }, // أسعار منخفضة
      { min: 0.01, max: 0.1, weight: 0.2 }, // أسعار متوسطة
      { min: 0.1, max: 1, weight: 0.1 }, // أسعار عالية
    ]

    const random = Math.random()
    let cumulativeWeight = 0

    for (const range of priceRanges) {
      cumulativeWeight += range.weight
      if (random <= cumulativeWeight) {
        return Math.random() * (range.max - range.min) + range.min
      }
    }

    return 0.001 // fallback
  }

  /**
   * 📊 إنشاء حجم تداول واقعي
   */
  private generateRealisticVolume(marketCap: number): number {
    // الحجم عادة يكون نسبة من القيمة السوقية
    const volumeRatio = Math.random() * 0.5 + 0.1 // 10% إلى 60%
    return marketCap * volumeRatio
  }

  /**
   * 🔄 بدء التحديثات المستمرة
   */
  private startContinuousUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.performContinuousUpdates()
    }, 5000) // كل 5 ثوان

    console.log("🔄 بدء التحديثات المستمرة للعملات")
  }

  /**
   * 🔄 بدء التحقق المستمر من المعايير
   */
  private startContinuousValidation(): void {
    this.validationInterval = setInterval(() => {
      this.performContinuousValidation()
    }, 3000) // كل 3 ثوان

    console.log("🎯 بدء التحقق المستمر من المعايير")
  }

  /**
   * 📈 تنفيذ التحديثات المستمرة
   */
  private async performContinuousUpdates(): Promise<void> {
    try {
      const now = Date.now()
      let hasChanges = false

      // تحديث العملات الموجودة
      for (const [mint, token] of this.tokens) {
        try {
          const updated = await this.updateTokenData(token, now)
          if (updated) {
            hasChanges = true

            // إضافة حدث التحديث
            token.processingHistory.push({
              timestamp: now,
              event: "UPDATED",
              details: { type: "price_and_data_update" },
            })

            // الحد من تاريخ المعالجة
            if (token.processingHistory.length > 10) {
              token.processingHistory = token.processingHistory.slice(-10)
            }
          }
        } catch (error) {
          token.errorCount++
          errorRecoveryService.logError("TOKEN_UPDATE", `Failed to update token ${token.symbol}`, error)

          // إضافة حدث الخطأ
          token.processingHistory.push({
            timestamp: now,
            event: "ERROR",
            details: { error: error.message, errorCount: token.errorCount },
          })
        }
      }

      // إضافة عملات جديدة أحياناً
      if (Math.random() < 0.3) {
        // 30% احتمال
        try {
          await this.addNewToken()
          hasChanges = true
        } catch (error) {
          errorRecoveryService.logError("NEW_TOKEN_CREATION", "Failed to add new token", error)
        }
      }

      // إزالة العملات القديمة جداً
      const removedCount = this.removeOldTokens()
      if (removedCount > 0) {
        hasChanges = true
        console.log(`🧹 تم إزالة ${removedCount} عملة قديمة`)
      }

      // تحديث الإحصائيات
      this.updateStats()

      if (hasChanges) {
        this.notifyListeners()
      }
    } catch (error) {
      errorRecoveryService.logError("CONTINUOUS_UPDATES", "Continuous updates failed", error)
    }
  }

  /**
   * 🎯 تنفيذ التحقق المستمر من المعايير
   */
  private async performContinuousValidation(): Promise<void> {
    try {
      const now = Date.now()
      const tokensNeedingValidation: EnhancedToken[] = []

      // العثور على العملات التي تحتاج تحقق
      for (const [mint, token] of this.tokens) {
        const needsValidation =
          token.validationStatus === "PENDING" ||
          token.validationStatus === "FAILED" ||
          token.validationStatus === "EXPIRED" ||
          (token.lastValidated && now - token.lastValidated > 300000) // 5 دقائق

        if (needsValidation) {
          tokensNeedingValidation.push(token)
        }
      }

      if (tokensNeedingValidation.length > 0) {
        console.log(`🎯 العثور على ${tokensNeedingValidation.length} عملة تحتاج تحقق من المعايير`)

        // تحقق من حتى 10 عملات في المرة الواحدة
        const tokensToValidate = tokensNeedingValidation.slice(0, 10)

        for (const token of tokensToValidate) {
          try {
            await this.validateTokenWithRetry(token)
          } catch (error) {
            errorRecoveryService.logError("TOKEN_VALIDATION", `Validation failed for ${token.symbol}`, error)
          }
        }
      }
    } catch (error) {
      errorRecoveryService.logError("CONTINUOUS_VALIDATION", "Continuous validation failed", error)
    }
  }

  /**
   * ✅ التحقق من العملة مع إعادة المحاولة
   */
  private async validateTokenWithRetry(token: EnhancedToken): Promise<void> {
    const maxRetries = 3

    try {
      console.log(`🔍 بدء التحقق من ${token.symbol} (محاولة ${token.retryCount + 1})`)

      // تحديث حالة التحقق
      token.validationStatus = "PENDING"
      token.processingHistory.push({
        timestamp: Date.now(),
        event: "RETRY",
        details: { attempt: token.retryCount + 1, maxRetries },
      })

      // التحقق من المعايير
      const validationResult = await criteriaValidationService.validateTokenCriteria(token)

      // تحديث العملة بالنتائج
      token.validationResult = validationResult
      token.lastValidated = Date.now()
      token.validationStatus = "VALIDATED"
      token.qualityScore = validationResult.overallScore
      token.recommendation = validationResult.recommendation
      token.riskLevel = this.calculateRiskLevel(validationResult)
      token.retryCount = 0 // إعادة تعيين عداد المحاولات

      // إضافة حدث النجاح
      token.processingHistory.push({
        timestamp: Date.now(),
        event: "VALIDATED",
        details: {
          score: validationResult.overallScore,
          recommendation: validationResult.recommendation,
          completeness: validationResult.completeness,
          confidence: validationResult.confidence,
        },
      })

      console.log(
        `✅ تم التحقق من ${token.symbol}: ${validationResult.recommendation} (${validationResult.overallScore.toFixed(1)}%)`,
      )
    } catch (error) {
      token.retryCount++
      token.errorCount++

      if (token.retryCount >= maxRetries) {
        token.validationStatus = "FAILED"
        errorRecoveryService.logError("TOKEN_VALIDATION", `Validation failed permanently for ${token.symbol}`, {
          error: error.message,
          retryCount: token.retryCount,
          errorCount: token.errorCount,
        })
      } else {
        token.validationStatus = "PENDING"
        errorRecoveryService.logWarning("TOKEN_VALIDATION", `Validation retry for ${token.symbol}`, {
          error: error.message,
          retryCount: token.retryCount,
          maxRetries,
        })
      }

      // إضافة حدث الخطأ
      token.processingHistory.push({
        timestamp: Date.now(),
        event: "ERROR",
        details: {
          error: error.message,
          retryCount: token.retryCount,
          willRetry: token.retryCount < maxRetries,
        },
      })
    }
  }

  /**
   * ⚠️ حساب مستوى المخاطر
   */
  private calculateRiskLevel(validationResult: ValidationResult): "LOW" | "MEDIUM" | "HIGH" {
    const score = validationResult.overallScore
    const errorCount = validationResult.errors.length
    const confidence = validationResult.confidence

    if (errorCount > 0 || score < 30 || confidence < 50) {
      return "HIGH"
    } else if (score < 60 || confidence < 70) {
      return "MEDIUM"
    } else {
      return "LOW"
    }
  }

  /**
   * 📊 تحديث بيانات العملة
   */
  private async updateTokenData(token: EnhancedToken, now: number): Promise<boolean> {
    try {
      let hasChanges = false

      // تحديث العمر
      const newSecondsAge = Math.floor((now - token.createdTimestamp * 1000) / 1000)
      const newMinutesAge = Math.floor(newSecondsAge / 60)

      if (newSecondsAge !== token.secondsSinceCreation) {
        token.secondsSinceCreation = newSecondsAge
        token.ageInMinutes = newMinutesAge
        hasChanges = true
      }

      // تحديث السعر بشكل واقعي
      const priceChangePercent = (Math.random() - 0.5) * 0.1 // تغيير 10% كحد أقصى
      const newPrice = Math.max(0.0001, token.price * (1 + priceChangePercent))

      if (Math.abs(newPrice - token.price) > 0.000001) {
        token.price = newPrice
        token.marketCap = newPrice * 1000000000
        token.priceChange24h = ((newPrice - token.price) / token.price) * 100
        hasChanges = true
      }

      // تحديث الحجم
      const volumeChange = (Math.random() - 0.5) * 0.2 // تغيير 20%
      token.volume24h = Math.max(0, token.volume24h * (1 + volumeChange))

      // تحديث عدد الحاملين أحياناً
      if (Math.random() < 0.1) {
        // 10% احتمال
        const holderChange = Math.floor((Math.random() - 0.5) * 10)
        token.holders = Math.max(1, token.holders + holderChange)
        hasChanges = true
      }

      // تحديث حالة انتهاء صلاحية التحقق
      if (token.lastValidated && now - token.lastValidated > 600000) {
        // 10 دقائق
        token.validationStatus = "EXPIRED"
        hasChanges = true
      }

      return hasChanges
    } catch (error) {
      errorRecoveryService.logError("TOKEN_DATA_UPDATE", `Failed to update token data for ${token.symbol}`, error)
      return false
    }
  }

  /**
   * ➕ إضافة عملة جديدة
   */
  private async addNewToken(): Promise<void> {
    try {
      const newIndex = this.tokens.size
      const newToken = await this.createEnhancedToken(newIndex)

      // جعل العملة الجديدة حديثة (0-2 دقيقة)
      const ageSeconds = Math.random() * 120
      const now = Date.now()
      const createdTime = now - ageSeconds * 1000

      newToken.createdTimestamp = Math.floor(createdTime / 1000)
      newToken.secondsSinceCreation = Math.floor(ageSeconds)
      newToken.ageInMinutes = Math.floor(ageSeconds / 60)

      this.tokens.set(newToken.mint, newToken)

      // إضافة للتحقق من المعايير
      criteriaValidationService.addTokenForValidation(newToken)

      console.log(`➕ تم إضافة عملة جديدة: ${newToken.symbol}`)

      // الحد من العدد الإجمالي
      if (this.tokens.size > 200) {
        const oldestTokens = Array.from(this.tokens.values())
          .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
          .slice(0, 50)

        oldestTokens.forEach((token) => {
          this.tokens.delete(token.mint)
        })

        console.log(`🧹 تم إزالة ${oldestTokens.length} عملة قديمة للحفاظ على الحد الأقصى`)
      }
    } catch (error) {
      errorRecoveryService.logError("NEW_TOKEN_ADDITION", "Failed to add new token", error)
      throw error
    }
  }

  /**
   * 🧹 إزالة العملات القديمة
   */
  private removeOldTokens(): number {
    const oneHourAgo = Date.now() / 1000 - 3600 // ساعة واحدة
    const tokensToRemove: string[] = []

    this.tokens.forEach((token, mint) => {
      if (token.createdTimestamp < oneHourAgo) {
        tokensToRemove.push(mint)
      }
    })

    tokensToRemove.forEach((mint) => {
      this.tokens.delete(mint)
    })

    return tokensToRemove.length
  }

  /**
   * 📊 تحديث الإحصائيات
   */
  private updateStats(): void {
    const now = Date.now()
    const tokens = Array.from(this.tokens.values())

    this.stats.totalTokens = tokens.length
    this.stats.validatedTokens = tokens.filter((t) => t.validationStatus === "VALIDATED").length
    this.stats.pendingValidation = tokens.filter((t) => t.validationStatus === "PENDING").length
    this.stats.failedValidation = tokens.filter((t) => t.validationStatus === "FAILED").length
    this.stats.recommendedTokens = tokens.filter((t) => t.recommendation === "Recommended").length
    this.stats.classifiedTokens = tokens.filter((t) => t.recommendation === "Classified").length
    this.stats.ignoredTokens = tokens.filter((t) => t.recommendation === "Ignored").length
    this.stats.uptime = (now - this.startTime) / 1000

    // حساب متوسط نقاط الجودة
    const validatedTokens = tokens.filter((t) => t.validationStatus === "VALIDATED")
    this.stats.averageQualityScore =
      validatedTokens.length > 0
        ? validatedTokens.reduce((sum, t) => sum + t.qualityScore, 0) / validatedTokens.length
        : 0

    // حساب معدل الأخطاء
    const totalErrors = tokens.reduce((sum, t) => sum + t.errorCount, 0)
    this.stats.errorRate = this.stats.totalTokens > 0 ? totalErrors / this.stats.totalTokens : 0

    // حساب معدل التحقق
    this.stats.validationRate =
      this.stats.totalTokens > 0 ? (this.stats.validatedTokens / this.stats.totalTokens) * 100 : 0

    // تحديد صحة النظام
    if (this.stats.errorRate > 5 || this.stats.validationRate < 50) {
      this.stats.systemHealth = "CRITICAL"
    } else if (this.stats.errorRate > 2 || this.stats.validationRate < 70) {
      this.stats.systemHealth = "DEGRADED"
    } else {
      this.stats.systemHealth = "HEALTHY"
    }
  }

  /**
   * 🎯 الحصول على توصية عشوائية
   */
  private getRandomRecommendation(): "Recommended" | "Classified" | "Ignored" {
    const rand = Math.random()
    if (rand < 0.25) return "Recommended"
    if (rand < 0.55) return "Classified"
    return "Ignored"
  }

  /**
   * 🔑 إنشاء عنوان عملة عشوائي
   */
  private generateRandomMint(): string {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    let result = ""
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 📊 الحصول على جميع العملات
   */
  getTokens(): EnhancedToken[] {
    return Array.from(this.tokens.values()).sort((a, b) => b.createdTimestamp - a.createdTimestamp)
  }

  /**
   * 🔍 البحث عن عملة
   */
  searchTokens(query: string): EnhancedToken[] {
    const searchTerm = query.toLowerCase()
    return this.getTokens().filter(
      (token) =>
        token.name.toLowerCase().includes(searchTerm) ||
        token.symbol.toLowerCase().includes(searchTerm) ||
        token.mint.toLowerCase().includes(searchTerm),
    )
  }

  /**
   * 📊 الحصول على الإحصائيات
   */
  getStats(): ServiceStats {
    return { ...this.stats }
  }

  /**
   * 🔍 الحصول على عملة محددة
   */
  getToken(mint: string): EnhancedToken | null {
    return this.tokens.get(mint) || null
  }

  /**
   * 👂 إضافة مستمع للتحديثات
   */
  addListener(callback: (tokens: EnhancedToken[], stats: ServiceStats) => void): void {
    this.listeners.push(callback)
    console.log(`👂 تم إضافة مستمع للخدمة المحسنة - المجموع: ${this.listeners.length}`)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (tokens: EnhancedToken[], stats: ServiceStats) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
    console.log(`🔕 تم إزالة مستمع من الخدمة المحسنة - المتبقي: ${this.listeners.length}`)
  }

  /**
   * 📢 إشعار جميع المستمعين
   */
  private notifyListeners(): void {
    const tokens = this.getTokens()
    const stats = this.getStats()

    this.listeners.forEach((callback, index) => {
      try {
        callback(tokens, stats)
      } catch (error) {
        errorRecoveryService.logError("LISTENER_NOTIFICATION", `Failed to notify listener ${index}`, error)
      }
    })
  }

  /**
   * 🔄 إعادة تشغيل الخدمة
   */
  async restart(): Promise<void> {
    console.log("🔄 إعادة تشغيل الخدمة المحسنة...")

    try {
      this.stop()
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await this.start()

      errorRecoveryService.logInfo("ENHANCED_TOKEN_SERVICE", "Service restarted successfully", {
        restartTime: new Date().toISOString(),
      })
    } catch (error) {
      errorRecoveryService.logCritical("ENHANCED_TOKEN_SERVICE", "Failed to restart service", error)
      throw error
    }
  }

  /**
   * 🛑 إيقاف الخدمة
   */
  stop(): void {
    console.log("🛑 إيقاف الخدمة المحسنة...")

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    if (this.validationInterval) {
      clearInterval(this.validationInterval)
      this.validationInterval = null
    }

    this.isRunning = false
    this.listeners = []
    this.tokens.clear()

    // إيقاف الخدمات المرتبطة
    criteriaValidationService.stop()
    errorRecoveryService.stop()

    console.log("✅ تم إيقاف الخدمة المحسنة")
  }
}

// إنشاء instance واحد للاستخدام
export const enhancedTokenService = new EnhancedTokenService()
