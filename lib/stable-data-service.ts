/**
 * 🛡️ خدمة البيانات المستقرة - تضمن عمل النظام 100%
 * بيانات فورية وموثوقة بدون أخطاء
 */

export interface StableTokenInfo {
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
  meetsBasicCriteria: boolean
}

class StableDataService {
  private tokens: StableTokenInfo[] = []
  private isInitialized = false
  private lastUpdate = 0
  private updateInterval: NodeJS.Timeout | null = null
  private listeners: ((tokens: StableTokenInfo[]) => void)[] = []

  /**
   * 🚀 تهيئة فورية مع بيانات مضمونة
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true
    }

    console.log("🛡️ تهيئة خدمة البيانات المستقرة...")

    // إنشاء بيانات فورية
    this.tokens = this.generateStableTokens()
    this.isInitialized = true
    this.lastUpdate = Date.now()

    // بدء التحديث التلقائي
    this.startAutoUpdate()

    console.log(`✅ تم تهيئة ${this.tokens.length} عملة بنجاح`)
    return true
  }

  /**
   * 📊 جلب العملات مع ضمان الاستقرار
   */
  async getTokens(): Promise<StableTokenInfo[]> {
    // تأكد من التهيئة
    if (!this.isInitialized) {
      await this.initialize()
    }

    // تحديث البيانات إذا لزم الأمر
    const now = Date.now()
    if (now - this.lastUpdate > 30000) {
      // كل 30 ثانية
      this.updateTokenData()
    }

    return [...this.tokens] // نسخة آمنة
  }

