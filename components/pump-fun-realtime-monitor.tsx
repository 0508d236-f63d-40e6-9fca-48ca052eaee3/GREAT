// مكون واجهة المستخدم المحسن للمراقبة pump.fun فقط
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Square,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Trash2,
  Activity,
  CheckCircle,
  Target,
  Globe,
} from "lucide-react"

interface PumpFunRealTimeToken {
  address: string
  name?: string
  symbol?: string
  creator: string
  liquidity: number
  timestamp: Date
  signature: string
  final_percentage?: number
  classification?: "recommended" | "classified" | "ignored"
  isPumpFunVerified: boolean
  _isPumpFunOnly: boolean
  _isRealTime: boolean
}

interface PumpFunMonitorStatus {
  isMonitoring: boolean
  subscriptionId: number | null
  processedCount: number
  programIds: string[]
  isPumpFunSpecific: boolean
  tokensCount: number
  pumpFunVerifiedCount: number
}

export default function PumpFunRealTimeMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [realtimeTokens, setRealtimeTokens] = useState<PumpFunRealTimeToken[]>([])
  const [monitorStatus, setMonitorStatus] = useState<PumpFunMonitorStatus | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [apiStatus, setApiStatus] = useState<any>(null)

  // جلب حالة المراقب
  const fetchMonitorStatus = async () => {
    try {
      const response = await fetch("/api/realtime?action=status")
      const data = await response.json()

      if (data.success) {
        setMonitorStatus(data.status)
        setIsMonitoring(data.status?.isMonitoring || false)
      }
    } catch (error) {
      console.error("Error fetching monitor status:", error)
    }
  }

  // جلب العملات بالوقت الفعلي
  const fetchRealtimeTokens = async () => {
    try {
      const response = await fetch("/api/realtime?action=tokens")
      const data = await response.json()

      if (data.success) {
        setRealtimeTokens(data.data || [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error fetching realtime tokens:", error)
    }
  }

  // فحص حالة pump.fun API
  const checkAPIStatus = async () => {
    try {
      const response = await fetch("/api/realtime?action=api-status")
      const data = await response.json()

      if (data.success) {
        setApiStatus(data.apiStatus)
      }
    } catch (error) {
      console.error("Error checking API status:", error)
    }
  }

  // بدء المراقبة
  const startMonitoring = async () => {
    if (!apiKey.trim()) {
      setError("يرجى إدخال Helius API Key")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          apiKey: apiKey.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsMonitoring(true)
        await fetchMonitorStatus()
        console.log("✅ Pump.fun only real-time monitoring started")
      } else {
        setError(data.message || "فشل في بدء مراقبة pump.fun")
      }
    } catch (error) {
      setError("خطأ في الاتصال")
      console.error("Error starting pump.fun monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // إيقاف المراقبة
  const stopMonitoring = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/realtime?action=stop")
      const data = await response.json()

      if (data.success) {
        setIsMonitoring(false)
        await fetchMonitorStatus()
        console.log("🛑 Pump.fun only real-time monitoring stopped")
      } else {
        setError(data.message || "فشل في إيقاف مراقبة pump.fun")
      }
    } catch (error) {
      setError("خطأ في الاتصال")
      console.error("Error stopping pump.fun monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // مسح العملات
  const clearTokens = async () => {
    try {
      const response = await fetch("/api/realtime?action=clear")
      const data = await response.json()

      if (data.success) {
        setRealtimeTokens([])
        console.log("🧹 Pump.fun real-time tokens cleared")
      }
    } catch (error) {
      console.error("Error clearing tokens:", error)
    }
  }

  // تحديث دوري
  useEffect(() => {
    fetchMonitorStatus()
    fetchRealtimeTokens()
    checkAPIStatus()

    const interval = setInterval(() => {
      if (isMonitoring) {
        fetchRealtimeTokens()
        fetchMonitorStatus()
      }
      checkAPIStatus()
    }, 5000) // كل 5 ثوان

    return () => clearInterval(interval)
  }, [isMonitoring])

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) return `${minutes}د`
    return `${seconds}ث`
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
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            مراقبة الوقت الفعلي - Pump.fun فقط
            <Badge className="bg-green-100 text-green-800">محدد</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* حالة المراقب */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isMonitoring ? (
                <>
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <span className="text-green-700 font-semibold">مراقبة pump.fun نشطة</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">مراقبة pump.fun متوقفة</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {monitorStatus && (
                <>
                  معالج: {monitorStatus.processedCount} | عملات: {monitorStatus.tokensCount} | مؤكدة:{" "}
                  {monitorStatus.pumpFunVerifiedCount}
                </>
              )}
            </div>
          </div>

          {/* حالة pump.fun API */}
          {apiStatus && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-700">حالة Pump.fun API</span>
                </div>
                <div className="flex items-center gap-2">
                  {apiStatus.isOnline ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {apiStatus.workingEndpoints.length}/
                    {apiStatus.workingEndpoints.length + apiStatus.failedEndpoints.length} نشط
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* إعدادات API */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Helius API Key (مطلوب للمراقبة الفعلية لـ pump.fun)
            </label>
            <Input
              type="password"
              placeholder="أدخل Helius API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isMonitoring}
            />
            <p className="text-xs text-gray-500">
              احصل على API key مجاني من{" "}
              <a
                href="https://helius.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                helius.xyz
              </a>{" "}
              للمراقبة المباشرة لعملات pump.fun
            </p>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-2">
            {!isMonitoring ? (
              <Button
                onClick={startMonitoring}
                disabled={loading || !apiKey.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? "جاري بدء مراقبة pump.fun..." : "بدء مراقبة pump.fun"}
              </Button>
            ) : (
              <Button onClick={stopMonitoring} disabled={loading} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                {loading ? "جاري الإيقاف..." : "إيقاف المراقبة"}
              </Button>
            )}

            <Button onClick={fetchRealtimeTokens} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>

            <Button onClick={clearTokens} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              مسح
            </Button>

            <Button onClick={checkAPIStatus} variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              فحص API
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

      {/* إحصائيات pump.fun */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">عملات pump.fun فورية</p>
                <p className="text-2xl font-bold text-green-600">{realtimeTokens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">مؤكدة pump.fun</p>
                <p className="text-2xl font-bold text-blue-600">
                  {realtimeTokens.filter((t) => t.isPumpFunVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">توصيات pump.fun</p>
                <p className="text-2xl font-bold text-purple-600">
                  {realtimeTokens.filter((t) => t.classification === "recommended").length}
                </p>
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
                  {lastUpdate ? formatTimeAgo(lastUpdate) : "لا يوجد"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة العملات الفورية من pump.fun */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            عملات Pump.fun المكتشفة بالوقت الفعلي ({realtimeTokens.length})
            <Badge className="bg-green-500">pump.fun فقط</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {realtimeTokens.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">لا توجد عملات pump.fun مكتشفة بعد</p>
              <p className="text-sm text-gray-400">ابدأ المراقبة لرؤية عملات pump.fun الجديدة فور إنشائها</p>
            </div>
          ) : (
            <div className="space-y-3">
              {realtimeTokens.map((token, index) => (
                <div key={token.address} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">
                          {token.symbol?.substring(0, 2) || index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{token.name || "عملة pump.fun جديدة"}</p>
                        <p className="text-sm text-gray-500">${token.symbol || token.address.substring(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {token.isPumpFunVerified && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          pump.fun مؤكد
                        </Badge>
                      )}
                      {getClassificationBadge(token.classification, token.final_percentage)}
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(token.timestamp)}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">السيولة:</span>
                      <span className="ml-1 font-medium">{token.liquidity.toFixed(2)} SOL</span>
                    </div>
                    <div>
                      <span className="text-gray-500">المنشئ:</span>
                      <span className="ml-1 font-mono text-xs">{token.creator.substring(0, 8)}...</span>
                    </div>
                    <div>
                      <span className="text-gray-500">العنوان:</span>
                      <span className="ml-1 font-mono text-xs">{token.address.substring(0, 8)}...</span>
                    </div>
                    <div>
                      <span className="text-gray-500">المعاملة:</span>
                      <a
                        href={`https://solscan.io/tx/${token.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-600 hover:underline text-xs"
                      >
                        عرض
                      </a>
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
