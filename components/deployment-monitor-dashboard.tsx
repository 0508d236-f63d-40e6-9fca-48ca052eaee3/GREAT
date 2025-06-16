"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Rocket,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Download,
  RefreshCw,
  Activity,
  Globe,
  GitBranch,
} from "lucide-react"

import { deploymentMonitor, type DeploymentStatus } from "../lib/deployment-monitor-service"

export default function DeploymentMonitorDashboard() {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [issues, setIssues] = useState<string[]>([])

  /**
   * 🔍 بدء مراقبة النشر
   */
  const startMonitoring = async () => {
    setIsMonitoring(true)
    try {
      const status = await deploymentMonitor.monitorDeployment()
      setDeploymentStatus(status)

      // فحص المشاكل
      const detectedIssues = await deploymentMonitor.checkForIssues()
      setIssues(detectedIssues)
    } catch (error) {
      console.error("خطأ في المراقبة:", error)
    } finally {
      setIsMonitoring(false)
    }
  }

  /**
   * 📄 تحميل تقرير النشر
   */
  const downloadReport = () => {
    const report = deploymentMonitor.generateDeploymentReport()
    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `deployment-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 🔄 تحديث تلقائي كل 30 ثانية
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (deploymentStatus?.isDeploying) {
        startMonitoring()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [deploymentStatus])

  // بدء المراقبة عند التحميل
  useEffect(() => {
    startMonitoring()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY":
        return "text-green-500"
      case "BUILDING":
        return "text-blue-500"
      case "QUEUED":
        return "text-yellow-500"
      case "ERROR":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "READY":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "BUILDING":
        return <Activity className="w-5 h-5 text-blue-500 animate-spin" />
      case "QUEUED":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "ERROR":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "READY":
        return "مكتمل ✅"
      case "BUILDING":
        return "جاري البناء 🏗️"
      case "QUEUED":
        return "في الانتظار ⏳"
      case "ERROR":
        return "خطأ ❌"
      default:
        return "غير معروف"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Rocket className="w-8 h-8 text-blue-500" />🚀 مراقبة النشر المباشر
        </h1>
        <p className="text-muted-foreground">تتبع حالة النشر والتحقق من نجاح التحديثات</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={startMonitoring} disabled={isMonitoring} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isMonitoring ? "animate-spin" : ""}`} />
          {isMonitoring ? "جاري المراقبة..." : "تحديث الحالة"}
        </Button>

        {deploymentStatus && (
          <Button onClick={downloadReport} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            تحميل التقرير
          </Button>
        )}
      </div>

      {deploymentStatus && (
        <div className="grid gap-6">
          {/* حالة النشر الرئيسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(deploymentStatus.status)}
                حالة النشر الحالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">الحالة:</span>
                  <Badge
                    variant={deploymentStatus.status === "READY" ? "default" : "secondary"}
                    className={getStatusColor(deploymentStatus.status)}
                  >
                    {getStatusText(deploymentStatus.status)}
                  </Badge>
                </div>

                {/* شريط التقدم */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم</span>
                    <span>{deploymentStatus.progress}%</span>
                  </div>
                  <Progress value={deploymentStatus.progress} className="w-full" />
                </div>

                {/* معلومات إضافية */}
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID النشر:</span>
                      <span className="font-mono text-sm">
                        {deploymentStatus.deploymentId?.substring(0, 8) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">وقت البداية:</span>
                      <span className="text-sm">{deploymentStatus.startTime?.toLocaleTimeString() || "N/A"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المدة:</span>
                      <span className="text-sm">
                        {deploymentStatus.duration ? `${Math.round(deploymentStatus.duration / 1000)}s` : "جاري..."}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الرابط:</span>
                      {deploymentStatus.url ? (
                        <a
                          href={deploymentStatus.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          زيارة الموقع
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm">غير متاح</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* سجلات النشر */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                سجلات النشر ({deploymentStatus.logs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {deploymentStatus.logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">لا توجد سجلات متاحة</p>
                ) : (
                  deploymentStatus.logs.map((log, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* المشاكل المكتشفة */}
          {issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  مشاكل مكتشفة ({issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {issues.map((issue, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>{issue}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* إحصائيات النشر */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                إحصائيات النشر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">1</div>
                  <div className="text-sm text-muted-foreground">إجمالي النشر</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">100%</div>
                  <div className="text-sm text-muted-foreground">معدل النجاح</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {deploymentStatus.duration ? `${Math.round(deploymentStatus.duration / 1000)}s` : "0s"}
                  </div>
                  <div className="text-sm text-muted-foreground">متوسط المدة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {deploymentStatus.endTime?.toLocaleDateString() || "اليوم"}
                  </div>
                  <div className="text-sm text-muted-foreground">آخر نشر</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* النشر مكتمل */}
          {deploymentStatus.status === "READY" && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h2 className="text-2xl font-bold text-green-700">🎉 النشر مكتمل بنجاح!</h2>
                  <p className="text-green-600">تم نشر موقعك بنجاح وهو متاح الآن للمستخدمين</p>
                  <div className="flex gap-4 justify-center">
                    {deploymentStatus.url && (
                      <Button asChild>
                        <a
                          href={deploymentStatus.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Globe className="w-4 h-4" />
                          زيارة الموقع
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" onClick={downloadReport} className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      تحميل تقرير النشر
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loading State */}
      {!deploymentStatus && isMonitoring && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
              <h2 className="text-xl font-semibold">جاري فحص حالة النشر...</h2>
              <p className="text-muted-foreground">يرجى الانتظار بينما نتحقق من حالة النشر الحالية</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
