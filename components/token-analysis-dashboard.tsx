"use client"

import { useState } from "react"
import {
  Brain,
  Shield,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Zap,
  Eye,
  Clock,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Timer,
} from "lucide-react"

import { tokenAnalyzer, type TokenAnalysis } from "../lib/token-analyzer"

interface TokenAnalysisDashboardProps {
  token: any
  onAnalysisComplete?: (analysis: TokenAnalysis) => void
}

export default function TokenAnalysisDashboard({ token, onAnalysisComplete }: TokenAnalysisDashboardProps) {
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const analyzeToken = async () => {
    setIsAnalyzing(true)
    try {
      const result = await tokenAnalyzer.analyzeToken(token)
      setAnalysis(result)
      onAnalysisComplete?.(result)
    } catch (error) {
      console.error("خطأ في التحليل:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const getRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case "موصى بها":
        return {
          bg: "bg-green-600",
          text: "text-white",
          border: "border-green-500",
          glow: "shadow-green-500/50",
          icon: <CheckCircle className="w-8 h-8" />,
        }
      case "مصنفة":
        return {
          bg: "bg-yellow-500",
          text: "text-black",
          border: "border-yellow-400",
          glow: "shadow-yellow-500/50",
          icon: <AlertTriangle className="w-8 h-8" />,
        }
      case "مهملة":
        return {
          bg: "bg-red-600",
          text: "text-white",
          border: "border-red-500",
          glow: "shadow-red-500/50",
          icon: <XCircle className="w-8 h-8" />,
        }
      default:
        return {
          bg: "bg-gray-600",
          text: "text-white",
          border: "border-gray-500",
          glow: "shadow-gray-500/50",
          icon: <Minus className="w-8 h-8" />,
        }
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "منخفض":
        return "text-green-400"
      case "متوسط":
        return "text-yellow-400"
      case "عالي":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getBuyingTrendIcon = (trend: string) => {
    switch (trend) {
      case "صاعد":
        return <ArrowUp className="w-4 h-4 text-green-400" />
      case "هابط":
        return <ArrowDown className="w-4 h-4 text-red-400" />
      case "ثابت":
        return <Minus className="w-4 h-4 text-yellow-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return (num / 1e9).toFixed(decimals) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(decimals) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(decimals) + "K"
    return num.toFixed(decimals)
  }

  // معايير الفحص للعملة
  const getCriteriaStatus = (analysis: TokenAnalysis | null) => {
    if (!analysis) return null

    const now = Date.now() / 1000
    const tokenAge = now - token.createdTimestamp
    const ageInMinutes = Math.floor(tokenAge / 60)

    return {
      age: {
        passed: ageInMinutes <= 20,
        value: `${ageInMinutes} دقيقة`,
        label: "عمر العملة (أقل من 20 دقيقة)",
      },
      marketCap: {
        passed: token.marketCap <= 15000,
        value: `$${token.marketCap.toLocaleString()}`,
        label: "القيمة السوقية (أقل من $15,000)",
      },
      dataQuality: {
        passed: token.mint && token.symbol && token.name && token.price > 0,
        value: "مكتملة",
        label: "جودة البيانات",
      },
    }
  }

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          تحليل العملة الذكي
        </h2>
        <button onClick={analyzeToken} disabled={isAnalyzing} className="btn flex items-center gap-2">
          {isAnalyzing ? (
            <>
              <div className="loading-spinner"></div>
              جاري التحليل...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              تحليل شامل
            </>
          )}
        </button>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* عرض سبب الرفض إذا كانت العملة مرفوضة */}
          {analysis.rejectionReason && (
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                عملة مرفوضة - لا تلبي المعايير الأساسية
              </h3>
              <p className="text-red-300">{analysis.rejectionReason}</p>
            </div>
          )}

          {/* معايير الفحص للعملة الحالية */}
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              معايير الفحص لهذه العملة
            </h3>
            {(() => {
              const criteria = getCriteriaStatus(analysis)
              if (!criteria) return null

              return (
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(criteria).map(([key, criterion]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border ${
                        criterion.passed ? "bg-green-900/20 border-green-600" : "bg-red-900/20 border-red-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {criterion.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span
                          className={`text-sm font-semibold ${criterion.passed ? "text-green-400" : "text-red-400"}`}
                        >
                          {criterion.passed ? "تم الاجتياز" : "لم يتم الاجتياز"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">{criterion.label}</div>
                      <div className="text-sm font-bold">{criterion.value}</div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* النتيجة الإجمالية والتوصية */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center bg-purple-900/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-400 mb-2">{analysis.overallScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">النتيجة الإجمالية</div>
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreBg(analysis.overallScore)}`}
                    style={{ width: `${analysis.overallScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div
              className={`text-center rounded-lg p-4 border-2 shadow-lg ${
                getRecommendationStyle(analysis.recommendation).bg
              } ${getRecommendationStyle(analysis.recommendation).text} ${
                getRecommendationStyle(analysis.recommendation).border
              } ${getRecommendationStyle(analysis.recommendation).glow}`}
            >
              <div className="text-2xl font-bold mb-2">{getRecommendationStyle(analysis.recommendation).icon}</div>
              <div className="font-bold text-lg">{analysis.recommendation}</div>
              <div className="text-sm opacity-90">التوصية النهائية</div>
            </div>

            <div className="text-center bg-gray-900/20 rounded-lg p-4">
              <div className={`text-2xl font-bold mb-2 ${getRiskColor(analysis.riskLevel)}`}>
                <Shield className="w-8 h-8 mx-auto" />
              </div>
              <div className="font-semibold">{analysis.riskLevel}</div>
              <div className="text-sm text-gray-400">مستوى المخاطر</div>
            </div>
          </div>

          {/* التنبؤات */}
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              التنبؤات الذكية
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">${analysis.expectedPrice.toFixed(6)}</div>
                <div className="text-sm text-gray-400">السعر المتوقع</div>
                {analysis.expectedPrice > token.price && (
                  <div className="text-xs text-green-400 mt-1">
                    📈 +{((analysis.expectedPrice / token.price - 1) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{analysis.timeToTarget} يوم</div>
                <div className="text-sm text-gray-400">الوقت للهدف</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{analysis.confidence.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">مستوى الثقة</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">{analysis.accuracyScore.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">دقة النموذج</div>
              </div>
            </div>
          </div>

          {/* نتائج المعايير */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">الفرادة</span>
                </div>
                <span className={`font-bold ${getScoreColor(analysis.uniquenessScore)}`}>
                  {analysis.uniquenessScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreBg(analysis.uniquenessScore)}`}
                  style={{ width: `${analysis.uniquenessScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm">المنشئ</span>
                </div>
                <span className={`font-bold ${getScoreColor(analysis.creatorScore)}`}>
                  {analysis.creatorScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreBg(analysis.creatorScore)}`}
                  style={{ width: `${analysis.creatorScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">سرعة الشراء</span>
                </div>
                <span className={`font-bold ${getScoreColor(analysis.buyingSpeedScore)}`}>
                  {analysis.buyingSpeedScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreBg(analysis.buyingSpeedScore)}`}
                  style={{ width: `${analysis.buyingSpeedScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-pink-400" />
                  <span className="text-sm">تعلم الآلة</span>
                </div>
                <span className={`font-bold ${getScoreColor(analysis.mlScore)}`}>{analysis.mlScore.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreBg(analysis.mlScore)}`}
                  style={{ width: `${analysis.mlScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* تفاصيل التحليل */}
          <div className="text-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn-secondary flex items-center gap-2 mx-auto"
            >
              <BarChart3 className="w-4 h-4" />
              {showDetails ? "إخفاء التفاصيل" : "عرض التفاصيل المتقدمة"}
            </button>
          </div>

          {showDetails && (
            <div className="space-y-6 border-t border-gray-600 pt-6">
              {/* تحليل سرعة الشراء المفصل */}
              <div className="bg-blue-900/10 border border-blue-600 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-400" />
                  تحليل سرعة الشراء المفصل
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>معاملات في الدقيقة:</span>
                      <span className="text-blue-400 font-bold">
                        {analysis.detailedAnalysis.buyingSpeed.transactionsPerMinute}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>نسبة الشراء/البيع:</span>
                      <span className="text-green-400 font-bold">
                        {analysis.detailedAnalysis.buyingSpeed.buyVsSellRatio.toFixed(2)}:1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>متوسط حجم المعاملة:</span>
                      <span className="text-purple-400">
                        ${formatNumber(analysis.detailedAnalysis.buyingSpeed.averageTransactionSize)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>الاتجاه:</span>
                      <span className="flex items-center gap-1">
                        {getBuyingTrendIcon(analysis.detailedAnalysis.buyingSpeed.buyingTrend)}
                        {analysis.detailedAnalysis.buyingSpeed.buyingTrend}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>نقاط الزخم:</span>
                      <span className="text-indigo-400">
                        {analysis.detailedAnalysis.buyingSpeed.momentumScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {analysis.detailedAnalysis.buyingSpeed.isRapidGrowth && (
                  <div className="mt-4">
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded animate-pulse">🚀 نمو سريع</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-gray-800/50 rounded-lg p-4 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">
                تم التحليل في: {new Date(analysis.timestamp).toLocaleString("ar-SA")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">
                نموذج تعلم الآلة v{tokenAnalyzer.getModelStats().modelVersion} - دقة{" "}
                {(tokenAnalyzer.getModelStats().accuracy * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">اضغط على "تحليل شامل" لبدء التحليل المتقدم للعملة</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• تحليل فرادة العملة والتأكد من عدم التكرار</p>
            <p>• فحص سجل المنشئ وعملاته السابقة</p>
            <p>• تقييم قوة المحفظة والسيولة</p>
            <p>• تحليل وسائل التواصل الاجتماعي والمشاعر</p>
            <p>• رصد ذكر المؤثرين والمشاهير</p>
            <p className="text-blue-400 font-semibold">• تحليل سرعة الشراء والزخم</p>
            <p>• التنبؤ بالأداء المستقبلي بالذكاء الاصطناعي</p>
            <p>• تطبيق نماذج تعلم الآلة المتقدمة</p>
          </div>
        </div>
      )}
    </div>
  )
}
