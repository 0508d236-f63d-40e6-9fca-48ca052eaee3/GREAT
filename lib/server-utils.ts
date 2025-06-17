// Server-side only utilities
export function processTokens(tokens: string[]) {
  // This runs on the server - no browser APIs
  return tokens.map((token) => ({
    id: token,
    processed: true,
    timestamp: new Date().toISOString(),
  }))
}

export function validateRequest(request: Request) {
  // Server-side validation logic
  const contentType = request.headers.get("content-type")
  return contentType?.includes("application/json") ?? false
}
