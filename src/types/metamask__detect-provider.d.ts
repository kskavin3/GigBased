declare module '@metamask/detect-provider' {
  const detectEthereumProvider: () => Promise<any>;
  export = detectEthereumProvider;
}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    isMetaMask?: boolean;
    selectedAddress?: string;
    chainId?: string;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  };
} 