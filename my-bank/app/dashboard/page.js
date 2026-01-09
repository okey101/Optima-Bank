"use client";

import React, { useState, useEffect } from 'react';
import { 
  Menu, Home, ArrowRightLeft, CreditCard, Settings, LogOut, Bell, 
  ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw, Wallet, Plus, 
  Clock, CheckCircle, XCircle, Eye, EyeOff, Send, History, Download, 
  ChevronRight, Smartphone, Zap, Globe, BarChart3, TrendingUp, 
  User, ShieldAlert, ChevronDown, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- HELPER: LIVE CRYPTO PRICES ---
const useCryptoPrices = () => {
  const [prices, setPrices] = useState({ 
    BTC: 0, ETH: 0, SOL: 0, BNB: 0, 
    XRP: 0, ADA: 0, DOGE: 0, TRX: 0, 
    USDT: 1 
  });
  const [tickerData, setTickerData] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","TRXUSDT"]');
        const data = await res.json();
        
        const newPrices = { USDT: 1 };
        const newTicker = [];

        data.forEach(item => {
          const symbol = item.symbol.replace('USDT', '');
          const price = parseFloat(item.lastPrice);
          newPrices[symbol] = price;
          
          newTicker.push({
            symbol,
            price: price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            change: parseFloat(item.priceChangePercent).toFixed(2) + '%'
          });
        });
        
        setPrices(prev => ({ ...prev, ...newPrices }));
        setTickerData(newTicker);
      } catch (e) { console.error(e); }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  return { prices, tickerData };
};

