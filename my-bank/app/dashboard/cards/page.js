"use client";

import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, Search, Home, ArrowRightLeft, CreditCard, PieChart, 
  Settings, LogOut, Plus, Shield, Lock, Eye, EyeOff, Smartphone, 
  ShoppingBag, Zap, Loader2, CheckCircle, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CardsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  
  // --- NEW STATES FOR LOGIC ---
  const [user, setUser] = useState(null);
  const [hasApplied, setHasApplied] = useState(false); // In real app, this comes from DB
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH USER ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        router.push('/login');
    } else {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Check if user has already applied in previous session (simulation)
        const appliedStatus = localStorage.getItem('cardApplied');
        if (appliedStatus === 'true') setHasApplied(true);
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleApply = () => {
      // Simulate API call to issue card
      setHasApplied(true);
      localStorage.setItem('cardApplied', 'true');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600"/></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
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
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition"><Home size={20} /> Dashboard</Link>
            <Link href="/dashboard/transactions" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition"><ArrowRightLeft size={20} /> Transactions</Link>
            <Link href="/dashboard/deposit" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition"><Plus size={20} /> Deposit</Link>
            <Link href="/dashboard/cards" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold transition"><CreditCard size={20} /> My Cards</Link>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-3">Settings</p>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition"><Settings size={20} /> Settings</Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition"><LogOut size={20} /> Logout</button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
                <h1 className="text-xl font-bold text-slate-800 hidden md:block">Cards</h1>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2.5 w-64 border border-transparent focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <Search size={18} className="text-slate-400" />
                    <input type="text" placeholder="Search cards..." className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700" />
                </div>
                <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition">
                    <Bell size={22} /><span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md uppercase">{user.firstName[0]}</div>
                </div>
            </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-6xl mx-auto">
                
                {/* --- LOGIC STATE 1: KYC NOT VERIFIED --- */}
                {user.kycStatus !== 'VERIFIED' ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <Lock size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Verification Required</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
                            To issue a Virtual Card and ensure secure transactions, you must verify your identity first.
                        </p>
                        <Link href="/dashboard/kyc" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition flex items-center gap-2">
                            <ShieldCheck size={20} /> Complete Verification
                        </Link>
                    </div>
                ) : 
                
                /* --- LOGIC STATE 2: VERIFIED BUT NOT APPLIED --- */
                !hasApplied ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300">
                        <div className="mb-8 relative">
                             {/* Floating Card Preview */}
                             <div className="w-80 h-48 bg-gradient-to-br from-slate-800 to-black rounded-2xl shadow-2xl rotate-3 flex flex-col justify-between p-6 text-white relative z-10 border border-slate-700">
                                <div className="flex justify-between items-start"><Shield size={20}/><span className="italic font-bold">VISA</span></div>
                                <div><p className="text-sm opacity-50">Card Holder</p><p className="font-bold tracking-widest">{user.firstName} {user.lastName}</p></div>
                             </div>
                             <div className="absolute top-0 left-0 w-80 h-48 bg-blue-600 rounded-2xl -rotate-6 opacity-30 blur-sm"></div>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Get Your Finora Card</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            Spend your crypto and fiat anywhere globally. Physical delivery available or use instantly online.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 w-full max-w-3xl">
                             <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                                <Zap className="text-yellow-500 mb-2" />
                                <h4 className="font-bold text-slate-900">Instant</h4>
                                <p className="text-xs text-slate-500">Ready to use immediately</p>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                                <ShieldCheck className="text-green-500 mb-2" />
                                <h4 className="font-bold text-slate-900">Secure</h4>
                                <p className="text-xs text-slate-500">Freeze anytime via app</p>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                                <ShoppingBag className="text-blue-500 mb-2" />
                                <h4 className="font-bold text-slate-900">Global</h4>
                                <p className="text-xs text-slate-500">Works everywhere Visa is accepted</p>
                             </div>
                        </div>

                        <button onClick={handleApply} className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-xl font-bold shadow-xl transition w-full max-w-xs">
                            Apply for Free Card
                        </button>
                    </div>
                ) : (

                /* --- LOGIC STATE 3: APPLIED & ACTIVE (Your Original Design) --- */
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">My Cards</h2>
                            <p className="text-slate-500 text-sm">Manage your physical and virtual cards</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center gap-2 transition">
                            <Plus size={18} /> Add New Card
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT: CARD VISUAL & CONTROLS */}
                        <div className="space-y-8">
                            {/* THE CARD */}
                            <div className={`relative w-full aspect-[1.586/1] rounded-3xl p-8 text-white shadow-2xl transition-all duration-500 ${isFrozen ? 'bg-slate-600 grayscale' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2"><Shield size={24} className="opacity-90" /><span className="font-bold tracking-wide opacity-90">Finora</span></div>
                                        <span className="font-bold italic text-lg opacity-80">VISA</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 bg-yellow-400/20 rounded-md border border-yellow-400/40"></div><Zap size={20} className="opacity-60" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <p className="font-mono text-2xl tracking-widest drop-shadow-md">{showCardNumber ? "4582 1290 3381 9452" : "**** **** **** 9452"}</p>
                                            <button onClick={() => setShowCardNumber(!showCardNumber)} className="opacity-60 hover:opacity-100 transition">{showCardNumber ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div><p className="text-[10px] uppercase opacity-60 tracking-wider">Card Holder</p><p className="font-bold tracking-wide uppercase">{user.firstName} {user.lastName}</p></div>
                                            <div><p className="text-[10px] uppercase opacity-60 tracking-wider">Expires</p><p className="font-bold tracking-wide">12/28</p></div>
                                        </div>
                                    </div>
                                </div>
                                {isFrozen && (<div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] rounded-3xl z-20"><div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2 border border-white/30"><Lock size={16} /> <span className="font-bold text-sm">Card Frozen</span></div></div>)}
                            </div>

                            {/* CONTROLS */}
                            <div className="grid grid-cols-3 gap-4">
                                <button onClick={() => setIsFrozen(!isFrozen)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition ${isFrozen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}><Lock size={24} /><span className="text-xs font-bold">{isFrozen ? "Unfreeze" : "Freeze"}</span></button>
                                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition"><Settings size={24} /><span className="text-xs font-bold">Settings</span></button>
                                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition"><Smartphone size={24} /><span className="text-xs font-bold">Google Pay</span></button>
                            </div>

                            {/* SPENDING LIMIT */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-900">Monthly Spending Limit</h3><span className="text-sm font-bold text-blue-600">$1,240 / $5,000</span></div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-blue-600 h-full w-[25%] rounded-full"></div></div>
                                <p className="text-xs text-slate-400 mt-3">You've used 25% of your monthly limit.</p>
                            </div>
                        </div>

                        {/* RIGHT: RECENT ACTIVITY */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-900">Card Transactions</h3><button className="text-xs font-bold text-blue-600 hover:underline">View All</button></div>
                            <div className="p-4 space-y-2">
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition cursor-pointer">
                                    <div className="flex items-center gap-4"><div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><Zap size={20} /></div><div><p className="font-bold text-slate-900 text-sm">Netflix Subscription</p><p className="text-xs text-slate-500">Entertainment</p></div></div><p className="font-bold text-slate-900">-$15.99</p>
                                </div>
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition cursor-pointer">
                                    <div className="flex items-center gap-4"><div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><ShoppingBag size={20} /></div><div><p className="font-bold text-slate-900 text-sm">Amazon Grocery</p><p className="text-xs text-slate-500">Shopping</p></div></div><p className="font-bold text-slate-900">-$84.20</p>
                                </div>
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition cursor-pointer">
                                    <div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Smartphone size={20} /></div><div><p className="font-bold text-slate-900 text-sm">Apple Services</p><p className="text-xs text-slate-500">Software</p></div></div><p className="font-bold text-slate-900">-$2.99</p>
                                </div>
                            </div>
                            <div className="mt-auto p-6 bg-slate-50 m-2 rounded-2xl">
                                <h4 className="font-bold text-sm text-slate-800 mb-2">Need Help?</h4>
                                <p className="text-xs text-slate-500 mb-4">If you see an unrecognized transaction, report it immediately.</p>
                                <button className="w-full py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:border-red-200 hover:text-red-500 transition">Report Issue</button>
                            </div>
                        </div>
                    </div>
                </div>
                )}

            </div>
        </div>
      </main>
    </div>
  );
}