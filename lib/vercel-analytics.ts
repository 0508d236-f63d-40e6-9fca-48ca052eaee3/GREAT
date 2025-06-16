/**
 * 📊 تحليلات Vercel
 */

declare global {
  interface Window {
    va?: any
  }
}

export function initVercelAnalytics() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    // تحليلات Vercel
    import("@vercel/analytics").then(({ inject }) => {
      inject()
    })

    // Speed Insights
    import("@vercel/speed-insights/next").then(({ SpeedInsights }) => {
      // تم التحميل
    })
  }
}

export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && window.va) {
    window.va("track", name, properties)
  }
}

// أحداث مخصصة للتتبع
export const ANALYTICS_EVENTS = {
  TOKEN_ANALYZED: "token_analyzed",
  FILTER_APPLIED: "filter_applied",
  SEARCH_PERFORMED: "search_performed",
  PAGE_CHANGED: "page_changed",
  REFRESH_CLICKED: "refresh_clicked",
} as const
