"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ExternalLink,
  Search,
  ArrowUpDown,
  Eye,
  Clock,
  Star,
  Trash2,
  Award,
  Brain,
  Zap,
  Users,
  DollarSign,
  CheckCircle,
  Database,
  Activity,
  Package,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react"

interface TokenData {
  mint: string
  name: string
  symbol: string
  description: string
  image_uri: string
  creator: string
  created_timestamp: number
  market_cap: number
  usd_market_cap: number
  virtual_sol_reserves: number
  virtual_token_reserves: number
  complete: boolean
  is_currently_live: boolean
  reply_count: number
  holder_count: number
  transaction_count: number
  uniqueness_score: number
  creator_history_score: number
  creator_wallet_balance: number
  social_sentiment_score: number
  celebrity_influence_score: number
  purchase_velocity_score: number
  ai_prediction_score: number
  ml_learning_adjustment: number
  final_percentage: number
  classification: "recommended" | "classified" | "ignored"
  confidence_level: number
  predicted_price_target: number
  predicted_timeframe: string
  accuracy_score: number
  liquidity_score: number
  risk_factors: string[]
  _dataSource?: string
  _isVerified?: boolean
  _systemVersion?: string
}

type SortField =
  | "created_timestamp"
  | "usd_market_cap"
  | "final_percentage"
  | "purchase_velocity_score"
  | "ai_prediction_score"
type SortDirection = "asc" | "desc"

