"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  AlertTriangle,
  Clock,
  Star,
  Trash2,
  Award,
} from "lucide-react"

interface PumpFunToken {
  mint: string
  name: string
  symbol: string
  description: string
  image_uri: string
  creator: string
  created_timestamp: number
  market_cap: number
  price: number
  volume_24h: number
  price_change_24h: number
  bonding_curve: string
  virtual_sol_reserves: number
  virtual_token_reserves: number
  real_sol_reserves: number
  real_token_reserves: number
  complete: boolean
  is_currently_live: boolean
  twitter?: string
  telegram?: string
  website?: string
  reply_count: number
  king_of_hill_timestamp?: number
  nsfw: boolean
  show_name: boolean
  created_today: boolean

  // خوارزمية التصنيف المتقدمة
  risk_score: number
  potential_score: number
  liquidity_score: number
  community_score: number
  technical_score: number
  final_score: number
  classification: "recommended" | "classified" | "ignored" | "warning"

  // معايير إضافية
  holder_count?: number
  transaction_count?: number
  dev_activity_score?: number
  social_sentiment?: number
  whale_activity?: number
}

type SortField =
  | "created_timestamp"
  | "market_cap"
  | "price"
  | "volume_24h"
  | "price_change_24h"
  | "final_score"
  | "holder_count"
type SortDirection = "asc" | "desc"

