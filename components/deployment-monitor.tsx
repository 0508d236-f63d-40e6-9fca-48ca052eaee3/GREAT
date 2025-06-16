"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Activity, Zap, Globe } from "lucide-react"
import { vercelDeployment } from "../lib/vercel-deployment"

export default function DeploymentMonitor() {
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkDeployment()

    // فحص دوري كل 30 ثانية
    const interval = setInterval(checkDeployment, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkDeployment = async () => {
    try {
      const status = await vercelDeployment.checkDeploymentStatus()
      setDeploymentStatus(status)

      if (status.isDeployed) {
        vercelDeployment.trackDeploymentEvent("status_check", status)
      }
    } catch (error) {
      console.error("خطأ في فحص النشر:", error)
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="glass-card">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3">فحص حالة النشر...</span>
        </div>
      </div>
    )
  }

  if (!deploymentStatus) {
    return (
      <div className="glass-card border border-red-600">
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-bold text-red-400 mb-2">خطأ في فحص النشر</h3>
          <p className="text-gray-400">لا يمكن الحصول على معلومات النشر</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* حالة النشر الرئيسية */}
      <div
        className={`glass-card border-2 ${
          deploymentStatus.isDeployed ? "border-green-500 bg-green-900/20" : "border-yellow-500 bg-yellow-900/20"
        }`}
      >
        <div className="text-center">
          {deploymentStatus.isDeployed ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h2 className="text-2xl font-bold text-green-400 mb-2">🚀 تم النشر بنجاح!</h2>
              <p className="text-green-300 mb-4">منصة GREAT منشورة ومتاحة للمستخدمين</p>
              {deploymentStatus.url && (
                <a
                  href={deploymentStatus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn flex items-center gap-2 mx-auto w-fit"
                >
                  <Globe className="w-4 h-4" />
                  زيارة الموقع
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </>
          ) : (
            <>
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">🔧 وضع التطوير</h2>
              <p className="text-yellow-300 mb-4">المشروع يعمل محلياً - جاهز للنشر على Vercel</p>
              <div className="bg-gray-800 rounded-lg p-4 text-left">
                <h4 className="font-bold mb-2">خطوات النشر:</h4>
                <ol className="text-sm space-y-1 text-gray-300">
                  <li>
                    1. <code className="bg-gray-700 px-2 py-1 rounded">npm install -g vercel</code>
                  </li>
                  <li>
                    2. <code className="bg-gray-700 px-2 py-1 rounded">vercel login</code>
                  </li>
                  <li>
                    3. <code className="bg-gray-700 px-2 py-1 rounded">vercel --prod</code>
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>

      {/* معلومات الأداء */}
      {deploymentStatus.performance && (
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            مقاييس الأداء
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-400">{deploymentStatus.performance.responseTime}ms</div>
              <div className="text-sm text-gray-400">زمن الاستجابة</div>
            </div>

            {deploymentStatus.performance.vitals?.fcp && (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(deploymentStatus.performance.vitals.fcp)}ms
                </div>
                <div className="text-sm text-gray-400">First Contentful Paint</div>
              </div>
            )}

            {deploymentStatus.performance.vitals?.lcp && (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(deploymentStatus.performance.vitals.lcp)}ms
                </div>
                <div className="text-sm text-gray-400">Largest Contentful Paint</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* معلومات تقنية */}
      <div className="glass-card">
        <h3 className="text-xl font-bold mb-4">معلومات تقنية</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-blue-400 mb-2">البيئة:</div>
            <div className="space-y-1">
              <div>الحالة: {deploymentStatus.status}</div>
              <div>المنصة: {deploymentStatus.isDeployed ? "Vercel" : "Local"}</div>
              <div>النسخة: 2.0.0</div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-green-400 mb-2">الميزات:</div>
            <div className="space-y-1">
              <div>✅ بيانات حقيقية من pump.fun</div>
              <div>✅ تحليل ذكي بالـ AI</div>
              <div>✅ واجهة محسنة</div>
              <div>✅ أداء عالي</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
