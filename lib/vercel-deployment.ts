/**
 * 🚀 مساعد النشر على Vercel
 */

export class VercelDeployment {
  private static instance: VercelDeployment

  static getInstance(): VercelDeployment {
    if (!VercelDeployment.instance) {
      VercelDeployment.instance = new VercelDeployment()
    }
    return VercelDeployment.instance
  }

  /**
   * 🔍 فحص حالة النشر
   */
  async checkDeploymentStatus(): Promise<{
    isDeployed: boolean
    url?: string
    status: string
    performance: any
  }> {
    try {
      // فحص إذا كان الموقع منشور
      const isVercel =
        typeof window !== "undefined" &&
        (window.location.hostname.includes("vercel.app") || process.env.NEXT_PUBLIC_VERCEL_ENV === "production")

      if (isVercel) {
        const url = window.location.origin

        // فحص الأداء
        const performance = await this.checkPerformance(url)

        return {
          isDeployed: true,
          url,
          status: "deployed",
          performance,
        }
      }

      return {
        isDeployed: false,
        status: "local",
        performance: null,
      }
    } catch (error) {
      console.error("خطأ في فحص حالة النشر:", error)
      return {
        isDeployed: false,
        status: "error",
        performance: null,
      }
    }
  }

  /**
   * ⚡ فحص الأداء
   */
  private async checkPerformance(url: string): Promise<any> {
    if (typeof window === "undefined") return null

    try {
      const startTime = Date.now()

      // فحص سرعة الاستجابة
      const response = await fetch(`${url}/api/health`, {
        method: "GET",
        cache: "no-cache",
      }).catch(() => null)

      const responseTime = Date.now() - startTime

      // فحص Core Web Vitals
      const vitals = await this.getCoreWebVitals()

      return {
        responseTime,
        status: response?.status || "unknown",
        vitals,
      }
    } catch (error) {
      console.error("خطأ في فحص الأداء:", error)
      return null
    }
  }

  /**
   * 📊 الحصول على Core Web Vitals
   */
  private async getCoreWebVitals(): Promise<any> {
    if (typeof window === "undefined") return null

    return new Promise((resolve) => {
      const vitals: any = {}

      // First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            vitals.fcp = entry.startTime
          }
        }
      })

      observer.observe({ entryTypes: ["paint"] })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        vitals.lcp = lastEntry.startTime
      })

      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        vitals.cls = clsValue
      })

      clsObserver.observe({ entryTypes: ["layout-shift"] })

      // إرجاع النتائج بعد ثانيتين
      setTimeout(() => {
        resolve(vitals)
      }, 2000)
    })
  }

  /**
   * 📈 تتبع أحداث النشر
   */
  trackDeploymentEvent(event: string, data?: any) {
    if (typeof window !== "undefined" && (window as any).va) {
      ;(window as any).va("track", `deployment_${event}`, {
        timestamp: Date.now(),
        url: window.location.href,
        ...data,
      })
    }
  }
}

// إنشاء instance للاستخدام
export const vercelDeployment = VercelDeployment.getInstance()
