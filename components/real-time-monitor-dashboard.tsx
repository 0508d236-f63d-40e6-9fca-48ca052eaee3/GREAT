// لوحة تحكم النظام الحقيقي مع تعلم الآلة
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Zap,
  Brain,
  Target,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Play,
  Square,
  RefreshCw,
  Rocket,
  Eye,
  ShoppingCart,
  X,
  BarChart3,
} from "lucide-react"

interface RealTimeToken {
  mint: string
  name: string
  symbol: string
  creator: string
  created_timestamp: number
  usd_market_cap: number
  detection_timestamp: number
  detection_latency: number
  detection_method: string
  ml_prediction_score: number
  success_probability: number
  risk_level: "low" | "medium" | "high"
  recommended_action: "buy" | "watch" | "ignore"
  confidence_score: number
}

interface MonitorStats {
  isMonitoring: boolean
  totalDetected: number
  connectionsCount: number
  wsConnectionsCount: number
  mlAccuracy: number
  ml_model: {
    accuracy: number
    total_predictions: number
    successful_predictions: number
  }
}

export default function RealTimeMonitorDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [tokens, setTokens] = useState<RealTimeToken[]>([])
  const [stats, setStats] = useState<MonitorStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // جلب البيانات
  const fetchData = async () => {
    try {
      const [tokensResponse, statsResponse] = await Promise.all([
        fetch("/api/real-time-monitor?action=tokens"),
        fetch("/api/real-time-monitor?action=stats"),
      ])

      const tokensData = await tokensResponse.json()
      const statsData = await statsResponse.json()

      if (tokensData.success) {
        setTokens(tokensData.data || [])
      }

      if (statsData.success) {
        setStats(statsData.stats)
        setIsMonitoring(statsData.stats.isMonitoring)
      }

      setLastUpdate(new Date())
      setError(null)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("فشل في جلب البيانات")
    }
  }

  // بدء المراقبة
  const startMonitoring = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/real-time-monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "start" }),
      })

      const data = await response.json()

      if (data.success) {
        setIsMonitoring(true)
        console.log("✅ Real-time monitoring started with ML")
      } else {
        setError(data.message || "فشل في بدء المراقبة")
      }
    } catch (error) {
      setError("خطأ في الاتصال")
      console.error("Error starting monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // إيقاف المراقبة
  const stopMonitoring = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/real-time-monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "stop" }),
      })

      const data = await response.json()

      if (data.success) {
        setIsMonitoring(false)
        console.log("🛑 Real-time monitoring stopped")
      } else {
        setError(data.message || "فشل في إيقاف المراقبة")
      }
    } catch (error) {
      setError("خطأ في الاتصال")
      console.error("Error stopping monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // تحديث دوري
  useEffect(() => {
    fetchData()

    const interval = setInterval(() => {
      if (isMonitoring) {
        fetchData()
      }
    }, 2000) // كل ثانيتين

    return () => clearInterval(interval)
  }, [isMonitoring])

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) return `${minutes}د`
    return `${seconds}ث`
  }

  const getActionBadge = (action: string, score: number) => {
    switch (action) {
      case "buy":
        return (
          <Badge className="bg-green-500">
            <ShoppingCart className="h-3 w-3 mr-1" />
            شراء ({score.toFixed(1)})
          </Badge>
        )
      case "watch":
        return (
          <Badge className="bg-blue-500">
            <Eye className="h-3 w-3 mr-1" />
            مراقبة ({score.toFixed(1)})
          </Badge>
        )
      case "ignore":
        return (
          <Badge className="bg-gray-500">
            <X className="h-3 w-3 mr-1" />
            تجاهل ({score.toFixed(1)})
          </Badge>
        )
      default:
        return <Badge className="bg-orange-500">تحليل ({score.toFixed(1)})</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">مخاطر منخفضة</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">مخاطر متوسطة</Badge>
      case "high":
        return <Badge className="bg-red-100 text-red-800">مخاطر عالية</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">غير محدد</Badge>
    }
  }

  const getDetectionMethodBadge = (method: string, latency: number) => {
    if (method.includes("solana_logs")) {
      return (
        <Badge className="bg-purple-500">
          <Zap className="h-3 w-3 mr-1" />
          فوري ({latency}ms)
        </Badge>
      )
    } else if (method === "websocket") {
      return (
        <Badge className="bg-blue-500">
          <Activity className="h-3 w-3 mr-1" />
          WebSocket
        </Badge>
      )
    } else if (method === "pump_api") {
      return (
        <Badge className="bg-orange-500">
          <RefreshCw className="h-3 w-3 mr-1" />
          API
        </Badge>
      )
    }
    return <Badge className="bg-gray-500">{method}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* لوحة التحكم الرئيسية */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            نظام المراقبة الحقيقي مع تعلم الآلة
            <Badge className="bg-blue-100 text-blue-800">REAL-TIME + ML</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* حالة النظام */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isMonitoring ? (
                <>
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <span className="text-green-700 font-semibold">النظام نشط - كشف بـ 0 ثانية</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">النظام متوقف</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {stats && (
                <>
                  عملات: {stats.totalDetected} | دقة ML: {(stats.mlAccuracy * 100).toFixed(1)}%
                </>
              )}
            </div>
          </div>

          {/* إحصائيات تعلم الآلة */}
          {stats?.ml_model && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">دقة ML</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{(stats.ml_model.accuracy * 100).toFixed(1)}%</div>
                <Progress value={stats.ml_model.accuracy * 100} className="mt-1" />
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">تنبؤات ناجحة</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.ml_model.successful_predictions}</div>
                <div className="text-xs text-gray-500">من {stats.ml_model.total_predictions}</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">معدل النجاح</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.ml_model.total_predictions > 0
                    ? ((stats.ml_model.successful_predictions / stats.ml_model.total_predictions) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <div className="text-xs text-gray-500">تحديث مستمر</div>
              </div>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex gap-2">
            {!isMonitoring ? (
              <Button onClick={startMonitoring} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                {loading ? "جاري بدء النظام..." : "بدء المراقبة الحقيقية + ML"}
              </Button>
            ) : (
              <Button onClick={stopMonitoring} disabled={loading} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                {loading ? "جاري الإيقاف..." : "إيقاف النظام"}
              </Button>
            )}

            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </div>

          {/* رسائل الخطأ */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">عملات مكتشفة</p>
                <p className="text-2xl font-bold text-blue-600">{tokens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">توصيات شراء</p>
                <p className="text-2xl font-bold text-green-600">
                  {tokens.filter((t) => t.recommended_action === "buy").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">للمراقبة</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tokens.filter((t) => t.recommended_action === "watch").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">آخر تحديث</p>
                <p className="text-sm font-semibold text-purple-600">
                  {lastUpdate ? formatTimeAgo(lastUpdate.getTime()) : "لا يوجد"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة العملات المكتشفة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            العملات المكتشفة بالنظام الحقيقي ({tokens.length})<Badge className="bg-blue-500">تعلم آلة + كشف فوري</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">لا توجد عملات مكتشفة بعد</p>
              <p className="text-sm text-gray-400">ابدأ النظام لرؤية العملات الجديدة مع تحليل ML</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.slice(0, 20).map((token, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{token.name}</span>
                      <Badge variant="outline">{token.symbol}</Badge>
                      {getActionBadge(token.recommended_action, token.ml_prediction_score)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getRiskBadge(token.risk_level)}
                      {getDetectionMethodBadge(token.detection_method, token.detection_latency)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">نقاط ML:</span>
                      <span className="font-semibold ml-1">{token.ml_prediction_score.toFixed(1)}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-600">احتمالية النجاح:</span>
                      <span className="font-semibold ml-1">{token.success_probability.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">القيمة السوقية:</span>
                      <span className="font-semibold ml-1">${token.usd_market_cap.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">وقت الكشف:</span>
                      <span className="font-semibold ml-1">{formatTimeAgo(token.detection_timestamp)}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Progress value={token.confidence_score} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>مستوى الثقة: {token.confidence_score.toFixed(1)}%</span>
                      <span>كشف: {token.detection_latency}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
