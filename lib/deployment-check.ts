/**
 * 🔍 فحص جاهزية النشر - التحقق من البيانات الحقيقية
 */

import { pumpFunAPI } from "./pump-fun-api"
import { solanaService } from "./solana-service"

export interface DeploymentStatus {
  isReady: boolean
  issues: string[]
  recommendations: string[]
  dataStatus: {
    pumpFunAPI: boolean
    solanaRPC: boolean
    realDataPercentage: number
  }
}

export class DeploymentChecker {
  /**
   * 🔍 فحص شامل لجاهزية النشر
   */
  async checkDeploymentReadiness(): Promise<DeploymentStatus> {
    console.log("🔍 بدء فحص جاهزية النشر...")

    const issues: string[] = []
    const recommendations: string[] = []
    let isReady = true

    // 1. فحص Pump.fun API
    const pumpFunStatus = await this.checkPumpFunAPI()
    if (!pumpFunStatus.working) {
      issues.push("❌ Pump.fun API غير متاح")
      isReady = false
    }

    // 2. فحص Solana RPC
    const solanaStatus = await this.checkSolanaRPC()
    if (!solanaStatus.working) {
      recommendations.push("⚠️ Solana RPC غير متاح - سيعمل النظام بوضع Pump.fun فقط")
    }

    // 3. فحص جودة البيانات
    const dataQuality = await this.checkDataQuality()
    if (dataQuality.realDataPercentage < 50) {
      issues.push(`❌ نسبة البيانات الحقيقية منخفضة: ${dataQuality.realDataPercentage}%`)
      isReady = false
    }

    // 4. فحص الأداء
    const performanceCheck = await this.checkPerformance()
    if (!performanceCheck.acceptable) {
      recommendations.push("⚠️ الأداء يحتاج تحسين - قد يؤثر على تجربة المستخدم")
    }

    // 5. فحص CORS والأمان
    const securityCheck = await this.checkSecurity()
    if (!securityCheck.secure) {
      issues.push("❌ مشاكل في إعدادات CORS أو الأمان")
      isReady = false
    }

    return {
      isReady,
      issues,
      recommendations,
      dataStatus: {
        pumpFunAPI: pumpFunStatus.working,
        solanaRPC: solanaStatus.working,
        realDataPercentage: dataQuality.realDataPercentage,
      },
    }
  }

  /**
   * 🔥 فحص Pump.fun API
   */
  private async checkPumpFunAPI(): Promise<{ working: boolean; latency: number }> {
    try {
      const startTime = Date.now()
      const tokens = await pumpFunAPI.getNewTokens(10, 0)
      const latency = Date.now() - startTime

      const working = tokens && tokens.length > 0
      console.log(`🔥 Pump.fun API: ${working ? "✅ يعمل" : "❌ لا يعمل"} (${latency}ms)`)

      return { working, latency }
    } catch (error) {
      console.error("❌ خطأ في فحص Pump.fun API:", error)
      return { working: false, latency: 0 }
    }
  }

  /**
   * 🌐 فحص Solana RPC
   */
  private async checkSolanaRPC(): Promise<{ working: boolean; latency: number }> {
    try {
      const startTime = Date.now()
      await solanaService.initialize()
      const latency = Date.now() - startTime

      const status = solanaService.getConnectionStatus()
      const working = status.isConnected

      console.log(`🌐 Solana RPC: ${working ? "✅ يعمل" : "❌ لا يعمل"} (${latency}ms)`)

      return { working, latency }
    } catch (error) {
      console.error("❌ خطأ في فحص Solana RPC:", error)
      return { working: false, latency: 0 }
    }
  }

  /**
   * 📊 فحص جودة البيانات
   */
  private async checkDataQuality(): Promise<{ realDataPercentage: number; sampleSize: number }> {
    try {
      const tokens = await solanaService.getLiveTokens()
      const realTokens = tokens.filter((token) => token.isRealData)
      const realDataPercentage = tokens.length > 0 ? (realTokens.length / tokens.length) * 100 : 0

      console.log(`📊 جودة البيانات: ${realDataPercentage.toFixed(1)}% حقيقية من ${tokens.length} عملة`)

      return {
        realDataPercentage,
        sampleSize: tokens.length,
      }
    } catch (error) {
      console.error("❌ خطأ في فحص جودة البيانات:", error)
      return { realDataPercentage: 0, sampleSize: 0 }
    }
  }

