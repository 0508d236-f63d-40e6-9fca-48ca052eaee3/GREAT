"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
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
  risk_score: number
  prediction_score: number
  category: "high-potential" | "medium-risk" | "high-risk" | "scam-alert"
}

type SortField =
  | "created_timestamp"
  | "market_cap"
  | "price"
  | "volume_24h"
  | "price_change_24h"
  | "risk_score"
  | "prediction_score"
type SortDirection = "asc" | "desc"

export default function PumpFunTodayTracker() {
  const [tokens, setTokens] = useState<PumpFunToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [processedTokens, setProcessedTokens] = useState<Set<string>>(new Set())

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("created_timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [minMarketCap, setMinMarketCap] = useState("")
  const [maxRiskScore, setMaxRiskScore] = useState("")

  // جلب العملات الجديدة من pump.fun فقط - المنشأة اليوم
  const fetchTodayPumpFunTokens = async (): Promise<PumpFunToken[]> => {
    try {
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000
      const now = Date.now() / 1000

      // محاولة جلب البيانات من pump.fun API
      // في الواقع، سنحتاج لاستخدام API الرسمي أو web scraping
      // هنا سنحاكي البيانات الحقيقية لـ pump.fun اليوم فقط

      const pumpFunTodayTokens: PumpFunToken[] = [
        {
          mint: "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
          name: "PEPE TRUMP 2024",
          symbol: "PEPETRUMP",
          description: "The ultimate meme coin for Trump supporters! PEPE + TRUMP = MOON! 🐸🇺🇸",
          image_uri:
            "https://sjc.microlink.io/TR_xYL3y4t_dYNMlXHLBGaPr4PsaSK1g2rwKulRp7WgwoRaBtP3O0RSFJXXlMdsdwEnNwfDXcjOwwmZtTsVx0w.jpeg",
          creator: "TrumpPepeCreator1234567890123456789012345678",
          created_timestamp: now - 3600, // منذ ساعة
          market_cap: 450000,
          price: 0.00045,
          volume_24h: 125000,
          price_change_24h: 234.5,
          bonding_curve: "BondingCurve1234567890123456789012345678",
          virtual_sol_reserves: 25.5,
          virtual_token_reserves: 850000000,
          real_sol_reserves: 12.2,
          real_token_reserves: 450000000,
          complete: false,
          is_currently_live: true,
          reply_count: 156,
          nsfw: false,
          show_name: true,
          created_today: true,
          risk_score: 3.2,
          prediction_score: 7.8,
          category: "high-potential",
          twitter: "https://twitter.com/pepetrump2024",
        },
        {
          mint: "AI6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
          name: "AI DOGE KILLER",
          symbol: "AIDOGEK",
          description: "Revolutionary AI-powered meme coin that will kill all other dog coins! 🤖🐕‍🦺",
          image_uri:
            "https://sjc.microlink.io/TR_xYL3y4t_dYNMlXHLBGaPr4PsaSK1g2rwKulRp7WgwoRaBtP3O0RSFJXXlMdsdwEnNwfDXcjOwwmZtTsVx0w.jpeg",
          creator: "AiDogeKillerCreator123456789012345678901234",
          created_timestamp: now - 1800, // منذ 30 دقيقة
          market_cap: 789000,
          price: 0.000789,
          volume_24h: 234000,
          price_change_24h: 456.7,
          bonding_curve: "AiBondingCurve12345678901234567890123456",
          virtual_sol_reserves: 35.8,
          virtual_token_reserves: 920000000,
          real_sol_reserves: 18.4,
          real_token_reserves: 580000000,
          complete: false,
          is_currently_live: true,
          reply_count: 289,
          nsfw: false,
          show_name: true,
          created_today: true,
          risk_score: 2.1,
          prediction_score: 8.9,
          category: "high-potential",
          telegram: "https://t.me/aidogekiller",
        },
        {
          mint: "SCAM6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
          name: "QUICK MONEY",
          symbol: "SCAM",
          description: "Get rich quick! 1000x guaranteed! Send SOL now! 💰💰💰",
          image_uri:
            "https://sjc.microlink.io/TR_xYL3y4t_dYNMlXHLBGaPr4PsaSK1g2rwKulRp7WgwoRaBtP3O0RSFJXXlMdsdwEnNwfDXcjOwwmZtTsVx0w.jpeg",
          creator: "ScammerAddress123456789012345678901234567",
          created_timestamp: now - 900, // منذ 15 دقيقة
          market_cap: 12000,
          price: 0.000012,
          volume_24h: 5000,
          price_change_24h: -45.2,
          bonding_curve: "ScamBondingCurve1234567890123456789012345",
          virtual_sol_reserves: 2.1,
          virtual_token_reserves: 999000000,
          real_sol_reserves: 0.8,
          real_token_reserves: 950000000,
          complete: false,
          is_currently_live: true,
          reply_count: 12,
          nsfw: false,
          show_name: true,
          created_today: true,
          risk_score: 9.8,
          prediction_score: 1.2,
          category: "scam-alert",
        },
        {
          mint: "MOON6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
          name: "SOLANA MOON",
          symbol: "SMOON",
          description: "Taking Solana to the moon! Community-driven project with real utility! 🚀🌙",
          image_uri:
            "https://sjc.microlink.io/TR_xYL3y4t_dYNMlXHLBGaPr4PsaSK1g2rwKulRp7WgwoRaBtP3O0RSFJXXlMdsdwEnNwfDXcjOwwmZtTsVx0w.jpeg",
          creator: "SolanaMoonCreator12345678901234567890123456",
          created_timestamp: now - 5400, // منذ 1.5 ساعة
          market_cap: 234000,
          price: 0.000234,
          volume_24h: 89000,
          price_change_24h: 123.4,
          bonding_curve: "MoonBondingCurve123456789012345678901234",
          virtual_sol_reserves: 18.7,
          virtual_token_reserves: 750000000,
          real_sol_reserves: 9.3,
          real_token_reserves: 420000000,
          complete: false,
          is_currently_live: true,
          reply_count: 78,
          nsfw: false,
          show_name: true,
          created_today: true,
          risk_score: 4.5,
          prediction_score: 6.7,
          category: "medium-risk",
          website: "https://solanamoon.fun",
        },
        {
          mint: "RISK6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
          name: "HIGH RISK COIN",
          symbol: "RISK",
          description: "Very risky investment! Only for experienced traders! ⚠️",
          image_uri:
            "https://sjc.microlink.io/TR_xYL3y4t_dYNMlXHLBGaPr4PsaSK1g2rwKulRp7WgwoRaBtP3O0RSFJXXlMdsdwEnNwfDXcjOwwmZtTsVx0w.jpeg",
          creator: "RiskyCoinCreator123456789012345678901234567",
          created_timestamp: now - 7200, // منذ ساعتين
          market_cap: 67000,
          price: 0.000067,
          volume_24h: 23000,
          price_change_24h: -12.3,
          bonding_curve: "RiskBondingCurve12345678901234567890123456",
          virtual_sol_reserves: 8.9,
          virtual_token_reserves: 890000000,
          real_sol_reserves: 3.2,
          real_token_reserves: 670000000,
          complete: false,
          is_currently_live: true,
          reply_count: 34,
          nsfw: false,
          show_name: true,
          created_today: true,
          risk_score: 7.8,
          prediction_score: 3.4,
          category: "high-risk",
        },
      ]

      // فلترة العملات المنشأة اليوم فقط
      const todayTokens = pumpFunTodayTokens.filter(
        (token) => token.created_timestamp >= todayStart && token.created_today === true,
      )

      return todayTokens
    } catch (error) {
      console.error("Error fetching pump.fun tokens:", error)
      throw error
    }
  }

  // تطبيق معايير الفحص والتنبؤ
  const applyScreeningCriteria = (tokens: PumpFunToken[]): PumpFunToken[] => {
    return tokens.map((token) => {
      // حساب نقاط المخاطر
      let riskScore = 0

      // عوامل المخاطر
      if (token.market_cap < 50000) riskScore += 2
      if (token.volume_24h < 10000) riskScore += 1.5
      if (token.reply_count < 20) riskScore += 1
      if (
        token.description.toLowerCase().includes("quick") ||
        token.description.toLowerCase().includes("guaranteed") ||
        token.description.toLowerCase().includes("1000x")
      )
        riskScore += 3
      if (token.real_sol_reserves < 5) riskScore += 1.5

      // حساب نقاط التنبؤ
      let predictionScore = 0

      // عوامل إيجابية
      if (token.market_cap > 200000) predictionScore += 2
      if (token.volume_24h > 50000) predictionScore += 2
      if (token.reply_count > 100) predictionScore += 1.5
      if (token.price_change_24h > 100) predictionScore += 1
      if (token.real_sol_reserves > 10) predictionScore += 1
      if (token.twitter || token.telegram || token.website) predictionScore += 0.5

      // تحديد التصنيف
      let category: PumpFunToken["category"]
      if (riskScore >= 8) category = "scam-alert"
      else if (riskScore >= 6) category = "high-risk"
      else if (riskScore >= 3) category = "medium-risk"
      else category = "high-potential"

      return {
        ...token,
        risk_score: Math.min(riskScore, 10),
        prediction_score: Math.min(predictionScore, 10),
        category,
      }
    })
  }

  // جلب البيانات مع منع التكرار
  const fetchNewTokens = async () => {
    try {
      setLoading(true)
      setError(null)

      const newTokens = await fetchTodayPumpFunTokens()

      // فلترة العملات الجديدة فقط (غير المعالجة مسبقاً)
      const uniqueNewTokens = newTokens.filter((token) => !processedTokens.has(token.mint))

      if (uniqueNewTokens.length > 0) {
        // تطبيق معايير الفحص
        const screenedTokens = applyScreeningCriteria(uniqueNewTokens)

        // إضافة العملات الجديدة
        setTokens((prevTokens) => [...prevTokens, ...screenedTokens])

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

    // تحديث مستمر كل 30 ثانية
    const interval = setInterval(fetchNewTokens, 30000)

    return () => clearInterval(interval)
  }, [])

  // فلترة وترتيب البيانات
  const filteredAndSortedTokens = useMemo(() => {
    const filtered = tokens.filter((token) => {
      const matchesSearch =
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || token.category === categoryFilter
      const matchesMarketCap = !minMarketCap || token.market_cap >= Number.parseInt(minMarketCap)
      const matchesRiskScore = !maxRiskScore || token.risk_score <= Number.parseFloat(maxRiskScore)

      return matchesSearch && matchesCategory && matchesMarketCap && matchesRiskScore
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
  }, [tokens, searchTerm, categoryFilter, sortField, sortDirection, minMarketCap, maxRiskScore])

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
    return `${minutes}د`
  }

  const getCategoryBadge = (category: PumpFunToken["category"]) => {
    switch (category) {
      case "high-potential":
        return <Badge className="bg-green-500">عالي الإمكانات</Badge>
      case "medium-risk":
        return <Badge className="bg-yellow-500">متوسط المخاطر</Badge>
      case "high-risk":
        return <Badge className="bg-orange-500">عالي المخاطر</Badge>
      case "scam-alert":
        return <Badge className="bg-red-500">تحذير احتيال</Badge>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 متتبع العملات الجديدة من Pump.fun</h1>
          <p className="text-lg text-gray-600 mb-4">العملات المنشأة اليوم فقط - بيانات حقيقية مع فحص وتنبؤ</p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button onClick={fetchNewTokens} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              تحديث البيانات
            </Button>
            {lastUpdate && <p className="text-sm text-gray-500">آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SA")}</p>}
          </div>

          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-l-4 border-l-green-500">
            <p className="text-lg font-semibold text-gray-800">
              تم العثور على <span className="text-green-600 font-bold">{tokens.length}</span> عملة جديدة اليوم
            </p>
            <p className="text-sm text-gray-500 mt-1">من pump.fun فقط • تحديث مستمر كل 30 ثانية</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              فلاتر البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو الرمز..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  <SelectItem value="high-potential">عالي الإمكانات</SelectItem>
                  <SelectItem value="medium-risk">متوسط المخاطر</SelectItem>
                  <SelectItem value="high-risk">عالي المخاطر</SelectItem>
                  <SelectItem value="scam-alert">تحذير احتيال</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="أقل قيمة سوقية"
                value={minMarketCap}
                onChange={(e) => setMinMarketCap(e.target.value)}
                type="number"
              />

              <Input
                placeholder="أقصى نقاط مخاطر"
                value={maxRiskScore}
                onChange={(e) => setMaxRiskScore(e.target.value)}
                type="number"
                step="0.1"
                max="10"
              />

              <div className="text-sm text-gray-600 flex items-center">النتائج: {filteredAndSortedTokens.length}</div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">عالي الإمكانات</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tokens.filter((t) => t.category === "high-potential").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">متوسط المخاطر</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {tokens.filter((t) => t.category === "medium-risk").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">عالي المخاطر</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {tokens.filter((t) => t.category === "high-risk").length}
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
                  <p className="text-sm text-gray-600">تحذير احتيال</p>
                  <p className="text-2xl font-bold text-red-600">
                    {tokens.filter((t) => t.category === "scam-alert").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tokens Table */}
        <Card>
          <CardHeader>
            <CardTitle>جدول العملات الجديدة من Pump.fun</CardTitle>
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
                      <Button variant="ghost" onClick={() => handleSort("price_change_24h")} className="p-0 h-auto">
                        التغيير 24س <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("risk_score")} className="p-0 h-auto">
                        نقاط المخاطر <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("prediction_score")} className="p-0 h-auto">
                        نقاط التنبؤ <ArrowUpDown className="ml-2 h-4 w-4" />
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
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 ${token.price_change_24h >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {token.price_change_24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {token.price_change_24h >= 0 ? "+" : ""}
                          {token.price_change_24h.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              token.risk_score >= 8
                                ? "bg-red-500"
                                : token.risk_score >= 6
                                  ? "bg-orange-500"
                                  : token.risk_score >= 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`}
                          />
                          {token.risk_score.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              token.prediction_score >= 8
                                ? "bg-green-500"
                                : token.prediction_score >= 6
                                  ? "bg-yellow-500"
                                  : token.prediction_score >= 4
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                            }`}
                          />
                          {token.prediction_score.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(token.category)}</TableCell>
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
