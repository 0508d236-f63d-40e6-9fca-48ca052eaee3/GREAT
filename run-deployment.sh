#!/bin/bash

# 🚀 سكريبت مساعد لتشغيل النشر مع التحقق من المتطلبات

echo "🚀 مساعد النشر - التحقق من الجاهزية"
echo "════════════════════════════════════════"

# ألوان للعرض
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة للطباعة الملونة
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# متغير لتتبع الأخطاء
ERRORS=0

echo ""
echo "🔍 فحص المتطلبات الأساسية..."
echo "────────────────────────────────"

# فحص Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js متاح: $NODE_VERSION"
    
    # فحص إصدار Node.js
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        print_success "إصدار Node.js مناسب (16+)"
    else
        print_error "إصدار Node.js قديم! يحتاج 16+ (الحالي: $NODE_VERSION)"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_error "Node.js غير مثبت!"
    print_info "قم بتثبيته من: https://nodejs.org/"
    ERRORS=$((ERRORS + 1))
fi

# فحص npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm متاح: $NPM_VERSION"
else
    print_error "npm غير متاح!"
    ERRORS=$((ERRORS + 1))
fi

# فحص Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git متاح: $GIT_VERSION"
    
    # فحص إعدادات Git
    if git config user.name &> /dev/null && git config user.email &> /dev/null; then
        print_success "Git مُعد بشكل صحيح"
        print_info "المستخدم: $(git config user.name) <$(git config user.email)>"
    else
        print_warning "Git غير مُعد بالكامل"
        print_info "قم بتشغيل:"
        print_info "git config --global user.name 'اسمك'"
        print_info "git config --global user.email 'بريدك@example.com'"
    fi
else
    print_error "Git غير مثبت!"
    ERRORS=$((ERRORS + 1))
fi

# فحص package.json
if [ -f "package.json" ]; then
    print_success "ملف package.json موجود"
else
    print_error "ملف package.json غير موجود!"
    print_info "تأكد من وجودك في مجلد المشروع الصحيح"
    ERRORS=$((ERRORS + 1))
fi

# فحص Git repository
if [ -d ".git" ]; then
    print_success "مستودع Git موجود"
    
    # فحص remote origin
    if git remote get-url origin &> /dev/null; then
        ORIGIN_URL=$(git remote get-url origin)
        print_success "Remote origin مُعد: $ORIGIN_URL"
    else
        print_error "Remote origin غير مُعد!"
        print_info "قم بتشغيل: git remote add origin <رابط-المستودع>"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_error "هذا المجلد ليس مستودع Git!"
    print_info "قم بتشغيل: git init"
    ERRORS=$((ERRORS + 1))
fi

# فحص DEPLOY_NOW.sh
if [ -f "DEPLOY_NOW.sh" ]; then
    print_success "ملف DEPLOY_NOW.sh موجود"
    
    # فحص صلاحيات التشغيل
    if [ -x "DEPLOY_NOW.sh" ]; then
        print_success "صلاحيات التشغيل متاحة"
    else
        print_warning "صلاحيات التشغيل غير متاحة"
        print_info "سيتم إضافتها تلقائياً..."
        chmod +x DEPLOY_NOW.sh
        print_success "تم إضافة صلاحيات التشغيل"
    fi
else
    print_error "ملف DEPLOY_NOW.sh غير موجود!"
    print_info "تأكد من وجود السكريبت في مجلد المشروع"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📊 ملخص الفحص:"
echo "──────────────"

if [ $ERRORS -eq 0 ]; then
    print_success "جميع المتطلبات متوفرة! ✨"
    echo ""
    echo "🚀 جاهز للنشر!"
    echo "════════════════"
    
    read -p "هل تريد بدء النشر الآن؟ (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        print_info "بدء تشغيل DEPLOY_NOW.sh..."
        echo "════════════════════════════════"
        
        # تشغيل السكريبت
        ./DEPLOY_NOW.sh
    else
        echo ""
        print_info "يمكنك تشغيل النشر لاحقاً بالأمر:"
        echo "chmod +x DEPLOY_NOW.sh && ./DEPLOY_NOW.sh"
    fi
else
    print_error "يوجد $ERRORS مشاكل يجب حلها قبل النشر"
    echo ""
    print_info "قم بحل المشاكل المذكورة أعلاه ثم أعد تشغيل هذا السكريبت"
    echo ""
    print_info "للمساعدة، راجع: REAL_DEPLOYMENT_GUIDE.md"
fi

echo ""
echo "🎯 للمساعدة:"
echo "─────────────"
echo "• دليل النشر المفصل: REAL_DEPLOYMENT_GUIDE.md"
echo "• Vercel Dashboard: https://vercel.com/dashboard"
echo "• Node.js Download: https://nodejs.org/"
echo ""
