/**
 * 🎯 نظام المراقبة والتصفية الذكي المحسن
 * مراقبة العملات لمدة 60 دقيقة مع تصفية ذكية وإشعارات
 */

import { stableDataService, type StableTokenInfo } from "./stable-data-service"
import { tokenAnalyzer, type TokenAnalysis } from "./token-analyzer"

export interface EnhancedMonitoredToken extends StableTokenInfo {
  // معلومات المراقبة
  monitoringStartTime: number
  monitoringEndTime: number
  monitoringProgress: number // 0-100%
  timeRemaining: number // بالثواني

  // معلومات التحليل
  finalAnalysis?: TokenAnalysis
  analysisAttempts: number
  lastAnalysisTime?: number

  // حالة التأهيل
  isQualified: boolean
  qualificationReason: string
  qualificationTime?: number
  monitoringStatus: "monitoring" | "analyzing" | "qualified" | "rejected" | "expired"

  // إحصائيات إضافية
  priceHistory: Array<{ time: number; price: number }>
  volumeHistory: Array<{ time: number; volume: number }>
  holderGrowth: number
}

export interface DetailedMonitoringStats {
  // إحصائيات عامة
  totalProcessed: number
  currentlyMonitoring: number
  qualified: number
  rejected: number
  expired: number

  // توزيع التقييمات
  recommendedCount: number
  classifiedCount: number
  ignoredCount: number

  // معدلات الأداء
  successRate: number
  averageAnalysisTime: number
  averageMonitoringTime: number

  // إعدادات النظام
  monitoringDuration: number // بالدقائق
  maxConcurrentAnalysis: number

  // إحصائيات الوقت الفعلي
  tokensAddedToday: number
  tokensQualifiedToday: number
  systemUptime: number
}

export interface QualificationNotification {
  id: string
  tokenSymbol: string
  tokenMint: string
  recommendation: "Recommended" | "Classified"
  score: number
  timestamp: number
  isRead: boolean
}

class EnhancedMonitoringService {
  private monitoredTokens: Map<string, EnhancedMonitoredToken> = new Map()
  private qualifiedTokens: Map<string, EnhancedMonitoredToken> = new Map()
  private rejectedTokens: Set<string> = new Set() // فقط للإحصائيات
  private notifications: QualificationNotification[] = []

  private monitoringInterval: NodeJS.Timeout | null = null
  private analysisQueue: string[] = []
  private isProcessingQueue = false
  private systemStartTime = Date.now()

  private listeners: ((tokens: EnhancedMonitoredToken[], stats: DetailedMonitoringStats) => void)[] = []
  private notificationListeners: ((notification: QualificationNotification) => void)[] = []

  // إعدادات محسنة
  private readonly MONITORING_DURATION = 60 * 60 * 1000 // 60 دقيقة
  private readonly ANALYSIS_INTERVAL = 15 * 1000 // كل 15 ثانية
  private readonly PROGRESS_UPDATE_INTERVAL = 5 * 1000 // كل 5 ثوان
  private readonly CLEANUP_INTERVAL = 2 * 60 * 1000 // تنظيف كل دقيقتين
  private readonly MAX_CONCURRENT_ANALYSIS = 5
  private readonly PRICE_HISTORY_INTERVAL = 5 * 60 * 1000 // كل 5 دقائق

  /**
   * 🚀 بدء النظام المحسن
   */
  async startEnhancedMonitoring(): Promise<void> {
    console.log("🎯 بدء نظام المراقبة والتصفية الذكي المحسن...")

    // تهيئة خدمة البيانات
    await stableDataService.initialize()

    // إضافة مستمع للعملات الجديدة
    stableDataService.addListener((newTokens) => {
      this.addTokensToEnhancedMonitoring(newTokens)
    })

    // بدء دورات المراقبة المختلفة
    this.startMonitoringCycle()
    this.startProgressUpdateCycle()
    this.startAnalysisQueue()
    this.startCleanupCycle()
    this.startPriceHistoryTracking()

    console.log("✅ تم بدء النظام المحسن بنجاح")
  }

