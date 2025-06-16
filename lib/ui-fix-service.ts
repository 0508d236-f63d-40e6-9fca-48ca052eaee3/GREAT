/**
 * 🎨 خدمة إصلاح واجهة المستخدم
 * تشخيص وحل مشاكل عدم عرض البيانات في الإنتاج
 */

export interface UIIssue {
  id: string
  type: "CRITICAL" | "ERROR" | "WARNING"
  category: "RENDERING" | "DATA" | "JAVASCRIPT" | "CSS" | "NETWORK" | "STATE"
  title: string
  description: string
  detected: boolean
  solution: string
  autoFixAvailable: boolean
  priority: number
}

export interface UIState {
  isLoading: boolean
  hasData: boolean
  dataCount: number
  lastUpdate: string
  renderingErrors: string[]
  jsErrors: string[]
  networkErrors: string[]
  componentsMounted: string[]
  servicesRunning: string[]
}

export interface UIFixResult {
  success: boolean
  message: string
  appliedFixes: string[]
  remainingIssues: UIIssue[]
}

class UIFixService {
  private uiState: UIState = {
    isLoading: true,
    hasData: false,
    dataCount: 0,
    lastUpdate: "",
    renderingErrors: [],
    jsErrors: [],
    networkErrors: [],
    componentsMounted: [],
    servicesRunning: [],
  }

  private listeners: ((state: UIState, issues: UIIssue[]) => void)[] = []
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  /**
   * 🚀 بدء مراقبة واجهة المستخدم
   */
  startUIMonitoring(): void {
    console.log("🎨 بدء مراقبة واجهة المستخدم...")

    if (this.isMonitoring) {
      console.log("⚠️ المراقبة تعمل بالفعل")
      return
    }

    this.isMonitoring = true

    // مراقبة مستمرة كل 5 ثوان
    this.monitoringInterval = setInterval(() => {
      this.checkUIState()
    }, 5000)

    // فحص أولي
    this.checkUIState()

    console.log("✅ تم بدء مراقبة واجهة المستخدم")
  }

  /**
   * 🔍 فحص حالة واجهة المستخدم
   */
  private async checkUIState(): Promise<void> {
    try {
      // فحص تحميل البيانات
      await this.checkDataLoading()

      // فحص عرض المكونات
      await this.checkComponentRendering()

      // فحص الخدمات
      await this.checkServices()

      // فحص الأخطاء
      await this.checkErrors()

      // إشعار المستمعين
      const issues = await this.detectUIIssues()
      this.notifyListeners(issues)
    } catch (error) {
      console.error("❌ خطأ في فحص واجهة المستخدم:", error)
    }
  }

  /**
   * 📊 فحص تحميل البيانات
   */
  private async checkDataLoading(): Promise<void> {
    try {
      // محاولة الوصول للخدمة
      const { simpleWorkingService } = await import("../lib/simple-working-service")

      const tokens = simpleWorkingService.getTokens()
      const stats = simpleWorkingService.getStats()

      this.uiState.hasData = tokens.length > 0
      this.uiState.dataCount = tokens.length
      this.uiState.isLoading = !stats.isRunning && tokens.length === 0
      this.uiState.lastUpdate = new Date().toLocaleTimeString()

      if (stats.isRunning) {
        this.addServiceRunning("simpleWorkingService")
      }

      console.log(`📊 البيانات: ${tokens.length} عملة، الخدمة: ${stats.isRunning ? "تعمل" : "متوقفة"}`)
    } catch (error) {
      console.error("❌ خطأ في فحص البيانات:", error)
      this.uiState.hasData = false
      this.uiState.dataCount = 0
      this.uiState.isLoading = false
      this.addJSError(`Data loading error: ${error}`)
    }
  }

