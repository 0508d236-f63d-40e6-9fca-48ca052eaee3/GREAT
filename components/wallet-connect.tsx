"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, AlertCircle, ExternalLink } from "lucide-react"

interface MetaMaskError extends Error {
  code?: number
}

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)

  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMask = () => {
      if (typeof window !== "undefined") {
        setIsMetaMaskInstalled(typeof window.ethereum !== "undefined")
      }
    }

    checkMetaMask()

    // Listen for account changes only if MetaMask exists
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null)
        } else {
          setAccount(accounts[0])
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        }
      }
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
      }
    } catch (err) {
      const error = err as MetaMaskError
      if (error.code === 4001) {
        setError("Connection rejected by user")
      } else {
        setError("Failed to connect to MetaMask")
      }
      console.error("MetaMask connection error:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setError(null)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isMetaMaskInstalled) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MetaMask Required
          </CardTitle>
          <CardDescription>MetaMask extension is required to connect your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please install MetaMask browser extension to continue</AlertDescription>
          </Alert>
          <Button className="w-full" onClick={() => window.open("https://metamask.io/download/", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
        <CardDescription>Connect your MetaMask wallet to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {account ? (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">Connected: {formatAddress(account)}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={disconnectWallet}>
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={connectWallet} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
