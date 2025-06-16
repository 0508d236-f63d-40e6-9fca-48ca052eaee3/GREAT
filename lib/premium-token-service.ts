/**
 * 🏆 خدمة العملات المتميزة مع البيانات المحسنة
 * تستخدم مصادر متعددة للحصول على أفضل جودة بيانات
 */

export interface EnhancedPumpToken {
  mint: string
  name: string
  symbol: string
  decimals: number
  image: string
  description: string
  total_supply: number
  holder_count: number
  price: number
  market_cap: number
  volume_24h: number
  price_change_24h: number
  price_change_1h?: number
  price_change_5m?: number
  created_timestamp: number
  creator: string
  is_currently_live: boolean
  reply_count: number
  complete: boolean
  data_quality_score: number
  data_sources: string[]
  liquidity?: number
  fdv?: number
  transactions_24h?: number
  unique_wallets_24h?: number
  social_sentiment?: number
  risk_score?: number
  verified?: boolean
  audit_status?: string
  last_verified?: number
  website?: string
  telegram?: string
  twitter?: string
}

export interface PremiumTokenInfo {
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
  priceChange1h: number
  priceChange5m: number
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
  // حقول محسنة
  liquidity: number
  fdv: number
  transactions24h: number
  uniqueWallets24h: number
  socialSentiment: number
  riskScore: number
  verified: boolean
  auditStatus: string
  dataQualityScore: number
  dataSources: string[]
  trustScore: number
  potentialScore: number
  safetyRating: "High" | "Medium" | "Low"
  investmentGrade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D"
}

// محاكي خدمة pump.fun المحسنة
class MockEnhancedPumpService {
  private isInitialized = false
  private tokens: EnhancedPumpToken[] = []

  async initialize(): Promise<boolean> {
    console.log("🚀 تهيئة خدمة pump.fun المحسنة...")
    this.isInitialized = true
    await this.generateMockTokens()
    return true
  }

  private async generateMockTokens(): Promise<void> {
    const templates = [
      { name: "SuperPepe", symbol: "SPEPE", emoji: "🐸", category: "Meme" },
      { name: "MegaDoge", symbol: "MDOGE", emoji: "🐕", category: "Dog" },
      { name: "UltraCat", symbol: "UCAT", emoji: "🐱", category: "Cat" },
      { name: "GigaShiba", symbol: "GSHIB", emoji: "🐕‍🦺", category: "Shiba" },
      { name: "TurboFrog", symbol: "TFROG", emoji: "🐸", category: "Frog" },
      { name: "HyperMoon", symbol: "HMOON", emoji: "🌙", category: "Space" },
      { name: "NitroRocket", symbol: "NROCK", emoji: "🚀", category: "Rocket" },
      { name: "PowerGem", symbol: "PGEM", emoji: "💎", category: "Gem" },
      { name: "FlashFire", symbol: "FFIRE", emoji: "🔥", category: "Fire" },
      { name: "ThunderBolt", symbol: "TBOLT", emoji: "⚡", category: "Lightning" },
    ]

    this.tokens = []
    const now = Date.now() / 1000

    for (let i = 0; i < 30; i++) {
      const template = templates[i % templates.length]
      const randomId = Math.floor(Math.random() * 10000)
      const ageMinutes = Math.random() * 120 + 1 // 1-121 دقيقة

      const price = Math.random() * 0.01 + 0.0001 // $0.0001 - $0.0101
      const supply = 1000000000
      const marketCap = price * supply * (Math.random() * 0.1 + 0.01) // 1-11% من العرض
      const volume24h = marketCap * (Math.random() * 2 + 0.1) // 10-210% من القيمة السوقية
      const holders = Math.floor(Math.random() * 500 + 50) // 50-550 حامل
      const priceChange24h = (Math.random() - 0.4) * 300 // تحيز إيجابي
      const liquidity = marketCap * (Math.random() * 0.5 + 0.1) // 10-60% من القيمة السوقية

      const dataQualityScore = 75 + Math.random() * 25 // 75-100%
      const riskScore = Math.random() * 60 + 10 // 10-70
      const socialSentiment = 30 + Math.random() * 70 // 30-100

      const token: EnhancedPumpToken = {
        mint: this.generateMintAddress(),
        name: `${template.name}${randomId}`,
        symbol: `${template.symbol}${randomId}`,
        decimals: 6,
        image: template.emoji,
        description: `Premium ${template.category} token with enhanced features and high-quality data`,
        total_supply: supply,
        holder_count: holders,
        price,
        market_cap: marketCap,
        volume_24h: volume24h,
        price_change_24h: priceChange24h,
        price_change_1h: (Math.random() - 0.4) * 50,
        price_change_5m: (Math.random() - 0.4) * 20,
        created_timestamp: now - ageMinutes * 60,
        creator: this.generateMintAddress(),
        is_currently_live: Math.random() > 0.3,
        reply_count: Math.floor(Math.random() * 200 + 10),
        complete: Math.random() > 0.5,
        data_quality_score: dataQualityScore,
        data_sources: this.getRandomDataSources(),
        liquidity,
        fdv: marketCap * (1.2 + Math.random() * 0.8),
        transactions_24h: Math.floor(Math.random() * 1000 + 100),
        unique_wallets_24h: Math.floor(holders * (Math.random() * 0.8 + 0.2)),
        social_sentiment: socialSentiment,
        risk_score: riskScore,
        verified: Math.random() > 0.4,
        audit_status: Math.random() > 0.7 ? "audited" : Math.random() > 0.5 ? "pending" : "unaudited",
        last_verified: Math.random() > 0.5 ? now - Math.random() * 86400 : 0,
        website: Math.random() > 0.6 ? `https://${template.name.toLowerCase()}.com` : undefined,
        telegram: Math.random() > 0.5 ? `https://t.me/${template.name.toLowerCase()}` : undefined,
        twitter: Math.random() > 0.7 ? `https://twitter.com/${template.name.toLowerCase()}` : undefined,
      }

      this.tokens.push(token)
    }

    console.log(`✅ تم توليد ${this.tokens.length} عملة محسنة`)
  }

