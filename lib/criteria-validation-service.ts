/**
 * 🎯 خدمة التحقق من المعايير الشاملة
 * التأكد من تطبيق جميع المعايير على كل العملات
 */

import { errorRecoveryService } from "./error-recovery-service"
import type { SimpleToken } from "./simple-token-service"

export interface CriteriaResult {
  criterion: string
  passed: boolean
  score: number
  details: any
  weight: number
  impact: "HIGH" | "MEDIUM" | "LOW"
}

export interface ValidationResult {
  tokenMint: string
  overallScore: number
  recommendation: "Recommended" | "Classified" | "Ignored"
  criteriaResults: CriteriaResult[]
  validationTimestamp: number
  processingTime: number
  errors: string[]
  warnings: string[]
  completeness: number // نسبة اكتمال التحقق
  confidence: number
}

export interface CriteriaDefinition {
  id: string
  name: string
  description: string
  weight: number
  required: boolean
  validator: (token: SimpleToken) => Promise<CriteriaResult>
  fallbackValue?: number
  timeout: number
}

class CriteriaValidationService {
  private criteria: Map<string, CriteriaDefinition> = new Map()
  private validationCache: Map<string, ValidationResult> = new Map()
  private isInitialized = false
  private validationQueue: SimpleToken[] = []
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null
  private stats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    averageProcessingTime: 0,
    criteriaSuccessRates: new Map<string, number>(),
  }

  constructor() {
    this.initializeCriteria()
  }

  /**
   * 🚀 تهيئة جميع المعايير
   */
  private initializeCriteria(): void {
    console.log("🎯 تهيئة معايير التحقق الشاملة...")

    try {
      // معيار العمر (مطلوب)
      this.criteria.set("age-validation", {
        id: "age-validation",
        name: "Age Validation",
        description: "التحقق من عمر العملة",
        weight: 15,
        required: true,
        timeout: 5000,
        validator: async (token: SimpleToken) => {
          try {
            const ageMinutes = token.ageInMinutes || 0
            const score = Math.max(0, Math.min(100, 100 - ageMinutes * 2)) // كلما كانت أحدث كلما كان أفضل

            return {
              criterion: "age-validation",
              passed: ageMinutes <= 60, // أقل من ساعة
              score,
              details: {
                ageMinutes,
                ageSeconds: token.secondsSinceCreation,
                isNew: ageMinutes < 5,
                isFresh: ageMinutes < 20,
              },
              weight: 15,
              impact: "HIGH",
            }
          } catch (error) {
            errorRecoveryService.logError("CRITERIA_VALIDATION", "Age validation failed", {
              token: token.symbol,
              error,
            })
            throw error
          }
        },
      })

      // معيار السعر (مطلوب)
      this.criteria.set("price-validation", {
        id: "price-validation",
        name: "Price Validation",
        description: "التحقق من سعر العملة",
        weight: 20,
        required: true,
        timeout: 3000,
        validator: async (token: SimpleToken) => {
          try {
            const price = token.price || 0
            const isValidPrice = price > 0 && price < 1
            const score = isValidPrice ? Math.min(100, (1 - price) * 100) : 0

            return {
              criterion: "price-validation",
              passed: isValidPrice,
              score,
              details: {
                price,
                priceRange: this.getPriceRange(price),
                isAffordable: price < 0.01,
                priceChange24h: token.priceChange24h,
              },
              weight: 20,
              impact: "HIGH",
            }
          } catch (error) {
            errorRecoveryService.logError("CRITERIA_VALIDATION", "Price validation failed", {
              token: token.symbol,
              error,
            })
            throw error
          }
        },
      })

      // معيار القيمة السوقية (مطلوب)
      this.criteria.set("market-cap-validation", {
        id: "market-cap-validation",
        name: "Market Cap Validation",
        description: "التحقق من القيمة السوقية",
        weight: 25,
        required: true,
        timeout: 3000,
        validator: async (token: SimpleToken) => {
          try {
            const marketCap = token.marketCap || 0
            const isValidMarketCap = marketCap > 1000 && marketCap < 15000 // بين 1K و 15K
            const score = isValidMarketCap ? Math.min(100, (marketCap / 15000) * 100) : 0

            return {
              criterion: "market-cap-validation",
              passed: isValidMarketCap,
              score,
              details: {
                marketCap,
                marketCapRange: this.getMarketCapRange(marketCap),
                isInRange: isValidMarketCap,
                growth: marketCap > 5000 ? "HIGH" : marketCap > 2000 ? "MEDIUM" : "LOW",
              },
              weight: 25,
              impact: "HIGH",
            }
          } catch (error) {
            errorRecoveryService.logError("CRITERIA_VALIDATION", "Market cap validation failed", {
              token: token.symbol,
              error,
            })
            throw error
          }
        },
      })

      // معيار الحجم
      this.criteria.set("volume-validation", {
        id: "volume-validation",
        name: "Volume Validation",
        description: "التحقق من حجم التداول",
        weight: 15,
        required: false,
        timeout: 3000,
        fallbackValue: 50,
        validator: async (token: SimpleToken) => {
          try {
            const volume = token.volume24h || 0
            const score = Math.min(100, (volume / 100000) * 100)

            return {
              criterion: "volume-validation",
              passed: volume > 1000,
              score,
              details: {
                volume24h: volume,
                volumeCategory: this.getVolumeCategory(volume),
                isActive: volume > 10000,
              },
              weight: 15,
              impact: "MEDIUM",
            }
          } catch (error) {
            errorRecoveryService.logError("CRITERIA_VALIDATION", "Volume validation failed", {
              token: token.symbol,
              error,
            })
            throw error
          }
        },
      })

      // معيار الحاملين
      this.criteria.set("holders-validation", {
        id: "holders-validation",
        name: "Holders Validation",
        description: "التحقق من عدد الحاملين",
        weight: 10,
        required: false,
        timeout: 3000,
        fallbackValue: 60,
        validator: async (token: SimpleToken) => {
          try {
            const holders = token.holders || 0
            const score = Math.min(100, (holders / 1000) * 100)

            return {
              criterion: "holders-validation",
              passed: holders > 10,
              score,
              details: {
                holders,
                holderCategory: this.getHolderCategory(holders),
                distribution: holders > 100 ? "GOOD" : holders > 50 ? "FAIR" : "POOR",
              },
              weight: 10,
              impact: "MEDIUM",
            }
          } catch (error) {
            errorRecoveryService.logError("CRITERIA_VALIDATION", "Holders validation failed", {
              token: token.symbol,
              error,
            })
            throw error
          }
        },
      })

      // معيار الاسم والرمز
      this.criteria.set("name-symbol-validation", {
        id: "name-symbol-validation",
        name: "Name & Symbol Validation",
        description: "التحقق من صحة الاسم والرمز",
        weight: 8,
        required: true,
        timeout: 2000,
        validator: async (token: SimpleToken) => {
          try {
            const hasValidName = token.name && token.name.length > 2 && token.name.length < 50
            const hasValidSymbol = token.symbol && token.symbol.length > 1 && token.symbol.length < 10
            const isUnique = !this.isDuplicateName(token.name, token.symbol)

            const score = (hasValidName ? 40 : 0) + (hasValidSymbol ? 40 : 0) + (isUnique ? 20 : 0)

            return {
              criterion: "name-symbol-validation",
              passed: hasValidName && hasValidSymbol,
              score,
              details: {
                name: token.name,
                symbol: token.symbol,
                nameLength: token.name?.length || 0,
                symbolLength: token.symbol?.length || 0,
                isUnique,
                hasValidName,
                hasValidSymbol,
              },
              weight: 8,
              impact: "LOW",
            }
          } catch (error) {
            errorRecoveryService.logError("CRITERIA_VALIDATION", "Name/Symbol validation failed", {
              token: token.symbol,
              error,
            })
            throw error
          }
        },
      })

      // معيار الحالة
      this.criteria.set("status-validation", {
        id: "status-validation",
        name: "Status Validation",
        description: "التحقق من حالة العملة",
        weight: 7,
        required: false,
        timeout: 2000,
        fallbackValue: 70,
        validator: async (token: SimpleToken) => {
          try {
            const isLive = token.isLive !== false
            const isComplete = token.complete === true
            const score = (isLive ? 60 : 0) + (isComplete ? 40 : 20)

            return {
              criterion: "status-validation",
              passed: isLive,
              score,
              details: {
                isLive,
                isComplete,
                status: isComplete ? "COMPLETED" : isLive ? "LIVE" : "INACTIVE",
              },
              weight: 7,
              impact: "LOW",
            }
          } catch (error) {
            errorRecoveryService.logError("CRITERIA_VALIDATION", "Status validation failed", {
              token: token.symbol,
              error,
            })
            throw error
          }
        },
      })

      this.isInitialized = true
      console.log(`✅ تم تهيئة ${this.criteria.size} معيار للتحقق`)

      // بدء معالجة الطابور
      this.startQueueProcessing()
    } catch (error) {
      errorRecoveryService.logCritical("CRITERIA_VALIDATION", "Failed to initialize criteria", error)
      throw error
    }
  }

  /**
   * 🔄 بدء معالجة طابور التحقق
   */
  private startQueueProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }

    this.processingInterval = setInterval(() => {
      this.processValidationQueue()
    }, 2000) // معالجة كل ثانيتين

    console.log("🔄 بدء معالجة طابور التحقق من المعايير")
  }

  /**
   * 📋 معالجة طابور التحقق
   */
  private async processValidationQueue(): Promise<void> {
    if (this.isProcessing || this.validationQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      // معالجة حتى 5 عملات في المرة الواحدة
      const tokensToProcess = this.validationQueue.splice(0, 5)

      console.log(`🔍 معالجة ${tokensToProcess.length} عملة من طابور التحقق`)

      const validationPromises = tokensToProcess.map((token) =>
        this.validateTokenCriteria(token).catch((error) => {
          errorRecoveryService.logError("CRITERIA_VALIDATION", "Queue processing error", {
            token: token.symbol,
            error,
          })
          return null
        }),
      )

      await Promise.all(validationPromises)
    } catch (error) {
      errorRecoveryService.logError("CRITERIA_VALIDATION", "Queue processing failed", error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * ✅ التحقق من جميع معايير العملة
   */
  async validateTokenCriteria(token: SimpleToken): Promise<ValidationResult> {
    const startTime = Date.now()

    try {
      console.log(`🎯 بدء التحقق الشامل من معايير العملة: ${token.symbol}`)

      // التحقق من وجود العملة في الكاش
      const cached = this.validationCache.get(token.mint)
      if (cached && Date.now() - cached.validationTimestamp < 300000) {
        // 5 دقائق
        console.log(`📋 استخدام النتيجة المحفوظة للعملة: ${token.symbol}`)
        return cached
      }

      const criteriaResults: CriteriaResult[] = []
      const errors: string[] = []
      const warnings: string[] = []
      let completedCriteria = 0

      // تنفيذ جميع المعايير
      for (const [criteriaId, criteria] of this.criteria) {
        try {
          console.log(`🔍 تطبيق معيار: ${criteria.name} على ${token.symbol}`)

          const result = await Promise.race([
            criteria.validator(token),
            new Promise<CriteriaResult>((_, reject) =>
              setTimeout(() => reject(new Error(`Criteria timeout: ${criteria.name}`)), criteria.timeout),
            ),
          ])

          criteriaResults.push(result)
          completedCriteria++

          // تحديث إحصائيات نجاح المعايير
          const currentRate = this.stats.criteriaSuccessRates.get(criteriaId) || 0
          this.stats.criteriaSuccessRates.set(criteriaId, currentRate + (result.passed ? 1 : 0))

          console.log(`✅ نجح معيار ${criteria.name}: ${result.passed ? "PASSED" : "FAILED"} (${result.score}%)`)
        } catch (error) {
          console.error(`❌ فشل معيار ${criteria.name}:`, error)

          if (criteria.required) {
            errors.push(`Required criteria failed: ${criteria.name}`)
          } else {
            warnings.push(`Optional criteria failed: ${criteria.name}`)

            // استخدام القيمة الافتراضية
            if (criteria.fallbackValue !== undefined) {
              criteriaResults.push({
                criterion: criteriaId,
                passed: false,
                score: criteria.fallbackValue,
                details: { error: error.message, usedFallback: true },
                weight: criteria.weight,
                impact: "LOW",
              })
              completedCriteria++
            }
          }

          errorRecoveryService.logError("CRITERIA_VALIDATION", `Criteria validation failed: ${criteria.name}`, {
            token: token.symbol,
            criteriaId,
            error: error.message,
          })
        }
      }

      // حساب النتيجة الإجمالية
      const overallScore = this.calculateOverallScore(criteriaResults)
      const recommendation = this.determineRecommendation(overallScore, errors.length)
      const completeness = (completedCriteria / this.criteria.size) * 100
      const confidence = this.calculateConfidence(criteriaResults, completeness)

      const validationResult: ValidationResult = {
        tokenMint: token.mint,
        overallScore,
        recommendation,
        criteriaResults,
        validationTimestamp: Date.now(),
        processingTime: Date.now() - startTime,
        errors,
        warnings,
        completeness,
        confidence,
      }

      // حفظ في الكاش
      this.validationCache.set(token.mint, validationResult)

      // تنظيف الكاش القديم
      this.cleanupCache()

      // تحديث الإحصائيات
      this.updateStats(validationResult)

      console.log(`✅ اكتمل التحقق من ${token.symbol}: ${recommendation} (${overallScore.toFixed(1)}%)`)

      return validationResult
    } catch (error) {
      const processingTime = Date.now() - startTime

      errorRecoveryService.logError("CRITERIA_VALIDATION", "Token validation failed completely", {
        token: token.symbol,
        processingTime,
        error: error.message,
      })

      // إرجاع نتيجة فشل
      const failedResult: ValidationResult = {
        tokenMint: token.mint,
        overallScore: 0,
        recommendation: "Ignored",
        criteriaResults: [],
        validationTimestamp: Date.now(),
        processingTime,
        errors: [`Complete validation failure: ${error.message}`],
        warnings: [],
        completeness: 0,
        confidence: 0,
      }

      this.stats.failedValidations++
      return failedResult
    }
  }

  /**
   * 📊 حساب النتيجة الإجمالية
   */
  private calculateOverallScore(criteriaResults: CriteriaResult[]): number {
    if (criteriaResults.length === 0) return 0

    let totalWeightedScore = 0
    let totalWeight = 0

    criteriaResults.forEach((result) => {
      totalWeightedScore += result.score * result.weight
      totalWeight += result.weight
    })

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
  }

  /**
   * 🎯 تحديد التوصية
   */
  private determineRecommendation(score: number, errorCount: number): "Recommended" | "Classified" | "Ignored" {
    if (errorCount > 0) return "Ignored" // أي خطأ في المعايير المطلوبة

    if (score >= 75) return "Recommended"
    if (score >= 50) return "Classified"
    return "Ignored"
  }

  /**
   * 🎯 حساب الثقة
   */
  private calculateConfidence(criteriaResults: CriteriaResult[], completeness: number): number {
    if (criteriaResults.length === 0) return 0

    const avgScore = criteriaResults.reduce((sum, result) => sum + result.score, 0) / criteriaResults.length
    const consistencyBonus = this.calculateConsistency(criteriaResults)

    return Math.min(100, avgScore * 0.7 + completeness * 0.2 + consistencyBonus * 0.1)
  }

  /**
   * 📊 حساب الاتساق
   */
  private calculateConsistency(criteriaResults: CriteriaResult[]): number {
    if (criteriaResults.length < 2) return 100

    const scores = criteriaResults.map((r) => r.score)
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)

    // كلما قل الانحراف المعياري، كلما زاد الاتساق
    return Math.max(0, 100 - standardDeviation * 2)
  }

  /**
   * 🧹 تنظيف الكاش القديم
   */
  private cleanupCache(): void {
    const oneHourAgo = Date.now() - 3600000
    const keysToDelete: string[] = []

    this.validationCache.forEach((result, key) => {
      if (result.validationTimestamp < oneHourAgo) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.validationCache.delete(key))

    if (keysToDelete.length > 0) {
      console.log(`🧹 تم تنظيف ${keysToDelete.length} نتيجة قديمة من الكاش`)
    }
  }

  /**
   * 📊 تحديث الإحصائيات
   */
  private updateStats(result: ValidationResult): void {
    this.stats.totalValidations++

    if (result.errors.length === 0) {
      this.stats.successfulValidations++
    } else {
      this.stats.failedValidations++
    }

    // تحديث متوسط وقت المعالجة
    this.stats.averageProcessingTime =
      (this.stats.averageProcessingTime * (this.stats.totalValidations - 1) + result.processingTime) /
      this.stats.totalValidations
  }

  /**
   * ➕ إضافة عملة للتحقق
   */
  addTokenForValidation(token: SimpleToken): void {
    // تجنب التكرار
    const exists = this.validationQueue.some((t) => t.mint === token.mint)
    if (!exists) {
      this.validationQueue.push(token)
      console.log(`➕ تم إضافة ${token.symbol} لطابور التحقق (${this.validationQueue.length} في الانتظار)`)
    }
  }

  /**
   * 📋 إضافة عملات متعددة للتحقق
   */
  addTokensForValidation(tokens: SimpleToken[]): void {
    tokens.forEach((token) => this.addTokenForValidation(token))
  }

  /**
   * 📊 الحصول على نتيجة التحقق
   */
  getValidationResult(tokenMint: string): ValidationResult | null {
    return this.validationCache.get(tokenMint) || null
  }

  /**
   * 📊 الحصول على إحصائيات التحقق
   */
  getValidationStats(): {
    totalValidations: number
    successfulValidations: number
    failedValidations: number
    successRate: number
    averageProcessingTime: number
    queueLength: number
    cacheSize: number
    criteriaCount: number
    criteriaSuccessRates: Record<string, number>
  } {
    const criteriaSuccessRates: Record<string, number> = {}
    this.stats.criteriaSuccessRates.forEach((rate, criteriaId) => {
      criteriaSuccessRates[criteriaId] =
        this.stats.totalValidations > 0 ? (rate / this.stats.totalValidations) * 100 : 0
    })

    return {
      totalValidations: this.stats.totalValidations,
      successfulValidations: this.stats.successfulValidations,
      failedValidations: this.stats.failedValidations,
      successRate:
        this.stats.totalValidations > 0 ? (this.stats.successfulValidations / this.stats.totalValidations) * 100 : 0,
      averageProcessingTime: this.stats.averageProcessingTime,
      queueLength: this.validationQueue.length,
      cacheSize: this.validationCache.size,
      criteriaCount: this.criteria.size,
      criteriaSuccessRates,
    }
  }

  // Helper methods
  private getPriceRange(price: number): string {
    if (price < 0.0001) return "MICRO"
    if (price < 0.001) return "VERY_LOW"
    if (price < 0.01) return "LOW"
    if (price < 0.1) return "MEDIUM"
    return "HIGH"
  }

  private getMarketCapRange(marketCap: number): string {
    if (marketCap < 1000) return "VERY_SMALL"
    if (marketCap < 5000) return "SMALL"
    if (marketCap < 15000) return "TARGET"
    if (marketCap < 50000) return "MEDIUM"
    return "LARGE"
  }

  private getVolumeCategory(volume: number): string {
    if (volume < 1000) return "LOW"
    if (volume < 10000) return "MEDIUM"
    if (volume < 50000) return "HIGH"
    return "VERY_HIGH"
  }

  private getHolderCategory(holders: number): string {
    if (holders < 10) return "VERY_FEW"
    if (holders < 50) return "FEW"
    if (holders < 200) return "MODERATE"
    if (holders < 500) return "MANY"
    return "VERY_MANY"
  }

  private isDuplicateName(name: string, symbol: string): boolean {
    // محاكاة فحص التكرار
    return Math.random() < 0.1 // 10% احتمال التكرار
  }

  /**
   * 🛑 إيقاف الخدمة
   */
  stop(): void {
    console.log("🛑 إيقاف خدمة التحقق من المعايير...")

    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    this.validationQueue = []
    this.validationCache.clear()
    this.isProcessing = false

    console.log("✅ تم إيقاف خدمة التحقق من المعايير")
  }
}

// إنشاء instance واحد للاستخدام
export const criteriaValidationService = new CriteriaValidationService()