  /**
   * 📊 إضافة عملات جديدة للمراقبة المحسنة
   */
  private addTokensToEnhancedMonitoring(tokens: StableTokenInfo[]): void {
    const now = Date.now()
    let addedCount = 0

    for (const token of tokens) {
      // تحقق من عدم وجود العملة
      if (
        this.monitoredTokens.has(token.mint) ||
        this.qualifiedTokens.has(token.mint) ||
        this.rejectedTokens.has(token.mint)
      ) {
        continue
      }

      // تحقق من المعايير الأساسية
      if (!token.meetsBasicCriteria) {
        console.log(`❌ رفض فوري للعملة ${token.symbol} - لا تلبي المعايير الأساسية`)
        this.rejectedTokens.add(token.mint)
        continue
      }

      // إنشاء عملة محسنة للمراقبة
      const enhancedToken: EnhancedMonitoredToken = {
        ...token,
        monitoringStartTime: now,
        monitoringEndTime: now + this.MONITORING_DURATION,
        monitoringProgress: 0,
        timeRemaining: this.MONITORING_DURATION / 1000,
        analysisAttempts: 0,
        isQualified: false,
        qualificationReason: "Under enhanced monitoring",
        monitoringStatus: "monitoring",
        priceHistory: [{ time: now, price: token.price }],
        volumeHistory: [{ time: now, volume: token.volume24h }],
        holderGrowth: 0,
      }

      this.monitoredTokens.set(token.mint, enhancedToken)

      // إضافة للطابور للتحليل
      if (!this.analysisQueue.includes(token.mint)) {
        this.analysisQueue.push(token.mint)
      }

      addedCount++
      console.log(`🔍 تم إضافة العملة ${token.symbol} للمراقبة المحسنة`)
    }

    if (addedCount > 0) {
      console.log(`🎯 تم إضافة ${addedCount} عملة جديدة للمراقبة المحسنة`)
      this.notifyListeners()
    }
  }

  /**
   * 🔄 دورة المراقبة الرئيسية
   */
  private startMonitoringCycle(): void {
    this.monitoringInterval = setInterval(() => {
      this.processEnhancedMonitoringCycle()
    }, this.ANALYSIS_INTERVAL)
  }

  /**
   * 📈 دورة تحديث التقدم
   */
  private startProgressUpdateCycle(): void {
    setInterval(() => {
      this.updateMonitoringProgress()
    }, this.PROGRESS_UPDATE_INTERVAL)
  }

  /**
   * 📊 تحديث تقدم المراقبة
   */
  private updateMonitoringProgress(): void {
    const now = Date.now()
    let updatedCount = 0

    for (const [mint, token] of this.monitoredTokens.entries()) {
      const elapsed = now - token.monitoringStartTime
      const progress = Math.min(100, (elapsed / this.MONITORING_DURATION) * 100)
      const timeRemaining = Math.max(0, (token.monitoringEndTime - now) / 1000)

      if (token.monitoringProgress !== progress) {
        token.monitoringProgress = progress
        token.timeRemaining = timeRemaining
        updatedCount++
      }
    }

    if (updatedCount > 0) {
      this.notifyListeners()
    }
  }

  /**
   * 🔄 معالجة دورة المراقبة المحسنة
   */
  private async processEnhancedMonitoringCycle(): Promise<void> {
    const now = Date.now()
    let processedCount = 0

    for (const [mint, token] of this.monitoredTokens.entries()) {
      if (now > token.monitoringEndTime) {
        // انتهت فترة المراقبة
        await this.finalizeEnhancedTokenDecision(token)
        this.monitoredTokens.delete(mint)
        processedCount++
      }
    }

    if (processedCount > 0) {
      console.log(`⏰ تم معالجة ${processedCount} عملة منتهية المراقبة`)
      this.notifyListeners()
    }
  }

  /**
   * 🤖 بدء طابور التحليل المحسن
   */
  private startAnalysisQueue(): void {
    setInterval(() => {
      if (!this.isProcessingQueue && this.analysisQueue.length > 0) {
        this.processEnhancedAnalysisQueue()
      }
    }, 3000) // كل 3 ثوان
  }

