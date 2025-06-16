/**
 * 📊 خدمة تتبع دقة التوصيات المستمرة
 * تتبع دقة جميع التوصيات بشكل مستمر ومفصل
 */

export interface AccuracyRecord {
  tokenMint: string
  tokenSymbol: string
  initialRecommendation: "Recommended" | "Classified" | "Ignored"
  initialScore: number
  predictionTime: number

  // النتائج الفعلية
  actualPerformance?: {
    priceChange1h: number
    priceChange24h: number
    priceChange7d: number
    volumeChange24h: number
    holderChange24h: number
    marketCapChange24h: number
    reachedTarget: boolean
    timeToTarget?: number
    maxPriceReached: number
    maxMarketCapReached: number
  }

  // تقييم الدقة
  accuracyAssessment?: {
    wasCorrect: boolean
    accuracyScore: number // 0-100
    confidenceLevel: number
    errorType?: "false_positive" | "false_negative" | "timing_error"
    notes: string
  }

  lastUpdated: number
  isCompleted: boolean
}

export interface AccuracyStats {
  // إحصائيات عامة
  totalPredictions: number
  completedPredictions: number
  pendingPredictions: number

  // دقة التوصيات
  recommendedAccuracy: number
  classifiedAccuracy: number
  ignoredAccuracy: number
  overallAccuracy: number

  // تفاصيل الأداء
  correctPredictions: number
  incorrectPredictions: number
  falsePositives: number
  falseNegatives: number
  timingErrors: number

  // معدلات النجاح
  recommendedSuccessRate: number
  classifiedSuccessRate: number
  averageConfidence: number

  // إحصائيات زمنية
  averageTimeToTarget: number
  fastestCorrectPrediction: number
  slowestCorrectPrediction: number

  // تحسينات مقترحة
  suggestedImprovements: string[]
  modelReliability: number

  // إحصائيات يومية
  todayPredictions: number
  todayCorrect: number
  todayAccuracy: number

  // اتجاهات الأداء
  accuracyTrend: "improving" | "stable" | "declining"
  last24hAccuracy: number
  last7dAccuracy: number
}

class AccuracyTrackingService {
  private accuracyRecords: Map<string, AccuracyRecord> = new Map()
  private trackingInterval: NodeJS.Timeout | null = null
  private updateInterval: NodeJS.Timeout | null = null

  private readonly TRACKING_DURATION = 24 * 60 * 60 * 1000 // 24 ساعة
  private readonly UPDATE_INTERVAL = 60 * 1000 // دقيقة واحدة
  private readonly EVALUATION_INTERVAL = 5 * 60 * 1000 // 5 دقائق

  private listeners: ((stats: AccuracyStats) => void)[] = []

  /**
   * 🚀 بدء تتبع الدقة المستمر
   */
  startAccuracyTracking(): void {
    console.log("📊 بدء تتبع دقة التوصيات المستمر...")

    // تحديث مستمر للبيانات
    this.updateInterval = setInterval(() => {
      this.updateAccuracyRecords()
    }, this.UPDATE_INTERVAL)

    // تقييم دوري للدقة
    this.trackingInterval = setInterval(() => {
      this.evaluateAccuracy()
    }, this.EVALUATION_INTERVAL)

    console.log("✅ تم بدء تتبع الدقة المستمر")
  }

  /**
   * 📝 تسجيل توصية جديدة
   */
  recordPrediction(
    tokenMint: string,
    tokenSymbol: string,
    recommendation: "Recommended" | "Classified" | "Ignored",
    score: number,
    confidence: number,
  ): void {
    const record: AccuracyRecord = {
      tokenMint,
      tokenSymbol,
      initialRecommendation: recommendation,
      initialScore: score,
      predictionTime: Date.now(),
      lastUpdated: Date.now(),
      isCompleted: false,
    }

    this.accuracyRecords.set(tokenMint, record)

    console.log(`📝 تم تسجيل توصية: ${tokenSymbol} - ${recommendation} (${score.toFixed(1)}%)`)

    this.notifyListeners()
  }

