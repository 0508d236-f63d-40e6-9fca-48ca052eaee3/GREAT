# إعدادات Vercel Dashboard

## 1. Project Settings
- **Project Name:** great-crypto-platform
- **Framework:** Next.js
- **Root Directory:** ./
- **Build Command:** npm run build
- **Output Directory:** .next
- **Install Command:** npm install
- **Development Command:** npm run dev

## 2. Environment Variables
\`\`\`
NEXT_PUBLIC_APP_NAME=GREAT
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_VERCEL_ENV=production
\`\`\`

## 3. Domains
- **Production:** great-crypto-platform.vercel.app
- **Custom Domain:** (اختياري) your-domain.com

## 4. Functions
- **Region:** Washington, D.C., USA (iad1)
- **Node.js Version:** 18.x
- **Memory:** 1024 MB
- **Timeout:** 30 seconds

## 5. Security Headers
- **X-Frame-Options:** DENY
- **X-Content-Type-Options:** nosniff
- **Referrer-Policy:** strict-origin-when-cross-origin
- **X-XSS-Protection:** 1; mode=block

## 6. Performance
- **Edge Network:** Enabled
- **Compression:** Enabled
- **Image Optimization:** Enabled
