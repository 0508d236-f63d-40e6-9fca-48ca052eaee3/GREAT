"use client"

import { useState, useEffect } from "react"
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  ExternalLink,
  GitBranch,
  Cloud,
  Globe,
  Wrench,
  Zap,
  FileText,
  Settings,
} from "lucide-react"

import { deploymentDiagnosis, type DeploymentDiagnosis } from "../lib/deployment-diagnosis-service"

export default function DeploymentDiagnosisDashboard() {
  const [diagnosis, setDiagnosis] = useState<DeploymentDiagnosis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isForceDeploying, setIsForceDeploying] = useState(false)

  /**
   * 🔍 تشخيص المشكلة
   */
  const runDiagnosis = async () => {
    setIsLoading(true)
    try {
      const result = await deploymentDiagnosis.diagnoseProblem()
      setDiagnosis(result)
    } catch (error) {
      console.error("خطأ في التشخيص:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 🚀 إجبار النشر
   */
  const handleForceDeploy = async () => {
    setIsForceDeploying(true)
    try {
      const result = await deploymentDiagnosis.forceDeploy()
      if (result.success) {
        alert(`✅ ${result.message}\nURL: ${result.url}`)
      } else {
        alert(`❌ ${result.message}\nيرجى الذهاب إلى: ${result.url}`)
      }
    } catch (error) {
      alert(`❌ فشل في النشر: ${error}`)
    } finally {
      setIsForceDeploying(false)
    }
  }

  /**
   * 📄 تحميل التقرير
   */
  const downloadReport = async () => {
    try {
      const report = await deploymentDiagnosis.generateDiagnosisReport()
      const blob = new Blob([report], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `deployment-diagnosis-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("خطأ في تحميل التقرير:", error)
    }
  }

  // تشخيص أولي عند التحميل
  useEffect(() => {
    runDiagnosis()
  }, [])

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <CheckCircle className="w-6 h-6 text-green-400" />
    ) : (
      <AlertTriangle className="w-6 h-6 text-red-400" />
    )
  }

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? "text-green-400" : "text-red-400"
  }

  const getStatusText = (isConnected: boolean) => {
    return isConnected ? "✅ يعمل بشكل صحيح" : "❌ يوجد مشكلة"
  }

  if (isLoading && !diagnosis) {
    return (
      <div className="glass-card text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-300">تشخيص مشاكل النشر...</p>
        <p className="text-sm text-gray-400 mt-2">فحص Git، Vercel، والموقع المنشور...</p>
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
              <Wrench className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">🔍 تشخيص مشاكل النشر</h1>
                <p className="text-gray-400">تحديد سبب عدم تحديث الموقع المنشور</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={runDiagnosis} disabled={isLoading} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "تشخيص..." : "إعادة تشخيص"}
            </button>
            <button onClick={downloadReport} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              تحميل التقرير
            </button>
            <button
              onClick={handleForceDeploy}
              disabled={isForceDeploying}
              className="btn-secondary flex items-center gap-2 bg-green-600/20 border-green-500/30 text-green-300"
            >
              <Zap className={`w-4 h-4 ${isForceDeploying ? "animate-pulse" : ""}`} />
              {isForceDeploying ? "جاري النشر..." : "إجبار النشر"}
            </button>
          </div>
        </div>

        {/* Quick Status */}
        {diagnosis && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-purple-400" />
              <div>
                <div className={`text-lg font-bold ${getStatusColor(diagnosis.gitConnection.isConnected)}`}>
                  {getStatusText(diagnosis.gitConnection.isConnected)}
                </div>
                <div className="text-sm text-gray-400">Git Connection</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8 text-blue-400" />
              <div>
                <div className={`text-lg font-bold ${getStatusColor(diagnosis.vercelStatus.isConnected)}`}>
                  {getStatusText(diagnosis.vercelStatus.isConnected)}
                </div>
                <div className="text-sm text-gray-400">Vercel Status</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-green-400" />
              <div>
                <div className={`text-lg font-bold ${getStatusColor(diagnosis.websiteStatus.isLive)}`}>
                  {getStatusText(diagnosis.websiteStatus.isLive)}
                </div>
                <div className="text-sm text-gray-400">Website Status</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {diagnosis && (
        <>
          {/* Git Connection */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-purple-400" />
              Git Connection Status
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Connection:</span>
                  <span className={`font-semibold ${getStatusColor(diagnosis.gitConnection.isConnected)}`}>
                    {diagnosis.gitConnection.isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Branch:</span>
                  <span className="font-semibold text-white">{diagnosis.gitConnection.branch}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Commit:</span>
                  <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                    {diagnosis.gitConnection.lastCommit}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Commit Time:</span>
                  <span className="font-semibold text-white">{diagnosis.gitConnection.lastCommitTime}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-red-400">Issues ({diagnosis.gitConnection.issues.length})</h3>
                {diagnosis.gitConnection.issues.length === 0 ? (
                  <div className="p-3 bg-green-600/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400">✅ No issues detected</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {diagnosis.gitConnection.issues.map((issue, index) => (
                      <div key={index} className="p-3 bg-red-600/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-300">{issue}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vercel Status */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-400" />
              Vercel Deployment Status
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Connection:</span>
                  <span className={`font-semibold ${getStatusColor(diagnosis.vercelStatus.isConnected)}`}>
                    {diagnosis.vercelStatus.isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Deployment:</span>
                  <span className="font-semibold text-white">{diagnosis.vercelStatus.lastDeployment}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-semibold ${
                      diagnosis.vercelStatus.deploymentStatus === "READY" ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {diagnosis.vercelStatus.deploymentStatus}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">Build Logs:</span>
                  <div className="mt-2 space-y-1">
                    {diagnosis.vercelStatus.buildLogs.map((log, index) => (
                      <div key={index} className="text-sm bg-gray-800 px-2 py-1 rounded font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-red-400">Issues ({diagnosis.vercelStatus.issues.length})</h3>
                {diagnosis.vercelStatus.issues.length === 0 ? (
                  <div className="p-3 bg-green-600/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400">✅ No issues detected</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {diagnosis.vercelStatus.issues.map((issue, index) => (
                      <div key={index} className="p-3 bg-red-600/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-300">{issue}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Website Status */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-green-400" />
              Live Website Status
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Website:</span>
                  <span className={`font-semibold ${getStatusColor(diagnosis.websiteStatus.isLive)}`}>
                    {diagnosis.websiteStatus.isLive ? "Live" : "Down"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Version:</span>
                  <span className="font-semibold text-white">{diagnosis.websiteStatus.currentVersion}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Update:</span>
                  <span className="font-semibold text-white">{diagnosis.websiteStatus.lastUpdate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Build ID:</span>
                  <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                    {diagnosis.websiteStatus.buildId}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-red-400">Issues ({diagnosis.websiteStatus.issues.length})</h3>
                {diagnosis.websiteStatus.issues.length === 0 ? (
                  <div className="p-3 bg-green-600/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400">✅ No issues detected</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {diagnosis.websiteStatus.issues.map((issue, index) => (
                      <div key={index} className="p-3 bg-red-600/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-300">{issue}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Recommendations ({diagnosis.recommendations.length})
            </h2>

            <div className="space-y-3">
              {diagnosis.recommendations.map((recommendation, index) => (
                <div key={index} className="p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Fixes */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Quick Fixes ({diagnosis.quickFixes.length})
            </h2>

            <div className="space-y-3 mb-6">
              {diagnosis.quickFixes.map((fix, index) => (
                <div key={index} className="p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300">{fix}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={handleForceDeploy}
                disabled={isForceDeploying}
                className="btn-secondary flex items-center gap-2 justify-center bg-green-600/20 border-green-500/30 text-green-300"
              >
                <Zap className={`w-4 h-4 ${isForceDeploying ? "animate-pulse" : ""}`} />
                {isForceDeploying ? "جاري النشر..." : "إجبار النشر"}
              </button>

              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 justify-center bg-blue-600/20 border-blue-500/30 text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
                Vercel Dashboard
              </a>

              <button onClick={downloadReport} className="btn-secondary flex items-center gap-2 justify-center">
                <FileText className="w-4 h-4" />
                تحميل التقرير الكامل
              </button>
            </div>
          </div>

          {/* Critical Alert */}
          {diagnosis.websiteStatus.issues.includes("التحديثات الجديدة غير موجودة في الموقع المنشور") && (
            <div className="glass-card bg-red-600/10 border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-red-400">🚨 مشكلة حرجة: النشر التلقائي لا يعمل!</h2>
              </div>
              <p className="text-gray-300 mb-4">
                التحديثات التي قمت بدفعها إلى Git لم تصل إلى الموقع المنشور. هذا يعني أن النشر التلقائي معطل أو يوجد
                مشكلة في الربط بين Git و Vercel.
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-yellow-300">🔧 الحلول المقترحة:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                  <li>اذهب إلى Vercel Dashboard وتحقق من إعدادات Git</li>
                  <li>تأكد من أن Auto-Deploy مفعل</li>
                  <li>اضغط "Redeploy" يدوياً من Vercel</li>
                  <li>تحقق من أن المستودع مربوط بالمشروع الصحيح</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleForceDeploy}
                  disabled={isForceDeploying}
                  className="btn-secondary flex items-center gap-2 bg-red-600/20 border-red-500/30 text-red-300 animate-pulse"
                >
                  <Zap className={`w-4 h-4 ${isForceDeploying ? "animate-pulse" : ""}`} />
                  {isForceDeploying ? "جاري النشر..." : "إجبار النشر الآن"}
                </button>
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-300"
                >
                  <Settings className="w-4 h-4" />
                  فتح Vercel Dashboard
                </a>
              </div>
            </div>
          )}
        </>
      )}

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
