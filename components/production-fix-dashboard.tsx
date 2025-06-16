"use client"

import { useState, useEffect } from "react"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Wrench,
  Bug,
  Globe,
  Code,
  Database,
  Wifi,
  Download,
  Play,
  AlertCircle,
  Info,
  Zap,
} from "lucide-react"

import { productionFixService, type ProductionDiagnostic, type ProductionIssue } from "../lib/production-fix-service"

export default function ProductionFixDashboard() {
  const [diagnostic, setDiagnostic] = useState<ProductionDiagnostic | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")

  useEffect(() => {
    const handleDiagnosticUpdate = (newDiagnostic: ProductionDiagnostic) => {
      setDiagnostic(newDiagnostic)
      setIsRunning(false)
    }

    productionFixService.addListener(handleDiagnosticUpdate)

    // تشغيل التشخيص تلقائياً
    runDiagnostic()

    return () => {
      productionFixService.removeListener(handleDiagnosticUpdate)
    }
  }, [])

  const runDiagnostic = async () => {
    setIsRunning(true)
    try {
      await productionFixService.runProductionDiagnostic()
    } catch (error) {
      console.error("❌ خطأ في التشخيص:", error)
      setIsRunning(false)
    }
  }

  const getIssueIcon = (issue: ProductionIssue) => {
    if (!issue.detected) return <CheckCircle className="w-5 h-5 text-green-400" />

    switch (issue.type) {
      case "CRITICAL":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "ERROR":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />
      case "WARNING":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ENVIRONMENT":
        return <Globe className="w-5 h-5" />
      case "JAVASCRIPT":
        return <Code className="w-5 h-5" />
      case "CORS":
        return <Wifi className="w-5 h-5" />
      case "API":
        return <Database className="w-5 h-5" />
      case "NETWORK":
        return <Wifi className="w-5 h-5" />
      case "DATA":
        return <Database className="w-5 h-5" />
      default:
        return <Bug className="w-5 h-5" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
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

  const getHealthBadge = (health: string) => {
    const colors = {
      HEALTHY: "bg-green-600 text-white",
      DEGRADED: "bg-yellow-600 text-white",
      CRITICAL: "bg-red-600 text-white",
    }
    return colors[health as keyof typeof colors] || "bg-gray-600 text-white"
  }

  const downloadReport = () => {
    if (!diagnostic) return

    const report = `
🔧 PRODUCTION FIX REPORT
========================

🌍 Environment: ${diagnostic.environment}
🏥 System Health: ${diagnostic.systemHealth}
⏰ Diagnostic Time: ${new Date(diagnostic.timestamp).toLocaleString()}

📊 ISSUES SUMMARY:
  Total Issues: ${diagnostic.issues.length}
  Critical: ${diagnostic.issues.filter((i) => i.type === "CRITICAL" && i.detected).length}
  Errors: ${diagnostic.issues.filter((i) => i.type === "ERROR" && i.detected).length}
  Warnings: ${diagnostic.issues.filter((i) => i.type === "WARNING" && i.detected).length}

🔍 DETECTED ISSUES:
${diagnostic.issues
  .filter((i) => i.detected)
  .map(
    (issue) => `
  ${issue.type === "CRITICAL" ? "🚨" : issue.type === "ERROR" ? "❌" : "⚠️"} ${issue.title}
  Category: ${issue.category}
  Description: ${issue.description}
  Solution: ${issue.solution}
  Auto-fix Available: ${issue.autoFixAvailable ? "Yes" : "No"}
`,
  )
  .join("")}

🔧 AUTO-FIXES APPLIED:
${diagnostic.autoFixesApplied.map((fix) => `  ✅ ${fix}`).join("\n")}

💡 RECOMMENDATIONS:
${diagnostic.recommendations.map((rec) => `  • ${rec}`).join("\n")}

⚖️ ENVIRONMENT DIFFERENCES:
${diagnostic.differences
  .map(
    (diff) => `
  ${diff.key}: ${diff.preview} → ${diff.production}
  Impact: ${diff.impact}
  Recommendation: ${diff.recommendation}
`,
  )
  .join("")}

📝 Report Generated: ${new Date().toLocaleString()}
    `

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `production-fix-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredIssues = diagnostic?.issues.filter((issue) => {
    if (selectedCategory === "ALL") return true
    if (selectedCategory === "DETECTED") return issue.detected
    return issue.category === selectedCategory
  })

  if (isRunning) {
    return (
      <div className="glass-card text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-300">Running production diagnostic...</p>
        <p className="text-sm text-gray-400 mt-2">Checking for issues and applying fixes...</p>
      </div>
    )
  }

  if (!diagnostic) {
    return (
      <div className="glass-card text-center py-12">
        <Bug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Production Diagnostic</h3>
        <p className="text-gray-400 mb-6">Click to run diagnostic and fix production issues</p>
        <button onClick={runDiagnostic} className="btn-secondary flex items-center gap-2 mx-auto">
          <Play className="w-4 h-4" />
          Run Diagnostic
        </button>
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
                  diagnostic.systemHealth === "HEALTHY"
                    ? "bg-green-500"
                    : diagnostic.systemHealth === "DEGRADED"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              >
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">🔧 Production Fix Center</h1>
                <p className="text-gray-400">Diagnose and fix production issues automatically</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold ${getHealthBadge(diagnostic.systemHealth)}`}>
              {diagnostic.systemHealth}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowDetails(!showDetails)} className="btn-secondary flex items-center gap-2">
              <Info className="w-4 h-4" />
              {showDetails ? "Hide" : "Show"} Details
            </button>
            <button onClick={downloadReport} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button onClick={runDiagnostic} className="btn-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Re-run Diagnostic
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-red-400">
                {diagnostic.issues.filter((i) => i.type === "CRITICAL" && i.detected).length}
              </div>
              <div className="text-sm text-gray-400">Critical Issues</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {diagnostic.issues.filter((i) => i.type === "ERROR" && i.detected).length}
              </div>
              <div className="text-sm text-gray-400">Errors</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {diagnostic.issues.filter((i) => i.type === "WARNING" && i.detected).length}
              </div>
              <div className="text-sm text-gray-400">Warnings</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-green-400">{diagnostic.autoFixesApplied.length}</div>
              <div className="text-sm text-gray-400">Auto-fixes Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-fixes Applied */}
      {diagnostic.autoFixesApplied.length > 0 && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-400" />
            Auto-fixes Applied
          </h2>
          <div className="space-y-2">
            {diagnostic.autoFixesApplied.map((fix, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-green-600/10 border border-green-500/30 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">{fix}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Info className="w-6 h-6 text-blue-400" />
          Recommendations
        </h2>
        <div className="space-y-2">
          {diagnostic.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <span className="text-blue-300">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6 text-orange-400" />
            Issues Found ({filteredIssues?.length || 0})
          </h2>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="ALL">All Issues</option>
            <option value="DETECTED">Detected Only</option>
            <option value="ENVIRONMENT">Environment</option>
            <option value="JAVASCRIPT">JavaScript</option>
            <option value="CORS">CORS</option>
            <option value="API">API</option>
            <option value="NETWORK">Network</option>
            <option value="DATA">Data</option>
          </select>
        </div>

        {filteredIssues && filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
            <p className="text-gray-400">All checks passed successfully</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues?.map((issue) => (
              <div
                key={issue.id}
                className={`border-l-4 p-4 rounded-r-lg ${
                  !issue.detected
                    ? "border-green-500 bg-green-600/10"
                    : issue.type === "CRITICAL"
                      ? "border-red-500 bg-red-600/10"
                      : issue.type === "ERROR"
                        ? "border-orange-500 bg-orange-600/10"
                        : "border-yellow-500 bg-yellow-600/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {getIssueIcon(issue)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{issue.title}</span>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(issue.category)}
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">{issue.category}</span>
                      </div>
                      {issue.autoFixAvailable && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Auto-fix Available</span>
                      )}
                    </div>
                    <div className="text-gray-300 mb-2">{issue.description}</div>
                    {showDetails && (
                      <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded">
                        <strong>Solution:</strong> {issue.solution}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Environment Differences */}
      {diagnostic.differences.length > 0 && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-400" />
            Environment Differences
          </h2>
          <div className="space-y-4">
            {diagnostic.differences.map((diff, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded-r-lg ${
                  diff.impact === "HIGH"
                    ? "border-red-500 bg-red-600/10"
                    : diff.impact === "MEDIUM"
                      ? "border-yellow-500 bg-yellow-600/10"
                      : "border-blue-500 bg-blue-600/10"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold">{diff.key}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      diff.impact === "HIGH"
                        ? "bg-red-600 text-white"
                        : diff.impact === "MEDIUM"
                          ? "bg-yellow-600 text-white"
                          : "bg-blue-600 text-white"
                    }`}
                  >
                    {diff.impact} Impact
                  </span>
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  Preview: <span className="font-mono">{String(diff.preview)}</span> → Production:{" "}
                  <span className="font-mono">{String(diff.production)}</span>
                </div>
                <div className="text-sm text-gray-400">{diff.recommendation}</div>
              </div>
            ))}
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
