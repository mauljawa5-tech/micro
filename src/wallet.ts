/** EIP-1193 browser wallet integration (MetaMask, Rabby, Coinbase Wallet, etc.) */

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
}

declare global {
  interface Window {
    ethereum?: EthereumProvider & {
      providers?: EthereumProvider[]
    }
  }
}

/** Shorten 0x address for UI */
export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

/** Prefer MetaMask if multiple injected providers exist */
export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null
  const eth = window.ethereum
  if (!eth) return null
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    return eth.providers.find((p) => p.isMetaMask) ?? eth.providers[0]
  }
  return eth
}

export function hasWallet(): boolean {
  return getEthereumProvider() !== null
}

export async function requestAccounts(): Promise<string[]> {
  const provider = getEthereumProvider()
  if (!provider) {
    throw new Error('NO_WALLET')
  }
  const accounts = (await provider.request({
    method: 'eth_requestAccounts',
  })) as string[]
  return accounts
}

export async function getAccounts(): Promise<string[]> {
  const provider = getEthereumProvider()
  if (!provider) return []
  try {
    const accounts = (await provider.request({
      method: 'eth_accounts',
    })) as string[]
    return accounts
  } catch {
    return []
  }
}

export async function getChainId(): Promise<string | null> {
  const provider = getEthereumProvider()
  if (!provider) return null
  try {
    return (await provider.request({ method: 'eth_chainId' })) as string
  } catch {
    return null
  }
}

export type WalletErrorCode =
  | 'NO_WALLET'
  | 'USER_REJECTED'
  | 'PENDING'
  | 'UNKNOWN'

export function parseWalletError(err: unknown): { code: WalletErrorCode; message: string } {
  if (err instanceof Error && err.message === 'NO_WALLET') {
    return {
      code: 'NO_WALLET',
      message: 'No wallet found. Install MetaMask or another Web3 wallet.',
    }
  }

  const e = err as { code?: number; message?: string }
  if (e?.code === 4001) {
    return { code: 'USER_REJECTED', message: 'Connection request rejected.' }
  }
  if (e?.code === -32002) {
    return {
      code: 'PENDING',
      message: 'Connection already pending — open your wallet extension.',
    }
  }
  return {
    code: 'UNKNOWN',
    message: e?.message || 'Failed to connect wallet.',
  }
}

/** Subscribe to account / chain changes. Returns cleanup. */
export function subscribeWallet(
  onAccounts: (accounts: string[]) => void,
  onChain?: (chainId: string) => void
): () => void {
  const provider = getEthereumProvider()
  if (!provider?.on) return () => {}

  const handleAccounts = (...args: unknown[]) => {
    onAccounts((args[0] as string[]) ?? [])
  }
  const handleChain = (...args: unknown[]) => {
    onChain?.(String(args[0] ?? ''))
  }

  provider.on('accountsChanged', handleAccounts)
  if (onChain) provider.on('chainChanged', handleChain)

  return () => {
    provider.removeListener?.('accountsChanged', handleAccounts)
    if (onChain) provider.removeListener?.('chainChanged', handleChain)
  }
}

export const METAMASK_DOWNLOAD = 'https://metamask.io/download/'
