import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "2.1.0",
      environment: process.env.NODE_ENV,
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME,
      message: "API is working correctly - Static Export disabled",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "API endpoint failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return NextResponse.json({
    status: "healthy",
    method: "POST",
    timestamp: new Date().toISOString(),
    message: "POST method working - API Routes enabled",
  })
}
