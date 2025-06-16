#!/bin/bash

echo "🚨 حل طارئ لمشكلة DEPLOYMENT_NOT_FOUND"
echo "======================================="

# 1. حذف جميع ملفات Vercel
echo "🗑️ حذف ملفات Vercel القديمة..."
rm -rf .vercel
rm -rf .next
rm -rf out
rm -rf dist

# 2. تنظيف npm cache
echo "🧹 تنظيف npm cache..."
npm cache clean --force

# 3. إعادة تثبيت التبعيات
echo "📦 إعادة تثبيت التبعيات..."
rm -rf node_modules
npm install

# 4. اختبار البناء
echo "🏗️ اختبار البناء..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ البناء نجح"
else
    echo "❌ فشل البناء - يجب إصلاح الأخطاء أولاً"
    exit 1
fi

# 5. إنشاء مشروع Vercel جديد تماماً
echo "🆕 إنشاء مشروع Vercel جديد..."
npx vercel --prod --force --name "great-crypto-$(date +%s)"

echo "✅ تم إنشاء نشر جديد!"
