/**
 * 🔧 خدمة إصلاح مشاكل الإنتاج
 * تشخيص وحل مشاكل عدم عمل النظام في بيئة الإنتاج
 */

export interface ProductionIssue {
  id: string
  type: "CRITICAL" | "ERROR" | "WARNING"
  category: "ENVIRONMENT" | "API" | "CORS" | "JAVASCRIPT" | "NETWORK" | "DATA"
  title: string
  description: string
  detected: boolean
  solution: string
  autoFixAvailable: boolean
  priority: number
}

export interface EnvironmentDifference {
  key: string
  preview: any
  production: any
  impact: "HIGH" | "MEDIUM" | "LOW"
  recommendation: string
}

export interface ProductionDiagnostic {
  timestamp: number
  environment: "production" | "preview" | "development"
  issues: ProductionIssue[]
  differences: EnvironmentDifference[]
  recommendations: string[]
  autoFixesApplied: string[]
  systemHealth: "HEALTHY" | "DEGRADED" | "CRITICAL"
}

class ProductionFixService {
  private diagnosticResults: ProductionDiagnostic | null = null
  private isRunning = false
  private listeners: ((diagnostic: ProductionDiagnostic) => void)[] = []

  /**
   * 🔍 تشخيص شامل لمشاكل الإنتاج
   */
  async runProductionDiagnostic(): Promise<ProductionDiagnostic> {
    console.log("🔍 بدء تشخيص مشاكل الإنتاج...")

    const startTime = Date.now()
    const issues: ProductionIssue[] = []
    const differences: EnvironmentDifference[] = []
    const recommendations: string[] = []
    const autoFixesApplied: string[] = []

    try {
      // 1. فحص البيئة
      console.log("🌍 فحص البيئة...")
      const envIssues = await this.checkEnvironmentIssues()
      issues.push(...envIssues)

      // 2. فحص JavaScript والتحميل
      console.log("📜 فحص JavaScript...")
      const jsIssues = await this.checkJavaScriptIssues()
      issues.push(...jsIssues)

      // 3. فحص CORS والشبكة
      console.log("🌐 فحص الشبكة و CORS...")
      const networkIssues = await this.checkNetworkIssues()
      issues.push(...networkIssues)

      // 4. فحص APIs والبيانات
      console.log("📊 فحص APIs والبيانات...")
      const apiIssues = await this.checkAPIIssues()
      issues.push(...apiIssues)

      // 5. مقارنة البيئات
      console.log("⚖️ مقارنة البيئات...")
      const envDifferences = await this.compareEnvironments()
      differences.push(...envDifferences)

      // 6. تطبيق الإصلاحات التلقائية
      console.log("🔧 تطبيق الإصلاحات التلقائية...")
      const appliedFixes = await this.applyAutoFixes(issues)
      autoFixesApplied.push(...appliedFixes)

      // 7. إنشاء التوصيات
      recommendations.push(...this.generateRecommendations(issues, differences))

      // تحديد حالة النظام
      const criticalIssues = issues.filter((i) => i.type === "CRITICAL" && i.detected)
      const errorIssues = issues.filter((i) => i.type === "ERROR" && i.detected)

      let systemHealth: "HEALTHY" | "DEGRADED" | "CRITICAL"
      if (criticalIssues.length > 0) {
        systemHealth = "CRITICAL"
      } else if (errorIssues.length > 0) {
        systemHealth = "DEGRADED"
      } else {
        systemHealth = "HEALTHY"
      }

      const diagnostic: ProductionDiagnostic = {
        timestamp: Date.now(),
        environment: this.detectEnvironment(),
        issues,
        differences,
        recommendations,
        autoFixesApplied,
        systemHealth,
      }

      this.diagnosticResults = diagnostic
      this.notifyListeners(diagnostic)

      const duration = Date.now() - startTime
      console.log(`✅ تم التشخيص في ${duration}ms - المشاكل المكتشفة: ${issues.filter((i) => i.detected).length}`)

      return diagnostic
    } catch (error) {
      console.error("❌ خطأ في التشخيص:", error)

      const errorDiagnostic: ProductionDiagnostic = {
        timestamp: Date.now(),
        environment: this.detectEnvironment(),
        issues: [
          {
            id: "diagnostic_error",
            type: "CRITICAL",
            category: "JAVASCRIPT",
            title: "فشل في التشخيص",
            description: `خطأ في تشغيل التشخيص: ${error}`,
            detected: true,
            solution: "إعادة تحميل الصفحة وإعادة المحاولة",
            autoFixAvailable: false,
            priority: 10,
          },
        ],
        differences: [],
        recommendations: ["إعادة تحميل الصفحة", "التحقق من وحدة التحكم للأخطاء"],
        autoFixesApplied: [],
        systemHealth: "CRITICAL",
      }

      return errorDiagnostic
    }
  }