  /**
   * 🔄 تحديث سجلات الدقة
   */
  private async updateAccuracyRecords(): Promise<void> {
    const now = Date.now()
    let updatedCount = 0

    for (const [mint, record] of this.accuracyRecords.entries()) {
      // تخطي السجلات المكتملة
      if (record.isCompleted) continue

      // تحقق من انتهاء فترة التتبع
      if (now - record.predictionTime > this.TRACKING_DURATION) {
        await this.finalizeAccuracyRecord(record)
        updatedCount++
        continue
      }

      // تحديث الأداء الحالي
      await this.updatePerformanceData(record)
      updatedCount++
    }

    if (updatedCount > 0) {
      console.log(`🔄 تم تحديث ${updatedCount} سجل دقة`)
      this.notifyListeners()
    }
  }

  /**
   * 📈 تحديث بيانات الأداء
   */
  private async updatePerformanceData(record: AccuracyRecord): Promise<void> {
    try {
      // محاكاة جلب بيانات الأداء الحقيقية
      const performanceData = await this.fetchTokenPerformance(record.tokenMint)

      if (performanceData) {
        record.actualPerformance = performanceData
        record.lastUpdated = Date.now()

        // تقييم مبدئي للدقة
        this.assessAccuracy(record)
      }
    } catch (error) {
      console.error(`❌ خطأ في تحديث أداء ${record.tokenSymbol}:`, error)
    }
  }

  /**
   * 📊 جلب أداء العملة (محاكاة)
   */
  private async fetchTokenPerformance(tokenMint: string): Promise<any> {
    // محاكاة بيانات أداء واقعية
    const baseChange = (Math.random() - 0.5) * 200 // تغيير من -100% إلى +100%

    return {
      priceChange1h: baseChange * 0.1,
      priceChange24h: baseChange,
      priceChange7d: baseChange * 2,
      volumeChange24h: Math.random() * 500 - 100,
      holderChange24h: Math.random() * 100,
      marketCapChange24h: baseChange * 0.9,
      reachedTarget: baseChange > 50, // هدف 50% زيادة
      timeToTarget: baseChange > 50 ? Math.random() * 24 * 60 * 60 * 1000 : undefined,
      maxPriceReached: Math.max(0, baseChange * 1.2),
      maxMarketCapReached: Math.max(0, baseChange * 1.1),
    }
  }

  /**
   * 🎯 تقييم دقة التوصية
   */
  private assessAccuracy(record: AccuracyRecord): void {
    if (!record.actualPerformance) return

    const performance = record.actualPerformance
    let wasCorrect = false
    let accuracyScore = 0
    let errorType: "false_positive" | "false_negative" | "timing_error" | undefined
    let notes = ""

    // تقييم بناءً على نوع التوصية
    switch (record.initialRecommendation) {
      case "Recommended":
        // توقع أداء إيجابي قوي
        if (performance.priceChange24h > 20 && performance.reachedTarget) {
          wasCorrect = true
          accuracyScore = Math.min(100, 70 + performance.priceChange24h * 0.3)
          notes = "توصية ممتازة - حققت الهدف"
        } else if (performance.priceChange24h > 0) {
          wasCorrect = true
          accuracyScore = Math.min(70, 50 + performance.priceChange24h)
          notes = "توصية جيدة - أداء إيجابي"
        } else {
          wasCorrect = false
          accuracyScore = Math.max(0, 30 + performance.priceChange24h * 0.5)
          errorType = "false_positive"
          notes = "توصية خاطئة - أداء سلبي"
        }
        break

      case "Classified":
        // توقع أداء متوسط
        if (performance.priceChange24h > -10 && performance.priceChange24h < 50) {
          wasCorrect = true
          accuracyScore = 60 + Math.abs(performance.priceChange24h - 10) * 0.5
          notes = "تصنيف صحيح - أداء متوسط"
        } else {
          wasCorrect = false
          accuracyScore = Math.max(20, 50 - Math.abs(performance.priceChange24h - 10) * 0.3)
          errorType = performance.priceChange24h > 50 ? "false_negative" : "false_positive"
          notes = "تصنيف خاطئ - أداء غير متوقع"
        }
        break

      case "Ignored":
        // توقع أداء ضعيف أو سلبي
        if (performance.priceChange24h < 10) {
          wasCorrect = true
          accuracyScore = Math.min(80, 60 - performance.priceChange24h * 0.5)
          notes = "رفض صحيح - أداء ضعيف"
        } else {
          wasCorrect = false
          accuracyScore = Math.max(10, 40 - performance.priceChange24h * 0.3)
          errorType = "false_negative"
          notes = "رفض خاطئ - فرصة ضائعة"
        }
        break
    }

    record.accuracyAssessment = {
      wasCorrect,
      accuracyScore,
      confidenceLevel: record.initialScore,
      errorType,
      notes,
    }
  }

