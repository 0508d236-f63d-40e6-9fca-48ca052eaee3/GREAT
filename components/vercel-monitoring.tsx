"use client"

import { useEffect } from "react"
import { initVercelAnalytics, trackEvent } from "../lib/vercel-analytics"

export default function VercelMonitoring() {
  useEffect(() => {
    // تهيئة التحليلات
    initVercelAnalytics()

    // تتبع تحميل الصفحة
    trackEvent("page_loaded", {
      path: window.location.pathname,
      timestamp: Date.now(),
    })

    // تتبع الأخطاء
    window.addEventListener("error", (error) => {
      trackEvent("error_occurred", {
        message: error.message,
        filename: error.filename,
        line: error.lineno,
      })
    })

    // تتبع الأداء
    if ("performance" in window) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
          trackEvent("performance_metrics", {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint:
              performance.getEntriesByType("paint").find((entry) => entry.name === "first-paint")?.startTime || 0,
          })
        }, 1000)
      })
    }
  }, [])

  return null
}
