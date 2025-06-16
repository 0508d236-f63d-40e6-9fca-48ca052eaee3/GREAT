"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GitBranch,
  Rocket,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
  Settings,
  Activity,
  GitCommit,
  ExternalLink,
} from "lucide-react"
import { continuousDeploymentService, type UpdateNotification } from "@/lib/continuous-deployment-service"

export default function DeploymentDashboard() {
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [notifications, setNotifications] = useState<UpdateNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSystemStatus()

    // الاشتراك في الإشعارات
    const unsubscribe = continuousDeploymentService.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 9)])
    })

    // تحديث الحالة كل 30 ثانية
    const interval = setInterval(loadSystemStatus, 30000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const loadSystemStatus = async () => {
    try {
      const status = continuousDeploymentService.getSystemStatus()
      setSystemStatus(status)
      setNotifications(status.notifications.slice(0, 10))
    } catch (error) {
      console.error("خطأ في تحميل حالة النظام:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartSystem = async () => {
    setIsLoading(true)
    try {
      await continuousDeploymentService.startContinuousDeployment()
      await loadSystemStatus()
    } catch (error) {
      console.error("خطأ في بدء النظام:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopSystem = () => {
    continuousDeploymentService.stopContinuousDeployment()
    loadSystemStatus()
  }

  const handleRestartSystem = async () => {
    setIsLoading(true)
    try {
      await continuousDeploymentService.restartSystem()
      await loadSystemStatus()
    } catch (error) {
      console.error("خطأ في إعادة تشغيل النظام:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500"
      case "building":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_commit":
        return <GitCommit className="h-4 w-4" />
      case "deployment_started":
        return <Rocket className="h-4 w-4" />
      case "deployment_ready":
        return <CheckCircle className="h-4 w-4" />
      case "deployment_failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (isLoading && !systemStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل لوحة النشر...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* حالة النظام */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            حالة نظام النشر المستمر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  systemStatus?.isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <p className="text-sm font-medium">{systemStatus?.isActive ? "نشط" : "متوقف"}</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{systemStatus?.stats.successfulDeployments || 0}</p>
              <p className="text-sm text-gray-600">نشر ناجح</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{systemStatus?.stats.failedDeployments || 0}</p>
              <p className="text-sm text-gray-600">نشر فاشل</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {!systemStatus?.isActive ? (
              <Button onClick={handleStartSystem} disabled={isLoading}>
                <Rocket className="h-4 w-4 mr-2" />
                بدء النظام
              </Button>
            ) : (
              <Button onClick={handleStopSystem} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                إيقاف النظام
              </Button>
            )}

            <Button onClick={handleRestartSystem} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              إعادة تشغيل
            </Button>

            <Button onClick={loadSystemStatus} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* معلومات المستودع */}
      {systemStatus?.repositoryInfo.repository && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              معلومات المستودع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">اسم المستودع</p>
                <p className="font-medium">{systemStatus.repositoryInfo.repository.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">المالك</p>
                <p className="font-medium">{systemStatus.repositoryInfo.repository.owner}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">الفرع</p>
                <p className="font-medium">{systemStatus.repositoryInfo.repository.branch}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">آخر commit</p>
                <p className="font-medium text-sm">
                  {systemStatus.repositoryInfo.repository.lastCommit?.message || "غير متاح"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <a href={systemStatus.repositoryInfo.repository.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  عرض المستودع
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* حالة النشر */}
      {systemStatus?.deploymentStatus.queue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              حالة النشر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStatus.deploymentStatus.queue.slice(0, 5).map((deployment: any) => (
                <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(deployment.status)}`} />
                    <div>
                      <p className="font-medium">النشر #{deployment.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {deployment.commit?.slice(0, 8)} - {deployment.createdAt}
                      </p>
                    </div>
                  </div>

                  <Badge variant={deployment.status === "ready" ? "default" : "secondary"}>
                    {deployment.status === "ready"
                      ? "مكتمل"
                      : deployment.status === "building"
                        ? "جاري البناء"
                        : deployment.status === "error"
                          ? "فاشل"
                          : "في الانتظار"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* الإشعارات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            الإشعارات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد إشعارات</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.timestamp.toLocaleString("ar-SA")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* الإحصائيات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إحصائيات النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{systemStatus?.stats.totalNotifications || 0}</p>
              <p className="text-sm text-gray-600">إجمالي الإشعارات</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{systemStatus?.repositoryInfo.stats.totalCommits || 0}</p>
              <p className="text-sm text-gray-600">إجمالي الـ Commits</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{systemStatus?.repositoryInfo.stats.contributors.length || 0}</p>
              <p className="text-sm text-gray-600">المساهمون</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{systemStatus?.deploymentStatus.isMonitoring ? "✅" : "❌"}</p>
              <p className="text-sm text-gray-600">حالة المراقبة</p>
            </div>
          </div>

          {systemStatus?.stats.lastUpdate && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                آخر تحديث: {systemStatus.stats.lastUpdate.toLocaleString("ar-SA")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
