"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Menu, Home, ArrowRightLeft, CreditCard, PieChart, 
  Settings, LogOut, Bell, Search, Loader2, RefreshCw, Wallet, 
  CheckCircle, XCircle, Clock, Filter, Download
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
            // Fetch up to 100 transactions for the full view
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: parsedUser.email, limit: 100 })
            });
            
            if (res.ok) {
                const txData = await res.json();
                setTransactions(txData);
            }
        } catch (error) {
            console.error("Failed to load transactions");
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [router]);

  // --- FORMATTERS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100">
            <div className="relative w-40 h-12">
                <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left" priority />
            </div>
        </div>

        <nav className="p-6 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Main Menu</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <Home size={20} /> Dashboard
            </Link>
            
            {/* ACTIVE STATE */}
            <Link href="/dashboard/transactions" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold transition">
                <ArrowRightLeft size={20} /> Transactions
            </Link>
            
            <Link href="/dashboard/deposit" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <Wallet size={20} /> Deposit
            </Link>
            <Link href="/dashboard/cards" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <CreditCard size={20} /> My Cards
            </Link>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-3">Settings</p>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition">
                <LogOut size={20} /> Logout
            </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 hidden md:block">Transactions</h1>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-800">{user.firstName} {user.lastName}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md uppercase">
                        {user.firstName[0]}
                    </div>
                </div>
            </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-6xl mx-auto">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Transaction History</h2>
                        <p className="text-slate-500 text-sm">View all your deposits and transfers</p>
                    </div>
                    <div className="flex gap-2">
                         <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition">
                            <Filter size={16} /> Filter
                         </button>
                         <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition">
                            <Download size={16} /> Export
                         </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* TABLE HEADER */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-5 md:col-span-4">Type / ID</div>
                        <div className="col-span-4 md:col-span-3">Date</div>
                        <div className="col-span-3 md:col-span-3">Status</div>
                        <div className="col-span-12 md:col-span-2 text-right md:text-right mt-2 md:mt-0">Amount</div>
                    </div>

                    {/* TABLE BODY */}
                    {isLoading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <RefreshCw className="mx-auto mb-2 opacity-50" size={32} />
                            <p>No transactions found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-slate-50 transition items-center">
                                    
                                    {/* TYPE */}
                                    <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                            ${tx.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 
                                              tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                            {tx.type === 'DEPOSIT' ? <ArrowRightLeft size={18} /> : <CreditCard size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">
                                                {tx.type === 'DEPOSIT' ? 'Crypto Deposit' : 'Transfer'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-mono">ID: #{tx.id}</p>
                                        </div>
                                    </div>

                                    {/* DATE */}
                                    <div className="col-span-4 md:col-span-3 text-sm text-slate-600">
                                        {formatDate(tx.createdAt)}
                                    </div>

                                    {/* STATUS */}
                                    <div className="col-span-3 md:col-span-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                            ${tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                              tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {tx.status === 'APPROVED' ? <CheckCircle size={12} /> : 
                                             tx.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                                            {tx.status}
                                        </span>
                                    </div>

                                    {/* AMOUNT */}
                                    <div className="col-span-12 md:col-span-2 text-right font-bold text-slate-900">
                                        <span className={tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900'}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
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