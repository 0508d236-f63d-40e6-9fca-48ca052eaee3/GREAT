/**
 * ☁️ خدمة النشر على Vercel مع التحديثات التلقائية
 */

export interface VercelDeployment {
  uid: string
  name: string
  url: string
  state: "BUILDING" | "READY" | "ERROR" | "CANCELED"
  createdAt: number
  readyAt?: number
  buildingAt?: number
  creator: {
    uid: string
    username: string
  }
  meta: {
    githubCommitSha?: string
    githubCommitMessage?: string
    githubCommitAuthorName?: string
  }
}

export class VercelDeploymentService {
  private static instance: VercelDeploymentService
  private apiToken: string
  private teamId?: string
  private projectId?: string

  constructor() {
    this.apiToken = process.env.VERCEL_TOKEN || ""
    this.teamId = process.env.VERCEL_TEAM_ID
    this.projectId = process.env.VERCEL_PROJECT_ID
  }

  static getInstance(): VercelDeploymentService {
    if (!VercelDeploymentService.instance) {
      VercelDeploymentService.instance = new VercelDeploymentService()
    }
    return VercelDeploymentService.instance
  }

  /**
   * 🚀 إنشاء نشر جديد
   */
  async createDeployment(options: {
    gitSource?: {
      type: "github"
      ref: string
      sha?: string
    }
    env?: Record<string, string>
    target?: "production" | "preview"
  }): Promise<VercelDeployment | null> {
    try {
      const response = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: process.env.NEXT_PUBLIC_APP_NAME || "crypto-tracker",
          gitSource: options.gitSource,
          env: options.env,
          target: options.target || "production",
          projectSettings: {
            framework: "nextjs",
            buildCommand: "npm run build",
            outputDirectory: ".next",
          },
        }),
      })

      if (response.ok) {
        const deployment = await response.json()
        console.log("✅ تم إنشاء النشر:", deployment.url)
        return deployment
      } else {
        const error = await response.text()
        console.error("❌ فشل إنشاء النشر:", error)
        return null
      }
    } catch (error) {
      console.error("❌ خطأ في إنشاء النشر:", error)
      return null
    }
  }

  /**
   * 📊 الحصول على قائمة النشر
   */
  async getDeployments(limit = 10): Promise<VercelDeployment[]> {
    try {
      const url = new URL("https://api.vercel.com/v6/deployments")
      url.searchParams.set("limit", limit.toString())
      if (this.teamId) url.searchParams.set("teamId", this.teamId)
      if (this.projectId) url.searchParams.set("projectId", this.projectId)

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.deployments || []
      } else {
        console.error("❌ فشل في جلب قائمة النشر")
        return []
      }
    } catch (error) {
      console.error("❌ خطأ في جلب قائمة النشر:", error)
      return []
    }
  }

  /**
   * 🔍 الحصول على تفاصيل نشر محدد
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment | null> {
    try {
      const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      })

      if (response.ok) {
        return await response.json()
      } else {
        console.error("❌ فشل في جلب تفاصيل النشر")
        return null
      }
    } catch (error) {
      console.error("❌ خطأ في جلب تفاصيل النشر:", error)
      return null
    }
  }

  /**
   * 🔄 مراقبة حالة النشر
   */
  async monitorDeployment(deploymentId: string): Promise<VercelDeployment | null> {
    return new Promise((resolve) => {
      const checkStatus = async () => {
        const deployment = await this.getDeployment(deploymentId)

        if (!deployment) {
          resolve(null)
          return
        }

        if (deployment.state === "READY" || deployment.state === "ERROR") {
          resolve(deployment)
          return
        }

        // فحص كل 10 ثوان
        setTimeout(checkStatus, 10000)
      }

      checkStatus()
    })
  }

  /**
   * 🗑️ حذف نشر
   */
  async deleteDeployment(deploymentId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("❌ خطأ في حذف النشر:", error)
      return false
    }
  }

  /**
   * 📈 الحصول على إحصائيات النشر
   */
  async getDeploymentStats(): Promise<{
    total: number
    ready: number
    building: number
    error: number
    lastDeployment?: VercelDeployment
  }> {
    const deployments = await this.getDeployments(50)

    const stats = {
      total: deployments.length,
      ready: deployments.filter((d) => d.state === "READY").length,
      building: deployments.filter((d) => d.state === "BUILDING").length,
      error: deployments.filter((d) => d.state === "ERROR").length,
      lastDeployment: deployments[0],
    }

    return stats
  }

  /**
   * 🔄 نشر من GitHub commit محدد
   */
  async deployFromCommit(commitSha: string, branch = "main"): Promise<VercelDeployment | null> {
    console.log(`🚀 بدء النشر من commit: ${commitSha}`)

    return await this.createDeployment({
      gitSource: {
        type: "github",
        ref: branch,
        sha: commitSha,
      },
      target: "production",
    })
  }

  /**
   * 🔄 نشر تجريبي
   */
  async createPreviewDeployment(branch: string): Promise<VercelDeployment | null> {
    console.log(`🔍 إنشاء نشر تجريبي للفرع: ${branch}`)

    return await this.createDeployment({
      gitSource: {
        type: "github",
        ref: branch,
      },
      target: "preview",
    })
  }

  /**
   * ✅ فحص صحة النشر
   */
  async checkDeploymentHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/health`, {
        method: "GET",
        timeout: 10000,
      })

      return response.ok
    } catch (error) {
      console.error("❌ فشل فحص صحة النشر:", error)
      return false
    }
  }

  /**
   * 🔄 إعادة نشر آخر commit
   */
  async redeployLatest(): Promise<VercelDeployment | null> {
    try {
      const deployments = await this.getDeployments(1)
      const lastDeployment = deployments[0]

      if (!lastDeployment?.meta?.githubCommitSha) {
        console.error("❌ لا يمكن العثور على آخر commit")
        return null
      }

      console.log("🔄 إعادة نشر آخر commit:", lastDeployment.meta.githubCommitSha)

      return await this.deployFromCommit(lastDeployment.meta.githubCommitSha)
    } catch (error) {
      console.error("❌ خطأ في إعادة النشر:", error)
      return null
    }
  }
}

// إنشاء instance للاستخدام
export const vercelDeploymentService = VercelDeploymentService.getInstance()
