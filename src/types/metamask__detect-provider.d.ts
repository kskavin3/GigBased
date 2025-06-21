declare module '@metamask/detect-provider' {
  const detectEthereumProvider: () => Promise<any>;
  export = detectEthereumProvider;
} 