/**
 * 🎯 نظام المراقبة المستمر - 60 دقيقة كاملة من لحظة النشر
 * مراقبة العملات من صفر ثانية في PUMP.FUN مع عدم الاستبعاد قبل 60 دقيقة
 */

import { stableDataService, type StableTokenInfo } from "./stable-data-service"
import { tokenAnalyzer, type TokenAnalysis } from "./token-analyzer"

export interface ContinuousMonitoredToken extends StableTokenInfo {
  // معلومات المراقبة الدقيقة
  pumpFunCreationTime: number // وقت النشر الفعلي في pump.fun
  monitoringStartTime: number // وقت بداية المراقبة في نظامنا
  monitoringEndTime: number // وقت انتهاء المراقبة (60 دقيقة من النشر)
  exactMonitoringProgress: number // 0-100% بدقة
  exactTimeRemaining: number // بالثواني المتبقية
  secondsSinceCreation: number // ثواني منذ النشر في pump.fun

  // معلومات التحليل المستمر
  analysisHistory: Array<{
    timestamp: number
    analysis: TokenAnalysis
    secondsSinceCreation: number
  }>
  currentAnalysis?: TokenAnalysis
  analysisCount: number
  lastAnalysisTime?: number

  // حالة المراقبة المستمرة
  monitoringStatus: "fresh" | "monitoring" | "analyzing" | "qualified" | "pending_decision" | "final_decision"
  canBeRejected: boolean // false حتى تمر 60 دقيقة كاملة
  qualificationDecision?: "qualified" | "rejected"
  qualificationTime?: number
  rejectionTime?: number

  // إحصائيات مفصلة
  priceAtCreation: number
  priceHistory: Array<{ timestamp: number; price: number; secondsSinceCreation: number }>
  volumeHistory: Array<{ timestamp: number; volume: number; secondsSinceCreation: number }>
  holderHistory: Array<{ timestamp: number; holders: number; secondsSinceCreation: number }>
  marketCapHistory: Array<{ timestamp: number; marketCap: number; secondsSinceCreation: number }>
}

export interface ContinuousMonitoringStats {
  // إحصائيات المراقبة المستمرة
  totalTokensDetected: number
  currentlyMonitoring: number
  completedMonitoring: number
  qualified: number
  rejected: number

  // توزيع التقييمات النهائية
  finalRecommended: number
  finalClassified: number
  finalIgnored: number

  // معدلات الأداء
  detectionRate: number // عملات جديدة في الدقيقة
  qualificationRate: number // نسبة التأهيل
  averageDecisionTime: number // متوسط وقت اتخاذ القرار
  systemEfficiency: number // كفاءة النظام

  // إعدادات النظام
  monitoringDurationMinutes: number
  analysisIntervalSeconds: number
  maxConcurrentAnalysis: number

  // إحصائيات الوقت الفعلي
  tokensDetectedToday: number
  tokensQualifiedToday: number
  tokensRejectedToday: number
  systemUptimeHours: number
  lastDetectionTime?: number
}

class ContinuousMonitoringService {
  private monitoredTokens: Map<string, ContinuousMonitoredToken> = new Map()
  private qualifiedTokens: Map<string, ContinuousMonitoredToken> = new Map()
  private completedTokens: Map<string, ContinuousMonitoredToken> = new Map()

  private detectionInterval: NodeJS.Timeout | null = null
  private monitoringInterval: NodeJS.Timeout | null = null
  private analysisInterval: NodeJS.Timeout | null = null
  private progressUpdateInterval: NodeJS.Timeout | null = null

  private analysisQueue: string[] = []
  private isProcessingAnalysis = false
  private systemStartTime = Date.now()
  private lastTokenDetection = 0

  private listeners: ((qualified: ContinuousMonitoredToken[], stats: ContinuousMonitoringStats) => void)[] = []