// --- COMPONENT: SCROLLING TICKER ---
const CryptoTicker = ({ data }) => (
  <div className="bg-slate-900 text-white text-xs py-2 overflow-hidden whitespace-nowrap relative z-20 border-b border-slate-800">
    <div className="animate-[scroll_60s_linear_infinite] inline-block">
      {[...data, ...data].map((coin, i) => (
        <span key={i} className="mx-6 font-mono font-bold">
          <span className="text-slate-300">{coin.symbol}</span> 
          <span className="ml-2">{coin.price}</span>
          <span className={`ml-2 ${coin.change.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>{coin.change}</span>
        </span>
      ))}
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const { prices, tickerData } = useCryptoPrices();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [timeRange, setTimeRange] = useState('1M'); 

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const notifications = [
    { id: 1, title: 'Deposit Received', msg: 'You received $0.10 from Base Network', time: '2m ago', unread: true },
    { id: 2, title: 'Security Alert', msg: 'New login detected from Lagos, NG', time: '1h ago', unread: false },
    { id: 3, title: 'Welcome!', msg: 'Account created successfully.', time: '1d ago', unread: false },
  ];

  // --- 1. FETCH DATA & SYNC STATUS (UPDATED LOGIC) ---
  useEffect(() => {
    const fetchData = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { router.push('/login'); return; }
        
        let currentUser = JSON.parse(storedUser);
        setUser(currentUser); 

        try {
            // A. Get Transactions
            const txRes = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email })
            });
            
            if (txRes.ok) {
                const txData = await txRes.json();
                setTransactions(txData);
                calculateAssets(txData); // Note: We do NOT pass balance here anymore
            }

            // B. SYNC LATEST STATUS (The Verification Fix)
            const statusRes = await fetch('/api/user/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email })
            });

            if (statusRes.ok) {
                const latestData = await statusRes.json();
                
                // If status changed, update UI and LocalStorage immediately
                if (latestData.kycStatus !== currentUser.kycStatus || latestData.balance !== currentUser.balance) {
                    const updatedUser = { ...currentUser, ...latestData };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }

        } catch (error) { console.error("Sync Error", error); } 
        finally { setIsLoading(false); }
    };
    fetchData();
  }, [router]);

  // --- TOKEN-FIRST ASSET CALCULATION (UPDATED LOGIC) ---
  const calculateAssets = (txs) => {
    // 1. Initialize Asset Buckets
    const holdingsUSD = { 
        ETH: 0, BTC: 0, SOL: 0, BNB: 0, 
        XRP: 0, ADA: 0, DOGE: 0, TRX: 0, 
        USDT: 0 
    };
    
    // 2. Sort Transactions (Strict Matching)
    txs.forEach(tx => {
        if (tx.type === 'DEPOSIT' && tx.status === 'APPROVED') {
            const method = tx.method ? tx.method.toUpperCase() : '';
            
            if (method.includes('USDT') || method.includes('TETHER')) {
                holdingsUSD.USDT += tx.amount;
            } else if (method.includes('ETH') || method.includes('ERC20') || method.includes('BASE')) {
                holdingsUSD.ETH += tx.amount;
            } else if (method.includes('BTC') || method.includes('BITCOIN')) {
                holdingsUSD.BTC += tx.amount;
            } else if (method.includes('TRX') || method.includes('TRON')) {
                holdingsUSD.TRX += tx.amount;
            } else if (method.includes('SOL')) {
                holdingsUSD.SOL += tx.amount;
            } else if (method.includes('BNB') || method.includes('BSC')) {
                holdingsUSD.BNB += tx.amount;
            } else if (method.includes('XRP')) {
                holdingsUSD.XRP += tx.amount;
            } else if (method.includes('ADA')) {
                holdingsUSD.ADA += tx.amount;
            } else if (method.includes('DOGE')) {
                holdingsUSD.DOGE += tx.amount;
            }
        }
    });

    // NOTE: Removed the logic that added "remainder" to USDT. 
    // Now it ONLY shows what is in transactions.

    // 3. Create List
    const allAssets = [
        { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=026', usdValue: holdingsUSD.USDT },
        { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=026', usdValue: holdingsUSD.BTC },
        { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026', usdValue: holdingsUSD.ETH },
        { id: 'sol', name: 'Solana', symbol: 'SOL', icon: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=026', usdValue: holdingsUSD.SOL },
        { id: 'bnb', name: 'BNB', symbol: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=026', usdValue: holdingsUSD.BNB },
        { id: 'xrp', name: 'XRP', symbol: 'XRP', icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=026', usdValue: holdingsUSD.XRP },
        { id: 'trx', name: 'TRON', symbol: 'TRX', icon: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=026', usdValue: holdingsUSD.TRX },
        { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=026', usdValue: holdingsUSD.DOGE },
        { id: 'ada', name: 'Cardano', symbol: 'ADA', icon: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=026', usdValue: holdingsUSD.ADA },
    ];

    // 4. SORT: Highest Balance First -> Then Limit to 4
    const sortedAssets = allAssets.sort((a, b) => b.usdValue - a.usdValue);
    setAssets(sortedAssets.slice(0, 4));
  };

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };
  
  const formatCurrency = (amount) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* SIDEBAR */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
        <div className="h-28 flex items-center justify-center border-b border-slate-100">
             <div className="relative w-48 h-16"><Image src="/logo.png" alt="Finora Logo" fill className="object-contain" priority /></div>
        </div>
        <nav className="p-6 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Main Menu</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold transition"><Home size={20} /> Dashboard</Link>
            <Link href="/dashboard/transactions" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition"><ArrowRightLeft size={20} /> Transactions</Link>
            <Link href="/dashboard/deposit" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition"><Wallet size={20} /> Deposit</Link>
            <Link href="/dashboard/cards" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition"><CreditCard size={20} /> My Cards</Link>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-3">Settings</p>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition"><Settings size={20} /> Settings</Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition"><LogOut size={20} /> Logout</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50">
        <CryptoTicker data={tickerData.length > 0 ? tickerData : [{symbol:'Loading', price:'...', change:'...'}]} />
        
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 hidden md:block">Hello, {user.firstName}</h1>
                    <p className="text-xs text-slate-500 font-medium hidden md:block">
                        {user.kycStatus === 'VERIFIED' ? <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Verified Account</span> : 'Standard Account'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4 lg:gap-6">
                <div className="relative">
                    <button onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Bell size={22} />{notifications.some(n => n.unread) && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}</button>
                    {showNotifications && (
                        <div className="absolute top-12 right-0 w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50"><h4 className="font-bold text-slate-800 text-sm">Notifications</h4><span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">3 New</span></div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map((note) => (<div key={note.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition cursor-pointer"><div className="flex justify-between items-start mb-1"><p className="text-sm font-bold text-slate-800">{note.title}</p><span className="text-[10px] text-slate-400">{note.time}</span></div><p className="text-xs text-slate-500 leading-relaxed">{note.msg}</p></div>))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative pl-6 border-l border-slate-200">
                    <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition border border-transparent hover:border-slate-100">
                        <div className="text-right hidden md:block"><p className="text-sm font-bold text-slate-800 leading-none">{user.firstName} {user.lastName}</p><p className="text-[10px] text-slate-500 font-medium pt-1">Profile</p></div>
                        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20 uppercase ring-2 ring-white">{user.firstName[0]}</div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showProfileMenu && (
                        <div className="absolute top-14 right-0 w-60 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="p-2">
                                <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-blue-600 transition font-medium text-sm group"><User size={18} className="text-slate-400 group-hover:text-blue-600" /> My Profile</Link>
                                <Link href="/dashboard/kyc" className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-blue-600 transition font-medium text-sm group"><div className="flex items-center gap-3"><ShieldAlert size={18} className="text-slate-400 group-hover:text-blue-600" /> Verification</div><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${user.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{user.kycStatus === 'VERIFIED' ? 'Verified' : 'Required'}</span></Link>
                            </div>
                            <div className="h-px bg-slate-100 mx-2"></div>
                            <div className="p-2"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-red-600 transition font-medium text-sm"><LogOut size={18} /> Logout</button></div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pb-20">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* --- 3. PRO PORTFOLIO SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT: Portfolio Analytics Card */}
                    <div className="lg:col-span-2 bg-gradient-to-b from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between h-[24rem]">
                        <div className="absolute inset-x-0 bottom-0 h-48 opacity-20 pointer-events-none">
                             <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
                                <path d="M0,150 L0,100 C150,150 350,0 500,80 L500,150 Z" fill="url(#blueGradient)" />
                                <defs>
                                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                             </svg>
                        </div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 font-medium text-sm mb-1 flex items-center gap-2">
                                    Total Portfolio
                                    <button onClick={() => setShowBalance(!showBalance)} className="hover:text-white transition opacity-60">
                                        {showBalance ? <Eye size={16}/> : <EyeOff size={16}/>}
                                    </button>
                                </p>
                                <h2 className="text-5xl font-bold tracking-tight mb-2">
                                    {formatCurrency(user.balance)}
                                </h2>
                                <div className="inline-flex items-center gap-2 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                                    <TrendingUp size={16} />
                                    <span className="font-bold text-sm">+2.4%</span>
                                </div>
                            </div>
                            
                            <div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-sm border border-white/5">
                                {['1D', '1W', '1M', '1Y'].map(t => (
                                    <button key={t} onClick={() => setTimeRange(t)} className={`px-3 py-1 text-xs font-bold rounded-lg transition ${timeRange === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>{t}</button>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
                            <Link href="/dashboard/deposit" className="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1 transition shadow-lg shadow-blue-900/50 group border border-blue-500">
                                <Plus size={20} className="mb-1 group-hover:scale-110 transition" /> 
                                <span>Add Cash</span>
                            </Link>
                            <button className="bg-slate-700/50 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1 transition backdrop-blur-sm border border-white/5">
                                <ArrowUpRight size={20} className="mb-1" /> 
                                <span>Transfer</span>
                            </button>
                            <button className="bg-slate-700/50 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1 transition backdrop-blur-sm border border-white/5">
                                <MoreHorizontal size={20} className="mb-1" /> 
                                <span>More</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Assets List */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[24rem]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">My Assets</h3>
                            <Link href="/dashboard/deposit" className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">See All</Link>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {assets.map((asset) => {
                                const currentPrice = prices[asset.symbol] || 0;
                                const usdValue = asset.usdValue; // Strictly transaction based
                                
                                return (
                                    <div key={asset.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 p-1.5 shadow-sm group-hover:scale-110 transition">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={asset.icon} alt={asset.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{asset.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 rounded inline-block">{asset.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 text-sm">
                                                {/* Show Crypto Amount */}
                                                {showBalance 
                                                    ? (asset.symbol === 'USDT' ? asset.usdValue.toFixed(2) : (prices[asset.symbol] ? (asset.usdValue / prices[asset.symbol]).toFixed(4) : '0.00')) 
                                                    : '••••'}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {/* Show USD Value */}
                                                {showBalance ? formatCurrency(usdValue) : '••••'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 4. ACTIONS */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 ml-1">Quick Actions</h3>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                        {[
                            { icon: Wallet, label: 'Top Up', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: Send, label: 'Transfer', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { icon: Smartphone, label: 'Airtime', color: 'text-orange-600', bg: 'bg-orange-50' },
                            { icon: Zap, label: 'Bills', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                            { icon: Globe, label: 'Internet', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                            { icon: BarChart3, label: 'Invest', color: 'text-green-600', bg: 'bg-green-50' },
                            { icon: Download, label: 'Withdraw', color: 'text-red-600', bg: 'bg-red-50' },
                            { icon: Settings, label: 'More', color: 'text-slate-600', bg: 'bg-slate-50' },
                        ].map((item, i) => (
                            <button key={i} className="flex flex-col items-center gap-2 group p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300 border border-transparent hover:border-slate-200">
                                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon size={22} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. TRANSACTIONS */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Transaction History</h3>
                            <p className="text-slate-500 text-xs mt-1">Latest financial activity</p>
                        </div>
                        <Link href="/dashboard/transactions" className="text-blue-600 text-sm font-bold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition">View All</Link>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <RefreshCw size={24} />
                            </div>
                            <p>No transactions found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition group border border-transparent hover:border-slate-100 cursor-default">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                                            tx.status === 'APPROVED' 
                                                ? (tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600')
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                                {tx.type === 'DEPOSIT' ? 'Crypto Deposit' : 'Transfer'}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{formatDate(tx.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-sm mb-1 ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900'}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                            tx.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 
                                            tx.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}