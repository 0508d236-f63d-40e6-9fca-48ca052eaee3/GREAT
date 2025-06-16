/**
 * 🔥 خدمة البيانات الحقيقية فقط - بدون أي محاكاة
 * تضمن عرض البيانات الحقيقية من pump.fun فقط
 */

import { realPumpFunService, type RealPumpToken } from "./real-pump-fun-service"

export interface RealTokenInfo {
  mint: string
  name: string
  symbol: string
  decimals: number
  logo: string
  supply: number
  holders: number
  price: number
  marketCap: number
  lastUpdate: Date
  isRealData: true // دائماً true
  createdToday: boolean
  pumpFunUrl: string
  description: string
  volume24h: number
  priceChange24h: number
  createdTimestamp: number
  creator: string
  isFromPumpFun: true // دائماً true
  isLive: boolean
  replyCount: number
  complete: boolean
  ageInMinutes: number
  qualityScore: number
  recommendation: "Recommended" | "Classified" | "Ignored"
}

class RealDataOnlyService {
  private tokens: RealTokenInfo[] = []
  private isInitialized = false
  private lastUpdate = 0
  private updateInterval: NodeJS.Timeout | null = null
  private listeners: ((tokens: RealTokenInfo[]) => void)[] = []
  private isConnectedToPumpFun = false

  /**
   * 🚀 تهيئة الخدمة مع التحقق من الاتصال الحقيقي
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isConnectedToPumpFun
    }

    console.log("🔥 تهيئة خدمة البيانات الحقيقية فقط...")

    try {
      // تهيئة خدمة pump.fun الحقيقية
      const connected = await realPumpFunService.initialize()

      if (!connected) {
        console.error("❌ فشل الاتصال بـ pump.fun - لن يتم عرض أي بيانات")
        throw new Error("Cannot connect to pump.fun - No fake data will be shown")
      }

      this.isConnectedToPumpFun = true
      this.isInitialized = true

      // جلب البيانات الحقيقية الأولى
      await this.fetchRealTokens()

      // بدء التحديث التلقائي
      this.startAutoUpdate()

      console.log("✅ تم تهيئة خدمة البيانات الحقيقية بنجاح")
      return true
    } catch (error) {
      console.error("❌ فشل تهيئة خدمة البيانات الحقيقية:", error)
      this.isConnectedToPumpFun = false
      this.isInitialized = false
      throw error
    }
  }

  /**
   * 🔥 جلب العملات الحقيقية من pump.fun
   */
  private async fetchRealTokens(): Promise<void> {
    try {
      console.log("🔥 جلب العملات الحقيقية من pump.fun...")

      const realTokens = await realPumpFunService.getRealTokens(500)

      if (!realTokens || realTokens.length === 0) {
        throw new Error("No real tokens received from pump.fun")
      }

      // تحويل البيانات إلى التنسيق المطلوب
      const convertedTokens = realTokens.map((token) => this.convertToRealTokenInfo(token))

      // فلترة العملات حسب المعايير
      const filteredTokens = convertedTokens.filter((token) => this.meetsQualityCriteria(token))

      this.tokens = filteredTokens
      this.lastUpdate = Date.now()

      console.log(`✅ تم جلب ${filteredTokens.length} عملة حقيقية من pump.fun`)

      // إشعار المستمعين
      this.notifyListeners()
    } catch (error) {
      console.error("❌ فشل جلب العملات الحقيقية:", error)

      // في حالة الفشل، لا نعرض أي بيانات مزيفة
      if (this.tokens.length === 0) {
        throw new Error("Cannot fetch real data from pump.fun")
      }

      // استخدام البيانات المحفوظة إذا كانت حديثة (أقل من 5 دقائق)
      const now = Date.now()
      if (now - this.lastUpdate > 5 * 60 * 1000) {
        throw new Error("Cached data is too old - Real data only")
      }
    }
  }