  /**
   * 🧠 معالجة طابور التحليل المحسن
   */
  private async processEnhancedAnalysisQueue(): Promise<void> {
    if (this.isProcessingQueue || this.analysisQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true
    const batchSize = Math.min(this.MAX_CONCURRENT_ANALYSIS, this.analysisQueue.length)

    try {
      const batch = this.analysisQueue.splice(0, batchSize)
      const analysisPromises = batch.map((mint) => this.analyzeTokenEnhanced(mint))

      await Promise.allSettled(analysisPromises)
      this.notifyListeners()
    } catch (error) {
      console.error("❌ خطأ في معالجة طابور التحليل المحسن:", error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  /**
   * 🔬 تحليل العملة المحسن
   */
  private async analyzeTokenEnhanced(mint: string): Promise<void> {
    const token = this.monitoredTokens.get(mint)
    if (!token) return

    try {
      token.monitoringStatus = "analyzing"
      token.analysisAttempts++
      token.lastAnalysisTime = Date.now()

      console.log(`🧠 تحليل محسن للعملة ${token.symbol} (المحاولة ${token.analysisAttempts})...`)

      const analysis = await tokenAnalyzer.analyzeToken(token)
      token.finalAnalysis = analysis

      // تحديث حالة العملة بناءً على التحليل
      this.updateEnhancedTokenStatus(token, analysis)

      console.log(
        `✅ تم التحليل المحسن لـ ${token.symbol} - ${analysis.recommendation} (${analysis.overallScore.toFixed(1)}%)`,
      )

      // إرسال إشعار إذا كانت العملة مؤهلة
      if (token.isQualified) {
        this.sendQualificationNotification(token, analysis)
      }
    } catch (error) {
      console.error(`❌ خطأ في التحليل المحسن للعملة ${token.symbol}:`, error)
      token.qualificationReason = `Analysis failed (attempt ${token.analysisAttempts})`
      token.monitoringStatus = "monitoring"
    }
  }

  /**
   * 📊 تحديث حالة العملة المحسنة
   */
  private updateEnhancedTokenStatus(token: EnhancedMonitoredToken, analysis: TokenAnalysis): void {
    const now = Date.now()

    switch (analysis.recommendation) {
      case "Recommended":
        token.isQualified = true
        token.monitoringStatus = "qualified"
        token.qualificationTime = now
        token.qualificationReason = `⭐ Highly Recommended - Score: ${analysis.overallScore.toFixed(1)}%`
        break

      case "Classified":
        token.isQualified = true
        token.monitoringStatus = "qualified"
        token.qualificationTime = now
        token.qualificationReason = `⚠️ Classified - Score: ${analysis.overallScore.toFixed(1)}%`
        break

      case "Ignored":
        token.isQualified = false
        token.monitoringStatus = "rejected"
        token.qualificationReason = `❌ Rejected - Low Score: ${analysis.overallScore.toFixed(1)}%`
        break
    }
  }

  /**
   * 📢 إرسال إشعار التأهيل
   */
  private sendQualificationNotification(token: EnhancedMonitoredToken, analysis: TokenAnalysis): void {
    const notification: QualificationNotification = {
      id: `${token.mint}-${Date.now()}`,
      tokenSymbol: token.symbol,
      tokenMint: token.mint,
      recommendation: analysis.recommendation as "Recommended" | "Classified",
      score: analysis.overallScore,
      timestamp: Date.now(),
      isRead: false,
    }

    this.notifications.unshift(notification)

    // الاحتفاظ بآخر 50 إشعار فقط
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // إشعار المستمعين
    this.notificationListeners.forEach((listener) => {
      try {
        listener(notification)
      } catch (error) {
        console.error("خطأ في إرسال إشعار:", error)
      }
    })

    console.log(`📢 إشعار جديد: العملة ${token.symbol} تم تأهيلها كـ ${analysis.recommendation}`)
  }

  /**
   * ✅ اتخاذ القرار النهائي المحسن
   */
  private async finalizeEnhancedTokenDecision(token: EnhancedMonitoredToken): Promise<void> {
    if (!token.finalAnalysis) {
      // لم يتم التحليل - رفض العملة
      token.monitoringStatus = "expired"
      token.qualificationReason = "Monitoring period expired without analysis"
      this.rejectedTokens.add(token.mint)
      console.log(`⏰ انتهت مراقبة ${token.symbol} بدون تحليل - تم الرفض`)
      return
    }

    if (token.isQualified) {
      // العملة مؤهلة - نقلها للعملات المؤهلة
      this.qualifiedTokens.set(token.mint, token)
      console.log(`✅ تم قبول العملة ${token.symbol} - ${token.qualificationReason}`)
    } else {
      // العملة مرفوضة - إضافتها لقائمة المرفوضة (للإحصائيات فقط)
      this.rejectedTokens.add(token.mint)
      console.log(`❌ تم رفض العملة ${token.symbol} - ${token.qualificationReason}`)
      // لا نحفظ بياناتها في العرض
    }
  }

  /**
   * 📈 تتبع تاريخ الأسعار
   */
  private startPriceHistoryTracking(): void {
    setInterval(() => {
      this.updatePriceHistory()
    }, this.PRICE_HISTORY_INTERVAL)
  }

  /**
   * 💰 تحديث تاريخ الأسعار
   */
  private updatePriceHistory(): void {
    const now = Date.now()

    for (const [mint, token] of this.monitoredTokens.entries()) {
      // إضافة نقطة جديدة لتاريخ السعر
      token.priceHistory.push({ time: now, price: token.price })
      token.volumeHistory.push({ time: now, volume: token.volume24h })

      // الاحتفاظ بآخر 24 نقطة فقط (ساعتين)
      if (token.priceHistory.length > 24) {
        token.priceHistory = token.priceHistory.slice(-24)
        token.volumeHistory = token.volumeHistory.slice(-24)
      }

      // حساب نمو حاملي العملة
      if (token.priceHistory.length > 1) {
        const oldPrice = token.priceHistory[0].price
        const currentPrice = token.price
        token.holderGrowth = ((currentPrice - oldPrice) / oldPrice) * 100
      }
    }
  }

  /**
   * 🧹 دورة التنظيف المحسنة
   */
  private startCleanupCycle(): void {
    setInterval(() => {
      this.performEnhancedCleanup()
    }, this.CLEANUP_INTERVAL)
  }

  /**
   * 🗑️ تنظيف محسن
   */
  private performEnhancedCleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    // تنظيف العملات المؤهلة القديمة (أكثر من 12 ساعة)
    for (const [mint, token] of this.qualifiedTokens.entries()) {
      const tokenAge = now - (token.qualificationTime || token.monitoringStartTime)
      if (tokenAge > 12 * 60 * 60 * 1000) {
        // 12 ساعة
        this.qualifiedTokens.delete(mint)
        cleanedCount++
      }
    }

    // تنظيف الإشعارات القديمة (أكثر من 24 ساعة)
    const oldNotificationCount = this.notifications.length
    this.notifications = this.notifications.filter((notification) => now - notification.timestamp < 24 * 60 * 60 * 1000)
    const removedNotifications = oldNotificationCount - this.notifications.length

    if (cleanedCount > 0 || removedNotifications > 0) {
      console.log(`🧹 تنظيف محسن: ${cleanedCount} عملة، ${removedNotifications} إشعار`)
      this.notifyListeners()
    }
  }

  /**
   * 📊 الحصول على العملات المؤهلة المحسنة
   */
  getEnhancedQualifiedTokens(): EnhancedMonitoredToken[] {
    return Array.from(this.qualifiedTokens.values()).sort((a, b) => {
      // ترتيب حسب التقييم ثم وقت التأهيل
      const scoreA = a.finalAnalysis?.overallScore || 0
      const scoreB = b.finalAnalysis?.overallScore || 0

      if (scoreA !== scoreB) {
        return scoreB - scoreA // الأعلى تقييماً أولاً
      }

      return (b.qualificationTime || 0) - (a.qualificationTime || 0) // الأحدث تأهيلاً أولاً
    })
  }

  /**
   * 🔍 الحصول على العملات قيد المراقبة
   */
  getMonitoringTokens(): EnhancedMonitoredToken[] {
    return Array.from(this.monitoredTokens.values()).sort((a, b) => {
      // ترتيب حسب التقدم ثم وقت البداية
      if (a.monitoringProgress !== b.monitoringProgress) {
        return b.monitoringProgress - a.monitoringProgress // الأعلى تقدماً أولاً
      }
      return b.monitoringStartTime - a.monitoringStartTime // الأحدث أولاً
    })
  }

  /**
   * 📈 الحصول على إحصائيات مفصلة
   */
  getDetailedStats(): DetailedMonitoringStats {
    const now = Date.now()
    const qualified = this.qualifiedTokens.size
    const monitoring = this.monitoredTokens.size
    const rejected = this.rejectedTokens.size
    const total = qualified + monitoring + rejected

    // حساب التوزيع حسب التقييم
    let recommendedCount = 0
    let classifiedCount = 0
    const ignoredCount = 0

    for (const token of this.qualifiedTokens.values()) {
      if (token.finalAnalysis) {
        switch (token.finalAnalysis.recommendation) {
          case "Recommended":
            recommendedCount++
            break
          case "Classified":
            classifiedCount++
            break
        }
      }
    }

    // حساب متوسط وقت التحليل
    const analyzedTokens = Array.from(this.qualifiedTokens.values()).filter((t) => t.lastAnalysisTime)
    const averageAnalysisTime =
      analyzedTokens.length > 0
        ? analyzedTokens.reduce((sum, t) => sum + (t.lastAnalysisTime! - t.monitoringStartTime), 0) /
          analyzedTokens.length /
          1000
        : 0

    // إحصائيات اليوم
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const tokensAddedToday = Array.from(this.monitoredTokens.values())
      .concat(Array.from(this.qualifiedTokens.values()))
      .filter((t) => t.monitoringStartTime >= todayStart).length

    const tokensQualifiedToday = Array.from(this.qualifiedTokens.values()).filter(
      (t) => (t.qualificationTime || 0) >= todayStart,
    ).length

    return {
      totalProcessed: total,
      currentlyMonitoring: monitoring,
      qualified,
      rejected,
      expired: 0,
      recommendedCount,
      classifiedCount,
      ignoredCount,
      successRate: total > 0 ? (qualified / total) * 100 : 0,
      averageAnalysisTime: averageAnalysisTime / 60, // بالدقائق
      averageMonitoringTime: this.MONITORING_DURATION / (60 * 1000), // بالدقائق
      monitoringDuration: this.MONITORING_DURATION / (60 * 1000),
      maxConcurrentAnalysis: this.MAX_CONCURRENT_ANALYSIS,
      tokensAddedToday,
      tokensQualifiedToday,
      systemUptime: (now - this.systemStartTime) / (60 * 60 * 1000), // بالساعات
    }
  }

  /**
   * 📢 الحصول على الإشعارات
   */
  getNotifications(): QualificationNotification[] {
    return [...this.notifications]
  }

  /**
   * ✅ تحديد الإشعار كمقروء
   */
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.isRead = true
    }
  }

  /**
   * 🔕 مسح جميع الإشعارات
   */
  clearAllNotifications(): void {
    this.notifications = []
  }

  /**
   * 👂 إضافة مستمع للإشعارات
   */
  addNotificationListener(callback: (notification: QualificationNotification) => void): void {
    this.notificationListeners.push(callback)
  }

  /**
   * 👂 إضافة مستمع للتحديثات
   */
  addListener(callback: (tokens: EnhancedMonitoredToken[], stats: DetailedMonitoringStats) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 📢 إشعار المستمعين
   */
  private notifyListeners(): void {
    const qualifiedTokens = this.getEnhancedQualifiedTokens()
    const stats = this.getDetailedStats()

    this.listeners.forEach((callback) => {
      try {
        callback(qualifiedTokens, stats)
      } catch (error) {
        console.error("خطأ في إشعار مستمع المراقبة المحسن:", error)
      }
    })
  }

  /**
   * 🔄 إعادة تشغيل النظام المحسن
   */
  async restartEnhanced(): Promise<void> {
    console.log("🔄 إعادة تشغيل النظام المحسن...")

    this.stop()

    // مسح البيانات
    this.monitoredTokens.clear()
    this.qualifiedTokens.clear()
    this.rejectedTokens.clear()
    this.notifications = []
    this.analysisQueue = []
    this.systemStartTime = Date.now()

    await this.startEnhancedMonitoring()

    console.log("✅ تم إعادة تشغيل النظام المحسن بنجاح")
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
    this.notificationListeners = []
    console.log("🛑 تم إيقاف النظام المحسن")
  }

  /**
   * 📊 حالة النظام المفصلة
   */
  getSystemStatus(): {
    isRunning: boolean
    monitoringCount: number
    qualifiedCount: number
    rejectedCount: number
    queueLength: number
    isProcessing: boolean
    uptime: number
    notificationCount: number
  } {
    return {
      isRunning: this.monitoringInterval !== null,
      monitoringCount: this.monitoredTokens.size,
      qualifiedCount: this.qualifiedTokens.size,
      rejectedCount: this.rejectedTokens.size,
      queueLength: this.analysisQueue.length,
      isProcessing: this.isProcessingQueue,
      uptime: (Date.now() - this.systemStartTime) / (60 * 60 * 1000),
      notificationCount: this.notifications.filter((n) => !n.isRead).length,
    }
  }
}

// إنشاء instance واحد للاستخدام
export const enhancedMonitoringService = new EnhancedMonitoringService()
export type { EnhancedMonitoredToken, DetailedMonitoringStats, QualificationNotification }
