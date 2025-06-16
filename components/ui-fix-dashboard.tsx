"use client"

import { useState, useEffect } from "react"
import {
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  Code,
  Wifi,
  Database,
  Activity,
  Download,
  RotateCcw,
  Play,
  AlertCircle,
  Gauge,
} from "lucide-react"

import { uiFixService, type UIState, type UIIssue, type UIFixResult } from "../lib/ui-fix-service"

export default function UIFixDashboard() {
  const [uiState, setUIState] = useState<UIState | null>(null)
  const [issues, setIssues] = useState<UIIssue[]>([])
  const [isFixing, setIsFixing] = useState(false)
  const [fixResult, setFixResult] = useState<UIFixResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const handleUIUpdate = (state: UIState, detectedIssues: UIIssue[]) => {
      setUIState(state)
      setIssues(detectedIssues)
    }

    uiFixService.addListener(handleUIUpdate)

    return () => {
      uiFixService.removeListener(handleUIUpdate)
    }
  }, [])

  const applyFixes = async () => {
    setIsFixing(true)
    setFixResult(null)

    try {
      const result = await uiFixService.applyUIFixes()
      setFixResult(result)
    } catch (error) {
      console.error("❌ خطأ في تطبيق الإصلاحات:", error)
    } finally {
      setIsFixing(false)
    }
  }

  const forceRefresh = async () => {
    setIsFixing(true)
    try {
      await uiFixService.forceFullRefresh()
    } catch (error) {
      console.error("❌ خطأ في التحديث الكامل:", error)
    } finally {
      setIsFixing(false)
    }
  }

  const getIssueIcon = (issue: UIIssue) => {
    switch (issue.type) {
      case "CRITICAL":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "ERROR":
        return <AlertTriangle className="w-5 h-5 text-orange-400" />
      case "WARNING":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <CheckCircle className="w-5 h-5 text-blue-400" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "RENDERING":
        return <Eye className="w-4 h-4" />
      case "DATA":
        return <Database className="w-4 h-4" />
      case "JAVASCRIPT":
        return <Code className="w-4 h-4" />
      case "NETWORK":
        return <Wifi className="w-4 h-4" />
      case "STATE":
        return <Activity className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getStatusColor = (hasData: boolean, isLoading: boolean) => {
    if (isLoading) return "text-yellow-400"
    if (hasData) return "text-green-400"
    return "text-red-400"
  }

  const getStatusIcon = (hasData: boolean, isLoading: boolean) => {
    if (isLoading) return "🟡"
    if (hasData) return "🟢"
    return "🔴"
  }

  const downloadReport = () => {
    if (!uiState || !issues) return

    const report = `
🎨 UI FIX REPORT
================

⏰ Report Time: ${new Date().toLocaleString()}

📊 UI STATE:
  Has Data: ${uiState.hasData ? "✅ Yes" : "❌ No"}
  Data Count: ${uiState.dataCount}
  Is Loading: ${uiState.isLoading ? "🟡 Yes" : "✅ No"}
  Last Update: ${uiState.lastUpdate || "Never"}

🔧 COMPONENTS MOUNTED (${uiState.componentsMounted.length}):
${uiState.componentsMounted.map((comp) => `  ✅ ${comp}`).join("\n")}

🚀 SERVICES RUNNING (${uiState.servicesRunning.length}):
${uiState.servicesRunning.map((service) => `  ✅ ${service}`).join("\n")}

🐛 JAVASCRIPT ERRORS (${uiState.jsErrors.length}):
${uiState.jsErrors.map((error) => `  ❌ ${error}`).join("\n")}

🌐 NETWORK ERRORS (${uiState.networkErrors.length}):
${uiState.networkErrors.map((error) => `  ❌ ${error}`).join("\n")}

🎨 RENDERING ERRORS (${uiState.renderingErrors.length}):
${uiState.renderingErrors.map((error) => `  ❌ ${error}`).join("\n")}

🔍 DETECTED ISSUES (${issues.filter((i) => i.detected).length}):
${issues
  .filter((i) => i.detected)
  .map(
    (issue) => `
  ${issue.type === "CRITICAL" ? "🚨" : issue.type === "ERROR" ? "❌" : "⚠️"} ${issue.title}
  Category: ${issue.category}
  Description: ${issue.description}
  Solution: ${issue.solution}
  Auto-fix: ${issue.autoFixAvailable ? "Available" : "Manual"}
`,
  )
  .join("")}

${
  fixResult
    ? `
🔧 APPLIED FIXES:
${fixResult.appliedFixes.map((fix) => `  ✅ ${fix}`).join("\n")}

📝 Fix Result: ${fixResult.success ? "✅ Success" : "❌ Failed"}
💬 Message: ${fixResult.message}
`
    : ""
}

📝 Report Generated: ${new Date().toLocaleString()}
    `

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ui-fix-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!uiState) {
    return (
      <div className="glass-card text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-300">Initializing UI monitoring...</p>
        <p className="text-sm text-gray-400 mt-2">Checking interface state and data loading...</p>
      </div>
    )
  }

  const criticalIssues = issues.filter((i) => i.type === "CRITICAL" && i.detected)
  const errorIssues = issues.filter((i) => i.type === "ERROR" && i.detected)
  const warningIssues = issues.filter((i) => i.type === "WARNING" && i.detected)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  uiState.hasData && !uiState.isLoading
                    ? "bg-green-500"
                    : uiState.isLoading
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              >
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">🎨 UI Fix Center</h1>
                <p className="text-gray-400">Interface diagnostics and automatic fixes</p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-bold ${
                uiState.hasData && !uiState.isLoading
                  ? "bg-green-600 text-white"
                  : uiState.isLoading
                    ? "bg-yellow-600 text-white"
                    : "bg-red-600 text-white"
              }`}
            >
              {getStatusIcon(uiState.hasData, uiState.isLoading)}{" "}
              {uiState.isLoading ? "LOADING" : uiState.hasData ? "WORKING" : "BROKEN"}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowDetails(!showDetails)} className="btn-secondary flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {showDetails ? "Hide" : "Show"} Details
            </button>
            <button onClick={downloadReport} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={applyFixes}
              disabled={isFixing}
              className="btn-secondary flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-300"
            >
              <Zap className={`w-4 h-4 ${isFixing ? "animate-pulse" : ""}`} />
              {isFixing ? "Fixing..." : "Apply Fixes"}
            </button>
            <button
              onClick={forceRefresh}
              disabled={isFixing}
              className="btn-secondary flex items-center gap-2 bg-orange-600/20 border-orange-500/30 text-orange-300"
            >
              <RotateCcw className={`w-4 h-4 ${isFixing ? "animate-spin" : ""}`} />
              Force Refresh
            </button>
          </div>
        </div>

        {/* UI State Summary */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-blue-400">{uiState.dataCount}</div>
              <div className="text-sm text-gray-400">Data Items</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-green-400">{uiState.componentsMounted.length}</div>
              <div className="text-sm text-gray-400">Components</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Play className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-purple-400">{uiState.servicesRunning.length}</div>
              <div className="text-sm text-gray-400">Services</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-red-400">{issues.filter((i) => i.detected).length}</div>
              <div className="text-sm text-gray-400">Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fix Result */}
      {fixResult && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-400" />
            Fix Results
          </h2>
          <div
            className={`p-4 rounded-lg border-l-4 ${
              fixResult.success ? "border-green-500 bg-green-600/10" : "border-red-500 bg-red-600/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {fixResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <span className="font-semibold text-lg">{fixResult.message}</span>
            </div>

            {fixResult.appliedFixes.length > 0 && (
              <div className="mb-3">
                <h3 className="font-semibold mb-2">Applied Fixes:</h3>
                <ul className="space-y-1">
                  {fixResult.appliedFixes.map((fix, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-300">{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fixResult.remainingIssues.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Remaining Issues: {fixResult.remainingIssues.length}</h3>
                <p className="text-sm text-gray-400">Some issues require manual intervention</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Issues */}
      <div className="glass-card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          Current Issues ({issues.filter((i) => i.detected).length})
        </h2>

        {issues.filter((i) => i.detected).length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Issues Detected</h3>
            <p className="text-gray-400">UI is working properly</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Critical Issues */}
            {criticalIssues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-3">🚨 Critical Issues</h3>
                <div className="space-y-3">
                  {criticalIssues.map((issue) => (
                    <div key={issue.id} className="border-l-4 border-red-500 bg-red-600/10 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">{issue.title}</span>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(issue.category)}
                              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                {issue.category}
                              </span>
                            </div>
                            {issue.autoFixAvailable && (
                              <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Auto-fix</span>
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
              </div>
            )}

            {/* Error Issues */}
            {errorIssues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-3">❌ Errors</h3>
                <div className="space-y-3">
                  {errorIssues.map((issue) => (
                    <div key={issue.id} className="border-l-4 border-orange-500 bg-orange-600/10 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">{issue.title}</span>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(issue.category)}
                              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                {issue.category}
                              </span>
                            </div>
                            {issue.autoFixAvailable && (
                              <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Auto-fix</span>
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
              </div>
            )}

            {/* Warning Issues */}
            {warningIssues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Warnings</h3>
                <div className="space-y-3">
                  {warningIssues.map((issue) => (
                    <div key={issue.id} className="border-l-4 border-yellow-500 bg-yellow-600/10 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">{issue.title}</span>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(issue.category)}
                              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                {issue.category}
                              </span>
                            </div>
                            {issue.autoFixAvailable && (
                              <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Auto-fix</span>
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed State */}
      {showDetails && (
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-blue-400" />
            Detailed UI State
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Components */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400">
                Mounted Components ({uiState.componentsMounted.length})
              </h3>
              {uiState.componentsMounted.length === 0 ? (
                <p className="text-red-400">❌ No components detected</p>
              ) : (
                <div className="space-y-2">
                  {uiState.componentsMounted.map((component, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{component}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-400">
                Running Services ({uiState.servicesRunning.length})
              </h3>
              {uiState.servicesRunning.length === 0 ? (
                <p className="text-red-400">❌ No services running</p>
              ) : (
                <div className="space-y-2">
                  {uiState.servicesRunning.map((service, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Errors */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-400">JavaScript Errors ({uiState.jsErrors.length})</h3>
              {uiState.jsErrors.length === 0 ? (
                <p className="text-green-400">✅ No JavaScript errors</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uiState.jsErrors.map((error, index) => (
                    <div key={index} className="text-sm text-red-300 bg-red-600/10 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Network Errors */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Network Errors ({uiState.networkErrors.length})
              </h3>
              {uiState.networkErrors.length === 0 ? (
                <p className="text-green-400">✅ No network errors</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uiState.networkErrors.map((error, index) => (
                    <div key={index} className="text-sm text-orange-300 bg-orange-600/10 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
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

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
