"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, Info, Zap, RefreshCw, ExternalLink, Wrench } from "lucide-react"

import { deploymentAnalysis, type DeploymentAnalysis } from "../lib/deployment-analysis"

export default function DeploymentLogsAnalyzer() {
  const [analysis, setAnalysis] = useState<DeploymentAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  /**
   * 🔍 تحليل logs النشر
   */
  const analyzeDeployment = async () => {
    setIsAnalyzing(true)

    try {
      console.log("🔍 تحليل logs النشر...")

      const result = deploymentAnalysis.analyzeDeploymentLogs()
      setAnalysis(result)

      console.log("✅ تم تحليل النشر:", result)
    } catch (error) {
      console.error("❌ خطأ في التحليل:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  /**
   * 🔧 إصلاح المشاكل
   */
  const fixIssues = async () => {
    setIsFixing(true)

    try {
      console.log("🔧 إصلاح المشاكل...")

      const result = await deploymentAnalysis.fixDeploymentIssues()

      if (result.success) {
        alert(`✅ ${result.message}\n\nيرجى إجراء نشر جديد من Git أو Vercel Dashboard`)
      } else {
        alert(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error("❌ خطأ في الإصلاح:", error)
      alert("❌ فشل في إصلاح المشاكل")
    } finally {
      setIsFixing(false)
    }
  }

  /**
   * 🌐 فحص الموقع المباشر
   */
  const verifyLiveDeployment = async () => {
    setIsVerifying(true)

    try {
      console.log("🌐 فحص الموقع المباشر...")

      const result = await deploymentAnalysis.verifyLiveDeployment()
      setVerificationResult(result)

      console.log("✅ نتائج الفحص:", result)
    } catch (error) {
      console.error("❌ خطأ في الفحص:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  // تحليل أولي عند التحميل
  useEffect(() => {
    analyzeDeployment()
  }, [])

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "CRITICAL":
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "INFO":
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Info className="w-5 h-5 text-gray-400" />
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case "CRITICAL":
        return "bg-red-600/10 border-red-500/30"
      case "WARNING":
        return "bg-yellow-600/10 border-yellow-500/30"
      case "INFO":
        return "bg-blue-600/10 border-blue-500/30"
      default:
        return "bg-gray-600/10 border-gray-500/30"
    }
  }

  if (isAnalyzing && !analysis) {
    return (
      <div className="glass-card text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-300">تحليل logs النشر...</p>
        <p className="text-sm text-gray-400 mt-2">فحص المشاكل والتوصيات...</p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="glass-card text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">فشل في تحليل النشر</h3>
        <p className="text-gray-400 mb-6">لا يمكن تحليل logs النشر</p>
        <button onClick={analyzeDeployment} className="btn-secondary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
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
              {analysis.status === "SUCCESS" ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : analysis.status === "WARNING" ? (
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h1 className="text-2xl font-bold">📊 تحليل logs النشر</h1>
                <p className="text-gray-400">تحليل النشر الأخير وتحديد المشاكل</p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-bold ${
                analysis.status === "SUCCESS"
                  ? "bg-green-600 text-white"
                  : analysis.status === "WARNING"
                    ? "bg-yellow-600 text-white"
                    : "bg-red-600 text-white"
              }`}
            >
              {analysis.status === "SUCCESS"
                ? "✅ نجح النشر"
                : analysis.status === "WARNING"
                  ? "⚠️ نشر مع تحذيرات"
                  : "❌ فشل النشر"}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={analyzeDeployment}
              disabled={isAnalyzing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "تحليل..." : "إعادة تحليل"}
            </button>
            <button
              onClick={verifyLiveDeployment}
              disabled={isVerifying}
              className="btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {isVerifying ? "فحص..." : "فحص الموقع"}
            </button>
          </div>
        </div>

        {/* Build Info */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-lg font-bold text-blue-400">{analysis.buildTime}</div>
              <div className="text-sm text-gray-400">وقت البناء</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-lg font-bold text-red-400">{analysis.issues.length}</div>
              <div className="text-sm text-gray-400">مشاكل مكتشفة</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-lg font-bold text-green-400">{analysis.recommendations.length}</div>
              <div className="text-sm text-gray-400">توصيات</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-lg font-bold text-purple-400">{analysis.nextSteps.length}</div>
              <div className="text-sm text-gray-400">خطوات الإصلاح</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert */}
      {analysis.issues.some((issue) => issue.type === "CRITICAL") && (
        <div className="glass-card bg-red-600/10 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-red-400">🚨 مشاكل حرجة تحتاج إصلاح فوري!</h2>
          </div>
          <p className="text-gray-300 mb-4">
            تم اكتشاف مشاكل حرجة تؤثر على وظائف التطبيق. يجب إصلاحها فوراً لضمان عمل الموقع بشكل صحيح.
          </p>
          <button
            onClick={fixIssues}
            disabled={isFixing}
            className="btn-secondary flex items-center gap-2 bg-red-600/20 border-red-500/30 text-red-300 animate-pulse"
          >
            <Wrench className={`w-4 h-4 ${isFixing ? "animate-pulse" : ""}`} />
            {isFixing ? "جاري الإصلاح..." : "إصلاح المشاكل الآن"}
          </button>
        </div>
      )}

      {/* Issues */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          المشاكل المكتشفة ({analysis.issues.length})
        </h2>

        <div className="space-y-4">
          {analysis.issues.map((issue, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}>
              <div className="flex items-start gap-3">
                {getIssueIcon(issue.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{issue.message}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">{issue.category}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    <strong>التأثير:</strong> {issue.impact}
                  </p>
                  <p className="text-sm text-green-400">
                    <strong>الحل:</strong> {issue.solution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-400" />
          التوصيات ({analysis.recommendations.length})
        </h2>

        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
              <p className="text-green-300">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-purple-400" />
          خطوات الإصلاح ({analysis.nextSteps.length})
        </h2>

        <div className="space-y-3">
          {analysis.nextSteps.map((step, index) => (
            <div key={index} className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300">{step}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={fixIssues}
            disabled={isFixing}
            className="btn-secondary flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-300"
          >
            <Wrench className={`w-4 h-4 ${isFixing ? "animate-pulse" : ""}`} />
            {isFixing ? "جاري الإصلاح..." : "تطبيق الإصلاحات"}
          </button>

          <button
            onClick={verifyLiveDeployment}
            disabled={isVerifying}
            className="btn-secondary flex items-center gap-2"
          >
            <ExternalLink className={`w-4 h-4 ${isVerifying ? "animate-pulse" : ""}`} />
            {isVerifying ? "جاري الفحص..." : "فحص الموقع المباشر"}
          </button>
        </div>
      </div>

      {/* Verification Results */}
      {verificationResult && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ExternalLink className="w-6 h-6 text-cyan-400" />
            نتائج فحص الموقع المباشر
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationResult.isWorking ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {verificationResult.isWorking ? "✅" : "❌"}
              </div>
              <div>
                <div
                  className={`text-lg font-bold ${verificationResult.isWorking ? "text-green-400" : "text-red-400"}`}
                >
                  {verificationResult.isWorking ? "يعمل" : "لا يعمل"}
                </div>
                <div className="text-sm text-gray-400">الموقع الرئيسي</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationResult.apiWorking ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {verificationResult.apiWorking ? "✅" : "❌"}
              </div>
              <div>
                <div
                  className={`text-lg font-bold ${verificationResult.apiWorking ? "text-green-400" : "text-red-400"}`}
                >
                  {verificationResult.apiWorking ? "يعمل" : "لا يعمل"}
                </div>
                <div className="text-sm text-gray-400">API Routes</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationResult.dataLoading ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {verificationResult.dataLoading ? "✅" : "❌"}
              </div>
              <div>
                <div
                  className={`text-lg font-bold ${verificationResult.dataLoading ? "text-green-400" : "text-red-400"}`}
                >
                  {verificationResult.dataLoading ? "يتحمل" : "لا يتحمل"}
                </div>
                <div className="text-sm text-gray-400">البيانات</div>
              </div>
            </div>
          </div>

          {verificationResult.issues.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-red-400">مشاكل مكتشفة:</h3>
              {verificationResult.issues.map((issue: string, index: number) => (
                <div key={index} className="p-3 bg-red-600/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300">{issue}</p>
                </div>
              ))}
            </div>
          )}
        </div>
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
