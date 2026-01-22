"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, Home, ArrowRightLeft, CreditCard, Settings, LogOut, 
  Plus, Shield, Lock, Eye, EyeOff, Smartphone, ShoppingBag, Zap, 
  Loader2, ShieldCheck, Check, Sliders, Globe, Landmark, FileText, 
  TrendingUp, HelpCircle, Download, Send, RotateCcw, X, Wallet, 
  ChevronRight, AlertCircle, MapPin, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- CONFIGURATION ---
const GRADIENTS = {
  blue: "bg-gradient-to-br from-blue-600 to-indigo-700",
  black: "bg-gradient-to-br from-slate-900 to-slate-800",
  gold: "bg-gradient-to-br from-amber-400 to-yellow-600",
  purple: "bg-gradient-to-br from-purple-600 to-indigo-600",
};

const CARD_TIERS = [
  { id: 'virtual', name: 'Virtual Basic', price: 5.00, desc: 'Instant activation for online spending.', icon: Zap, color: 'bg-blue-100 text-blue-600' },
  { id: 'physical', name: 'Standard Plastic', price: 15.00, desc: 'Physical card delivered in 3-5 days.', icon: CreditCard, color: 'bg-green-100 text-green-600' },
  { id: 'metal', name: 'Premium Metal', price: 50.00, desc: 'High limits, cashback, and metal finish.', icon: ShieldCheck, color: 'bg-slate-800 text-white' },
];

