/**
 * 🔗 خدمة التكامل مع Git والمستودعات
 */

export interface GitCommit {
  sha: string
  message: string
  author: string
  date: Date
  url: string
}

export interface GitRepository {
  name: string
  owner: string
  url: string
  branch: string
  lastCommit?: GitCommit
}

export class GitIntegrationService {
  private static instance: GitIntegrationService
  private repository: GitRepository | null = null
  private commits: GitCommit[] = []

  static getInstance(): GitIntegrationService {
    if (!GitIntegrationService.instance) {
      GitIntegrationService.instance = new GitIntegrationService()
    }
    return GitIntegrationService.instance
  }

  /**
   * 🔧 إعداد المستودع
   */
  async setupRepository(): Promise<void> {
    try {
      this.repository = await this.detectRepository()
      if (this.repository) {
        console.log("📁 تم اكتشاف المستودع:", this.repository.name)
        await this.loadCommitHistory()
      }
    } catch (error) {
      console.error("❌ خطأ في إعداد المستودع:", error)
    }
  }

  /**
   * 🔍 اكتشاف المستودع تلقائياً
   */
  private async detectRepository(): Promise<GitRepository | null> {
    // من متغيرات Vercel
    const vercelRepo = process.env.VERCEL_GIT_REPO_SLUG
    const vercelOwner = process.env.VERCEL_GIT_REPO_OWNER
    const vercelBranch = process.env.VERCEL_GIT_COMMIT_REF || "main"

    if (vercelRepo && vercelOwner) {
      return {
        name: vercelRepo,
        owner: vercelOwner,
        url: `https://github.com/${vercelOwner}/${vercelRepo}`,
        branch: vercelBranch,
      }
    }

    // من package.json
    try {
      const packageJson = await this.loadPackageJson()
      if (packageJson?.repository?.url) {
        const repoUrl = packageJson.repository.url
        const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
        if (match) {
          return {
            name: match[2],
            owner: match[1],
            url: `https://github.com/${match[1]}/${match[2]}`,
            branch: "main",
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ لا يمكن قراءة package.json:", error)
    }

    return null
  }

  /**
   * 📦 تحميل package.json
   */
  private async loadPackageJson(): Promise<any> {
    try {
      const response = await fetch("/package.json")
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn("⚠️ لا يمكن تحميل package.json:", error)
    }
    return null
  }

  /**
   * 📚 تحميل تاريخ الـ commits
   */
  private async loadCommitHistory(): Promise<void> {
    if (!this.repository) return

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.repository.owner}/${this.repository.name}/commits?per_page=10`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "CryptoTracker-GitIntegration",
          },
        },
      )

      if (response.ok) {
        const commits = await response.json()
        this.commits = commits.map((commit: any) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: new Date(commit.commit.author.date),
          url: commit.html_url,
        }))

        if (this.commits.length > 0) {
          this.repository.lastCommit = this.commits[0]
        }

        console.log(`📚 تم تحميل ${this.commits.length} commits`)
      }
    } catch (error) {
      console.error("❌ خطأ في تحميل تاريخ الـ commits:", error)
    }
  }

  /**
   * 🔄 فحص التحديثات الجديدة
   */
  async checkForNewCommits(): Promise<GitCommit[]> {
    if (!this.repository) return []

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.repository.owner}/${this.repository.name}/commits?per_page=5&since=${this.getLastCheckTime()}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "CryptoTracker-GitIntegration",
          },
        },
      )

      if (response.ok) {
        const newCommits = await response.json()
        const commits: GitCommit[] = newCommits.map((commit: any) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: new Date(commit.commit.author.date),
          url: commit.html_url,
        }))

        // تحديث آخر وقت فحص
        this.updateLastCheckTime()

        return commits.filter((commit) => !this.commits.some((existing) => existing.sha === commit.sha))
      }
    } catch (error) {
      console.error("❌ خطأ في فحص التحديثات:", error)
    }

    return []
  }

  /**
   * ⏰ الحصول على آخر وقت فحص
   */
  private getLastCheckTime(): string {
    const lastCheck = localStorage.getItem("git_last_check")
    return lastCheck || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }

  /**
   * 💾 تحديث آخر وقت فحص
   */
  private updateLastCheckTime(): void {
    localStorage.setItem("git_last_check", new Date().toISOString())
  }

  /**
   * 📊 الحصول على معلومات المستودع
   */
  getRepositoryInfo(): {
    repository: GitRepository | null
    commits: GitCommit[]
    stats: {
      totalCommits: number
      lastCommitDate: Date | null
      contributors: string[]
    }
  } {
    const contributors = [...new Set(this.commits.map((c) => c.author))]

    return {
      repository: this.repository,
      commits: this.commits,
      stats: {
        totalCommits: this.commits.length,
        lastCommitDate: this.commits.length > 0 ? this.commits[0].date : null,
        contributors,
      },
    }
  }

  /**
   * 🔗 إنشاء رابط للمقارنة
   */
  createCompareUrl(fromCommit: string, toCommit: string): string | null {
    if (!this.repository) return null

    return `${this.repository.url}/compare/${fromCommit}...${toCommit}`
  }

  /**
   * 📝 إنشاء changelog تلقائي
   */
  generateChangelog(commits: GitCommit[]): string {
    if (commits.length === 0) return "لا توجد تغييرات جديدة"

    let changelog = "## 📋 التحديثات الجديدة\n\n"

    commits.forEach((commit) => {
      const date = commit.date.toLocaleDateString("ar-SA")
      changelog += `- **${commit.message}** - ${commit.author} (${date})\n`
    })

    return changelog
  }
}

// إنشاء instance للاستخدام
export const gitIntegrationService = GitIntegrationService.getInstance()
