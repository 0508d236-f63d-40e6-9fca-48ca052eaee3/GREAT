#!/bin/bash

echo "🔄 إعادة نشر Vercel..."

# تسجيل الدخول إلى Vercel (إذا لم تكن مسجل)
# vercel login

# ربط المشروع
vercel link --yes

# نشر قسري
vercel --prod --force

echo "✅ تم إعادة النشر!"