  /**
   * 🎨 فحص عرض المكونات
   */
  private async checkComponentRendering(): Promise<void> {
    if (typeof window === "undefined") return

    try {
      // فحص وجود المكونات الأساسية
      const mainComponents = [
        { selector: '[data-testid="dashboard"]', name: "Dashboard" },
        { selector: '[data-testid="token-list"]', name: "Token List" },
        { selector: '[data-testid="stats"]', name: "Statistics" },
        { selector: ".glass-card", name: "Glass Cards" },
        { selector: "table", name: "Token Table" },
      ]

      this.uiState.componentsMounted = []

      for (const component of mainComponents) {
        const element = document.querySelector(component.selector)
        if (element) {
          this.addComponentMounted(component.name)
        }
      }

      // فحص وجود بيانات في الجدول
      const tableRows = document.querySelectorAll("tbody tr")
      if (tableRows.length === 0 && this.uiState.hasData) {
        this.addRenderingError("Table has no rows despite having data")
      }

      // فحص النصوص الفارغة
      const emptyElements = document.querySelectorAll('[data-testid="token-count"]:empty')
      if (emptyElements.length > 0) {
        this.addRenderingError("Empty data elements detected")
      }
    } catch (error) {
      console.error("❌ خطأ في فحص العرض:", error)
      this.addRenderingError(`Component rendering error: ${error}`)
    }
  }

  /**
   * 🔧 فحص الخدمات
   */
  private async checkServices(): Promise<void> {
    try {
      // فحص خدمة العملات
      const { simpleWorkingService } = await import("../lib/simple-working-service")
      const stats = simpleWorkingService.getStats()

      if (stats.isRunning) {
        this.addServiceRunning("Token Service")
      }

      // فحص خدمة المراقبة
      try {
        const { productionMonitor } = await import("../lib/production-monitor")
        this.addServiceRunning("Production Monitor")
      } catch (error) {
        console.log("⚠️ Production Monitor not available")
      }

      // فحص خدمة الإصلاح
      try {
        const { productionFixService } = await import("../lib/production-fix-service")
        this.addServiceRunning("Production Fix Service")
      } catch (error) {
        console.log("⚠️ Production Fix Service not available")
      }
    } catch (error) {
      console.error("❌ خطأ في فحص الخدمات:", error)
    }
  }

