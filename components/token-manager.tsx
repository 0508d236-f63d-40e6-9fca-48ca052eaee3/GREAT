"use client"

import { useEffect, useState } from "react"

export default function TokenManager() {
  const [connectionMonitor, setConnectionMonitor] = useState<any>(null)

  useEffect(() => {
    // Dynamically import client-side only code
    const loadConnectionMonitor = async () => {
      if (typeof window !== "undefined") {
        const { ConnectionMonitor } = await import("../lib/client-utils")
        setConnectionMonitor(new ConnectionMonitor())
      }
    }

    loadConnectionMonitor()
  }, [])

  return (
    <div>
      <h2>Token Manager</h2>
      {connectionMonitor && <p>Status: {connectionMonitor.getConnectionStatus()}</p>}
    </div>
  )
}
