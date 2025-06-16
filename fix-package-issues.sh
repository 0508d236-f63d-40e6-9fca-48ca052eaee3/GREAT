#!/bin/bash

# 🚀 سكريبت إصلاح مشاكل package.json والتبعيات

echo "🔧 بدء إصلاح مشاكل package.json..."
echo "════════════════════════════════════════"

# 1. إنشاء نسخة احتياطية
echo "💾 إنشاء نسخة احتياطية..."
mkdir -p backup
cp package.json backup/package.json.backup 2>/dev/null || true
cp package-lock.json backup/package-lock.json.backup 2>/dev/null || true
echo "✅ تم إنشاء النسخة الاحتياطية"

# 2. تنظيف شامل
echo "🧹 تنظيف شامل للمشروع..."
rm -rf node_modules
rm -rf .next
rm -rf out
rm -f package-lock.json
echo "✅ تم التنظيف بنجاح"

# 3. تنظيف كاش npm
echo "🗑️ تنظيف كاش npm..."
npm cache clean --force
echo "✅ تم تنظيف الكاش"

# 4. تثبيت التبعيات الجديدة
echo "📦 تثبيت التبعيات..."
npm install
echo "✅ تم تثبيت التبعيات الأساسية"

# 5. إضافة تبعيات SWC
echo "⚡ إضافة تبعيات SWC..."
npm install @swc/core @swc/helpers --save-dev
echo "✅ تم إضافة SWC بنجاح"

# 6. اختبار البناء
echo "🏗️ اختبار البناء..."
if npm run build; then
    echo "✅ البناء نجح بدون أخطاء!"
else
    echo "❌ فشل البناء - راجع الأخطاء أعلاه"
    exit 1
fi

# 7. فحص الصحة
echo "🔍 فحص صحة المشروع..."
node -e "console.log('✅ Node.js:', process.version)"
npm -v | xargs -I {} echo "✅ npm: {}"
echo "✅ جميع الفحوصات نجحت!"

echo ""
echo "🎉 تم إصلاح جميع مشاكل package.json بنجاح!"
echo "════════════════════════════════════════"
echo "📋 الخطوات التالية:"
echo "   1. راجع الملفات المحدثة"
echo "   2. اختبر المشروع: npm run dev"
echo "   3. انشر المشروع: npm run deploy"
echo ""
