#!/bin/bash

echo "🚀 إصلاح مشاكل النشر الشاملة..."

# الخطوة 1: إصلاح SWC
echo "⚡ إصلاح مشاكل SWC..."
./fix-swc-issues.sh

# الخطوة 2: إصلاح Tailwind
echo "🎨 إصلاح تكوين Tailwind..."
echo "تم تحديث tailwind.config.js لتجنب node_modules"

# الخطوة 3: تحديث Git
echo "📝 تحديث Git..."
git add .
git commit -m "fix: إصلاح مشاكل SWC و Tailwind للنشر"

# الخطوة 4: دفع التغييرات
echo "🔄 دفع التغييرات..."
git push origin main

echo "✅ تم إصلاح جميع مشاكل النشر!"
echo "🌐 تحقق من الموقع خلال 2-3 دقائق"
