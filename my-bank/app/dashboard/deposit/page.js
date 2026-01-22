"use client";

import React, { useState, useEffect } from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, Settings, LogOut, 
  Download, Send, Copy, CheckCircle2, RefreshCw, 
  ShieldCheck, AlertTriangle, Loader2, Wallet, Menu, X, Bell,
  ChevronRight, Bitcoin
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- ASSET CONFIGURATION ---
const ASSETS = [
  { id: 'usdt', symbol: 'USDT', name: 'Tether', network: 'TRC20', color: 'bg-green-100 text-green-600', icon: '/file.svg' }, // Using file.svg as placeholder if specific icon missing
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', color: 'bg-orange-100 text-orange-600', icon: '/file.svg' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', network: 'ERC20', color: 'bg-indigo-100 text-indigo-600', icon: '/file.svg' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', network: 'Solana', color: 'bg-purple-100 text-purple-600', icon: '/file.svg' },
];

const SidebarLink = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default function DepositPage() {
  const router = useRouter();
  
  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]); // Default to USDT
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // --- FETCH USER DATA ---
  useEffect(() => {
    const fetchUser = () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        setUser(JSON.parse(stored));
        setLoading(false);
    };
    fetchUser();
  }, [router]);

  // --- GET WALLET ADDRESS ---
  const getAddress = (assetId) => {
      if (!user) return 'Loading...';
      switch (assetId) {
          case 'btc': return user.btcAddress || 'Generating...';
          case 'eth': return user.ethAddress || 'Generating...';
          case 'sol': return user.solAddress || 'Generating...';
          case 'usdt': return user.trxAddress || 'Generating...'; // Defaulting USDT to TRC20
          default: return 'Unavailable';
      }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(getAddress(selectedAsset.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="h-screen w-full bg-slate-50 font-sans flex text-slate-900 overflow-hidden">
      
      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shrink-0`}>
        <div className="h-40 flex items-center justify-center px-4 border-b border-slate-100 shrink-0 bg-slate-50/30">
             <div className="relative w-full h-32"><Image src="/logo.png" alt="Logo" fill className="object-contain" priority /></div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-slate-400"><X size={24}/></button>
        </div>
        <div className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">{user.firstName[0]}</div>
                <div className="overflow-hidden"><p className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p><p className="text-xs text-slate-400 truncate">{user.email}</p></div>
            </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            <div><p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p><div className="space-y-1"><SidebarLink href="/dashboard" icon={Home} label="Dashboard" /><SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" /><SidebarLink href="/dashboard/cards" icon={CreditCard} label="My Cards" /><SidebarLink href="/dashboard/transfer" icon={Send} label="Transfer Money" /><SidebarLink href="/dashboard/deposit" icon={Download} label="Deposit Funds" active={true} /></div></div>
            <div><p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p><div className="space-y-1"><SidebarLink href="/dashboard/kyc" icon={ShieldCheck} label="Verification Center" /><SidebarLink href="/dashboard/settings" icon={Settings} label="Settings" /></div></div>
        </nav>
        <div className="p-4 border-t border-slate-100 shrink-0"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition"><LogOut size={18} /> <span className="text-sm">Log Out</span></button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Menu size={24} /></button>
                <h1 className="text-xl font-bold text-slate-900">Deposit Assets</h1>
            </div>
            <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold"><ShieldCheck size={14} /> Secure Gateway</div>
                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">{user.firstName[0]}</div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 bg-slate-50/50">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: ASSET SELECTION */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Select Asset</h3>
                        <div className="space-y-3">
                            {ASSETS.map((asset) => (
                                <button
                                    key={asset.id}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedAsset.id === asset.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${asset.color}`}>
                                        {/* Fallback to text if icon fails, simplified for this snippet */}
                                        {asset.symbol[0]}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-slate-900">{asset.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{asset.network}</p>
                                    </div>
                                    {selectedAsset.id === asset.id && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Deposit Tip</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Only send <strong>{selectedAsset.network}</strong> assets to this address. Sending other assets may result in permanent loss.
                            </p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>

                {/* RIGHT: DEPOSIT ADDRESS & QR */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-center h-full flex flex-col justify-center">
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Deposit {selectedAsset.symbol}</h2>
                            <p className="text-slate-500">Scan the QR code or copy the address below.</p>
                        </div>

                        {/* DYNAMIC QR CODE */}
                        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 inline-block mx-auto mb-8 shadow-sm">
                            {/* Using a public API for QR generation based on address */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${getAddress(selectedAsset.id)}`} 
                                alt="Wallet QR" 
                                className="w-48 h-48 object-contain rounded-lg"
                            />
                        </div>

                        {/* ADDRESS BOX */}
                        <div className="max-w-lg mx-auto w-full">
                            <label className="block text-left text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Wallet Address ({selectedAsset.network})</label>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                                <div className="flex-1 bg-transparent font-mono text-sm text-slate-600 px-3 truncate font-bold">
                                    {getAddress(selectedAsset.id)}
                                </div>
                                <button 
                                    onClick={handleCopy} 
                                    className={`p-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${copied ? 'bg-green-100 text-green-600' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                >
                                    {copied ? <CheckCircle2 size={18}/> : <Copy size={18}/>}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        {/* MANUAL CONFIRMATION (Optional) */}
                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <p className="text-xs text-slate-400 mb-4">Funds usually arrive within 3 network confirmations.</p>
                            <button onClick={() => window.location.reload()} className="text-blue-600 font-bold text-sm hover:underline flex items-center justify-center gap-2">
                                <RefreshCw size={14}/> Check for new deposits
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}