  /**
   * 🎲 توليد عملات مستقرة وواقعية
   */
  private generateStableTokens(): StableTokenInfo[] {
    const tokenNames = [
      "MAGA PEPE TRUMP",
      "AI Cat Destroyer",
      "Smoking Pepe",
      "Doge The Destroyer",
      "Unicorn Blast",
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
      "Shiba Inu",
      "Floki Inu",
      "Baby Doge",
      "SafeMoon",
      "ElonMusk",
      "Tesla Coin",
      "Bitcoin Baby",
      "Ethereum Max",
      "Solana Killer",
      "Cardano Coin",
      "Polygon Matic",
      "Chainlink Oracle",
      "Uniswap Token",
      "PancakeSwap",
      "SushiSwap",
      "Compound Finance",
      "Aave Protocol",
      "Maker DAO",
      "Synthetix Network",
      "Yearn Finance",
      "Curve Finance",
      "Balancer Protocol",
      "1inch Exchange",
      "0x Protocol",
      "Kyber Network",
      "Bancor Network",
      "Loopring",
      "Ren Protocol",
      "Ocean Protocol",
      "The Graph",
      "Filecoin",
      "Arweave",
      "Helium Network",
    ]

    const symbols = [
      "MPT",
      "AICAT",
      "SMOKE",
      "DTD",
      "UBLAST",
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
      "SHIB",
      "FLOKI",
      "BABYDOGE",
      "SAFEMOON",
      "ELON",
      "TESLA",
      "BTCBABY",
      "ETHMAX",
      "SOLKILL",
      "ADA",
      "MATIC",
      "LINK",
      "UNI",
      "CAKE",
      "SUSHI",
      "COMP",
      "AAVE",
      "MKR",
      "SNX",
      "YFI",
      "CRV",
      "BAL",
      "1INCH",
      "ZRX",
      "KNC",
      "BNT",
      "LRC",
      "REN",
      "OCEAN",
      "GRT",
      "FIL",
      "AR",
      "HNT",
    ]

    const emojis = [
      "🚀",
      "🌙",
      "💎",
      "🦍",
      "🐸",
      "🐕",
      "🐱",
      "🔥",
      "⚡",
      "🎯",
      "🏆",
      "💰",
      "📈",
      "🎪",
      "🎭",
      "🎨",
      "🎵",
      "🎮",
      "🎲",
      "🎳",
      "🎸",
      "🎺",
      "🎻",
      "🎤",
      "🎧",
      "🎬",
      "🎭",
      "🎪",
      "🎨",
      "🎯",
      "🎲",
      "🎮",
      "🚁",
      "🚂",
      "🚢",
      "✈️",
      "🚀",
      "🛸",
      "🏎️",
      "🏍️",
      "🚴",
      "🏃",
      "🤸",
      "🏋️",
      "🤾",
      "🏌️",
      "🏄",
      "🏊",
      "🧗",
      "🚵",
      "🏇",
      "⛷️",
    ]

    const tokens: StableTokenInfo[] = []
    const now = Date.now() / 1000

    for (let i = 0; i < 500; i++) {
      const nameIndex = i % tokenNames.length
      const symbolIndex = i % symbols.length
      const emojiIndex = i % emojis.length

      // توزيع زمني واقعي - معظم العملات في آخر 20 دقيقة
      const timeRange = Math.random()
      let createdTime: number

      if (timeRange < 0.4) {
        // 40% في آخر 5 دقائق
        createdTime = now - Math.random() * 5 * 60
      } else if (timeRange < 0.7) {
        // 30% في آخر 10 دقائق
        createdTime = now - Math.random() * 10 * 60
      } else if (timeRange < 0.9) {
        // 20% في آخر 20 دقيقة
        createdTime = now - Math.random() * 20 * 60
      } else {
        // 10% أقدم من 20 دقيقة (للتنويع)
        createdTime = now - Math.random() * 60 * 60
      }

      const ageInMinutes = (now - createdTime) / 60

      // أسعار واقعية
      const priceRange = Math.random()
      let price: number
      if (priceRange < 0.6) {
        price = Math.random() * 0.0001 // عملات رخيصة جداً
      } else if (priceRange < 0.85) {
        price = Math.random() * 0.001 // عملات متوسطة
      } else {
        price = Math.random() * 0.01 // عملات أغلى
      }

      // قيمة سوقية واقعية (معظمها تحت 15000)
      let marketCap: number
      if (Math.random() < 0.8) {
        marketCap = Math.random() * 15000 // 80% تحت 15000
      } else {
        marketCap = Math.random() * 100000 // 20% أعلى
      }

      // حجم تداول واقعي
      const volumeRange = Math.random()
      let volume24h: number
      if (volumeRange < 0.7) {
        volume24h = Math.random() * 5000
      } else if (volumeRange < 0.9) {
        volume24h = Math.random() * 25000
      } else {
        volume24h = Math.random() * 100000
      }

      // معايير الفحص
      const meetsBasicCriteria = ageInMinutes <= 20 && marketCap <= 15000 && price > 0

      const token: StableTokenInfo = {
        mint: this.generateRandomMint(),
        name: tokenNames[nameIndex],
        symbol: symbols[symbolIndex],
        decimals: 6,
        logo: emojis[emojiIndex],
        supply: 1000000000,
        holders: Math.floor(Math.random() * 2000) + 50,
        price: price,
        marketCap: marketCap,
        lastUpdate: new Date(),
        isRealData: false, // بيانات تجريبية مستقرة
        createdToday: ageInMinutes < 24 * 60,
        pumpFunUrl: `https://pump.fun/${this.generateRandomMint()}`,
        description: `Revolutionary ${tokenNames[nameIndex]} token with unique features`,
        volume24h: volume24h,
        priceChange24h: (Math.random() - 0.5) * 200, // تغيير من -100% إلى +100%
        createdTimestamp: createdTime,
        creator: this.generateRandomMint(),
        isFromPumpFun: true,
        isLive: Math.random() > 0.3,
        replyCount: Math.floor(Math.random() * 150),
        complete: Math.random() > 0.8,
        ageInMinutes: ageInMinutes,
        meetsBasicCriteria: meetsBasicCriteria,
      }

      tokens.push(token)
    }

    // ترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
    return tokens.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
  }

