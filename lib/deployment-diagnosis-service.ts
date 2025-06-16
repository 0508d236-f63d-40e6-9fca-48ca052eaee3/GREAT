/**
 * 🔍 خدمة تشخيص مشاكل النشر
 * تحديد سبب عدم تحديث الموقع المنشور
 */

export interface DeploymentDiagnosis {
  gitConnection: {
    isConnected: boolean
    lastCommit: string
    lastCommitTime: string
    branch: string
    issues: string[]
  }
  vercelStatus: {
    isConnected: boolean
    lastDeployment: string
    deploymentStatus: string
    buildLogs: string[]
    issues: string[]
  }
  websiteStatus: {
    isLive: boolean
    currentVersion: string
    lastUpdate: string
    buildId: string
    issues: string[]
  }
  recommendations: string[]
  quickFixes: string[]
}

export interface GitCommitInfo {
  sha: string
  message: string
  author: string
  date: string
  url: string
}

export interface VercelDeploymentInfo {
  id: string
  status: string
  url: string
  createdAt: string
  readyAt?: string
  buildTime: number
  commit: string
  branch: string
}

class DeploymentDiagnosisService {
  private currentVersion = "2.2.0"
  private expectedBuildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString()

  /**
   * 🔍 تشخيص شامل لمشاكل النشر
   */
  async diagnoseProblem(): Promise<DeploymentDiagnosis> {
    console.log("🔍 بدء تشخيص مشاكل النشر...")

    const diagnosis: DeploymentDiagnosis = {
      gitConnection: await this.checkGitConnection(),
      vercelStatus: await this.checkVercelStatus(),
      websiteStatus: await this.checkWebsiteStatus(),
      recommendations: [],
      quickFixes: [],
    }

    // تحليل النتائج وإعطاء توصيات
    diagnosis.recommendations = this.generateRecommendations(diagnosis)
    diagnosis.quickFixes = this.generateQuickFixes(diagnosis)

    console.log("✅ تم تشخيص المشكلة:", diagnosis)
    return diagnosis
  }

  /**
   * 🔗 فحص اتصال Git
   */
  private async checkGitConnection(): Promise<DeploymentDiagnosis["gitConnection"]> {
    const issues: string[] = []

    try {
      // محاولة الحصول على معلومات Git من متغيرات البيئة
      const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_GIT_COMMIT
      const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || "main"

      if (!gitCommit) {
        issues.push("لا يمكن العثور على معلومات Git commit")
      }

      // محاولة جلب آخر commit من GitHub API
      let lastCommit = "Unknown"
      let lastCommitTime = "Unknown"

      try {
        const repoInfo = this.getRepositoryInfo()
        if (repoInfo) {
          const response = await fetch(
            `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits/${gitBranch}`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "DeploymentDiagnosis",
              },
            },
          )

          if (response.ok) {
            const commitData = await response.json()
            lastCommit = commitData.sha.substring(0, 8)
            lastCommitTime = new Date(commitData.commit.author.date).toLocaleString()
          } else {
            issues.push("لا يمكن الوصول إلى GitHub API")
          }
        } else {
          issues.push("معلومات المستودع غير متاحة")
        }
      } catch (error) {
        issues.push(`خطأ في الاتصال بـ GitHub: ${error}`)
      }

