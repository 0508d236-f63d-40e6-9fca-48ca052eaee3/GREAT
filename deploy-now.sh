#!/bin/bash

echo "🚀 بدء عملية النشر الشاملة..."

# متغيرات الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة للطباعة الملونة
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# الخطوة 1: التحقق من البيئة
print_status "🔍 التحقق من البيئة..."

# التحقق من Git
if ! command -v git &> /dev/null; then
    print_error "Git غير مثبت!"
    exit 1
fi

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js غير مثبت!"
    exit 1
fi

# التحقق من npm
if ! command -v npm &> /dev/null; then
    print_error "npm غير مثبت!"
    exit 1
fi

print_success "البيئة جاهزة ✅"

# الخطوة 2: تنظيف المشروع
print_status "🧹 تنظيف المشروع..."

rm -rf node_modules
rm -rf .next
rm -rf out
rm -rf package-lock.json
rm -rf yarn.lock

print_success "تم تنظيف المشروع ✅"

# الخطوة 3: تنظيف كاش npm
print_status "🗑️ تنظيف كاش npm..."
npm cache clean --force

print_success "تم تنظيف الكاش ✅"

# الخطوة 4: تثبيت التبعيات
print_status "📦 تثبيت التبعيات..."

if npm install; then
    print_success "تم تثبيت التبعيات ✅"
else
    print_error "فشل في تثبيت التبعيات ❌"
    exit 1
fi

# الخطوة 5: تثبيت SWC
print_status "⚡ تثبيت SWC..."

if npm install @swc/core @swc/helpers --save-dev; then
    print_success "تم تثبيت SWC ✅"
else
    print_warning "تحذير: مشكلة في تثبيت SWC ⚠️"
fi

# الخطوة 6: اختبار البناء
print_status "🏗️ اختبار البناء..."

if npm run build; then
    print_success "البناء نجح ✅"
else
    print_error "فشل البناء ❌"
    print_error "يرجى إصلاح الأخطاء قبل المتابعة"
    exit 1
fi

# الخطوة 7: التحقق من Git status
print_status "📝 التحقق من حالة Git..."

if git status --porcelain | grep -q .; then
    print_status "يوجد تغييرات غير محفوظة، سيتم حفظها..."
    
    # إضافة جميع الملفات
    git add .
    
    # إنشاء commit
    COMMIT_MESSAGE="🚀 Deploy: إصلاح مشاكل SWC و Tailwind + تحسينات النشر - $(date '+%Y-%m-%d %H:%M:%S')"
    
    if git commit -m "$COMMIT_MESSAGE"; then
        print_success "تم إنشاء commit جديد ✅"
    else
        print_error "فشل في إنشاء commit ❌"
        exit 1
    fi
else
    print_success "لا توجد تغييرات جديدة ✅"
fi

# الخطوة 8: دفع التغييرات
print_status "🔄 دفع التغييرات إلى GitHub..."

# التحقق من الفرع الحالي
CURRENT_BRANCH=$(git branch --show-current)
print_status "الفرع الحالي: $CURRENT_BRANCH"

if git push origin $CURRENT_BRANCH; then
    print_success "تم دفع التغييرات بنجاح ✅"
else
    print_error "فشل في دفع التغييرات ❌"
    print_error "تحقق من اتصال الإنترنت وصلاحيات Git"
    exit 1
fi

# الخطوة 9: التحقق من Vercel
print_status "☁️ التحقق من حالة Vercel..."

if command -v vercel &> /dev/null; then
    print_status "Vercel CLI متاح، محاولة النشر المباشر..."
    
    if vercel --prod --yes; then
        print_success "تم النشر عبر Vercel CLI ✅"
    else
        print_warning "فشل النشر عبر CLI، سيتم النشر التلقائي ⚠️"
    fi
else
    print_warning "Vercel CLI غير متاح، الاعتماد على النشر التلقائي ⚠️"
fi

# الخطوة 10: معلومات النشر
print_status "📊 معلومات النشر:"
echo "----------------------------------------"
echo "📅 تاريخ النشر: $(date)"
echo "🌿 الفرع: $CURRENT_BRANCH"
echo "📝 آخر commit: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')"
echo "🔗 المستودع: $(git config --get remote.origin.url)"
echo "----------------------------------------"

# الخطوة 11: تعليمات المتابعة
print_success "🎉 تم إكمال عملية النشر!"
echo ""
print_status "📋 الخطوات التالية:"
echo "1. 🌐 تحقق من Vercel Dashboard: https://vercel.com/dashboard"
echo "2. ⏱️ انتظر 2-5 دقائق لاكتمال النشر"
echo "3. 🔍 تحقق من الموقع المنشور"
echo "4. 🧹 امسح كاش المتصفح إذا لم تظهر التحديثات"
echo ""

# الخطوة 12: روابط مفيدة
print_status "🔗 روابط مفيدة:"
echo "• Vercel Dashboard: https://vercel.com/dashboard"
echo "• GitHub Repository: $(git config --get remote.origin.url)"
echo "• Build Logs: https://vercel.com/dashboard (تحقق من آخر deployment)"
echo ""

print_success "✨ النشر مكتمل! تحقق من موقعك خلال دقائق قليلة ✨"

# إنشاء ملف معلومات النشر
cat > deployment-info.txt << EOF
🚀 DEPLOYMENT INFO
==================
Date: $(date)
Branch: $CURRENT_BRANCH
Last Commit: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')
Repository: $(git config --get remote.origin.url)
Build Status: SUCCESS
Deployment Status: PUSHED TO VERCEL

Next Steps:
1. Check Vercel Dashboard
2. Wait 2-5 minutes for deployment
3. Verify website updates
4. Clear browser cache if needed

Links:
- Vercel: https://vercel.com/dashboard
- GitHub: $(git config --get remote.origin.url)
==================
EOF

print_success "📄 تم إنشاء ملف deployment-info.txt مع تفاصيل النشر"
