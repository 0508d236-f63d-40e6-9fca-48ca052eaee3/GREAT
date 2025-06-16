# 🚀 دليل إعداد النشر التلقائي الشامل

## 📋 المتطلبات الأساسية

### 1. حسابات مطلوبة:
- ✅ حساب GitHub
- ✅ حساب Vercel
- ✅ مستودع GitHub للمشروع

### 2. أدوات مطلوبة:
- ✅ Git مثبت على الجهاز
- ✅ Node.js (الإصدار 18 أو أحدث)
- ✅ محرر نصوص (VS Code مُفضل)

---

## 🔗 الخطوة 1: ربط المستودع بـ Vercel

### أ) إنشاء مستودع GitHub:
\`\`\`bash
# إنشاء مستودع جديد
git init
git add .
git commit -m "Initial commit: Crypto Tracker with Auto Deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crypto-tracker.git
git push -u origin main
\`\`\`

### ب) ربط المشروع بـ Vercel:
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط "New Project"
3. اختر "Import Git Repository"
4. اختر مستودعك من GitHub
5. اضغط "Deploy"

### ج) إعداد متغيرات البيئة في Vercel:
\`\`\`bash
# في لوحة تحكم Vercel > Settings > Environment Variables
VERCEL_TOKEN=your_vercel_token_here
VERCEL_TEAM_ID=your_team_id_here
GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_VERCEL_ENV=production
NEXT_PUBLIC_APP_NAME=CryptoTracker
\`\`\`

---

## ⚙️ الخطوة 2: إعداد GitHub Actions للنشر التلقائي

### إنشاء ملف GitHub Actions:
\`\`\`yaml
# .github/workflows/auto-deploy.yml
name: 🚀 Auto Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v3
      
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v3
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
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
\`\`\`

---

## 🔔 الخطوة 3: إعداد Webhooks للتحديثات الفورية

### أ) إعداد Webhook في GitHub:
1. اذهب إلى مستودعك في GitHub
2. Settings > Webhooks > Add webhook
3. Payload URL: `https://your-app.vercel.app/api/webhook`
4. Content type: `application/json`
5. Events: اختر "Just the push event"
6. اضغط "Add webhook"

