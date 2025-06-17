// API محسن للعملات مع WebSocket
import { type NextRequest, NextResponse } from "next/server"
import { realTimePumpIntegration } from "@/lib/realtime-pump-integration"

export async function GET(request: NextRequest) {
  try {
    console.log("📡 API Request: Getting real-time tokens...")

    // بدء المراقبة الفورية إذا لم تكن بدأت
    const stats = realTimePumpIntegration.getStats()
    if (!stats.isRunning) {
      console.log("🚀 Starting real-time monitoring...")
      await realTimePumpIntegration.startRealTimeMonitoring()
    }

    // جلب العملات الحالية
    const tokens = realTimePumpIntegration.getTokens()
    const currentStats = realTimePumpIntegration.getStats()

    console.log(`✅ Returning ${tokens.length} real-time tokens`)

    return NextResponse.json({
      success: true,
      data: tokens,
      statistics: {
        totalAnalyzed: currentStats.totalTokens,
        recommended: currentStats.recommendedTokens,
        classified: currentStats.classifiedTokens,
        ignored: currentStats.ignoredTokens,
        tokensPerMinute: currentStats.tokensPerMinute,
        lastUpdate: new Date().toISOString(),
        dataSource: "realtime-websocket",
        systemVersion: "GREAT-IDEA-v2.0-RealTime",
      },
      message: `Real-time monitoring active - ${tokens.length} tokens detected`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ API Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Real-time API error",
        message: error instanceof Error ? error.message : "Unknown error",
        data: [],
        statistics: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "start":
        await realTimePumpIntegration.startRealTimeMonitoring()
        return NextResponse.json({
          success: true,
          message: "Real-time monitoring started",
          timestamp: new Date().toISOString(),
        })

      case "stop":
        await realTimePumpIntegration.stopRealTimeMonitoring()
        return NextResponse.json({
          success: true,
          message: "Real-time monitoring stopped",
          timestamp: new Date().toISOString(),
        })

      case "stats":
        const stats = realTimePumpIntegration.getStats()
        return NextResponse.json({
          success: true,
          stats,
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            availableActions: ["start", "stop", "stats"],
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ POST API Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "POST API error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
