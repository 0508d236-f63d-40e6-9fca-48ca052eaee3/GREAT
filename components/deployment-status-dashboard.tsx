"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  ExternalLink,
  GitBranch,
  Clock,
  Zap,
  Globe,
  Package,
  Activity,
  Upload,
  Eye,
  Server,
  Code,
} from "lucide-react"

import { deploymentStatusChecker, type DeploymentStatus, type DeploymentCheck } from "../lib/deployment-status-checker"

export default function DeploymentStatusDashboard() {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null)
  const [deploymentCheck, setDeploymentCheck] = useState<DeploymentCheck | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [isRedeploying, setIsRedeploying] = useState(false)
  const [lastCheck, setLastCheck] = useState<string>("")

  /**
   * 🔍 فحص حالة النشر
   */
  const checkDeploymentStatus = async () => {
    setIsChecking(true)

    try {
      console.log("🔍 Checking deployment status...")

      const [status, check] = await Promise.all([
        deploymentStatusChecker.checkDeploymentStatus(),
        deploymentStatusChecker.performDeploymentCheck(),
      ])

      setDeploymentStatus(status)
      setDeploymentCheck(check)
      setLastCheck(new Date().toLocaleTimeString())

      console.log("✅ Deployment status updated")
    } catch (error) {
      console.error("❌ Error checking deployment:", error)
    } finally {
      setIsChecking(false)
      setIsLoading(false)
    }
  }

  /**
   * 🚀 إعادة النشر
   */
  const handleRedeployment = async () => {
    setIsRedeploying(true)

    try {
      console.log("🚀 Starting redeployment...")

      const result = await deploymentStatusChecker.triggerRedeployment()

      if (result.success) {
        alert(`✅ ${result.message}\nDeployment ID: ${result.deploymentId}`)
        // إعادة فحص الحالة بعد 30 ثانية
        setTimeout(() => {
          checkDeploymentStatus()
        }, 30000)
      } else {
        alert(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error("❌ Error redeploying:", error)
      alert("❌ فشل في إعادة النشر")
    } finally {
      setIsRedeploying(false)
    }
  }

  /**
   * 📄 تحميل التقرير
   */
  const downloadReport = async () => {
    try {
      const report = await deploymentStatusChecker.generateDeploymentReport()
      const blob = new Blob([report], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `deployment-report-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("❌ Error downloading report:", error)
    }
  }

  // فحص أولي عند التحميل
  useEffect(() => {
    checkDeploymentStatus()

    // فحص دوري كل 5 دقائق
    const interval = setInterval(checkDeploymentStatus, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY":
        return "text-green-400"
      case "BUILDING":
        return "text-yellow-400"
      case "ERROR":
      case "FAILED":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "READY":
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case "BUILDING":
        return <RefreshCw className="w-6 h-6 text-yellow-400 animate-spin" />
      case "ERROR":
      case "FAILED":
        return <AlertCircle className="w-6 h-6 text-red-400" />
      default:
        return <Activity className="w-6 h-6 text-gray-400" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "HEALTHY":
        return "text-green-400"
      case "DEGRADED":
        return "text-yellow-400"
      case "FAILED":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getHealthBadge = (health: string) => {
    const colors = {
      HEALTHY: "bg-green-600 text-white",
      DEGRADED: "bg-yellow-600 text-white",
      FAILED: "bg-red-600 text-white",
    }
    return colors[health as keyof typeof colors] || "bg-gray-600 text-white"
  }

  if (isLoading) {
    return (
      <div className="glass-card text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-300">Checking deployment status...</p>
        <p className="text-sm text-gray-400 mt-2">Verifying live website and features...</p>
      </div>
    )
  }

  if (!deploymentStatus || !deploymentCheck) {
    return (
      <div className="glass-card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Unable to Check Deployment</h3>
        <p className="text-gray-400 mb-6">Failed to retrieve deployment status</p>
        <button onClick={checkDeploymentStatus} className="btn-secondary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          Retry Check
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(deploymentStatus.status)}
              <div>
                <h1 className="text-2xl font-bold">🚀 Deployment Status</h1>
                <p className="text-gray-400">Live website deployment verification</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold ${getHealthBadge(deploymentCheck.deploymentHealth)}`}>
              {deploymentCheck.deploymentHealth}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={checkDeploymentStatus}
              disabled={isChecking}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "Checking..." : "Refresh"}
            </button>
            <button onClick={downloadReport} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Report
            </button>
            <button
              onClick={handleRedeployment}
              disabled={isRedeploying}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className={`w-4 h-4 ${isRedeploying ? "animate-pulse" : ""}`} />
              {isRedeploying ? "Deploying..." : "Redeploy"}
            </button>
          </div>
        </div>

        {/* Quick Status */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-lg font-bold text-blue-400">
                {deploymentStatus.isDeployed ? "🟢 Live" : "🔴 Down"}
              </div>
              <div className="text-sm text-gray-400">Website Status</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-lg font-bold text-purple-400">
                {deploymentCheck.isUpToDate ? "✅ Updated" : "⚠️ Outdated"}
              </div>
              <div className="text-sm text-gray-400">Version Status</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-lg font-bold text-green-400">{deploymentCheck.featuresDeployed.length}</div>
              <div className="text-sm text-gray-400">Features Live</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-lg font-bold text-cyan-400">{lastCheck}</div>
              <div className="text-sm text-gray-400">Last Check</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Details */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Server className="w-6 h-6" />
          Deployment Information
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Platform:</span>
              <span className="font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {deploymentStatus.platform}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Environment:</span>
              <span
                className={`font-semibold px-2 py-1 rounded text-xs ${
                  deploymentStatus.environment === "production"
                    ? "bg-green-600 text-white"
                    : deploymentStatus.environment === "preview"
                      ? "bg-yellow-600 text-white"
                      : "bg-blue-600 text-white"
                }`}
              >
                {deploymentStatus.environment.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status:</span>
              <span className={`font-semibold ${getStatusColor(deploymentStatus.status)}`}>
                {deploymentStatus.status}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">URL:</span>
              <a
                href={deploymentStatus.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Site
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Branch:</span>
              <span className="font-semibold flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                {deploymentStatus.branch}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Commit:</span>
              <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">{deploymentStatus.commitHash}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Version:</span>
              <span className="font-semibold text-blue-400">{deploymentStatus.currentVersion}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Live Version:</span>
              <span
                className={`font-semibold ${
                  deploymentStatus.liveVersion === deploymentStatus.currentVersion
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {deploymentStatus.liveVersion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Status */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Code className="w-6 h-6" />
          Features Deployment Status
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Deployed Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              ✅ Deployed Features ({deploymentCheck.featuresDeployed.length})
            </h3>
            <div className="space-y-2">
              {deploymentCheck.featuresDeployed.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-3 bg-green-600/10 border border-green-500/30 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-medium">
                    {feature.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-400">
              ❌ Missing Features ({deploymentCheck.missingFeatures.length})
            </h3>
            {deploymentCheck.missingFeatures.length === 0 ? (
              <div className="p-6 text-center bg-green-600/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-semibold">All Features Deployed!</p>
                <p className="text-sm text-gray-400">No missing features detected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deploymentCheck.missingFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 p-3 bg-red-600/10 border border-red-500/30 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="font-medium">
                      {feature.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Changes */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Recent Changes
        </h2>

        <div className="space-y-3">
          {deploymentStatus.changes.map((change, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  change.type === "ADDED"
                    ? "bg-green-600 text-white"
                    : change.type === "MODIFIED"
                      ? "bg-blue-600 text-white"
                      : "bg-red-600 text-white"
                }`}
              >
                {change.type === "ADDED" ? "+" : change.type === "MODIFIED" ? "~" : "-"}
              </div>
              <div className="flex-1">
                <div className="font-mono text-sm text-blue-400">{change.file}</div>
                <div className="text-gray-300 mt-1">{change.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Eye className="w-6 h-6" />
          Recommendations
        </h2>

        <div className="space-y-3">
          {deploymentCheck.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                recommendation.includes("✅")
                  ? "bg-green-600/10 border-green-500"
                  : recommendation.includes("🚨") || recommendation.includes("❌")
                    ? "bg-red-600/10 border-red-500"
                    : "bg-yellow-600/10 border-yellow-500"
              }`}
            >
              <p className="text-gray-300">{recommendation}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {deploymentCheck.missingFeatures.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
            <h3 className="font-semibold text-yellow-400 mb-3">⚠️ Action Required</h3>
            <p className="text-gray-300 mb-4">
              Some features are missing from the live deployment. Consider redeploying to update the website.
            </p>
            <button
              onClick={handleRedeployment}
              disabled={isRedeploying}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className={`w-4 h-4 ${isRedeploying ? "animate-pulse" : ""}`} />
              {isRedeploying ? "Redeploying..." : "Deploy Updates"}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(17, 25, 40, 0.75);
          backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.125);
          border-radius: 12px;
          padding: 24px;
        }

        .btn-secondary {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: rgb(147, 197, 253);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
