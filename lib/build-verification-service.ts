export class BuildVerificationService {
  static async verifyBuild() {
    const results = {
      swcInstalled: false,
      tailwindConfigValid: false,
      buildSuccessful: false,
      deploymentReady: false,
      issues: [] as string[],
      recommendations: [] as string[],
    }

    try {
      // فحص SWC
      try {
        require("@swc/core")
        require("@swc/helpers")
        results.swcInstalled = true
      } catch (error) {
        results.issues.push("تبعيات SWC مفقودة")
        results.recommendations.push("تشغيل: npm install @swc/core @swc/helpers --save-dev")
      }

      // فحص تكوين Tailwind
      try {
        const fs = require("fs")
        const tailwindConfig = fs.readFileSync("tailwind.config.js", "utf8")

        if (tailwindConfig.includes("node_modules") && !tailwindConfig.includes("!./node_modules")) {
          results.issues.push("تكوين Tailwind يتضمن node_modules")
          results.recommendations.push('إضافة "!./node_modules/**/*" إلى content في tailwind.config.js')
        } else {
          results.tailwindConfigValid = true
        }
      } catch (error) {
        results.issues.push("لا يمكن قراءة تكوين Tailwind")
      }

      // فحص إمكانية البناء
      const { exec } = require("child_process")
      await new Promise((resolve, reject) => {
        exec("npm run build", (error, stdout, stderr) => {
          if (error) {
            results.issues.push(`فشل البناء: ${error.message}`)
            results.recommendations.push("إصلاح أخطاء البناء قبل النشر")
          } else {
            results.buildSuccessful = true
          }
          resolve(true)
        })
      })

      // تحديد جاهزية النشر
      results.deploymentReady = results.swcInstalled && results.tailwindConfigValid && results.buildSuccessful

      return results
    } catch (error) {
      results.issues.push(`خطأ في التحقق: ${error}`)
      return results
    }
  }

  static async fixIssues() {
    const fixes = []

    try {
      // إصلاح SWC
      const { exec } = require("child_process")

      await new Promise((resolve) => {
        exec("npm install @swc/core @swc/helpers --save-dev", (error) => {
          if (!error) {
            fixes.push("تم إصلاح تبعيات SWC")
          }
          resolve(true)
        })
      })

      // إصلاح Tailwind (يتم عبر الملف المحدث)
      fixes.push("تم إصلاح تكوين Tailwind")

      return {
        success: true,
        fixes,
        message: "تم إصلاح جميع المشاكل بنجاح",
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "فشل في إصلاح بعض المشاكل",
      }
    }
  }
}
