#!/bin/bash

echo "🔧 إصلاح مشكلة النشر على Vercel..."
echo "=================================="

# 1. تنظيف شامل
echo "🧹 تنظيف المشروع..."
rm -rf .next
rm -rf .vercel
rm -rf node_modules
rm -rf out
rm -rf dist

# 2. إعادة تثبيت التبعيات
echo "📦 إعادة تثبيت التبعيات..."
npm cache clean --force
npm install

# 3. فحص package.json
echo "📋 فحص package.json..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json مفقود!"
    exit 1
fi

# 4. اختبار البناء محلياً
echo "🏗️ اختبار البناء..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل البناء المحلي"
    exit 1
fi

echo "✅ البناء نجح محلياً"

# 5. تسجيل الدخول لـ Vercel
echo "🔐 تسجيل الدخول لـ Vercel..."
npx vercel login

# 6. إعادة النشر
echo "🚀 إعادة النشر..."
npx vercel --prod --force

echo "✅ تم إعادة النشر!"
