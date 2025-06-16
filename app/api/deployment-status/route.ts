import { type NextRequest, NextResponse } from "next/server"
import { vercelDeploymentService } from "@/lib/vercel-deployment-service"

export async function GET(request: NextRequest) {
  try {
    // الحصول على إحصائيات النشر
    const stats = await vercelDeploymentService.getDeploymentStats()

    // الحصول على قائمة النشر الأخيرة
    const deployments = await vercelDeploymentService.getDeployments(10)

    return NextResponse.json({
      success: true,
      stats,
      deployments,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("خطأ في API حالة النشر:", error)

    return NextResponse.json(
      {
        success: false,
        error: "فشل في جلب حالة النشر",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, commitSha, branch } = await request.json()

    let result = null

    switch (action) {
      case "deploy":
        if (commitSha) {
          result = await vercelDeploymentService.deployFromCommit(commitSha, branch)
        } else {
          result = await vercelDeploymentService.redeployLatest()
        }
        break

      case "preview":
        if (branch) {
          result = await vercelDeploymentService.createPreviewDeployment(branch)
        }
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "إجراء غير صحيح",
          },
          { status: 400 },
        )
    }

    return NextResponse.json({
      success: true,
      deployment: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("خطأ في API النشر:", error)

    return NextResponse.json(
      {
        success: false,
        error: "فشل في تنفيذ النشر",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
