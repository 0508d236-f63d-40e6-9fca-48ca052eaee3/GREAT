#!/bin/bash

echo "🚀 خيارات النشر البديلة"
echo "========================"

echo "الخيار 1: Vercel جديد"
echo "----------------------"
echo "npx vercel --prod --force --name great-crypto-new"
echo ""

echo "الخيار 2: Netlify"
echo "----------------"
echo "npm install -g netlify-cli"
echo "npm run export"
echo "netlify deploy --prod --dir=out"
echo ""

echo "الخيار 3: GitHub Pages"
echo "---------------------"
echo "npm run export"
echo "# ثم رفع مجلد out إلى GitHub Pages"
echo ""

echo "الخيار 4: Railway"
echo "----------------"
echo "npm install -g @railway/cli"
echo "railway login"
echo "railway deploy"
echo ""

echo "اختر الخيار المناسب وشغله!"
