"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Square, Activity, Zap, Target, TrendingUp } from "lucide-react"
import type { AutonomousPumpToken } from "@/lib/autonomous-pump-monitor"

interface AutonomousStats {
  isMonitoring: boolean
  totalDetected: number
  connectionsCount: number
  subscriptionsCount: number
  processedSignatures: number
  averageDetectionLatency: number
}

export default function AutonomousMonitorDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [tokens, setTokens] = useState<AutonomousPumpToken[]>([])
  const [stats, setStats] = useState<AutonomousStats | null>(null)
  const [loading, setLoading] = useState(false)

  // جلب البيانات كل 3 ثوان
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMonitoring) {
        fetchTokens()
        fetchStats()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const startMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/autonomous-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      })

      const data = await response.json()
      if (data.success) {
        setIsMonitoring(true)
        console.log("🤖 Autonomous monitoring started!")
      } else {
        console.error("Failed to start monitoring:", data.message)
      }
    } catch (error) {
      console.error("Error starting monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  const stopMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/autonomous-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      })

      const data = await response.json()
      if (data.success) {
        setIsMonitoring(false)
        setTokens([])
        setStats(null)
        console.log("🛑 Autonomous monitoring stopped")
      }
    } catch (error) {
      console.error("Error stopping monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTokens = async () => {
    try {
      const response = await fetch("/api/autonomous-monitor?action=tokens")
      const data = await response.json()
      if (data.success) {
        setTokens(data.data)
      }
    } catch (error) {
      console.warn("Error fetching tokens:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/autonomous-monitor?action=stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.warn("Error fetching stats:", error)
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "strong_buy":
        return "bg-green-500"
      case "buy":
        return "bg-blue-500"
      case "hold":
        return "bg-yellow-500"
      case "avoid":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-green-500" />
            Autonomous Pump Monitor
          </h1>
          <p className="text-muted-foreground mt-2">🤖 100% Automatic pump.fun detection - NO API KEYS REQUIRED</p>
        </div>

        <div className="flex gap-2">
          {!isMonitoring ? (
            <Button onClick={startMonitoring} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start Autonomous Monitoring
            </Button>
          ) : (
            <Button onClick={stopMonitoring} disabled={loading} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.isMonitoring ? (
                  <span className="text-green-600">ACTIVE</span>
                ) : (
                  <span className="text-red-600">STOPPED</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Autonomous monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Detected</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDetected}</div>
              <p className="text-xs text-muted-foreground">Automatically detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.connectionsCount}</div>
              <p className="text-xs text-muted-foreground">FREE RPC endpoints</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageDetectionLatency}ms</div>
              <p className="text-xs text-muted-foreground">Detection speed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="tokens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tokens">Detected Tokens</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autonomously Detected Tokens</CardTitle>
              <CardDescription>All pump.fun tokens detected automatically without API keys</CardDescription>
            </CardHeader>
            <CardContent>
              {tokens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isMonitoring ? "Scanning for new tokens..." : "Start monitoring to detect tokens"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Market Cap</TableHead>
                        <TableHead>Analysis Score</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Recommendation</TableHead>
                        <TableHead>Detection</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens.slice(0, 50).map((token) => (
                        <TableRow key={token.mint}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img
                                src={token.image_uri || "/placeholder.svg"}
                                alt={token.symbol}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder.svg?height=32&width=32&text=" + token.symbol.substring(0, 2)
                                }}
                              />
                              <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-sm text-muted-foreground">{token.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono">{token.creator.substring(0, 8)}...</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">${token.usd_market_cap.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-lg">{token.auto_analysis_score}</div>
                              <div className="text-sm text-muted-foreground">/100</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskColor(token.risk_assessment)}>
                              {token.risk_assessment.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRecommendationColor(token.overall_recommendation)}>
                              {token.overall_recommendation.replace("_", " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{token.detection_latency}ms</div>
                              <div className="text-muted-foreground">{token.detection_method}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Detection Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Solana Logs Monitoring</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Monitoring</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Scanning</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Block Monitoring</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Liquidity Analysis</span>
                    <span className="text-sm text-muted-foreground">Automatic</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Name Quality Check</span>
                    <span className="text-sm text-muted-foreground">Automatic</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timing Analysis</span>
                    <span className="text-sm text-muted-foreground">Automatic</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creator History</span>
                    <span className="text-sm text-muted-foreground">Automatic</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autonomous Monitor Settings</CardTitle>
              <CardDescription>
                This monitor works completely automatically without any configuration needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ No API Keys Required</h4>
                  <p className="text-sm text-green-700">
                    This system uses FREE Solana RPC endpoints and doesn't require any API keys or external services.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">🤖 Fully Autonomous</h4>
                  <p className="text-sm text-blue-700">
                    The system automatically detects all pump.fun contracts using multiple detection methods.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">⚡ Real-time Detection</h4>
                  <p className="text-sm text-purple-700">
                    Tokens are detected within milliseconds of being created on pump.fun.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