  /**
   * ✅ إنهاء سجل الدقة
   */
  private async finalizeAccuracyRecord(record: AccuracyRecord): Promise<void> {
    // تحديث أخير للأداء
    await this.updatePerformanceData(record)

    // تقييم نهائي
    this.assessAccuracy(record)

    // وضع علامة الاكتمال
    record.isCompleted = true
    record.lastUpdated = Date.now()

    console.log(`✅ تم إنهاء تتبع ${record.tokenSymbol} - دقة: ${record.accuracyAssessment?.accuracyScore.toFixed(1)}%`)
  }

  /**
   * 🔍 تقييم الدقة العام
   */
  private evaluateAccuracy(): void {
    const stats = this.getAccuracyStats()

    // تحليل الاتجاهات
    this.analyzeAccuracyTrends()

    // اقتراح تحسينات
    this.suggestImprovements()

    this.notifyListeners()
  }

  /**
   * 📊 الحصول على إحصائيات الدقة
   */
  getAccuracyStats(): AccuracyStats {
    const records = Array.from(this.accuracyRecords.values())
    const completedRecords = records.filter((r) => r.isCompleted && r.accuracyAssessment)
    const pendingRecords = records.filter((r) => !r.isCompleted)

    // حساب الدقة العامة
    const correctPredictions = completedRecords.filter((r) => r.accuracyAssessment?.wasCorrect).length
    const overallAccuracy = completedRecords.length > 0 ? (correctPredictions / completedRecords.length) * 100 : 0

    // دقة كل نوع توصية
    const recommendedRecords = completedRecords.filter((r) => r.initialRecommendation === "Recommended")
    const classifiedRecords = completedRecords.filter((r) => r.initialRecommendation === "Classified")
    const ignoredRecords = completedRecords.filter((r) => r.initialRecommendation === "Ignored")

    const recommendedAccuracy = this.calculateTypeAccuracy(recommendedRecords)
    const classifiedAccuracy = this.calculateTypeAccuracy(classifiedRecords)
    const ignoredAccuracy = this.calculateTypeAccuracy(ignoredRecords)

    // أنواع الأخطاء
    const falsePositives = completedRecords.filter((r) => r.accuracyAssessment?.errorType === "false_positive").length
    const falseNegatives = completedRecords.filter((r) => r.accuracyAssessment?.errorType === "false_negative").length
    const timingErrors = completedRecords.filter((r) => r.accuracyAssessment?.errorType === "timing_error").length

    // معدلات النجاح
    const recommendedSuccessRate = this.calculateSuccessRate(recommendedRecords)
    const classifiedSuccessRate = this.calculateSuccessRate(classifiedRecords)

    // متوسط الثقة
    const averageConfidence =
      completedRecords.length > 0
        ? completedRecords.reduce((sum, r) => sum + r.initialScore, 0) / completedRecords.length
        : 0

    // إحصائيات زمنية
    const timeToTargets = completedRecords
      .filter((r) => r.actualPerformance?.timeToTarget)
      .map((r) => r.actualPerformance!.timeToTarget!)

    const averageTimeToTarget =
      timeToTargets.length > 0 ? timeToTargets.reduce((sum, time) => sum + time, 0) / timeToTargets.length : 0

    // إحصائيات يومية
    const today = new Date().setHours(0, 0, 0, 0)
    const todayRecords = completedRecords.filter((r) => r.predictionTime >= today)
    const todayCorrect = todayRecords.filter((r) => r.accuracyAssessment?.wasCorrect).length
    const todayAccuracy = todayRecords.length > 0 ? (todayCorrect / todayRecords.length) * 100 : 0

    // اتجاه الدقة
    const accuracyTrend = this.calculateAccuracyTrend(completedRecords)

    return {
      totalPredictions: records.length,
      completedPredictions: completedRecords.length,
      pendingPredictions: pendingRecords.length,
      recommendedAccuracy,
      classifiedAccuracy,
      ignoredAccuracy,
      overallAccuracy,
      correctPredictions,
      incorrectPredictions: completedRecords.length - correctPredictions,
      falsePositives,
      falseNegatives,
      timingErrors,
      recommendedSuccessRate,
      classifiedSuccessRate,
      averageConfidence,
      averageTimeToTarget,
      fastestCorrectPrediction: Math.min(...timeToTargets) || 0,
      slowestCorrectPrediction: Math.max(...timeToTargets) || 0,
      suggestedImprovements: this.generateImprovementSuggestions(completedRecords),
      modelReliability: this.calculateModelReliability(completedRecords),
      todayPredictions: todayRecords.length,
      todayCorrect,
      todayAccuracy,
      accuracyTrend,
      last24hAccuracy: this.calculatePeriodAccuracy(completedRecords, 24 * 60 * 60 * 1000),
      last7dAccuracy: this.calculatePeriodAccuracy(completedRecords, 7 * 24 * 60 * 60 * 1000),
    }
  }

