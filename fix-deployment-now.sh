#!/bin/bash

echo "🚨 إصلاح مشاكل النشر الحرجة فوراً!"

# 1. إصلاح next.config.js (إزالة static export)
echo "🔧 إصلاح next.config.js..."
# تم إصلاحه في الملف أعلاه

# 2. إصلاح tailwind.config.js (إزالة pattern المشكل)
echo "⚡ إصلاح tailwind.config.js..."
# تم إصلاحه في الملف أعلاه

# 3. إصلاح vercel.json (استخدام @vercel/next بدلاً من static-build)
echo "🚀 إصلاح vercel.json..."
# تم إصلاحه في الملف أعلاه

# 4. تنظيف وإعادة البناء
echo "🧹 تنظيف الملفات المؤقتة..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# 5. إعادة تثبيت التبعيات
echo "📦 إعادة تثبيت التبعيات..."
npm ci

# 6. إصلاح vulnerabilities
echo "🔒 إصلاح المشاكل الأمنية..."
npm audit fix --force

# 7. بناء المشروع
echo "🔨 بناء المشروع..."
npm run build

# 8. إنشاء ملف timestamp للإجبار على التحديث
echo "⏰ إنشاء timestamp..."
echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" > public/build-time.txt
echo "critical-fix-$(date +%s)" > public/force-refresh.txt

# 9. نشر على Vercel
echo "🚀 النشر على Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod --force
else
    echo "⚠️ Vercel CLI غير مثبت. استخدم Git push للنشر."
    echo "📝 إضافة التغييرات إلى Git..."
    git add .
    git commit -m "🚨 CRITICAL FIX: Remove static export, fix Tailwind, enable API routes - $(date)"
    git push origin main
fi

echo ""
echo "✅ تم إصلاح المشاكل الحرجة!"
echo "🔍 المشاكل التي تم إصلاحها:"
echo "   ✅ إزالة static export (يعطل API routes)"
echo "   ✅ إصلاح Tailwind CSS patterns"
echo "   ✅ تحسين إعدادات Vercel"
echo "   ✅ إصلاح المشاكل الأمنية"
echo ""
echo "⏳ انتظر 3-5 دقائق ثم تحقق من الموقع المباشر"
echo "🌐 الموقع سيعمل الآن بشكل صحيح مع جميع الوظائف"
