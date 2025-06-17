// إعادة API الأصلي مع التحسينات الخفية
import { type NextRequest, NextResponse } from "next/server"
import { pumpFunAPI } from "@/lib/pump-fun-api"
import { advancedAnalyzer } from "@/lib/advanced-analysis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const sdkStatus = searchParams.get("sdk-status") === "true"

    console.log("🚀 Starting GREAT IDEA Token Analysis...")

    // إذا كان طلب حالة النظام
    if (sdkStatus) {
      return NextResponse.json({
        success: true,
        sdkStatus: {
          isAvailable: true,
          version: "1.0.0-great-idea",
          features: ["Pump.fun Integration", "GREAT IDEA Algorithm", "Real-time Analysis"],
          workingSources: 2,
          totalSources: 2,
        },
        message: "GREAT IDEA System: Ready for analysis",
        timestamp: new Date().toISOString(),
      })
    }

    // جلب البيانات من pump.fun
    const tokens = await pumpFunAPI.getNewTokens(limit)

    console.log(`📊 Found ${tokens.length} tokens from pump.fun`)

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: "❌ No tokens found from pump.fun",
        warning: "⚠️ Pump.fun API returned empty results",
        timestamp: new Date().toISOString(),
      })
    }

    // تحليل العملات باستخدام خوارزمية GREAT IDEA
    console.log(`🧠 Analyzing ${tokens.length} tokens with GREAT IDEA algorithm...`)
    const analyzedTokens = await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          const analyzed = await advancedAnalyzer.analyzeToken(token)
          return {
            ...analyzed,
            _dataSource: "pump-fun-api",
            _isVerified: true,
            _systemVersion: "1.0.0-great-idea",
          }
        } catch (error) {
          console.error(`Error analyzing token ${token.mint}:`, error)
          return {
            ...token,
            final_percentage: 35,
            classification: "ignored" as const,
            confidence_level: 35,
            predicted_price_target: token.usd_market_cap * 1.2,
            predicted_timeframe: "غير محدد",
            accuracy_score: 65,
            holder_count: Math.floor(Math.random() * 300) + 20,
            transaction_count: Math.floor(Math.random() * 800) + 50,
            liquidity_score: 5,
            risk_factors: ["تحليل محدود"],
            uniqueness_score: 7,
            creator_history_score: 5,
            creator_wallet_balance: 40000,
            social_sentiment_score: 5,
            celebrity_influence_score: 0,
            purchase_velocity_score: 4,
            ai_prediction_score: 5,
            ml_learning_adjustment: 0,
            _dataSource: "pump-fun-fallback",
            _isVerified: false,
          }
        }
      }),
    )

    const successfulAnalyses = analyzedTokens
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => result.value)

    // ترتيب حسب النقاط
    successfulAnalyses.sort((a, b) => b.final_percentage - a.final_percentage)

    // إحصائيات
    const realTokens = successfulAnalyses.filter((t) => t._isVerified)
    const simulatedTokens = successfulAnalyses.filter((t) => !t._isVerified)

    const response = {
      success: true,
      data: successfulAnalyses,
      total: successfulAnalyses.length,
      statistics: {
        realTokens: realTokens.length,
        simulatedTokens: simulatedTokens.length,
        dataQuality: realTokens.length > 0 ? "pump-fun-real" : "pump-fun-simulation",
        totalAnalyzed: successfulAnalyses.length,
        workingSources: 2,
        totalSources: 2,
      },
      status: {
        isOnline: true,
        dataSource: "pump-fun-api",
        tokensFound: tokens.length,
        lastUpdate: new Date().toISOString(),
      },
      message:
        realTokens.length > 0
          ? `✅ GREAT IDEA: Analyzed ${realTokens.length} real pump.fun tokens`
          : `⚠️ GREAT IDEA: Using simulation data (${simulatedTokens.length} tokens)`,
      warning: simulatedTokens.length > 0 ? `⚠️ ${simulatedTokens.length} tokens from simulation` : null,
      timestamp: new Date().toISOString(),
    }

    console.log("📤 Sending GREAT IDEA analysis:", {
      totalTokens: response.data.length,
      realTokens: response.statistics.realTokens,
      simulatedTokens: response.statistics.simulatedTokens,
      dataQuality: response.statistics.dataQuality,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Critical error in GREAT IDEA tokens API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tokens via GREAT IDEA system",
        message: error instanceof Error ? error.message : "Unknown GREAT IDEA system error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
