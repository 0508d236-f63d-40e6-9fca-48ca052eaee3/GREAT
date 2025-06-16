// خدمة تحليل المشاعر من Twitter API
interface TwitterSentiment {
  score: number // -1 to 1
  magnitude: number // 0 to 1
  mentions: number
  engagement: number
  influencer_mentions: TwitterInfluencer[]
}

interface TwitterInfluencer {
  username: string
  followers: number
  verified: boolean
  crypto_influence_score: number
}

class TwitterAPI {
  private bearerToken: string
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 300000 // 5 minutes

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || ""
  }

  private getFromCache(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async analyzeSentiment(tokenSymbol: string, tokenName: string): Promise<TwitterSentiment> {
    const cacheKey = `sentiment-${tokenSymbol}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    if (!this.bearerToken) {
      console.warn("Twitter Bearer Token not provided")
      return {
        score: 0,
        magnitude: 0,
        mentions: 0,
        engagement: 0,
        influencer_mentions: [],
      }
    }

    try {
      // البحث عن التغريدات المتعلقة بالعملة
      const query = `${tokenSymbol} OR "${tokenName}" -is:retweet lang:en`
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=100&tweet.fields=public_metrics,author_id,created_at&user.fields=public_metrics,verified`,
        {
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.data || data.data.length === 0) {
        return {
          score: 0,
          magnitude: 0,
          mentions: 0,
          engagement: 0,
          influencer_mentions: [],
        }
      }

      // تحليل المشاعر والتفاعل
      let totalSentiment = 0
      let totalEngagement = 0
      const influencers: TwitterInfluencer[] = []

      for (const tweet of data.data) {
        // تحليل المشاعر البسيط (يمكن تحسينه باستخدام ML)
        const sentiment = this.analyzeTweetSentiment(tweet.text)
        totalSentiment += sentiment

        const engagement =
          (tweet.public_metrics?.like_count || 0) +
          (tweet.public_metrics?.retweet_count || 0) +
          (tweet.public_metrics?.reply_count || 0)
        totalEngagement += engagement

        // فحص المؤثرين
        if (data.includes?.users) {
          const author = data.includes.users.find((u: any) => u.id === tweet.author_id)
          if (author && author.public_metrics?.followers_count > 100000) {
            influencers.push({
              username: author.username,
              followers: author.public_metrics.followers_count,
              verified: author.verified || false,
              crypto_influence_score: this.calculateCryptoInfluence(author),
            })
          }
        }
      }

      const sentiment: TwitterSentiment = {
        score: totalSentiment / data.data.length,
        magnitude: Math.abs(totalSentiment / data.data.length),
        mentions: data.data.length,
        engagement: totalEngagement,
        influencer_mentions: influencers,
      }

      this.setCache(cacheKey, sentiment)
      return sentiment
    } catch (error) {
      console.error(`Error analyzing sentiment for ${tokenSymbol}:`, error)
      return {
        score: 0,
        magnitude: 0,
        mentions: 0,
        engagement: 0,
        influencer_mentions: [],
      }
    }
  }

  private analyzeTweetSentiment(text: string): number {
    // تحليل مشاعر بسيط - يمكن تحسينه
    const positiveWords = ["moon", "bullish", "pump", "gem", "diamond", "rocket", "lambo", "buy", "hold", "hodl"]
    const negativeWords = ["dump", "bearish", "scam", "rug", "sell", "crash", "dead", "shit"]

    const lowerText = text.toLowerCase()
    let score = 0

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) score += 1
    })

    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) score -= 1
    })

    return Math.max(-1, Math.min(1, score / 5))
  }

  private calculateCryptoInfluence(user: any): number {
    let score = 0

    // وزن المتابعين
    const followers = user.public_metrics?.followers_count || 0
    if (followers > 10000000)
      score += 10 // +10M
    else if (followers > 1000000)
      score += 8 // +1M
    else if (followers > 500000)
      score += 6 // +500K
    else if (followers > 100000) score += 4 // +100K

    // التحقق
    if (user.verified) score += 2

    // كلمات مفتاحية في البايو
    const bio = (user.description || "").toLowerCase()
    const cryptoKeywords = ["crypto", "bitcoin", "ethereum", "defi", "nft", "blockchain", "trader"]
    cryptoKeywords.forEach((keyword) => {
      if (bio.includes(keyword)) score += 1
    })

    return Math.min(20, score)
  }
}

export const twitterAPI = new TwitterAPI()