      return {
        isConnected: issues.length === 0,
        lastCommit,
        lastCommitTime,
        branch: gitBranch,
        issues,
      }
    } catch (error) {
      return {
        isConnected: false,
        lastCommit: "Error",
        lastCommitTime: "Error",
        branch: "Unknown",
        issues: [`خطأ في فحص Git: ${error}`],
      }
    }
  }

  /**
   * ☁️ فحص حالة Vercel
   */
  private async checkVercelStatus(): Promise<DeploymentDiagnosis["vercelStatus"]> {
    const issues: string[] = []
    const buildLogs: string[] = []

    try {
      // محاولة الحصول على معلومات النشر من Vercel
      const vercelUrl = process.env.VERCEL_URL
      const deploymentId = process.env.VERCEL_DEPLOYMENT_ID

      if (!vercelUrl) {
        issues.push("متغيرات Vercel غير متاحة")
      }

      // محاولة فحص آخر نشر
      let lastDeployment = "Unknown"
      let deploymentStatus = "Unknown"

      try {
        // فحص صفحة النشر الحالية
        if (typeof window !== "undefined") {
          const currentUrl = window.location.origin
          const response = await fetch(`${currentUrl}/api/deployment-check`, {
            cache: "no-cache",
          })

          if (response.ok) {
            const data = await response.json()
            lastDeployment = data.buildTime || "Unknown"
            deploymentStatus = "READY"
            buildLogs.push("✅ API متاح ويعمل")
          } else {
            issues.push("API النشر لا يعمل")
            buildLogs.push("❌ API غير متاح")
          }
        }
      } catch (error) {
        issues.push(`خطأ في فحص النشر: ${error}`)
        buildLogs.push(`❌ خطأ: ${error}`)
      }

      return {
        isConnected: issues.length === 0,
        lastDeployment,
        deploymentStatus,
        buildLogs,
        issues,
      }
    } catch (error) {
      return {
        isConnected: false,
        lastDeployment: "Error",
        deploymentStatus: "ERROR",
        buildLogs: [`خطأ في فحص Vercel: ${error}`],
        issues: [`خطأ عام: ${error}`],
      }
    }
  }

  /**
   * 🌐 فحص حالة الموقع المنشور
   */
  private async checkWebsiteStatus(): Promise<DeploymentDiagnosis["websiteStatus"]> {
    const issues: string[] = []

    try {
      if (typeof window === "undefined") {
        return {
          isLive: false,
          currentVersion: "Unknown",
          lastUpdate: "Unknown",
          buildId: "Unknown",
          issues: ["فحص الموقع متاح فقط في المتصفح"],
        }
      }

      const currentUrl = window.location.origin

      // فحص الموقع الرئيسي
      const siteResponse = await fetch(currentUrl, {
        cache: "no-cache",
        headers: { "Cache-Control": "no-cache" },
      })

      const isLive = siteResponse.ok

      if (!isLive) {
        issues.push("الموقع غير متاح")
      }

      // استخراج معلومات البناء
      const html = await siteResponse.text()
      let currentVersion = "Unknown"
      let buildId = "Unknown"
      let lastUpdate = "Unknown"

      // البحث عن معلومات البناء في HTML
      const buildIdMatch = html.match(/buildId['"]:['"]([^'"]+)['"]/i)
      const versionMatch = html.match(/version['"]:['"]([^'"]+)['"]/i)
      const buildTimeMatch = html.match(/buildTime['"]:['"]([^'"]+)['"]/i)

      if (buildIdMatch) buildId = buildIdMatch[1]
      if (versionMatch) currentVersion = versionMatch[1]
      if (buildTimeMatch) lastUpdate = buildTimeMatch[1]

      // فحص إذا كان الموقع يحتوي على التحديثات الجديدة
      const hasNewFeatures = html.includes("premium-token-service") || html.includes("enhanced-pump-service")

      if (!hasNewFeatures) {
        issues.push("التحديثات الجديدة غير موجودة في الموقع المنشور")
      }

      // فحص تاريخ آخر تحديث
      const buildTime = new Date(lastUpdate)
      const now = new Date()
      const timeDiff = now.getTime() - buildTime.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        issues.push("آخر نشر كان منذ أكثر من 24 ساعة")
      }

      return {
        isLive,
        currentVersion,
        lastUpdate,
        buildId: buildId.substring(0, 8),
        issues,
      }
    } catch (error) {
      return {
        isLive: false,
        currentVersion: "Error",
        lastUpdate: "Error",
        buildId: "Error",
        issues: [`خطأ في فحص الموقع: ${error}`],
      }
    }
  }

  /**
   * 💡 إنشاء التوصيات
   */
  private generateRecommendations(diagnosis: DeploymentDiagnosis): string[] {
    const recommendations: string[] = []

    // مشاكل Git
    if (!diagnosis.gitConnection.isConnected) {
      recommendations.push("🔗 تحقق من اتصال المستودع بـ Vercel")
      recommendations.push("📋 تأكد من أن Vercel مربوط بالمستودع الصحيح")
    }

    // مشاكل Vercel
    if (!diagnosis.vercelStatus.isConnected) {
      recommendations.push("☁️ تحقق من إعدادات Vercel")
      recommendations.push("🔄 قم بإعادة ربط المستودع في Vercel Dashboard")
    }

    // مشاكل الموقع
    if (!diagnosis.websiteStatus.isLive) {
      recommendations.push("🌐 الموقع غير متاح - تحقق من حالة النشر")
    }

    if (diagnosis.websiteStatus.issues.includes("التحديثات الجديدة غير موجودة في الموقع المنشور")) {
      recommendations.push("🚀 النشر التلقائي لا يعمل - يجب نشر يدوي")
      recommendations.push("⚙️ تحقق من إعدادات Auto-Deploy في Vercel")
    }

    // توصيات عامة
    if (recommendations.length === 0) {
      recommendations.push("✅ لا توجد مشاكل واضحة - قد تحتاج إلى انتظار أو مسح الكاش")
    }

    return recommendations
  }

  /**
   * ⚡ إنشاء الحلول السريعة
   */
  private generateQuickFixes(diagnosis: DeploymentDiagnosis): string[] {
    const quickFixes: string[] = []

    // حلول Git
    if (!diagnosis.gitConnection.isConnected) {
      quickFixes.push("1. اذهب إلى Vercel Dashboard > Settings > Git")
      quickFixes.push("2. تأكد من أن المستودع مربوط بشكل صحيح")
      quickFixes.push("3. أعد ربط المستودع إذا لزم الأمر")
    }

    // حلول Vercel
    if (diagnosis.vercelStatus.deploymentStatus !== "READY") {
      quickFixes.push("1. اذهب إلى Vercel Dashboard > Deployments")
      quickFixes.push("2. تحقق من حالة آخر نشر")
      quickFixes.push("3. إذا فشل النشر، اضغط 'Redeploy'")
    }

    // حلول الموقع
    if (diagnosis.websiteStatus.issues.length > 0) {
      quickFixes.push("1. امسح كاش المتصفح (Ctrl+Shift+R)")
      quickFixes.push("2. جرب فتح الموقع في نافذة خاصة")
      quickFixes.push("3. انتظر 5-10 دقائق للنشر التلقائي")
    }

    // حل شامل
    quickFixes.push("🔄 الحل الشامل: اذهب إلى Vercel Dashboard واضغط 'Redeploy' يدوياً")

    return quickFixes
  }

  /**
   * 📋 الحصول على معلومات المستودع
   */
  private getRepositoryInfo(): { owner: string; repo: string } | null {
    const vercelGitRepo = process.env.VERCEL_GIT_REPO_SLUG
    const vercelGitOwner = process.env.VERCEL_GIT_REPO_OWNER

    if (vercelGitRepo && vercelGitOwner) {
      return {
        owner: vercelGitOwner,
        repo: vercelGitRepo,
      }
    }

    return null
  }

  /**
   * 🚀 محاولة إجبار النشر
   */
  async forceDeploy(): Promise<{ success: boolean; message: string; url?: string }> {
    try {
      console.log("🚀 محاولة إجبار النشر...")

      // في البيئة الحقيقية، سنستخدم Vercel API
      const vercelToken = process.env.VERCEL_TOKEN

      if (vercelToken) {
        // استخدام Vercel API لإنشاء نشر جديد
        const response = await fetch("https://api.vercel.com/v13/deployments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: process.env.NEXT_PUBLIC_APP_NAME || "crypto-tracker",
            gitSource: {
              type: "github",
              ref: "main",
            },
            target: "production",
          }),
        })

        if (response.ok) {
          const deployment = await response.json()
          return {
            success: true,
            message: "تم تشغيل النشر بنجاح",
            url: deployment.url,
          }
        }
      }

      // إذا لم يكن Vercel API متاحاً، أعطي تعليمات يدوية
      return {
        success: false,
        message: "يجب النشر يدوياً من Vercel Dashboard",
        url: "https://vercel.com/dashboard",
      }
    } catch (error) {
      return {
        success: false,
        message: `فشل في النشر: ${error}`,
      }
    }
  }

  /**
   * 📊 إنشاء تقرير شامل
   */
  async generateDiagnosisReport(): Promise<string> {
    const diagnosis = await this.diagnoseProblem()

    return `
🔍 DEPLOYMENT DIAGNOSIS REPORT
===============================

📅 Report Generated: ${new Date().toLocaleString()}

🔗 GIT CONNECTION STATUS:
  Status: ${diagnosis.gitConnection.isConnected ? "✅ Connected" : "❌ Disconnected"}
  Last Commit: ${diagnosis.gitConnection.lastCommit}
  Commit Time: ${diagnosis.gitConnection.lastCommitTime}
  Branch: ${diagnosis.gitConnection.branch}
  Issues: ${diagnosis.gitConnection.issues.length > 0 ? diagnosis.gitConnection.issues.join(", ") : "None"}

☁️ VERCEL STATUS:
  Status: ${diagnosis.vercelStatus.isConnected ? "✅ Connected" : "❌ Disconnected"}
  Last Deployment: ${diagnosis.vercelStatus.lastDeployment}
  Deployment Status: ${diagnosis.vercelStatus.deploymentStatus}
  Build Logs: ${diagnosis.vercelStatus.buildLogs.join(" | ")}
  Issues: ${diagnosis.vercelStatus.issues.length > 0 ? diagnosis.vercelStatus.issues.join(", ") : "None"}

🌐 WEBSITE STATUS:
  Status: ${diagnosis.websiteStatus.isLive ? "✅ Live" : "❌ Down"}
  Current Version: ${diagnosis.websiteStatus.currentVersion}
  Last Update: ${diagnosis.websiteStatus.lastUpdate}
  Build ID: ${diagnosis.websiteStatus.buildId}
  Issues: ${diagnosis.websiteStatus.issues.length > 0 ? diagnosis.websiteStatus.issues.join(", ") : "None"}

💡 RECOMMENDATIONS:
${diagnosis.recommendations.map((rec, i) => `  ${i + 1}. ${rec}`).join("\n")}

⚡ QUICK FIXES:
${diagnosis.quickFixes.map((fix, i) => `  ${i + 1}. ${fix}`).join("\n")}

🔗 USEFUL LINKS:
  - Vercel Dashboard: https://vercel.com/dashboard
  - GitHub Repository: https://github.com/${this.getRepositoryInfo()?.owner}/${this.getRepositoryInfo()?.repo}
  - Deployment Logs: https://vercel.com/dashboard (check latest deployment)

===============================
    `
  }
}

export const deploymentDiagnosis = new DeploymentDiagnosisService()
