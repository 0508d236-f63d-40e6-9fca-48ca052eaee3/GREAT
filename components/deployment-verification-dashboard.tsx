"use client"

import { useState, useEffect } from "react"
import { RefreshCw, AlertTriangle, CheckCircle, ExternalLink, Upload, Trash2, Globe } from "lucide-react"

import { deploymentVerification, type DeploymentVerification } from "../lib/deployment-verification"

export default function DeploymentVerificationDashboard() {
  const [verification, setVerification] = useState<DeploymentVerification | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [lastCheck, setLastCheck] = useState<string>("")

  /**
   * 🔍 فحص النشر
   */
  const checkDeployment = async () => {
    setIsChecking(true)

    try {
      console.log("🔍 فحص النشر الفعلي...")

      const result = await deploymentVerification.verifyLiveDeployment()
      setVerification(result)
      setLastCheck(new Date().toLocaleTimeString())

      console.log("✅ تم فحص النشر:", result)
    } catch (error) {
      console.error("❌ خطأ في فحص النشر:", error)
    } finally {
      setIsChecking(false)
    }
  }

  /**
   * 🚀 إجبار نشر جديد
   */
  const forceDeploy = async () => {
    setIsDeploying(true)

    try {
      console.log("🚀 إجبار نشر جديد...")

      const result = await deploymentVerification.forceDeploy()

      if (result.success) {
        alert(`✅ ${result.message}\n\nانتظر 2-3 دقائق ثم تحقق من الموقع المباشر`)
        // إعادة فحص بعد 3 دقائق
        setTimeout(() => {
          checkDeployment()
        }, 180000)
      } else {
        alert(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error("❌ خطأ في النشر:", error)
      alert("❌ فشل في إجبار النشر")
    } finally {
      setIsDeploying(false)
    }
  }

  /**
   * 🧹 مسح الكاش
   */
  const clearCache = async () => {
    setIsClearingCache(true)

    try {
      console.log("🧹 مسح الكاش...")

      const result = await deploymentVerification.clearCache()

      if (result.success) {
        alert(`✅ ${result.message}\n\nسيتم إعادة تحميل الصفحة`)
      } else {
        alert(`❌ ${result.message}`)
      }
    } catch (error) {
      console.error("❌ خطأ في مسح الكاش:", error)
      alert("❌ فشل في مسح الكاش")
    } finally {
      setIsClearingCache(false)
    }
  }

  /**
   * 🌐 فتح الموقع المباشر
   */
  const openLiveSite = () => {
    if (verification?.deploymentUrl) {
      window.open(verification.deploymentUrl, "_blank")
    }
  }

  // فحص أولي عند التحميل
  useEffect(() => {
    checkDeployment()
  }, [])

  const getStatusColor = (isLive: boolean, buildMatches: boolean) => {
    if (!isLive) return "text-red-400"
    if (!buildMatches) return "text-yellow-400"
    return "text-green-400"
  }

  const getStatusIcon = (isLive: boolean, buildMatches: boolean) => {
    if (!isLive) return <AlertTriangle className="w-6 h-6 text-red-400" />
    if (!buildMatches) return <RefreshCw className="w-6 h-6 text-yellow-400" />
    return <CheckCircle className="w-6 h-6 text-green-400" />
  }

  const getStatusText = (isLive: boolean, buildMatches: boolean) => {
    if (!isLive) return "🔴 الموقع غير متاح"
    if (!buildMatches) return "🟡 إصدار قديم منشور"
    return "🟢 النشر محدث"
  }

  if (isChecking && !verification) {
    return (
      <div className="glass-card text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-300">فحص الموقع المنشور...</p>
        <p className="text-sm text-gray-400 mt-2">التحقق من النشر الفعلي والإصدار المباشر...</p>
      </div>
    )
  }

  if (!verification) {
    return (
      <div className="glass-card text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">فشل في فحص النشر</h3>
        <p className="text-gray-400 mb-6">لا يمكن التحقق من حالة الموقع المنشور</p>
        <button onClick={checkDeployment} className="btn-secondary flex items-center gap-2 mx-auto">
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
              {getStatusIcon(verification.isLive, verification.buildMatches)}
              <div>
                <h1 className="text-2xl font-bold">🔍 فحص النشر الفعلي</h1>
                <p className="text-gray-400">التحقق من الموقع المنشور والإصدار المباشر</p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-bold ${
                verification.isLive && verification.buildMatches
                  ? "bg-green-600 text-white"
                  : !verification.isLive
                    ? "bg-red-600 text-white"
                    : "bg-yellow-600 text-white"
              }`}
            >
              {getStatusText(verification.isLive, verification.buildMatches)}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={checkDeployment} disabled={isChecking} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "فحص..." : "إعادة فحص"}
            </button>
            <button onClick={openLiveSite} className="btn-secondary flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              فتح الموقع
            </button>
          </div>
        </div>

        {/* Quick Status */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            <div>
              <div className={`text-lg font-bold ${getStatusColor(verification.isLive, verification.buildMatches)}`}>
                {verification.isLive ? "🟢 متاح" : "🔴 غير متاح"}
              </div>
              <div className="text-sm text-gray-400">حالة الموقع</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-purple-400" />
            <div>
              <div className={`text-lg font-bold ${verification.buildMatches ? "text-green-400" : "text-yellow-400"}`}>
                {verification.buildMatches ? "✅ محدث" : "⚠️ قديم"}
              </div>
              <div className="text-sm text-gray-400">حالة الإصدار</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-lg font-bold text-red-400">{verification.issues.length}</div>
              <div className="text-sm text-gray-400">مشاكل مكتشفة</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-lg font-bold text-cyan-400">{lastCheck}</div>
              <div className="text-sm text-gray-400">آخر فحص</div>
            </div>
          </div>
        </div>
      </div>

      {/* Build Information */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          معلومات النشر
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">الموقع المنشور:</span>
              <a
                href={verification.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                زيارة الموقع
              </a>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">حالة الموقع:</span>
              <span className={`font-semibold ${getStatusColor(verification.isLive, verification.buildMatches)}`}>
                {verification.isLive ? "🟢 يعمل" : "🔴 لا يعمل"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">آخر نشر:</span>
              <span className="font-semibold text-gray-300">{verification.lastDeployTime}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">الإصدار المتوقع:</span>
              <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded text-blue-400">
                {verification.expectedBuild.slice(0, 20)}...
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">الإصدار المنشور:</span>
              <span
                className={`font-mono text-sm px-2 py-1 rounded ${
                  verification.buildMatches ? "bg-green-800 text-green-300" : "bg-yellow-800 text-yellow-300"
                }`}
              >
                {verification.currentBuild.slice(0, 20)}...
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">تطابق الإصدار:</span>
              <span className={`font-semibold ${verification.buildMatches ? "text-green-400" : "text-yellow-400"}`}>
                {verification.buildMatches ? "✅ متطابق" : "⚠️ غير متطابق"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {verification.issues.length > 0 && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            المشاكل المكتشفة ({verification.issues.length})
          </h2>

          <div className="space-y-3">
            {verification.issues.map((issue, index) => (
              <div key={index} className="p-4 bg-red-600/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-300 font-medium">{issue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-400" />
          التوصيات والحلول
        </h2>

        <div className="space-y-3 mb-6">
          {verification.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                recommendation.includes("✅")
                  ? "bg-green-600/10 border-green-500"
                  : recommendation.includes("🚨")
                    ? "bg-red-600/10 border-red-500"
                    : "bg-yellow-600/10 border-yellow-500"
              }`}
            >
              <p className="text-gray-300">{recommendation}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={forceDeploy}
            disabled={isDeploying}
            className="btn-secondary flex items-center gap-2 justify-center bg-blue-600/20 border-blue-500/30 text-blue-300"
          >
            <Upload className={`w-4 h-4 ${isDeploying ? "animate-pulse" : ""}`} />
            {isDeploying ? "جاري النشر..." : "إجبار نشر جديد"}
          </button>

          <button
            onClick={clearCache}
            disabled={isClearingCache}
            className="btn-secondary flex items-center gap-2 justify-center bg-purple-600/20 border-purple-500/30 text-purple-300"
          >
            <Trash2 className={`w-4 h-4 ${isClearingCache ? "animate-pulse" : ""}`} />
            {isClearingCache ? "جاري المسح..." : "مسح الكاش"}
          </button>

          <button
            onClick={checkDeployment}
            disabled={isChecking}
            className="btn-secondary flex items-center gap-2 justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "جاري الفحص..." : "إعادة فحص"}
          </button>
        </div>

        {/* Critical Action */}
        {!verification.buildMatches && (
          <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
            <h3 className="font-semibold text-yellow-400 mb-3">⚠️ إجراء مطلوب</h3>
            <p className="text-gray-300 mb-4">
              الإصدار المنشور قديم ولا يحتوي على آخر التحديثات. يجب إجراء نشر جديد لتحديث الموقع المباشر.
            </p>
            <button
              onClick={forceDeploy}
              disabled={isDeploying}
              className="btn-secondary flex items-center gap-2 bg-yellow-600/20 border-yellow-500/30 text-yellow-300"
            >
              <Upload className={`w-4 h-4 ${isDeploying ? "animate-pulse" : ""}`} />
              {isDeploying ? "جاري النشر..." : "نشر التحديثات الآن"}
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
