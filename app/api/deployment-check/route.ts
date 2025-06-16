import { NextResponse } from "next/server"

export async function GET() {
  try {
    const deploymentInfo = {
      status: "deployed",
      timestamp: new Date().toISOString(),
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME,
      version: process.env.NEXT_PUBLIC_VERSION || "2.1.0",
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA,
      apiWorking: true,
      staticExportDisabled: true,
      message: "Deployment successful - All systems operational",
    }

    return NextResponse.json(deploymentInfo)
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        apiWorking: false,
        message: "Deployment check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
