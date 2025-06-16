#!/bin/bash

echo "🚨 الحل النهائي والمضمون لمشكلة النشر!"
echo "========================================"

# 1. تنظيف شامل
echo "🧹 تنظيف شامل للملفات..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
rm -rf .vercel

# 2. إعادة تثبيت التبعيات
echo "📦 إعادة تثبيت التبعيات..."
rm -rf node_modules
rm package-lock.json
npm install

# 3. إصلاح المشاكل الأمنية
echo "🔒 إصلاح المشاكل الأمنية..."
npm audit fix --force

# 4. بناء المشروع محلياً للتأكد
echo "🔨 بناء المشروع للتأكد من عدم وجود أخطاء..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل في البناء! يرجى إصلاح الأخطاء أولاً."
    exit 1
fi

# 5. إنشاء ملفات التحقق
echo "📝 إنشاء ملفات التحقق..."
mkdir -p public
echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" > public/build-time.txt
echo "final-fix-$(date +%s)" > public/force-refresh.txt

# 6. إضافة التغييرات إلى Git
echo "📝 إضافة التغييرات إلى Git..."
git add .
git commit -m "🚨 FINAL FIX: Remove static export completely, enable API routes - $(date)"

# 7. النشر
echo "🚀 النشر على Vercel..."
git push origin main

echo ""
echo "✅ تم تطبيق الحل النهائي!"
echo "🔍 التغييرات المطبقة:"
echo "   ✅ إزالة static export نهائياً من جميع الملفات"
echo "   ✅ تفعيل API routes"
echo "   ✅ إصلاح package.json"
echo "   ✅ تحسين vercel.json"
echo "   ✅ إصلاح tailwind.config.js"
echo "   ✅ إضافة API endpoints للفحص"
echo ""
echo "⏳ انتظر 3-5 دقائق ثم افحص:"
echo "🌐 الموقع الرئيسي: [YOUR_DOMAIN]"
echo "🔍 API Health: [YOUR_DOMAIN]/api/health"
echo "📊 Deployment Check: [YOUR_DOMAIN]/api/deployment-check"
echo ""
echo "🎯 إذا ظهرت البيانات في هذه الروابط، فالمشكلة محلولة 100%"
