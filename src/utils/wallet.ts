import detectEthereumProvider from '@metamask/detect-provider'
import { WalletConnection } from '../types'

// Base Chain configuration
export const BASE_CHAIN_ID = 8453
export const BASE_CHAIN_CONFIG = {
  chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
}

export const connectMetaMask = async (): Promise<WalletConnection> => {
  try {
    const provider = await detectEthereumProvider()
    
    if (!provider) {
      throw new Error('MetaMask is not installed')
    }

    // Request account access
    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    })

    if (accounts.length === 0) {
      throw new Error('No accounts found')
    }

    const address = accounts[0]
    const chainId = await (window as any).ethereum.request({
      method: 'eth_chainId',
    })

    return {
      address,
      chainId: parseInt(chainId, 16),
      isConnected: true,
    }
  } catch (error) {
    console.error('Error connecting to MetaMask:', error)
    throw error
  }
}

export const switchToBaseChain = async (): Promise<void> => {
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_CHAIN_CONFIG.chainId }],
    })
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BASE_CHAIN_CONFIG],
        })
      } catch (addError) {
        console.error('Error adding Base Chain to MetaMask:', addError)
        throw addError
      }
    } else {
      throw switchError
    }
  }
}

export const getWalletProvider = (): any => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum
  }
  return null
}

export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const isValidAddress = (address: string): boolean => {
  // Simple address validation - in production you'd use ethers.isAddress
  return /^0x[a-fA-F0-9]{40}$/.test(address)
} 