export const RITUAL_CHAIN_CONFIG = {
  chainId: '0x7BB', // 1979 in hex
  chainName: 'Ritual Chain',
  nativeCurrency: {
    name: 'RITUAL',
    symbol: 'RITUAL',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ritualfoundation.org'],
  blockExplorerUrls: ['https://explorer.ritualfoundation.org'],
};

export const FACTORY_ADDRESS = '0x1df6796388607ceed59f5cbdCaDDafCaD088799b';

export const COLORS = {
  background: '#0a0a0a',
  cardBackground: '#111111',
  border: '#1a2a1a',
  primary: '#22c55e',
  success: '#22c55e',
  warning: '#f59e0b',
  textPrimary: '#ffffff',
  textSecondary: '#6b7280',
  textMuted: '#374151',
};

export const TX_CONFIG = {
  gasLimit: 3000000n,
  gasPrice: 1000000007n,
  type: 0, // Legacy
};
