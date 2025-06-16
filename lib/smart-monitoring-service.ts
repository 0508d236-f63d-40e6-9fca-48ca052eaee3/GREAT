/**
 * 🎯 خدمة المراقبة والتصفية الذكية
 * مراقبة العملات لمدة 60 دقيقة وتصفيتها حسب التقييم
 */

import { stableDataService, type StableTokenInfo } from "./stable-data-service"
import { tokenAnalyzer, type TokenAnalysis } from "./token-analyzer"

export interface MonitoredToken extends StableTokenInfo {
  monitoringStartTime: number
  monitoringEndTime: number
  finalAnalysis?: TokenAnalysis
  isQualified: boolean
  qualificationReason: string
  monitoringStatus: "monitoring" | "qualified" | "rejected" | "expired"
}

export interface MonitoringStats {
  totalMonitored: number
  currentlyMonitoring: number
  qualified: number
  rejected: number
  expired: number
  recommendedCount: number
  classifiedCount: number
  ignoredCount: number
  monitoringDuration: number // بالدقائق
}

class SmartMonitoringService {
  private monitoredTokens: Map<string, MonitoredToken> = new Map()
  private qualifiedTokens: Map<string, MonitoredToken> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null
  private analysisQueue: string[] = []
  private isProcessingQueue = false
  private listeners: ((tokens: MonitoredToken[], stats: MonitoringStats) => void)[] = []

  // إعدادات المراقبة
  private readonly MONITORING_DURATION = 60 * 60 * 1000 // 60 دقيقة
  private readonly ANALYSIS_INTERVAL = 30 * 1000 // كل 30 ثانية
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000 // تنظيف كل 5 دقائق

  /**
   * 🚀 بدء نظام المراقبة الذكي
   */
  async startMonitoring(): Promise<void> {
    console.log("🎯 بدء نظام المراقبة والتصفية الذكي...")

    // تهيئة خدمة البيانات
    await stableDataService.initialize()

    // إضافة مستمع للعملات الجديدة
    stableDataService.addListener((newTokens) => {
      this.addTokensToMonitoring(newTokens)
    })

    // بدء دورة المراقبة
    this.startMonitoringCycle()

    // بدء معالجة طابور التحليل
    this.startAnalysisQueue()

    // بدء تنظيف العملات المنتهية الصلاحية
    this.startCleanupCycle()

    console.log("✅ تم بدء نظام المراقبة بنجاح")
  }

  /**
   * 📊 إضافة عملات جديدة للمراقبة
   */
  private addTokensToMonitoring(tokens: StableTokenInfo[]): void {
    const now = Date.now()
    let addedCount = 0

    for (const token of tokens) {
      // تحقق من أن العملة ليست موجودة بالفعل
      if (this.monitoredTokens.has(token.mint) || this.qualifiedTokens.has(token.mint)) {
        continue
      }

      // تحقق من المعايير الأساسية
      if (!token.meetsBasicCriteria) {
        console.log(`❌ تم رفض العملة ${token.symbol} - لا تلبي المعايير الأساسية`)
        continue
      }

      // إضافة العملة للمراقبة
      const monitoredToken: MonitoredToken = {
        ...token,
        monitoringStartTime: now,
        monitoringEndTime: now + this.MONITORING_DURATION,
        isQualified: false,
        qualificationReason: "Under monitoring",
        monitoringStatus: "monitoring",
      }

      this.monitoredTokens.set(token.mint, monitoredToken)

      // إضافة للطابور للتحليل
      if (!this.analysisQueue.includes(token.mint)) {
        this.analysisQueue.push(token.mint)
      }

      addedCount++
    }

    if (addedCount > 0) {
      console.log(`🔍 تم إضافة ${addedCount} عملة جديدة للمراقبة`)
      this.notifyListeners()
    }
  }

  /**
   * 🔄 دورة المراقبة الرئيسية
   */
  private startMonitoringCycle(): void {
    this.monitoringInterval = setInterval(() => {
      this.processMonitoringCycle()
    }, this.ANALYSIS_INTERVAL)
  }

  /**
   * 📈 معالجة دورة المراقبة
   */
  private async processMonitoringCycle(): Promise<void> {
    const now = Date.now()
    let processedCount = 0

    // معالجة العملات المنتهية الصلاحية
    for (const [mint, token] of this.monitoredTokens.entries()) {
      if (now > token.monitoringEndTime) {
        // انتهت فترة المراقبة
        if (token.finalAnalysis) {
          // تم التحليل - اتخاذ القرار النهائي
          await this.finalizeTokenDecision(token)
        } else {
          // لم يتم التحليل - رفض العملة
          console.log(`⏰ انتهت فترة مراقبة العملة ${token.symbol} بدون تحليل - تم الرفض`)
          token.monitoringStatus = "expired"
          token.qualificationReason = "Monitoring period expired without analysis"
        }

        this.monitoredTokens.delete(mint)
        processedCount++
      }
    }

    if (processedCount > 0) {
      console.log(`⏰ تم معالجة ${processedCount} عملة منتهية الصلاحية`)
      this.notifyListeners()
    }
  }