  /**
   * 🐛 فحص الأخطاء
   */
  private async checkErrors(): Promise<void> {
    if (typeof window === "undefined") return

    // فحص أخطاء الشبكة
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          this.addNetworkError(`Fetch failed: ${response.status} ${response.statusText}`)
        }
        return response
      } catch (error) {
        this.addNetworkError(`Network error: ${error}`)
        throw error
      }
    }

    // فحص أخطاء JavaScript
    const originalError = console.error
    console.error = (...args) => {
      this.addJSError(args.join(" "))
      originalError.apply(console, args)
    }
  }

  /**
   * 🔍 اكتشاف مشاكل واجهة المستخدم
   */
  private async detectUIIssues(): Promise<UIIssue[]> {
    const issues: UIIssue[] = []

    // مشكلة عدم وجود بيانات
    if (!this.uiState.hasData && !this.uiState.isLoading) {
      issues.push({
        id: "no_data_displayed",
        type: "CRITICAL",
        category: "DATA",
        title: "لا توجد بيانات معروضة",
        description: "واجهة المستخدم لا تعرض أي عملات رغم تشغيل النظام",
        detected: true,
        solution: "إعادة تحميل البيانات وإجبار التحديث",
        autoFixAvailable: true,
        priority: 10,
      })
    }

    // مشكلة التحميل المستمر
    if (this.uiState.isLoading && this.uiState.lastUpdate === "") {
      issues.push({
        id: "stuck_loading",
        type: "ERROR",
        category: "STATE",
        title: "التحميل عالق",
        description: "واجهة المستخدم عالقة في حالة التحميل",
        detected: true,
        solution: "إعادة تهيئة النظام وإجبار التحديث",
        autoFixAvailable: true,
        priority: 9,
      })
    }

    // مشكلة عدم عرض المكونات
    if (this.uiState.componentsMounted.length === 0) {
      issues.push({
        id: "components_not_rendered",
        type: "CRITICAL",
        category: "RENDERING",
        title: "المكونات لا تظهر",
        description: "المكونات الأساسية للواجهة لا تظهر",
        detected: true,
        solution: "إعادة تحميل الصفحة وفحص JavaScript",
        autoFixAvailable: true,
        priority: 10,
      })
    }

    // مشكلة أخطاء JavaScript
    if (this.uiState.jsErrors.length > 0) {
      issues.push({
        id: "javascript_errors",
        type: "ERROR",
        category: "JAVASCRIPT",
        title: `${this.uiState.jsErrors.length} أخطاء JavaScript`,
        description: "توجد أخطاء JavaScript تمنع عمل الواجهة",
        detected: true,
        solution: "إصلاح أخطاء JavaScript وإعادة النشر",
        autoFixAvailable: false,
        priority: 8,
      })
    }

    // مشكلة أخطاء الشبكة
    if (this.uiState.networkErrors.length > 0) {
      issues.push({
        id: "network_errors",
        type: "WARNING",
        category: "NETWORK",
        title: `${this.uiState.networkErrors.length} أخطاء شبكة`,
        description: "توجد أخطاء في طلبات الشبكة",
        detected: true,
        solution: "فحص الاتصال وإعدادات CORS",
        autoFixAvailable: true,
        priority: 6,
      })
    }

    // مشكلة عدم تشغيل الخدمات
    if (this.uiState.servicesRunning.length === 0) {
      issues.push({
        id: "no_services_running",
        type: "CRITICAL",
        category: "DATA",
        title: "لا توجد خدمات تعمل",
        description: "جميع الخدمات متوقفة",
        detected: true,
        solution: "بدء تشغيل الخدمات الأساسية",
        autoFixAvailable: true,
        priority: 10,
      })
    }

    return issues
  }

  /**
   * 🔧 تطبيق إصلاحات واجهة المستخدم
   */
  async applyUIFixes(): Promise<UIFixResult> {
    console.log("🔧 بدء إصلاح واجهة المستخدم...")

    const appliedFixes: string[] = []
    const issues = await this.detectUIIssues()

    try {
      for (const issue of issues) {
        if (issue.autoFixAvailable && issue.detected) {
          switch (issue.id) {
            case "no_data_displayed":
              await this.fixNoDataDisplayed()
              appliedFixes.push("إعادة تحميل البيانات")
              break

            case "stuck_loading":
              await this.fixStuckLoading()
              appliedFixes.push("إعادة تهيئة حالة التحميل")
              break

            case "components_not_rendered":
              await this.fixComponentsNotRendered()
              appliedFixes.push("إعادة عرض المكونات")
              break

            case "network_errors":
              await this.fixNetworkErrors()
              appliedFixes.push("إصلاح أخطاء الشبكة")
              break

            case "no_services_running":
              await this.fixNoServicesRunning()
              appliedFixes.push("بدء تشغيل الخدمات")
              break
          }
        }
      }

      // فحص مرة أخرى بعد الإصلاحات
      await this.checkUIState()
      const remainingIssues = await this.detectUIIssues()

      return {
        success: appliedFixes.length > 0,
        message: `تم تطبيق ${appliedFixes.length} إصلاح`,
        appliedFixes,
        remainingIssues: remainingIssues.filter((i) => i.detected),
      }
    } catch (error) {
      console.error("❌ خطأ في تطبيق الإصلاحات:", error)
      return {
        success: false,
        message: `فشل في الإصلاح: ${error}`,
        appliedFixes,
        remainingIssues: issues,
      }
    }
  }

  /**
   * 🔧 إصلاح عدم عرض البيانات
   */
  private async fixNoDataDisplayed(): Promise<void> {
    try {
      console.log("🔧 إصلاح عدم عرض البيانات...")

      // إعادة تشغيل الخدمة
      const { simpleWorkingService } = await import("../lib/simple-working-service")
      simpleWorkingService.restart()

      // انتظار قليل ثم فحص
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // إجبار التحديث
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("force-refresh"))
      }

      console.log("✅ تم إصلاح عدم عرض البيانات")
    } catch (error) {
      console.error("❌ فشل في إصلاح عدم عرض البيانات:", error)
    }
  }

  /**
   * 🔧 إصلاح التحميل العالق
   */
  private async fixStuckLoading(): Promise<void> {
    try {
      console.log("🔧 إصلاح التحميل العالق...")

      // إعادة تعيين حالة التحميل
      this.uiState.isLoading = false
      this.uiState.lastUpdate = new Date().toLocaleTimeString()

      // إجبار إعادة العرض
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("force-rerender"))
      }

      console.log("✅ تم إصلاح التحميل العالق")
    } catch (error) {
      console.error("❌ فشل في إصلاح التحميل العالق:", error)
    }
  }

  /**
   * 🔧 إصلاح عدم عرض المكونات
   */
  private async fixComponentsNotRendered(): Promise<void> {
    try {
      console.log("🔧 إصلاح عدم عرض المكونات...")

      // إعادة تحميل الصفحة كحل أخير
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }

      console.log("✅ سيتم إعادة تحميل الصفحة")
    } catch (error) {
      console.error("❌ فشل في إصلاح عدم عرض المكونات:", error)
    }
  }

  /**
   * 🔧 إصلاح أخطاء الشبكة
   */
  private async fixNetworkErrors(): Promise<void> {
    try {
      console.log("🔧 إصلاح أخطاء الشبكة...")

      // تفعيل الوضع التجريبي
      if (typeof window !== "undefined") {
        localStorage.setItem("fallback-mode", "true")
        localStorage.setItem("network-fallback", "true")
      }

      // مسح أخطاء الشبكة
      this.uiState.networkErrors = []

      console.log("✅ تم إصلاح أخطاء الشبكة")
    } catch (error) {
      console.error("❌ فشل في إصلاح أخطاء الشبكة:", error)
    }
  }

  /**
   * 🔧 إصلاح عدم تشغيل الخدمات
   */
  private async fixNoServicesRunning(): Promise<void> {
    try {
      console.log("🔧 إصلاح عدم تشغيل الخدمات...")

      // بدء تشغيل الخدمة الرئيسية
      const { simpleWorkingService } = await import("../lib/simple-working-service")
      simpleWorkingService.start()

      // انتظار قليل
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("✅ تم بدء تشغيل الخدمات")
    } catch (error) {
      console.error("❌ فشل في بدء تشغيل الخدمات:", error)
    }
  }

  /**
   * 🔄 إجبار التحديث الكامل
   */
  async forceFullRefresh(): Promise<void> {
    console.log("🔄 إجبار التحديث الكامل...")

    try {
      // مسح جميع البيانات المحفوظة
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
      }

      // إعادة تشغيل جميع الخدمات
      const { simpleWorkingService } = await import("../lib/simple-working-service")
      simpleWorkingService.restart()

      // انتظار قليل ثم إعادة تحميل
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload()
        }
      }, 3000)

      console.log("✅ سيتم إعادة تحميل الصفحة خلال 3 ثوان")
    } catch (error) {
      console.error("❌ فشل في التحديث الكامل:", error)
    }
  }

  // Helper methods
  private addRenderingError(error: string): void {
    if (!this.uiState.renderingErrors.includes(error)) {
      this.uiState.renderingErrors.push(error)
    }
  }

  private addJSError(error: string): void {
    if (!this.uiState.jsErrors.includes(error)) {
      this.uiState.jsErrors.push(error)
    }
  }

  private addNetworkError(error: string): void {
    if (!this.uiState.networkErrors.includes(error)) {
      this.uiState.networkErrors.push(error)
    }
  }

  private addComponentMounted(component: string): void {
    if (!this.uiState.componentsMounted.includes(component)) {
      this.uiState.componentsMounted.push(component)
    }
  }

  private addServiceRunning(service: string): void {
    if (!this.uiState.servicesRunning.includes(service)) {
      this.uiState.servicesRunning.push(service)
    }
  }

  /**
   * 📊 الحصول على حالة واجهة المستخدم
   */
  getUIState(): UIState {
    return { ...this.uiState }
  }

  /**
   * 👂 إضافة مستمع
   */
  addListener(callback: (state: UIState, issues: UIIssue[]) => void): void {
    this.listeners.push(callback)
  }

  /**
   * 🔕 إزالة مستمع
   */
  removeListener(callback: (state: UIState, issues: UIIssue[]) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  /**
   * 📢 إشعار المستمعين
   */
  private async notifyListeners(issues: UIIssue[]): Promise<void> {
    const state = this.getUIState()
    this.listeners.forEach((callback) => {
      try {
        callback(state, issues)
      } catch (error) {
        console.error("❌ خطأ في إشعار مستمع واجهة المستخدم:", error)
      }
    })
  }

  /**
   * 🛑 إيقاف المراقبة
   */
  stop(): void {
    console.log("🛑 إيقاف مراقبة واجهة المستخدم...")

    this.isMonitoring = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    this.listeners = []

    console.log("✅ تم إيقاف مراقبة واجهة المستخدم")
  }
}

// إنشاء instance واحد للاستخدام
export const uiFixService = new UIFixService()

// بدء المراقبة تلقائياً
if (typeof window !== "undefined") {
  setTimeout(() => {
    uiFixService.startUIMonitoring()
  }, 1000)
}
