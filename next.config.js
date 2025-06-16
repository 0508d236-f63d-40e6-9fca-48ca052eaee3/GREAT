/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // تحسين SWC
    swcMinify: true,
    forceSwcTransforms: true,
  },
  // تحسين الأداء
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // إعدادات الإنتاج
  poweredByHeader: false,
  reactStrictMode: true,
  // تحسين الصور
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  // إعدادات التصدير
  output: "standalone",
  trailingSlash: false,
  // تحسين الحزم
  webpack: (config, { dev, isServer }) => {
    // تحسين SWC
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
