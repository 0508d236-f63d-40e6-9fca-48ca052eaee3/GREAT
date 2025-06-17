import { type NextRequest, NextResponse } from "next/server"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Only initialize client-side code if we're in the browser
const connectionMonitor: any = null

if (isBrowser) {
  // Move any client-side initialization here
  // This code will only run in the browser
}

export async function GET(request: NextRequest) {
  try {
    // Your API logic here
    // Don't reference window, document, or other browser APIs directly

    return NextResponse.json({
      success: true,
      message: "API route working correctly",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle POST logic here
    // Remember: no browser APIs on the server

    return NextResponse.json({
      success: true,
      data: body,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