  // إعدادات النظام المستمر
  private readonly MONITORING_DURATION = 60 * 60 * 1000 // 60 دقيقة بالضبط
  private readonly DETECTION_INTERVAL = 10 * 1000 // كشف العملات الجديدة كل 10 ثوان
  private readonly ANALYSIS_INTERVAL = 30 * 1000 // تحليل كل 30 ثانية
  private readonly PROGRESS_UPDATE_INTERVAL = 1000 // تحديث التقدم كل ثانية
  private readonly MONITORING_CHECK_INTERVAL = 5 * 1000 // فحص انتهاء المراقبة كل 5 ثوان
  private readonly PRICE_TRACKING_INTERVAL = 60 * 1000 // تتبع الأسعار كل دقيقة
  private readonly MAX_CONCURRENT_ANALYSIS = 3

  /**
   * 🚀 بدء النظام المستمر
   */
  async startContinuousMonitoring(): Promise<void> {
    console.log("🎯 بدء نظام المراقبة المستمر - 60 دقيقة من لحظة النشر...")

    // تهيئة خدمة البيانات
    await stableDataService.initialize()

    // بدء دورات المراقبة المختلفة
    this.startTokenDetection()
    this.startMonitoringCycle()
    this.startAnalysisCycle()
    this.startProgressUpdates()
    this.startPriceTracking()

    console.log("✅ تم بدء النظام المستمر بنجاح - لا توجد أزرار تحديث يدوي")
  }

  /**
   * 🔍 دورة كشف العملات الجديدة المستمرة
   */
  private startTokenDetection(): void {
    this.detectionInterval = setInterval(async () => {
      await this.detectNewTokens()
    }, this.DETECTION_INTERVAL)

    // كشف فوري عند البداية
    this.detectNewTokens()
  }

  /**
   * 🆕 كشف العملات الجديدة من pump.fun
   */
  private async detectNewTokens(): Promise<void> {
    try {
      const newTokens = await stableDataService.getTokens()
      const now = Date.now()
      let detectedCount = 0

      for (const token of newTokens) {
        // تحقق من عدم وجود العملة مسبقاً
        if (
          this.monitoredTokens.has(token.mint) ||
          this.qualifiedTokens.has(token.mint) ||
          this.completedTokens.has(token.mint)
        ) {
          continue
        }

        // تحقق من المعايير الأساسية
        if (!token.meetsBasicCriteria) {
          console.log(`❌ رفض فوري للعملة ${token.symbol} - لا تلبي المعايير الأساسية`)
          continue
        }

        // حساب الوقت الفعلي للنشر في pump.fun
        const pumpFunCreationTime = token.createdTimestamp * 1000 // تحويل إلى milliseconds
        const secondsSinceCreation = Math.floor((now - pumpFunCreationTime) / 1000)

        // إنشاء عملة للمراقبة المستمرة
        const continuousToken: ContinuousMonitoredToken = {
          ...token,
          pumpFunCreationTime,
          monitoringStartTime: now,
          monitoringEndTime: pumpFunCreationTime + this.MONITORING_DURATION, // 60 دقيقة من وقت النشر
          exactMonitoringProgress: 0,
          exactTimeRemaining: Math.max(0, (pumpFunCreationTime + this.MONITORING_DURATION - now) / 1000),
          secondsSinceCreation,
          analysisHistory: [],
          analysisCount: 0,
          monitoringStatus: secondsSinceCreation < 60 ? "fresh" : "monitoring", // جديدة إذا أقل من دقيقة
          canBeRejected: false, // لا يمكن رفضها حتى تمر 60 دقيقة
          priceAtCreation: token.price,
          priceHistory: [{ timestamp: now, price: token.price, secondsSinceCreation }],
          volumeHistory: [{ timestamp: now, volume: token.volume24h, secondsSinceCreation }],
          holderHistory: [{ timestamp: now, holders: token.holders, secondsSinceCreation }],
          marketCapHistory: [{ timestamp: now, marketCap: token.marketCap, secondsSinceCreation }],
        }

        this.monitoredTokens.set(token.mint, continuousToken)

        // إضافة للطابور للتحليل
        if (!this.analysisQueue.includes(token.mint)) {
          this.analysisQueue.push(token.mint)
        }

        detectedCount++
        this.lastTokenDetection = now

        console.log(`🔍 تم كشف العملة ${token.symbol} - عمرها ${secondsSinceCreation} ثانية من النشر في pump.fun`)
      }

      if (detectedCount > 0) {
        console.log(`🎯 تم كشف ${detectedCount} عملة جديدة للمراقبة المستمرة`)
        this.notifyListeners()
      }
    } catch (error) {
      console.error("❌ خطأ في كشف العملات الجديدة:", error)
    }
  }

