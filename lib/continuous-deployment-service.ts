/**
 * 🔄 خدمة النشر المستمر والتحديثات التلقائية
 */

import { autoDeploymentService } from "./auto-deployment-service"
import { gitIntegrationService } from "./git-integration-service"

export interface UpdateNotification {
  id: string
  type: "new_commit" | "deployment_started" | "deployment_ready" | "deployment_failed"
  title: string
  message: string
  timestamp: Date
  data?: any
}

export class ContinuousDeploymentService {
  private static instance: ContinuousDeploymentService
  private notifications: UpdateNotification[] = []
  private isActive = false
  private updateInterval: NodeJS.Timeout | null = null
  private notificationCallbacks: ((notification: UpdateNotification) => void)[] = []

  static getInstance(): ContinuousDeploymentService {
    if (!ContinuousDeploymentService.instance) {
      ContinuousDeploymentService.instance = new ContinuousDeploymentService()
    }
    return ContinuousDeploymentService.instance
  }

  /**
   * 🚀 بدء النشر المستمر
   */
  async startContinuousDeployment(): Promise<void> {
    if (this.isActive) return

    this.isActive = true
    console.log("🔄 بدء نظام النشر المستمر...")

    try {
      // إعداد Git integration
      await gitIntegrationService.setupRepository()

      // بدء نظام النشر التلقائي
      await autoDeploymentService.startAutoUpdates()

      // إعداد webhook للتحديثات الفورية
      autoDeploymentService.setupWebhook((payload) => {
        this.handleGitWebhook(payload)
      })

      // بدء مراقبة التحديثات
      this.startUpdateMonitoring()

      // إشعار بالبدء
      this.addNotification({
        type: "deployment_started",
        title: "🚀 نظام النشر المستمر",
        message: "تم بدء نظام النشر المستمر بنجاح",
      })
    } catch (error) {
      console.error("❌ خطأ في بدء النشر المستمر:", error)
      this.addNotification({
        type: "deployment_failed",
        title: "❌ خطأ في النظام",
        message: "فشل في بدء نظام النشر المستمر",
      })
    }
  }

  /**
   * 👁️ بدء مراقبة التحديثات
   */
  private startUpdateMonitoring(): void {
    // فحص التحديثات كل دقيقتين
    this.updateInterval = setInterval(
      async () => {
        await this.checkForUpdates()
      },
      2 * 60 * 1000,
    )

    // فحص أولي
    setTimeout(() => this.checkForUpdates(), 5000)
  }

  /**
   * 🔍 فحص التحديثات الجديدة
   */
  private async checkForUpdates(): Promise<void> {
    try {
      // فحص commits جديدة
      const newCommits = await gitIntegrationService.checkForNewCommits()

      if (newCommits.length > 0) {
        console.log(`🆕 تم اكتشاف ${newCommits.length} commits جديدة`)

        // إشعار بالتحديثات الجديدة
        newCommits.forEach((commit) => {
          this.addNotification({
            type: "new_commit",
            title: "🆕 تحديث جديد",
            message: `${commit.message} - ${commit.author}`,
            data: commit,
          })
        })

        // تشغيل النشر التلقائي للـ commit الأحدث
        const latestCommit = newCommits[0]
        await this.triggerAutomaticDeployment(latestCommit.sha)
      }

      // فحص حالة النشر
      const deploymentStatus = autoDeploymentService.getDeploymentStatus()
      this.updateDeploymentNotifications(deploymentStatus)
    } catch (error) {
      console.error("❌ خطأ في فحص التحديثات:", error)
    }
  }

  /**
   * 🚀 تشغيل النشر التلقائي
   */
  private async triggerAutomaticDeployment(commitSha: string): Promise<void> {
    try {
      console.log("🚀 بدء النشر التلقائي للـ commit:", commitSha)

      this.addNotification({
        type: "deployment_started",
        title: "🔄 جاري النشر",
        message: "بدء عملية النشر التلقائي...",
        data: { commit: commitSha },
      })

      // هنا يمكن إضافة منطق النشر الفعلي
      // مثل استدعاء Vercel API أو GitHub Actions
    } catch (error) {
      console.error("❌ خطأ في النشر التلقائي:", error)

      this.addNotification({
        type: "deployment_failed",
        title: "❌ فشل النشر",
        message: "حدث خطأ أثناء النشر التلقائي",
        data: { error: error.message },
      })
    }
  }

