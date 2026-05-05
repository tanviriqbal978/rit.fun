/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRitual } from './hooks/useRitual';
import { COLORS } from './constants';
import { Token, Trade } from './types';
import { PriceChart } from './components/PriceChart';

export default function App() {
  const { account, tokens, loading, error, connectWallet, launchToken, trade, fetchTrades } = useRitual();
  const [currentPage, setCurrentPage] = useState<'home' | 'launch' | 'detail' | 'portfolio'>('home');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedToken && currentPage === 'detail') {
        fetchTrades(selectedToken.address).then(setTrades);
    }
  }, [selectedToken, currentPage, fetchTrades]);

  // Detail View Helper
  const renderDetail = () => (
    <div style={{ padding: '20px' }}>
      <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', color: COLORS.textSecondary, cursor: 'pointer', marginBottom: '20px', fontFamily: 'monospace', fontSize: '14px' }}>{"[<- Back To Tokens]"}</button>
      
      {uiError && (
        <div style={{ backgroundColor: '#450a0a', border: '1px solid #ef4444', color: '#ef4444', padding: '15px', marginBottom: '20px', fontSize: '14px' }}>
          Error: {uiError}
          <button onClick={() => setUiError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>[X]</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}`, padding: '24px', boxShadow: 'none' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
               <div style={{ width: '100px', height: '100px', borderRadius: '12px', backgroundColor: '#1a2a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', overflow: 'hidden' }}>
                 <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display='none'; (e.currentTarget.parentNode as HTMLDivElement).innerText = '🐱'; }} />
               </div>
               <div>
                  <h2 style={{ margin: '0 0 10px 0', color: COLORS.primary, fontSize: '28px' }}>{selectedToken?.name} <span style={{ color: COLORS.textSecondary }}>(${selectedToken?.symbol})</span></h2>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted, fontFamily: 'monospace', wordBreak: 'break-all', backgroundColor: '#000', padding: '4px 8px', borderRadius: '4px' }}>
                    CA: {selectedToken?.address}
                  </div>
                  <p style={{ color: COLORS.textSecondary, marginTop: '15px', lineHeight: '1.6' }}>{selectedToken?.description}</p>
               </div>
            </div>
            
            <div style={{ height: '400px', backgroundColor: '#000', border: `1px solid ${COLORS.border}`, position: 'relative' }}>
              <PriceChart data={[]} /> {/* We'd map trades to candlestick data here */}
            </div>
          </div>

          <div style={{ backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}`, padding: '20px' }}>
            <h3 style={{ color: COLORS.primary, marginBottom: '15px' }}>Trade History</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textSecondary }}>
                      <th style={{ padding: '10px' }}>Trader</th>
                      <th style={{ padding: '10px' }}>Type</th>
                      <th style={{ padding: '10px' }}>Amount</th>
                      <th style={{ padding: '10px' }}>Price</th>
                      <th style={{ padding: '10px' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid #1a1a1a` }}>
                        <td style={{ padding: '10px' }}>{t.trader.slice(0,6)}...{t.trader.slice(-4)}</td>
                        <td style={{ padding: '10px', color: t.isBuy ? COLORS.success : '#ef4444' }}>{t.isBuy ? 'BUY' : 'SELL'}</td>
                        <td style={{ padding: '10px' }}>{Number(t.amount).toFixed(2)}</td>
                        <td style={{ padding: '10px' }}>{Number(t.price).toFixed(8)}</td>
                        <td style={{ padding: '10px', color: COLORS.textMuted }}>{new Date(t.timestamp * 1000).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               {trades.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: COLORS.textMuted }}>No trades yet</div>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TradePanel token={selectedToken!} account={account} trade={trade} setError={setUiError} />
          
          <div style={{ backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}`, padding: '20px' }}>
            <h3 style={{ color: COLORS.primary, marginBottom: '15px', fontSize: '14px' }}>[Bonding Curve Progress]</h3>
            <div style={{ backgroundColor: '#000', height: '24px', position: 'relative', border: `1px solid ${COLORS.border}`, borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
               <div style={{ 
                 width: `${Math.min(100, (Number(selectedToken?.marketCap) / 69000) * 100)}%`, 
                 height: '100%', 
                 backgroundColor: COLORS.primary,
                 transition: 'width 0.5s ease-out'
               }} />
               <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', mixBlendMode: 'difference' }}>
                 {((Number(selectedToken?.marketCap) / 69000) * 100).toFixed(2)}% Graduate to DEX
               </div>
            </div>
            <p style={{ fontSize: '11px', color: COLORS.textMuted, margin: 0, lineHeight: '1.4' }}>
              When market cap reaches 69,000 RITUAL, liquidity is added to DEX and the token is "fun".
            </p>
          </div>

          <div style={{ backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}`, padding: '20px' }}>
            <h3 style={{ color: COLORS.primary, marginBottom: '15px', fontSize: '14px' }}>[Token Stats]</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: COLORS.textSecondary }}>Owner:</span>
                  <span>{selectedToken?.creator.slice(0,8)}...</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: COLORS.textSecondary }}>Supply:</span>
                  <span>{selectedToken?.totalSupply}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: COLORS.textSecondary }}>Market Cap:</span>
                  <span>{selectedToken?.marketCap} RITUAL</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  // Home Page View
  const renderHome = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: COLORS.primary }}>Latest Tokens 🐱</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchTokens}
            style={{
              backgroundColor: 'transparent',
              color: COLORS.textSecondary,
              border: `1px solid ${COLORS.border}`,
              padding: '10px',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
          >
            [Refresh]
          </button>
          <button 
            onClick={() => setCurrentPage('launch')}
            style={{
              backgroundColor: COLORS.primary,
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            [Launch Token]
          </button>
        </div>
      </div>
      
      {uiError && (
        <div style={{ backgroundColor: '#450a0a', border: '1px solid #ef4444', color: '#ef4444', padding: '15px', marginBottom: '20px', fontSize: '14px' }}>
          Error: {uiError}
          <button onClick={() => setUiError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>[X]</button>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textSecondary }}>Checking Ritual Chain...</div>}
      {error && <div style={{ padding: '20px', backgroundColor: '#450a0a', border: '1px solid #ef4444', color: '#ef4444', marginBottom: '20px' }}>Error: {error}</div>}

      {!loading && tokens.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 20px', backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>😿</div>
          <h3 style={{ color: COLORS.textSecondary }}>No tokens found on Ritual Chain yet.</h3>
          <p style={{ color: COLORS.textMuted }}>Be the first to launch one!</p>
          <button 
            onClick={() => setCurrentPage('launch')}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: COLORS.primary, border: 'none', fontFamily: 'monospace', cursor: 'pointer' }}
          >
            Launch Token
          </button>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {tokens.map(token => (
          <div 
            key={token.address}
            onClick={() => {
              console.log("Selecting token:", token.address);
              setSelectedToken(token);
              setCurrentPage('detail');
              window.scrollTo(0, 0);
            }}
            style={{
              backgroundColor: COLORS.cardBackground,
              border: `1px solid ${COLORS.border}`,
              padding: '15px',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = COLORS.primary}
            onMouseOut={(e) => e.currentTarget.style.borderColor = COLORS.border}
          >
            <div style={{ width: '60px', height: '60px', backgroundColor: '#1a2a1a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '10px', overflow: 'hidden' }}>
              <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display='none'; (e.currentTarget.parentNode as HTMLDivElement).innerText = '🐱'; }} />
            </div>
            <h3 style={{ margin: '0 0 5px 0', color: COLORS.primary }}>{token.name} (${token.symbol})</h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: COLORS.textSecondary, height: '40px', overflow: 'hidden' }}>
              {token.description}
            </p>
            <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '10px' }}>
              Created by: {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: COLORS.success }}>Price: {Number(token.price).toFixed(8)} RITUAL</span>
              <span style={{ color: COLORS.textSecondary }}>MCap: {Number(token.marketCap).toFixed(2)} RITUAL</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Launch Page View
  const renderLaunch = () => {
    const [name, setName] = useState('');
    const [ticker, setTicker] = useState('');
    const [desc, setDesc] = useState('');
    const [launching, setLaunching] = useState(false);

    const handleLaunch = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setLaunching(true);
        setUiError(null);
        await launchToken(name, ticker, desc);
        setCurrentPage('home');
      } catch (err: any) {
        setUiError(err.message);
      } finally {
        setLaunching(false);
      }
    };

    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}` }}>
        <h2 style={{ color: COLORS.primary, marginBottom: '20px' }}>Launch your token 🚀</h2>
        
        {uiError && (
          <div style={{ backgroundColor: '#2d0606', border: '1px solid #ef4444', color: '#ef4444', padding: '15px', marginBottom: '20px', fontSize: '14px' }}>
            Error: {uiError}
            <button onClick={() => setUiError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>[X]</button>
          </div>
        )}

        {!account ? (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#000', border: `1px solid ${COLORS.border}`, marginBottom: '20px' }}>
            <p style={{ color: COLORS.textSecondary, marginBottom: '15px' }}>Wallet not connected. Connect now to launch.</p>
            <button 
              onClick={connectWallet}
              style={{ padding: '10px 20px', backgroundColor: COLORS.primary, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: COLORS.textSecondary }}>Token Name</label>
              <input 
                value={name} onChange={e => setName(e.target.value)} required
                placeholder="e.g. Ritual Cat"
                style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: `1px solid ${COLORS.border}`, color: '#fff', fontFamily: 'monospace' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: COLORS.textSecondary }}>Ticker</label>
              <input 
                value={ticker} onChange={e => setTicker(e.target.value)} required
                placeholder="e.g. RCAT"
                style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: `1px solid ${COLORS.border}`, color: '#fff', fontFamily: 'monospace' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: COLORS.textSecondary }}>Description</label>
              <textarea 
                value={desc} onChange={e => setDesc(e.target.value)} required
                placeholder="What is this token about?"
                style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: `1px solid ${COLORS.border}`, color: '#fff', fontFamily: 'monospace', minHeight: '100px' }} 
              />
            </div>
            
            <div style={{ backgroundColor: '#1a1a1a', padding: '15px', fontSize: '12px', color: COLORS.textSecondary, borderLeft: `4px solid ${COLORS.primary}` }}>
              <p style={{ margin: 0 }}>Bonding Curve Info: Initial price is low and increases as supply is bought. Once the goal of 69,000 RITUAL is met, liquidity is finalized.</p>
            </div>

            <button 
              type="submit"
              disabled={launching}
              style={{
                backgroundColor: COLORS.primary,
                color: '#000',
                border: 'none',
                padding: '15px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: launching ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                fontSize: '16px'
              }}
            >
              {launching ? 'Launching... (Check MetaMask)' : 'Create Token'}
            </button>
          </form>
        )}
      </div>
    );
  };


  return (
    <div style={{ 
      backgroundColor: COLORS.background, 
      color: COLORS.textPrimary, 
      minHeight: '100vh', 
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{ 
        padding: '20px', 
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div 
          onClick={() => setCurrentPage('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img 
              src="/logo.png" 
              alt="rit.fun" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = '<span style="font-size: 24px">🐱</span>';
                }
              }} 
            />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.primary }}>
            rit.fun
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span onClick={() => setCurrentPage('portfolio')} style={{ cursor: 'pointer', color: currentPage === 'portfolio' ? COLORS.primary : COLORS.textSecondary }}>[Portfolio]</span>
          <button 
            onClick={connectWallet}
            style={{
              backgroundColor: 'transparent',
              border: `1px solid ${COLORS.primary}`,
              color: COLORS.primary,
              padding: '8px 16px',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
          >
            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {currentPage === 'home' && renderHome()}
        {currentPage === 'launch' && renderLaunch()}
        {currentPage === 'detail' && selectedToken && renderDetail()}
        {currentPage === 'portfolio' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ color: COLORS.primary, marginBottom: '20px' }}>Your Portfolio</h2>
            {!account ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.textSecondary }}>Connect wallet to view your holdings.</p>
                <button onClick={connectWallet} style={{ backgroundColor: COLORS.primary, color: '#000', border: 'none', padding: '10px 20px', cursor: 'pointer', fontFamily: 'monospace' }}>Connect Wallet</button>
              </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {tokens.filter(t => t.creator === account).map(token => (
                         <div key={token.address} style={{ backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}`, padding: '15px' }}>
                            <h3 style={{ margin: '0 0 5px 0', color: COLORS.primary }}>{token.name}</h3>
                            <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>Symbol: {token.symbol}</div>
                            <div style={{ color: COLORS.success, marginTop: '10px' }}>Role: Creator</div>
                            <button 
                                onClick={() => { setSelectedToken(token); setCurrentPage('detail'); }}
                                style={{ width: '100%', marginTop: '15px', backgroundColor: 'transparent', border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, padding: '5px', cursor: 'pointer', fontFamily: 'monospace' }}
                            >
                                [View Token]
                            </button>
                         </div>
                    ))}
                    {/* In a real app we'd also check token balances for all tokens here */}
                </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ padding: '20px', borderTop: `1px solid ${COLORS.border}`, textAlign: 'center', fontSize: '12px', color: COLORS.textMuted }}>
        rit.fun - Launched on Ritual Chain Testnet 🟢
      </footer>
    </div>
  );
}

