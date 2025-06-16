/**
 * 🔥 خدمة العملات العاملة مع بيانات حقيقية
 * تستخدم PumpFunProxyService للحصول على البيانات
 */

import { pumpFunProxyService, type PumpToken } from "./pump-fun-proxy-service"

export interface WorkingTokenInfo {
  id: string
  name: string
  symbol: string
  decimals: number
  logo: string
  supply: number
  holders: number
  price: number
  marketCap: number
  lastUpdate: Date
  isRealData: boolean
  createdToday: boolean
  pumpFunUrl: string
  description: string
  volume24h: number
  priceChange24h: number
  createdTimestamp: number
  creator: string
  isFromPumpFun: boolean
  isLive: boolean
  replyCount: number
  complete: boolean
  ageInMinutes: number
  qualityScore: number
  recommendation: "Recommended" | "Classified" | "Ignored"
  isNew: boolean
}

class WorkingTokenService {
  private tokens: WorkingTokenInfo[] = []
  private isInitialized = false
  private lastUpdate = 0
  private updateInterval: NodeJS.Timeout | null = null
  private listeners: ((tokens: WorkingTokenInfo[]) => void)[] = []
  private isConnectedToPumpFun = false

  /**
   * 🚀 تهيئة الخدمة
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isConnectedToPumpFun
    }

    console.log("🔥 تهيئة خدمة العملات العاملة...")

    try {
      // تهيئة خدمة pump.fun proxy
      const connected = await pumpFunProxyService.initialize()

      this.isConnectedToPumpFun = connected
      this.isInitialized = true

      if (connected) {
        // جلب البيانات الأولى
        await this.fetchTokens()

        // بدء التحديث التلقائي
        this.startAutoUpdate()

        console.log("✅ تم تهيئة خدمة العملات بنجاح")
      } else {
        console.log("⚠️ تم التهيئة بدون اتصال مباشر")
      }

      return true
    } catch (error) {
      console.error("❌ فشل تهيئة خدمة العملات:", error)
      this.isConnectedToPumpFun = false
      this.isInitialized = false
      return false
    }
  }

  /**
   * 🔥 جلب العملات من pump.fun
   */
  private async fetchTokens(): Promise<void> {
    try {
      console.log("🔥 جلب العملات من pump.fun...")

      const pumpTokens = await pumpFunProxyService.getTokens()

      if (!pumpTokens || pumpTokens.length === 0) {
        console.log("⚠️ لم يتم استلام عملات من pump.fun")
        return
      }

      // تحويل البيانات إلى التنسيق المطلوب
      const convertedTokens = pumpTokens.map((token) => this.convertToWorkingTokenInfo(token))

      // فلترة العملات حسب المعايير
      const filteredTokens = convertedTokens.filter((token) => this.meetsQualityCriteria(token))

      this.tokens = filteredTokens
      this.lastUpdate = Date.now()

      console.log(`✅ تم جلب ${filteredTokens.length} عملة`)

      // إشعار المستمعين
      this.notifyListeners()
    } catch (error) {
      console.error("❌ فشل جلب العملات:", error)

      // في حالة الفشل، احتفظ بالبيانات القديمة إذا كانت حديثة
      const now = Date.now()
      if (this.tokens.length === 0 || now - this.lastUpdate > 5 * 60 * 1000) {
        // إذا لم توجد بيانات أو كانت قديمة جداً، أنشئ بيانات تجريبية
        this.generateFallbackTokens()
      }
    }
  }

