#!/bin/bash

echo "🚀 بدء النشر القسري..."

# تنظيف الملفات المؤقتة
echo "🧹 تنظيف الملفات المؤقتة..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
rm -rf .vercel

# تحديث package-lock.json
echo "📦 تحديث Dependencies..."
npm cache clean --force
rm -f package-lock.json
npm install --force

# بناء المشروع
echo "🔨 بناء المشروع..."
npm run build

# رفع التغييرات إلى Git
echo "📤 رفع التغييرات إلى Git..."
git add .
git commit -m "Force deployment - $(date)"
git push origin main --force

echo "✅ تم النشر بنجاح!"
echo "⏳ انتظر 2-3 دقائق لانعكاس التغييرات..."
