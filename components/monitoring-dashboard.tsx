"use client"

import { useState, useEffect } from "react"
import { Clock, Users, Award, Bell, CheckCircle, AlertTriangle, Activity, Zap, Target } from "lucide-react"

import {
  enhancedMonitoringService,
  type EnhancedMonitoredToken,
  type DetailedMonitoringStats,
  type QualificationNotification,
} from "../lib/enhanced-monitoring-service"

interface MonitoringDashboardProps {
  onTokenSelect?: (token: EnhancedMonitoredToken) => void
}

export default function MonitoringDashboard({ onTokenSelect }: MonitoringDashboardProps) {
  const [monitoringTokens, setMonitoringTokens] = useState<EnhancedMonitoredToken[]>([])
  const [stats, setStats] = useState<DetailedMonitoringStats>({
    totalProcessed: 0,
    currentlyMonitoring: 0,
    qualified: 0,
    rejected: 0,
    expired: 0,
    recommendedCount: 0,
    classifiedCount: 0,
    ignoredCount: 0,
    successRate: 0,
    averageAnalysisTime: 0,
    averageMonitoringTime: 60,
    monitoringDuration: 60,
    maxConcurrentAnalysis: 5,
    tokensAddedToday: 0,
    tokensQualifiedToday: 0,
    systemUptime: 0,
  })
  const [notifications, setNotifications] = useState<QualificationNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // تحديث البيانات
    const updateData = () => {
      setMonitoringTokens(enhancedMonitoringService.getMonitoringTokens())
      setStats(enhancedMonitoringService.getDetailedStats())
      setNotifications(enhancedMonitoringService.getNotifications())
    }

    // تحديث فوري
    updateData()

    // تحديث دوري
    const interval = setInterval(updateData, 5000)

    // مستمع للإشعارات الجديدة
    const handleNewNotification = (notification: QualificationNotification) => {
      setNotifications((prev) => [notification, ...prev])
    }

    enhancedMonitoringService.addNotificationListener(handleNewNotification)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (60 * 1000))
    const hours = Math.floor(diff / (60 * 60 * 1000))

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "monitoring":
        return "text-blue-400"
      case "analyzing":
        return "text-yellow-400"
      case "qualified":
        return "text-green-400"
      case "rejected":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "monitoring":
        return "👁️"
      case "analyzing":
        return "🧠"
      case "qualified":
        return "✅"
      case "rejected":
        return "❌"
      default:
        return "⏳"
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* إحصائيات النظام المحسنة */}
      <div className="glass-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Enhanced Monitoring System
        </h3>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {/* معدل النجاح */}
          <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-400">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Qualification rate</div>
          </div>

          {/* قيد المراقبة */}
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-blue-400">Monitoring</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.currentlyMonitoring}</div>
            <div className="text-xs text-gray-400">Active tokens</div>
          </div>

          {/* مؤهلة اليوم */}
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-yellow-400">Today</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.tokensQualifiedToday}</div>
            <div className="text-xs text-gray-400">Qualified today</div>
          </div>

          {/* وقت التشغيل */}
          <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-purple-400">Uptime</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.systemUptime.toFixed(1)}h</div>
            <div className="text-xs text-gray-400">System uptime</div>
          </div>
        </div>

        {/* شريط التقدم الإجمالي */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall System Performance</span>
            <span className="text-sm text-gray-400">{stats.successRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
              style={{ width: `${stats.successRate}%` }}
            ></div>
          </div>
        </div>

        {/* إحصائيات مفصلة */}
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Processed:</span>
              <span className="text-white font-semibold">{stats.totalProcessed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Qualified:</span>
              <span className="text-green-400 font-semibold">{stats.qualified}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rejected:</span>
              <span className="text-red-400 font-semibold">{stats.rejected}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Recommended:</span>
              <span className="text-green-400 font-semibold">{stats.recommendedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Classified:</span>
              <span className="text-yellow-400 font-semibold">{stats.classifiedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Analysis:</span>
              <span className="text-blue-400 font-semibold">{stats.averageAnalysisTime.toFixed(1)}m</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Added Today:</span>
              <span className="text-purple-400 font-semibold">{stats.tokensAddedToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monitoring Duration:</span>
              <span className="text-blue-400 font-semibold">{stats.monitoringDuration}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Concurrent:</span>
              <span className="text-cyan-400 font-semibold">{stats.maxConcurrentAnalysis}</span>
            </div>
          </div>
        </div>
      </div>

      {/* الإشعارات */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            Qualification Notifications
            {unreadNotifications > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadNotifications}</span>
            )}
          </h3>
          <button onClick={() => setShowNotifications(!showNotifications)} className="btn-secondary text-sm">
            {showNotifications ? "Hide" : "Show"} Notifications
          </button>
        </div>

        {showNotifications && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No notifications yet</div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? "bg-gray-800/50 border-gray-600" : "bg-blue-600/20 border-blue-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {notification.recommendation === "Recommended" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="font-semibold">{notification.tokenSymbol}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          notification.recommendation === "Recommended"
                            ? "bg-green-600 text-white"
                            : "bg-yellow-500 text-black"
                        }`}
                      >
                        {notification.recommendation}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{formatTimeAgo(notification.timestamp)}</div>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Score: {notification.score.toFixed(1)}% • {notification.tokenMint.slice(0, 8)}...
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* العملات قيد المراقبة */}
      <div className="glass-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Tokens Under Monitoring
          <span className="text-sm bg-blue-600 px-2 py-1 rounded">{monitoringTokens.length} Active</span>
        </h3>

        {monitoringTokens.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tokens currently under monitoring</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monitoringTokens.slice(0, 10).map((token) => (
              <div
                key={token.mint}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-600 hover:border-blue-500/50 transition-all cursor-pointer"
                onClick={() => onTokenSelect?.(token)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{token.logo}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{token.symbol}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(token.monitoringStatus)}`}>
                          {getStatusIcon(token.monitoringStatus)} {token.monitoringStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatTime(token.timeRemaining)}</div>
                    <div className="text-xs text-gray-400">remaining</div>
                  </div>
                </div>

                {/* شريط التقدم */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Monitoring Progress</span>
                    <span className="text-xs font-semibold">{token.monitoringProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        token.monitoringStatus === "analyzing"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-400 animate-pulse"
                          : "bg-gradient-to-r from-blue-500 to-cyan-400"
                      }`}
                      style={{ width: `${token.monitoringProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* معلومات إضافية */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white font-semibold ml-1">
                      ${token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Market Cap:</span>
                    <span className="text-white font-semibold ml-1">
                      $
                      {token.marketCap >= 1000 ? (token.marketCap / 1000).toFixed(1) + "K" : token.marketCap.toFixed(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Analysis:</span>
                    <span className="text-white font-semibold ml-1">
                      {token.analysisAttempts > 0 ? `${token.analysisAttempts} attempts` : "Pending"}
                    </span>
                  </div>
                </div>

                {/* تحليل مكتمل */}
                {token.finalAnalysis && (
                  <div className="mt-3 p-2 bg-gray-700/50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Analysis Complete:</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            token.finalAnalysis.recommendation === "Recommended"
                              ? "bg-green-600 text-white"
                              : token.finalAnalysis.recommendation === "Classified"
                                ? "bg-yellow-500 text-black"
                                : "bg-red-600 text-white"
                          }`}
                        >
                          {token.finalAnalysis.recommendation}
                        </span>
                        <span className="text-sm font-bold">{token.finalAnalysis.overallScore.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
