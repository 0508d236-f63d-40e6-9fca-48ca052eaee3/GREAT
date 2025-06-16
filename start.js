const { spawn } = require("child_process")
const fs = require("fs")

console.log("🚀 تشغيل Solana Real-Time Tracker...")
console.log("=====================================")
console.log("✅ بيانات حقيقية مباشرة من البلوك تشين")
console.log("🔗 بدون APIs خارجية")
console.log("⚡ تحديث كل 30 ثانية")
console.log("=====================================")

// التحقق من الملفات
if (!fs.existsSync("package.json")) {
  console.log("❌ ملف package.json غير موجود")
  process.exit(1)
}

console.log("✅ الملفات موجودة")

// تثبيت التبعيات
console.log("\n📦 تثبيت التبعيات...")
const install = spawn("npm", ["install"], {
  stdio: "inherit",
  shell: true,
})

install.on("close", (code) => {
  if (code !== 0) {
    console.log("❌ فشل في تثبيت التبعيات")
    console.log("💡 جرب: npm install --force")
    process.exit(1)
  }

  console.log("✅ تم تثبيت التبعيات")

  // تشغيل الموقع
  console.log("\n🌐 تشغيل الموقع...")
  console.log("=====================================")
  console.log("🎯 الموقع سيكون على: http://localhost:3000")
  console.log("🔗 اتصال مباشر بشبكة Solana")
  console.log("📊 بيانات حقيقية من البلوك تشين")
  console.log("⚡ لإيقاف الموقع: اضغط Ctrl+C")
  console.log("=====================================")

  const dev = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
  })

  dev.on("close", (devCode) => {
    console.log(`🛑 تم إيقاف الموقع (كود: ${devCode})`)
  })
})