  /**
   * 🔄 تحويل PumpToken إلى WorkingTokenInfo
   */
  private convertToWorkingTokenInfo(pumpToken: PumpToken): WorkingTokenInfo {
    const now = Date.now() / 1000
    const ageInMinutes = (now - pumpToken.created_timestamp) / 60
    const createdToday = ageInMinutes < 24 * 60

    // حساب نقاط الجودة
    const qualityScore = this.calculateQualityScore(pumpToken, ageInMinutes)

    // تحديد التوصية
    let recommendation: "Recommended" | "Classified" | "Ignored"
    if (qualityScore >= 80) {
      recommendation = "Recommended"
    } else if (qualityScore >= 60) {
      recommendation = "Classified"
    } else {
      recommendation = "Ignored"
    }

    return {
      id: pumpToken.mint,
      name: pumpToken.name,
      symbol: pumpToken.symbol,
      decimals: pumpToken.decimals,
      logo: typeof pumpToken.image === "string" && pumpToken.image.length <= 4 ? pumpToken.image : "🪙",
      supply: pumpToken.total_supply,
      holders: pumpToken.holder_count,
      price: pumpToken.price,
      marketCap: pumpToken.market_cap,
      lastUpdate: new Date(),
      isRealData: true,
      createdToday,
      pumpFunUrl: `https://pump.fun/${pumpToken.mint}`,
      description: pumpToken.description,
      volume24h: pumpToken.volume_24h,
      priceChange24h: pumpToken.price_change_24h,
      createdTimestamp: pumpToken.created_timestamp,
      creator: pumpToken.creator,
      isFromPumpFun: true,
      isLive: pumpToken.is_currently_live,
      replyCount: pumpToken.reply_count,
      complete: pumpToken.complete,
      ageInMinutes,
      qualityScore,
      recommendation,
      isNew: ageInMinutes <= 5,
    }
  }

  /**
   * 📊 حساب نقاط الجودة
   */
  private calculateQualityScore(token: PumpToken, ageInMinutes: number): number {
    let score = 0

    // نقاط العمر (40 نقطة كحد أقصى)
    if (ageInMinutes <= 5) score += 40
    else if (ageInMinutes <= 15) score += 30
    else if (ageInMinutes <= 30) score += 20
    else if (ageInMinutes <= 60) score += 10

    // نقاط القيمة السوقية (20 نقطة كحد أقصى)
    if (token.market_cap > 0 && token.market_cap <= 10000) score += 20
    else if (token.market_cap <= 25000) score += 15
    else if (token.market_cap <= 50000) score += 10
    else if (token.market_cap <= 100000) score += 5

    // نقاط حجم التداول (15 نقطة كحد أقصى)
    if (token.volume_24h > 1000) score += 15
    else if (token.volume_24h > 500) score += 10
    else if (token.volume_24h > 100) score += 5

    // نقاط عدد الحاملين (10 نقاط كحد أقصى)
    if (token.holder_count > 100) score += 10
    else if (token.holder_count > 50) score += 7
    else if (token.holder_count > 20) score += 5
    else if (token.holder_count > 10) score += 3

    // نقاط النشاط (10 نقاط كحد أقصى)
    if (token.is_currently_live) score += 5
    if (token.reply_count > 10) score += 3
    if (token.reply_count > 5) score += 2

    // نقاط إضافية (5 نقاط كحد أقصى)
    if (token.description && token.description.length > 20) score += 2
    if (token.website || token.telegram || token.twitter) score += 2
    if (!token.complete) score += 1

    return Math.min(score, 100)
  }

  /**
   * ✅ فحص معايير الجودة
   */
  private meetsQualityCriteria(token: WorkingTokenInfo): boolean {
    if (!token.id || !token.symbol || !token.name) return false
    if (token.price <= 0) return false
    if (token.ageInMinutes > 120) return false // أقل من ساعتين
    if (token.marketCap > 200000) return false // أقل من 200 ألف دولار

    return true
  }

