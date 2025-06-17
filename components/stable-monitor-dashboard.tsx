"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Square, RotateCcw, Activity, TrendingUp, Clock, User } from "lucide-react"

interface StablePumpToken {
  mint: string
  name: string
  symbol: string
  description: string
  image: string
  creator: string
  timestamp: Date
  signature: string
  marketCap: number
  liquidity: number
  bondingCurve: string
  virtualSolReserves: number
  virtualTokenReserves: number
  complete: boolean
  isLive: boolean
  detectionMethod: string
}

export default function StableMonitorDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [tokens, setTokens] = useState<StablePumpToken[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // جلب الحالة والبيانات
  const fetchData = async () => {
    try {
      const [statusRes, tokensRes] = await Promise.all([
        fetch("/api/stable-monitor?action=status"),
        fetch("/api/stable-monitor?action=tokens"),
      ])

      const statusData = await statusRes.json()
      const tokensData = await tokensRes.json()

      if (statusData.success) {
        setStats(statusData.stats)
        setIsMonitoring(statusData.stats.isActive)
      }

      if (tokensData.success) {
        setTokens(tokensData.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  // بدء المراقبة
  const startMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stable-monitor?action=start")
      const data = await response.json()

      if (data.success) {
        setIsMonitoring(true)
        console.log("✅ Stable monitoring started")
      }
    } catch (error) {
      console.error("Error starting monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // إيقاف المراقبة
  const stopMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stable-monitor?action=stop")
      const data = await response.json()

      if (data.success) {
        setIsMonitoring(false)
        console.log("🛑 Stable monitoring stopped")
      }
    } catch (error) {
      console.error("Error stopping monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  // مسح البيانات
  const clearTokens = async () => {
    try {
      const response = await fetch("/api/stable-monitor?action=clear")
      const data = await response.json()

      if (data.success) {
        setTokens([])
        console.log("🧹 Tokens cleared")
      }
    } catch (error) {
      console.error("Error clearing tokens:", error)
    }
  }

  // تحديث البيانات كل 5 ثوان
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(2)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔗 Stable Pump Monitor</h1>
          <p className="text-muted-foreground">HTTP Polling - No WebSocket Issues</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            <Activity className="w-4 h-4 mr-1" />
            {isMonitoring ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Monitor Controls</CardTitle>
          <CardDescription>Start/stop the stable pump.fun monitoring system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={startMonitoring}
              disabled={loading || isMonitoring}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Monitoring
            </Button>

            <Button onClick={stopMonitoring} disabled={loading || !isMonitoring} variant="destructive">
              <Square className="w-4 h-4 mr-2" />
              Stop Monitoring
            </Button>

            <Button onClick={clearTokens} disabled={loading} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-2xl font-bold">{stats.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Total Detected</p>
                  <p className="text-2xl font-bold">{stats.totalDetected}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-orange-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Method</p>
                  <p className="text-2xl font-bold">HTTP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Processed</p>
                  <p className="text-2xl font-bold">{stats.monitorStatus?.processedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tokens Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Tokens ({tokens.length})</CardTitle>
          <CardDescription>Latest pump.fun tokens detected via stable monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Liquidity</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.slice(0, 20).map((token) => (
                    <TableRow key={token.mint}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <img
                            src={token.image || "/placeholder.svg"}
                            alt={token.symbol}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-sm text-muted-foreground">{token.mint.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{token.symbol}</Badge>
                      </TableCell>
                      <TableCell>${formatNumber(token.marketCap)}</TableCell>
                      <TableCell>{formatNumber(token.liquidity)} SOL</TableCell>
                      <TableCell>
                        <div className="text-sm">{token.creator.substring(0, 8)}...</div>
                      </TableCell>
                      <TableCell>{formatTime(token.timestamp)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{token.detectionMethod}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tokens detected yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start monitoring to detect new pump.fun tokens</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