  /**
   * 📈 حساب دقة نوع التوصية
   */
  private calculateTypeAccuracy(records: AccuracyRecord[]): number {
    if (records.length === 0) return 0
    const correct = records.filter((r) => r.accuracyAssessment?.wasCorrect).length
    return (correct / records.length) * 100
  }

  /**
   * 🎯 حساب معدل النجاح
   */
  private calculateSuccessRate(records: AccuracyRecord[]): number {
    if (records.length === 0) return 0
    const successful = records.filter((r) => r.actualPerformance?.reachedTarget).length
    return (successful / records.length) * 100
  }

  /**
   * 📊 حساب اتجاه الدقة
   */
  private calculateAccuracyTrend(records: AccuracyRecord[]): "improving" | "stable" | "declining" {
    if (records.length < 10) return "stable"

    const recent = records.slice(-10)
    const older = records.slice(-20, -10)

    const recentAccuracy = this.calculateTypeAccuracy(recent)
    const olderAccuracy = this.calculateTypeAccuracy(older)

    const difference = recentAccuracy - olderAccuracy

    if (difference > 5) return "improving"
    if (difference < -5) return "declining"
    return "stable"
  }

  /**
   * ⏰ حساب دقة فترة زمنية
   */
  private calculatePeriodAccuracy(records: AccuracyRecord[], periodMs: number): number {
    const now = Date.now()
    const periodRecords = records.filter((r) => now - r.predictionTime <= periodMs)
    return this.calculateTypeAccuracy(periodRecords)
  }

