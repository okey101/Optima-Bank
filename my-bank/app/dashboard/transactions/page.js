"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, Settings, LogOut, Bell, 
  ArrowUpRight, ArrowDownLeft, Loader2, Menu, X, 
  FileText, HelpCircle, Landmark, ShieldAlert, Gift, TrendingUp, 
  Globe, Download, Send, Search, Filter, ChevronDown, CheckCircle, AlertCircle, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- UTILS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// --- SHARED COMPONENTS (Matches Dashboard) ---
const SidebarLink = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default function TransactionsPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState('PENDING'); 
  
  // Transaction Data State
  const [transactions, setTransactions] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, DEPOSIT, WITHDRAW, TRANSFER

  // --- DATA FETCHING ---
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
        setKycStatus(currentUser.kycStatus || 'UNVERIFIED');

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email })
            });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
                setFilteredTx(data);
            }
        } catch (e) { console.error("Error fetching txs", e); } 
        finally { setLoading(false); }
    };
    init();
  }, [router]);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = transactions;

    // 1. Filter by Type
    if (filterType !== 'ALL') {
        result = result.filter(tx => tx.type === filterType);
    }

    // 2. Search (Method or Amount)
    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        result = result.filter(tx => 
            (tx.method && tx.method.toLowerCase().includes(lowerQ)) ||
            tx.amount.toString().includes(lowerQ)
        );
    }

    setFilteredTx(result);
  }, [searchQuery, filterType, transactions]);

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };

  if (loading || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="h-screen w-full bg-slate-50 font-sans flex text-slate-900 overflow-hidden">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />}
      
      {/* --- SIDEBAR (EXACT COPY OF DASHBOARD) --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shrink-0`}>
        
        {/* LOGO */}
        <div className="h-40 flex items-center justify-center px-4 border-b border-slate-100 shrink-0 bg-slate-50/30">
             <div className="relative w-full h-32"><Image src="/logo.png" alt="Logo" fill className="object-contain" priority /></div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-slate-400"><X size={24}/></button>
        </div>
        
        {/* USER PROFILE */}
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
            {kycStatus !== 'VERIFIED' && (
                <Link href="/dashboard/kyc" className="mt-4 flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition">
                    <ShieldAlert size={14} /> 
                    {kycStatus === 'PENDING' ? 'Verification Pending' : 'Verify Identity'}
                </Link>
            )}
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
                    {/* ACTIVE PAGE */}
                    <SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" active={true} />
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

        {/* FOOTER */}
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
                <h1 className="text-lg md:text-xl font-bold text-slate-900">Transaction History</h1>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition">
                    <Bell size={20} />
                </button>
                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white">
                    {user.firstName[0]}
                </div>
            </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* FILTERS & SEARCH */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        {['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'].map(type => (
                            <button 
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-1 md:flex-none ${filterType === type ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TRANSACTIONS LIST */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 md:p-6">Type</th>
                                    <th className="p-4 md:p-6">Description / Method</th>
                                    <th className="p-4 md:p-6">Date</th>
                                    <th className="p-4 md:p-6">Status</th>
                                    <th className="p-4 md:p-6 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTx.length > 0 ? (
                                    filteredTx.map(tx => (
                                        <tr key={tx.id} className="hover:bg-slate-50 transition group cursor-default">
                                            <td className="p-4 md:p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${
                                                        tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 
                                                        tx.type === 'WITHDRAW' ? 'bg-red-100 text-red-600' : 
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                        {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={18} /> : 
                                                         tx.type === 'WITHDRAW' ? <ArrowUpRight size={18} /> : 
                                                         <ArrowRightLeft size={18} />}
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm hidden md:inline-block">{tx.type}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 md:p-6">
                                                <p className="font-bold text-slate-900 text-sm">{tx.method || 'General Transaction'}</p>
                                                <p className="text-xs text-slate-400">ID: {tx.id.slice(0,8)}</p>
                                            </td>
                                            <td className="p-4 md:p-6">
                                                <p className="text-sm font-medium text-slate-600">{formatDate(tx.createdAt)}</p>
                                                <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                            </td>
                                            <td className="p-4 md:p-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                                    tx.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-100' : 
                                                    tx.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                                                    'bg-red-50 text-red-700 border border-red-100'
                                                }`}>
                                                    {tx.status === 'APPROVED' && <CheckCircle size={12}/>}
                                                    {tx.status === 'PENDING' && <AlertCircle size={12}/>}
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="p-4 md:p-6 text-right">
                                                <p className={`font-bold text-sm md:text-base ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900'}`}>
                                                    {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                    <Search size={24}/>
                                                </div>
                                                <p className="text-slate-500 font-bold">No transactions found</p>
                                                <p className="text-xs text-slate-400">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}