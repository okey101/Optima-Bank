"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, ArrowRightLeft, Wallet, CreditCard, Settings, LogOut, Bell, 
  ArrowUpRight, ArrowDownLeft, Loader2, Menu, Eye, EyeOff, 
  LayoutGrid, FileText, HelpCircle, Landmark, ShieldAlert, BarChart3,
  Globe, Download, Send, Check, Copy, Repeat, X, ShieldCheck, UserCheck, 
  Info, AlertTriangle, CheckCircle2, Zap, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- UTILS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// --- MOCK NOTIFICATIONS ---
const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'transaction', title: 'Deposit Received', message: 'You have received $5,000.00 from Upwork Escrow Inc.', time: '2 mins ago', read: false },
  { id: 2, type: 'system', title: 'Security Alert', message: 'New login detected from iPhone 14 Pro in Lagos, NG.', time: '1 hour ago', read: false },
  { id: 3, type: 'transaction', title: 'Transfer Successful', message: 'Your transfer of $200.00 to Sarah James was successful.', time: '5 hours ago', read: true },
];

// --- COMPONENTS ---
const MenuGridItem = ({ icon: Icon, label, color, onClick, badge }) => (
  <button onClick={onClick} className="relative flex flex-col items-center justify-center gap-2 p-3 md:p-4 bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-95 transition-all duration-200 group">
    {badge && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white shadow-md ${color}`}>
      <Icon size={20} className="md:w-6 md:h-6" />
    </div>
    <span className="text-[10px] md:text-xs font-bold text-slate-600 group-hover:text-slate-900 text-center leading-tight">{label}</span>
  </button>
);

const BigActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-start justify-between p-4 h-28 md:h-32 bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-95 transition-all duration-200 w-full">
    <div className={`p-2.5 md:p-3 rounded-full ${color} text-white shadow-sm`}>
      <Icon size={18} className="md:w-5 md:h-5" />
    </div>
    <p className="text-sm font-bold text-slate-800 mt-2">{label}</p>
  </button>
);

const StatWidget = ({ label, value, icon: Icon, color, progress }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 md:gap-4 mb-2">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${color} text-white shrink-0`}>
        <Icon size={16} className="md:w-[18px]" />
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-base md:text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
    {progress && (
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${progress}%` }}></div>
      </div>
    )}
  </div>
);

const SidebarLink = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default function DashboardPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copiedId, setCopiedId] = useState(false);

  // Financial Data
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [kycStatus, setKycStatus] = useState('pending');
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeNotifTab, setActiveNotifTab] = useState('all');
  const notifRef = useRef(null);

  // Quick Exchange State
  const [convertFrom, setConvertFrom] = useState('USDT');
  const [convertTo, setConvertTo] = useState('BTC');
  const [convertAmount, setConvertAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertSuccess, setConvertSuccess] = useState(false);
  const [convertMsg, setConvertMsg] = useState('');

  // CLOCK
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // CLOSE NOTIF
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  // DATA FETCHING
  const refreshData = async () => {
      const stored = localStorage.getItem('user');
      if (!stored) { router.push('/login'); return; }
      const currentUser = JSON.parse(stored);
      setUser(currentUser);
      setKycStatus(currentUser.kycStatus || 'pending'); 

      try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email })
        });
        if (res.ok) {
            const txs = await res.json();
            setTransactions(txs);
            const total = txs.reduce((acc, tx) => {
                if (tx.status !== 'APPROVED') return acc;
                const val = parseFloat(tx.amount);
                return tx.type === 'DEPOSIT' ? acc + val : acc - val;
            }, 0);
            setPortfolioValue(total > 0 ? total : 0);
            setAssets([{symbol:'USDT', usdVal: total}, {symbol:'BTC', usdVal: 0}]); 
        }
      } catch (e) { console.error("Sync Error", e); } 
      finally { setLoading(false); }
  };

  useEffect(() => { refreshData(); }, [router]);

  // UTILS
  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(n => {
      if (activeNotifTab === 'all') return true;
      return n.type === activeNotifTab;
  });
  const markAllRead = () => setNotifications(prev => prev.map(n => ({...n, read: true})));

  const handleConvert = async () => {
    setIsConverting(true);
    setTimeout(() => {
        setIsConverting(false);
        setConvertSuccess(true);
        setConvertMsg('Success');
        setTimeout(() => setConvertSuccess(false), 2000);
    }, 1500);
  };

  const copyAccountId = () => {
    if (user?.accountNumber) {
        navigator.clipboard.writeText(user.accountNumber);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };

  if (loading || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    // ✅ 1. OUTER CONTAINER: h-screen + overflow-hidden (Locks Window Scroll)
    <div className="h-screen w-full bg-slate-50 font-sans flex text-slate-900 overflow-hidden">
      
      {/* CUSTOM SCROLLBAR STYLES */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />}
      
      {/* ✅ 2. SIDEBAR: h-full, Flex Column, Independent Scroll */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shrink-0`}>
        
        {/* LOGO (Fixed) */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
             <div className="relative w-32 h-10"><Image src="/logo.png" alt="Logo" fill className="object-contain" priority /></div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><X size={24}/></button>
        </div>
        
        {/* USER PROFILE (Fixed) */}
        <div className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {user.firstName[0]}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
            </div>
            {kycStatus !== 'verified' && (
                <Link href="/dashboard/kyc" className="mt-4 flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition">
                    <ShieldAlert size={14} /> Verify Identity
                </Link>
            )}
        </div>

        {/* NAV LINKS (Scrollable Area) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard" icon={Home} label="Dashboard" active={true} />
                    <SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" />
                    <SidebarLink href="/dashboard/cards" icon={CreditCard} label="My Cards" />
                    <SidebarLink href="/dashboard/transfer" icon={Send} label="Transfer Money" />
                    <SidebarLink href="/dashboard/deposit" icon={Download} label="Deposit Funds" />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/international" icon={Globe} label="International Wire" />
                    <SidebarLink href="/dashboard/loans" icon={Landmark} label="Loan Services" />
                    <SidebarLink href="/dashboard/bills" icon={Zap} label="Bill Payments" />
                    <SidebarLink href="/dashboard/invest" icon={TrendingUp} label="Investments" />
                    <SidebarLink href="/dashboard/tax" icon={FileText} label="IRS Tax Refund" />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/kyc" icon={ShieldCheck} label="Verification Center" />
                    <SidebarLink href="/dashboard/settings" icon={Settings} label="Settings" />
                    <SidebarLink href="/dashboard/support" icon={HelpCircle} label="Help & Support" />
                </div>
            </div>
        </nav>

        {/* FOOTER (Fixed) */}
        <div className="p-4 border-t border-slate-100 shrink-0">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition">
                <LogOut size={18} /> <span className="text-sm">Log Out</span>
            </button>
        </div>
      </aside>

      {/* ✅ 3. MAIN CONTENT: h-full, Independent Scroll */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        
        {/* HEADER (Fixed) */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Menu size={24} /></button>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 lg:hidden">Dashboard</h1>
                <div className="hidden lg:block">
                    <p className="text-sm font-bold text-slate-400 mb-0.5">Good Afternoon,</p>
                    <h1 className="text-xl font-bold text-slate-900">{user.firstName}</h1>
                </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden md:block text-right">
                    <p className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                        {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-xs text-slate-400 font-bold">{currentTime.toLocaleDateString([], {weekday: 'long', month: 'long', day:'numeric'})}</p>
                </div>
                
                {/* NOTIFICATION */}
                <div className="relative" ref={notifRef}>
                    <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-full transition ${showNotifications ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
                    </button>
                    {showNotifications && (
                        <div className="absolute top-12 right-0 w-80 md:w-96 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Notifications</h3>
                                <button onClick={markAllRead} className="text-[10px] font-bold text-blue-600 hover:underline">Mark all as read</button>
                            </div>
                            <div className="flex p-2 gap-1 border-b border-slate-100 bg-white sticky top-0 z-10">
                                {['all', 'transaction', 'system'].map(tab => (
                                    <button key={tab} onClick={() => setActiveNotifTab(tab)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition ${activeNotifTab === tab ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}>
                                        {tab === 'all' ? 'All' : (tab === 'transaction' ? 'Transactions' : 'System')}
                                    </button>
                                ))}
                            </div>
                            <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {filteredNotifications.length > 0 ? (
                                    filteredNotifications.map(notif => (
                                        <div key={notif.id} className={`flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer group ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'transaction' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {notif.type === 'transaction' ? <ArrowDownLeft size={16}/> : <ShieldAlert size={16}/>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-xs font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</p>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notif.time}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{notif.message}</p>
                                            </div>
                                            {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center"><Bell size={24} className="text-slate-200 mx-auto mb-2"/><p className="text-xs text-slate-400">No notifications found.</p></div>
                                )}
                            </div>
                            <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center"><Link href="/dashboard/settings" className="text-[10px] font-bold text-slate-500 hover:text-slate-800">Notification Settings</Link></div>
                        </div>
                    )}
                </div>
                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white">
                    {user.firstName[0]}
                </div>
            </div>
        </header>

        {/* ✅ 4. SCROLLABLE DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

                {/* ROW 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        {/* BANK CARD */}
                        <div className="relative h-56 md:h-64 w-full bg-gradient-to-r from-sky-500 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden group">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute top-1/2 -left-12 w-32 h-32 bg-sky-300/20 rounded-full blur-2xl"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs md:text-sm backdrop-blur-sm border border-white/10">DL</div>
                                        <div className="hidden md:block"><p className="text-sky-100 text-xs">Standard Account</p><p className="text-sm font-bold">Active</p></div>
                                    </div>
                                    <button onClick={() => setHideBalance(!hideBalance)} className="opacity-80 hover:opacity-100 transition p-1">{hideBalance ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                                </div>
                                <div className="my-2 relative z-10"><p className="text-sky-100 text-xs md:text-sm font-medium mb-1">Available Balance</p><h1 className="text-4xl md:text-5xl font-bold tracking-tight">{hideBalance ? '••••••••' : formatCurrency(portfolioValue)}</h1></div>
                                <div className="relative z-10 flex justify-between items-end">
                                    <div><p className="text-[10px] text-sky-200 mb-1">Account Number</p><div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5"><span className="text-xs md:text-sm font-mono tracking-widest">{user.accountNumber}</span><button onClick={copyAccountId}><Copy size={12} className="text-sky-300 hover:text-white"/></button></div></div>
                                    <div className="flex gap-2"><Link href="/dashboard/transactions" className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-3 md:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-md"><ArrowRightLeft size={14} /> <span className="hidden sm:inline">History</span></Link><Link href="/dashboard/deposit" className="bg-white text-blue-600 px-3 md:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-sky-50 transition shadow-lg"><ArrowDownLeft size={14} /> Top up</Link></div>
                                </div>
                            </div>
                        </div>
                        {/* ACTIONS */}
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1">What would you like to do?</h3>
                            <p className="text-xs md:text-sm text-slate-500 mb-4">Choose from our popular actions below</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                <BigActionButton icon={FileText} label="Account Info" color="bg-slate-500" onClick={() => {}} />
                                <BigActionButton icon={Send} label="Send Money" color="bg-blue-500" onClick={() => router.push('/dashboard/transfer')} />
                                <BigActionButton icon={Download} label="Deposit" color="bg-green-500" onClick={() => router.push('/dashboard/deposit')} />
                                <BigActionButton icon={ArrowRightLeft} label="History" color="bg-purple-500" onClick={() => router.push('/dashboard/transactions')} />
                            </div>
                        </div>
                    </div>
                    {/* STATS */}
                    <div className="space-y-4 md:space-y-6">
                        <StatWidget label="Transaction Limit" value="$500,000.00" icon={ShieldAlert} color="bg-indigo-500" progress={75} />
                        <StatWidget label="Pending Inflow" value="$0.00" icon={Loader2} color="bg-yellow-500" />
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Repeat size={16} className="text-blue-500"/> Quick Exchange</h3></div>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <select value={convertFrom} onChange={(e) => setConvertFrom(e.target.value)} className="w-1/2 bg-slate-50 border-slate-200 rounded-xl p-2 text-xs font-bold">{assets.length > 0 ? assets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>) : <option>USDT</option>}</select>
                                    <select value={convertTo} onChange={(e) => setConvertTo(e.target.value)} className="w-1/2 bg-slate-50 border-slate-200 rounded-xl p-2 text-xs font-bold">{assets.length > 0 ? assets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>) : <option>BTC</option>}</select>
                                </div>
                                <div className="flex gap-2">
                                    <input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500" placeholder="Amount" />
                                    <button onClick={handleConvert} disabled={isConverting} className={`px-4 rounded-xl font-bold text-xs text-white transition whitespace-nowrap ${convertSuccess ? 'bg-green-500' : 'bg-slate-900 hover:bg-slate-800'}`}>
                                        {isConverting ? <Loader2 className="animate-spin" size={14}/> : (convertSuccess ? <Check size={16}/> : 'Convert')}
                                    </button>
                                </div>
                                {convertMsg && <p className="text-[10px] text-center text-slate-500">{convertMsg}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 3: MENU GRID */}
                <div>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Banking Menu</h3>
                        <span className="text-xs text-slate-400 font-medium italic">Select an option to continue</span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                        {kycStatus !== 'verified' ? (
                            <MenuGridItem icon={ShieldAlert} label="Verify Account" color="bg-red-500" badge={true} onClick={() => router.push('/dashboard/kyc')} />
                        ) : (
                            <MenuGridItem icon={Home} label="Home" color="bg-blue-500" onClick={() => {}} />
                        )}
                        <MenuGridItem icon={ArrowRightLeft} label="Activity" color="bg-green-500" onClick={() => router.push('/dashboard/transactions')} />
                        <MenuGridItem icon={CreditCard} label="Cards" color="bg-purple-500" onClick={() => router.push('/dashboard/cards')} />
                        <MenuGridItem icon={Send} label="Transfer" color="bg-indigo-500" onClick={() => router.push('/dashboard/transfer')} />
                        <MenuGridItem icon={Globe} label="Int'l Wire" color="bg-cyan-500" onClick={() => {}} />
                        <MenuGridItem icon={Download} label="Deposit" color="bg-teal-500" onClick={() => router.push('/dashboard/deposit')} />
                        <MenuGridItem icon={Landmark} label="Loan" color="bg-emerald-500" onClick={() => {}} />
                        <MenuGridItem icon={FileText} label="IRS Refund" color="bg-orange-500" onClick={() => {}} />
                        <MenuGridItem icon={Settings} label="Settings" color="bg-slate-600" onClick={() => router.push('/dashboard/settings')} />
                        <MenuGridItem icon={HelpCircle} label="Support" color="bg-pink-500" onClick={() => {}} />
                        <MenuGridItem icon={LogOut} label="Logout" color="bg-red-500" onClick={handleLogout} />
                    </div>
                </div>

                {/* ROW 4: RECENT ACTIVITY */}
                <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2"><ArrowRightLeft size={20} className="text-blue-500"/> Recent Activity</h3>
                        <Link href="/dashboard/transactions" className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition">View All</Link>
                    </div>
                    <div className="space-y-1">
                        {transactions.slice(0, 5).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-slate-50 rounded-2xl transition group border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white shadow-sm ${tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm capitalize">{tx.type.toLowerCase()} <span className="hidden sm:inline text-xs font-normal text-slate-400">({tx.method || 'General'})</span></p>
                                        <p className="text-[10px] md:text-xs text-slate-400">{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm md:text-base ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900'}`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{tx.status}</span>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="text-center py-8"><p className="text-slate-400 text-xs">No recent transactions found.</p></div>
                        )}
                    </div>
                </div>

            </div>
            
            {/* FOOTER */}
            <div className="max-w-6xl mx-auto mt-12 mb-4 text-center"><p className="text-[10px] text-slate-400">© 2026 longinova Bank. Secured by SSL.</p></div>
        </div>
      </main>
    </div>
  );
}