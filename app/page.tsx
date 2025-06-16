// تحديث الصفحة الرئيسية مع معلومات مفصلة عن المصادر

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
  ArrowUpDown,
  Eye,
  AlertTriangle,
  Clock,
  Star,
  Trash2,
  Award,
  Brain,
  Zap,
  Users,
  DollarSign,
  CheckCircle,
  Settings,
  Database,
  Activity,
} from "lucide-react"

interface AdvancedTokenAnalysis {
  mint: string
  name: string
  symbol: string
  description: string
  image_uri: string
  creator: string
  created_timestamp: number
  market_cap: number
  usd_market_cap: number
  virtual_sol_reserves: number
  virtual_token_reserves: number
  complete: boolean
  is_currently_live: boolean
  reply_count: number
  holder_count: number
  transaction_count: number

  // خوارزمية GREAT IDEA
  uniqueness_score: number
  creator_history_score: number
  creator_wallet_balance: number
  social_sentiment_score: number
  celebrity_influence_score: number
  purchase_velocity_score: number
  ai_prediction_score: number
  ml_learning_adjustment: number
  final_percentage: number
  classification: "recommended" | "classified" | "ignored"
  confidence_level: number
  predicted_price_target: number
  predicted_timeframe: string
  accuracy_score: number
  liquidity_score: number
  risk_factors: string[]

  // مصدر البيانات
  _dataSource?: string
  _isVerified?: boolean
}

type SortField =
  | "created_timestamp"
  | "usd_market_cap"
  | "final_percentage"
  | "purchase_velocity_score"
  | "ai_prediction_score"
type SortDirection = "asc" | "desc"

