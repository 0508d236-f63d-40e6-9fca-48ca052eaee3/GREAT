#!/bin/bash

echo "🚀 إجبار إعادة النشر الكاملة..."

# 1. تنظيف الملفات المؤقتة
echo "🧹 تنظيف الملفات المؤقتة..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
rm -rf .vercel

# 2. إعادة تثبيت التبعيات
echo "📦 إعادة تثبيت التبعيات..."
npm ci

# 3. بناء المشروع
echo "🔨 بناء المشروع..."
npm run build

# 4. إنشاء ملف timestamp للإجبار على التحديث
echo "⏰ إنشاء timestamp..."
echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" > public/build-time.txt
echo "force-refresh-$(date +%s)" > public/force-refresh.txt

# 5. نشر على Vercel
echo "🚀 النشر على Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod --force
else
    echo "⚠️ Vercel CLI غير مثبت. استخدم Git push للنشر."
    echo "📝 إضافة التغييرات إلى Git..."
    git add .
    git commit -m "Force redeploy - $(date)"
    git push origin main
fi

echo "✅ تم إجبار إعادة النشر!"
echo "⏳ انتظر 2-3 دقائق ثم تحقق من الموقع المباشر"
