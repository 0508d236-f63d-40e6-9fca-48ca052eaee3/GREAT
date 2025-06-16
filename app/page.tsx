"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Play, Pause, Square, RotateCcw, Copy, ExternalLink } from "lucide-react"
import EnhancedTokenDashboard from "@/components/enhanced-token-dashboard"

const deploymentSteps = [
  {
    id: 1,
    title: "🔧 إعداد البيئة",
    description: "فحص Node.js, npm, Git والمتطلبات الأساسية",
    command: "node --version && npm --version && git --version",
    expectedOutput: "v18.17.0\n9.6.7\ngit version 2.40.1",
    duration: 2000,
    tips: "تأكد من وجود Node.js 16+ و npm 8+",
  },
  {
    id: 2,
    title: "🧹 تنظيف المشروع",
    description: "حذف الملفات القديمة وتنظيف الكاش",
    command: "rm -rf node_modules .next package-lock.json",
    expectedOutput: "✅ تم حذف الملفات القديمة بنجاح",
    duration: 3000,
    tips: "هذا يضمن بداية نظيفة بدون تعارضات",
  },
  {
    id: 3,
    title: "🗑️ تنظيف كاش npm",
    description: "تنظيف كاش npm لتجنب المشاكل",
    command: "npm cache clean --force",
    expectedOutput: "npm WARN using --force Recommended protections disabled.\n✅ تم تنظيف الكاش بنجاح",
    duration: 2500,
    tips: "يحل مشاكل التبعيات المتضاربة",
  },
  {
    id: 4,
    title: "📦 تثبيت التبعيات",
    description: "تثبيت جميع التبعيات + SWC للأداء",
    command: "npm install && npm install @swc/core @swc/helpers --save-dev",
    expectedOutput: "added 1247 packages in 45s\n✅ تم تثبيت جميع التبعيات بنجاح",
    duration: 8000,
    tips: "SWC يحسن سرعة البناء بشكل كبير",
  },
  {
    id: 5,
    title: "🔧 إصلاح التكوينات",
    description: "إصلاح Tailwind و Next.js configs",
    command: "echo 'تحديث tailwind.config.js و next.config.js'",
    expectedOutput: "✅ تم إصلاح تكوين Tailwind CSS\n✅ تم تحسين إعدادات Next.js\n✅ تم حل مشاكل SWC",
    duration: 3000,
    tips: "يحل مشاكل node_modules في Tailwind",
  },
  {
    id: 6,
    title: "🏗️ بناء المشروع",
    description: "npm run build واختبار البناء",
    command: "npm run build",
    expectedOutput: "✓ Creating an optimized production build\n✓ Compiled successfully\n✅ البناء مكتمل بنجاح!",
    duration: 12000,
    tips: "إذا فشل البناء، راجع الأخطاء وأصلحها",
  },
  {
    id: 7,
    title: "📝 حفظ في Git",
    description: "إنشاء commit ودفع التغييرات",
    command: "git add . && git commit -m '🚀 Deploy: إصلاح مشاكل SWC وTailwind' && git push origin main",
    expectedOutput:
      "[main 7a8b9c2] 🚀 Deploy: إصلاح مشاكل SWC وTailwind\n 15 files changed, 234 insertions(+)\n✅ تم دفع التغييرات بنجاح",
    duration: 5000,
    tips: "تأكد من ربط المستودع بـ GitHub",
  },
  {
    id: 8,
    title: "☁️ النشر على Vercel",
    description: "رفع ونشر الموقع تلقائياً",
    command: "vercel --prod",
    expectedOutput:
      "🔍 Inspect: https://vercel.com/deployments/abc123\n✅ Production: https://your-project.vercel.app\n🎉 النشر مكتمل بنجاح!",
    duration: 15000,
    tips: "النشر التلقائي يحدث عند git push",
  },
]

type StepStatus = "pending" | "running" | "completed" | "error"

