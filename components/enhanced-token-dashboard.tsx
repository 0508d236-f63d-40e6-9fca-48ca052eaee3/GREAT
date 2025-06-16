"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  TrendingUp,
  TrendingDown,
  Shield,
  Globe,
  Clock,
  CheckCircle,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Award,
  Target,
  Activity,
} from "lucide-react"
import { premiumTokenService, type PremiumTokenInfo } from "@/lib/premium-token-service"

export default function EnhancedTokenDashboard() {
  const [tokens, setTokens] = useState<PremiumTokenInfo[]>([])
  const [filteredTokens, setFilteredTokens] = useState<PremiumTokenInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("qualityScore")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterBy, setFilterBy] = useState<string>("all")
  const [selectedTab, setSelectedTab] = useState("all")
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // تهيئة الخدمة وجلب البيانات
  useEffect(() => {
    const initializeService = async () => {
      setIsLoading(true)
      try {
        await premiumTokenService.initialize()
        const initialTokens = await premiumTokenService.getTokens()
        setTokens(initialTokens)
        setFilteredTokens(initialTokens)

        const status = premiumTokenService.getStatus()
        setServiceStatus(status)
        setLastUpdate(new Date())
      } catch (error) {
        console.error("فشل تهيئة الخدمة:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeService()

    // إضافة مستمع للتحديثات
    const handleTokenUpdate = (updatedTokens: PremiumTokenInfo[]) => {
      setTokens(updatedTokens)
      setLastUpdate(new Date())
    }

    premiumTokenService.addListener(handleTokenUpdate)

    // تحديث حالة الخدمة كل 30 ثانية
    const statusInterval = setInterval(() => {
      const status = premiumTokenService.getStatus()
      setServiceStatus(status)
    }, 30000)

    return () => {
      premiumTokenService.removeListener(handleTokenUpdate)
      clearInterval(statusInterval)
    }
  }, [])

  // فلترة وترتيب العملات
  useEffect(() => {
    let filtered = [...tokens]

    // البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (token) =>
          token.name.toLowerCase().includes(query) ||
          token.symbol.toLowerCase().includes(query) ||
          token.description.toLowerCase().includes(query),
      )
    }

    // الفلترة حسب النوع
    if (filterBy !== "all") {
      switch (filterBy) {
        case "recommended":
          filtered = filtered.filter((token) => token.recommendation === "Recommended")
          break
        case "new":
          filtered = filtered.filter((token) => token.isNew)
          break
        case "high-quality":
          filtered = filtered.filter((token) => token.dataQualityScore >= 90)
          break
        case "safe":
          filtered = filtered.filter((token) => token.safetyRating === "High")
          break
        case "verified":
          filtered = filtered.filter((token) => token.verified)
          break
        case "trending":
          filtered = filtered.filter((token) => token.priceChange24h > 20 && token.volume24h > 1000)
          break
      }
    }

    // الترتيب
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "qualityScore":
          aValue = a.dataQualityScore
          bValue = b.dataQualityScore
          break
        case "trustScore":
          aValue = a.trustScore
          bValue = b.trustScore
          break
        case "potentialScore":
          aValue = a.potentialScore
          bValue = b.potentialScore
          break
        case "marketCap":
          aValue = a.marketCap
          bValue = b.marketCap
          break
        case "volume":
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case "priceChange":
          aValue = a.priceChange24h
          bValue = b.priceChange24h
          break
        case "age":
          aValue = a.ageInMinutes
          bValue = b.ageInMinutes
          break
        case "holders":
          aValue = a.holders
          bValue = b.holders
          break
        default:
          aValue = a.dataQualityScore
          bValue = b.dataQualityScore
      }

      if (sortOrder === "asc") {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    setFilteredTokens(filtered)
  }, [tokens, searchQuery, sortBy, sortOrder, filterBy])

  // إحصائيات محسوبة
  const stats = useMemo(() => {
    const recommended = tokens.filter((t) => t.recommendation === "Recommended").length
    const newTokens = tokens.filter((t) => t.isNew).length
    const highQuality = tokens.filter((t) => t.dataQualityScore >= 90).length
    const avgQuality = tokens.length > 0 ? tokens.reduce((sum, t) => sum + t.dataQualityScore, 0) / tokens.length : 0
    const avgTrust = tokens.length > 0 ? tokens.reduce((sum, t) => sum + t.trustScore, 0) / tokens.length : 0
    const avgPotential = tokens.length > 0 ? tokens.reduce((sum, t) => sum + t.potentialScore, 0) / tokens.length : 0

    return {
      total: tokens.length,
      recommended,
      newTokens,
      highQuality,
      avgQuality: Math.round(avgQuality),
      avgTrust: Math.round(avgTrust),
      avgPotential: Math.round(avgPotential),
    }
  }, [tokens])

  // تحديث يدوي
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await premiumTokenService.restart()
      const updatedTokens = await premiumTokenService.getTokens()
      setTokens(updatedTokens)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("فشل التحديث:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // تنسيق الأرقام
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  // تنسيق السعر
  const formatPrice = (price: number): string => {
    if (price < 0.001) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  // تنسيق النسبة المئوية
  const formatPercentage = (percentage: number): string => {
    const sign = percentage >= 0 ? "+" : ""
    return `${sign}${percentage.toFixed(1)}%`
  }

  // لون النسبة المئوية
  const getPercentageColor = (percentage: number): string => {
    if (percentage > 0) return "text-green-600"
    if (percentage < 0) return "text-red-600"
    return "text-gray-600"
  }

  // لون تصنيف الأمان
  const getSafetyColor = (rating: string): string => {
    switch (rating) {
      case "High":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // لون درجة الاستثمار
  const getGradeColor = (grade: string): string => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-800"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  if (isLoading && tokens.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg font-medium text-gray-700">جاري تحميل العملات المتميزة...</p>
              <p className="text-sm text-gray-500 mt-2">يتم جلب البيانات من مصادر متعددة</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 لوحة العملات المتميزة</h1>
          <p className="text-lg text-gray-600">
            تتبع العملات الرقمية الجديدة مع بيانات محسنة من مصادر متعددة وتحليل متقدم
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SA")}
            </div>
            {serviceStatus && (
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                {serviceStatus.activeSources} مصادر نشطة
              </div>
            )}
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">إجمالي العملات</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.recommended}</div>
              <div className="text-sm text-gray-600">موصى بها</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.newTokens}</div>
              <div className="text-sm text-gray-600">جديدة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.highQuality}</div>
              <div className="text-sm text-gray-600">عالية الجودة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.avgQuality}%</div>
              <div className="text-sm text-gray-600">متوسط الجودة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.avgTrust}%</div>
              <div className="text-sm text-gray-600">متوسط الثقة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.avgPotential}%</div>
              <div className="text-sm text-gray-600">متوسط الإمكانات</div>
            </CardContent>
          </Card>
        </div>

        {/* أدوات التحكم */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في العملات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="فلترة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العملات</SelectItem>
                    <SelectItem value="recommended">موصى بها</SelectItem>
                    <SelectItem value="new">جديدة</SelectItem>
                    <SelectItem value="high-quality">عالية الجودة</SelectItem>
                    <SelectItem value="safe">آمنة</SelectItem>
                    <SelectItem value="verified">موثقة</SelectItem>
                    <SelectItem value="trending">رائجة</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    {sortOrder === "desc" ? (
                      <SortDesc className="h-4 w-4 mr-2" />
                    ) : (
                      <SortAsc className="h-4 w-4 mr-2" />
                    )}
                    <SelectValue placeholder="ترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualityScore">نقاط الجودة</SelectItem>
                    <SelectItem value="trustScore">نقاط الثقة</SelectItem>
                    <SelectItem value="potentialScore">نقاط الإمكانات</SelectItem>
                    <SelectItem value="marketCap">القيمة السوقية</SelectItem>
                    <SelectItem value="volume">حجم التداول</SelectItem>
                    <SelectItem value="priceChange">تغير السعر</SelectItem>
                    <SelectItem value="age">العمر</SelectItem>
                    <SelectItem value="holders">عدد الحاملين</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                </Button>
              </div>

              <Button onClick={handleRefresh} disabled={isLoading} className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                تحديث
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* قائمة العملات */}
        <div className="grid gap-4">
          {filteredTokens.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملات</h3>
                <p className="text-gray-600">لم يتم العثور على عملات تطابق معايير البحث والفلترة</p>
              </CardContent>
            </Card>
          ) : (
            filteredTokens.map((token) => (
              <Card key={token.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* معلومات العملة الأساسية */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{token.logo}</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{token.name}</h3>
                            <p className="text-sm text-gray-600">{token.symbol}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={token.recommendation === "Recommended" ? "default" : "secondary"}
                            className={
                              token.recommendation === "Recommended"
                                ? "bg-green-100 text-green-800"
                                : token.recommendation === "Classified"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {token.recommendation === "Recommended"
                              ? "موصى بها"
                              : token.recommendation === "Classified"
                                ? "مصنفة"
                                : "مهملة"}
                          </Badge>
                          {token.isNew && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                              جديدة
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{token.description}</p>

                      {/* معلومات السعر والسوق */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">السعر</div>
                          <div className="font-semibold">{formatPrice(token.price)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">القيمة السوقية</div>
                          <div className="font-semibold">{formatNumber(token.marketCap)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">حجم التداول 24س</div>
                          <div className="font-semibold">{formatNumber(token.volume24h)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">عدد الحاملين</div>
                          <div className="font-semibold">{formatNumber(token.holders)}</div>
                        </div>
                      </div>

                      {/* تغيرات السعر */}
                      <div className="flex gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">24س:</span>
                          <span className={`text-sm font-medium ${getPercentageColor(token.priceChange24h)}`}>
                            {token.priceChange24h > 0 ? (
                              <TrendingUp className="h-3 w-3 inline" />
                            ) : (
                              <TrendingDown className="h-3 w-3 inline" />
                            )}
                            {formatPercentage(token.priceChange24h)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">1س:</span>
                          <span className={`text-sm font-medium ${getPercentageColor(token.priceChange1h)}`}>
                            {token.priceChange1h > 0 ? (
                              <TrendingUp className="h-3 w-3 inline" />
                            ) : (
                              <TrendingDown className="h-3 w-3 inline" />
                            )}
                            {formatPercentage(token.priceChange1h)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">5د:</span>
                          <span className={`text-sm font-medium ${getPercentageColor(token.priceChange5m)}`}>
                            {token.priceChange5m > 0 ? (
                              <TrendingUp className="h-3 w-3 inline" />
                            ) : (
                              <TrendingDown className="h-3 w-3 inline" />
                            )}
                            {formatPercentage(token.priceChange5m)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* النقاط والتقييمات */}
                    <div className="lg:w-80 space-y-4">
                      {/* نقاط الجودة */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">جودة البيانات</span>
                            <span className="text-sm font-bold text-blue-600">{token.dataQualityScore}%</span>
                          </div>
                          <Progress value={token.dataQualityScore} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">نقاط الثقة</span>
                            <span className="text-sm font-bold text-green-600">{token.trustScore}%</span>
                          </div>
                          <Progress value={token.trustScore} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">نقاط الإمكانات</span>
                            <span className="text-sm font-bold text-purple-600">{token.potentialScore}%</span>
                          </div>
                          <Progress value={token.potentialScore} className="h-2" />
                        </div>
                      </div>

                      <Separator />

                      {/* التصنيفات */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">تصنيف الأمان:</span>
                          <Badge className={getSafetyColor(token.safetyRating)}>
                            <Shield className="h-3 w-3 mr-1" />
                            {token.safetyRating === "High"
                              ? "عالي"
                              : token.safetyRating === "Medium"
                                ? "متوسط"
                                : "منخفض"}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">درجة الاستثمار:</span>
                          <Badge className={getGradeColor(token.investmentGrade)}>
                            <Award className="h-3 w-3 mr-1" />
                            {token.investmentGrade}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">العمر:</span>
                          <span className="text-sm font-medium">
                            {token.ageInMinutes < 60
                              ? `${Math.round(token.ageInMinutes)} دقيقة`
                              : `${Math.round(token.ageInMinutes / 60)} ساعة`}
                          </span>
                        </div>

                        {token.verified && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">الحالة:</span>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              موثق
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* معلومات إضافية */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">السيولة:</span>
                          <div className="font-medium">{formatNumber(token.liquidity)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">المعاملات 24س:</span>
                          <div className="font-medium">{formatNumber(token.transactions24h)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">المحافظ الفريدة:</span>
                          <div className="font-medium">{formatNumber(token.uniqueWallets24h)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">المشاعر:</span>
                          <div className="font-medium">{Math.round(token.socialSentiment)}%</div>
                        </div>
                      </div>

                      {/* مصادر البيانات */}
                      <div>
                        <div className="text-xs text-gray-500 mb-1">مصادر البيانات:</div>
                        <div className="flex flex-wrap gap-1">
                          {token.dataSources.map((source, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(token.pumpFunUrl, "_blank")}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          عرض
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Target className="h-3 w-3 mr-1" />
                          تتبع
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* حالة الخدمة */}
        {serviceStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                حالة الخدمة المتميزة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">حالة الاتصال</div>
                  <div className={`font-medium ${serviceStatus.isConnected ? "text-green-600" : "text-red-600"}`}>
                    {serviceStatus.isConnected ? "متصل" : "غير متصل"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">المصادر النشطة</div>
                  <div className="font-medium">{serviceStatus.enhancedServiceStatus?.activeSources || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">متوسط جودة البيانات</div>
                  <div className="font-medium">{serviceStatus.averageQualityScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">آخر تحديث</div>
                  <div className="font-medium">
                    {serviceStatus.lastUpdate
                      ? new Date(serviceStatus.lastUpdate).toLocaleTimeString("ar-SA")
                      : "غير محدد"}
                  </div>
                </div>
              </div>

              {serviceStatus.enhancedServiceStatus?.sourcesStatus && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">حالة المصادر:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {serviceStatus.enhancedServiceStatus.sourcesStatus.map((source: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium">{source.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{source.avgResponseTime}ms</span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              source.isActive && source.failureCount < 3 ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
