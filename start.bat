@echo off
echo 🚀 تشغيل Solana Real-Time Tracker...
echo =====================================
echo ✅ بيانات حقيقية مباشرة من البلوك تشين
echo 🔗 بدون APIs خارجية  
echo ⚡ تحديث كل 30 ثانية
echo =====================================

echo 📦 تثبيت التبعيات...
call npm install

if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت التبعيات
    echo 💡 جرب: npm install --force
    pause
    exit /b 1
)

echo ✅ تم تثبيت التبعيات

echo 🌐 تشغيل الموقع...
echo =====================================
echo 🎯 الموقع سيكون على: http://localhost:3000
echo 🔗 اتصال مباشر بشبكة Solana
echo 📊 بيانات حقيقية من البلوك تشين
echo ⚡ لإيقاف الموقع: اضغط Ctrl+C
echo =====================================

call npm run dev

pause
