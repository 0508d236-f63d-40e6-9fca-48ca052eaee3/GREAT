interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    on: (event: string, callback: (data: any) => void) => void
    removeAllListeners: (event: string) => void
    isMetaMask?: boolean
  }
}
