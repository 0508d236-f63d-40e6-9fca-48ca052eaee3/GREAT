// API للمراقبة الفعالة
import { type NextRequest, NextResponse } from "next/server"

// متغير global للمراقب (في التطبيق الحقيقي، استخدم state management)
let monitorInstance: any = null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "stats":
        const stats = monitorInstance ? monitorInstance.getMonitoringStats() : null
        return NextResponse.json({
          success: true,
          stats: stats || {
            isRunning: false,
            totalTokens: 0,
            tokensPerMinute: 0,
            runtime: 0,
            strategy: "pump.fun direct monitoring",
            efficiency: "HIGH",
          },
          timestamp: new Date().toISOString(),
        })

      case "stop":
        if (monitorInstance) {
          await monitorInstance.stopEfficientMonitoring()
          monitorInstance = null
        }
        return NextResponse.json({
          success: true,
          message: "Efficient monitoring stopped",
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            availableActions: ["stats", "stop"],
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ Efficient monitor API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "API error",
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
    const { action, fetchInterval } = body

    switch (action) {
      case "start":
        if (monitorInstance) {
          return NextResponse.json({
            success: false,
            message: "Monitoring already running",
            timestamp: new Date().toISOString(),
          })
        }

        // في التطبيق الحقيقي، استورد EfficientPumpMonitor
        // const { EfficientPumpMonitor } = await import("@/lib/efficient-pump-monitor")

        // monitorInstance = new EfficientPumpMonitor({
        //   fetchInterval,
        //   onNewToken: (token) => {
        //     console.log("New token:", token.symbol)
        //   },
        //   onError: (error) => {
        //     console.error("Monitor error:", error)
        //   },
        // })

        // await monitorInstance.startEfficientMonitoring()

        // محاكاة للعرض
        monitorInstance = {
          getMonitoringStats: () => ({
            isRunning: true,
            totalTokens: Math.floor(Math.random() * 100),
            tokensPerMinute: Math.floor(Math.random() * 50),
            runtime: Math.floor(Math.random() * 60),
            strategy: "pump.fun direct monitoring",
            efficiency: "HIGH (no unnecessary Solana scanning)",
          }),
          stopEfficientMonitoring: async () => {
            console.log("Stopping efficient monitoring...")
          },
        }

        return NextResponse.json({
          success: true,
          message: "Efficient monitoring started - pump.fun ONLY",
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
    console.error("❌ Efficient monitor POST API error:", error)
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
