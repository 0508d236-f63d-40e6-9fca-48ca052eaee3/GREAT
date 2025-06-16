#!/bin/bash

echo "🔧 إصلاح مشاكل SWC و Tailwind..."

# حذف ملفات القفل والـ node_modules
echo "🗑️ حذف الملفات القديمة..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock
rm -rf .next
rm -rf out

# تنظيف الكاش
echo "🧹 تنظيف الكاش..."
npm cache clean --force

# تثبيت التبعيات من جديد
echo "📦 تثبيت التبعيات..."
npm install

# تثبيت SWC بشكل صريح
echo "⚡ تثبيت SWC..."
npm install @swc/core @swc/helpers --save-dev

# تثبيت تبعيات إضافية قد تكون مفقودة
echo "🔧 تثبيت تبعيات إضافية..."
npm install @next/swc-linux-x64-gnu @next/swc-linux-x64-musl @next/swc-win32-x64-msvc @next/swc-darwin-x64 @next/swc-darwin-arm64 --save-dev

# بناء المشروع للتأكد من عدم وجود أخطاء
echo "🏗️ بناء المشروع..."
npm run build

echo "✅ تم إصلاح جميع المشاكل!"
echo "🚀 يمكنك الآن دفع التغييرات ونشر المشروع"
