export interface Token {
  address: string;
  name: string;
  symbol: string;
  description: string;
  creator: string;
  marketCap: string;
  price: string;
  totalSupply: string;
  createdAt: number;
}

export interface Trade {
  trader: string;
  amount: string;
  price: string;
  isBuy: boolean;
  timestamp: number;
  hash: string;
}
