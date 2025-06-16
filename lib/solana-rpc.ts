// خدمة الاتصال بـ Solana RPC للبيانات الحقيقية
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

class SolanaRPC {
  private connection: Connection
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 60000 // 1 minute

  constructor() {
    // استخدام عدة RPC endpoints للموثوقية
    const rpcEndpoints = [
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      "https://solana-api.projectserum.com",
      "https://rpc.ankr.com/solana",
    ]

    this.connection = new Connection(rpcEndpoints[0], "confirmed")
  }

  private getFromCache(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getWalletBalance(walletAddress: string): Promise<number> {
    const cacheKey = `balance-${walletAddress}`
    const cached = this.getFromCache(cacheKey)
    if (cached !== null) return cached

    try {
      const publicKey = new PublicKey(walletAddress)
      const balance = await this.connection.getBalance(publicKey)
      const solBalance = balance / LAMPORTS_PER_SOL

      this.setCache(cacheKey, solBalance)
      return solBalance
    } catch (error) {
      console.error(`Error getting wallet balance for ${walletAddress}:`, error)
      return 0
    }
  }

  async getTokenAccountsByOwner(walletAddress: string): Promise<any[]> {
    const cacheKey = `tokens-${walletAddress}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const publicKey = new PublicKey(walletAddress)
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      })

      const tokens = tokenAccounts.value.map((account) => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }))

      this.setCache(cacheKey, tokens)
      return tokens
    } catch (error) {
      console.error(`Error getting token accounts for ${walletAddress}:`, error)
      return []
    }
  }

  async getTransactionHistory(walletAddress: string, limit = 100): Promise<any[]> {
    try {
      const publicKey = new PublicKey(walletAddress)
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit })

      return signatures
    } catch (error) {
      console.error(`Error getting transaction history for ${walletAddress}:`, error)
      return []
    }
  }

  async getTokenMetadata(mintAddress: string): Promise<any> {
    const cacheKey = `metadata-${mintAddress}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const mint = new PublicKey(mintAddress)
      const accountInfo = await this.connection.getAccountInfo(mint)

      if (!accountInfo) return null

      // هنا يمكن إضافة تحليل metadata أكثر تفصيلاً
      const metadata = {
        mint: mintAddress,
        supply: accountInfo.lamports,
        owner: accountInfo.owner.toString(),
      }

      this.setCache(cacheKey, metadata)
      return metadata
    } catch (error) {
      console.error(`Error getting token metadata for ${mintAddress}:`, error)
      return null
    }
  }
}

export const solanaRPC = new SolanaRPC()