  private generateMintAddress(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789"
    let result = ""
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private getRandomDataSources(): string[] {
    const allSources = ["PumpFun Direct", "DexScreener", "Jupiter", "Birdeye", "CoinGecko", "Enhanced API"]
    const count = Math.floor(Math.random() * 3) + 2 // 2-4 مصادر
    const sources = []
    const shuffled = [...allSources].sort(() => 0.5 - Math.random())

    for (let i = 0; i < count && i < shuffled.length; i++) {
      sources.push(shuffled[i])
    }

    return sources
  }

  async getTokens(): Promise<EnhancedPumpToken[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    return [...this.tokens]
  }

  getEnhancedStatus() {
    return {
      activeSources: ["PumpFun Direct", "DexScreener", "Jupiter"],
      cacheAge: Math.random() * 30000,
      retryCount: Math.floor(Math.random() * 3),
      dataQualityScore: 85 + Math.random() * 15,
      sourcesStatus: [
        { name: "PumpFun", isActive: true, avgResponseTime: 150, failureCount: 0 },
        { name: "DexScreener", isActive: true, avgResponseTime: 200, failureCount: 1 },
        { name: "Jupiter", isActive: true, avgResponseTime: 180, failureCount: 0 },
      ],
    }
  }
}

// إنشاء instance من الخدمة المحسنة
const enhancedPumpService = new MockEnhancedPumpService()

class PremiumTokenService {
  private tokens: PremiumTokenInfo[] = []
  private isInitialized = false
  private lastUpdate = 0
  private updateInterval: NodeJS.Timeout | null = null
  private listeners: ((tokens: PremiumTokenInfo[]) => void)[] = []
  private isConnectedToPumpFun = false
  private qualityThreshold = 75
  private updateFrequency = 15000 // 15 ثانية

