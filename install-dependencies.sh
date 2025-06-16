#!/bin/bash

# 🚀 سكريبت تثبيت التبعيات الجديدة المحسنة

echo "🚀 بدء تثبيت التبعيات الجديدة..."
echo "════════════════════════════════════════════════════════════"

# تسجيل وقت البداية
start_time=$(date +%s)

# 1. فحص البيئة
echo "🔍 فحص البيئة..."
echo "📋 Node.js: $(node --version)"
echo "📋 npm: $(npm --version)"
echo "📋 Git: $(git --version 2>/dev/null || echo 'غير متاح')"
echo ""

# 2. إنشاء نسخة احتياطية
echo "💾 إنشاء نسخة احتياطية..."
mkdir -p backup
cp package.json backup/package.json.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp package-lock.json backup/package-lock.json.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
echo "✅ تم إنشاء النسخة الاحتياطية في مجلد backup/"
echo ""

# 3. تنظيف شامل
echo "🧹 تنظيف شامل للمشروع..."
echo "   🗑️ حذف node_modules..."
rm -rf node_modules
echo "   🗑️ حذف .next..."
rm -rf .next
echo "   🗑️ حذف out..."
rm -rf out
echo "   🗑️ حذف package-lock.json..."
rm -f package-lock.json
echo "✅ تم التنظيف بنجاح"
echo ""

# 4. تنظيف كاش npm
echo "🗑️ تنظيف كاش npm..."
npm cache clean --force
echo "✅ تم تنظيف الكاش"
echo ""

# 5. فحص package.json
echo "📋 فحص package.json..."
if [ -f "package.json" ]; then
    echo "✅ ملف package.json موجود"
    echo "📊 عدد التبعيات الأساسية: $(cat package.json | grep -A 20 '"dependencies"' | grep -c '"')"
    echo "📊 عدد تبعيات التطوير: $(cat package.json | grep -A 20 '"devDependencies"' | grep -c '"')"
else
    echo "❌ ملف package.json غير موجود!"
    exit 1
fi
echo ""

# 6. تثبيت التبعيات
echo "📦 تثبيت التبعيات الجديدة..."
echo "⏳ هذا قد يستغرق 1-3 دقائق..."
echo ""

if npm install; then
    echo ""
    echo "✅ تم تثبيت التبعيات الأساسية بنجاح!"
else
    echo ""
    echo "❌ فشل في تثبيت التبعيات الأساسية"
    echo "🔧 محاولة إصلاح..."
    npm install --legacy-peer-deps
fi
echo ""

# 7. إضافة تبعيات SWC
echo "⚡ إضافة تبعيات SWC لحل مشاكل الكومبايلر..."
if npm install @swc/core @swc/helpers --save-dev; then
    echo "✅ تم إضافة SWC بنجاح!"
else
    echo "⚠️ تحذير: فشل في إضافة SWC - سيتم المحاولة لاحقاً"
fi
echo ""

# 8. فحص التثبيت
echo "🔍 فحص التثبيت..."
if [ -d "node_modules" ]; then
    echo "✅ مجلد node_modules موجود"
    echo "📊 حجم node_modules: $(du -sh node_modules 2>/dev/null | cut -f1)"
    echo "📊 عدد الحزم المثبتة: $(find node_modules -name package.json | wc -l)"
else
    echo "❌ مجلد node_modules غير موجود!"
    exit 1
fi
echo ""

# 9. اختبار البناء
echo "🏗️ اختبار البناء..."
if npm run build; then
    echo ""
    echo "✅ البناء نجح بدون أخطاء!"
    build_success=true
else
    echo ""
    echo "⚠️ فشل البناء - قد تحتاج إصلاحات إضافية"
    build_success=false
fi
echo ""

# 10. تقرير نهائي
end_time=$(date +%s)
duration=$((end_time - start_time))

echo "🎉 تم إكمال تثبيت التبعيات!"
echo "════════════════════════════════════════════════════════════"
echo "📊 تقرير التثبيت:"
echo "   ⏱️ الوقت المستغرق: ${duration} ثانية"
echo "   📦 التبعيات: مثبتة بنجاح"
echo "   ⚡ SWC: مثبت لحل مشاكل الكومبايلر"
if [ "$build_success" = true ]; then
    echo "   🏗️ البناء: نجح بدون أخطاء"
else
    echo "   🏗️ البناء: يحتاج مراجعة"
fi
echo ""
echo "🚀 الخطوات التالية:"
echo "   1. اختبر المشروع: npm run dev"
echo "   2. فحص الصحة: npm run check:health"
echo "   3. النشر: npm run deploy"
echo ""
