"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Zap, Shield, Database, Activity } from "lucide-react"
import { deploymentChecker, type DeploymentStatus } from "../lib/deployment-check"

export default function DeploymentStatusChecker() {
  const [status, setStatus] = useState<DeploymentStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [autoFixing, setAutoFixing] = useState(false)

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const result = await deploymentChecker.checkDeploymentReadiness()
      setStatus(result)
    } catch (error) {
      console.error("خطأ في فحص الحالة:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const autoFix = async () => {
    setAutoFixing(true)
    try {
      const result = await deploymentChecker.autoFix()
      console.log("نتائج الإصلاح:", result)

      // إعادة فحص الحالة بعد الإصلاح
      await checkStatus()
    } catch (error) {
      console.error("خطأ في الإصلاح:", error)
    } finally {
      setAutoFixing(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  if (!status) {
    return (
      <div className="glass-card">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3">جاري فحص جاهزية النشر...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* حالة النشر العامة */}
      <div
        className={`glass-card border-2 ${
          status.isReady ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {status.isReady ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            حالة جاهزية النشر
          </h2>
          <div className="flex gap-2">
            <button onClick={checkStatus} disabled={isChecking} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
              إعادة فحص
            </button>
            {!status.isReady && (
              <button onClick={autoFix} disabled={autoFixing} className="btn flex items-center gap-2">
                <Zap className={`w-4 h-4 ${autoFixing ? "animate-pulse" : ""}`} />
                إصلاح تلقائي
              </button>
            )}
          </div>
        </div>

        <div
          className={`text-center p-4 rounded-lg ${
            status.isReady ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          <div className="text-xl font-bold">{status.isReady ? "✅ جاهز للنشر" : "❌ غير جاهز للنشر"}</div>
          <div className="text-sm opacity-90">
            {status.isReady ? "جميع الأنظمة تعمل بشكل صحيح" : `${status.issues.length} مشكلة تحتاج حل`}
          </div>
        </div>
      </div>

      {/* حالة مصادر البيانات */}
      <div className="glass-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-400" />
          حالة مصادر البيانات
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-lg border ${
              status.dataStatus.pumpFunAPI ? "bg-green-900/20 border-green-600" : "bg-red-900/20 border-red-600"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {status.dataStatus.pumpFunAPI ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="font-semibold">Pump.fun API</span>
            </div>
            <div className="text-sm text-gray-400">{status.dataStatus.pumpFunAPI ? "متصل ويعمل" : "غير متاح"}</div>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              status.dataStatus.solanaRPC ? "bg-green-900/20 border-green-600" : "bg-yellow-900/20 border-yellow-600"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {status.dataStatus.solanaRPC ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              )}
              <span className="font-semibold">Solana RPC</span>
            </div>
            <div className="text-sm text-gray-400">
              {status.dataStatus.solanaRPC ? "متصل ويعمل" : "غير متاح (اختياري)"}
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              status.dataStatus.realDataPercentage >= 50
                ? "bg-green-900/20 border-green-600"
                : "bg-red-900/20 border-red-600"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">البيانات الحقيقية</span>
            </div>
            <div className="text-lg font-bold text-blue-400">{status.dataStatus.realDataPercentage.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* المشاكل */}
      {status.issues.length > 0 && (
        <div className="glass-card border border-red-600">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
            <XCircle className="w-6 h-6" />
            مشاكل تحتاج حل ({status.issues.length})
          </h3>
          <div className="space-y-2">
            {status.issues.map((issue, index) => (
              <div key={index} className="p-3 bg-red-900/20 border border-red-600 rounded-lg">
                <div className="text-red-300">{issue}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* التوصيات */}
      {status.recommendations.length > 0 && (
        <div className="glass-card border border-yellow-600">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-6 h-6" />
            توصيات للتحسين ({status.recommendations.length})
          </h3>
          <div className="space-y-2">
            {status.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <div className="text-yellow-300">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* إرشادات النشر */}
      {status.isReady && (
        <div className="glass-card border border-green-600">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
            <Shield className="w-6 h-6" />
            جاهز للنشر! 🚀
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-900/20 border border-green-600 rounded-lg">
              <div className="font-semibold text-green-400 mb-1">✅ جميع الأنظمة تعمل</div>
              <div className="text-sm text-green-300">البيانات الحقيقية متاحة والنظام جاهز للمستخدمين</div>
            </div>
            <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
              <div className="font-semibold text-blue-400 mb-1">📋 خطوات النشر:</div>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>
                  1. تشغيل: <code className="bg-gray-800 px-2 py-1 rounded">npm run build</code>
                </li>
                <li>2. رفع على Vercel أو Netlify</li>
                <li>3. تعيين متغيرات البيئة إذا لزم الأمر</li>
                <li>4. اختبار الموقع المنشور</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
