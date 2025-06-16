"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { stableCryptoService, type CryptoToken } from "@/lib/stable-crypto-service"
import { TrendingUp, TrendingDown, Search, RefreshCw, DollarSign, BarChart3 } from "lucide-react"

export default function StableCryptoDashboard() {
  const [tokens, setTokens] = useState<CryptoToken[]>([])
  const [stats, setStats] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // تحديث البيانات
  const updateData = async () => {
    setIsLoading(true)
    try {
      // محاكاة تأخير API
      await new Promise((resolve) => setTimeout(resolve, 500))

      const eligibleTokens = stableCryptoService.getEligibleTokens()
      const currentStats = stableCryptoService.getStats()

      setTokens(eligibleTokens)
      setStats(currentStats)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("خطأ في تحديث البيانات:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // تحديث تلقائي
  useEffect(() => {
    updateData()

    const interval = setInterval(updateData, 30000) // كل 30 ثانية

    return () => clearInterval(interval)
  }, [])

  // فلترة العملات حسب البحث
  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // تنسيق الأرقام
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(2)
  }

  // تنسيق الوقت
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return `${diff} دقيقة مضت`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان والتحكم */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white mb-2">🚀 نظام تحليل العملات المستقر</h1>
          <p className="text-gray-300 text-lg">تحليل فوري للعملات الجديدة على شبكة Solana</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث عن عملة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <Button onClick={updateData} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">إجمالي العملات</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTokens || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">العملات المؤهلة</p>
                  <p className="text-2xl font-bold text-green-400">{stats.eligibleTokens || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">متوسط القيمة السوقية</p>
                  <p className="text-2xl font-bold text-yellow-400">${formatNumber(stats.averageMarketCap || 0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">إجمالي الحجم</p>
                  <p className="text-2xl font-bold text-purple-400">${formatNumber(stats.totalVolume || 0)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* آخر تحديث */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SA")}</p>
        </div>

        {/* قائمة العملات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <Card
                key={token.id}
                className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">{token.name}</CardTitle>
                      <p className="text-gray-300 text-sm">{token.symbol}</p>
                    </div>
                    <Badge
                      variant={token.isEligible ? "default" : "secondary"}
                      className={token.isEligible ? "bg-green-600" : "bg-gray-600"}
                    >
                      {token.isEligible ? "مؤهل" : "غير مؤهل"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">السعر</p>
                      <p className="text-white font-semibold">${token.price.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">القيمة السوقية</p>
                      <p className="text-white font-semibold">${formatNumber(token.marketCap)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">الحجم 24س</p>
                      <p className="text-white font-semibold">${formatNumber(token.volume24h)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">التغيير 24س</p>
                      <div className="flex items-center">
                        {token.priceChange24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                        )}
                        <p className={`font-semibold ${token.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {token.priceChange24h.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">تم الإنشاء:</span>
                      <span className="text-white">{formatTime(token.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-400">نقاط المخاطرة:</span>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        {token.riskScore.toFixed(1)}/10
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد عملات مؤهلة حالياً"}
              </p>
            </div>
          )}
        </div>

        {/* معلومات إضافية */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-white text-lg font-semibold mb-3">معايير التأهيل:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                القيمة السوقية ≤ $15,000
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                تم إنشاؤها خلال آخر 20 دقيقة
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                تحديث تلقائي كل 30 ثانية
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
