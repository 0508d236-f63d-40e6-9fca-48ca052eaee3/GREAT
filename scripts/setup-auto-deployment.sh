#!/bin/bash

# 🚀 سكريبت إعداد النشر التلقائي الشامل

echo "🚀 بدء إعداد النشر التلقائي..."

# التحقق من المتطلبات
echo "🔍 فحص المتطلبات..."

# فحص Git
if ! command -v git &> /dev/null; then
    echo "❌ Git غير مثبت. يرجى تثبيت Git أولاً."
    exit 1
fi

# فحص Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً."
    exit 1
fi

# فحص npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير متاح. يرجى تثبيت npm أولاً."
    exit 1
fi

echo "✅ جميع المتطلبات متوفرة"

# إعداد المستودع
echo "📁 إعداد المستودع..."

# التحقق من وجود .git
if [ ! -d ".git" ]; then
    echo "🔧 تهيئة مستودع Git..."
    git init
    git branch -M main
fi

# إضافة .gitignore إذا لم يكن موجوداً
if [ ! -f ".gitignore" ]; then
    echo "📝 إنشاء .gitignore..."
    cat > .gitignore << EOL
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/

# Production
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOL
fi

# إنشاء مجلد GitHub Actions
echo "⚙️ إعداد GitHub Actions..."
mkdir -p .github/workflows

# إنشاء workflow للنشر التلقائي
cat > .github/workflows/auto-deploy.yml << EOL
name: 🚀 Auto Deploy to Vercel

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🔨 Build project
      run: npm run build
      
    - name: 🧪 Run tests
      run: npm test --if-present
      
    - name: 🚀 Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        
    - name: 📊 Deployment Status
      run: |
        echo "✅ النشر مكتمل!"
        echo "🌐 الموقع متاح على: https://\${{ steps.deploy.outputs.preview-url }}"
EOL

# إنشاء ملف vercel.json
echo "☁️ إعداد Vercel..."
cat > vercel.json << EOL
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/\$1"
    },
    {
      "src": "/(.*)",
      "dest": "/\$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_VERCEL_ENV": "production",
    "NEXT_PUBLIC_APP_NAME": "CryptoTracker"
  },
  "github": {
    "enabled": true,
    "autoAlias": true,
    "autoJobCancelation": true
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
EOL

# تحديث package.json
echo "📦 تحديث package.json..."
if [ -f "package.json" ]; then
    # إضافة سكريبتات النشر
    npm pkg set scripts.deploy="vercel --prod"
    npm pkg set scripts.deploy:preview="vercel"
    npm pkg set scripts.build:analyze="ANALYZE=true npm run build"
    
    # إضافة معلومات المستودع
    read -p "🔗 أدخل رابط المستودع (مثال: https://github.com/username/repo): " REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        npm pkg set repository.type="git"
        npm pkg set repository.url="$REPO_URL"
    fi
fi

# إنشاء سكريبت النشر السريع
echo "⚡ إنشاء سكريبت النشر السريع..."
cat > quick-deploy.sh << EOL
#!/bin/bash

echo "🚀 النشر السريع..."

# فحص التغييرات
if [ -n "\$(git status --porcelain)" ]; then
  echo "📝 حفظ التغييرات..."
  git add .
  
  # طلب رسالة commit
  read -p "💬 أدخل رسالة التحديث: " COMMIT_MSG
  if [ -z "\$COMMIT_MSG" ]; then
    COMMIT_MSG="Auto-update: \$(date '+%Y-%m-%d %H:%M:%S')"
  fi
  
  git commit -m "\$COMMIT_MSG"
fi

# رفع التحديثات
echo "📤 رفع التحديثات..."
git push origin main

echo "✅ تم رفع التحديثات!"
echo "⏳ سيتم النشر تلقائياً خلال دقائق..."
echo "🌐 راقب التقدم على: https://vercel.com/dashboard"
EOL

chmod +x quick-deploy.sh

# إنشاء ملف البيئة المثال
echo "🔧 إنشاء ملف البيئة المثال..."
cat > .env.example << EOL
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token_here
VERCEL_TEAM_ID=your_team_id_here
VERCEL_PROJECT_ID=your_project_id_here

# GitHub Configuration
GITHUB_TOKEN=your_github_token_here

# App Configuration
NEXT_PUBLIC_APP_NAME=CryptoTracker
NEXT_PUBLIC_VERCEL_ENV=production
NEXT_PUBLIC_VERSION=1.0.0
EOL

# إنشاء دليل الإعداد
echo "📚 إنشاء دليل الإعداد..."
cat > SETUP_INSTRUCTIONS.md << EOL
# 🚀 دليل إعداد النشر التلقائي

## الخطوات المطلوبة:

### 1. إعداد Vercel:
1. اذهب إلى [vercel.com](https://vercel.com)
2. أنشئ حساب أو سجل دخول
3. اربط حسابك بـ GitHub
4. استورد هذا المشروع

### 2. الحصول على المفاتيح:
1. **Vercel Token**: Settings > Tokens > Create
2. **Team ID**: Settings > General > Team ID
3. **Project ID**: Project Settings > General > Project ID

### 3. إعداد GitHub Secrets:
1. اذهب إلى مستودعك في GitHub
2. Settings > Secrets and variables > Actions
3. أضف المتغيرات التالية:
   - \`VERCEL_TOKEN\`
   - \`VERCEL_ORG_ID\`
   - \`VERCEL_PROJECT_ID\`

### 4. تفعيل النشر التلقائي:
\`\`\`bash
# نسخ ملف البيئة وتعديله
cp .env.example .env.local

# تشغيل النشر السريع
./quick-deploy.sh
\`\`\`

## 🎉 تم الإعداد!
الآن كل push إلى main سيؤدي إلى نشر تلقائي.
EOL

# إنشاء أول commit
echo "📝 إنشاء أول commit..."
git add .

if [ -z "$(git config user.name)" ]; then
    read -p "👤 أدخل اسمك للـ Git: " GIT_NAME
    git config user.name "$GIT_NAME"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "📧 أدخل بريدك الإلكتروني للـ Git: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
fi

git commit -m "🚀 Setup: Auto deployment system configured

- Added GitHub Actions workflow
- Configured Vercel deployment
- Created deployment scripts
- Added environment configuration
- Setup project structure for auto-deployment"

echo ""
echo "🎉 تم إعداد النشر التلقائي بنجاح!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. ارفع المشروع إلى GitHub"
echo "2. اربط المشروع بـ Vercel"
echo "3. أضف المتغيرات المطلوبة"
echo "4. استخدم ./quick-deploy.sh للنشر السريع"
echo ""
echo "📚 راجع SETUP_INSTRUCTIONS.md للتفاصيل الكاملة"
echo ""
echo "🚀 موقعك سيتحدث تلقائياً مع كل push!"