export default function Home() {
  const [showDeployment, setShowDeployment] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(new Array(deploymentSteps.length).fill("pending"))
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("ar-SA")
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const runStep = async (stepIndex: number) => {
    const step = deploymentSteps[stepIndex]

    // Update status to running
    setStepStatuses((prev) => {
      const newStatuses = [...prev]
      newStatuses[stepIndex] = "running"
      return newStatuses
    })

    addLog(`🚀 بدء الخطوة ${stepIndex + 1}: ${step.title}`)
    addLog(`📝 الأمر: ${step.command}`)

    // Simulate command execution
    await new Promise((resolve) => setTimeout(resolve, step.duration))

    // Add expected output to logs
    step.expectedOutput.split("\n").forEach((line) => {
      if (line.trim()) addLog(`📤 ${line}`)
    })

    // Update status to completed
    setStepStatuses((prev) => {
      const newStatuses = [...prev]
      newStatuses[stepIndex] = "completed"
      return newStatuses
    })

    addLog(`✅ اكتملت الخطوة ${stepIndex + 1} بنجاح`)
    addLog(`💡 نصيحة: ${step.tips}`)
    addLog("─".repeat(50))

    // Update progress
    setProgress(((stepIndex + 1) / deploymentSteps.length) * 100)
  }

  const runAllSteps = async () => {
    if (isPaused) {
      setIsPaused(false)
      setIsRunning(true)
      return
    }

    setIsRunning(true)
    setStartTime(new Date())
    addLog("🎬 بدء محاكاة النشر التفاعلية...")
    addLog("═".repeat(50))

    for (let i = currentStep; i < deploymentSteps.length; i++) {
      if (!isRunning || isPaused) break

      setCurrentStep(i)
      await runStep(i)

      // Small delay between steps
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    if (currentStep === deploymentSteps.length - 1 && !isPaused) {
      setIsRunning(false)
      addLog("🎉 تم إكمال جميع خطوات النشر بنجاح!")
      addLog("🌐 الموقع متاح الآن على: https://your-project.vercel.app")
      addLog("📊 تقرير النشر جاهز للتحميل")
    }
  }

  const pauseDeployment = () => {
    setIsPaused(true)
    setIsRunning(false)
    addLog("⏸️ تم إيقاف النشر مؤقتاً")
  }

  const stopDeployment = () => {
    setIsRunning(false)
    setIsPaused(false)
    addLog("⏹️ تم إيقاف النشر")
  }

  const resetDeployment = () => {
    setCurrentStep(0)
    setStepStatuses(new Array(deploymentSteps.length).fill("pending"))
    setIsRunning(false)
    setIsPaused(false)
    setLogs([])
    setProgress(0)
    setStartTime(null)
    setElapsedTime(0)
  }

  const copyAllCommands = () => {
    const allCommands = deploymentSteps.map((step) => step.command).join("\n")
    navigator.clipboard.writeText(allCommands)
    addLog("📋 تم نسخ جميع الأوامر إلى الحافظة")
  }

  const runSingleStep = async (stepIndex: number) => {
    setCurrentStep(stepIndex)
    await runStep(stepIndex)
  }

  if (!showDeployment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">🚀 Solana Token Tracker</h1>
            <p className="text-xl text-gray-600">مراقبة الرموز المميزة في الوقت الفعلي مع محاكاة النشر التفاعلية</p>
          </div>

          {/* Main Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Token Dashboard */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📊 لوحة تحكم الرموز</CardTitle>
                <CardDescription>مراقبة وتحليل الرموز المميزة من Pump.fun</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowDeployment(false)} className="w-full" variant="outline">
                  عرض لوحة التحكم
                </Button>
              </CardContent>
            </Card>

            {/* Deployment Simulator */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🎬 محاكاة النشر التفاعلية</CardTitle>
                <CardDescription>شاهد عملية النشر خطوة بخطوة مع التحكم الكامل</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowDeployment(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                  🚀 بدء المحاكاة التفاعلية
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold">سرعة عالية</h3>
                <p className="text-sm text-gray-600">بيانات فورية ومحدثة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="font-semibold">إصلاح تلقائي</h3>
                <p className="text-sm text-gray-600">حل مشاكل SWC و Tailwind</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold">نشر سهل</h3>
                <p className="text-sm text-gray-600">نشر بنقرة واحدة</p>
              </CardContent>
            </Card>
          </div>

          {/* Token Dashboard */}
          <EnhancedTokenDashboard />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎬 محاكاة النشر التفاعلية</h1>
            <p className="text-gray-600">شاهد عملية النشر خطوة بخطوة مع التحكم الكامل</p>
          </div>
          <Button onClick={() => setShowDeployment(false)} variant="outline">
            العودة للرئيسية
          </Button>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📊 تقدم النشر</CardTitle>
              <Badge variant={isRunning ? "default" : isPaused ? "secondary" : "outline"}>
                {isRunning ? "جاري التشغيل" : isPaused ? "متوقف مؤقتاً" : "في الانتظار"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  الخطوة {currentStep + 1} من {deploymentSteps.length}
                </span>
                <span>{Math.round(progress)}% مكتمل</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>🎮 أدوات التحكم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={runAllSteps} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                {isPaused ? "استئناف" : "بدء النشر التفاعلي"}
              </Button>

              <Button onClick={pauseDeployment} disabled={!isRunning} variant="outline">
                <Pause className="w-4 h-4 mr-2" />
                إيقاف مؤقت
              </Button>

              <Button onClick={stopDeployment} disabled={!isRunning && !isPaused} variant="destructive">
                <Square className="w-4 h-4 mr-2" />
                إيقاف
              </Button>

              <Button onClick={resetDeployment} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                إعادة تعيين
              </Button>

              <Button onClick={copyAllCommands} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                نسخ جميع الأوامر
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>📋 خطوات النشر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deploymentSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      stepStatuses[index] === "completed"
                        ? "border-green-200 bg-green-50"
                        : stepStatuses[index] === "running"
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {stepStatuses[index] === "completed" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : stepStatuses[index] === "running" ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                          <h3 className="font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        <code className="text-xs bg-gray-100 p-2 rounded block mb-2">{step.command}</code>
                        <p className="text-xs text-blue-600">💡 {step.tips}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => runSingleStep(index)} disabled={isRunning}>
                        تشغيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader>
              <CardTitle>📝 سجلات النشر المباشرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">في انتظار بدء النشر...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final Result */}
        {progress === 100 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 النشر مكتمل بنجاح!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-700">تم نشر مشروعك بنجاح! يمكنك الآن زيارة الموقع والتأكد من التحديثات.</p>
                <div className="flex gap-3">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    زيارة الموقع المنشور
                  </Button>
                  <Button variant="outline">📊 تحميل تقرير النشر</Button>
                  <Button variant="outline">☁️ فتح Vercel Dashboard</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