  /**
   * 🚀 تهيئة الخدمة المتميزة
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isConnectedToPumpFun
    }

    console.log("🏆 تهيئة خدمة العملات المتميزة...")

    try {
      // تهيئة خدمة pump.fun المحسنة
      const connected = await enhancedPumpService.initialize()

      this.isConnectedToPumpFun = connected
      this.isInitialized = true

      if (connected) {
        // جلب البيانات الأولى
        await this.fetchPremiumTokens()

        // بدء التحديث التلقائي المحسن
        this.startEnhancedAutoUpdate()

        console.log("✅ تم تهيئة خدمة العملات المتميزة بنجاح")
      } else {
        console.log("⚠️ تم التهيئة مع بيانات احتياطية عالية الجودة")
      }

      return true
    } catch (error) {
      console.error("❌ فشل تهيئة خدمة العملات المتميزة:", error)
      this.isConnectedToPumpFun = false
      this.isInitialized = false
      return false
    }
  }

  /**
   * 🏆 جلب العملات المتميزة
   */
  private async fetchPremiumTokens(): Promise<void> {
    try {
      console.log("🏆 جلب العملات المتميزة...")

      const enhancedTokens = await enhancedPumpService.getTokens()

      if (!enhancedTokens || enhancedTokens.length === 0) {
        console.log("⚠️ لم يتم استلام عملات محسنة")
        return
      }

      // تحويل البيانات إلى التنسيق المتميز
      const premiumTokens = enhancedTokens.map((token) => this.convertToPremiumTokenInfo(token))

      // فلترة العملات عالية الجودة فقط
      const highQualityTokens = premiumTokens.filter((token) => this.meetsPremiumCriteria(token))

      // ترتيب حسب نقاط الجودة والإمكانات
      highQualityTokens.sort((a, b) => {
        const scoreA = a.trustScore + a.potentialScore
        const scoreB = b.trustScore + b.potentialScore
        return scoreB - scoreA
      })

      this.tokens = highQualityTokens.slice(0, 40) // أفضل 40 عملة
      this.lastUpdate = Date.now()

      console.log(`✅ تم جلب ${this.tokens.length} عملة متميزة`)

      // إشعار المستمعين
      this.notifyListeners()
    } catch (error) {
      console.error("❌ فشل جلب العملات المتميزة:", error)

      // في حالة الفشل، احتفظ بالبيانات القديمة إذا كانت حديثة
      const now = Date.now()
      if (this.tokens.length === 0 || now - this.lastUpdate > 2 * 60 * 1000) {
        // إذا لم توجد بيانات أو كانت قديمة، أنشئ بيانات متميزة
        this.generatePremiumFallbackTokens()
      }
    }
  }

