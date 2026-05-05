import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { FACTORY_ADDRESS, RITUAL_CHAIN_CONFIG, TX_CONFIG } from '../constants';
import { FACTORY_ABI, TOKEN_ABI } from '../abis';
import { Token, Trade } from '../types';

export function useRitual() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }
    try {
      setLoading(true);
      // Request chain switch/add
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: RITUAL_CHAIN_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [RITUAL_CHAIN_CONFIG],
          });
        } else {
          throw switchError;
        }
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setProvider(browserProvider);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use public RPC if no provider connected
      const rpcProvider = provider || new ethers.JsonRpcProvider(RITUAL_CHAIN_CONFIG.rpcUrls[0]);
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, rpcProvider);
      
      const tokensData = await factory.getAllTokens().catch((e: any) => {
        console.error("Factory getAllTokens failed:", e);
        return [];
      });

      if (!tokensData || tokensData.length === 0) {
        setTokens([]);
        return;
      }

      const mappedTokens: Token[] = await Promise.all(tokensData.map(async (t: any) => {
        try {
          const tokenContract = new ethers.Contract(t.tokenAddress, TOKEN_ABI, rpcProvider);
          const [totalSupply, price] = await Promise.all([
            tokenContract.totalSupply(),
            tokenContract.getBuyPrice(ethers.parseEther("1"))
          ]);
          
          return {
            address: t.tokenAddress,
            name: t.name,
            symbol: t.symbol,
            description: t.description,
            creator: t.creator,
            createdAt: Number(t.createdAt),
            totalSupply: ethers.formatEther(totalSupply),
            price: ethers.formatEther(price),
            marketCap: ethers.formatEther(price * (totalSupply / 10n**18n)) // Simplified Mcap
          };
        } catch (tokenErr) {
          console.error(`Error fetching data for token ${t.tokenAddress}:`, tokenErr);
          return {
            address: t.tokenAddress,
            name: t.name,
            symbol: t.symbol,
            description: t.description,
            creator: t.creator,
            createdAt: Number(t.createdAt),
            totalSupply: '0',
            price: '0',
            marketCap: '0'
          };
        }
      }));
      
      setTokens(mappedTokens.reverse()); // Newest first
    } catch (err: any) {
      console.error("fetchTokens main error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const launchToken = async (name: string, symbol: string, description: string) => {
    if (!provider || !account) throw new Error("Wallet not connected");
    const signer = await provider.getSigner();
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    
    const tx = await factory.createToken(name, symbol, description, {
      ...TX_CONFIG
    });
    return await tx.wait();
  };

  const trade = async (tokenAddress: string, amount: string, isBuy: boolean, value?: string) => {
    if (!provider || !account) throw new Error("Wallet not connected");
    const signer = await provider.getSigner();
    const token = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    
    if (isBuy) {
        const tx = await token.buy(ethers.parseEther(amount), {
            value: ethers.parseEther(value || "0"),
            ...TX_CONFIG
        });
        return await tx.wait();
    } else {
        const tx = await token.sell(ethers.parseEther(amount), {
            ...TX_CONFIG
        });
        return await tx.wait();
    }
  };

  const fetchTrades = useCallback(async (tokenAddress: string) => {
    try {
      const rpcProvider = provider || new ethers.JsonRpcProvider(RITUAL_CHAIN_CONFIG.rpcUrls[0]);
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, rpcProvider);
      
      const filter = tokenContract.filters.Trade();
      const events = await tokenContract.queryFilter(filter, -1000); // Last 1000 blocks
      
      return events.map((e: any) => ({
        trader: e.args.trader,
        amount: ethers.formatEther(e.args.amount),
        price: ethers.formatEther(e.args.price),
        isBuy: e.args.isBuy,
        timestamp: Number(e.args.timestamp),
        hash: e.transactionHash
      }));
    } catch (err) {
      console.error("Error fetching trades:", err);
      return [];
    }
  }, [provider]);

  return {
    account,
    tokens,
    loading,
    error,
    connectWallet,
    fetchTokens,
    launchToken,
    trade,
    fetchTrades,
    provider
  };
}

declare global {
  interface Window {
    ethereum: any;
  }
}
