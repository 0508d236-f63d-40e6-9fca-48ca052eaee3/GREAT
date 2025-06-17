"use client"

// This file will only run on the client side
export class ConnectionMonitor {
  constructor() {
    if (typeof window !== "undefined") {
      this.initializeConnectionMonitor()
    }
  }

  private initializeConnectionMonitor() {
    // Your client-side logic here
    console.log("Connection monitor initialized")
  }

  public getConnectionStatus() {
    if (typeof window === "undefined") {
      return "server"
    }
    return navigator.onLine ? "online" : "offline"
  }
}
