import { ethers } from 'ethers'
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
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    // Create ethers provider
    const provider = new ethers.BrowserProvider(window.ethereum)
    
    // Request account access
    await provider.send('eth_requestAccounts', [])
    
    // Get the signer
    const signer = await provider.getSigner()
    
    // Get the address
    const address = await signer.getAddress()
    
    // Get network information
    const network = await provider.getNetwork()

    return {
      address,
      chainId: Number(network.chainId),
      isConnected: true,
    }
  } catch (error) {
    console.error('Error connecting to MetaMask:', error)
    throw error
  }
}

export const switchToBaseChain = async (): Promise<void> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    
    await provider.send('wallet_switchEthereumChain', [
      { chainId: BASE_CHAIN_CONFIG.chainId }
    ])
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum!)
        await provider.send('wallet_addEthereumChain', [BASE_CHAIN_CONFIG])
      } catch (addError) {
        console.error('Error adding Base Chain to MetaMask:', addError)
        throw addError
      }
    } else {
      throw switchError
    }
  }
}

export const getWalletProvider = (): ethers.BrowserProvider | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  return null
}

export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address)
}

export const getBalance = async (address: string): Promise<string> => {
  try {
    const provider = getWalletProvider()
    if (!provider) {
      throw new Error('No wallet provider available')
    }
    
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error('Error getting balance:', error)
    throw error
  }
}

export const getCurrentNetwork = async (): Promise<{ name: string; chainId: number }> => {
  try {
    const provider = getWalletProvider()
    if (!provider) {
      throw new Error('No wallet provider available')
    }
    
    const network = await provider.getNetwork()
    return {
      name: network.name,
      chainId: Number(network.chainId)
    }
  } catch (error) {
    console.error('Error getting network:', error)
    throw error
  }
} 