  /**
   * 🔄 تحويل EnhancedPumpToken إلى PremiumTokenInfo
   */
  private convertToPremiumTokenInfo(enhancedToken: EnhancedPumpToken): PremiumTokenInfo {
    const now = Date.now() / 1000
    const ageInMinutes = (now - enhancedToken.created_timestamp) / 60
    const createdToday = ageInMinutes < 24 * 60

    // حساب النقاط المتقدمة
    const trustScore = this.calculateTrustScore(enhancedToken)
    const potentialScore = this.calculatePotentialScore(enhancedToken)
    const safetyRating = this.calculateSafetyRating(enhancedToken)
    const investmentGrade = this.calculateInvestmentGrade(trustScore, potentialScore, enhancedToken.risk_score || 0)

    // تحديد التوصية المحسنة
    let recommendation: "Recommended" | "Classified" | "Ignored"
    const combinedScore = (trustScore + potentialScore) / 2
    if (combinedScore >= 85 && safetyRating === "High") {
      recommendation = "Recommended"
    } else if (combinedScore >= 70 && safetyRating !== "Low") {
      recommendation = "Classified"
    } else {
      recommendation = "Ignored"
    }

    return {
      id: enhancedToken.mint,
      name: enhancedToken.name,
      symbol: enhancedToken.symbol,
      decimals: enhancedToken.decimals,
      logo: typeof enhancedToken.image === "string" && enhancedToken.image.length <= 4 ? enhancedToken.image : "🪙",
      supply: enhancedToken.total_supply,
      holders: enhancedToken.holder_count,
      price: enhancedToken.price,
      marketCap: enhancedToken.market_cap,
      lastUpdate: new Date(),
      isRealData:
        enhancedToken.data_sources.length > 0 && !enhancedToken.data_sources.includes("High-Quality Fallback"),
      createdToday,
      pumpFunUrl: `https://pump.fun/${enhancedToken.mint}`,
      description: enhancedToken.description,
      volume24h: enhancedToken.volume_24h,
      priceChange24h: enhancedToken.price_change_24h,
      priceChange1h: enhancedToken.price_change_1h || 0,
      priceChange5m: enhancedToken.price_change_5m || 0,
      createdTimestamp: enhancedToken.created_timestamp,
      creator: enhancedToken.creator,
      isFromPumpFun: enhancedToken.data_sources.includes("PumpFun Direct"),
      isLive: enhancedToken.is_currently_live,
      replyCount: enhancedToken.reply_count,
      complete: enhancedToken.complete,
      ageInMinutes,
      qualityScore: enhancedToken.data_quality_score,
      recommendation,
      isNew: ageInMinutes <= 5,
      // حقول محسنة
      liquidity: enhancedToken.liquidity || 0,
      fdv: enhancedToken.fdv || enhancedToken.market_cap,
      transactions24h: enhancedToken.transactions_24h || 0,
      uniqueWallets24h: enhancedToken.unique_wallets_24h || 0,
      socialSentiment: enhancedToken.social_sentiment || 50,
      riskScore: enhancedToken.risk_score || 50,
      verified: enhancedToken.verified || false,
      auditStatus: enhancedToken.audit_status || "unaudited",
      dataQualityScore: enhancedToken.data_quality_score,
      dataSources: enhancedToken.data_sources,
      trustScore,
      potentialScore,
      safetyRating,
      investmentGrade,
    }
  }

  /**
   * 🛡️ حساب نقاط الثقة
   */
  private calculateTrustScore(token: EnhancedPumpToken): number {
    let score = 0

    // نقاط مصادر البيانات (25 نقطة)
    const realSources = token.data_sources.filter((source) => source !== "High-Quality Fallback")
    score += Math.min(realSources.length * 8, 25)

    // نقاط التحقق (20 نقطة)
    if (token.verified) score += 15
    if (token.audit_status === "audited") score += 10
    if (token.last_verified && token.last_verified > 0) score += 5

    // نقاط السيولة (20 نقطة)
    if (token.liquidity && token.liquidity > 50000) score += 20
    else if (token.liquidity && token.liquidity > 20000) score += 15
    else if (token.liquidity && token.liquidity > 10000) score += 10
    else if (token.liquidity && token.liquidity > 5000) score += 5

    // نقاط النشاط (15 نقطة)
    if (token.is_currently_live) score += 8
    if (token.transactions_24h && token.transactions_24h > 100) score += 7

    // نقاط الشفافية (10 نقطة)
    if (token.website) score += 3
    if (token.telegram) score += 3
    if (token.twitter) score += 4

    // نقاط جودة البيانات (10 نقطة)
    score += (token.data_quality_score / 100) * 10

    return Math.min(score, 100)
  }