function TradePanel({ token, account, trade, setError }: { token: Token, account: string | null, trade: any, setError: (e: string | null) => void }) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);

  const handleTrade = async () => {
    try {
      setLoading(true);
      setError(null);
      // Rough value calculation for buy (needs contact call in real app)
      const val = (Number(token.price) * Number(amount) * 1.1).toString(); // 10% slippage buffer
      await trade(token.address, amount, tab === 'buy', val);
      // No alert, success is implied or we could add a success state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}`, padding: '20px' }}>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <button 
          onClick={() => setTab('buy')}
          style={{ flex: 1, padding: '10px', backgroundColor: tab === 'buy' ? COLORS.primary : '#1a1a1a', color: tab === 'buy' ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}
        >
          Buy
        </button>
        <button 
          onClick={() => setTab('sell')}
          style={{ flex: 1, padding: '10px', backgroundColor: tab === 'sell' ? '#ef4444' : '#1a1a1a', color: tab === 'sell' ? '#fff' : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}
        >
          Sell
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: COLORS.textSecondary }}>Amount ({token.symbol})</label>
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
          style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: `1px solid ${COLORS.border}`, color: '#fff', fontFamily: 'monospace' }}
        />
        <div style={{ marginTop: '8px', fontSize: '11px', color: COLORS.textMuted }}>
           Estimated {tab === 'buy' ? 'Cost' : 'Return'}: {(Number(amount) * Number(token.price)).toFixed(6)} RITUAL
        </div>
      </div>

      <button 
        onClick={handleTrade}
        disabled={loading || !account}
        style={{
          width: '100%',
          backgroundColor: tab === 'buy' ? COLORS.primary : '#ef4444',
          color: '#fff',
          border: 'none',
          padding: '15px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          cursor: account ? 'pointer' : 'not-allowed'
        }}
      >
        {loading ? 'Processing...' : account ? `${tab === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}` : 'Connect Wallet'}
      </button>

      <div style={{ marginTop: '20px', fontSize: '12px', color: COLORS.textSecondary }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Current Price:</span>
          <span>{Number(token.price).toFixed(8)} RITUAL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Bonding Curve:</span>
          <span style={{ color: COLORS.success }}>{((Number(token.marketCap) / 69000) * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

