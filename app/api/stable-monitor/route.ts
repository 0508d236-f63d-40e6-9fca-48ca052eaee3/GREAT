// API endpoint للنظام المستقر
import { type NextRequest, NextResponse } from "next/server"
import { stableIntegration } from "@/lib/stable-integration"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "status":
        const stats = stableIntegration.getStats()
        return NextResponse.json({
          success: true,
          stats,
          message: stats.isActive ? "Stable monitoring is active" : "Stable monitoring is not running",
          timestamp: new Date().toISOString(),
        })

      case "tokens":
        const tokens = stableIntegration.getRealtimeTokens()
        return NextResponse.json({
          success: true,
          data: tokens,
          total: tokens.length,
          message: `Found ${tokens.length} tokens via stable monitoring`,
          timestamp: new Date().toISOString(),
        })

      case "start":
        await stableIntegration.startRealTimeMonitoring()
        return NextResponse.json({
          success: true,
          message: "Stable monitoring started (HTTP polling)",
          timestamp: new Date().toISOString(),
        })

      case "stop":
        await stableIntegration.stopRealTimeMonitoring()
        return NextResponse.json({
          success: true,
          message: "Stable monitoring stopped",
          timestamp: new Date().toISOString(),
        })

      case "clear":
        stableIntegration.clearRealtimeTokens()
        return NextResponse.json({
          success: true,
          message: "Tokens cleared",
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
    console.error("❌ Stable monitor API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Stable monitor API error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
