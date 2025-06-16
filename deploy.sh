#!/bin/bash

echo "🚀 بدء عملية النشر على Vercel..."
echo "=================================="

# التحقق من Node.js
echo "📋 فحص متطلبات النظام..."
node --version
npm --version

# تنظيف المشروع
echo "🧹 تنظيف المشروع..."
rm -rf .next
rm -rf node_modules
rm -rf out

# تثبيت التبعيات
echo "📦 تثبيت التبعيات..."
npm install

# فحص الأخطاء
echo "🔍 فحص الكود..."
npm run lint --fix 2>/dev/null || echo "⚠️ ESLint غير متاح"

# بناء المشروع
echo "🏗️ بناء المشروع..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ تم بناء المشروع بنجاح"
else
    echo "❌ فشل في بناء المشروع"
    exit 1
fi

# تثبيت Vercel CLI
echo "🔧 تثبيت Vercel CLI..."
npm install -g vercel

echo "✅ المشروع جاهز للنشر!"
echo "🔗 قم بتشغيل: vercel --prod"
