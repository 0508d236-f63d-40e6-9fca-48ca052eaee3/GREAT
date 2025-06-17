// API endpoint للنظام فائق السرعة
import { type NextRequest, NextResponse } from "next/server"
import { ultraFastIntegration } from "@/lib/ultra-fast-integration"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "status":
        const stats = ultraFastIntegration.getPerformanceStats()
        return NextResponse.json({
          success: true,
          stats,
          message: `Ultra-fast system: ${stats.tokensPerMinute} tokens/minute`,
          timestamp: new Date().toISOString(),
        })

      case "tokens":
        const tokens = ultraFastIntegration.getUltraFastTokens()
        return NextResponse.json({
          success: true,
          data: tokens,
          total: tokens.length,
          message: `Found ${tokens.length} ultra-fast tokens`,
          timestamp: new Date().toISOString(),
        })

      case "performance":
        const performance = ultraFastIntegration.getPerformanceStats()
        return NextResponse.json({
          success: true,
          performance,
          message: `Performance: ${performance.tokensPerMinute}/min (Target: 1000+/min)`,
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            availableActions: ["status", "tokens", "performance"],
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ Ultra-fast API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ultra-fast API error",
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
    const { action, apiKeys } = body

    switch (action) {
      case "start":
        await ultraFastIntegration.startUltraFastMonitoring(apiKeys)
        return NextResponse.json({
          success: true,
          message: "Ultra-fast monitoring started - Target: 1000+ tokens/minute",
          timestamp: new Date().toISOString(),
        })

      case "stop":
        await ultraFastIntegration.stopUltraFastMonitoring()
        return NextResponse.json({
          success: true,
          message: "Ultra-fast monitoring stopped",
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid POST action",
            availableActions: ["start", "stop"],
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ Ultra-fast POST API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ultra-fast POST API error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
