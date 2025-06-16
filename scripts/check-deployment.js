/**
 * 🔍 فحص جاهزية النشر
 */

const https = require("https")
const fs = require("fs")

async function checkDeploymentReadiness() {
  console.log("🔍 فحص جاهزية النشر...\n")

  const checks = []

  // 1. فحص ملفات المشروع
  console.log("📁 فحص ملفات المشروع...")
  const requiredFiles = [
    "package.json",
    "next.config.js",
    "tailwind.config.js",
    "app/page.tsx",
    "app/layout.tsx",
    "app/globals.css",
  ]

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
      checks.push(true)
    } else {
      console.log(`❌ ${file} مفقود`)
      checks.push(false)
    }
  }

  // 2. فحص package.json
  console.log("\n📦 فحص package.json...")
  try {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))

    if (pkg.scripts && pkg.scripts.build) {
      console.log("✅ build script موجود")
      checks.push(true)
    } else {
      console.log("❌ build script مفقود")
      checks.push(false)
    }

    if (pkg.dependencies && pkg.dependencies.next) {
      console.log("✅ Next.js مثبت")
      checks.push(true)
    } else {
      console.log("❌ Next.js غير مثبت")
      checks.push(false)
    }
  } catch (error) {
    console.log("❌ خطأ في قراءة package.json")
    checks.push(false)
  }

  // 3. فحص البناء
  console.log("\n🏗️ فحص إمكانية البناء...")
  try {
    const { execSync } = require("child_process")
    execSync("npm run build", { stdio: "pipe" })
    console.log("✅ البناء نجح")
    checks.push(true)
  } catch (error) {
    console.log("❌ فشل البناء")
    console.log(error.message)
    checks.push(false)
  }

  // النتيجة النهائية
  const passedChecks = checks.filter(Boolean).length
  const totalChecks = checks.length

  console.log(`\n📊 النتيجة: ${passedChecks}/${totalChecks} فحوصات نجحت`)

  if (passedChecks === totalChecks) {
    console.log("🚀 المشروع جاهز للنشر على Vercel!")
    return true
  } else {
    console.log("⚠️ يجب إصلاح المشاكل قبل النشر")
    return false
  }
}

checkDeploymentReadiness()