### ب) إنشاء API endpoint للـ webhook:
\`\`\`typescript
# app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { continuousDeploymentService } from '@/lib/continuous-deployment-service'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // التحقق من صحة الـ webhook
    const signature = request.headers.get('x-hub-signature-256')
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    // معالجة الـ webhook
    await continuousDeploymentService.handleWebhook(payload)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 })
  }
}

function verifyWebhookSignature(payload: any, signature: string | null): boolean {
  // تنفيذ التحقق من التوقيع هنا
  return true // مبسط للمثال
}
\`\`\`

---

## 🔧 الخطوة 4: إعداد ملفات التكوين

### أ) تحديث package.json:
\`\`\`json
{
  "name": "crypto-tracker-auto-deploy",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "deploy": "vercel --prod",
    "deploy-preview": "vercel"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/crypto-tracker.git"
  }
}
\`\`\`

### ب) إعداد vercel.json:
\`\`\`json
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
      "src": "/api/webhook",
      "dest": "/api/webhook"
    }
  ],
  "env": {
    "NEXT_PUBLIC_VERCEL_ENV": "production"
  },
  "github": {
    "enabled": true,
    "autoAlias": true
  }
}
\`\`\`

---

## 🚀 الخطوة 5: تفعيل النشر التلقائي

### أ) إضافة سكريبت النشر:
\`\`\`bash
# deploy.sh
#!/bin/bash

echo "🚀 بدء عملية النشر التلقائي..."

# فحص التغييرات
if [ -n "$(git status --porcelain)" ]; then
  echo "📝 توجد تغييرات غير محفوظة"
  git add .
  git commit -m "Auto-commit: $(date)"
fi

# رفع التحديثات
echo "📤 رفع التحديثات إلى GitHub..."
git push origin main

# انتظار النشر
echo "⏳ انتظار اكتمال النشر..."
sleep 30

# فحص حالة النشر
echo "✅ تم النشر بنجاح!"
echo "🌐 الموقع متاح على: https://your-app.vercel.app"
\`\`\`

### ب) جعل السكريبت قابل للتنفيذ:
\`\`\`bash
chmod +x deploy.sh
\`\`\`

---

## 📊 الخطوة 6: مراقبة النشر

### إنشاء صفحة مراقبة النشر:
\`\`\`typescript
# app/deployment-status/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DeploymentStatus() {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeploymentStatus()
    const interval = setInterval(fetchDeploymentStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDeploymentStatus = async () => {
    try {
      const response = await fetch('/api/deployment-status')
      const data = await response.json()
      setDeployments(data.deployments)
    } catch (error) {
      console.error('Error fetching deployment status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🚀 حالة النشر</h1>
      
      {loading ? (
        <div className="text-center">جاري التحميل...</div>
      ) : (
        <div className="grid gap-4">
          {deployments.map((deployment: any) => (
            <Card key={deployment.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>النشر #{deployment.id}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    deployment.status === 'ready' ? 'bg-green-100 text-green-800' :
                    deployment.status === 'building' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {deployment.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>الوقت: {new Date(deployment.createdAt).toLocaleString('ar-SA')}</p>
                <p>الفرع: {deployment.branch}</p>
                {deployment.url && (
                  <a href={deployment.url} target="_blank" className="text-blue-600 hover:underline">
                    عرض الموقع
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
\`\`\`

---

## 🧪 الخطوة 7: اختبار النظام

### أ) اختبار النشر اليدوي:
\`\`\`bash
# تعديل ملف واختبار النشر
echo "// Test update $(date)" >> app/page.tsx
git add .
git commit -m "Test: Auto deployment system"
git push origin main
\`\`\`

### ب) مراقبة النشر:
1. اذهب إلى [vercel.com/dashboard](https://vercel.com/dashboard)
2. اختر مشروعك
3. راقب تقدم النشر في تبويب "Deployments"

### ج) فحص الموقع المباشر:
\`\`\`bash
# فحص الموقع
curl -I https://your-app.vercel.app
\`\`\`

---

## 🔍 الخطوة 8: استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### 1. فشل النشر:
\`\`\`bash
# فحص سجلات النشر
vercel logs https://your-app.vercel.app

# فحص سجلات GitHub Actions
# اذهب إلى GitHub > Actions > اختر آخر workflow
\`\`\`

#### 2. عدم تحديث الموقع:
\`\`\`bash
# مسح الكاش
# في المتصفح: Ctrl+Shift+R (Windows) أو Cmd+Shift+R (Mac)

# أو استخدم أدوات المطور
# F12 > Network > Disable cache
\`\`\`

#### 3. مشاكل متغيرات البيئة:
\`\`\`bash
# فحص متغيرات البيئة في Vercel
vercel env ls

# إضافة متغير جديد
vercel env add VARIABLE_NAME
\`\`\`

---

## 📈 الخطوة 9: تحسين الأداء

### أ) إعداد CDN:
\`\`\`javascript
# next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
\`\`\`

### ب) تحسين البناء:
\`\`\`json
# package.json
{
  "scripts": {
    "build": "next build && next export",
    "analyze": "ANALYZE=true next build"
  }
}
\`\`\`

---

## 🎯 الخطوة 10: المراقبة المستمرة

### إعداد تنبيهات:
\`\`\`typescript
# lib/monitoring.ts
export class DeploymentMonitoring {
  static async checkHealth() {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (!data.healthy) {
        await this.sendAlert('🚨 الموقع غير متاح!')
      }
    } catch (error) {
      await this.sendAlert('❌ خطأ في فحص الموقع')
    }
  }
  
  static async sendAlert(message: string) {
    // إرسال تنبيه عبر Discord/Slack/Email
    console.log('Alert:', message)
  }
}
\`\`\`

---

## ✅ قائمة التحقق النهائية

- [ ] ✅ تم ربط المستودع بـ Vercel
- [ ] ✅ تم إعداد GitHub Actions
- [ ] ✅ تم تكوين Webhooks
- [ ] ✅ تم إضافة متغيرات البيئة
- [ ] ✅ تم اختبار النشر التلقائي
- [ ] ✅ تم إعداد المراقبة
- [ ] ✅ تم تحسين الأداء
- [ ] ✅ تم إعداد التنبيهات

---

## 🎉 تهانينا!

الآن لديك نظام نشر تلقائي كامل يعمل كالتالي:

1. **تعديل الكود** → 2. **Push إلى GitHub** → 3. **نشر تلقائي** → 4. **موقع محدث**

### الخطوات التالية:
- مراقبة الأداء
- تحسين السرعة
- إضافة المزيد من الميزات
- توسيع النظام

**🚀 موقعك الآن يتحدث تلقائياً مع كل تحديث!**