  /**
   * 🤖 بدء طابور التحليل
   */
  private startAnalysisQueue(): void {
    setInterval(() => {
      if (!this.isProcessingQueue && this.analysisQueue.length > 0) {
        this.processAnalysisQueue()
      }
    }, 5000) // كل 5 ثوان
  }

  /**
   * 🧠 معالجة طابور التحليل
   */
  private async processAnalysisQueue(): Promise<void> {
    if (this.isProcessingQueue || this.analysisQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true
    const batchSize = 3 // تحليل 3 عملات في المرة الواحدة

    try {
      const batch = this.analysisQueue.splice(0, batchSize)

      for (const mint of batch) {
        const token = this.monitoredTokens.get(mint)
        if (!token) continue

        try {
          console.log(`🧠 تحليل العملة ${token.symbol}...`)
          const analysis = await tokenAnalyzer.analyzeToken(token)

          // حفظ التحليل
          token.finalAnalysis = analysis

          // تحديث حالة العملة
          this.updateTokenStatus(token, analysis)

          console.log(
            `✅ تم تحليل ${token.symbol} - التقييم: ${analysis.recommendation} (${analysis.overallScore.toFixed(1)}%)`,
          )
        } catch (error) {
          console.error(`❌ خطأ في تحليل العملة ${token.symbol}:`, error)
          token.qualificationReason = "Analysis failed"
        }
      }

      this.notifyListeners()
    } catch (error) {
      console.error("❌ خطأ في معالجة طابور التحليل:", error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  /**
   * 📊 تحديث حالة العملة بناءً على التحليل
   */
  private updateTokenStatus(token: MonitoredToken, analysis: TokenAnalysis): void {
    switch (analysis.recommendation) {
      case "Recommended":
        token.isQualified = true
        token.monitoringStatus = "qualified"
        token.qualificationReason = `Recommended with ${analysis.overallScore.toFixed(1)}% score`
        break

      case "Classified":
        token.isQualified = true
        token.monitoringStatus = "qualified"
        token.qualificationReason = `Classified with ${analysis.overallScore.toFixed(1)}% score`
        break

      case "Ignored":
        token.isQualified = false
        token.monitoringStatus = "rejected"
        token.qualificationReason = `Ignored - Low score (${analysis.overallScore.toFixed(1)}%)`
        break
    }
  }

  /**
   * ✅ اتخاذ القرار النهائي للعملة
   */
  private async finalizeTokenDecision(token: MonitoredToken): Promise<void> {
    if (!token.finalAnalysis) return

    if (token.isQualified) {
      // العملة مؤهلة - نقلها للعملات المؤهلة
      this.qualifiedTokens.set(token.mint, token)
      console.log(`✅ تم قبول العملة ${token.symbol} - ${token.qualificationReason}`)
    } else {
      // العملة مرفوضة - حذفها نهائياً
      console.log(`❌ تم رفض العملة ${token.symbol} - ${token.qualificationReason}`)
      // لا نحفظ بياناتها
    }
  }

  /**
   * 🧹 دورة التنظيف
   */
  private startCleanupCycle(): void {
    setInterval(() => {
      this.cleanupExpiredTokens()
    }, this.CLEANUP_INTERVAL)
  }

  /**
   * 🗑️ تنظيف العملات المنتهية الصلاحية
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now()
    let cleanedCount = 0

    // تنظيف العملات المؤهلة القديمة (أكثر من 24 ساعة)
    for (const [mint, token] of this.qualifiedTokens.entries()) {
      const tokenAge = now - token.monitoringStartTime
      if (tokenAge > 24 * 60 * 60 * 1000) {
        // 24 ساعة
        this.qualifiedTokens.delete(mint)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 تم تنظيف ${cleanedCount} عملة قديمة`)
      this.notifyListeners()
    }
  }

  /**
   * 📊 الحصول على العملات المؤهلة
   */
  getQualifiedTokens(): MonitoredToken[] {
    return Array.from(this.qualifiedTokens.values()).sort((a, b) => {
      // ترتيب حسب التقييم ثم التاريخ
      const scoreA = a.finalAnalysis?.overallScore || 0
      const scoreB = b.finalAnalysis?.overallScore || 0

      if (scoreA !== scoreB) {
        return scoreB - scoreA // الأعلى تقييماً أولاً
      }

      return b.monitoringStartTime - a.monitoringStartTime // الأحدث أولاً
    })
  }

  /**
   * 📊 الحصول على العملات قيد المراقبة
   */
  getMonitoringTokens(): MonitoredToken[] {
    return Array.from(this.monitoredTokens.values()).sort((a, b) => b.monitoringStartTime - a.monitoringStartTime)
  }

  /**
   * 📈 الحصول على إحصائيات المراقبة
   */
  getMonitoringStats(): MonitoringStats {
    const qualified = this.qualifiedTokens.size
    const monitoring = this.monitoredTokens.size
    const total = qualified + monitoring

    // حساب التوزيع حسب التقييم
    let recommendedCount = 0
    let classifiedCount = 0
    let ignoredCount = 0

    for (const token of this.qualifiedTokens.values()) {
      if (token.finalAnalysis) {
        switch (token.finalAnalysis.recommendation) {
          case "Recommended":
            recommendedCount++
            break
          case "Classified":
            classifiedCount++
            break
          case "Ignored":
            ignoredCount++
            break
        }
      }
    }

    return {
      totalMonitored: total,
      currentlyMonitoring: monitoring,
      qualified,
      rejected: 0, // لا نحتفظ بالمرفوضة
      expired: 0,
      recommendedCount,
      classifiedCount,
      ignoredCount,
      monitoringDuration: this.MONITORING_DURATION / (60 * 1000), // بالدقائق
    }
  }

  /**
   * 🔍 البحث في العملات المؤهلة
   */
  searchQualifiedTokens(query: string): MonitoredToken[] {
    const queryLower = query.toLowerCase()
    return this.getQualifiedTokens().filter(
      (token) =>
        token.name.toLowerCase().includes(queryLower) ||
        token.symbol.toLowerCase().includes(queryLower) ||
        token.mint.toLowerCase().includes(queryLower),
    )
  }

  /**
   * 📊 فلترة العملات المؤهلة
   */
  filterQualifiedTokens(filter: {
    recommendation?: "Recommended" | "Classified"
    minScore?: number
    maxAge?: number // بالساعات
  }): MonitoredToken[] {
    return this.getQualifiedTokens().filter((token) => {
      if (!token.finalAnalysis) return false

      if (filter.recommendation && token.finalAnalysis.recommendation !== filter.recommendation) {
        return false
      }

      if (filter.minScore && token.finalAnalysis.overallScore < filter.minScore) {
        return false
      }

      if (filter.maxAge) {
        const tokenAge = (Date.now() - token.monitoringStartTime) / (60 * 60 * 1000)
        if (tokenAge > filter.maxAge) {
          return false
        }
      }

      return true
    })
  }

  /**
   * 👂 إضافة مستمع للتحديثات
   */
  addListener(callback: (tokens: MonitoredToken[], stats: MonitoringStats) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (tokens: MonitoredToken[], stats: MonitoringStats) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  /**
   * 📢 إشعار المستمعين
   */
  private notifyListeners(): void {
    const qualifiedTokens = this.getQualifiedTokens()
    const stats = this.getMonitoringStats()

    this.listeners.forEach((callback) => {
      try {
        callback(qualifiedTokens, stats)
      } catch (error) {
        console.error("خطأ في إشعار مستمع المراقبة:", error)
      }
    })
  }

  /**
   * 🔄 إعادة تشغيل النظام
   */
  async restart(): Promise<void> {
    console.log("🔄 إعادة تشغيل نظام المراقبة...")

    this.stop()

    // مسح البيانات
    this.monitoredTokens.clear()
    this.qualifiedTokens.clear()
    this.analysisQueue = []

    await this.startMonitoring()

    console.log("✅ تم إعادة تشغيل النظام بنجاح")
  }

  /**
   * 🛑 إيقاف النظام
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    this.listeners = []
    console.log("🛑 تم إيقاف نظام المراقبة")
  }

  /**
   * 📊 حالة النظام
   */
  getSystemStatus(): {
    isRunning: boolean
    monitoringCount: number
    qualifiedCount: number
    queueLength: number
    isProcessing: boolean
  } {
    return {
      isRunning: this.monitoringInterval !== null,
      monitoringCount: this.monitoredTokens.size,
      qualifiedCount: this.qualifiedTokens.size,
      queueLength: this.analysisQueue.length,
      isProcessing: this.isProcessingQueue,
    }
  }
}

// إنشاء instance واحد للاستخدام
export const smartMonitoringService = new SmartMonitoringService()
export type { MonitoredToken, MonitoringStats }