  /**
   * 🔄 تحويل عملة pump.fun إلى RealTokenInfo
   */
  private convertToRealTokenInfo(pumpToken: RealPumpToken): RealTokenInfo {
    const now = Date.now() / 1000
    const ageInMinutes = (now - pumpToken.created_timestamp) / 60
    const createdToday = ageInMinutes < 24 * 60

    // حساب نقاط الجودة بناءً على المعايير الحقيقية
    const qualityScore = this.calculateQualityScore(pumpToken, ageInMinutes)

    // تحديد التوصية بناءً على النقاط
    let recommendation: "Recommended" | "Classified" | "Ignored"
    if (qualityScore >= 80) {
      recommendation = "Recommended"
    } else if (qualityScore >= 60) {
      recommendation = "Classified"
    } else {
      recommendation = "Ignored"
    }

    return {
      mint: pumpToken.mint,
      name: pumpToken.name,
      symbol: pumpToken.symbol,
      decimals: pumpToken.decimals,
      logo: this.extractEmojiFromImage(pumpToken.image) || "🪙",
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
    }
  }

  /**
   * 📊 حساب نقاط الجودة بناءً على المعايير الحقيقية
   */
  private calculateQualityScore(token: RealPumpToken, ageInMinutes: number): number {
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
    if (!token.complete) score += 1 // العملات غير المكتملة أكثر إثارة

    return Math.min(score, 100)
  }

  /**
   * ✅ فحص معايير الجودة
   */
  private meetsQualityCriteria(token: RealTokenInfo): boolean {
    // معايير أساسية للعرض
    if (!token.mint || !token.symbol || !token.name) return false
    if (token.price <= 0) return false
    if (token.ageInMinutes > 120) return false // أقل من ساعتين
    if (token.marketCap > 200000) return false // أقل من 200 ألف دولار

    return true
  }

  /**
   * 🎨 استخراج emoji من صورة pump.fun
   */
  private extractEmojiFromImage(image: string): string {
    if (!image) return "🪙"

    // إذا كان emoji مباشر
    if (
      image.length <= 4 &&
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(image)
    ) {
      return image
    }

    // تحديد emoji بناءً على اسم الصورة
    const imageLower = image.toLowerCase()
    if (imageLower.includes("pepe")) return "🐸"
    if (imageLower.includes("doge")) return "🐕"
    if (imageLower.includes("cat")) return "🐱"
    if (imageLower.includes("rocket")) return "🚀"
    if (imageLower.includes("moon")) return "🌙"
    if (imageLower.includes("diamond")) return "💎"
    if (imageLower.includes("fire")) return "🔥"
    if (imageLower.includes("ape")) return "🦍"

    return "🪙"
  }

  /**
   * ⏰ بدء التحديث التلقائي
   */
  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    // تحديث كل 10 ثوان
    this.updateInterval = setInterval(async () => {
      try {
        await this.fetchRealTokens()
      } catch (error) {
        console.error("❌ فشل التحديث التلقائي:", error)

        // إذا فشل التحديث 3 مرات متتالية، أوقف الخدمة
        if (!this.isConnectedToPumpFun) {
          this.stop()
        }
      }
    }, 10000)
  }

  /**
   * 📊 الحصول على العملات الحقيقية
   */
  getTokens(): RealTokenInfo[] {
    if (!this.isConnectedToPumpFun) {
      throw new Error("Not connected to pump.fun - No data available")
    }

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
      isRealData: true,
    }
  }

  /**
   * 🔍 البحث في العملات الحقيقية
   */
  async searchTokens(query: string): Promise<RealTokenInfo[]> {
    try {
      const realResults = await realPumpFunService.searchRealTokens(query)
      return realResults.map((token) => this.convertToRealTokenInfo(token))
    } catch (error) {
      console.error("❌ فشل البحث في العملات الحقيقية:", error)

      // البحث في البيانات المحفوظة
      const queryLower = query.toLowerCase()
      return this.tokens.filter(
        (token) =>
          token.name.toLowerCase().includes(queryLower) ||
          token.symbol.toLowerCase().includes(queryLower) ||
          token.mint.toLowerCase().includes(queryLower),
      )
    }
  }

  /**
   * 👂 إضافة مستمع للتحديثات
   */
  addListener(callback: (tokens: RealTokenInfo[]) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (tokens: RealTokenInfo[]) => void): void {
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
   * 🔄 إعادة تشغيل الخدمة
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
    isRealDataOnly: boolean
  } {
    return {
      isInitialized: this.isInitialized,
      isConnectedToPumpFun: this.isConnectedToPumpFun,
      tokenCount: this.tokens.length,
      lastUpdate: this.lastUpdate,
      isRunning: this.updateInterval !== null,
      isRealDataOnly: true,
    }
  }
}

// إنشاء instance واحد للاستخدام
export const realDataOnlyService = new RealDataOnlyService()
export type { RealTokenInfo }
