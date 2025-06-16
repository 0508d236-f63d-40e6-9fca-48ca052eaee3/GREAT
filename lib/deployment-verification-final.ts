/**
 * 🔍 نظام التحقق النهائي من النشر
 */

export interface FinalDeploymentCheck {
  siteWorking: boolean
  apiWorking: boolean
  dataLoading: boolean
  staticExportDisabled: boolean
  buildTime: string
  version: string
  issues: string[]
  recommendations: string[]
}

class FinalDeploymentVerification {
  /**
   * 🔍 فحص شامل ونهائي للنشر
   */
  async performFinalCheck(): Promise<FinalDeploymentCheck> {
    console.log("🔍 بدء الفحص النهائي للنشر...")

    const issues: string[] = []
    const recommendations: string[] = []
    let siteWorking = false
    let apiWorking = false
    let dataLoading = false
    let staticExportDisabled = false
    let buildTime = "Unknown"
    let version = "Unknown"

    try {
      // 1. فحص الموقع الرئيسي
      console.log("🌐 فحص الموقع الرئيسي...")
      const siteResponse = await fetch(window.location.origin, {
        cache: "no-cache",
        headers: { "Cache-Control": "no-cache" },
      })

      siteWorking = siteResponse.ok
      if (!siteWorking) {
        issues.push("الموقع الرئيسي لا يعمل")
      }

      // 2. فحص API Health
      console.log("🔍 فحص API Health...")
      try {
        const healthResponse = await fetch(`${window.location.origin}/api/health`, {
          cache: "no-cache",
          headers: { "Cache-Control": "no-cache" },
        })

        if (healthResponse.ok) {
          const healthData = await healthResponse.json()
          apiWorking = true
          staticExportDisabled = healthData.message?.includes("Static Export disabled")
          buildTime = healthData.buildTime || "Unknown"
          version = healthData.version || "Unknown"
          console.log("✅ API Health يعمل:", healthData)
        } else {
          issues.push("API Health لا يعمل")
        }
      } catch (error) {
        issues.push("API Health غير متاح - قد يكون Static Export ما زال مفعل")
      }

      // 3. فحص Deployment Check API
      console.log("📊 فحص Deployment Check...")
      try {
        const deployResponse = await fetch(`${window.location.origin}/api/deployment-check`, {
          cache: "no-cache",
          headers: { "Cache-Control": "no-cache" },
        })

        if (deployResponse.ok) {
          const deployData = await deployResponse.json()
          console.log("✅ Deployment Check يعمل:", deployData)
          staticExportDisabled = deployData.staticExportDisabled
        }
      } catch (error) {
        issues.push("Deployment Check API لا يعمل")
      }

      // 4. فحص تحميل البيانات
      console.log("📊 فحص تحميل البيانات...")
      const html = await siteResponse.text()
      dataLoading = html.includes("GREAT") && html.includes("Token Tracker")

      if (!dataLoading) {
        issues.push("البيانات لا تتحمل في الواجهة")
      }

      // 5. تحليل النتائج وإعطاء توصيات
      if (!apiWorking) {
        recommendations.push("🚨 API Routes لا تعمل - تأكد من إزالة Static Export")
        recommendations.push("🔧 راجع next.config.js وتأكد من عدم وجود output: 'export'")
        recommendations.push("🔄 قم بنشر جديد بعد إصلاح الإعدادات")
      }

      if (!staticExportDisabled) {
        recommendations.push("⚠️ Static Export قد يكون ما زال مفعل")
        recommendations.push("🔍 تحقق من جميع ملفات الإعدادات")
      }

      if (apiWorking && dataLoading) {
        recommendations.push("✅ النشر يعمل بشكل صحيح!")
        recommendations.push("🎉 جميع الوظائف تعمل كما هو متوقع")
      }
    } catch (error) {
      issues.push(`خطأ في الفحص: ${error}`)
      recommendations.push("🔄 أعد المحاولة أو تحقق من الاتصال بالإنترنت")
    }

    return {
      siteWorking,
      apiWorking,
      dataLoading,
      staticExportDisabled,
      buildTime,
      version,
      issues,
      recommendations,
    }
  }

  /**
   * 🎯 فحص سريع للتأكد من حل المشكلة
   */
  async quickCheck(): Promise<{ isFixed: boolean; message: string }> {
    try {
      const healthResponse = await fetch(`${window.location.origin}/api/health`, {
        cache: "no-cache",
      })

      if (healthResponse.ok) {
        const data = await healthResponse.json()
        return {
          isFixed: true,
          message: `✅ المشكلة محلولة! API يعمل. Build: ${data.buildTime}`,
        }
      } else {
        return {
          isFixed: false,
          message: "❌ API لا يعمل - Static Export قد يكون ما زال مفعل",
        }
      }
    } catch (error) {
      return {
        isFixed: false,
        message: "❌ لا يمكن الوصول للـ API - المشكلة لم تحل بعد",
      }
    }
  }
}

export const finalDeploymentVerification = new FinalDeploymentVerification()