  /**
   * 🔧 إنشاء اقتراحات التحسين
   */
  private generateImprovementSuggestions(records: AccuracyRecord[]): string[] {
    const suggestions: string[] = []

    const falsePositives = records.filter((r) => r.accuracyAssessment?.errorType === "false_positive").length
    const falseNegatives = records.filter((r) => r.accuracyAssessment?.errorType === "false_negative").length
    const total = records.length

    if (falsePositives / total > 0.3) {
      suggestions.push("تقليل معايير التوصية - كثرة التوصيات الخاطئة")
    }

    if (falseNegatives / total > 0.2) {
      suggestions.push("تحسين كشف الفرص - فوات فرص جيدة")
    }

    const lowScoreCorrect = records.filter((r) => r.accuracyAssessment?.wasCorrect && r.initialScore < 60).length

    if (lowScoreCorrect / total > 0.1) {
      suggestions.push("مراجعة نظام التقييم - توصيات صحيحة بدرجات منخفضة")
    }

    return suggestions
  }

  /**
   * 🎯 حساب موثوقية النموذج
   */
  private calculateModelReliability(records: AccuracyRecord[]): number {
    if (records.length === 0) return 0

    const accuracyScores = records.filter((r) => r.accuracyAssessment).map((r) => r.accuracyAssessment!.accuracyScore)

    const averageAccuracy = accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length
    const consistency = this.calculateConsistency(accuracyScores)

    return averageAccuracy * 0.7 + consistency * 0.3
  }

  /**
   * 📊 حساب الاتساق
   */
  private calculateConsistency(scores: number[]): number {
    if (scores.length < 2) return 100

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)

    // كلما قل الانحراف المعياري، زاد الاتساق
    return Math.max(0, 100 - standardDeviation)
  }

  /**
   * 📈 تحليل اتجاهات الدقة
   */
  private analyzeAccuracyTrends(): void {
    const stats = this.getAccuracyStats()

    if (stats.accuracyTrend === "declining") {
      console.log("⚠️ تراجع في دقة التوصيات - مراجعة النموذج مطلوبة")
    } else if (stats.accuracyTrend === "improving") {
      console.log("📈 تحسن في دقة التوصيات")
    }
  }

  /**
   * 💡 اقتراح تحسينات
   */
  private suggestImprovements(): void {
    const stats = this.getAccuracyStats()

    if (stats.overallAccuracy < 60) {
      console.log("🔧 دقة منخفضة - مراجعة شاملة للنموذج مطلوبة")
    }

    if (stats.falsePositives > stats.falseNegatives * 2) {
      console.log("⚠️ كثرة التوصيات الخاطئة - تشديد المعايير")
    }
  }

  /**
   * 👂 إضافة مستمع
   */
  addListener(callback: (stats: AccuracyStats) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 📢 إشعار المستمعين
   */
  private notifyListeners(): void {
    const stats = this.getAccuracyStats()
    this.listeners.forEach((callback) => {
      try {
        callback(stats)
      } catch (error) {
        console.error("خطأ في إشعار مستمع الدقة:", error)
      }
    })
  }

  /**
   * 🛑 إيقاف التتبع
   */
  stop(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
      this.trackingInterval = null
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    this.listeners = []
    console.log("🛑 تم إيقاف تتبع الدقة")
  }

  /**
   * 📊 الحصول على سجلات الدقة
   */
  getAccuracyRecords(): AccuracyRecord[] {
    return Array.from(this.accuracyRecords.values())
  }

  /**
   * 🧹 تنظيف السجلات القديمة
   */
  cleanupOldRecords(): void {
    const now = Date.now()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // أسبوع

    let cleanedCount = 0
    for (const [mint, record] of this.accuracyRecords.entries()) {
      if (now - record.predictionTime > maxAge && record.isCompleted) {
        this.accuracyRecords.delete(mint)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 تم تنظيف ${cleanedCount} سجل قديم`)
    }
  }
}

// إنشاء instance واحد للاستخدام
export const accuracyTrackingService = new AccuracyTrackingService()
