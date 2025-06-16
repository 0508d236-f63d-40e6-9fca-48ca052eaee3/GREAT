"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertTriangle,
  Clock,
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
} from "lucide-react"

interface DeploymentStep {
  id: string
  title: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  duration?: number
  details?: string[]
  command?: string
}

export default function VercelDeploymentSimulator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [logs, setLogs] = useState<string[]>([])

  const deploymentSteps: DeploymentStep[] = [
    {
      id: "setup",
      title: "🔧 إعداد البيئة",
      description: "التحقق من المتطلبات الأساسية",
      status: "pending",
      details: ["فحص Node.js: ✅ v18.17.0", "فحص npm: ✅ v9.6.7", "فحص Git: ✅ v2.41.0", "فحص package.json: ✅ موجود"],
      command: "node --version && npm --version && git --version",
    },
    {
      id: "clean",
      title: "🧹 تنظيف المشروع",
      description: "حذف الملفات القديمة والكاش",
      status: "pending",
      details: ["حذف node_modules...", "حذف .next...", "حذف package-lock.json...", "تنظيف كاش npm..."],
      command: "rm -rf node_modules .next package-lock.json && npm cache clean --force",
    },
    {
      id: "install",
      title: "📦 تثبيت التبعيات",
      description: "تثبيت جميع الحزم المطلوبة",
      status: "pending",
      details: [
        "تثبيت التبعيات الأساسية...",
        "تثبيت @swc/core...",
        "تثبيت @swc/helpers...",
        "تحديث package-lock.json...",
      ],
      command: "npm install && npm install @swc/core @swc/helpers --save-dev",
    },
    {
      id: "fix",
      title: "🔧 إصلاح التكوينات",
      description: "إصلاح مشاكل SWC و Tailwind",
      status: "pending",
      details: [
        "إصلاح tailwind.config.js...",
        "تحسين next.config.js...",
        "تحديث tsconfig.json...",
        "إصلاح مشاكل SWC...",
      ],
      command: "تحديث ملفات التكوين تلقائياً",
    },
    {
      id: "build",
      title: "🏗️ بناء المشروع",
      description: "تجميع وتحسين الملفات",
      status: "pending",
      details: ["تجميع صفحات Next.js...", "تحسين CSS و JavaScript...", "إنشاء ملفات الإنتاج...", "فحص الأخطاء..."],
      command: "npm run build",
    },
    {
      id: "git",
      title: "📝 حفظ التغييرات",
      description: "إنشاء commit ودفع التغييرات",
      status: "pending",
      details: ["إضافة الملفات المحدثة...", "إنشاء commit جديد...", "دفع إلى GitHub...", "تحديث المستودع..."],
      command: "git add . && git commit -m '🚀 Deploy: إصلاح شامل' && git push",
    },
    {
      id: "deploy",
      title: "☁️ النشر على Vercel",
      description: "رفع المشروع إلى الإنتاج",
      status: "pending",
      details: ["اكتشاف التغييرات الجديدة...", "بدء عملية النشر...", "بناء المشروع على Vercel...", "نشر الموقع..."],
      command: "vercel --prod",
    },
    {
      id: "verify",
      title: "✅ التحقق من النشر",
      description: "فحص الموقع المنشور",
      status: "pending",
      details: ["فحص حالة الموقع...", "اختبار الصفحات الأساسية...", "التحقق من الأداء...", "إنشاء تقرير النشر..."],
      command: "curl -I https://your-site.vercel.app",
    },
  ]

  const [steps, setSteps] = useState(deploymentSteps)

  const startDeployment = async () => {
    setIsDeploying(true)
    setCurrentStep(0)
    setLogs([])

    // إعادة تعيين حالة الخطوات
    const resetSteps = steps.map((step) => ({ ...step, status: "pending" as const }))
    setSteps(resetSteps)

    // تشغيل الخطوات تدريجياً
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)

      // تحديث حالة الخطوة الحالية إلى "running"
      setSteps((prev) => prev.map((step, index) => (index === i ? { ...step, status: "running" } : step)))

      // إضافة logs
      const step = steps[i]
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] بدء ${step.title}`])

      if (step.details) {
        for (const detail of step.details) {
          await new Promise((resolve) => setTimeout(resolve, 800))
          setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${detail}`])
        }
      }

      // محاكاة وقت التنفيذ
      const duration = Math.random() * 3000 + 2000 // 2-5 ثواني
      await new Promise((resolve) => setTimeout(resolve, duration))

      // تحديث حالة الخطوة إلى "completed"
      setSteps((prev) =>
        prev.map((step, index) =>
          index === i ? { ...step, status: "completed", duration: Math.round(duration / 1000) } : step,
        ),
      )

      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ اكتمل ${step.title} في ${Math.round(duration / 1000)}s`,
      ])
    }

    // إنشاء رابط الموقع المنشور
    const mockUrl = `https://solana-tracker-${Math.random().toString(36).substring(7)}.vercel.app`
    setDeploymentUrl(mockUrl)

    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🎉 النشر مكتمل بنجاح!`,
      `[${new Date().toLocaleTimeString()}] 🌐 الموقع متاح على: ${mockUrl}`,
    ])

    setIsDeploying(false)
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "running":
        return <Activity className="w-5 h-5 text-blue-500 animate-spin" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getProgressPercentage = () => {
    const completedSteps = steps.filter((step) => step.status === "completed").length
    return Math.round((completedSteps / steps.length) * 100)
  }

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <img src="/placeholder.svg?height=40&width=40&text=▲" alt="Vercel" className="w-10 h-10" />
          <h1 className="text-3xl font-bold">🚀 محاكاة النشر على Vercel</h1>
        </div>
        <p className="text-muted-foreground">تجربة تفاعلية لعملية النشر الشاملة - تماماً كما ستحدث على جهازك</p>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            لوحة التحكم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Button onClick={startDeployment} disabled={isDeploying} size="lg" className="flex items-center gap-2">
              <Play className={`w-4 h-4 ${isDeploying ? "animate-spin" : ""}`} />
              {isDeploying ? "جاري النشر..." : "🚀 بدء النشر التجريبي"}
            </Button>

            {deploymentUrl && (
              <Button asChild variant="outline">
                <a href={deploymentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  زيارة الموقع
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {isDeploying && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم الإجمالي</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="steps">خطوات النشر</TabsTrigger>
          <TabsTrigger value="logs">السجلات المباشرة</TabsTrigger>
          <TabsTrigger value="commands">الأوامر الفعلية</TabsTrigger>
        </TabsList>

        {/* خطوات النشر */}
        <TabsContent value="steps">
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <Card
                key={step.id}
                className={`transition-all duration-300 ${
                  step.status === "running"
                    ? "border-blue-500 shadow-lg"
                    : step.status === "completed"
                      ? "border-green-500"
                      : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">{index + 1}</div>
                      {getStepIcon(step.status)}
                      {step.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {step.duration && (
                        <Badge variant="secondary" className="text-xs">
                          {step.duration}s
                        </Badge>
                      )}
                      <Badge
                        variant={
                          step.status === "completed" ? "default" : step.status === "running" ? "secondary" : "outline"
                        }
                      >
                        {step.status === "completed"
                          ? "مكتمل"
                          : step.status === "running"
                            ? "جاري التنفيذ"
                            : "في الانتظار"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  {step.details && step.status !== "pending" && (
                    <div className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="text-sm font-mono bg-muted p-2 rounded">
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* السجلات المباشرة */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                السجلات المباشرة ({logs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">اضغط "بدء النشر التجريبي" لمشاهدة السجلات...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
                {isDeploying && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Activity className="w-4 h-4 animate-spin" />
                    جاري التنفيذ...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الأوامر الفعلية */}
        <TabsContent value="commands">
          <div className="space-y-4">
            <Alert>
              <Terminal className="w-4 h-4" />
              <AlertDescription>هذه هي الأوامر الفعلية التي ستحتاج لتشغيلها على جهازك للنشر الحقيقي</AlertDescription>
            </Alert>

            {steps.map((step, index) => (
              <Card key={step.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  {step.command && (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">الأمر:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCommand(step.command!)}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <code className="text-sm font-mono bg-black text-green-400 p-2 rounded block">
                        {step.command}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* الأمر الشامل */}
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Zap className="w-5 h-5" />
                  الأمر الشامل (الأسرع)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">شغل هذا الأمر الواحد وسيقوم بكل شيء تلقائياً:</p>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">الأمر الشامل:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCommand("chmod +x DEPLOY_NOW.sh && ./DEPLOY_NOW.sh")}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <code className="text-sm font-mono bg-black text-green-400 p-2 rounded block">
                    chmod +x DEPLOY_NOW.sh && ./DEPLOY_NOW.sh
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* نتيجة النشر */}
      {deploymentUrl && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-700">🎉 النشر مكتمل بنجاح!</h2>
              <p className="text-green-600">موقعك متاح الآن على الرابط التالي:</p>
              <div className="bg-white p-4 rounded-lg border">
                <code className="text-lg font-mono text-blue-600">{deploymentUrl}</code>
              </div>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <a href={deploymentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    زيارة الموقع
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  مشاهدة في Vercel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            معلومات مهمة للنشر الحقيقي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Github className="w-4 h-4" />
            <AlertDescription>
              <strong>تأكد من ربط مستودعك بـ Vercel:</strong>
              <br />
              1. اذهب إلى vercel.com/dashboard
              <br />
              2. اضغط "New Project"
              <br />
              3. اختر مستودع GitHub الخاص بك
              <br />
              4. اضغط "Deploy"
            </AlertDescription>
          </Alert>

          <Alert>
            <Zap className="w-4 h-4" />
            <AlertDescription>
              <strong>للنشر التلقائي:</strong>
              <br />
              بعد ربط المستودع، أي push إلى الفرع الرئيسي سيؤدي إلى نشر تلقائي جديد
            </AlertDescription>
          </Alert>

          <Alert>
            <RefreshCw className="w-4 h-4" />
            <AlertDescription>
              <strong>وقت النشر المتوقع:</strong>
              <br />- التنظيف والتثبيت: 2-3 دقائق
              <br />- البناء: 1-2 دقيقة
              <br />- النشر على Vercel: 2-3 دقائق
              <br />
              <strong>المجموع: 5-8 دقائق</strong>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