const SidebarLink = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default function CardsPage() {
  const router = useRouter();
  
  // --- GLOBAL STATE ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0); 
  
  // --- CARD & APPLICATION STATE ---
  const [hasApplied, setHasApplied] = useState(false);
  const [activeTab, setActiveTab] = useState('application'); 
  
  // Application Wizard
  const [appStep, setAppStep] = useState(1); // 1:Select, 2:Details, 3:Pay, 4:Success
  const [selectedTier, setSelectedTier] = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Active Card Data (Real Data from DB)
  const [realCardNumber, setRealCardNumber] = useState(null);
  const [realExpiry, setRealExpiry] = useState(null);
  const [realCVV, setRealCVV] = useState(null);

  // Active Dashboard Features
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [cardSkin, setCardSkin] = useState('blue');
  const [spendingLimit, setSpendingLimit] = useState(1200); 
  const [maxLimit, setMaxLimit] = useState(5000);

  // --- 3D TILT LOGIC ---
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    setTilt({ x, y });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  // --- INITIALIZATION ---
  useEffect(() => {
    const fetchUserData = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setCardName(`${parsedUser.firstName} ${parsedUser.lastName}`); 

        // Fetch Balance
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: parsedUser.email })
            });
            if (res.ok) {
                const txs = await res.json();
                const total = txs.reduce((acc, tx) => {
                    if (tx.status !== 'APPROVED') return acc;
                    const val = parseFloat(tx.amount);
                    return tx.type === 'DEPOSIT' ? acc + val : acc - val;
                }, 0);
                setBalance(total);
            }
        } catch (e) { console.error(e); }

        // Check if card exists (Simulation for now, or fetch from API if you add a GET endpoint)
        const appliedStatus = localStorage.getItem('cardApplied');
        if (appliedStatus === 'true') {
            setHasApplied(true);
            setActiveTab('dashboard');
            // If you had a 'fetch card' API, you would call it here to populate realCardNumber
        }
        setLoading(false);
    };
    fetchUserData();
  }, [router]);

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };

  // --- WIZARD HANDLERS ---
  const handleSelectTier = (tier) => {
    setSelectedTier(tier);
    setAppStep(2);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (cardPin.length !== 4) return;
    setAppStep(3);
    setPaymentError('');
  };

  const handlePayment = async () => {
    // 1. Frontend Check
    if (balance < selectedTier.price) {
        setPaymentError('Insufficient funds. Please deposit money first.');
        return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
        // 2. Call API to Generate Card & Charge User
        const res = await fetch('/api/cards/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                tier: selectedTier.name,
                price: selectedTier.price
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setPaymentError(data.error || 'Payment failed');
            setIsProcessing(false);
            return;
        }

        // 3. Success: Update State with Real Data
        if (data.card) {
            setRealCardNumber(data.card.cardNumber);
            setRealExpiry(data.card.expiryDate);
            setRealCVV(data.card.cvv);
        }
        
        if (data.balance !== undefined) setBalance(data.balance);

        setAppStep(4);
        setHasApplied(true);
        localStorage.setItem('cardApplied', 'true');
        
        setTimeout(() => {
            setActiveTab('dashboard');
            setIsProcessing(false);
        }, 2500);

    } catch (error) {
        console.error(error);
        setPaymentError('Connection error. Please try again.');
        setIsProcessing(false);
    }
  };

  // Reset for Testing
  const handleResetCard = () => {
      localStorage.removeItem('cardApplied');
      setHasApplied(false);
      setAppStep(1);
      setActiveTab('application');
      setRealCardNumber(null);
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="h-screen w-full bg-slate-50 font-sans flex text-slate-900 overflow-hidden">
      
      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #2563eb; cursor: pointer; margin-top: -8px; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4); }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #e2e8f0; border-radius: 2px; }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>

      {/* MOBILE OVERLAY */}
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
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div><p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p><div className="space-y-1"><SidebarLink href="/dashboard" icon={Home} label="Dashboard" /><SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" /><SidebarLink href="/dashboard/cards" icon={CreditCard} label="My Cards" active={true} /><SidebarLink href="/dashboard/transfer" icon={Send} label="Transfer Money" /><SidebarLink href="/dashboard/deposit" icon={Download} label="Deposit Funds" /></div></div>
            <div><p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services</p><div className="space-y-1"><SidebarLink href="/dashboard/international" icon={Globe} label="International Wire" /><SidebarLink href="/dashboard/loans" icon={Landmark} label="Loan Services" /><SidebarLink href="/dashboard/bills" icon={Zap} label="Bill Payments" /></div></div>
            <div><p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p><div className="space-y-1"><SidebarLink href="/dashboard/kyc" icon={ShieldCheck} label="Verification Center" /><SidebarLink href="/dashboard/settings" icon={Settings} label="Settings" /></div></div>
        </nav>
        <div className="p-4 border-t border-slate-100 shrink-0"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition"><LogOut size={18} /> <span className="text-sm">Log Out</span></button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Menu size={24} /></button>
                <h1 className="text-xl font-bold text-slate-900">Cards</h1>
            </div>
            <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold"><ShieldCheck size={14} /> Secure Environment</div>
                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">{user.firstName[0]}</div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 bg-slate-50/50 custom-scrollbar">
            <div className="max-w-6xl mx-auto">
                
                {/* 1. KYC CHECK */}
                {user.kycStatus !== 'VERIFIED' && user.kycStatus !== 'verified' ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100"><Lock size={40} /></div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Verification Required</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">To apply for a card, please complete your identity verification first.</p>
                        <Link href="/dashboard/kyc" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-2"><ShieldCheck size={20} /> Complete Verification</Link>
                    </div>
                ) : 
                
                /* 2. APPLICATION WIZARD */
                !hasApplied || activeTab === 'application' ? (
                    <div className="max-w-3xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* STEP 1: SELECT TIER */}
                        {appStep === 1 && (
                            <>
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Select Your Card</h2>
                                    <p className="text-slate-500">Choose the card type that fits your lifestyle.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {CARD_TIERS.map((tier) => (
                                        <div key={tier.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between" onClick={() => handleSelectTier(tier)}>
                                            <div>
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${tier.color}`}><tier.icon size={24}/></div>
                                                <h3 className="font-bold text-lg text-slate-900 mb-1">{tier.name}</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-4">{tier.desc}</p>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                                <span className="text-lg font-bold text-slate-900">${tier.price}</span>
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">Apply</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* STEP 2: CUSTOMIZE DETAILS */}
                        {appStep === 2 && selectedTier && (
                            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 max-w-lg mx-auto">
                                <button onClick={() => setAppStep(1)} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 text-sm font-bold"><ArrowRightLeft size={16} className="rotate-180"/> Back</button>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Card Details</h2>
                                
                                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Name on Card</label>
                                        <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Set 4-Digit PIN</label>
                                        <input type="password" maxLength={4} value={cardPin} onChange={(e) => setCardPin(e.target.value.replace(/\D/g,''))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-xl" placeholder="••••" required />
                                    </div>
                                    {selectedTier.id !== 'virtual' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Shipping Address</label>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-start">
                                                <MapPin size={20} className="text-slate-400 mt-0.5" />
                                                <p className="text-sm font-medium text-slate-600">{user.streetAddress || 'Address not found. Update in settings.'}</p>
                                            </div>
                                        </div>
                                    )}
                                    <button type="submit" disabled={cardPin.length !== 4} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50 mt-4">Continue</button>
                                </form>
                            </div>
                        )}

                        {/* STEP 3: REVIEW & PAY */}
                        {appStep === 3 && selectedTier && (
                            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 max-w-lg mx-auto text-center">
                                <button onClick={() => setAppStep(2)} className="absolute top-8 left-8 text-slate-400 hover:text-slate-600"><ArrowRightLeft size={20} className="rotate-180"/></button>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${selectedTier.color}`}><selectedTier.icon size={40}/></div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Pay & Apply</h2>
                                <p className="text-slate-500 text-sm mb-8">Confirm payment to submit application</p>
                                
                                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 text-left">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-500 text-sm">Issuance Fee</span>
                                        <span className="font-bold text-slate-900">${selectedTier.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-500 text-sm">Balance</span>
                                        <span className={`font-bold ${balance >= selectedTier.price ? 'text-green-600' : 'text-red-600'}`}>${balance.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                                        <span className="font-bold text-slate-900">Total</span>
                                        <span className="font-bold text-xl text-blue-600">${selectedTier.price.toFixed(2)}</span>
                                    </div>
                                    {paymentError && <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl"><AlertCircle size={16}/> {paymentError}</div>}
                                </div>

                                <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-3 disabled:opacity-50">
                                    {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <Wallet size={20}/>}
                                    {isProcessing ? 'Processing...' : `Confirm Payment`}
                                </button>
                            </div>
                        )}

                        {/* STEP 4: SUCCESS */}
                        {appStep === 4 && (
                            <div className="bg-white rounded-[2rem] p-12 shadow-xl border border-slate-100 max-w-md mx-auto text-center animate-in zoom-in">
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={48}/></div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Approved!</h2>
                                <p className="text-slate-500 text-sm mb-8">Your card has been issued successfully.</p>
                                <Loader2 className="animate-spin text-blue-500 mx-auto" size={24}/>
                            </div>
                        )}
                    </div>
                ) : (

                /* 3. ACTIVE DASHBOARD (3D TILT + REAL DATA) */
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div><h2 className="text-2xl font-bold text-slate-900">My Virtual Card</h2><p className="text-slate-500 text-sm">Manage limits, freeze card, or change style</p></div>
                        <button onClick={handleResetCard} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 flex items-center gap-2 transition"><RefreshCw size={16} /> Reset (Test Mode)</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT: 3D CARD */}
                        <div className="space-y-8">
                            <div className="perspective-1000 w-full aspect-[1.586/1]" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                <div ref={cardRef} className={`relative w-full h-full rounded-3xl p-8 text-white shadow-2xl transition-transform duration-100 ease-out transform-style-3d ${isFrozen ? 'bg-slate-600 grayscale' : GRADIENTS[cardSkin]}`} style={{ transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)` }}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" style={{ transform: `translate(${tilt.x * 2}px, ${tilt.y * 2}px)` }}></div>
                                    <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                                        <div className="flex justify-between items-start"><div className="flex items-center gap-2"><Shield size={24} /><span className="font-bold tracking-wide">Finora</span></div><span className="font-bold italic text-lg opacity-80">VISA</span></div>
                                        <div className="flex items-center gap-4"><div className="w-12 h-9 bg-yellow-400/20 rounded-md border border-yellow-400/40 backdrop-blur-sm"></div><Zap size={20} className="opacity-60" /></div>
                                        <div>
                                            <div className="flex items-center gap-4 mb-4 pointer-events-auto">
                                                {/* DISPLAY REAL GENERATED NUMBER */}
                                                <p className="font-mono text-xl md:text-2xl tracking-widest drop-shadow-md">
                                                    {showCardNumber 
                                                        ? (realCardNumber || "4582 1290 3381 9452") 
                                                        : `**** **** **** ${(realCardNumber || "9452").slice(-4)}`
                                                    }
                                                </p>
                                                <button onClick={() => setShowCardNumber(!showCardNumber)} className="opacity-60 hover:opacity-100 transition p-1">{showCardNumber ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                                            </div>
                                            <div className="flex justify-between items-end text-xs md:text-sm font-medium opacity-80">
                                                <div><p className="text-[10px] uppercase opacity-60 tracking-wider mb-0.5">Card Holder</p><p className="uppercase tracking-wide">{cardName}</p></div>
                                                {/* DISPLAY REAL EXPIRY */}
                                                <div><p className="text-[10px] uppercase opacity-60 tracking-wider mb-0.5">Expires</p><p className="tracking-wide">{realExpiry || "12/28"}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                    {isFrozen && (<div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl z-20"><div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2 border border-white/30 text-white"><Lock size={16} /> <span className="font-bold text-sm">Frozen</span></div></div>)}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Card Style</p><div className="flex gap-3">{Object.keys(GRADIENTS).map((skin) => (<button key={skin} onClick={() => setCardSkin(skin)} className={`w-10 h-10 rounded-full transition-all duration-200 border-2 ${cardSkin === skin ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'} ${GRADIENTS[skin]}`}></button>))}</div></div>
                            <div className="grid grid-cols-3 gap-4"><button onClick={() => setIsFrozen(!isFrozen)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition ${isFrozen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}><Lock size={24} /><span className="text-xs font-bold">{isFrozen ? "Unfreeze" : "Freeze"}</span></button><button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition"><Sliders size={24} /><span className="text-xs font-bold">Limits</span></button><button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition"><Smartphone size={24} /><span className="text-xs font-bold">G-Pay</span></button></div>
                        </div>

                        {/* RIGHT: SETTINGS */}
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-900">Monthly Spending Limit</h3><span className="text-lg font-bold text-blue-600">${spendingLimit.toLocaleString()}</span></div><div className="relative mb-2"><input type="range" min="100" max={maxLimit} step="100" value={spendingLimit} onChange={(e) => setSpendingLimit(Number(e.target.value))} className="w-full"/></div><div className="flex justify-between text-xs text-slate-400 font-bold mt-2"><span>$100</span><span>${maxLimit.toLocaleString()}</span></div></div>
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden"><div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-900">Recent Transactions</h3><button className="text-xs font-bold text-blue-600 hover:underline">View All</button></div><div className="p-2 space-y-1"><div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition cursor-pointer"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><Zap size={18} /></div><div><p className="font-bold text-slate-900 text-sm">Netflix</p><p className="text-[10px] text-slate-500">Subscription</p></div></div><p className="font-bold text-slate-900 text-sm">-$15.99</p></div></div></div>
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