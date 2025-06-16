# 🚀 دليل النشر

## المتطلبات قبل النشر

### 1. التحقق من البناء المحلي:
\`\`\`bash
npm run build
\`\`\`

### 2. اختبار البناء:
\`\`\`bash
npm start
\`\`\`

## خيارات النشر

### 🔷 النشر على Vercel (الأسهل)

1. **ربط المستودع**:
   - انتقل إلى [vercel.com](https://vercel.com)
   - اربط حساب GitHub
   - استورد المشروع

2. **الإعدادات**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `out`

3. **النشر التلقائي**:
   - كل push إلى main سينشر تلقائياً

### 🔷 النشر على Netlify

1. **البناء**:
\`\`\`bash
npm run build
\`\`\`

2. **رفع المجلد**:
   - ارفع مجلد `out/` إلى Netlify
   - أو اربط المستودع

3. **الإعدادات**:
   - Build command: `npm run build`
   - Publish directory: `out`

### 🔷 النشر على GitHub Pages

1. **تفعيل GitHub Pages**:
   - اذهب إلى Settings > Pages
   - اختر source: GitHub Actions

2. **إنشاء workflow**:
\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
\`\`\`

## ✅ قائمة التحقق قبل النشر

- [ ] جميع التبعيات مثبتة
- [ ] البناء يعمل بدون أخطاء
- [ ] الاختبار المحلي ناجح
- [ ] ملفات الإعداد موجودة
- [ ] متغيرات البيئة مضبوطة
- [ ] README محدث
- [ ] .gitignore صحيح

## 🔧 استكشاف الأخطاء

### خطأ في البناء:
\`\`\`bash
# مسح cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
\`\`\`

### مشاكل TypeScript:
\`\`\`bash
# التحقق من الأخطاء
npx tsc --noEmit
\`\`\`

### مشاكل ESLint:
\`\`\`bash
# إصلاح تلقائي
npm run lint -- --fix