  /**
   * 🔄 دورة المراقبة الرئيسية
   */
  private startMonitoringCycle(): void {
    this.monitoringInterval = setInterval(() => {
      this.processMonitoringCycle()
    }, this.MONITORING_CHECK_INTERVAL)
  }

  /**
   * ⏰ معالجة دورة المراقبة
   */
  private processMonitoringCycle(): void {
    const now = Date.now()
    let processedCount = 0

    for (const [mint, token] of this.monitoredTokens.entries()) {
      // تحديث الوقت المتبقي والتقدم
      const timeElapsedSinceCreation = now - token.pumpFunCreationTime
      const progress = Math.min(100, (timeElapsedSinceCreation / this.MONITORING_DURATION) * 100)
      const timeRemaining = Math.max(0, (token.monitoringEndTime - now) / 1000)

      token.exactMonitoringProgress = progress
      token.exactTimeRemaining = timeRemaining
      token.secondsSinceCreation = Math.floor((now - token.pumpFunCreationTime) / 1000)

      // تحقق من انتهاء فترة المراقبة (60 دقيقة كاملة)
      if (now >= token.monitoringEndTime) {
        token.canBeRejected = true // الآن يمكن اتخاذ القرار النهائي
        this.finalizeTokenDecision(token)
        this.monitoredTokens.delete(mint)
        processedCount++
      }
    }

    if (processedCount > 0) {
      console.log(`⏰ تم معالجة ${processedCount} عملة بعد انتهاء 60 دقيقة من النشر`)
      this.notifyListeners()
    }
  }

  /**
   * 🧠 دورة التحليل المستمر
   */
  private startAnalysisCycle(): void {
    this.analysisInterval = setInterval(() => {
      if (!this.isProcessingAnalysis && this.analysisQueue.length > 0) {
        this.processAnalysisQueue()
      }
    }, this.ANALYSIS_INTERVAL)
  }

  /**
   * 🔬 معالجة طابور التحليل
   */
  private async processAnalysisQueue(): Promise<void> {
    if (this.isProcessingAnalysis || this.analysisQueue.length === 0) {
      return
    }

    this.isProcessingAnalysis = true
    const batchSize = Math.min(this.MAX_CONCURRENT_ANALYSIS, this.analysisQueue.length)

    try {
      const batch = this.analysisQueue.splice(0, batchSize)
      const analysisPromises = batch.map((mint) => this.analyzeTokenContinuously(mint))

      await Promise.allSettled(analysisPromises)
      this.notifyListeners()
    } catch (error) {
      console.error("❌ خطأ في معالجة طابور التحليل المستمر:", error)
    } finally {
      this.isProcessingAnalysis = false
    }
  }

