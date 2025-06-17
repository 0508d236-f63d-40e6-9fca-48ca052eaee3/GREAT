// مكون واجهة المستخدم للنظام فائق السرعة
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Zap,
  Rocket,
  Target,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Play,
  Square,
  BarChart3,
  Timer,
  CheckCircle,
  Gauge,
} from "lucide-react"

interface UltraFastToken {
  mint: string
  name?: string
  symbol?: string
  creator: string
  timestamp: number
  detectionLatency: number
  final_percentage?: number
  classification?: "recommended" | "classified" | "ignored"
  _detectionSpeed: "instant" | "fast" | "normal"
  _isUltraFast: boolean
}

interface PerformanceStats {
  totalTokens: number
  tokensPerMinute: number
  instantDetections: number
  fastDetections: number
  averageDetectionLatency: number
  isTargetAchieved: boolean
}

export default function UltraFastMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [tokens, setTokens] = useState<UltraFastToken[]>([])
  const [performance, setPerformance] = useState<PerformanceStats | null>(null)
  const [apiKeys, setApiKeys] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // جلب البيانات
  const fetchData = async () => {
    try {
      const [tokensResponse, performanceResponse] = await Promise.all([
        fetch("/api/ultra-fast?action=tokens"),
        fetch("/api/ultra-fast?action=performance"),
      ])

      const tokensData = await tokensResponse.json()
      const performanceData = await performanceResponse.json()

      if (tokensData.success) {
        setTokens(tokensData.data || [])
      }

      if (performanceData.success) {
        setPerformance(performanceData.performance)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching ultra-fast data:", error)
    }
  }

  // بدء المراقبة فائقة السرعة
  const startUltraFastMonitoring = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ultra-fast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          apiKeys: apiKeys
            .split(",")
            .map((key) => key.trim())
            .filter((key) => key),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsMonitoring(true)
        console.log("✅ Ultra-fast monitoring started - Target: 1000+ tokens/minute")
      } else {
        setError(data.message || "فشل في بدء المراقبة فائقة السرعة")
      }
    } catch (error) {
      setError("خطأ في الاتصال")
      console.error("Error starting ultra-fast monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // إيقاف المراقبة
  const stopUltraFastMonitoring = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ultra-fast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "stop",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsMonitoring(false)
        console.log("🛑 Ultra-fast monitoring stopped")
      } else {
        setError(data.message || "فشل في إيقاف المراقبة")
      }
    } catch (error) {
      setError("خطأ في الاتصال")
      console.error("Error stopping ultra-fast monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // تحديث دوري
  useEffect(() => {
    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 2000) // كل ثانيتين للحصول على بيانات فورية

    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) return `${minutes}د`
    return `${seconds}ث`
  }

  const getSpeedBadge = (speed: "instant" | "fast" | "normal") => {
    switch (speed) {
      case "instant":
        return (
          <Badge className="bg-green-500">
            <Zap className="h-3 w-3 mr-1" />
            فوري
          </Badge>
        )
      case "fast":
        return (
          <Badge className="bg-blue-500">
            <Rocket className="h-3 w-3 mr-1" />
            سريع
          </Badge>
        )
      case "normal":
        return (
          <Badge className="bg-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            عادي
          </Badge>
        )
    }
  }

  const getClassificationBadge = (classification?: string, percentage?: number) => {
    switch (classification) {
      case "recommended":
        return <Badge className="bg-green-500">🌟 توصية ({percentage?.toFixed(1)}%)</Badge>
      case "classified":
        return <Badge className="bg-blue-500">📊 مصنفة ({percentage?.toFixed(1)}%)</Badge>
      case "ignored":
        return <Badge className="bg-gray-500">⚪ مهملة ({percentage?.toFixed(1)}%)</Badge>
      default:
        return <Badge className="bg-orange-500">⏳ قيد التحليل</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* لوحة التحكم الرئيسية */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-red-600" />
            النظام فائق السرعة - 1000+ عملة/دقيقة
            <Badge className="bg-red-100 text-red-800">ULTRA FAST</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* حالة الأداء */}
          {performance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">الهدف</span>
                </div>
                <div
                  className={`text-2xl font-bold ${performance.isTargetAchieved ? "text-green-600" : "text-red-600"}`}
                >
                  {performance.tokensPerMinute}/دقيقة
                </div>
                <div className="text-xs text-gray-500">الهدف: 1000+</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">فوري</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{performance.instantDetections}</div>
                <div className="text-xs text-gray-500">&lt;100ms</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Rocket className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">سريع</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{performance.fastDetections}</div>
                <div className="text-xs text-gray-500">&lt;500ms</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Timer className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">متوسط</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {performance.averageDetectionLatency.toFixed(0)}ms
                </div>
                <div className="text-xs text-gray-500">زمن الكشف</div>
              </div>
            </div>
          )}

          {/* حالة النظام */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isMonitoring ? (
                <>
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <span className="text-green-700 font-semibold">النظام فائق السرعة نشط</span>
                  {performance?.isTargetAchieved && <CheckCircle className="h-4 w-4 text-green-500" />}
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">النظام فائق السرعة متوقف</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {performance && (
                <>
                  إجمالي: {performance.totalTokens} | الأداء:{" "}
                  {performance.isTargetAchieved ? "🎯 ممتاز" : "⚠️ تحت الهدف"}
                </>
              )}
            </div>
          </div>

          {/* إعدادات API */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">API Keys (مفصولة بفاصلة - للحصول على أقصى سرعة)</label>
            <Input
              type="password"
              placeholder="helius_key1, quicknode_key2, alchemy_key3..."
              value={apiKeys}
              onChange={(e) => setApiKeys(e.target.value)}
              disabled={isMonitoring}
            />
            <p className="text-xs text-gray-500">
              استخدم عدة API keys من مزودين مختلفين للحصول على أقصى سرعة (Helius, QuickNode, Alchemy)
            </p>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-2">
            {!isMonitoring ? (
              <Button onClick={startUltraFastMonitoring} disabled={loading} className="bg-red-600 hover:bg-red-700">
                <Play className="h-4 w-4 mr-2" />
                {loading ? "جاري بدء النظام فائق السرعة..." : "بدء النظام فائق السرعة"}
              </Button>
            ) : (
              <Button onClick={stopUltraFastMonitoring} disabled={loading} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                {loading ? "جاري الإيقاف..." : "إيقاف النظام"}
              </Button>
            )}

            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>

            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              إحصائيات
            </Button>
          </div>

          {/* رسائل الخطأ */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* تحذير الأداء */}
          {performance && !performance.isTargetAchieved && isMonitoring && (
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                الأداء الحالي: {performance.tokensPerMinute} عملة/دقيقة - أقل من الهدف (1000+). تأكد من استخدام عدة API
                keys عالية الجودة.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* إحصائيات مفصلة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">عملات فائقة السرعة</p>
                <p className="text-2xl font-bold text-red-600">{tokens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">كشف فوري</p>
                <p className="text-2xl font-bold text-green-600">
                  {tokens.filter((t) => t._detectionSpeed === "instant").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">توصيات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tokens.filter((t) => t.classification === "recommended").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">معدل/دقيقة</p>
                <p className="text-2xl font-bold text-purple-600">{performance?.tokensPerMinute || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">آخر تحديث</p>
                <p className="text-sm font-semibold text-orange-600">
                  {lastUpdate ? formatTimeAgo(lastUpdate.getTime()) : "لا يوجد"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة العملات فائقة السرعة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            العملات المكتشفة بالنظام فائق السرعة ({tokens.length})<Badge className="bg-red-500">1000+ عملة/دقيقة</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">لا توجد عملات مكتشفة بعد</p>
              <p className="text-sm text-gray-400">ابدأ النظام فائق السرعة لرؤية 1000+</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {tokens.map((token, index) => (
                <li key={index} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{token.name || token.symbol || token.mint}</span>
                    {getSpeedBadge(token._detectionSpeed)}
                    {getClassificationBadge(token.classification, token.final_percentage)}
                  </div>
                  <span className="text-sm text-gray-500">{formatTimeAgo(token.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
