/**
 * 🔥 خدمة العملات البسيطة - تعمل فوراً بدون تعقيد
 * إنشاء عملات تجريبية واقعية مع تحديث مستمر
 */

export interface SimpleToken {
  mint: string
  name: string
  symbol: string
  logo: string
  price: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  holders: number
  createdTimestamp: number
  secondsSinceCreation: number
  ageInMinutes: number
  description: string
  pumpFunUrl: string
  isLive: boolean
  complete: boolean
  creator: string
  analysisScore?: number
  recommendation?: "Recommended" | "Classified" | "Ignored"
}

class SimpleTokenService {
  private tokens: SimpleToken[] = []
  private isRunning = false
  private updateInterval: NodeJS.Timeout | null = null
  private listeners: ((tokens: SimpleToken[]) => void)[] = []
  private startTime = Date.now()

  // أسماء ورموز العملات الواقعية
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
  ]

  private readonly EMOJIS = ["🐸", "🐕", "🐱", "🚀", "🌙", "💎", "🔥", "🦍", "🦄", "🍌", "⚡", "🎯", "🏆", "💰", "🎪"]

  /**
   * 🚀 بدء الخدمة البسيطة
   */
  start(): void {
    console.log("🚀 بدء خدمة العملات البسيطة...")

    if (this.isRunning) {
      console.log("⚠️ الخدمة تعمل بالفعل")
      return
    }

    try {
      // إنشاء عملات فورية
      this.generateInitialTokens()

      // بدء التحديث المستمر
      this.startContinuousUpdates()

      this.isRunning = true
      console.log(`✅ تم بدء الخدمة بنجاح - ${this.tokens.length} عملة جاهزة`)

      // إشعار المستمعين فوراً
      this.notifyListeners()
    } catch (error) {
      console.error("❌ خطأ في بدء الخدمة:", error)
    }
  }

  /**
   * 🎲 إنشاء عملات أولية
   */
  private generateInitialTokens(): void {
    console.log("🎲 إنشاء عملات أولية...")

    const now = Date.now()
    this.tokens = []

    // إنشاء 100 عملة متنوعة
    for (let i = 0; i < 100; i++) {
      const nameIndex = Math.floor(Math.random() * this.TOKEN_NAMES.length)
      const symbolIndex = Math.floor(Math.random() * this.TOKEN_SYMBOLS.length)
      const emojiIndex = Math.floor(Math.random() * this.EMOJIS.length)

      // توزيع العملات على آخر ساعة
      const ageMinutes = Math.random() * 60 // 0-60 دقيقة
      const createdTime = now - ageMinutes * 60 * 1000
      const secondsSinceCreation = Math.floor((now - createdTime) / 1000)

      const price = Math.random() * 0.01 + 0.0001 // 0.0001 - 0.0101
      const supply = 1000000000
      const marketCap = price * supply

      const token: SimpleToken = {
        mint: this.generateRandomMint(),
        name: this.TOKEN_NAMES[nameIndex] || `Token ${i + 1}`,
        symbol: this.TOKEN_SYMBOLS[symbolIndex] || `TK${i + 1}`,
        logo: this.EMOJIS[emojiIndex] || "🪙",
        price,
        marketCap,
        volume24h: Math.random() * 100000,
        priceChange24h: (Math.random() - 0.5) * 200, // -100% to +100%
        holders: Math.floor(Math.random() * 1000) + 10,
        createdTimestamp: Math.floor(createdTime / 1000),
        secondsSinceCreation,
        ageInMinutes: Math.floor(ageMinutes),
        description: "A revolutionary new meme token on pump.fun",
        pumpFunUrl: `https://pump.fun/${this.generateRandomMint()}`,
        isLive: Math.random() > 0.3,
        complete: Math.random() > 0.9,
        creator: this.generateRandomMint(),
        analysisScore: Math.random() * 100,
        recommendation: this.getRandomRecommendation(),
      }

      this.tokens.push(token)
    }

    // ترتيب حسب العمر (الأحدث أولاً)
    this.tokens.sort((a, b) => b.createdTimestamp - a.createdTimestamp)

    console.log(`✅ تم إنشاء ${this.tokens.length} عملة أولية`)
  }

  /**
   * 🔄 بدء التحديثات المستمرة
   */
  private startContinuousUpdates(): void {
    // تحديث كل 5 ثوان
    this.updateInterval = setInterval(() => {
      this.updateTokens()
    }, 5000)

    console.log("🔄 بدء التحديثات المستمرة كل 5 ثوان")
  }

  /**
   * 📈 تحديث العملات الموجودة
   */
  private updateTokens(): void {
    const now = Date.now()
    let hasChanges = false

    // تحديث العملات الموجودة
    this.tokens.forEach((token) => {
      const newSecondsAge = Math.floor((now - token.createdTimestamp * 1000) / 1000)
      const newMinutesAge = Math.floor(newSecondsAge / 60)

      if (newSecondsAge !== token.secondsSinceCreation) {
        token.secondsSinceCreation = newSecondsAge
        token.ageInMinutes = newMinutesAge

        // تحديث السعر قليلاً
        const priceChange = (Math.random() - 0.5) * 0.1 // تغيير 10%
        token.price = Math.max(0.0001, token.price * (1 + priceChange))
        token.marketCap = token.price * 1000000000

        hasChanges = true
      }
    })

    // إضافة عملة جديدة أحياناً (20% احتمال)
    if (Math.random() < 0.2) {
      this.addNewToken()
      hasChanges = true
    }

    // إزالة العملات القديمة جداً (أكثر من ساعة)
    const initialLength = this.tokens.length
    this.tokens = this.tokens.filter((token) => token.ageInMinutes < 60)

    if (this.tokens.length !== initialLength) {
      hasChanges = true
      console.log(`🧹 تم إزالة ${initialLength - this.tokens.length} عملة قديمة`)
    }

    if (hasChanges) {
      this.notifyListeners()
    }
  }

  /**
   * ➕ إضافة عملة جديدة
   */
  private addNewToken(): void {
    const now = Date.now()
    const nameIndex = Math.floor(Math.random() * this.TOKEN_NAMES.length)
    const symbolIndex = Math.floor(Math.random() * this.TOKEN_SYMBOLS.length)
    const emojiIndex = Math.floor(Math.random() * this.EMOJIS.length)

    // عملة جديدة (0-2 دقيقة)
    const ageSeconds = Math.random() * 120
    const createdTime = now - ageSeconds * 1000

    const price = Math.random() * 0.01 + 0.0001

    const newToken: SimpleToken = {
      mint: this.generateRandomMint(),
      name: this.TOKEN_NAMES[nameIndex] || "New Token",
      symbol: this.TOKEN_SYMBOLS[symbolIndex] || "NEW",
      logo: this.EMOJIS[emojiIndex] || "🆕",
      price,
      marketCap: price * 1000000000,
      volume24h: Math.random() * 50000,
      priceChange24h: (Math.random() - 0.5) * 100,
      holders: Math.floor(Math.random() * 100) + 5,
      createdTimestamp: Math.floor(createdTime / 1000),
      secondsSinceCreation: Math.floor(ageSeconds),
      ageInMinutes: Math.floor(ageSeconds / 60),
      description: "A brand new meme token just launched!",
      pumpFunUrl: `https://pump.fun/${this.generateRandomMint()}`,
      isLive: true,
      complete: false,
      creator: this.generateRandomMint(),
      analysisScore: Math.random() * 100,
      recommendation: this.getRandomRecommendation(),
    }

    // إضافة في المقدمة
    this.tokens.unshift(newToken)

    // الاحتفاظ بـ 150 عملة كحد أقصى
    if (this.tokens.length > 150) {
      this.tokens = this.tokens.slice(0, 150)
    }

    console.log(`➕ تم إضافة عملة جديدة: ${newToken.symbol}`)
  }

  /**
   * 🎯 الحصول على توصية عشوائية
   */
  private getRandomRecommendation(): "Recommended" | "Classified" | "Ignored" {
    const rand = Math.random()
    if (rand < 0.3) return "Recommended"
    if (rand < 0.6) return "Classified"
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
  getTokens(): SimpleToken[] {
    return [...this.tokens] // نسخة للأمان
  }

  /**
   * 🔍 البحث عن عملة
   */
  searchToken(query: string): SimpleToken[] {
    const searchTerm = query.toLowerCase()
    return this.tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchTerm) ||
        token.symbol.toLowerCase().includes(searchTerm) ||
        token.mint.toLowerCase().includes(searchTerm),
    )
  }

  /**
   * 📈 الحصول على إحصائيات
   */
  getStats(): {
    totalTokens: number
    recommendedCount: number
    classifiedCount: number
    ignoredCount: number
    averageAge: number
    newestToken: SimpleToken | null
    oldestToken: SimpleToken | null
    uptimeMinutes: number
  } {
    const now = Date.now()
    const uptimeMinutes = (now - this.startTime) / (60 * 1000)

    const recommended = this.tokens.filter((t) => t.recommendation === "Recommended")
    const classified = this.tokens.filter((t) => t.recommendation === "Classified")
    const ignored = this.tokens.filter((t) => t.recommendation === "Ignored")

    const averageAge =
      this.tokens.length > 0 ? this.tokens.reduce((sum, t) => sum + t.ageInMinutes, 0) / this.tokens.length : 0

    return {
      totalTokens: this.tokens.length,
      recommendedCount: recommended.length,
      classifiedCount: classified.length,
      ignoredCount: ignored.length,
      averageAge,
      newestToken: this.tokens.length > 0 ? this.tokens[0] : null,
      oldestToken: this.tokens.length > 0 ? this.tokens[this.tokens.length - 1] : null,
      uptimeMinutes,
    }
  }

  /**
   * 👂 إضافة مستمع للتحديثات
   */
  addListener(callback: (tokens: SimpleToken[]) => void): void {
    this.listeners.push(callback)
    console.log(`👂 تم إضافة مستمع جديد - المجموع: ${this.listeners.length}`)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (tokens: SimpleToken[]) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
    console.log(`🔕 تم إزالة مستمع - المتبقي: ${this.listeners.length}`)
  }

  /**
   * 📢 إشعار جميع المستمعين
   */
  private notifyListeners(): void {
    console.log(`📢 إشعار ${this.listeners.length} مستمع بـ ${this.tokens.length} عملة`)

    this.listeners.forEach((callback, index) => {
      try {
        callback([...this.tokens])
      } catch (error) {
        console.error(`❌ خطأ في إشعار المستمع ${index}:`, error)
      }
    })
  }

  /**
   * 🛑 إيقاف الخدمة
   */
  stop(): void {
    console.log("🛑 إيقاف خدمة العملات البسيطة...")

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    this.isRunning = false
    this.listeners = []
    this.tokens = []

    console.log("✅ تم إيقاف الخدمة")
  }

  /**
   * 🔄 إعادة تشغيل الخدمة
   */
  restart(): void {
    console.log("🔄 إعادة تشغيل خدمة العملات البسيطة...")
    this.stop()
    setTimeout(() => {
      this.start()
    }, 1000)
  }

  /**
   * 📊 حالة الخدمة
   */
  getStatus(): {
    isRunning: boolean
    tokenCount: number
    listenerCount: number
    uptimeMinutes: number
    lastUpdate: string
  } {
    const now = Date.now()
    const uptimeMinutes = (now - this.startTime) / (60 * 1000)

    return {
      isRunning: this.isRunning,
      tokenCount: this.tokens.length,
      listenerCount: this.listeners.length,
      uptimeMinutes,
      lastUpdate: new Date().toLocaleTimeString(),
    }
  }
}

// إنشاء instance واحد للاستخدام
export const simpleTokenService = new SimpleTokenService()
