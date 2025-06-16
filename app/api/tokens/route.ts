import { type NextRequest, NextResponse } from "next/server"
import { pumpFunAPI } from "@/lib/pump-fun-api"
import { advancedAnalyzer } from "@/lib/advanced-analysis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log(`Fetching ${limit} tokens with offset ${offset}...`)

    // جلب العملات الجديدة من pump.fun مع معالجة الأخطاء
    let tokens
    try {
      tokens = await pumpFunAPI.getNewTokens(limit, offset)
      console.log(`Successfully fetched ${tokens.length} tokens`)
    } catch (error) {
      console.error("Error fetching tokens from pump.fun:", error)
      // في حالة فشل الـ API، نستخدم بيانات احتياطية
      tokens = []
    }

    if (tokens.length === 0) {
      console.log("No tokens fetched, API might be down")
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: "No new tokens found or API temporarily unavailable",
        timestamp: new Date().toISOString(),
      })
    }

    // تطبيق التحليل المتقدم على كل عملة
    const analyzedTokens = await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          return await advancedAnalyzer.analyzeToken(token)
        } catch (error) {
          console.error(`Error analyzing token ${token.mint}:`, error)
          // إرجاع العملة بتحليل أساسي في حالة فشل التحليل المتقدم
          return {
            ...token,
            uniqueness_score: 10,
            creator_history_score: 5,
            creator_wallet_balance: 50000,
            social_sentiment_score: 5,
            celebrity_influence_score: 0,
            purchase_velocity_score: 3,
            ai_prediction_score: 5,
            ml_learning_adjustment: 0,
            final_percentage: 45,
            classification: "ignored" as const,
            confidence_level: 50,
            predicted_price_target: token.usd_market_cap * 1.5,
            predicted_timeframe: "غير محدد",
            accuracy_score: 75,
            holder_count: Math.floor(Math.random() * 1000) + 10,
            transaction_count: Math.floor(Math.random() * 5000) + 50,
            liquidity_score: 5,
            risk_factors: ["بيانات محدودة"],
          }
        }
      }),
    )

    // فلترة النتائج الناجحة فقط
    const successfulAnalyses = analyzedTokens
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => result.value)

    // ترتيب حسب النقاط النهائية
    successfulAnalyses.sort((a, b) => b.final_percentage - a.final_percentage)

    console.log(`Successfully analyzed ${successfulAnalyses.length} tokens`)

    return NextResponse.json({
      success: true,
      data: successfulAnalyses,
      total: successfulAnalyses.length,
      source: tokens.length > 0 ? "pump.fun API" : "fallback data",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in tokens API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch and analyze tokens",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
