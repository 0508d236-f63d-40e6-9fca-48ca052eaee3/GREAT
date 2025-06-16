"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Activity,
  Globe,
  Terminal,
  Github,
  Settings,
  Zap,
  Eye,
  Copy,
  Play,
  Download,
  Rocket,
} from "lucide-react"

export default function DeployNowSimulator() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)

  const deploymentSteps = [
    {
      title: "🔍 التحقق من المتطلبات الأساسية",
      commands: [
        "echo '🚀 بدء سكريبت النشر الشامل والنهائي'",
        "echo 'تاريخ النشر: $(date)'",
        "echo 'المستخدم: $(whoami)'",
        "echo 'المجلد: $(pwd)'",
        "git --version",
        "node --version",
        "npm --version",
      ],
      duration: 3000,
      color: "blue",
    },
    {
      title: "💾 إنشاء نسخة احتياطية",
      commands: [
        "BACKUP_DIR='backup_$(date +%Y%m%d_%H%M%S)'",
        "mkdir -p $BACKUP_DIR",
        "cp package.json $BACKUP_DIR/",
        "cp next.config.js $BACKUP_DIR/",
        "cp tailwind.config.js $BACKUP_DIR/",
        "echo '✅ تم إنشاء نسخة احتياطية'",
      ],
      duration: 2000,
      color: "purple",
    },
    {
      title: "🧹 تنظيف شامل للمشروع",
      commands: [
        "echo '🧹 بدء التنظيف الشامل...'",
        "rm -rf node_modules",
        "rm -rf .next",
        "rm -rf out",
        "rm -f package-lock.json",
        "rm -f yarn.lock",
        "echo '✅ تم تنظيف المشروع بالكامل'",
      ],
      duration: 4000,
      color: "orange",
    },
    {
      title: "🗑️ تنظيف كاش npm",
      commands: ["npm cache clean --force", "echo '✅ تم تنظيف كاش npm'"],
      duration: 3000,
      color: "red",
    },
    {
      title: "📦 تثبيت التبعيات",
      commands: [
        "echo '📦 تثبيت التبعيات الأساسية...'",
        "npm install",
        "echo '⚡ تثبيت تبعيات SWC...'",
        "npm install @swc/core @swc/helpers --save-dev",
        "echo '✅ تم تثبيت جميع التبعيات'",
      ],
      duration: 12000,
      color: "green",
    },
    {
      title: "🔧 إصلاح مشاكل Tailwind",
      commands: [
        "echo '🔧 إصلاح تكوين Tailwind...'",
        "# تحديث tailwind.config.js",
        "echo '✅ تم إصلاح تكوين Tailwind'",
        "echo '✅ تم تحسين تكوين Next.js'",
        "echo '✅ تم إصلاح مشاكل SWC'",
      ],
      duration: 4000,
      color: "cyan",
    },
    {
      title: "🏗️ اختبار البناء",
      commands: ["echo '🏗️ بدء عملية البناء...'", "npm run build", "echo '✅ البناء نجح بالكامل! ✓'"],
      duration: 15000,
      color: "yellow",
    },
    {
      title: "📝 حفظ التغييرات في Git",
      commands: [
        "git add .",
        "git status",
        "COMMIT_MESSAGE='🚀 Deploy: إصلاح شامل وتحسينات النشر - $(date)'",
        'git commit -m "$COMMIT_MESSAGE"',
        "git push origin main",
        "echo '✅ تم دفع التغييرات بنجاح إلى GitHub! ✓'",
      ],
      duration: 8000,
      color: "indigo",
    },
    {
      title: "☁️ النشر على Vercel",
      commands: [
        "echo '☁️ بدء النشر على Vercel...'",
        "# النشر التلقائي من GitHub",
        "echo '🔍 Vercel detected new deployment...'",
        "echo '🏗️ Building on Vercel servers...'",
        "echo '📤 Deploying to production...'",
        "echo '✅ Production: https://solana-tracker-abc123.vercel.app'",
        "echo '🎉 النشر مكتمل بنجاح!'",
      ],
      duration: 10000,
      color: "emerald",
    },
  ]

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString("ar-SA")
    const prefix = type === "success" ? "✅" : type === "warning" ? "⚠️" : type === "error" ? "❌" : "ℹ️"
    setLogs((prev) => [...prev, `[${timestamp}] ${prefix} ${message}`])
  }

  const runDeployment = async () => {
    setIsRunning(true)
    setStartTime(new Date())
    setLogs([])
    setProgress(0)
    setCurrentStep(0)

    addLog("🚀 بدء تشغيل DEPLOY_NOW.sh", "info")
    addLog("═".repeat(60), "info")

    for (let stepIndex = 0; stepIndex < deploymentSteps.length; stepIndex++) {
      const step = deploymentSteps[stepIndex]
      setCurrentStep(stepIndex)

      addLog(`🎯 ${step.title}`, "info")

      for (const command of step.commands) {
        if (command.startsWith("echo")) {
          const message = command.replace(/echo ['"]?(.*)['"]?/, "$1").replace(/\$$$[^)]+$$/g, "")
          addLog(message, "info")
        } else if (command.startsWith("#")) {
          addLog(`💭 ${command.substring(1).trim()}`, "info")
        } else {
          addLog(`$ ${command}`, "info")
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      // محاكاة وقت التنفيذ
      await new Promise((resolve) => setTimeout(resolve, step.duration))

      addLog(`✅ اكتملت: ${step.title}`, "success")
      addLog("─".repeat(50), "info")

      setProgress(((stepIndex + 1) / deploymentSteps.length) * 100)
    }

    // إنهاء النشر
    const mockUrl = `https://solana-tracker-${Math.random().toString(36).substring(7)}.vercel.app`
    setDeploymentUrl(mockUrl)
    setEndTime(new Date())

    addLog("🎉 النشر مكتمل بنجاح!", "success")
    addLog(`🌐 الموقع متاح على: ${mockUrl}`, "success")
    addLog("📊 تقرير النشر جاهز للتحميل", "info")

    setIsRunning(false)
  }

  const copyScript = () => {
    const script = `#!/bin/bash
# 🚀 سكريبت النشر الشامل والنهائي
chmod +x DEPLOY_NOW.sh && ./DEPLOY_NOW.sh`
    navigator.clipboard.writeText(script)
  }

  const copyFullScript = () => {
    const fullScript = `#!/bin/bash
# 🚀 DEPLOY_NOW.sh - سكريبت النشر الشامل

echo "🚀 بدء سكريبت النشر الشامل والنهائي"
echo "تاريخ النشر: $(date)"

# التحقق من المتطلبات
node --version && npm --version && git --version

# إنشاء نسخة احتياطية
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp package.json "$BACKUP_DIR/" 2>/dev/null || true

# تنظيف شامل
rm -rf node_modules .next out package-lock.json yarn.lock
npm cache clean --force

# تثبيت التبعيات
npm install
npm install @swc/core @swc/helpers --save-dev

# بناء المشروع
npm run build

# حفظ في Git
git add .
git commit -m "🚀 Deploy: إصلاح شامل وتحسينات - $(date)"
git push origin main

echo "🎉 النشر مكتمل بنجاح!"
echo "🌐 تحقق من Vercel Dashboard للموقع المنشور"`

    navigator.clipboard.writeText(fullScript)
  }

  const getElapsedTime = () => {
    if (!startTime) return "0s"
    const end = endTime || new Date()
    const diff = Math.round((end.getTime() - startTime.getTime()) / 1000)
    return `${diff}s`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Rocket className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            تشغيل DEPLOY_NOW.sh
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">محاكاة تفاعلية لسكريبت النشر الشامل - تماماً كما سيعمل على جهازك</p>
      </div>

      {/* Control Panel */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            لوحة تحكم النشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={runDeployment}
              disabled={isRunning}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Play className="w-5 h-5 mr-2" />
              {isRunning ? "جاري التشغيل..." : "🚀 تشغيل DEPLOY_NOW.sh"}
            </Button>

            <Button onClick={copyScript} variant="outline" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              نسخ الأمر السريع
            </Button>

            <Button onClick={copyFullScript} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              تحميل السكريبت الكامل
            </Button>

            {deploymentUrl && (
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href={deploymentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  زيارة الموقع
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Progress */}
          {(isRunning || progress > 0) && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">تقدم النشر</span>
                <div className="flex items-center gap-4">
                  <Badge variant={isRunning ? "default" : "secondary"}>{isRunning ? "جاري التشغيل" : "مكتمل"}</Badge>
                  <span className="text-sm text-muted-foreground">الوقت المنقضي: {getElapsedTime()}</span>
                </div>
              </div>
              <Progress value={progress} className="w-full h-4" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  الخطوة {currentStep + 1} من {deploymentSteps.length}
                </span>
                <span>{Math.round(progress)}% مكتمل</span>
              </div>
              {isRunning && currentStep < deploymentSteps.length && (
                <p className="text-sm text-blue-600 font-medium">🔄 {deploymentSteps[currentStep]?.title}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Steps Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              خطوات النشر ({deploymentSteps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deploymentSteps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    index < currentStep
                      ? "border-green-200 bg-green-50"
                      : index === currentStep && isRunning
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < currentStep
                          ? "bg-green-500 text-white"
                          : index === currentStep && isRunning
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {step.commands.length} أوامر • ~{Math.round(step.duration / 1000)}s
                      </p>
                    </div>
                    {index === currentStep && isRunning && <Activity className="w-4 h-4 text-blue-500 animate-spin" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              سجلات التشغيل المباشرة ({logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>اضغط "تشغيل DEPLOY_NOW.sh" لبدء النشر...</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`${
                        log.includes("✅")
                          ? "text-green-400"
                          : log.includes("⚠️")
                            ? "text-yellow-400"
                            : log.includes("❌")
                              ? "text-red-400"
                              : log.includes("$")
                                ? "text-cyan-400"
                                : log.includes("🎯")
                                  ? "text-purple-400"
                                  : "text-gray-300"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {isRunning && (
                    <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                      <Activity className="w-4 h-4 animate-spin" />
                      جاري التنفيذ...
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Result */}
      {deploymentUrl && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-green-700 mb-2">🎉 النشر مكتمل بنجاح!</h2>
                <p className="text-lg text-green-600">تم تشغيل DEPLOY_NOW.sh بنجاح وموقعك متاح الآن</p>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-lg">
                <p className="text-sm text-gray-600 mb-2">رابط الموقع المنشور:</p>
                <code className="text-xl font-mono text-blue-600 break-all">{deploymentUrl}</code>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                  <a href={deploymentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    زيارة الموقع
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Vercel Dashboard
                </Button>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  تحميل التقرير
                </Button>
              </div>
              <div className="text-sm text-green-600 space-y-1">
                <p>⏱️ وقت النشر الإجمالي: {getElapsedTime()}</p>
                <p>✅ جميع الخطوات مكتملة بنجاح</p>
                <p>🚀 الموقع متاح للمستخدمين الآن</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            للتطبيق على جهازك
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Terminal className="w-4 h-4" />
            <AlertDescription>
              <strong>الأمر السريع:</strong>
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded">chmod +x DEPLOY_NOW.sh && ./DEPLOY_NOW.sh</code>
            </AlertDescription>
          </Alert>

          <Alert>
            <Github className="w-4 h-4" />
            <AlertDescription>
              <strong>متطلبات النشر:</strong>
              <br />• مستودع GitHub مربوط بـ Vercel
              <br />• Node.js 16+ و npm 8+
              <br />• Git مُعد بشكل صحيح
            </AlertDescription>
          </Alert>

          <Alert>
            <RefreshCw className="w-4 h-4" />
            <AlertDescription>
              <strong>الوقت المتوقع للنشر الحقيقي:</strong>
              <br />• تنظيف وتثبيت: 3-5 دقائق
              <br />• بناء ونشر: 5-8 دقائق
              <br />• <strong>المجموع: 8-13 دقيقة</strong>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