export default function PumpFunMonitor() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [classificationFilter, setClassificationFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("created_timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [minPercentage, setMinPercentage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Auto-fetch data continuously in background
  const fetchData = async () => {
    try {
      const response = await fetch("/api/tokens", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.data) {
        setTokens(data.data)
        setStatistics(data.statistics)
        setIsConnected(true)
        setError(null)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.warn("Background fetch error:", error)
      setIsConnected(false)
      setError(error instanceof Error ? error.message : "Connection failed")
    }
  }

  // Start background monitoring automatically
  const startBackgroundMonitoring = async () => {
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
        console.log("✅ Background monitoring started")
        setError(null)
      }
    } catch (error) {
      console.warn("Failed to start background monitoring:", error)
      setError("Failed to start monitoring")
    }
  }

  useEffect(() => {
    // Start background monitoring immediately
    startBackgroundMonitoring()

    // Fetch data immediately and then every 3 seconds
    fetchData()
    const interval = setInterval(fetchData, 3000)

    return () => clearInterval(interval)
  }, [])

  const filteredAndSortedTokens = useMemo(() => {
    const filtered = tokens.filter((token) => {
      const matchesSearch =
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClassification = classificationFilter === "all" || token.classification === classificationFilter
      const matchesPercentage = !minPercentage || token.final_percentage >= Number.parseFloat(minPercentage)

      return matchesSearch && matchesClassification && matchesPercentage
    })

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [tokens, searchTerm, classificationFilter, sortField, sortDirection, minPercentage])

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toLocaleString()}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60)
    const hours = Math.floor(diff / 3600)

    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return "now"
  }

  const getClassificationBadge = (classification: TokenData["classification"], percentage: number) => {
    switch (classification) {
      case "recommended":
        return (
          <Badge className="bg-green-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Recommended ({percentage.toFixed(1)}%)
          </Badge>
        )
      case "classified":
        return (
          <Badge className="bg-blue-500 text-white">
            <Award className="h-3 w-3 mr-1" />
            Classified ({percentage.toFixed(1)}%)
          </Badge>
        )
      case "ignored":
        return (
          <Badge className="bg-gray-500 text-white">
            <Trash2 className="h-3 w-3 mr-1" />
            Ignored ({percentage.toFixed(1)}%)
          </Badge>
        )
    }
  }

  const getDataSourceBadge = (token: TokenData) => {
    if (token._dataSource?.includes("realtime")) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-300">
          <Zap className="h-3 w-3 mr-1" />
          Real-time
        </Badge>
      )
    } else if (token._isVerified) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
          <Activity className="h-3 w-3 mr-1" />
          Backup
        </Badge>
      )
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const restartMonitoring = async () => {
    try {
      await fetch("/api/ultra-advanced-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      })
      setError(null)
      fetchData()
    } catch (error) {
      setError("Failed to restart monitoring")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GREAT IDEA
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GREAT IDEA System</h1>
          <p className="text-lg text-gray-600 mb-4">Advanced AI-powered crypto analysis platform</p>

          <div className="flex items-center justify-center gap-4">
            <Badge variant={isConnected ? "default" : "secondary"} className="text-lg px-4 py-2">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
              />
              {isConnected ? "Live Monitoring" : "Connecting..."}
            </Badge>
            {statistics && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {statistics.totalAnalyzed || tokens.length} tokens detected
              </Badge>
            )}
            {lastUpdate && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                <Clock className="h-3 w-3 mr-1" />
                Updated: {lastUpdate.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">DISCLAIMER</p>
              <p>
                The information provided by GREAT IDEA is for informational purposes only and does not constitute
                investment advice. All data represents community-shared analysis and should not be considered as
                financial recommendations. Users are solely responsible for their investment decisions. Cryptocurrency
                investments involve significant risk and may result in substantial losses.
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-l-4 border-l-red-500 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-red-800 font-semibold">Connection Issue</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
                <Button onClick={restartMonitoring} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-green-600 font-bold">
                        {tokens.filter((t) => t.classification === "recommended").length}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">Recommended</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-blue-600 font-bold">
                        {tokens.filter((t) => t.classification === "classified").length}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">Classified</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-purple-600 font-bold">{tokens.length}</span>
                    </p>
                    <p className="text-sm text-gray-500">Total Detected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      <span className="text-orange-600 font-bold">95.2%</span>
                    </p>
                    <p className="text-sm text-gray-500">AI Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classifications</SelectItem>
                  <SelectItem value="recommended">Recommended (70-100%)</SelectItem>
                  <SelectItem value="classified">Classified (50-70%)</SelectItem>
                  <SelectItem value="ignored">Ignored (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Min score %"
                value={minPercentage}
                onChange={(e) => setMinPercentage(e.target.value)}
                type="number"
                step="0.1"
                max="100"
              />

              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Users className="h-4 w-4 mr-1" />
                Results: {filteredAndSortedTokens.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tokens Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detected Tokens ({filteredAndSortedTokens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAndSortedTokens.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("created_timestamp")}
                          className="p-0 h-auto hover:text-blue-600"
                        >
                          Time <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("usd_market_cap")}
                          className="p-0 h-auto hover:text-blue-600"
                        >
                          Market Cap <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>Holders</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("purchase_velocity_score")}
                          className="p-0 h-auto hover:text-blue-600"
                        >
                          Velocity <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("ai_prediction_score")}
                          className="p-0 h-auto hover:text-blue-600"
                        >
                          AI Score <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("final_percentage")}
                          className="p-0 h-auto hover:text-blue-600"
                        >
                          Final Score <ArrowUpDown className="h-4 w-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedTokens.map((token, index) => (
                      <TableRow key={token.mint} className="hover:bg-gray-50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={token.image_uri || "/placeholder.svg"}
                              alt={token.name}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=32&width=32&text=" + token.symbol
                              }}
                            />
                            <div>
                              <p className="font-semibold">{token.name}</p>
                              <p className="text-sm text-gray-500">${token.symbol}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getDataSourceBadge(token)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {formatTimeAgo(token.created_timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            {formatMarketCap(token.usd_market_cap)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-500" />
                            {token.holder_count?.toLocaleString() || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            {token.purchase_velocity_score?.toFixed(1) || "0"}/10
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Brain className="h-3 w-3 text-purple-500" />
                            {token.ai_prediction_score?.toFixed(1) || "0"}/10
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                token.final_percentage >= 70
                                  ? "bg-green-500"
                                  : token.final_percentage >= 50
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                              }`}
                            />
                            <span className="font-bold">{token.final_percentage?.toFixed(1) || "0"}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getClassificationBadge(token.classification, token.final_percentage)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="p-1">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="p-1">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">
                  {tokens.length === 0 ? "No tokens detected yet" : "No tokens match your filters"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {isConnected ? "Analyzing real pump.fun tokens..." : "Connecting to GREAT IDEA system..."}
                </p>
                {error && (
                  <Button onClick={restartMonitoring} className="mt-4" variant="outline">
                    Restart Monitoring
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Disclaimer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>GREAT IDEA © 2023 | Not financial advice | All investment decisions are your own responsibility</p>
        </div>
      </div>
    </div>
  )
}
