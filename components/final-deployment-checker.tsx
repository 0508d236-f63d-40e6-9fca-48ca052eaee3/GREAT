"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, RefreshCw, ExternalLink, Zap } from "lucide-react"

import { finalDeploymentVerification, type FinalDeploymentCheck } from "../lib/deployment-verification-final"

export default function FinalDeploymentChecker() {
  const [checkResult, setCheckResult] = useState<FinalDeploymentCheck | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [quickCheckResult, setQuickCheckResult] = useState<{ isFixed: boolean; message: string } | null>(null)

  /**
   * 🔍 فحص شامل
   */
  const performFullCheck = async () => {
    setIsChecking(true)
    try {
      const result = await finalDeploymentVerification.performFinalCheck()
      setCheckResult(result)
    } catch (error) {
      console.error("خطأ في الفحص:", error)
    } finally {
      setIsChecking(false)
    }
  }

  /**
   * ⚡ فحص سريع
   */
  const performQuickCheck = async () => {
    try {
      const result = await finalDeploymentVerification.quickCheck()
      setQuickCheckResult(result)
    } catch (error) {
      console.error("خطأ في الفحص السريع:", error)
    }
  }

  // فحص أولي عند التحميل
  useEffect(() => {
    performQuickCheck()
    performFullCheck()
  }, [])

  const getStatusColor = (status: boolean) => {
    return status ? "text-green-400" : "text-red-400"
  }

  const getStatusIcon = (status: boolean) => {
    return status ? "✅" : "❌"
  }

  return (
    <div className="space-y-6">
      {/* Quick Check */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />⚡ فحص سريع للمشكلة
          </h2>
          <button onClick={performQuickCheck} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            فحص سريع
          </button>
        </div>

        {quickCheckResult && (
          <div
            className={`p-4 rounded-lg border ${
              quickCheckResult.isFixed ? "bg-green-600/10 border-green-500/30" : "bg-red-600/10 border-red-500/30"
            }`}
          >
            <p className={`font-semibold ${quickCheckResult.isFixed ? "text-green-400" : "text-red-400"}`}>
              {quickCheckResult.message}
            </p>
          </div>
        )}
      </div>

      {/* Full Check */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-400" />🔍 فحص شامل للنشر
          </h2>
          <button onClick={performFullCheck} disabled={isChecking} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "جاري الفحص..." : "فحص شامل"}
          </button>
        </div>

        {isChecking && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">جاري فحص جميع جوانب النشر...</p>
          </div>
        )}

        {checkResult && !isChecking && (
          <div className="space-y-6">
            {/* Status Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getStatusIcon(checkResult.siteWorking)}</span>
                  <span className={`font-semibold ${getStatusColor(checkResult.siteWorking)}`}>الموقع الرئيسي</span>
                </div>
                <p className="text-sm text-gray-400">{checkResult.siteWorking ? "يعمل بشكل صحيح" : "لا يعمل"}</p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getStatusIcon(checkResult.apiWorking)}</span>
                  <span className={`font-semibold ${getStatusColor(checkResult.apiWorking)}`}>API Routes</span>
                </div>
                <p className="text-sm text-gray-400">{checkResult.apiWorking ? "تعمل بشكل صحيح" : "لا تعمل"}</p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getStatusIcon(checkResult.dataLoading)}</span>
                  <span className={`font-semibold ${getStatusColor(checkResult.dataLoading)}`}>تحميل البيانات</span>
                </div>
                <p className="text-sm text-gray-400">{checkResult.dataLoading ? "يعمل بشكل صحيح" : "لا يعمل"}</p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getStatusIcon(checkResult.staticExportDisabled)}</span>
                  <span className={`font-semibold ${getStatusColor(checkResult.staticExportDisabled)}`}>
                    Static Export
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {checkResult.staticExportDisabled ? "معطل (صحيح)" : "مفعل (خطأ)"}
                </p>
              </div>
            </div>

            {/* Build Info */}
            <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">معلومات البناء</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Build Time:</span>
                  <span className="ml-2 text-white">{checkResult.buildTime}</span>
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>
                  <span className="ml-2 text-white">{checkResult.version}</span>
                </div>
              </div>
            </div>

            {/* Issues */}
            {checkResult.issues.length > 0 && (
              <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-lg">
                <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  مشاكل مكتشفة ({checkResult.issues.length})
                </h3>
                <div className="space-y-2">
                  {checkResult.issues.map((issue, index) => (
                    <div key={index} className="text-red-300 text-sm">
                      • {issue}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {checkResult.recommendations.length > 0 && (
              <div className="p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  التوصيات ({checkResult.recommendations.length})
                </h3>
                <div className="space-y-2">
                  {checkResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="text-green-300 text-sm">
                      • {recommendation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="font-semibold mb-3">روابط الفحص المباشر</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  API Health
                </a>
                <a
                  href="/api/deployment-check"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Deployment Check
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-2">إذا فتحت هذه الروابط وظهرت بيانات JSON، فالمشكلة محلولة 100%</p>
            </div>
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