  /**
   * 🔬 تحليل العملة بشكل مستمر
   */
  private async analyzeTokenContinuously(mint: string): Promise<void> {
    const token = this.monitoredTokens.get(mint)
    if (!token) return

    try {
      token.monitoringStatus = "analyzing"
      token.analysisCount++
      token.lastAnalysisTime = Date.now()

      console.log(
        `🧠 تحليل مستمر للعملة ${token.symbol} (التحليل ${token.analysisCount}) - عمرها ${token.secondsSinceCreation} ثانية`,
      )

      const analysis = await tokenAnalyzer.analyzeToken(token)
      token.currentAnalysis = analysis

      // إضافة التحليل للتاريخ
      token.analysisHistory.push({
        timestamp: Date.now(),
        analysis,
        secondsSinceCreation: token.secondsSinceCreation,
      })

      // الاحتفاظ بآخر 10 تحليلات فقط
      if (token.analysisHistory.length > 10) {
        token.analysisHistory = token.analysisHistory.slice(-10)
      }

      // تحديث حالة العملة (لكن لا نرفضها حتى تمر 60 دقيقة)
      if (analysis.recommendation === "Recommended" || analysis.recommendation === "Classified") {
        token.monitoringStatus = "qualified"
        if (!token.qualificationTime) {
          token.qualificationTime = Date.now()
          console.log(
            `✅ العملة ${token.symbol} مؤهلة مؤقتاً - ${analysis.recommendation} (${analysis.overallScore.toFixed(1)}%)`,
          )
        }
      } else {
        token.monitoringStatus = "monitoring" // تبقى تحت المراقبة حتى لو كانت "Ignored"
        console.log(
          `⏳ العملة ${token.symbol} تحت المراقبة - ${analysis.recommendation} (${analysis.overallScore.toFixed(1)}%) - لا يمكن رفضها حتى تمر 60 دقيقة`,
        )
      }

      // إعادة إضافة للطابور للتحليل المستمر (إلا إذا كانت مؤهلة نهائياً)
      if (token.monitoringStatus !== "qualified" && !this.analysisQueue.includes(mint)) {
        this.analysisQueue.push(mint)
      }
    } catch (error) {
      console.error(`❌ خطأ في التحليل المستمر للعملة ${token.symbol}:`, error)
      token.monitoringStatus = "monitoring"

      // إعادة إضافة للطابور
      if (!this.analysisQueue.includes(mint)) {
        this.analysisQueue.push(mint)
      }
    }
  }

  /**
   * ✅ اتخاذ القرار النهائي (بعد 60 دقيقة كاملة)
   */
  private finalizeTokenDecision(token: ContinuousMonitoredToken): void {
    const now = Date.now()
    token.monitoringStatus = "final_decision"

    // القرار النهائي بناءً على آخر تحليل
    if (token.currentAnalysis) {
      if (
        token.currentAnalysis.recommendation === "Recommended" ||
        token.currentAnalysis.recommendation === "Classified"
      ) {
        // العملة مؤهلة - نقلها للعملات المؤهلة
        token.qualificationDecision = "qualified"
        if (!token.qualificationTime) {
          token.qualificationTime = now
        }
        this.qualifiedTokens.set(token.mint, token)
        console.log(
          `✅ قرار نهائي: العملة ${token.symbol} مؤهلة - ${token.currentAnalysis.recommendation} (${token.currentAnalysis.overallScore.toFixed(1)}%)`,
        )
      } else {
        // العملة مرفوضة - نقلها للمكتملة (لا تظهر في الواجهة)
        token.qualificationDecision = "rejected"
        token.rejectionTime = now
        this.completedTokens.set(token.mint, token)
        console.log(
          `❌ قرار نهائي: العملة ${token.symbol} مرفوضة بعد 60 دقيقة - ${token.currentAnalysis.recommendation} (${token.currentAnalysis.overallScore.toFixed(1)}%)`,
        )
      }
    } else {
      // لم يتم التحليل - رفض
      token.qualificationDecision = "rejected"
      token.rejectionTime = now
      this.completedTokens.set(token.mint, token)
      console.log(`❌ قرار نهائي: العملة ${token.symbol} مرفوضة - لم يتم التحليل خلال 60 دقيقة`)
    }
  }

  /**
   * 📈 تحديث التقدم المستمر
   */
  private startProgressUpdates(): void {
    this.progressUpdateInterval = setInterval(() => {
      this.updateProgress()
    }, this.PROGRESS_UPDATE_INTERVAL)
  }

  /**
   * 🔄 تحديث التقدم
   */
  private updateProgress(): void {
    const now = Date.now()
    let updatedCount = 0

    for (const [mint, token] of this.monitoredTokens.entries()) {
      const timeElapsedSinceCreation = now - token.pumpFunCreationTime
      const newProgress = Math.min(100, (timeElapsedSinceCreation / this.MONITORING_DURATION) * 100)
      const newTimeRemaining = Math.max(0, (token.monitoringEndTime - now) / 1000)
      const newSecondsSinceCreation = Math.floor((now - token.pumpFunCreationTime) / 1000)

      if (
        Math.abs(token.exactMonitoringProgress - newProgress) > 0.1 ||
        Math.abs(token.exactTimeRemaining - newTimeRemaining) > 1
      ) {
        token.exactMonitoringProgress = newProgress
        token.exactTimeRemaining = newTimeRemaining
        token.secondsSinceCreation = newSecondsSinceCreation
        updatedCount++
      }
    }

    if (updatedCount > 0) {
      this.notifyListeners()
    }
  }

