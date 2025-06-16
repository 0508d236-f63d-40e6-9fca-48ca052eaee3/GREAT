# 📦 دليل package.json - شرح شامل

## 🎯 نظرة عامة

هذا ملف `package.json` محسن ومتكامل لمشروع تتبع العملات المشفرة على Solana. يحتوي على جميع التبعيات والسكريبتات المطلوبة لحل مشاكل SWC و Tailwind وضمان نشر ناجح.

---

## 📋 معلومات المشروع

\`\`\`json
{
  "name": "solana-token-tracker",
  "version": "1.0.0",
  "description": "منصة تتبع العملات المشفرة على شبكة Solana",
  "private": true,
  "license": "MIT"
}
\`\`\`

### 🔧 متطلبات البيئة:
- **Node.js**: 18.0.0 أو أحدث
- **npm**: 9.0.0 أو أحدث

---

## 🚀 السكريبتات المتاحة

### 📱 التطوير:
\`\`\`bash
npm run dev          # تشغيل خادم التطوير
npm run build        # بناء للإنتاج
npm run start        # تشغيل الإنتاج
npm run lint         # فحص الكود
npm run type-check   # فحص TypeScript
\`\`\`

### 🧹 التنظيف والإصلاح:
\`\`\`bash
npm run clean        # تنظيف الملفات المؤقتة
npm run reset        # إعادة تعيين كاملة
npm run fix:swc      # إصلاح مشاكل SWC
npm run fix:tailwind # إصلاح مشاكل Tailwind
npm run fix:all      # إصلاح جميع المشاكل
\`\`\`

### 🚀 النشر:
\`\`\`bash
npm run deploy       # نشر شامل (DEPLOY_NOW.sh)
npm run deploy:quick # نشر سريع
npm run deploy:force # نشر قسري مع تنظيف
npm run vercel:deploy # نشر مباشر على Vercel
\`\`\`

### 🔍 الفحص والتحليل:
\`\`\`bash
npm run check:health # فحص صحة البيئة
npm run check:deps   # فحص التبعيات القديمة
npm run test:build   # اختبار البناء
npm run analyze      # تحليل حجم الحزمة
\`\`\`

### 💾 النسخ الاحتياطي:
\`\`\`bash
npm run backup       # إنشاء نسخة احتياطية
npm run restore      # استعادة النسخة الاحتياطية
\`\`\`

---

## 📦 التبعيات الأساسية

### 🎯 الإطار الأساسي:
- **Next.js 14.0.4**: إطار React للإنتاج
- **React 18.2.0**: مكتبة واجهة المستخدم
- **TypeScript 5.3.3**: لغة البرمجة المحسنة

### 🎨 التصميم:
- **Tailwind CSS 3.3.6**: إطار CSS المرن
- **Radix UI**: مكونات واجهة المستخدم
- **Lucide React**: مكتبة الأيقونات

### ⚡ الأداء:
- **SWC Core & Helpers**: مترجم سريع
- **Bundle Analyzer**: تحليل حجم الحزمة

---

## 🔧 إعدادات مهمة

### 🌐 المتصفحات المدعومة:
\`\`\`json
"browserslist": {
  "production": [">0.2%", "not dead", "not op_mini all"],
  "development": ["last 1 chrome version", "last 1 firefox version"]
}
\`\`\`

### 📦 إدارة الحزم:
\`\`\`json
"packageManager": "npm@9.8.1",
"volta": {
  "node": "18.19.0",
  "npm": "9.8.1"
}
\`\`\`

---

## 🚨 حل المشاكل الشائعة

### ❌ مشكلة SWC:
\`\`\`bash
npm run fix:swc
# أو يدوياً:
npm install @swc/core @swc/helpers --save-dev
\`\`\`

### ❌ مشكلة Tailwind:
\`\`\`bash
npm run fix:tailwind
# أو إعادة بناء:
npm run build -- --debug
\`\`\`

### ❌ مشاكل التبعيات:
\`\`\`bash
npm run reset
# أو خطوة بخطوة:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
\`\`\`

### ❌ فشل البناء:
\`\`\`bash
npm run fix:all
# أو:
npm run clean && npm install && npm run build
\`\`\`

---

## 📊 إحصائيات المشروع

### 📦 عدد التبعيات:
- **الأساسية**: ~20 حزمة
- **التطوير**: ~15 حزمة
- **المجموع**: ~35 حزمة

### 💾 الحجم المتوقع:
- **node_modules**: ~200-300 MB
- **البناء النهائي**: ~5-10 MB
- **الصفحة الواحدة**: ~100-200 KB

---

## 🎯 نصائح للاستخدام

### ✅ للتطوير اليومي:
\`\`\`bash
npm run dev          # للتطوير
npm run lint:fix     # لإصلاح الكود
npm run type-check   # للتحقق من الأخطاء
\`\`\`

### ✅ قبل النشر:
\`\`\`bash
npm run test:build   # اختبار البناء
npm run backup       # نسخة احتياطية
npm run deploy       # النشر الشامل
\`\`\`

### ✅ للصيانة:
\`\`\`bash
npm run check:deps   # فحص التحديثات
npm run update:deps  # تحديث التبعيات
npm run analyze      # تحليل الأداء
\`\`\`

---

## 🔗 روابط مفيدة

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **SWC**: https://swc.rs/
- **Vercel**: https://vercel.com/docs

---

## 📞 للمساعدة

إذا واجهت مشاكل مع package.json:

1. **تحقق من الإصدارات**: `npm run check:health`
2. **أعد تثبيت التبعيات**: `npm run reset`
3. **اختبر البناء**: `npm run test:build`
4. **راجع السجلات**: في التيرمينال للأخطاء

**🎯 هذا الملف محسن لضمان نشر ناجح بدون مشاكل!**
