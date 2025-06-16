/**
 * 🔧 إصلاح مشاكل النشر
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

async function fixDeployment() {
  console.log("🔧 بدء إصلاح مشاكل النشر...\n")

  try {
    // 1. فحص الملفات المطلوبة
    console.log("📁 فحص الملفات المطلوبة...")
    const requiredFiles = ["package.json", "next.config.js", "app/page.tsx", "app/layout.tsx", "app/globals.css"]

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.log(`❌ ملف مفقود: ${file}`)
        return false
      }
      console.log(`✅ ${file}`)
    }

    // 2. فحص package.json
    console.log("\n📦 فحص package.json...")
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))

    if (!pkg.scripts || !pkg.scripts.build) {
      console.log("❌ build script مفقود في package.json")
      return false
    }
    console.log("✅ build script موجود")

    // 3. فحص التبعيات
    console.log("\n🔍 فحص التبعيات...")
    if (!pkg.dependencies || !pkg.dependencies.next) {
      console.log("❌ Next.js غير مثبت")
      return false
    }
    console.log("✅ Next.js مثبت")

    // 4. تنظيف الملفات القديمة
    console.log("\n🧹 تنظيف الملفات القديمة...")
    const dirsToClean = [".next", ".vercel", "out", "dist"]
    for (const dir of dirsToClean) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
        console.log(`🗑️ تم حذف ${dir}`)
      }
    }

    // 5. إنشاء .vercelignore
    console.log("\n📝 إنشاء .vercelignore...")
    const vercelIgnore = `
node_modules
.next
out
dist
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.DS_Store
Thumbs.db
*.log
.vscode
.idea
`.trim()

    fs.writeFileSync(".vercelignore", vercelIgnore)
    console.log("✅ تم إنشاء .vercelignore")

    // 6. اختبار البناء
    console.log("\n🏗️ اختبار البناء...")
    try {
      execSync("npm run build", { stdio: "pipe" })
      console.log("✅ البناء نجح")
    } catch (error) {
      console.log("❌ فشل البناء:")
      console.log(error.message)
      return false
    }

    console.log("\n🎉 تم إصلاح جميع المشاكل!")
    console.log("\n📋 الخطوات التالية:")
    console.log("1. npx vercel login")
    console.log("2. npx vercel --prod --force")

    return true
  } catch (error) {
    console.error("❌ خطأ في الإصلاح:", error.message)
    return false
  }
}

fixDeployment()