  /**
   * 📨 معالجة webhook من Git
   */
  private handleGitWebhook(payload: any): void {
    console.log("📨 تم استلام webhook:", payload)

    this.addNotification({
      type: "new_commit",
      title: "📨 تحديث فوري",
      message: `تم استلام تحديث من ${payload.repository.name}`,
      data: payload,
    })
  }

  /**
   * 🔄 تحديث إشعارات النشر
   */
  private updateDeploymentNotifications(status: any): void {
    // فحص النشر المكتمل
    const readyDeployments = status.queue.filter(
      (d: any) => d.status === "ready" && !this.hasNotificationForDeployment(d.id, "deployment_ready"),
    )

    readyDeployments.forEach((deployment: any) => {
      this.addNotification({
        type: "deployment_ready",
        title: "✅ النشر مكتمل",
        message: `تم نشر التحديثات بنجاح على ${deployment.url}`,
        data: deployment,
      })
    })

    // فحص النشر الفاشل
    const failedDeployments = status.queue.filter(
      (d: any) => d.status === "error" && !this.hasNotificationForDeployment(d.id, "deployment_failed"),
    )

    failedDeployments.forEach((deployment: any) => {
      this.addNotification({
        type: "deployment_failed",
        title: "❌ فشل النشر",
        message: `فشل في نشر التحديثات: ${deployment.error}`,
        data: deployment,
      })
    })
  }

  /**
   * 🔍 فحص وجود إشعار للنشر
   */
  private hasNotificationForDeployment(deploymentId: string, type: string): boolean {
    return this.notifications.some((n) => n.type === type && n.data?.id === deploymentId)
  }

  /**
   * 📢 إضافة إشعار جديد
   */
  private addNotification(notification: Omit<UpdateNotification, "id" | "timestamp">): void {
    const fullNotification: UpdateNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...notification,
    }

    this.notifications.unshift(fullNotification)

    // الاحتفاظ بآخر 50 إشعار فقط
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // إشعار المستمعين
    this.notificationCallbacks.forEach((callback) => {
      try {
        callback(fullNotification)
      } catch (error) {
        console.error("❌ خطأ في callback الإشعار:", error)
      }
    })

    console.log("📢 إشعار جديد:", fullNotification.title)
  }

  /**
   * 🔔 الاشتراك في الإشعارات
   */
  onNotification(callback: (notification: UpdateNotification) => void): () => void {
    this.notificationCallbacks.push(callback)

    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      const index = this.notificationCallbacks.indexOf(callback)
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 📊 الحصول على حالة النظام
   */
  getSystemStatus(): {
    isActive: boolean
    notifications: UpdateNotification[]
    deploymentStatus: any
    repositoryInfo: any
    stats: {
      totalNotifications: number
      successfulDeployments: number
      failedDeployments: number
      lastUpdate: Date | null
    }
  } {
    const deploymentStatus = autoDeploymentService.getDeploymentStatus()
    const repositoryInfo = gitIntegrationService.getRepositoryInfo()

    const successfulDeployments = this.notifications.filter((n) => n.type === "deployment_ready").length
    const failedDeployments = this.notifications.filter((n) => n.type === "deployment_failed").length
    const lastUpdate = this.notifications.length > 0 ? this.notifications[0].timestamp : null

    return {
      isActive: this.isActive,
      notifications: this.notifications,
      deploymentStatus,
      repositoryInfo,
      stats: {
        totalNotifications: this.notifications.length,
        successfulDeployments,
        failedDeployments,
        lastUpdate,
      },
    }
  }

  /**
   * 🛑 إيقاف النشر المستمر
   */
  stopContinuousDeployment(): void {
    this.isActive = false

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    this.addNotification({
      type: "deployment_started",
      title: "🛑 تم إيقاف النظام",
      message: "تم إيقاف نظام النشر المستمر",
    })

    console.log("🛑 تم إيقاف نظام النشر المستمر")
  }

  /**
   * 🧹 تنظيف الإشعارات
   */
  clearNotifications(): void {
    this.notifications = []
    console.log("🧹 تم تنظيف الإشعارات")
  }

  /**
   * 🔄 إعادة تشغيل النظام
   */
  async restartSystem(): Promise<void> {
    console.log("🔄 إعادة تشغيل نظام النشر المستمر...")

    this.stopContinuousDeployment()
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await this.startContinuousDeployment()
  }
}

// إنشاء instance للاستخدام
export const continuousDeploymentService = ContinuousDeploymentService.getInstance()
