// API endpoint للنظام الحقيقي
import { type NextRequest, NextResponse } from "next/server"

// متغير عام للمراقب
let globalMonitor: any = null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "tokens":
        if (!globalMonitor) {
          return NextResponse.json({
            success: false,
            message: "Monitor not started",
            data: [],
          })
        }

        const tokens = globalMonitor.getDetectedTokens()
        return NextResponse.json({
          success: true,
          data: tokens,
          total: tokens.length,
          message: `Found ${tokens.length} real-time tokens`,
          timestamp: new Date().toISOString(),
        })

      case "stats":
        if (!globalMonitor) {
          return NextResponse.json({
            success: false,
            message: "Monitor not started",
            stats: null,
          })
        }

        const stats = globalMonitor.getMonitoringStats()
        const mlStats = globalMonitor.getMLModelStats()

        return NextResponse.json({
          success: true,
          stats: {
            ...stats,
            ml_model: mlStats,
          },
          message: `Monitoring active - ${stats.totalDetected} tokens detected`,
          timestamp: new Date().toISOString(),
        })

      case "ml-model":
        if (!globalMonitor) {
          return NextResponse.json({
            success: false,
            message: "Monitor not started",
            model: null,
          })
        }

        const model = globalMonitor.getMLModelStats()
        return NextResponse.json({
          success: true,
          model,
          message: `ML Model - Accuracy: ${(model.accuracy * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            availableActions: ["tokens", "stats", "ml-model"],
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Real-time monitor API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "API error",
        message: error instanceof Error ? error.message : "Unknown error",
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
        if (globalMonitor) {
          return NextResponse.json({
            success: false,
            message: "Monitor already running",
          })
        }

        // تحميل المراقب ديناميكياً
        const { RealTimePumpMonitor } = await import("@/lib/real-time-pump-monitor")

        globalMonitor = new RealTimePumpMonitor((token) => {
          console.log(`🎯 New token detected: ${token.symbol} | ML Score: ${token.ml_prediction_score}`)
        })

        await globalMonitor.startRealTimeMonitoring()

        return NextResponse.json({
          success: true,
          message: "Real-time monitoring with ML started successfully!",
          timestamp: new Date().toISOString(),
        })

      case "stop":
        if (!globalMonitor) {
          return NextResponse.json({
            success: false,
            message: "Monitor not running",
          })
        }

        await globalMonitor.stopMonitoring()
        globalMonitor = null

        return NextResponse.json({
          success: true,
          message: "Real-time monitoring stopped",
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid POST action",
            availableActions: ["start", "stop"],
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Real-time monitor POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "POST API error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
