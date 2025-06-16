#!/bin/bash

# 🚀 تثبيت سريع للتبعيات (بدون تفاصيل)

echo "🚀 تثبيت سريع للتبعيات..."

# تنظيف سريع
rm -rf node_modules package-lock.json .next out
npm cache clean --force

# تثبيت
npm install && npm install @swc/core @swc/helpers --save-dev

# اختبار
npm run build && echo "✅ جاهز للاستخدام!"