export default function GreatIdeaEnhancedTracker() {
  const [tokens, setTokens] = useState<AdvancedTokenAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [fetchResult, setFetchResult] = useState<any>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [dataStatus, setDataStatus] = useState<any>(null)

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [classificationFilter, setClassificationFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("final_percentage")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [minPercentage, setMinPercentage] = useState("")

  const fetchEnhancedData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching enhanced multi-source data...")

      const response = await fetch("/api/tokens?limit=50", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch tokens")
      }

      setTokens(data.data || [])
      setFetchResult(data.fetchResult || null)
      setStatistics(data.statistics || null)
      setDataStatus(data.status || null)
      setLastUpdate(new Date())

      // تحديد نوع الرسالة
      if (data.warning) {
        setError(data.warning)
      } else if (data.statistics?.dataQuality === "enhanced-simulation") {
        setError("⚠️ استخدام بيانات محاكاة محسنة - المصادر الحقيقية غير متاحة")
      } else {
        setError(null)
      }

      console.log(`✅ Loaded ${data.total || 0} tokens`)
      console.log("📊 Fetch Result:", data.fetchResult)
      console.log("📈 Statistics:", data.statistics)
    } catch (err) {
      console.error("❌ Error fetching enhanced data:", err)
      setError(err instanceof Error ? err.message : "فشل في جلب البيانات المحسنة")
    } finally {
      setLoading(false)
    }
  }

  const testDataSources = async () => {
    try {
      setLoading(true)
      console.log("🧪 Testing all data sources...")

      const response = await fetch("/api/tokens?test=true", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success && data.sourceStatus) {
        const status = data.sourceStatus
        const message = `📊 نتائج اختبار المصادر:
        
✅ مصادر تعمل: ${status.workingSources}/${status.totalSources}
📡 المصادر النشطة: ${status.workingSources_names.join(", ") || "لا يوجد"}
❌ مصادر معطلة: ${status.failedSources.length}

${status.failedSources.length > 0 ? "المصادر المعطلة:\n" + status.failedSources.join("\n") : ""}`

        alert(message)
      }
    } catch (err) {
      console.error("❌ Error testing sources:", err)
      alert("فشل في اختبار المصادر")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnhancedData()
    const interval = setInterval(fetchEnhancedData, 180000) // كل 3 دقائق
    return () => clearInterval(interval)
  }, [])

  // باقي الكود يبقى كما هو مع إضافات للمصادر...
  const filteredAndSortedTokens = useMemo(() => {
    const filtered = tokens.filter((token) => {
      const matchesSearch =
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClassification = classificationFilter === "all" || token.classification === classificationFilter
      const matchesPercentage = !minPercentage || token.final_percentage >= Number.parseFloat(minPercentage)

      return matchesSearch && matchesClassification && matchesPercentage
    })

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
  }, [tokens, searchTerm, classificationFilter, sortField, sortDirection, minPercentage])

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

  const getClassificationBadge = (classification: AdvancedTokenAnalysis["classification"], percentage: number) => {
    switch (classification) {
      case "recommended":
        return (
          <Badge className="bg-green-500">
            <Star className="h-3 w-3 mr-1" />
            توصية ({percentage.toFixed(1)}%)
          </Badge>
        )
      case "classified":
        return (
          <Badge className="bg-blue-500">
            <Award className="h-3 w-3 mr-1" />
            مصنفة ({percentage.toFixed(1)}%)
          </Badge>
        )
      case "ignored":
        return (
          <Badge className="bg-gray-500">
            <Trash2 className="h-3 w-3 mr-1" />
            مهملة ({percentage.toFixed(1)}%)
          </Badge>
        )
    }
  }

  const getDataSourceBadge = (token: AdvancedTokenAnalysis) => {
    if (token._isVerified) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          حقيقي
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
          <Activity className="h-3 w-3 mr-1" />
          محسن
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.svg" alt="GREAT IDEA" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GREAT IDEA</h1>
          <p className="text-lg text-gray-600 mb-4">نظام ذكي متقدم متعدد المصادر لتحليل العملات المشفرة</p>

          {/* Enhanced Data Status */}
          {fetchResult && (
            <Card className={`mb-6 border-l-4 ${fetchResult.isReal ? "border-l-green-500" : "border-l-orange-500"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {fetchResult.isReal ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-700">بيانات حقيقية من مصادر متعددة</span>
                      </>
                    ) : (
                      <>
                        <Activity className="h-5 w-5 text-orange-600" />
                        <span className="font-semibold text-orange-700">بيانات محاكاة محسنة</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    المصادر: {fetchResult.source} | المحاولات: {fetchResult.totalAttempts}
                  </div>
                </div>
                {fetchResult.successfulSources && fetchResult.successfulSources.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    المصادر النشطة: {fetchResult.successfulSources.join(", ")}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Statistics */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        <span className="text-green-600 font-bold">{statistics.realTokens}</span> حقيقية
                      </p>
                      <p className="text-sm text-gray-500">من مصادر خارجية</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        <span className="text-orange-600 font-bold">{statistics.simulatedTokens}</span> محسنة
                      </p>
                      <p className="text-sm text-gray-500">بيانات واقعية</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        <span className="text-blue-600 font-bold">{statistics.sourcesUsed}</span> مصادر
                      </p>
                      <p className="text-sm text-gray-500">من {statistics.totalSourcesAttempted} محاولة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        <span className="text-purple-600 font-bold">87.3%</span> دقة AI
                      </p>
                      <p className="text-sm text-gray-500">خوارزمية متقدمة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button onClick={fetchEnhancedData} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "جاري البحث في المصادر..." : "تحديث البيانات"}
            </Button>
            <Button onClick={testDataSources} disabled={loading} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              اختبار المصادر
            </Button>
            {lastUpdate && <p className="text-sm text-gray-500">آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SA")}</p>}
          </div>
        </div>

        {/* Error/Warning Display */}
        {error && (
          <Card className="mb-6 border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-yellow-800 font-semibold">معلومات مهمة</p>
                  <p className="text-yellow-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              فلاتر التحليل المتقدم
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

              <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  <SelectItem value="recommended">توصيات (70-100%)</SelectItem>
                  <SelectItem value="classified">مصنفة (50-70%)</SelectItem>
                  <SelectItem value="ignored">مهملة (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="أقل نسبة تقييم %"
                value={minPercentage}
                onChange={(e) => setMinPercentage(e.target.value)}
                type="number"
                step="0.1"
                max="100"
              />

              <div className="text-sm text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                النتائج: {filteredAndSortedTokens.length}
              </div>

              <div className="text-sm text-gray-600 flex items-center">
                {loading && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                {loading ? "جاري التحليل..." : "محدث"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">توصيات (70-100%)</p>
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
                  <p className="text-sm text-gray-600">مصنفة (50-70%)</p>
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
                  <p className="text-sm text-gray-600">مهملة (&lt;50%)</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {tokens.filter((t) => t.classification === "ignored").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              تحليل GREAT IDEA المتقدم - متعدد المصادر
              {statistics && (
                <Badge className={statistics.dataQuality === "real" ? "bg-green-500" : "bg-orange-500"}>
                  {statistics.dataQuality === "real" ? "بيانات حقيقية" : "بيانات محسنة"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tokens.length === 0 && !loading ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">لا توجد بيانات متاحة من أي مصدر</p>
                <p className="text-gray-400 text-sm mb-4">جميع المصادر غير متاحة حالياً</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={fetchEnhancedData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    إعادة المحاولة
                  </Button>
                  <Button onClick={testDataSources} variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    اختبار المصادر
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>العملة</TableHead>
                      <TableHead>مصدر البيانات</TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort("created_timestamp")} className="p-0 h-auto">
                          الوقت <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort("usd_market_cap")} className="p-0 h-auto">
                          القيمة السوقية <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>المالكين</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("purchase_velocity_score")}
                          className="p-0 h-auto"
                        >
                          سرعة الشراء <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("ai_prediction_score")}
                          className="p-0 h-auto"
                        >
                          تنبؤ AI <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort("final_percentage")} className="p-0 h-auto">
                          التقييم النهائي <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>التصنيف</TableHead>
                      <TableHead>المخاطر</TableHead>
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
                        <TableCell>{getDataSourceBadge(token)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {formatTimeAgo(token.created_timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            {formatMarketCap(token.usd_market_cap)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-500" />
                            {token.holder_count.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            {token.purchase_velocity_score.toFixed(1)}/10
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Brain className="h-3 w-3 text-purple-500" />
                            {token.ai_prediction_score.toFixed(1)}/10
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                token.final_percentage >= 70
                                  ? "bg-green-500"
                                  : token.final_percentage >= 50
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                              }`}
                            />
                            <span className="font-bold">{token.final_percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getClassificationBadge(token.classification, token.final_percentage)}</TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {token.risk_factors.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="truncate max-w-24">{token.risk_factors[0]}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">لا مخاطر</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