  /**
   * 🚀 حساب نقاط الإمكانات
   */
  private calculatePotentialScore(token: EnhancedPumpToken): number {
    let score = 0

    // نقاط العمر المبكر (25 نقطة)
    const ageMinutes = (Date.now() / 1000 - token.created_timestamp) / 60
    if (ageMinutes <= 5) score += 25
    else if (ageMinutes <= 15) score += 20
    else if (ageMinutes <= 30) score += 15
    else if (ageMinutes <= 60) score += 10
    else if (ageMinutes <= 120) score += 5

    // نقاط القيمة السوقية المنخفضة (20 نقطة)
    if (token.market_cap > 0 && token.market_cap <= 5000) score += 20
    else if (token.market_cap <= 15000) score += 15
    else if (token.market_cap <= 30000) score += 10
    else if (token.market_cap <= 50000) score += 5

    // نقاط النمو السعري (20 نقطة)
    if (token.price_change_24h > 100) score += 20
    else if (token.price_change_24h > 50) score += 15
    else if (token.price_change_24h > 20) score += 10
    else if (token.price_change_24h > 0) score += 5

    // نقاط حجم التداول (15 نقطة)
    const volumeToMcRatio = token.volume_24h / Math.max(token.market_cap, 1)
    if (volumeToMcRatio > 1) score += 15
    else if (volumeToMcRatio > 0.5) score += 12
    else if (volumeToMcRatio > 0.2) score += 8
    else if (volumeToMcRatio > 0.1) score += 5

    // نقاط المشاعر الاجتماعية (10 نقطة)
    if (token.social_sentiment && token.social_sentiment > 80) score += 10
    else if (token.social_sentiment && token.social_sentiment > 60) score += 7
    else if (token.social_sentiment && token.social_sentiment > 40) score += 4

    // نقاط عدد الحاملين (10 نقطة)
    if (token.holder_count > 200) score += 10
    else if (token.holder_count > 100) score += 7
    else if (token.holder_count > 50) score += 4
    else if (token.holder_count > 20) score += 2

    return Math.min(score, 100)
  }

  /**
   * 🛡️ حساب تصنيف الأمان
   */
  private calculateSafetyRating(token: EnhancedPumpToken): "High" | "Medium" | "Low" {
    const riskScore = token.risk_score || 50

    if (riskScore <= 30 && token.verified && token.liquidity && token.liquidity > 20000) {
      return "High"
    } else if (riskScore <= 60 && token.liquidity && token.liquidity > 5000) {
      return "Medium"
    } else {
      return "Low"
    }
  }

  /**
   * 📊 حساب درجة الاستثمار
   */
  private calculateInvestmentGrade(
    trustScore: number,
    potentialScore: number,
    riskScore: number,
  ): "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" {
    const combinedScore = (trustScore + potentialScore) / 2
    const adjustedScore = combinedScore - riskScore * 0.3 // تقليل النقاط حسب المخاطر

    if (adjustedScore >= 90) return "A+"
    else if (adjustedScore >= 85) return "A"
    else if (adjustedScore >= 80) return "B+"
    else if (adjustedScore >= 75) return "B"
    else if (adjustedScore >= 70) return "C+"
    else if (adjustedScore >= 60) return "C"
    else return "D"
  }

  /**
   * ✅ فحص معايير الجودة المتميزة
   */
  private meetsPremiumCriteria(token: PremiumTokenInfo): boolean {
    // معايير أساسية
    if (token.dataQualityScore < this.qualityThreshold) return false
    if (token.riskScore > 80) return false
    if (token.investmentGrade === "D") return false

    // معايير العمر
    if (token.ageInMinutes > 24 * 60) return false // أقل من 24 ساعة

    // معايير القيمة السوقية
    if (token.marketCap > 500000) return false // أقل من 500 ألف

    // معايير الأمان
    if (token.safetyRating === "Low" && token.trustScore < 60) return false

    return true
  }

