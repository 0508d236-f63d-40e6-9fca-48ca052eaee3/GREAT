import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // إضافة headers الأمان
  const response = NextResponse.next()

  // CORS للـ APIs الخارجية
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  }

  // إعادة توجيه APIs
  if (request.nextUrl.pathname.startsWith("/pump-api/")) {
    const url = request.nextUrl.clone()
    url.hostname = "frontend-api.pump.fun"
    url.pathname = url.pathname.replace("/pump-api", "")
    return NextResponse.rewrite(url)
  }

  // Headers الأمان
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
