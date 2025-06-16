"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
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
  Pause,
  SkipForward,
  RotateCcw,
  FileText,
  Package,
  Wrench,
  Upload,
  Search,
} from "lucide-react"

interface DeploymentLog {
  timestamp: string
  message: string
  type: "info" | "success" | "warning" | "error"
  command?: string
}

interface DeploymentStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: "pending" | "running" | "completed" | "error"
  duration?: number
  logs: DeploymentLog[]
  commands: string[]
  expectedOutput: string[]
  tips: string[]
}

export default function StepByStepDeployment() {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [globalLogs, setGlobalLogs] = useState<DeploymentLog[]>([])

  const deploymentSteps: DeploymentStep[] = [
    {
      id: "setup",
      title: "إعداد البيئة والتحقق من المتطلبات",
      description: "فحص جميع الأدوات المطلوبة للنشر",
      icon: <Settings className="w-6 h-6" />,
      status: "pending",
      logs: [],
      commands: ["node --version", "npm --version", "git --version", "git status", "ls -la package.json"],
      expectedOutput: [
        "Node.js: v18.17.0 أو أحدث ✅",
        "npm: v9.6.7 أو أحدث ✅",
        "Git: v2.41.0 أو أحدث ✅",
        "Git repository: نظيف ومحدث ✅",
        "package.json: موجود وصحيح ✅",
      ],
      tips: [
        "تأكد من أن Node.js محدث إلى أحدث إصدار LTS",
        "تحقق من أن Git مكون بشكل صحيح",
        "راجع package.json للتأكد من صحة التبعيات",
      ],
    },
    {
      id: "clean",
      title: "تنظيف المشروع من الملفات القديمة",
      description: "حذف جميع الملفات المؤقتة والكاش القديم",
      icon: <RefreshCw className="w-6 h-6" />,
      status: "pending",
      logs: [],
      commands: ["rm -rf node_modules", "rm -rf .next", "rm -f package-lock.json", "npm cache clean --force", "ls -la"],
      expectedOutput: [
        "حذف مجلد node_modules... ✅",
        "حذف مجلد .next... ✅",
        "حذف package-lock.json... ✅",
        "تنظيف كاش npm... ✅",
        "المشروع نظيف ومجهز للتثبيت الجديد ✅",
      ],
      tips: ["هذه الخطوة تضمن بداية نظيفة", "تحل مشاكل التبعيات المتضاربة", "تزيل الملفات المؤقتة التي قد تسبب مشاكل"],
    },
    {
      id: "install",
      title: "تثبيت جميع التبعيات والحزم",
      description: "تحميل وتثبيت جميع الحزم المطلوبة للمشروع",
      icon: <Package className="w-6 h-6" />,
      status: "pending",
      logs: [],
      commands: [
        "npm install",
        "npm install @swc/core --save-dev",
        "npm install @swc/helpers --save-dev",
        "npm list --depth=0",
        "ls -la node_modules",
      ],
      expectedOutput: [
        "تثبيت التبعيات الأساسية... ✅",
        "تثبيت @swc/core... ✅",
        "تثبيت @swc/helpers... ✅",
        "فحص التبعيات المثبتة... ✅",
        "جميع الحزم مثبتة بنجاح ✅",
      ],
      tips: [
        "SWC يحسن أداء التجميع بشكل كبير",
        "تأكد من عدم ظهور تحذيرات أمنية",
        "راجع package-lock.json للتأكد من الإصدارات",
      ],
    },
    {
      id: "fix",
      title: "إصلاح التكوينات ومشاكل SWC",
      description: "تحديث ملفات التكوين وإصلاح مشاكل Tailwind و SWC",
      icon: <Wrench className="w-6 h-6" />,
      status: "pending",
      logs: [],
      commands: [
        "cat tailwind.config.js",
        "cat next.config.js",
        "cat tsconfig.json",
        "npm run lint --fix",
        "npm run type-check",
      ],
      expectedOutput: [
        "فحص تكوين Tailwind... ✅",
        "تحسين تكوين Next.js... ✅",
        "فحص تكوين TypeScript... ✅",
        "إصلاح مشاكل ESLint... ✅",
        "التحقق من الأنواع... ✅",
      ],
      tips: ["تكوين صحيح = أداء أفضل", "إصلاح التحذيرات يمنع مشاكل النشر", "TypeScript يضمن جودة الكود"],
    },
    {
      id: "build",
      title: "بناء المشروع للإنتاج",
      description: "تجميع وتحسين جميع الملفات للنشر",
      icon: <Zap className="w-6 h-6" />,
      status: "pending",
      logs: [],
      commands: ["npm run build", "npm run export", "ls -la .next", "du -sh .next", "npm run start --dry-run"],
      expectedOutput: [
        "تجميع صفحات Next.js... ✅",
        "تحسين CSS و JavaScript... ✅",
        "إنشاء ملفات الإنتاج... ✅",
        "حجم البناء: ~15MB ✅",
        "اختبار البناء... ✅",
      ],
      tips: ["البناء الناجح = نشر ناجح", "راقب حجم الملفات المُنتجة", "أي خطأ هنا يجب إصلاحه قبل النشر"],
    },
    {
      id: "git",
      title: "حفظ التغييرات في Git",
      description: "إنشاء commit جديد ودفع التغييرات إلى GitHub",
      icon: <Github className="w-6 h-6" />,
      status: "pending",
      logs: [],
      commands: [
        "git add .",
        "git status",
        "git commit -m '🚀 Deploy: إصلاح شامل وتحسينات'",
        "git push origin main",
        "git log --oneline -5",
      ],
      expectedOutput: [
        "إضافة جميع الملفات المحدثة... ✅",
        "فحص حالة Git... ✅",
        "إنشاء commit جديد... ✅",
        "دفع إلى GitHub... ✅",
        "تحديث المستودع... ✅",
      ],
      tips: ["commit message واضح يساعد في التتبع", "تأكد من دفع جميع التغييرات", "راجع تاريخ الـ commits"],
    },
    {
      id: "deploy",
      title: "النشر على Vercel",
      description: "رفع المشروع إلى خوادم Vercel للإنتاج",
      icon: <Upload className="w-6 h-6" />,
      status: "pending",
      logs: [],
      commands: ["vercel --version", "vercel login", "vercel --prod", "vercel ls", "vercel inspect"],
      expectedOutput: [
        "فحص Vercel CLI... ✅",
        "تسجيل الدخول... ✅",
        "بدء النشر... ✅",
        "رفع الملفات... ✅",
        "النشر مكتمل... ✅",
      ],
      tips: [
        "تأكد من تسجيل الدخول إلى Vercel",
        "النشر قد يستغرق 2-5 دقائق",
        "راقب logs النشر للتأكد من عدم وجود أخطاء",
      ],
    },
    {
      id: "verify",
      title: "التحقق من نجاح النشر",
      description: "فحص الموقع المنشور والتأكد من عمله بشكل صحيح",
      icon: <Search className="w-6 h-6" />,
      status: "pending",
      logs: [],
      commands: [
        "curl -I https://your-site.vercel.app",
        "curl -s https://your-site.vercel.app | head -20",
        "lighthouse https://your-site.vercel.app --quiet",
        "vercel logs",
        "vercel domains",
      ],
      expectedOutput: [
        "فحص حالة الموقع: 200 OK ✅",
        "تحميل الصفحة الرئيسية... ✅",
        "اختبار الأداء... ✅",
        "مراجعة السجلات... ✅",
        "الموقع متاح ويعمل بشكل مثالي ✅",
      ],
      tips: ["امسح كاش المتصفح لرؤية التحديثات", "اختبر الموقع على أجهزة مختلفة", "راقب الأداء والسرعة"],
    },
  ]

  const [steps, setSteps] = useState(deploymentSteps)

  const addLog = (stepId: string, message: string, type: DeploymentLog["type"] = "info", command?: string) => {
    const timestamp = new Date().toLocaleTimeString("ar-SA")
    const newLog: DeploymentLog = { timestamp, message, type, command }

    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, logs: [...step.logs, newLog] } : step)))

    setGlobalLogs((prev) => [...prev, { ...newLog, message: `[${stepId}] ${message}` }])
  }

  const runStep = async (stepIndex: number) => {
    const step = steps[stepIndex]

    // تحديث حالة الخطوة إلى "running"
    setSteps((prev) => prev.map((s, i) => (i === stepIndex ? { ...s, status: "running", logs: [] } : s)))

    addLog(step.id, `🚀 بدء ${step.title}`, "info")

    // تشغيل الأوامر
    for (let i = 0; i < step.commands.length; i++) {
      if (isPaused) {
        await new Promise((resolve) => {
          const checkPause = () => {
            if (!isPaused) resolve(undefined)
            else setTimeout(checkPause, 100)
          }
          checkPause()
        })
      }

      const command = step.commands[i]
      const expectedOutput = step.expectedOutput[i]

      addLog(step.id, `$ ${command}`, "info", command)

      // محاكاة وقت التنفيذ
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      addLog(step.id, expectedOutput, "success")
    }

    // إضافة النصائح
    for (const tip of step.tips) {
      addLog(step.id, `💡 ${tip}`, "info")
    }

    // تحديث حالة الخطوة إلى "completed"
    const duration = Math.round((2 + Math.random() * 4) * 10) / 10
    setSteps((prev) => prev.map((s, i) => (i === stepIndex ? { ...s, status: "completed", duration } : s)))

    addLog(step.id, `✅ اكتمل ${step.title} في ${duration}s`, "success")
  }

  const runAllSteps = async () => {
    setIsRunning(true)
    setCurrentStep(0)
    setGlobalLogs([])

    // إعادة تعيين جميع الخطوات
    setSteps((prev) => prev.map((step) => ({ ...step, status: "pending", logs: [], duration: undefined })))

    for (let i = 0; i < steps.length; i++) {
      if (!isRunning) break

      setCurrentStep(i)
      await runStep(i)

      // توقف قصير بين الخطوات
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // إنشاء رابط وهمي للموقع
    const mockUrl = `https://solana-tracker-${Math.random().toString(36).substring(7)}.vercel.app`
    setDeploymentUrl(mockUrl)

    addLog("final", `🎉 النشر مكتمل بنجاح!`, "success")
    addLog("final", `🌐 الموقع متاح على: ${mockUrl}`, "success")

    setIsRunning(false)
    setCurrentStep(-1)
  }

  const pauseResume = () => {
    setIsPaused(!isPaused)
  }

  const stopDeployment = () => {
    setIsRunning(false)
    setIsPaused(false)
    setCurrentStep(-1)
  }

  const resetDeployment = () => {
    setIsRunning(false)
    setIsPaused(false)
    setCurrentStep(-1)
    setDeploymentUrl("")
    setGlobalLogs([])
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending",
        logs: [],
        duration: undefined,
      })),
    )
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

  const copyAllCommands = () => {
    const allCommands = steps.flatMap((step) => step.commands).join("\n")
    navigator.clipboard.writeText(allCommands)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🚀 مشاهدة النشر خطوة بخطوة
        </h1>
        <p className="text-lg text-muted-foreground">
          تجربة تفاعلية مفصلة لكل خطوة من خطوات النشر - تماماً كما ستحدث على جهازك
        </p>
      </div>

      {/* Control Panel */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            لوحة التحكم في النشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button onClick={runAllSteps} disabled={isRunning} size="lg" className="flex items-center gap-2">
              <Play className="w-4 h-4" />🚀 بدء النشر التفاعلي
            </Button>

            {isRunning && (
              <>
                <Button onClick={pauseResume} variant="outline" className="flex items-center gap-2">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "استئناف" : "إيقاف مؤقت"}
                </Button>

                <Button onClick={stopDeployment} variant="destructive" className="flex items-center gap-2">
                  <SkipForward className="w-4 h-4" />
                  إيقاف
                </Button>
              </>
            )}

            <Button onClick={resetDeployment} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              إعادة تعيين
            </Button>

            <Button onClick={copyAllCommands} variant="outline" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              نسخ جميع الأوامر
            </Button>
          </div>

          {/* Progress Bar */}
          {(isRunning || getProgressPercentage() > 0) && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">التقدم الإجمالي</span>
                <span className="font-bold">{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="w-full h-3" />
              {currentStep >= 0 && (
                <p className="text-sm text-muted-foreground">
                  الخطوة الحالية: {steps[currentStep]?.title}
                  {isPaused && (
                    <Badge variant="secondary" className="ml-2">
                      متوقف مؤقتاً
                    </Badge>
                  )}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="grid gap-6">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all duration-500 ${
              step.status === "running"
                ? "border-blue-500 shadow-lg scale-[1.02]"
                : step.status === "completed"
                  ? "border-green-500 bg-green-50/50"
                  : currentStep === index
                    ? "border-yellow-500"
                    : ""
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-4 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                    {index + 1}
                  </div>
                  {step.icon}
                  {getStepIcon(step.status)}
                  <div>
                    <div>{step.title}</div>
                    <div className="text-sm text-muted-foreground font-normal mt-1">{step.description}</div>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {step.duration && (
                    <Badge variant="secondary" className="text-sm">
                      {step.duration}s
                    </Badge>
                  )}
                  <Badge
                    variant={
                      step.status === "completed" ? "default" : step.status === "running" ? "secondary" : "outline"
                    }
                  >
                    {step.status === "completed" ? "مكتمل" : step.status === "running" ? "جاري التنفيذ" : "في الانتظار"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* الأوامر */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  الأوامر المطلوبة:
                </h4>
                <div className="space-y-2">
                  {step.commands.map((command, cmdIndex) => (
                    <div key={cmdIndex} className="bg-black text-green-400 p-3 rounded-lg font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span>$ {command}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCommand(command)}
                          className="h-6 px-2 text-green-400 hover:text-green-300"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* النتائج المتوقعة */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  النتائج المتوقعة:
                </h4>
                <div className="space-y-1">
                  {step.expectedOutput.map((output, outputIndex) => (
                    <div
                      key={outputIndex}
                      className="text-sm bg-green-50 text-green-700 p-2 rounded border-l-4 border-green-500"
                    >
                      {output}
                    </div>
                  ))}
                </div>
              </div>

              {/* النصائح */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  نصائح مهمة:
                </h4>
                <div className="space-y-1">
                  {step.tips.map((tip, tipIndex) => (
                    <div
                      key={tipIndex}
                      className="text-sm bg-blue-50 text-blue-700 p-2 rounded border-l-4 border-blue-500"
                    >
                      💡 {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* السجلات المباشرة */}
              {step.logs.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    السجلات المباشرة:
                  </h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm">
                    {step.logs.map((log, logIndex) => (
                      <div
                        key={logIndex}
                        className={`mb-1 ${
                          log.type === "success"
                            ? "text-green-400"
                            : log.type === "warning"
                              ? "text-yellow-400"
                              : log.type === "error"
                                ? "text-red-400"
                                : "text-gray-300"
                        }`}
                      >
                        [{log.timestamp}] {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* زر تشغيل الخطوة منفردة */}
              <Button onClick={() => runStep(index)} disabled={isRunning} variant="outline" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                تشغيل هذه الخطوة فقط
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* السجلات الشاملة */}
      {globalLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              السجلات الشاملة ({globalLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm">
              {globalLogs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    log.type === "success"
                      ? "text-green-400"
                      : log.type === "warning"
                        ? "text-yellow-400"
                        : log.type === "error"
                          ? "text-red-400"
                          : "text-gray-300"
                  }`}
                >
                  [{log.timestamp}] {log.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* نتيجة النشر */}
      {deploymentUrl && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-green-700">🎉 النشر مكتمل بنجاح!</h2>
              <p className="text-lg text-green-600">موقعك متاح الآن على الرابط التالي:</p>
              <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-lg">
                <code className="text-xl font-mono text-blue-600 break-all">{deploymentUrl}</code>
              </div>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button asChild size="lg">
                  <a href={deploymentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    زيارة الموقع
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  مشاهدة في Vercel
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => copyCommand(deploymentUrl)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  نسخ الرابط
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
              <strong>للنشر الحقيقي على جهازك:</strong>
              <br />
              1. نسخ الأوامر من كل خطوة وتشغيلها بالترتيب
              <br />
              2. أو استخدام السكريبت الشامل: <code>./DEPLOY_NOW.sh</code>
              <br />
              3. ربط المستودع بـ Vercel للنشر التلقائي
            </AlertDescription>
          </Alert>

          <Alert>
            <Zap className="w-4 h-4" />
            <AlertDescription>
              <strong>الوقت المتوقع للنشر الحقيقي:</strong>
              <br />- إعداد وتنظيف: 2-3 دقائق
              <br />- تثبيت وإصلاح: 3-4 دقائق
              <br />- بناء ونشر: 3-5 دقائق
              <br />
              <strong>المجموع: 8-12 دقيقة</strong>
            </AlertDescription>
          </Alert>

          <Alert>
            <RefreshCw className="w-4 h-4" />
            <AlertDescription>
              <strong>نصائح للنجاح:</strong>
              <br />- تأكد من اتصال إنترنت مستقر
              <br />- لا تقاطع العملية أثناء التنفيذ
              <br />- راجع الأخطاء إن ظهرت وأصلحها
              <br />- امسح كاش المتصفح لرؤية التحديثات
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