  /**
   * 🎲 توليد عملات احتياطية
   */
  private generateFallbackTokens(): void {
    console.log("🎲 توليد عملات احتياطية...")

    const fallbackTokens: WorkingTokenInfo[] = []
    const now = Date.now() / 1000

    const tokenTemplates = [
      { name: "PepeCoin", symbol: "PEPE", emoji: "🐸" },
      { name: "DogWifHat", symbol: "WIF", emoji: "🐕" },
      { name: "Bonk", symbol: "BONK", emoji: "🔥" },
      { name: "Myro", symbol: "MYRO", emoji: "🚀" },
      { name: "Popcat", symbol: "POPCAT", emoji: "🐱" },
    ]

    for (let i = 0; i < 15; i++) {
      const template = tokenTemplates[i % tokenTemplates.length]
      const randomSuffix = Math.floor(Math.random() * 1000)
      const ageMinutes = Math.random() * 60 + 5
      const createdTimestamp = now - ageMinutes * 60

      const price = Math.random() * 0.01 + 0.0001
      const marketCap = price * 1000000000 * (Math.random() * 0.1 + 0.01)
      const volume24h = marketCap * (Math.random() * 0.5 + 0.1)
      const holders = Math.floor(Math.random() * 200 + 10)
      const priceChange24h = (Math.random() - 0.5) * 200

      const qualityScore = Math.random() * 100
      let recommendation: "Recommended" | "Classified" | "Ignored"
      if (qualityScore >= 80) recommendation = "Recommended"
      else if (qualityScore >= 60) recommendation = "Classified"
      else recommendation = "Ignored"

      const token: WorkingTokenInfo = {
        id: this.generateRandomId(),
        name: `${template.name}${randomSuffix}`,
        symbol: `${template.symbol}${randomSuffix}`,
        decimals: 6,
        logo: template.emoji,
        supply: 1000000000,
        holders,
        price,
        marketCap,
        lastUpdate: new Date(),
        isRealData: false, // هذه بيانات احتياطية
        createdToday: true,
        pumpFunUrl: `https://pump.fun/`,
        description: `Fallback token - ${template.name} themed`,
        volume24h,
        priceChange24h,
        createdTimestamp,
        creator: this.generateRandomId(),
        isFromPumpFun: false,
        isLive: Math.random() > 0.5,
        replyCount: Math.floor(Math.random() * 50),
        complete: Math.random() > 0.7,
        ageInMinutes,
        qualityScore,
        recommendation,
        isNew: ageMinutes <= 5,
      }

      fallbackTokens.push(token)
    }

    this.tokens = fallbackTokens
    this.lastUpdate = Date.now()
    console.log(`✅ تم توليد ${fallbackTokens.length} عملة احتياطية`)
    this.notifyListeners()
  }

  /**
   * 🔑 توليد ID عشوائي
   */
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * ⏰ بدء التحديث التلقائي
   */
  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    // تحديث كل 15 ثانية
    this.updateInterval = setInterval(async () => {
      try {
        await this.fetchTokens()
      } catch (error) {
        console.error("❌ فشل التحديث التلقائي:", error)
      }
    }, 15000)
  }

  /**
   * 📊 الحصول على العملات
   */
  getTokens(): WorkingTokenInfo[] {
    return [...this.tokens]
  }

  /**
   * 📈 الحصول على الإحصائيات
   */
  getStats(): {
    total: number
    recommended: number
    classified: number
    ignored: number
    newTokens: number
    avgAge: number
    isRunning: boolean
    isRealData: boolean
  } {
    const recommended = this.tokens.filter((t) => t.recommendation === "Recommended").length
    const classified = this.tokens.filter((t) => t.recommendation === "Classified").length
    const ignored = this.tokens.filter((t) => t.recommendation === "Ignored").length
    const newTokens = this.tokens.filter((t) => t.ageInMinutes <= 5).length
    const avgAge =
      this.tokens.length > 0 ? this.tokens.reduce((sum, t) => sum + t.ageInMinutes, 0) / this.tokens.length : 0

    return {
      total: this.tokens.length,
      recommended,
      classified,
      ignored,
      newTokens,
      avgAge,
      isRunning: this.updateInterval !== null,
      isRealData: this.isConnectedToPumpFun,
    }
  }

  /**
   * 👂 إضافة مستمع
   */
  addListener(callback: (tokens: WorkingTokenInfo[]) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (tokens: WorkingTokenInfo[]) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  /**
   * 📢 إشعار المستمعين
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback([...this.tokens])
      } catch (error) {
        console.error("❌ خطأ في إشعار المستمع:", error)
      }
    })
  }

  /**
   * 🔄 إعادة تشغيل
   */
  async restart(): Promise<boolean> {
    this.stop()
    this.isInitialized = false
    this.isConnectedToPumpFun = false
    this.tokens = []
    this.lastUpdate = 0

    return await this.initialize()
  }

  /**
   * 🛑 إيقاف الخدمة
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.listeners = []
  }

  /**
   * 📊 حالة الخدمة
   */
  getStatus(): {
    isInitialized: boolean
    isConnectedToPumpFun: boolean
    tokenCount: number
    lastUpdate: number
    isRunning: boolean
    hasRealData: boolean
  } {
    return {
      isInitialized: this.isInitialized,
      isConnectedToPumpFun: this.isConnectedToPumpFun,
      tokenCount: this.tokens.length,
      lastUpdate: this.lastUpdate,
      isRunning: this.updateInterval !== null,
      hasRealData: this.tokens.some((t) => t.isRealData),
    }
  }
}

// إنشاء instance واحد
export const workingTokenService = new WorkingTokenService()
export type { WorkingTokenInfo }
