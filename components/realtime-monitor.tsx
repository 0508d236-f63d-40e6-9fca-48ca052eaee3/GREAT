// إعادة مكون المراقبة الأصلي
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Square, Zap, Clock, TrendingUp, AlertCircle, RefreshCw, Trash2, Activity } from "lucide-react"

interface RealTimeToken {
  address: string
  name?: string
  symbol?: string
  creator: string
  liquidity: number
  timestamp: Date
  signature: string
  final_percentage?: number
  classification?: "recommended" | "classified" | "ignored"
  _isRealTime: boolean
}

interface MonitorStatus {
  isMonitoring: boolean
  subscriptionId: number | null
  processedCount: number
  programId: string
}

export default function RealTimeMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [realtimeTokens, setRealtimeTokens] = useState<RealTimeToken[]>([])
  const [monitorStatus, setMonitorStatus] = useState<MonitorStatus | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

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
        console.log("✅ Real-time monitoring started")
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
      const response = await fetch("/api/realtime?action=stop")
      const data = await response.json()

      if (data.success) {
        setIsMonitoring(false)
        await fetchMonitorStatus()
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

  // مسح العملات
  const clearTokens = async () => {
    try {
      const response = await fetch("/api/realtime?action=clear")
      const data = await response.json()

      if (data.success) {
        setRealtimeTokens([])
        console.log("🧹 Real-time tokens cleared")
      }
    } catch (error) {
      console.error("Error clearing tokens:", error)
    }
  }

  // تحديث دوري
  useEffect(() => {
    fetchMonitorStatus()
    fetchRealtimeTokens()

    const interval = setInterval(() => {
      if (isMonitoring) {
        fetchRealtimeTokens()
        fetchMonitorStatus()
      }
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
      {/* لوحة التحكم */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            مراقبة الوقت الفعلي - شبكة Solana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* حالة المراقب */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isMonitoring ? (
                <>
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <span className="text-green-700 font-semibold">المراقبة نشطة</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">المراقبة متوقفة</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {monitorStatus && (
                <>
                  معالج: {monitorStatus.processedCount} | اشتراك: {monitorStatus.subscriptionId || "غير متاح"}
                </>
              )}
            </div>
          </div>

          {/* إعدادات API */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Helius API Key (مطلوب للمراقبة الفعلية)</label>
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
              </a>
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
                {loading ? "جاري البدء..." : "بدء المراقبة"}
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

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">عملات فورية</p>
                <p className="text-2xl font-bold text-blue-600">{realtimeTokens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">توصيات</p>
                <p className="text-2xl font-bold text-green-600">
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">حالة النظام</p>
                <p className="text-sm font-semibold text-purple-600">{isMonitoring ? "نشط" : "متوقف"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة العملات الفورية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            العملات المكتشفة بالوقت الفعلي ({realtimeTokens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {realtimeTokens.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد عملات مكتشفة بعد</p>
              <p className="text-sm text-gray-400">ابدأ المراقبة لرؤية العملات الجديدة فور إنشائها</p>
            </div>
          ) : (
            <div className="space-y-3">
              {realtimeTokens.map((token, index) => (
                <div key={token.address} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {token.symbol?.substring(0, 2) || index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{token.name || "عملة جديدة"}</p>
                        <p className="text-sm text-gray-500">${token.symbol || token.address.substring(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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