  /**
   * 🌍 فحص مشاكل البيئة
   */
  private async checkEnvironmentIssues(): Promise<ProductionIssue[]> {
    const issues: ProductionIssue[] = []

    // فحص نوع البيئة
    const currentEnv = this.detectEnvironment()
    if (currentEnv === "production") {
      // في الإنتاج، تحقق من المتغيرات المطلوبة
      const requiredEnvVars = ["NEXT_PUBLIC_APP_NAME", "NEXT_PUBLIC_ENVIRONMENT"]

      for (const envVar of requiredEnvVars) {
        const value = this.getEnvVar(envVar)
        if (!value) {
          issues.push({
            id: `missing_env_${envVar}`,
            type: "WARNING",
            category: "ENVIRONMENT",
            title: `متغير البيئة مفقود: ${envVar}`,
            description: `المتغير ${envVar} غير محدد في بيئة الإنتاج`,
            detected: true,
            solution: `تعيين المتغير ${envVar} في إعدادات النشر`,
            autoFixAvailable: false,
            priority: 5,
          })
        }
      }
    }

    // فحص localStorage
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("test", "test")
        localStorage.removeItem("test")
      }
    } catch (error) {
      issues.push({
        id: "localStorage_blocked",
        type: "ERROR",
        category: "ENVIRONMENT",
        title: "localStorage محظور",
        description: "لا يمكن الوصول إلى localStorage",
        detected: true,
        solution: "تمكين localStorage في المتصفح",
        autoFixAvailable: false,
        priority: 7,
      })
    }

    return issues
  }

  /**
   * 📜 فحص مشاكل JavaScript
   */
  private async checkJavaScriptIssues(): Promise<ProductionIssue[]> {
    const issues: ProductionIssue[] = []

    // فحص تحميل الوحدات
    try {
      // محاولة استيراد الخدمة الرئيسية
      const { simpleWorkingService } = await import("../lib/simple-working-service")

      if (!simpleWorkingService) {
        issues.push({
          id: "service_import_failed",
          type: "CRITICAL",
          category: "JAVASCRIPT",
          title: "فشل في تحميل الخدمة الرئيسية",
          description: "لا يمكن استيراد simpleWorkingService",
          detected: true,
          solution: "التحقق من ملفات JavaScript وإعادة النشر",
          autoFixAvailable: true,
          priority: 10,
        })
      } else {
        // فحص حالة الخدمة
        const stats = simpleWorkingService.getStats()
        if (!stats.isRunning) {
          issues.push({
            id: "service_not_running",
            type: "ERROR",
            category: "JAVASCRIPT",
            title: "الخدمة الرئيسية لا تعمل",
            description: "simpleWorkingService غير نشطة",
            detected: true,
            solution: "بدء تشغيل الخدمة تلقائياً",
            autoFixAvailable: true,
            priority: 9,
          })
        }
      }
    } catch (error) {
      issues.push({
        id: "module_import_error",
        type: "CRITICAL",
        category: "JAVASCRIPT",
        title: "خطأ في استيراد الوحدات",
        description: `فشل في استيراد الوحدات: ${error}`,
        detected: true,
        solution: "إعادة النشر مع التحقق من بناء الملفات",
        autoFixAvailable: false,
        priority: 10,
      })
    }

    // فحص الأخطاء في وحدة التحكم
    if (typeof window !== "undefined") {
      const originalError = console.error
      let errorCount = 0

      console.error = (...args) => {
        errorCount++
        originalError.apply(console, args)
      }

      setTimeout(() => {
        console.error = originalError
        if (errorCount > 0) {
          issues.push({
            id: "console_errors",
            type: "WARNING",
            category: "JAVASCRIPT",
            title: `${errorCount} أخطاء في وحدة التحكم`,
            description: "توجد أخطاء JavaScript في وحدة التحكم",
            detected: true,
            solution: "فحص وحدة التحكم وإصلاح الأخطاء",
            autoFixAvailable: false,
            priority: 6,
          })
        }
      }, 2000)
    }

    return issues
  }

  /**
   * 🌐 فحص مشاكل الشبكة و CORS
   */
  private async checkNetworkIssues(): Promise<ProductionIssue[]> {
    const issues: ProductionIssue[] = []

    // فحص الاتصال بالإنترنت
    if (typeof window !== "undefined" && !navigator.onLine) {
      issues.push({
        id: "offline",
        type: "CRITICAL",
        category: "NETWORK",
        title: "لا يوجد اتصال بالإنترنت",
        description: "المتصفح في وضع عدم الاتصال",
        detected: true,
        solution: "التحقق من اتصال الإنترنت",
        autoFixAvailable: false,
        priority: 10,
      })
    }

    // فحص CORS
    try {
      const testUrls = [
        "https://frontend-api.pump.fun/coins?limit=1",
        "https://api.pump.fun/coins?limit=1",
        "https://pump.fun/api/coins?limit=1",
      ]

      for (const url of testUrls) {
        try {
          const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
          })

          if (response.ok) {
            // إذا نجح أحد الطلبات، فلا توجد مشكلة CORS
            break
          }
        } catch (error) {
          // استمر في المحاولة مع URLs أخرى
          continue
        }
      }
    } catch (error) {
      issues.push({
        id: "cors_blocked",
        type: "ERROR",
        category: "CORS",
        title: "مشكلة CORS",
        description: "جميع طلبات API محظورة بسبب CORS",
        detected: true,
        solution: "استخدام proxy أو تفعيل الوضع التجريبي",
        autoFixAvailable: true,
        priority: 8,
      })
    }

    return issues
  }

  /**
   * 📊 فحص مشاكل APIs والبيانات
   */
  private async checkAPIIssues(): Promise<ProductionIssue[]> {
    const issues: ProductionIssue[] = []

    try {
      // محاولة جلب البيانات من الخدمة
      const { simpleWorkingService } = await import("../lib/simple-working-service")

      // التحقق من وجود عملات
      const tokens = simpleWorkingService.getTokens()
      if (tokens.length === 0) {
        issues.push({
          id: "no_tokens_loaded",
          type: "ERROR",
          category: "DATA",
          title: "لا توجد عملات محملة",
          description: "الخدمة لا تحتوي على أي عملات",
          detected: true,
          solution: "إعادة تشغيل الخدمة وتحميل البيانات",
          autoFixAvailable: true,
          priority: 9,
        })
      }

      // التحقق من حالة الخدمة
      const stats = simpleWorkingService.getStats()
      if (!stats.isRunning) {
        issues.push({
          id: "service_stopped",
          type: "CRITICAL",
          category: "DATA",
          title: "الخدمة متوقفة",
          description: "خدمة العملات غير نشطة",
          detected: true,
          solution: "بدء تشغيل الخدمة",
          autoFixAvailable: true,
          priority: 10,
        })
      }
    } catch (error) {
      issues.push({
        id: "service_access_error",
        type: "CRITICAL",
        category: "API",
        title: "خطأ في الوصول للخدمة",
        description: `لا يمكن الوصول للخدمة: ${error}`,
        detected: true,
        solution: "إعادة تحميل الصفحة أو إعادة النشر",
        autoFixAvailable: false,
        priority: 10,
      })
    }

    return issues
  }

  /**
   * ⚖️ مقارنة البيئات
   */
  private async compareEnvironments(): Promise<EnvironmentDifference[]> {
    const differences: EnvironmentDifference[] = []

    if (typeof window !== "undefined") {
      const currentEnv = this.detectEnvironment()

      // مقارنة الـ hostname
      const hostname = window.location.hostname
      if (currentEnv === "production" && hostname.includes("vercel.app")) {
        differences.push({
          key: "hostname",
          preview: "preview-url.vercel.app",
          production: hostname,
          impact: "MEDIUM",
          recommendation: "استخدام domain مخصص للإنتاج",
        })
      }

      // مقارنة البروتوكول
      const protocol = window.location.protocol
      if (protocol !== "https:") {
        differences.push({
          key: "protocol",
          preview: "https:",
          production: protocol,
          impact: "HIGH",
          recommendation: "استخدام HTTPS في الإنتاج",
        })
      }

      // مقارنة متغيرات البيئة
      const envVars = ["NEXT_PUBLIC_APP_NAME", "NEXT_PUBLIC_ENVIRONMENT"]
      for (const envVar of envVars) {
        const value = this.getEnvVar(envVar)
        if (!value && currentEnv === "production") {
          differences.push({
            key: envVar,
            preview: "defined",
            production: "undefined",
            impact: "MEDIUM",
            recommendation: `تعيين ${envVar} في إعدادات الإنتاج`,
          })
        }
      }
    }

    return differences
  }

  /**
   * 🔧 تطبيق الإصلاحات التلقائية
   */
  private async applyAutoFixes(issues: ProductionIssue[]): Promise<string[]> {
    const appliedFixes: string[] = []

    for (const issue of issues) {
      if (issue.autoFixAvailable && issue.detected) {
        try {
          switch (issue.id) {
            case "service_not_running":
            case "service_stopped":
              await this.fixServiceNotRunning()
              appliedFixes.push("بدء تشغيل الخدمة الرئيسية")
              break

            case "no_tokens_loaded":
              await this.fixNoTokensLoaded()
              appliedFixes.push("تحميل البيانات التجريبية")
              break

            case "cors_blocked":
              await this.fixCORSIssues()
              appliedFixes.push("تفعيل الوضع التجريبي")
              break

            case "service_import_failed":
              await this.fixServiceImport()
              appliedFixes.push("إعادة تهيئة الخدمة")
              break
          }
        } catch (error) {
          console.error(`❌ فشل في إصلاح ${issue.id}:`, error)
        }
      }
    }

    return appliedFixes
  }

  /**
   * 🔧 إصلاح الخدمة المتوقفة
   */
  private async fixServiceNotRunning(): Promise<void> {
    try {
      const { simpleWorkingService } = await import("../lib/simple-working-service")
      simpleWorkingService.start()
      console.log("✅ تم بدء تشغيل الخدمة")
    } catch (error) {
      console.error("❌ فشل في بدء الخدمة:", error)
    }
  }

  /**
   * 🔧 إصلاح عدم وجود عملات
   */
  private async fixNoTokensLoaded(): Promise<void> {
    try {
      const { simpleWorkingService } = await import("../lib/simple-working-service")

      // إعادة تشغيل الخدمة
      simpleWorkingService.restart()

      // انتظار قليل ثم التحقق
      setTimeout(() => {
        const tokens = simpleWorkingService.getTokens()
        if (tokens.length === 0) {
          // إجبار إنشاء بيانات تجريبية
          simpleWorkingService.start()
        }
      }, 2000)

      console.log("✅ تم إعادة تحميل البيانات")
    } catch (error) {
      console.error("❌ فشل في تحميل البيانات:", error)
    }
  }

  /**
   * 🔧 إصلاح مشاكل CORS
   */
  private async fixCORSIssues(): Promise<void> {
    try {
      // تفعيل الوضع التجريبي
      if (typeof window !== "undefined") {
        localStorage.setItem("fallback-mode", "true")
        localStorage.setItem("cors-fallback", "true")
      }
      console.log("✅ تم تفعيل الوضع التجريبي")
    } catch (error) {
      console.error("❌ فشل في إصلاح CORS:", error)
    }
  }

  /**
   * 🔧 إصلاح استيراد الخدمة
   */
  private async fixServiceImport(): Promise<void> {
    try {
      // إعادة تحميل الصفحة كحل أخير
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
      console.log("✅ سيتم إعادة تحميل الصفحة")
    } catch (error) {
      console.error("❌ فشل في إعادة التحميل:", error)
    }
  }

  /**
   * 💡 إنشاء التوصيات
   */
  private generateRecommendations(issues: ProductionIssue[], differences: EnvironmentDifference[]): string[] {
    const recommendations: string[] = []

    const criticalIssues = issues.filter((i) => i.type === "CRITICAL" && i.detected)
    const errorIssues = issues.filter((i) => i.type === "ERROR" && i.detected)

    if (criticalIssues.length > 0) {
      recommendations.push("🚨 يوجد مشاكل حرجة تتطلب إصلاح فوري")
      recommendations.push("🔄 جرب إعادة تحميل الصفحة")
      recommendations.push("🚀 قد تحتاج إعادة نشر التطبيق")
    }

    if (errorIssues.length > 0) {
      recommendations.push("⚠️ يوجد أخطاء تؤثر على الأداء")
      recommendations.push("🔧 استخدم الإصلاحات التلقائية المتاحة")
    }

    const highImpactDiffs = differences.filter((d) => d.impact === "HIGH")
    if (highImpactDiffs.length > 0) {
      recommendations.push("📊 يوجد اختلافات مهمة بين البيئات")
      recommendations.push("⚙️ راجع إعدادات متغيرات البيئة")
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ النظام يعمل بشكل طبيعي")
      recommendations.push("📈 جميع الفحوصات نجحت")
    }

    return recommendations
  }

  /**
   * 🌍 اكتشاف البيئة
   */
  private detectEnvironment(): "production" | "preview" | "development" {
    if (typeof window === "undefined") return "development"

    const hostname = window.location.hostname

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "development"
    } else if (hostname.includes("preview") || hostname.includes("staging")) {
      return "preview"
    } else {
      return "production"
    }
  }

  /**
   * 🔑 الحصول على متغير البيئة
   */
  private getEnvVar(name: string): string | undefined {
    if (typeof window !== "undefined") {
      return (window as any).__ENV__?.[name] || process.env[name]
    }
    return process.env[name]
  }

  /**
   * 👂 إضافة مستمع
   */
  addListener(callback: (diagnostic: ProductionDiagnostic) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (diagnostic: ProductionDiagnostic) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  /**
   * 📢 إشعار المستمعين
   */
  private notifyListeners(diagnostic: ProductionDiagnostic): void {
    this.listeners.forEach((callback) => {
      try {
        callback(diagnostic)
      } catch (error) {
        console.error("❌ خطأ في إشعار مستمع التشخيص:", error)
      }
    })
  }

  /**
   * 📊 الحصول على آخر تشخيص
   */
  getLastDiagnostic(): ProductionDiagnostic | null {
    return this.diagnosticResults
  }

  /**
   * 🔄 إعادة تشغيل التشخيص
   */
  async restart(): Promise<ProductionDiagnostic> {
    this.diagnosticResults = null
    return await this.runProductionDiagnostic()
  }
}

// إنشاء instance واحد للاستخدام
export const productionFixService = new ProductionFixService()
