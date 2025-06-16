/**
 * 🚀 إعدادات Vercel المحسنة
 */

export const VERCEL_CONFIG = {
  // إعدادات الأداء
  performance: {
    // تحسين الصور
    images: {
      domains: ["pump.fun", "arweave.net", "ipfs.io"],
      formats: ["image/webp", "image/avif"],
      minimumCacheTTL: 60,
    },

    // ضغط الاستجابات
    compress: true,

    // تحسين الخطوط
    fonts: {
      preload: ["/fonts/inter-var.woff2", "/fonts/arabic-font.woff2"],
    },
  },

  // إعدادات الأمان
  security: {
    headers: {
      "Content-Security-Policy": `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        font-src 'self' data:;
        connect-src 'self' https://frontend-api.pump.fun https://api.mainnet-beta.solana.com https://solana-api.projectserum.com https://rpc.ankr.com https://solana.public-rpc.com wss:;
        frame-src 'none';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
      `
        .replace(/\s+/g, " ")
        .trim(),
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },

  // إعدادات التخزين المؤقت
  caching: {
    // ملفات ثابتة
    static: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },

    // API responses
    api: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },

    // صفحات HTML
    pages: {
      "Cache-Control": "public, max-age=0, s-maxage=60",
    },
  },
}

/**
 * 🔧 تطبيق إعدادات Vercel
 */
export function applyVercelOptimizations() {
  // تحسينات خاصة بـ Vercel
  if (typeof window !== "undefined") {
    // تحسين التحميل
    const link = document.createElement("link")
    link.rel = "dns-prefetch"
    link.href = "https://frontend-api.pump.fun"
    document.head.appendChild(link)

    // تحسين الخطوط
    const fontLink = document.createElement("link")
    fontLink.rel = "preload"
    fontLink.as = "font"
    fontLink.type = "font/woff2"
    fontLink.crossOrigin = "anonymous"
    fontLink.href = "/fonts/inter-var.woff2"
    document.head.appendChild(fontLink)
  }
}
