// إعادة API المراقبة الأصلي
import { type NextRequest, NextResponse } from "next/server"
import { realTimeIntegration } from "@/lib/realtime-integration"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "status":
        const status = realTimeIntegration.getMonitorStatus()
        return NextResponse.json({
          success: true,
          status,
          message: status ? "Real-time monitor is active" : "Real-time monitor is not running",
          timestamp: new Date().toISOString(),
        })

      case "tokens":
        const tokens = realTimeIntegration.getRealtimeTokens()
        return NextResponse.json({
          success: true,
          data: tokens,
          total: tokens.length,
          message: `Found ${tokens.length} real-time tokens`,
          timestamp: new Date().toISOString(),
        })

      case "start":
        const apiKey = searchParams.get("apiKey")
        await realTimeIntegration.startRealTimeMonitoring(apiKey || undefined)
        return NextResponse.json({
          success: true,
          message: "Real-time monitoring started",
          timestamp: new Date().toISOString(),
        })

      case "stop":
        await realTimeIntegration.stopRealTimeMonitoring()
        return NextResponse.json({
          success: true,
          message: "Real-time monitoring stopped",
          timestamp: new Date().toISOString(),
        })

      case "clear":
        realTimeIntegration.clearRealtimeTokens()
        return NextResponse.json({
          success: true,
          message: "Real-time tokens cleared",
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            availableActions: ["status", "tokens", "start", "stop", "clear"],
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ Real-time API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Real-time API error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, apiKey } = body

    switch (action) {
      case "start":
        await realTimeIntegration.startRealTimeMonitoring(apiKey)
        return NextResponse.json({
          success: true,
          message: "Real-time monitoring started with provided API key",
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid POST action",
            availableActions: ["start"],
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ Real-time POST API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Real-time POST API error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
