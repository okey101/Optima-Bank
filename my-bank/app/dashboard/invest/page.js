"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, Settings, LogOut, Bell, 
  Menu, X, FileText, HelpCircle, Landmark, ShieldAlert, Gift, TrendingUp, 
  Globe, Download, Send, Search, PieChart, TrendingDown, DollarSign, Activity, CheckCircle, Loader2, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- SHARED SIDEBAR COMPONENT ---
const SidebarLink = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

// --- STATIC BACKUP DATA (In case API fails) ---
const BACKUP_CRYPTO = [
    { id: 'BTC', name: 'Bitcoin', type: 'Crypto', basePrice: 64230.50, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
    { id: 'ETH', name: 'Ethereum', type: 'Crypto', basePrice: 3450.10, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
    { id: 'SOL', name: 'Solana', type: 'Crypto', basePrice: 145.20, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
    { id: 'USDT', name: 'Tether', type: 'Crypto', basePrice: 1.00, image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png' },
];

const BASE_STOCKS = [
    { id: 'AAPL', name: 'Apple Inc.', type: 'Stock', basePrice: 185.92 },
    { id: 'TSLA', name: 'Tesla, Inc.', type: 'Stock', basePrice: 245.40 },
    { id: 'NVDA', name: 'NVIDIA Corp', type: 'Stock', basePrice: 550.20 },
    { id: 'SPY', name: 'S&P 500 ETF', type: 'ETF', basePrice: 475.60 },
];

export default function InvestmentPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState('PENDING');

  // Investment Data
  const [marketData, setMarketData] = useState([]);
  const [userHoldings, setUserHoldings] = useState({});
  const [portfolio, setPortfolio] = useState({ total: 0, cash: 0, invested: 0, growth: 0 });
  
  // Trading State
  const [selectedAsset, setSelectedAsset] = useState(null); 
  const [tradeAction, setTradeAction] = useState('BUY'); 
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);

  // Refs to access latest state in intervals
  const userHoldingsRef = useRef({});
  const userBalanceRef = useRef(0);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
        userBalanceRef.current = currentUser.balance || 0;
        setKycStatus(currentUser.kycStatus || 'UNVERIFIED');
        
        // 1. Fetch User Holdings
        await fetchUserData(currentUser.email);
        
        // 2. Initial Data Load
        await refreshMarketData();
        
        setLoading(false);
    };
    init();

    // 3. Live Ticker (Updates every 10 seconds)
    const interval = setInterval(refreshMarketData, 10000);
    return () => clearInterval(interval);
  }, [router]);

  // --- 1. FETCH USER DATA ---
  const fetchUserData = async (email) => {
      try {
          const res = await fetch('/api/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
          });
          
          if (res.ok) {
              const txs = await res.json();
              const holdings = { BTC: 0, ETH: 0, USDT: 0, SOL: 0, AAPL: 0, TSLA: 0, NVDA: 0, SPY: 0 };
              
              txs.forEach(tx => {
                  if (tx.status === 'APPROVED') {
                      Object.keys(holdings).forEach(key => {
                          if (tx.method?.includes(key)) {
                              if (tx.type === 'DEPOSIT') holdings[key] += tx.amount;
                              // Assume price at purchase time approx 1 unit for demo if not stored
                              // Ideally you store "units" in DB. For demo, we use a rough estimator or just amount.
                              // Let's assume tx.amount IS the units for simplicity in this display logic
                              if (tx.method.includes('BOUGHT')) holdings[key] += (tx.amount / 100); 
                              if (tx.method.includes('SOLD')) holdings[key] -= (tx.amount / 100);
                          }
                      });
                  }
              });
              setUserHoldings(holdings);
              userHoldingsRef.current = holdings; // Update ref for interval
          }
      } catch (e) { console.error("Error fetching user data", e); }
  };

  // --- 2. ROBUST MARKET DATA ENGINE ---
  const refreshMarketData = async () => {
      let activeAssets = [];

      // A. TRY REAL CRYPTO DATA
      try {
          const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,solana,ripple&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h');
          if (res.ok) {
              const cryptoData = await res.json();
              activeAssets = cryptoData.map(coin => ({
                  id: coin.symbol.toUpperCase(),
                  name: coin.name,
                  type: 'Crypto',
                  price: coin.current_price,
                  change: coin.price_change_percentage_24h,
                  trend: coin.price_change_percentage_24h >= 0 ? 'up' : 'down',
                  image: coin.image
              }));
          } else {
              throw new Error("API Limit");
          }
      } catch (e) { 
          // B. FALLBACK CRYPTO DATA (If API Fails)
          // console.warn("Using Backup Crypto Data");
          const simulatedCrypto = BACKUP_CRYPTO.map(coin => {
              const volatility = (Math.random() * 2) - 1; // +/- 1%
              return {
                  ...coin,
                  price: coin.basePrice * (1 + (volatility/100)),
                  change: volatility,
                  trend: volatility >= 0 ? 'up' : 'down'
              };
          });
          activeAssets = [...simulatedCrypto];
      }

      // C. SIMULATED STOCK DATA (Always added)
      const simulatedStocks = BASE_STOCKS.map(stock => {
          const volatility = (Math.random() * 1.5) - 0.75; 
          const newPrice = stock.basePrice * (1 + (volatility / 100));
          return {
              ...stock,
              price: newPrice,
              change: volatility,
              trend: volatility >= 0 ? 'up' : 'down',
              image: null 
          };
      });

      const finalData = [...activeAssets, ...simulatedStocks];
      setMarketData(finalData);
      
      // Calculate Portfolio using Refs to ensure we have latest user data inside interval
      calculatePortfolio(finalData);
  };

  // --- 3. CALCULATE PORTFOLIO ---
  const calculatePortfolio = (marketPrices) => {
      let investedValue = 0;
      const currentHoldings = userHoldingsRef.current;
      const cash = userBalanceRef.current;

      marketPrices.forEach(asset => {
          const amountOwned = currentHoldings[asset.id] || 0;
          investedValue += amountOwned * asset.price;
      });

      setPortfolio({
          total: cash + investedValue,
          cash: cash,
          invested: investedValue,
          growth: marketPrices[0]?.change || 0 
      });
  };

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };

  // --- MOCK TRADE HANDLER ---
  const handleTrade = async () => {
      setIsTrading(true);
      setTimeout(() => {
          setIsTrading(false);
          setTradeSuccess(true);
          setTimeout(() => {
              setTradeSuccess(false);
              setSelectedAsset(null);
              setTradeAmount('');
              // In real app, re-fetch user balance here
          }, 2000);
      }, 1500);
  };

  if (loading || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="h-screen w-full bg-slate-50 font-sans flex text-slate-900 overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shrink-0`}>
        <div className="h-40 flex items-center justify-center px-4 border-b border-slate-100 shrink-0 bg-slate-50/30">
             <div className="relative w-full h-32"><Image src="/logo.png" alt="Logo" fill className="object-contain" priority /></div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-slate-400"><X size={24}/></button>
        </div>
        
        <div className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">{user.firstName[0]}</div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
            </div>
            {kycStatus !== 'VERIFIED' && (
                <Link href="/dashboard/kyc" className="mt-4 flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition">
                    <ShieldAlert size={14} /> {kycStatus === 'PENDING' ? 'Verification Pending' : 'Verify Identity'}
                </Link>
            )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
                    <SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" />
                    <SidebarLink href="/dashboard/cards" icon={CreditCard} label="My Cards" />
                    <SidebarLink href="/dashboard/transfer" icon={Send} label="Transfer Money" />
                    <SidebarLink href="/dashboard/deposit" icon={Download} label="Deposit Funds" />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/transfer" icon={Globe} label="International Wire" />
                    <SidebarLink href="/dashboard/loans" icon={Landmark} label="Loan Services" />
                    <SidebarLink href="/dashboard/grants" icon={Gift} label="Grants & Aid" />
                    <SidebarLink href="/dashboard/invest" icon={TrendingUp} label="Investments" active={true} />
                    <SidebarLink href="/dashboard/tax" icon={FileText} label="IRS Tax Refund" />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/kyc" icon={ShieldAlert} label="Verification Center" />
                    <SidebarLink href="/dashboard/settings" icon={Settings} label="Settings" />
                    <SidebarLink href="/dashboard/support" icon={HelpCircle} label="Help & Support" />
                </div>
            </div>
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition">
                <LogOut size={18} /> <span className="text-sm">Log Out</span>
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Menu size={24} /></button>
                <h1 className="text-lg md:text-xl font-bold text-slate-900">Markets</h1>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={refreshMarketData} className="p-2 text-slate-400 hover:text-blue-600 transition" title="Refresh">
                    <RefreshCw size={18} />
                </button>
                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white">{user.firstName[0]}</div>
            </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* 1. PORTFOLIO SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Value */}
                    <div className="md:col-span-2 bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium mb-1">Total Assets</p>
                                    <h2 className="text-4xl font-bold">${portfolio.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${portfolio.growth >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {portfolio.growth >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {portfolio.growth.toFixed(2)}%
                                </div>
                            </div>
                            
                            <div className="mt-8 flex gap-4">
                                <div className="flex-1 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/5">
                                    <p className="text-xs text-slate-400 mb-1">Investments</p>
                                    <p className="font-bold text-lg">${portfolio.invested.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                </div>
                                <div className="flex-1 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/5">
                                    <p className="text-xs text-slate-400 mb-1">Cash Balance</p>
                                    <p className="font-bold text-lg">${portfolio.cash.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="w-28 h-28 rounded-full border-[6px] border-slate-100 border-t-indigo-500 border-r-blue-500 mb-4 flex items-center justify-center relative">
                            <Activity size={32} className="text-indigo-500"/>
                        </div>
                        <h3 className="font-bold text-slate-900">Portfolio Mix</h3>
                        <div className="flex gap-4 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Cash</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Assets</span>
                        </div>
                    </div>
                </div>

                {/* 2. MARKET TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-lg text-slate-900">Market Assets</h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Live Updates</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                                <tr>
                                    <th className="p-4 pl-6">Asset</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">24h</th>
                                    <th className="p-4 text-right pr-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {marketData.length > 0 ? marketData.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-slate-50 transition group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 relative rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm border border-slate-200">
                                                    {asset.image ? (
                                                        <img src={asset.image} alt={asset.id} className="w-6 h-6 object-cover"/>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-500">{asset.id[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">{asset.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{asset.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                asset.type === 'Crypto' ? 'bg-orange-50 text-orange-600' : 
                                                asset.type === 'ETF' ? 'bg-purple-50 text-purple-600' : 
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {asset.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-900 text-sm font-mono">
                                            ${asset.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 text-xs font-bold ${asset.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                                {asset.trend === 'up' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                                                {Math.abs(asset.change).toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <button 
                                                onClick={() => { setSelectedAsset(asset); setTradeAction('BUY'); }}
                                                className="bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-slate-200"
                                            >
                                                Trade
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-400 text-sm">Loading market data...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>

        {/* --- TRADE MODAL --- */}
        {selectedAsset && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative">
                    <button onClick={() => setSelectedAsset(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                    
                    {!tradeSuccess ? (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-slate-100">
                                    {selectedAsset.image ? (
                                        <img src={selectedAsset.image} alt={selectedAsset.name} className="w-10 h-10"/>
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-400">{selectedAsset.id[0]}</span>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{tradeAction} {selectedAsset.name}</h2>
                                <p className="text-slate-500 text-sm">Current Price: <span className="font-bold text-slate-900">${selectedAsset.price.toLocaleString()}</span></p>
                            </div>

                            <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
                                {['BUY', 'SELL'].map(action => (
                                    <button 
                                        key={action} 
                                        onClick={() => setTradeAction(action)}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${tradeAction === action ? (action === 'BUY' ? 'bg-green-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md') : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Amount (USD)</label>
                                    <div className="relative mt-1">
                                        <DollarSign className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                                        <input 
                                            type="number" 
                                            value={tradeAmount}
                                            onChange={(e) => setTradeAmount(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-right text-xs text-slate-400 mt-2 font-mono">
                                        ≈ {tradeAmount ? (parseFloat(tradeAmount) / selectedAsset.price).toFixed(4) : '0.00'} {selectedAsset.id}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={handleTrade}
                                disabled={!tradeAmount || isTrading}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${tradeAction === 'BUY' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                            >
                                {isTrading ? <Loader2 className="animate-spin" size={20}/> : (tradeAction === 'BUY' ? `Confirm Buy` : `Confirm Sell`)}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <CheckCircle size={40}/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Success!</h3>
                            <p className="text-slate-500 text-sm px-6">
                                You have successfully {tradeAction === 'BUY' ? 'purchased' : 'sold'} <strong>${parseFloat(tradeAmount).toLocaleString()}</strong> worth of {selectedAsset.name}.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}