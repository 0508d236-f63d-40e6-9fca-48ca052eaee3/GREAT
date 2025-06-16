/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  swcMinify: true,
  reactStrictMode: true,
  // إزالة output: 'export' لأنه يسبب مشاكل مع Vercel
}

export default nextConfig
