"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Monitor,
  Server,
  Shield,
  Zap,
  AlertCircle,
  TrendingUp,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  Download,
  RefreshCw,
  GitBranch,
} from "lucide-react"

import { productionMonitor, type ProductionHealth } from "../lib/production-monitor"

export default function ProductionDashboard() {
  const [health, setHealth] = useState<ProductionHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAlerts, setShowAlerts] = useState(false)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    const handleHealthUpdate = (newHealth: ProductionHealth) => {
      setHealth(newHealth)
      setIsLoading(false)
    }

    productionMonitor.addListener(handleHealthUpdate)

    return () => {
      productionMonitor.removeListener(handleHealthUpdate)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "text-green-400"
      case "DEGRADED":
        return "text-yellow-400"
      case "CRITICAL":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "DEGRADED":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "CRITICAL":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      HEALTHY: "bg-green-600 text-white",
      DEGRADED: "bg-yellow-600 text-white",
      CRITICAL: "bg-red-600 text-white",
    }
    return colors[status as keyof typeof colors] || "bg-gray-600 text-white"
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "INFO":
        return "ℹ️"
      case "WARNING":
        return "⚠️"
      case "ERROR":
        return "❌"
      case "CRITICAL":
        return "🚨"
      default:
        return "📝"
    }
  }

  const formatUptime = (uptime: number) => {
    const minutes = Math.floor(uptime / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const downloadReport = () => {
    if (!health) return

    const report = productionMonitor.generateReport()
    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `production-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="glass-card text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-300">Loading production monitoring...</p>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="glass-card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Production Monitor Unavailable</h3>
        <p className="text-gray-400">Unable to load production health data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  health.overall === "HEALTHY"
                    ? "bg-green-500"
                    : health.overall === "DEGRADED"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">🏭 Production Monitor</h1>
                <p className="text-gray-400">Real-time system health monitoring</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold ${getStatusBadge(health.overall)}`}>{health.overall}</div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowAlerts(!showAlerts)} className="btn-secondary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts ({health.alerts.length})
            </button>
            <button onClick={() => setShowReport(!showReport)} className="btn-secondary flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Report
            </button>
            <button onClick={downloadReport} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button onClick={() => productionMonitor.restart()} className="btn-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Restart
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-5 gap-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-blue-400">{formatUptime(health.uptime)}</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-lg font-bold text-green-400">{health.environment}</div>
              <div className="text-sm text-gray-400">{health.deployment.platform}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-purple-400">{health.metrics.totalTokens}</div>
              <div className="text-sm text-gray-400">Total Tokens</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-2xl font-bold text-cyan-400">{health.metrics.updatesPerMinute}</div>
              <div className="text-sm text-gray-400">Updates/min</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {health.metrics.averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-400">Avg Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Health */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Monitor className="w-6 h-6" />
          Component Health
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(health.components).map(([name, component]) => (
            <div
              key={name}
              className={`border rounded-lg p-4 ${
                component.status === "HEALTHY"
                  ? "bg-green-600/10 border-green-500/30"
                  : component.status === "DEGRADED"
                    ? "bg-yellow-600/10 border-yellow-500/30"
                    : "bg-red-600/10 border-red-500/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(component.status)}
                <div>
                  <div className="font-semibold capitalize">{name.replace(/([A-Z])/g, " $1").trim()}</div>
                  <div className={`text-sm font-bold ${getStatusColor(component.status)}`}>{component.status}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-mono">{component.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Count:</span>
                  <span className={`font-mono ${component.errorCount > 0 ? "text-red-400" : "text-green-400"}`}>
                    {component.errorCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Check:</span>
                  <span className="font-mono text-xs">{new Date(component.lastCheck).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">{component.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Server className="w-6 h-6" />
          System Metrics
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-6 h-6 text-blue-400" />
              <span className="font-semibold">CPU Usage</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-2">{health.metrics.cpuUsage.toFixed(1)}%</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${health.metrics.cpuUsage}%` }}></div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <HardDrive className="w-6 h-6 text-purple-400" />
              <span className="font-semibold">Memory Usage</span>
            </div>
            <div className="text-2xl font-bold text-purple-400 mb-2">{health.metrics.memoryUsage.toFixed(1)}%</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  health.metrics.memoryUsage > 85
                    ? "bg-red-500"
                    : health.metrics.memoryUsage > 70
                      ? "bg-yellow-500"
                      : "bg-purple-500"
                }`}
                style={{ width: `${health.metrics.memoryUsage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <span className="font-semibold">Error Rate</span>
            </div>
            <div className="text-2xl font-bold text-orange-400 mb-2">{health.metrics.errorRate.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Errors per component</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Wifi className="w-6 h-6 text-green-400" />
              <span className="font-semibold">Network Status</span>
            </div>
            <div className="text-lg font-bold text-green-400 mb-2">
              {health.components.network.status === "HEALTHY" ? "🟢 Online" : "🔴 Offline"}
            </div>
            <div className="text-sm text-gray-400">Connection stable</div>
          </div>
        </div>
      </div>

      {/* Deployment Info */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <GitBranch className="w-6 h-6" />
          Deployment Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Platform:</span>
              <span className="font-semibold">{health.deployment.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Environment:</span>
              <span className="font-semibold">{health.environment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Region:</span>
              <span className="font-semibold">{health.deployment.region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="font-semibold">{health.version}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Build Time:</span>
              <span className="font-semibold text-sm">{new Date(health.deployment.buildTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Deploy:</span>
              <span className="font-semibold text-sm">{new Date(health.deployment.lastDeploy).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Commit Hash:</span>
              <span className="font-mono text-sm">{health.deployment.commitHash}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Auto Deploy:</span>
              <span
                className={`font-semibold ${health.deployment.autoDeployEnabled ? "text-green-400" : "text-red-400"}`}
              >
                {health.deployment.autoDeployEnabled ? "🟢 Enabled" : "🔴 Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      {showAlerts && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Recent Alerts ({health.alerts.length})
          </h2>

          {health.alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
              <p className="text-gray-400">System is running smoothly</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {health.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    alert.type === "CRITICAL"
                      ? "border-red-500 bg-red-600/10"
                      : alert.type === "ERROR"
                        ? "border-orange-500 bg-orange-600/10"
                        : alert.type === "WARNING"
                          ? "border-yellow-500 bg-yellow-600/10"
                          : "border-blue-500 bg-blue-600/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getAlertIcon(alert.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{alert.component}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            alert.type === "CRITICAL"
                              ? "bg-red-600 text-white"
                              : alert.type === "ERROR"
                                ? "bg-orange-600 text-white"
                                : alert.type === "WARNING"
                                  ? "bg-yellow-600 text-white"
                                  : "bg-blue-600 text-white"
                          }`}
                        >
                          {alert.type}
                        </span>
                      </div>
                      <div className="text-gray-300 mb-2">{alert.message}</div>
                      <div className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Panel */}
      {showReport && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Production Report
          </h2>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="whitespace-pre-wrap text-gray-300">{productionMonitor.generateReport()}</pre>
          </div>
        </div>
      )}

      <style jsx>{`
        .glass-card {
          background: rgba(17, 25, 40, 0.75);
          backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.125);
          border-radius: 12px;
          padding: 24px;
        }

        .btn-secondary {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: rgb(147, 197, 253);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  )
}
