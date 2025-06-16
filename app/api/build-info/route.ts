import { NextResponse } from "next/server"

export async function GET() {
  const buildInfo = {
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_VERSION || "2.1.0",
    buildId: process.env.NEXT_PUBLIC_BUILD_ID || "unknown",
    environment: process.env.NODE_ENV || "development",
    vercelEnv: process.env.VERCEL_ENV || "development",
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    timestamp: new Date().toISOString(),
    forceRefresh: true,
  }

  return NextResponse.json(buildInfo, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
