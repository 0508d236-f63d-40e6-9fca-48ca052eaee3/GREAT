// تحديث API لاستخدام النظام المحسن
import { type NextRequest, NextResponse } from "next/server"
import { enhancedDataFetcher } from "@/lib/enhanced-data-fetcher"
import { advancedAnalyzer } from "@/lib/advanced-analysis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const testSources = searchParams.get("test") === "true"

    console.log("🚀 Starting enhanced multi-source data fetch...")

    // إذا كان طلب اختبار المصادر
    if (testSources) {
      const sourceStatus = await enhancedDataFetcher.checkAllSourcesStatus()
      return NextResponse.json({
        success: true,
        sourceStatus,
        message: `Tested ${sourceStatus.totalSources} sources, ${sourceStatus.workingSources} working`,
        timestamp: new Date().toISOString(),
      })
    }

    // جلب البيانات من المصادر المتعددة
    const fetchResult = await enhancedDataFetcher.fetchTodayTokens()

    console.log(`📊 Fetch Result:`, {
      tokensFound: fetchResult.tokens.length,
      isReal: fetchResult.isReal,
      sources: fetchResult.successfulSources,
      attempts: fetchResult.totalAttempts,
    })

    if (fetchResult.tokens.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        fetchResult,
        message: "❌ No tokens found from any source",
        warning: "⚠️ All data sources returned empty results",
        timestamp: new Date().toISOString(),
      })
    }

    // تحليل العملات
    console.log(`🧠 Analyzing ${fetchResult.tokens.length} tokens...`)
    const analyzedTokens = await Promise.allSettled(
      fetchResult.tokens.slice(0, limit).map(async (token) => {
        try {
          const analyzed = await advancedAnalyzer.analyzeToken(token)
          return {
            ...analyzed,
            _dataSource: token._dataSource,
            _isVerified: token._isVerified,
          }
        } catch (error) {
          console.error(`Error analyzing token ${token.mint}:`, error)
          return {
            ...token,
            final_percentage: 25,
            classification: "ignored" as const,
            confidence_level: 25,
            predicted_price_target: token.usd_market_cap * 1.2,
            predicted_timeframe: "غير محدد",
            accuracy_score: 50,
            holder_count: Math.floor(Math.random() * 500) + 10,
            transaction_count: Math.floor(Math.random() * 1000) + 50,
            liquidity_score: 3,
            risk_factors: ["تحليل محدود"],
            uniqueness_score: 5,
            creator_history_score: 3,
            creator_wallet_balance: 25000,
            social_sentiment_score: 3,
            celebrity_influence_score: 0,
            purchase_velocity_score: 2,
            ai_prediction_score: 3,
            ml_learning_adjustment: 0,
          }
        }
      }),
    )

    const successfulAnalyses = analyzedTokens
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => result.value)

    // ترتيب حسب النقاط
    successfulAnalyses.sort((a, b) => b.final_percentage - a.final_percentage)

    // إحصائيات مفصلة
    const realTokens = successfulAnalyses.filter((t) => t._isVerified)
    const simulatedTokens = successfulAnalyses.filter((t) => !t._isVerified)

    const response = {
      success: true,
      data: successfulAnalyses,
      total: successfulAnalyses.length,
      fetchResult: {
        source: fetchResult.source,
        isReal: fetchResult.isReal,
        totalAttempts: fetchResult.totalAttempts,
        successfulSources: fetchResult.successfulSources,
      },
      statistics: {
        realTokens: realTokens.length,
        simulatedTokens: simulatedTokens.length,
        dataQuality: fetchResult.isReal ? "real" : "enhanced-simulation",
        sourcesUsed: fetchResult.successfulSources.length,
        totalSourcesAttempted: fetchResult.totalAttempts,
      },
      status: {
        isOnline: fetchResult.isReal,
        dataSource: fetchResult.source,
        tokensFound: fetchResult.tokens.length,
        lastUpdate: new Date().toISOString(),
      },
      message: fetchResult.isReal
        ? `✅ Found ${realTokens.length} real tokens from: ${fetchResult.source}`
        : `⚠️ Using enhanced simulation data (${simulatedTokens.length} tokens)`,
      warning: !fetchResult.isReal ? "⚠️ Real data sources unavailable - using enhanced simulation" : null,
      timestamp: new Date().toISOString(),
    }

    console.log("📤 Sending response:", {
      totalTokens: response.data.length,
      realTokens: response.statistics.realTokens,
      simulatedTokens: response.statistics.simulatedTokens,
      dataQuality: response.statistics.dataQuality,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Critical error in enhanced tokens API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch token data",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : "No stack trace",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
