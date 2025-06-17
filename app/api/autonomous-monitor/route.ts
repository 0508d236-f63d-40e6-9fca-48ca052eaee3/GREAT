// API للنظام التلقائي
import { type NextRequest, NextResponse } from "next/server"

let autonomousMonitor: any = null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "tokens":
        if (!autonomousMonitor) {
          return NextResponse.json({
            success: false,
            message: "Autonomous monitor not started",
            data: [],
          })
        }

        const tokens = autonomousMonitor.getDetectedTokens()
        return NextResponse.json({
          success: true,
          data: tokens,
          total: tokens.length,
          message: `${tokens.length} tokens detected autonomously`,
          timestamp: new Date().toISOString(),
        })

      case "stats":
        if (!autonomousMonitor) {
          return NextResponse.json({
            success: false,
            message: "Autonomous monitor not started",
            stats: null,
          })
        }

        const stats = autonomousMonitor.getAutonomousStats()
        return NextResponse.json({
          success: true,
          stats,
          message: `Autonomous monitoring: ${stats.totalDetected} tokens detected`,
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            availableActions: ["tokens", "stats"],
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Autonomous monitor API error:", error)
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
        if (autonomousMonitor) {
          return NextResponse.json({
            success: false,
            message: "Autonomous monitor already running",
          })
        }

        const { AutonomousPumpMonitor } = await import("@/lib/autonomous-pump-monitor")

        autonomousMonitor = new AutonomousPumpMonitor((token) => {
          console.log(
            `🤖 AUTONOMOUS: ${token.symbol} | Score: ${token.auto_analysis_score} | ${token.overall_recommendation}`,
          )
        })

        await autonomousMonitor.startAutonomousMonitoring()

        return NextResponse.json({
          success: true,
          message: "🤖 AUTONOMOUS monitoring started - NO API KEYS REQUIRED!",
          timestamp: new Date().toISOString(),
        })

      case "stop":
        if (!autonomousMonitor) {
          return NextResponse.json({
            success: false,
            message: "Autonomous monitor not running",
          })
        }

        await autonomousMonitor.stopAutonomousMonitoring()
        autonomousMonitor = null

        return NextResponse.json({
          success: true,
          message: "Autonomous monitoring stopped",
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
    console.error("Autonomous monitor POST error:", error)
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