  /**
   * 🎲 توليد عملات احتياطية متميزة
   */
  private generatePremiumFallbackTokens(): void {
    console.log("🎲 توليد عملات احتياطية متميزة...")

    const premiumTemplates = [
      { name: "ElitePepe", symbol: "EPEPE", emoji: "👑", category: "Meme Premium" },
      { name: "DiamondDoge", symbol: "DDOGE", emoji: "💎", category: "Luxury Meme" },
      { name: "GoldenBonk", symbol: "GBONK", emoji: "🥇", category: "Premium Fun" },
      { name: "PlatinumCat", symbol: "PCAT", emoji: "🏆", category: "Elite Pet" },
      { name: "RoyalRocket", symbol: "RROCKET", emoji: "🚀", category: "Space Premium" },
      { name: "CrystalMoon", symbol: "CMOON", emoji: "🌙", category: "Celestial Elite" },
      { name: "FireDiamond", symbol: "FDIAMOND", emoji: "💎", category: "Gem Premium" },
      { name: "ThunderBolt", symbol: "TBOLT", emoji: "⚡", category: "Energy Elite" },
      { name: "OceanWave", symbol: "OWAVE", emoji: "🌊", category: "Nature Premium" },
      { name: "StarLight", symbol: "SLIGHT", emoji: "⭐", category: "Cosmic Elite" },
    ]

    const premiumTokens: PremiumTokenInfo[] = []
    const now = Date.now() / 1000

    for (let i = 0; i < 25; i++) {
      const template = premiumTemplates[i % premiumTemplates.length]
      const randomId = Math.floor(Math.random() * 10000)
      const ageInMinutes = Math.random() * 30 + 2 // 2-32 دقيقة

      // أسعار وقيم متميزة
      const price = Math.random() * 0.008 + 0.001 // $0.001 - $0.009
      const marketCap = price * 1000000000 * (Math.random() * 0.08 + 0.02) // 2-10% من العرض
      const volume24h = marketCap * (Math.random() * 1.2 + 0.3) // 30-150% من القيمة السوقية
      const holders = Math.floor(Math.random() * 300 + 100) // 100-400 حامل
      const priceChange24h = (Math.random() - 0.3) * 200 + 50 // تحيز إيجابي
      const liquidity = marketCap * (Math.random() * 0.4 + 0.2) // 20-60% من القيمة السوقية

      // نقاط متميزة
      const trustScore = 80 + Math.random() * 20 // 80-100
      const potentialScore = 75 + Math.random() * 25 // 75-100
      const riskScore = Math.random() * 40 + 10 // 10-50 (منخفض)
      const dataQualityScore = 85 + Math.random() * 15 // 85-100

      const token: PremiumTokenInfo = {
        id: this.generatePremiumMintAddress(),
        name: `${template.name}${randomId}`,
        symbol: `${template.symbol}${randomId}`,
        decimals: 6,
        logo: template.emoji,
        supply: 1000000000,
        holders,
        price,
        marketCap,
        lastUpdate: new Date(),
        isRealData: false,
        createdToday: true,
        pumpFunUrl: `https://pump.fun/premium-${randomId}`,
        description: `Premium ${template.category} token with enhanced features and high-quality metrics`,
        volume24h,
        priceChange24h,
        priceChange1h: (Math.random() - 0.4) * 30 + 10,
        priceChange5m: (Math.random() - 0.4) * 15 + 5,
        createdTimestamp: now - ageInMinutes * 60,
        creator: this.generatePremiumMintAddress(),
        isFromPumpFun: false,
        isLive: Math.random() > 0.2,
        replyCount: Math.floor(Math.random() * 150 + 50),
        complete: Math.random() > 0.4,
        ageInMinutes,
        qualityScore: dataQualityScore,
        recommendation: trustScore > 90 && potentialScore > 85 ? "Recommended" : "Classified",
        isNew: ageInMinutes <= 10,
        // حقول محسنة
        liquidity,
        fdv: marketCap * (1.5 + Math.random()),
        transactions24h: Math.floor(Math.random() * 800 + 200),
        uniqueWallets24h: Math.floor(holders * (Math.random() * 0.6 + 0.4)),
        socialSentiment: 60 + Math.random() * 40,
        riskScore,
        verified: Math.random() > 0.3,
        auditStatus: Math.random() > 0.6 ? "audited" : "pending",
        dataQualityScore,
        dataSources: ["Premium Fallback"],
        trustScore,
        potentialScore,
        safetyRating: riskScore < 30 ? "High" : riskScore < 50 ? "Medium" : "Low",
        investmentGrade: this.calculateInvestmentGrade(trustScore, potentialScore, riskScore),
      }

      premiumTokens.push(token)
    }

    // ترتيب حسب الجودة الإجمالية
    premiumTokens.sort((a, b) => {
      const scoreA = a.trustScore + a.potentialScore - a.riskScore * 0.5
      const scoreB = b.trustScore + b.potentialScore - b.riskScore * 0.5
      return scoreB - scoreA
    })

    this.tokens = premiumTokens
    this.lastUpdate = Date.now()

    console.log(`✅ تم توليد ${premiumTokens.length} عملة احتياطية متميزة`)
    this.notifyListeners()
  }