  /**
   * 💰 تتبع الأسعار المستمر
   */
  private startPriceTracking(): void {
    setInterval(() => {
      this.updatePriceHistory()
    }, this.PRICE_TRACKING_INTERVAL)
  }

  /**
   * 📊 تحديث تاريخ الأسعار
   */
  private updatePriceHistory(): void {
    const now = Date.now()

    for (const [mint, token] of this.monitoredTokens.entries()) {
      const secondsSinceCreation = Math.floor((now - token.pumpFunCreationTime) / 1000)

      // إضافة نقاط جديدة للتاريخ
      token.priceHistory.push({ timestamp: now, price: token.price, secondsSinceCreation })
      token.volumeHistory.push({ timestamp: now, volume: token.volume24h, secondsSinceCreation })
      token.holderHistory.push({ timestamp: now, holders: token.holders, secondsSinceCreation })
      token.marketCapHistory.push({ timestamp: now, marketCap: token.marketCap, secondsSinceCreation })

      // الاحتفاظ بآخر 60 نقطة فقط (ساعة واحدة)
      if (token.priceHistory.length > 60) {
        token.priceHistory = token.priceHistory.slice(-60)
        token.volumeHistory = token.volumeHistory.slice(-60)
        token.holderHistory = token.holderHistory.slice(-60)
        token.marketCapHistory = token.marketCapHistory.slice(-60)
      }
    }
  }

  /**
   * 📊 الحصول على العملات المؤهلة
   */
  getContinuousQualifiedTokens(): ContinuousMonitoredToken[] {
    return Array.from(this.qualifiedTokens.values()).sort((a, b) => {
      // ترتيب حسب التقييم ثم وقت التأهيل
      const scoreA = a.currentAnalysis?.overallScore || 0
      const scoreB = b.currentAnalysis?.overallScore || 0

      if (scoreA !== scoreB) {
        return scoreB - scoreA
      }

      return (b.qualificationTime || 0) - (a.qualificationTime || 0)
    })
  }

  /**
   * 🔍 الحصول على العملات قيد المراقبة
   */
  getContinuousMonitoringTokens(): ContinuousMonitoredToken[] {
    return Array.from(this.monitoredTokens.values()).sort((a, b) => {
      // ترتيب حسب العمر (الأحدث أولاً)
      return a.secondsSinceCreation - b.secondsSinceCreation
    })
  }

