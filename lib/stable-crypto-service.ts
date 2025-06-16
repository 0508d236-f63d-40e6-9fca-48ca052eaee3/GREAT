// خدمة العملات المشفرة المستقرة
export interface CryptoToken {
  id: string
  name: string
  symbol: string
  price: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  createdAt: Date
  isEligible: boolean
  riskScore: number
}

class StableCryptoService {
  private tokens: CryptoToken[] = []
  private isInitialized = false
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeWithMockData()
  }

  // تهيئة البيانات التجريبية المستقرة
  private initializeWithMockData() {
    const mockTokens: CryptoToken[] = [
      {
        id: "token-1",
        name: "SolanaGem",
        symbol: "SGEM",
        price: 0.00045,
        marketCap: 12500,
        volume24h: 8500,
        priceChange24h: 15.2,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 دقائق مضت
        isEligible: true,
        riskScore: 7.5,
      },
      {
        id: "token-2",
        name: "MoonRocket",
        symbol: "MOON",
        price: 0.00032,
        marketCap: 9800,
        volume24h: 6200,
        priceChange24h: 8.7,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 دقيقة مضت
        isEligible: true,
        riskScore: 6.8,
      },
      {
        id: "token-3",
        name: "DiamondHands",
        symbol: "DIAM",
        price: 0.00028,
        marketCap: 14200,
        volume24h: 11300,
        priceChange24h: 22.1,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 دقائق مضت
        isEligible: true,
        riskScore: 8.2,
      },
      {
        id: "token-4",
        name: "SafeGain",
        symbol: "SAFE",
        price: 0.00051,
        marketCap: 11700,
        volume24h: 7800,
        priceChange24h: 12.4,
        createdAt: new Date(Date.now() - 18 * 60 * 1000), // 18 دقيقة مضت
        isEligible: true,
        riskScore: 7.1,
      },
    ]

    this.tokens = mockTokens
    this.isInitialized = true
    this.startAutoUpdate()
  }

  // تحديث البيانات تلقائياً
  private startAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(() => {
      this.updateTokenData()
    }, 30000) // كل 30 ثانية
  }

  // تحديث بيانات العملات
  private updateTokenData() {
    this.tokens = this.tokens.map((token) => ({
      ...token,
      price: token.price * (1 + (Math.random() - 0.5) * 0.1), // تغيير عشوائي ±5%
      volume24h: token.volume24h * (1 + (Math.random() - 0.5) * 0.2), // تغيير عشوائي ±10%
      priceChange24h: token.priceChange24h + (Math.random() - 0.5) * 5, // تغيير عشوائي ±2.5%
    }))
  }

  // الحصول على العملات المؤهلة
  public getEligibleTokens(): CryptoToken[] {
    const now = new Date()
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000)

    return this.tokens
      .filter((token) => token.marketCap <= 15000 && token.createdAt >= twentyMinutesAgo && token.isEligible)
      .sort((a, b) => b.riskScore - a.riskScore)
  }

  // الحصول على إحصائيات
  public getStats() {
    const eligibleTokens = this.getEligibleTokens()
    return {
      totalTokens: this.tokens.length,
      eligibleTokens: eligibleTokens.length,
      averageMarketCap: eligibleTokens.reduce((sum, token) => sum + token.marketCap, 0) / eligibleTokens.length || 0,
      totalVolume: eligibleTokens.reduce((sum, token) => sum + token.volume24h, 0),
      lastUpdate: new Date(),
    }
  }

  // تنظيف الموارد
  public cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}

export const stableCryptoService = new StableCryptoService()