  /**
   * 🔄 تحديث البيانات بشكل سلس
   */
  private updateTokenData(): void {
    const now = Date.now() / 1000

    // تحديث أعمار العملات
    this.tokens.forEach((token) => {
      token.ageInMinutes = (now - token.createdTimestamp) / 60
      token.meetsBasicCriteria = token.ageInMinutes <= 20 && token.marketCap <= 15000 && token.price > 0

      // تحديث طفيف في الأسعار (محاكاة التداول)
      const priceChange = (Math.random() - 0.5) * 0.1 // تغيير ±10%
      token.price = Math.max(token.price * (1 + priceChange), 0.000001)
      token.marketCap = token.price * token.supply

      // تحديث حجم التداول
      const volumeChange = (Math.random() - 0.5) * 0.2 // تغيير ±20%
      token.volume24h = Math.max(token.volume24h * (1 + volumeChange), 0)

      // تحديث عدد الحاملين
      if (Math.random() < 0.1) {
        // 10% احتمال تغيير عدد الحاملين
        token.holders += Math.floor((Math.random() - 0.5) * 10)
        token.holders = Math.max(token.holders, 1)
      }

      token.lastUpdate = new Date()
    })

    // إضافة عملات جديدة أحياناً
    if (Math.random() < 0.3) {
      // 30% احتمال إضافة عملة جديدة
      const newTokens = this.generateStableTokens().slice(0, Math.floor(Math.random() * 3) + 1)
      this.tokens = [...newTokens, ...this.tokens].slice(0, 500) // الحفاظ على 500 عملة
    }

    this.lastUpdate = Date.now()
    this.notifyListeners()
  }

  /**
   * ⏰ بدء التحديث التلقائي
   */
  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(() => {
      this.updateTokenData()
    }, 30000) // كل 30 ثانية
  }

  /**
   * 🔑 توليد عنوان عملة عشوائي
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
   * 👂 إضافة مستمع للتحديثات
   */
  addListener(callback: (tokens: StableTokenInfo[]) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (tokens: StableTokenInfo[]) => void): void {
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
        console.error("خطأ في إشعار المستمع:", error)
      }
    })
  }

  /**
   * 🔍 البحث في العملات
   */
  searchTokens(query: string): StableTokenInfo[] {
    const queryLower = query.toLowerCase()
    return this.tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(queryLower) ||
        token.symbol.toLowerCase().includes(queryLower) ||
        token.mint.toLowerCase().includes(queryLower),
    )
  }

  /**
   * 📊 فلترة العملات حسب المعايير
   */
  filterTokens(criteria: {
    maxAge?: number // بالدقائق
    maxMarketCap?: number
    minPrice?: number
    maxPrice?: number
    onlyMeetsCriteria?: boolean
  }): StableTokenInfo[] {
    return this.tokens.filter((token) => {
      if (criteria.maxAge && token.ageInMinutes > criteria.maxAge) return false
      if (criteria.maxMarketCap && token.marketCap > criteria.maxMarketCap) return false
      if (criteria.minPrice && token.price < criteria.minPrice) return false
      if (criteria.maxPrice && token.price > criteria.maxPrice) return false
      if (criteria.onlyMeetsCriteria && !token.meetsBasicCriteria) return false
      return true
    })
  }

  /**
   * 📈 إحصائيات العملات
   */
  getStats(): {
    total: number
    meetsCriteria: number
    averageAge: number
    averageMarketCap: number
    totalVolume: number
  } {
    const meetsCriteria = this.tokens.filter((t) => t.meetsBasicCriteria).length
    const averageAge = this.tokens.reduce((sum, t) => sum + t.ageInMinutes, 0) / this.tokens.length
    const averageMarketCap = this.tokens.reduce((sum, t) => sum + t.marketCap, 0) / this.tokens.length
    const totalVolume = this.tokens.reduce((sum, t) => sum + t.volume24h, 0)

    return {
      total: this.tokens.length,
      meetsCriteria,
      averageAge,
      averageMarketCap,
      totalVolume,
    }
  }

  /**
   * 🔄 إعادة تحميل البيانات
   */
  async refresh(): Promise<StableTokenInfo[]> {
    console.log("🔄 إعادة تحميل البيانات...")
    this.tokens = this.generateStableTokens()
    this.lastUpdate = Date.now()
    this.notifyListeners()
    console.log(`✅ تم تحديث ${this.tokens.length} عملة`)
    return [...this.tokens]
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
    tokenCount: number
    lastUpdate: number
    isRunning: boolean
  } {
    return {
      isInitialized: this.isInitialized,
      tokenCount: this.tokens.length,
      lastUpdate: this.lastUpdate,
      isRunning: this.updateInterval !== null,
    }
  }
}

// إنشاء instance واحد للاستخدام
export const stableDataService = new StableDataService()
export type { StableTokenInfo }
