import { type NextRequest, NextResponse } from "next/server"
import { pumpFunAPI } from "@/lib/pump-fun-api"
import { advancedAnalyzer } from "@/lib/advanced-analysis"

export async function GET(request: NextRequest, { params }: { params: { mint: string } }) {
  try {
    const { mint } = params

    // جلب تفاصيل العملة
    const token = await pumpFunAPI.getTokenDetails(mint)

    if (!token) {
      return NextResponse.json({ success: false, error: "Token not found" }, { status: 404 })
    }

    // تطبيق التحليل المتقدم
    const analyzedToken = await advancedAnalyzer.analyzeToken(token)

    return NextResponse.json({
      success: true,
      data: analyzedToken,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`Error fetching token ${params.mint}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch token details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
