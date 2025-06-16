/**
 * ⚡ تحسين المشروع لـ Vercel
 */

const fs = require("fs")
const path = require("path")

function optimizeForVercel() {
  console.log("⚡ تحسين المشروع لـ Vercel...\n")

  // 1. إنشاء .vercelignore
  console.log("📝 إنشاء .vercelignore...")
  const vercelIgnore = `
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
.next
out
dist

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode
.idea
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/
`.trim()

  fs.writeFileSync(".vercelignore", vercelIgnore)
  console.log("✅ تم إنشاء .vercelignore")

  // 2. تحسين next.config.js
  console.log("🔧 تحسين next.config.js...")
  // تم بالفعل في الملف الموجود

  // 3. إنشاء robots.txt
  console.log("🤖 إنشاء robots.txt...")
  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: https://great-crypto-platform.vercel.app/sitemap.xml
`.trim()

  if (!fs.existsSync("public")) {
    fs.mkdirSync("public")
  }
  fs.writeFileSync("public/robots.txt", robotsTxt)
  console.log("✅ تم إنشاء robots.txt")

  // 4. إنشاء sitemap.xml
  console.log("🗺️ إنشاء sitemap.xml...")
  const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://great-crypto-platform.vercel.app/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`.trim()

  fs.writeFileSync("public/sitemap.xml", sitemap)
  console.log("✅ تم إنشاء sitemap.xml")

  // 5. تحسين الصور
  console.log("🖼️ تحسين الصور...")
  // إنشاء favicon بسيط
  // يمكن إضافة favicon.ico هنا

  console.log("\n🎉 تم تحسين المشروع لـ Vercel بنجاح!")
}

optimizeForVercel()
