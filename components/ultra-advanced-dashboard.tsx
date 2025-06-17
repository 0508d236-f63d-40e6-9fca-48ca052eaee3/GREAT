"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Square,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface UltraToken {
  mint: string
  name: string
  symbol: string
  creator: string
  timestamp: Date
  marketCap: number
  liquidity: number
  pumpScore: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  recommendation: "BUY" | "WATCH" | "AVOID"
  confidenceLevel: number
  detectionMethod: string
}

export default function UltraAdvancedDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [tokens, setTokens] = useState<UltraToken[]>([])
  const [stats, setStats] = useState<any>(null)
  const [performance, setPerformance] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // جلب البيانات المتقدمة
  const fetchAdvancedData = async () => {
    try {
      const [statusRes, tokensRes, statsRes] = await Promise.all([
        fetch("/api/ultra-advanced-monitor?action=status"),
        fetch("/api/ultra-advanced-monitor?action=tokens"),
        fetch("/api/ultra-advanced-monitor?action=advanced-stats"),
      ])

      const statusData = await statusRes.json()
      const tokensData = await tokensRes.json()
      const statsData = await statsRes.json()

      if (statusData.success) {
        setIsMonitoring(statusData.isActive)
        setStats(statusData.stats)
      }

      if (tokensData.success) {
        setTokens(tokensData.data)
      }

      if (statsData.success) {
        setPerformance(statsData.performance)
      }
    } catch (error) {
      console.error("Error fetching advanced data:", error)
    }
  }

  // بدء المراقبة المتقدمة
  const startUltraMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ultra-advanced-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          config: {
            alerts: {
              minCoinsPerMinute: 5,
              maxResponseTime: 3000,
              enableSystemAlerts: true,
              enableHighValueAlerts: true,
            },
          },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setIsMonitoring(true)
        console.log("✅ Ultra Advanced Monitoring Started")
      }
    } catch (error) {
      console.error("Error starting ultra monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // إيقاف المراقبة
  const stopUltraMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ultra-advanced-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      })

      const data = await response.json()
      if (data.success) {
        setIsMonitoring(false)
        console.log("🛑 Ultra Advanced Monitoring Stopped")
      }
    } catch (error) {
      console.error("Error stopping ultra monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // تحديث البيانات كل 3 ثوان
  useEffect(() => {
    fetchAdvancedData()
    const interval = setInterval(fetchAdvancedData, 3000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(2)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-600"
      case "MEDIUM":
        return "text-yellow-600"
      case "HIGH":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "BUY":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "WATCH":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "AVOID":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚡ Ultra Advanced Pump Monitor</h1>
          <p className="text-muted-foreground">1000+ coins/minute • Multi-RPC • ML Analysis • Self-Healing</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"} className="text-lg px-4 py-2">
            <Zap className="w-4 h-4 mr-1" />
            {isMonitoring ? "ULTRA ACTIVE" : "INACTIVE"}
          </Badge>
        </div>
      </div>

      {/* Ultra Controls */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Ultra Advanced Controls
          </CardTitle>
          <CardDescription>
            Advanced monitoring with ML analysis, multi-RPC load balancing, and self-healing capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={startUltraMonitoring}
              disabled={loading || isMonitoring}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Ultra Monitoring
            </Button>

            <Button onClick={stopUltraMonitoring} disabled={loading || !isMonitoring} variant="destructive" size="lg">
              <Square className="w-4 h-4 mr-2" />
              Stop Ultra Monitoring
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Dashboard */}
      {performance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Detection Rate</p>
                  <p className="text-2xl font-bold">{performance.coinsPerMinute}/min</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <Progress value={Math.min(100, performance.coinsPerMinute * 10)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">System Health</p>
                  <p className="text-2xl font-bold">{performance.systemHealth}%</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={performance.systemHealth} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">RPC Health</p>
                  <p className="text-2xl font-bold">{performance.rpcHealth}%</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <Progress value={performance.rpcHealth} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Coins Detected</p>
                <p className="text-3xl font-bold text-green-600">{stats.coinsDetected}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.transactionsProcessed}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageResponseTime?.toFixed(0)}ms</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-3xl font-bold text-orange-600">
                  {((stats.errorsOccurred / Math.max(1, stats.transactionsProcessed)) * 100).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ultra Advanced Tokens Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Ultra Detected Tokens ({tokens.length})
          </CardTitle>
          <CardDescription>Advanced ML analysis with pump scores, risk assessment, and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Pump Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.slice(0, 20).map((token) => (
                    <TableRow key={token.mint}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-muted-foreground">{token.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              token.pumpScore >= 80 ? "default" : token.pumpScore >= 60 ? "secondary" : "outline"
                            }
                            className={
                              token.pumpScore >= 80 ? "bg-green-600" : token.pumpScore >= 60 ? "bg-yellow-600" : ""
                            }
                          >
                            {token.pumpScore}
                          </Badge>
                          <Progress value={token.pumpScore} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRiskColor(token.riskLevel)}>
                          {token.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecommendationIcon(token.recommendation)}
                          <span className="text-sm">{token.recommendation}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{token.confidenceLevel}%</Badge>
                      </TableCell>
                      <TableCell>${formatNumber(token.marketCap)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {token.detectionMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatTime(token.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No Ultra Tokens Detected Yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start ultra monitoring to detect pump.fun tokens with advanced ML analysis
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