  /**
   * 📈 الحصول على إحصائيات مفصلة
   */
  getContinuousStats(): ContinuousMonitoringStats {
    const now = Date.now()
    const monitoring = this.monitoredTokens.size
    const qualified = this.qualifiedTokens.size
    const completed = this.completedTokens.size
    const total = monitoring + qualified + completed

    // حساب التوزيع النهائي
    let finalRecommended = 0
    let finalClassified = 0
    let finalIgnored = 0

    for (const token of this.qualifiedTokens.values()) {
      if (token.currentAnalysis) {
        switch (token.currentAnalysis.recommendation) {
          case "Recommended":
            finalRecommended++
            break
          case "Classified":
            finalClassified++
            break
        }
      }
    }

    for (const token of this.completedTokens.values()) {
      if (token.currentAnalysis) {
        switch (token.currentAnalysis.recommendation) {
          case "Ignored":
            finalIgnored++
            break
        }
      }
    }

    // إحصائيات اليوم
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const tokensDetectedToday = Array.from(this.monitoredTokens.values())
      .concat(Array.from(this.qualifiedTokens.values()))
      .concat(Array.from(this.completedTokens.values()))
      .filter((t) => t.monitoringStartTime >= todayStart).length

    const tokensQualifiedToday = Array.from(this.qualifiedTokens.values()).filter(
      (t) => (t.qualificationTime || 0) >= todayStart,
    ).length

    const tokensRejectedToday = Array.from(this.completedTokens.values()).filter(
      (t) => (t.rejectionTime || 0) >= todayStart,
    ).length

    // معدل الكشف (عملات في الدقيقة)
    const uptimeMinutes = (now - this.systemStartTime) / (60 * 1000)
    const detectionRate = uptimeMinutes > 0 ? total / uptimeMinutes : 0

    return {
      totalTokensDetected: total,
      currentlyMonitoring: monitoring,
      completedMonitoring: qualified + completed,
      qualified,
      rejected: completed,
      finalRecommended,
      finalClassified,
      finalIgnored,
      detectionRate,
      qualificationRate: total > 0 ? (qualified / total) * 100 : 0,
      averageDecisionTime: this.MONITORING_DURATION / (60 * 1000), // 60 دقيقة دائماً
      systemEfficiency: total > 0 ? ((qualified + completed) / total) * 100 : 0,
      monitoringDurationMinutes: this.MONITORING_DURATION / (60 * 1000),
      analysisIntervalSeconds: this.ANALYSIS_INTERVAL / 1000,
      maxConcurrentAnalysis: this.MAX_CONCURRENT_ANALYSIS,
      tokensDetectedToday,
      tokensQualifiedToday,
      tokensRejectedToday,
      systemUptimeHours: (now - this.systemStartTime) / (60 * 60 * 1000),
      lastDetectionTime: this.lastTokenDetection,
    }
  }

  /**
   * 👂 إضافة مستمع للتحديثات
   */
  addListener(callback: (qualified: ContinuousMonitoredToken[], stats: ContinuousMonitoringStats) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 📢 إشعار المستمعين
   */
  private notifyListeners(): void {
    const qualifiedTokens = this.getContinuousQualifiedTokens()
    const stats = this.getContinuousStats()

    this.listeners.forEach((callback) => {
      try {
        callback(qualifiedTokens, stats)
      } catch (error) {
        console.error("خطأ في إشعار مستمع المراقبة المستمرة:", error)
      }
    })
  }

  /**
   * 🔄 إعادة تشغيل النظام
   */
  async restartContinuous(): Promise<void> {
    console.log("🔄 إعادة تشغيل النظام المستمر...")

    this.stop()

    // مسح البيانات
    this.monitoredTokens.clear()
    this.qualifiedTokens.clear()
    this.completedTokens.clear()
    this.analysisQueue = []
    this.systemStartTime = Date.now()
    this.lastTokenDetection = 0

    await this.startContinuousMonitoring()

    console.log("✅ تم إعادة تشغيل النظام المستمر بنجاح")
  }

  /**
   * 🛑 إيقاف النظام
   */
  stop(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = null
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval)
      this.analysisInterval = null
    }

    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval)
      this.progressUpdateInterval = null
    }

    this.listeners = []
    console.log("🛑 تم إيقاف النظام المستمر")
  }

  /**
   * 📊 حالة النظام
   */
  getSystemStatus(): {
    isRunning: boolean
    monitoringCount: number
    qualifiedCount: number
    completedCount: number
    queueLength: number
    isProcessing: boolean
    uptimeHours: number
    lastDetection: number
    detectionRate: number
  } {
    const now = Date.now()
    const uptimeHours = (now - this.systemStartTime) / (60 * 60 * 1000)
    const total = this.monitoredTokens.size + this.qualifiedTokens.size + this.completedTokens.size

    return {
      isRunning: this.detectionInterval !== null,
      monitoringCount: this.monitoredTokens.size,
      qualifiedCount: this.qualifiedTokens.size,
      completedCount: this.completedTokens.size,
      queueLength: this.analysisQueue.length,
      isProcessing: this.isProcessingAnalysis,
      uptimeHours,
      lastDetection: this.lastTokenDetection,
      detectionRate: uptimeHours > 0 ? total / (uptimeHours * 60) : 0, // عملات في الدقيقة
    }
  }
}

// إنشاء instance واحد للاستخدام
export const continuousMonitoringService = new ContinuousMonitoringService()
export type { ContinuousMonitoredToken, ContinuousMonitoringStats }