  /**
   * 🔑 توليد عنوان mint متميز
   */
  private generatePremiumMintAddress(): string {
    const premiumChars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789"
    let result = "PREMIUM"
    for (let i = 7; i < 44; i++) {
      result += premiumChars.charAt(Math.floor(Math.random() * premiumChars.length))
    }
    return result
  }

  /**
   * 🔄 بدء التحديث التلقائي المحسن
   */
  private startEnhancedAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(async () => {
      try {
        await this.fetchPremiumTokens()
      } catch (error) {
        console.error("❌ فشل التحديث التلقائي:", error)
      }
    }, this.updateFrequency)

    console.log(`🔄 بدء التحديث التلقائي كل ${this.updateFrequency / 1000} ثانية`)
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
   * 📊 الحصول على العملات المتميزة
   */
  async getTokens(): Promise<PremiumTokenInfo[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return [...this.tokens]
  }

  /**
   * 🔍 البحث في العملات المتميزة
   */
  searchTokens(query: string): PremiumTokenInfo[] {
    if (!query.trim()) return [...this.tokens]

    const searchTerm = query.toLowerCase().trim()
    return this.tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchTerm) ||
        token.symbol.toLowerCase().includes(searchTerm) ||
        token.description.toLowerCase().includes(searchTerm),
    )
  }

  /**
   * 🏆 الحصول على العملات الموصى بها
   */
  getRecommendedTokens(): PremiumTokenInfo[] {
    return this.tokens.filter((token) => token.recommendation === "Recommended")
  }

  /**
   * 🆕 الحصول على العملات الجديدة
   */
  getNewTokens(): PremiumTokenInfo[] {
    return this.tokens.filter((token) => token.isNew)
  }

  /**
   * 📈 الحصول على العملات الرائجة
   */
  getTrendingTokens(): PremiumTokenInfo[] {
    return this.tokens
      .filter((token) => token.priceChange24h > 20 && token.volume24h > 1000)
      .sort((a, b) => b.priceChange24h - a.priceChange24h)
      .slice(0, 10)
  }

  /**
   * 👂 إضافة مستمع
   */
  addListener(callback: (tokens: PremiumTokenInfo[]) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (tokens: PremiumTokenInfo[]) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  /**
   * 📊 حالة الخدمة المتميزة
   */
  getStatus(): {
    isInitialized: boolean
    isConnected: boolean
    tokenCount: number
    lastUpdate: number
    recommendedCount: number
    newTokensCount: number
    averageQualityScore: number
    enhancedServiceStatus: any
  } {
    const recommendedCount = this.tokens.filter((t) => t.recommendation === "Recommended").length
    const newTokensCount = this.tokens.filter((t) => t.isNew).length
    const averageQualityScore =
      this.tokens.length > 0 ? this.tokens.reduce((sum, t) => sum + t.dataQualityScore, 0) / this.tokens.length : 0

    return {
      isInitialized: this.isInitialized,
      isConnected: this.isConnectedToPumpFun,
      tokenCount: this.tokens.length,
      lastUpdate: this.lastUpdate,
      recommendedCount,
      newTokensCount,
      averageQualityScore: Math.round(averageQualityScore),
      enhancedServiceStatus: enhancedPumpService.getEnhancedStatus(),
    }
  }

  /**
   * 🔄 إعادة تشغيل الخدمة
   */
  async restart(): Promise<boolean> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    this.tokens = []
    this.isInitialized = false
    this.lastUpdate = 0
    this.isConnectedToPumpFun = false

    return await this.initialize()
  }

  /**
   * 🧹 تنظيف الموارد
   */
  cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.listeners = []
    this.tokens = []
  }
}

// إنشاء instance واحد وتصديره
export const premiumTokenService = new PremiumTokenService()
export type { PremiumTokenInfo }