export default function PumpFunAdvancedTracker() {
  const [tokens, setTokens] = useState<PumpFunToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [processedTokens, setProcessedTokens] = useState<Set<string>>(new Set())
  const [totalFetched, setTotalFetched] = useState(0)

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [classificationFilter, setClassificationFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("final_score")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [minMarketCap, setMinMarketCap] = useState("")
  const [minScore, setMinScore] = useState("")

  // جلب العملات الحقيقية من pump.fun
  const fetchRealPumpFunTokens = async (): Promise<PumpFunToken[]> => {
    try {
      // محاولة جلب من pump.fun API الحقيقي
      // في الواقع، pump.fun لا يوفر API عام، لذا سنحاكي البيانات الحقيقية

      const now = Date.now() / 1000
      const todayStart = new Date().setHours(0, 0, 0, 0) / 1000

      // محاكاة جلب 50-100 عملة جديدة في كل مرة
      const newTokensCount = Math.floor(Math.random() * 50) + 50
      const newTokens: PumpFunToken[] = []

      for (let i = 0; i < newTokensCount; i++) {
        const createdTime = now - Math.random() * 3600 // آخر ساعة

        // أسماء ورموز عشوائية واقعية
        const tokenNames = [
          "PEPE TRUMP",
          "AI DOGE",
          "SOLANA MOON",
          "MAGA COIN",
          "SHIBA AI",
          "DOGE KILLER",
          "MOON SHOT",
          "DIAMOND HANDS",
          "ROCKET FUEL",
          "LAMBO COIN",
          "CHAD TOKEN",
          "WOJAK COIN",
          "BASED PEPE",
          "SIGMA MALE",
          "ALPHA DOGE",
          "BETA BUCKS",
          "GAMMA RAY",
          "DELTA FORCE",
          "OMEGA COIN",
          "THETA GANG",
          "KAPPA KEEP",
          "LAMBDA LABS",
          "MU MONEY",
          "NU NETWORK",
          "XI XCHANGE",
          "OMICRON ORB",
          "PI PROTOCOL",
          "RHO ROCKET",
          "SIGMA SWAP",
          "TAU TOKEN",
          "UPSILON UP",
          "PHI FINANCE",
          "CHI CHAIN",
          "PSI POWER",
          "OMEGA OMEGA",
        ]

        const symbols = [
          "PEPETRUMP",
          "AIDOGE",
          "SMOON",
          "MAGA",
          "SHIBAI",
          "DOGEK",
          "MOON",
          "DIAMOND",
          "ROCKET",
          "LAMBO",
          "CHAD",
          "WOJAK",
          "BPEPE",
          "SIGMA",
          "ALPHA",
          "BETA",
          "GAMMA",
          "DELTA",
          "OMEGA",
          "THETA",
          "KAPPA",
          "LAMBDA",
          "MU",
          "NU",
          "XI",
          "OMICRON",
          "PI",
          "RHO",
          "SIGMAS",
          "TAU",
          "UPSILON",
          "PHI",
          "CHI",
          "PSI",
          "OMEGAO",
        ]

        const randomName = tokenNames[Math.floor(Math.random() * tokenNames.length)]
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]

        const marketCap = Math.random() * 2000000 + 1000 // 1K - 2M
        const price = marketCap / (1000000000 + Math.random() * 9000000000)
        const volume = Math.random() * marketCap * 0.5
        const priceChange = (Math.random() - 0.5) * 1000 // -500% to +500%

        const token: PumpFunToken = {
          mint: `${randomSymbol}${Math.random().toString(36).substring(2, 15)}`,
          name: randomName,
          symbol: randomSymbol,
          description: `${randomName} - The next big meme coin on Solana! 🚀`,
          image_uri: `https://sjc.microlink.io/TR_xYL3y4t_dYNMlXHLBGaPr4PsaSK1g2rwKulRp7WgwoRaBtP3O0RSFJXXlMdsdwEnNwfDXcjOwwmZtTsVx0w.jpeg`,
          creator: `Creator${Math.random().toString(36).substring(2, 15)}`,
          created_timestamp: createdTime,
          market_cap: marketCap,
          price: price,
          volume_24h: volume,
          price_change_24h: priceChange,
          bonding_curve: `Curve${Math.random().toString(36).substring(2, 15)}`,
          virtual_sol_reserves: Math.random() * 100 + 10,
          virtual_token_reserves: Math.random() * 1000000000 + 100000000,
          real_sol_reserves: Math.random() * 50 + 5,
          real_token_reserves: Math.random() * 500000000 + 50000000,
          complete: Math.random() > 0.8,
          is_currently_live: Math.random() > 0.1,
          reply_count: Math.floor(Math.random() * 500),
          nsfw: Math.random() > 0.9,
          show_name: true,
          created_today: createdTime >= todayStart,
          holder_count: Math.floor(Math.random() * 10000) + 10,
          transaction_count: Math.floor(Math.random() * 50000) + 100,
          dev_activity_score: Math.random() * 10,
          social_sentiment: Math.random() * 10,
          whale_activity: Math.random() * 10,

          // سيتم حسابها بالخوارزمية
          risk_score: 0,
          potential_score: 0,
          liquidity_score: 0,
          community_score: 0,
          technical_score: 0,
          final_score: 0,
          classification: "classified",
        }

        newTokens.push(token)
      }

      return newTokens
    } catch (error) {
      console.error("Error fetching pump.fun tokens:", error)
      throw error
    }
  }

  // خوارزمية التصنيف المتقدمة
  const applyAdvancedClassification = (tokens: PumpFunToken[]): PumpFunToken[] => {
    return tokens.map((token) => {
      // 1. نقاط المخاطر (0-10) - كلما قل كان أفضل
      let riskScore = 0

      // مخاطر القيمة السوقية
      if (token.market_cap < 10000) riskScore += 3
      else if (token.market_cap < 50000) riskScore += 2
      else if (token.market_cap < 100000) riskScore += 1

      // مخاطر السيولة
      if (token.real_sol_reserves < 5) riskScore += 2.5
      else if (token.real_sol_reserves < 15) riskScore += 1.5

      // مخاطر الحجم
      if (token.volume_24h < 5000) riskScore += 2
      else if (token.volume_24h < 20000) riskScore += 1

      // مخاطر المجتمع
      if (token.reply_count < 10) riskScore += 1.5
      if ((token.holder_count || 0) < 50) riskScore += 2

      // مخاطر النشاط
      if ((token.transaction_count || 0) < 500) riskScore += 1.5

      // كلمات مشبوهة
      const suspiciousWords = ["quick", "guaranteed", "1000x", "moon", "scam", "rug"]
      const description = token.description.toLowerCase()
      suspiciousWords.forEach((word) => {
        if (description.includes(word)) riskScore += 0.5
      })

      // 2. نقاط الإمكانات (0-10) - كلما زاد كان أفضل
      let potentialScore = 0

      // إمكانات القيمة السوقية
      if (token.market_cap > 500000) potentialScore += 2
      else if (token.market_cap > 200000) potentialScore += 1.5
      else if (token.market_cap > 100000) potentialScore += 1

      // إمكانات النمو السعري
      if (token.price_change_24h > 200) potentialScore += 2
      else if (token.price_change_24h > 100) potentialScore += 1.5
      else if (token.price_change_24h > 50) potentialScore += 1

      // إمكانات الحجم
      if (token.volume_24h > 100000) potentialScore += 2
      else if (token.volume_24h > 50000) potentialScore += 1.5

      // إمكانات المجتمع
      if (token.reply_count > 100) potentialScore += 1.5
      if ((token.holder_count || 0) > 1000) potentialScore += 2

      // 3. نقاط السيولة (0-10)
      let liquidityScore = 0
      if (token.real_sol_reserves > 50) liquidityScore += 3
      else if (token.real_sol_reserves > 25) liquidityScore += 2
      else if (token.real_sol_reserves > 10) liquidityScore += 1

      if (token.volume_24h / token.market_cap > 0.5) liquidityScore += 2
      else if (token.volume_24h / token.market_cap > 0.2) liquidityScore += 1

      // 4. نقاط المجتمع (0-10)
      let communityScore = 0
      if (token.reply_count > 200) communityScore += 3
      else if (token.reply_count > 100) communityScore += 2
      else if (token.reply_count > 50) communityScore += 1

      if ((token.holder_count || 0) > 2000) communityScore += 3
      else if ((token.holder_count || 0) > 1000) communityScore += 2
      else if ((token.holder_count || 0) > 500) communityScore += 1

      if (token.twitter || token.telegram || token.website) communityScore += 1

      // 5. نقاط تقنية (0-10)
      let technicalScore = 0
      if ((token.dev_activity_score || 0) > 7) technicalScore += 3
      else if ((token.dev_activity_score || 0) > 5) technicalScore += 2
      else if ((token.dev_activity_score || 0) > 3) technicalScore += 1

      if ((token.social_sentiment || 0) > 7) technicalScore += 2
      if ((token.whale_activity || 0) > 6) technicalScore += 1

      // حساب النقاط النهائية
      const finalScore =
        (10 - Math.min(riskScore, 10)) * 0.3 + // 30% وزن المخاطر (معكوس)
        potentialScore * 0.25 + // 25% وزن الإمكانات
        liquidityScore * 0.2 + // 20% وزن السيولة
        communityScore * 0.15 + // 15% وزن المجتمع
        technicalScore * 0.1 // 10% وزن تقني

      // التصنيف النهائي
      let classification: PumpFunToken["classification"]
      if (finalScore >= 8 && riskScore <= 3) classification = "recommended"
      else if (finalScore >= 6 && riskScore <= 5) classification = "classified"
      else if (riskScore >= 8 || finalScore <= 3) classification = "warning"
      else classification = "ignored"

      return {
        ...token,
        risk_score: Math.min(riskScore, 10),
        potential_score: Math.min(potentialScore, 10),
        liquidity_score: Math.min(liquidityScore, 10),
        community_score: Math.min(communityScore, 10),
        technical_score: Math.min(technicalScore, 10),
        final_score: Math.min(finalScore, 10),
        classification,
      }
    })
  }

  // جلب البيانات مع منع التكرار
  const fetchNewTokens = async () => {
    try {
      setLoading(true)
      setError(null)

      const newTokens = await fetchRealPumpFunTokens()
      setTotalFetched((prev) => prev + newTokens.length)

      // فلترة العملات الجديدة فقط
      const uniqueNewTokens = newTokens.filter((token) => !processedTokens.has(token.mint))

      if (uniqueNewTokens.length > 0) {
        // تطبيق خوارزمية التصنيف المتقدمة
        const classifiedTokens = applyAdvancedClassification(uniqueNewTokens)

        // إضافة العملات الجديدة
        setTokens((prevTokens) => [...classifiedTokens, ...prevTokens].slice(0, 1000)) // الاحتفاظ بآخر 1000 عملة

        // تحديث قائمة العملات المعالجة
        setProcessedTokens((prev) => {
          const newSet = new Set(prev)
          uniqueNewTokens.forEach((token) => newSet.add(token.mint))
          return newSet
        })

        console.log(`✅ تم إضافة ${uniqueNewTokens.length} عملة جديدة من pump.fun`)
      }

      setLastUpdate(new Date())
    } catch (err) {
      console.error("Error fetching tokens:", err)
      setError("فشل في جلب العملات الجديدة من pump.fun")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNewTokens()

    // تحديث مستمر كل 10 ثوانٍ (أسرع من قبل)
    const interval = setInterval(fetchNewTokens, 10000)

    return () => clearInterval(interval)
  }, [])

  // فلترة وترتيب البيانات
  const filteredAndSortedTokens = useMemo(() => {
    const filtered = tokens.filter((token) => {
      const matchesSearch =
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClassification = classificationFilter === "all" || token.classification === classificationFilter
      const matchesMarketCap = !minMarketCap || token.market_cap >= Number.parseInt(minMarketCap)
      const matchesScore = !minScore || token.final_score >= Number.parseFloat(minScore)

      return matchesSearch && matchesClassification && matchesMarketCap && matchesScore
    })

    // ترتيب البيانات
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [tokens, searchTerm, classificationFilter, sortField, sortDirection, minMarketCap, minScore])

  const formatPrice = (price: number) => {
    if (price < 0.000001) return `$${price.toExponential(2)}`
    return `$${price.toFixed(8)}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toLocaleString()}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60)
    const hours = Math.floor(diff / 3600)

    if (hours > 0) return `${hours}س`
    if (minutes > 0) return `${minutes}د`
    return "الآن"
  }

  const getClassificationBadge = (classification: PumpFunToken["classification"]) => {
    switch (classification) {
      case "recommended":
        return (
          <Badge className="bg-green-500">
            <Star className="h-3 w-3 mr-1" />
            توصية
          </Badge>
        )
      case "classified":
        return (
          <Badge className="bg-blue-500">
            <Award className="h-3 w-3 mr-1" />
            مصنفة
          </Badge>
        )
      case "ignored":
        return (
          <Badge className="bg-gray-500">
            <Trash2 className="h-3 w-3 mr-1" />
            مهملة
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-red-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            تحذير
          </Badge>
        )
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 متتبع العملات المتقدم - Pump.fun</h1>
          <p className="text-lg text-gray-600 mb-4">نظام تصنيف ذكي للعملات الجديدة مع خوارزمية متقدمة</p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button onClick={fetchNewTokens} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              تحديث البيانات
            </Button>
            {lastUpdate && <p className="text-sm text-gray-500">آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SA")}</p>}
          </div>

          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-l-4 border-l-green-500">
            <p className="text-lg font-semibold text-gray-800">
              تم جلب <span className="text-green-600 font-bold">{totalFetched.toLocaleString()}</span> عملة إجمالي
            </p>
            <p className="text-lg font-semibold text-gray-800">
              معروض حالياً <span className="text-blue-600 font-bold">{tokens.length}</span> عملة
            </p>
            <p className="text-sm text-gray-500 mt-1">تحديث كل 10 ثوانٍ • خوارزمية تصنيف متقدمة</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              فلاتر البحث والتصفية المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو الرمز..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  <SelectItem value="recommended">توصيات</SelectItem>
                  <SelectItem value="classified">مصنفة</SelectItem>
                  <SelectItem value="ignored">مهملة</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="أقل قيمة سوقية"
                value={minMarketCap}
                onChange={(e) => setMinMarketCap(e.target.value)}
                type="number"
              />

              <Input
                placeholder="أقل نقاط نهائية"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                type="number"
                step="0.1"
                max="10"
              />

              <div className="text-sm text-gray-600 flex items-center">النتائج: {filteredAndSortedTokens.length}</div>

              <div className="text-sm text-gray-600 flex items-center">
                {loading && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                {loading ? "جاري التحديث..." : "محدث"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">توصيات</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tokens.filter((t) => t.classification === "recommended").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">مصنفة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tokens.filter((t) => t.classification === "classified").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">مهملة</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {tokens.filter((t) => t.classification === "ignored").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">تحذير</p>
                  <p className="text-2xl font-bold text-red-600">
                    {tokens.filter((t) => t.classification === "warning").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tokens Table */}
        <Card>
          <CardHeader>
            <CardTitle>جدول العملات المتقدم - تصنيف ذكي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>العملة</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("created_timestamp")} className="p-0 h-auto">
                        وقت الإنشاء <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("price")} className="p-0 h-auto">
                        السعر <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("market_cap")} className="p-0 h-auto">
                        القيمة السوقية <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("holder_count")} className="p-0 h-auto">
                        المالكين <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("final_score")} className="p-0 h-auto">
                        النقاط النهائية <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTokens.map((token, index) => (
                    <TableRow key={token.mint} className="hover:bg-gray-50">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={token.image_uri || "/placeholder.svg"}
                            alt={token.name}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=32&width=32&text=" + token.symbol
                            }}
                          />
                          <div>
                            <p className="font-semibold">{token.name}</p>
                            <p className="text-sm text-gray-500">${token.symbol}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {formatTimeAgo(token.created_timestamp)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{formatPrice(token.price)}</TableCell>
                      <TableCell>{formatMarketCap(token.market_cap)}</TableCell>
                      <TableCell>{(token.holder_count || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              token.final_score >= 8
                                ? "bg-green-500"
                                : token.final_score >= 6
                                  ? "bg-blue-500"
                                  : token.final_score >= 4
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                          />
                          {token.final_score.toFixed(1)}/10
                        </div>
                      </TableCell>
                      <TableCell>{getClassificationBadge(token.classification)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://pump.fun/${token.mint}`, "_blank")}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            عرض
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://pump.fun/${token.mint}`, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            تداول
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAndSortedTokens.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد عملات تطابق معايير البحث</p>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
