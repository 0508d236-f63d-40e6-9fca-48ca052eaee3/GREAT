// لوحة تحكم للمراقبة الفعالة
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  BarChart3,
  Settings,
  Play,
  Square,
  RefreshCw,
} from "lucide-react"

export default function EfficientMonitorDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [fetchInterval, setFetchInterval] = useState("3000")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/efficient-monitor?action=stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setIsMonitoring(data.stats.isRunning)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const startMonitoring = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/efficient-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          fetchInterval: Number.parseInt(fetchInterval),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsMonitoring(true)
        console.log("✅ Efficient monitoring started")
      } else {
        setError(data.message || "فشل في بدء المراقبة الفعالة")
      }
    } catch (error) {
      setError("خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  const stopMonitoring = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/efficient-monitor?action=stop")
      const data = await response.json()

      if (data.success) {
        setIsMonitoring(false)
        console.log("🛑 Efficient monitoring stopped")
      }
    } catch (error) {
      console.error("Error stopping monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* استراتيجية المراقبة */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            استراتيجية المراقبة الفعالة
            <Badge className="bg-green-100 text-green-800">PUMP.FUN فقط</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">✅ ما نراقبه:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  pump.fun API مباشرة
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  pump.fun WebSocket
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  برامج pump.fun على Solana فقط
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  جلب مستمر كل {fetchInterval}ms
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-red-700">❌ ما لا نراقبه:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  كل عملات Solana
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  مسح شامل للشبكة
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  عملات غير pump.fun
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  استهلاك موارد غير ضروري
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات المراقبة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات المراقبة الفعالة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">فترة الجلب (بالميلي ثانية)</label>
              <Input
                type="number"
                value={fetchInterval}
                onChange={(e) => setFetchInterval(e.target.value)}
                min="1000"
                max="10000"
                step="500"
                disabled={isMonitoring}
              />
              <p className="text-xs text-gray-500 mt-1">الحد الأدنى: 1000ms (ثانية واحدة)</p>
            </div>

            <div className="flex items-end">
              <div className="space-y-2">
                <div className="text-sm font-medium">حالة النظام</div>
                <div className="flex items-center gap-2">
                  {isMonitoring ? (
                    <>
                      <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                      <span className="text-green-700 font-semibold">نشط</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">متوقف</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isMonitoring ? (
              <Button onClick={startMonitoring} disabled={loading} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                {loading ? "جاري البدء..." : "بدء المراقبة الفعالة"}
              </Button>
            ) : (
              <Button onClick={stopMonitoring} disabled={loading} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                {loading ? "جاري الإيقاف..." : "إيقاف المراقبة"}
              </Button>
            )}

            <Button onClick={fetchStats} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* إحصائيات الأداء */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">العملات المكتشفة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalTokens}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">عملة/دقيقة</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.tokensPerMinute}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">وقت التشغيل</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.runtime}د</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">الكفاءة</p>
                  <p className="text-sm font-bold text-orange-600">عالية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* معلومات الاستراتيجية */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <strong>استراتيجية فعالة:</strong> هذا النظام يراقب pump.fun مباشرة فقط، بدون مسح كل عملات Solana. هذا يوفر
          الموارد ويزيد السرعة بشكل كبير.
        </AlertDescription>
      </Alert>
    </div>
  )
}