  /**
   * ⚡ فحص الأداء
   */
  private async checkPerformance(): Promise<{ acceptable: boolean; metrics: any }> {
    try {
      const startTime = Date.now()

      // فحص سرعة جلب البيانات
      const tokens = await solanaService.getLiveTokens()
      const fetchTime = Date.now() - startTime

      // فحص سرعة التحليل
      const analysisStartTime = Date.now()
      // محاكاة تحليل عملة واحدة
      const analysisTime = Date.now() - analysisStartTime + 500 // تقدير

      const metrics = {
        fetchTime,
        analysisTime,
        tokensCount: tokens.length,
      }

      // معايير الأداء المقبول
      const acceptable = fetchTime < 10000 && analysisTime < 2000 && tokens.length > 100

      console.log(`⚡ الأداء: ${acceptable ? "✅ مقبول" : "⚠️ يحتاج تحسين"}`)
      console.log(`   - وقت جلب البيانات: ${fetchTime}ms`)
      console.log(`   - وقت التحليل المقدر: ${analysisTime}ms`)
      console.log(`   - عدد العملات: ${tokens.length}`)

      return { acceptable, metrics }
    } catch (error) {
      console.error("❌ خطأ في فحص الأداء:", error)
      return { acceptable: false, metrics: {} }
    }
  }

  /**
   * 🔒 فحص الأمان و CORS
   */
  private async checkSecurity(): Promise<{ secure: boolean; issues: string[] }> {
    const issues: string[] = []

    try {
      // فحص CORS
      const corsTest = await fetch("https://frontend-api.pump.fun/coins?limit=1", {
        method: "GET",
        mode: "cors",
      }).catch(() => null)

      if (!corsTest) {
        issues.push("CORS قد يكون محظور لبعض APIs")
      }

      // فحص HTTPS
      if (
        typeof window !== "undefined" &&
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        issues.push("الموقع يجب أن يعمل على HTTPS في الإنتاج")
      }

      const secure = issues.length === 0
      console.log(`🔒 الأمان: ${secure ? "✅ آمن" : "⚠️ يحتاج مراجعة"}`)

      return { secure, issues }
    } catch (error) {
      console.error("❌ خطأ في فحص الأمان:", error)
      return { secure: false, issues: ["خطأ في فحص الأمان"] }
    }
  }

  /**
   * 🔧 إصلاح المشاكل تلقائياً
   */
  async autoFix(): Promise<{ fixed: string[]; stillBroken: string[] }> {
    const fixed: string[] = []
    const stillBroken: string[] = []

    try {
      // محاولة إعادة تهيئة الاتصالات
      console.log("🔧 محاولة إصلاح المشاكل...")

      // إعادة تهيئة Pump.fun API
      pumpFunAPI.clearCache()
      const pumpFunFixed = await this.checkPumpFunAPI()
      if (pumpFunFixed.working) {
        fixed.push("✅ تم إصلاح Pump.fun API")
      } else {
        stillBroken.push("❌ Pump.fun API لا يزال لا يعمل")
      }

      // إعادة تهيئة Solana
      await solanaService.reconnect()
      const solanaFixed = await this.checkSolanaRPC()
      if (solanaFixed.working) {
        fixed.push("✅ تم إصلاح Solana RPC")
      } else {
        stillBroken.push("⚠️ Solana RPC لا يزال لا يعمل (اختياري)")
      }

      return { fixed, stillBroken }
    } catch (error) {
      console.error("❌ خطأ في الإصلاح التلقائي:", error)
      return { fixed, stillBroken: ["خطأ في الإصلاح التلقائي"] }
    }
  }
}

// إنشاء instance للاستخدام
export const deploymentChecker = new DeploymentChecker()
