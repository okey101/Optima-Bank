"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, CheckCircle, User, ArrowRight, 
  Loader2, ShieldCheck, AlertCircle, ChevronDown, 
  Building2, Globe, Wallet, Banknote, Zap, MoreHorizontal, Smartphone,
  Info, ScanLine, X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TransferPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Navigation & UI State
  const [step, setStep] = useState(0); 
  const [transferType, setTransferType] = useState(''); 
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  // Form Data
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [note, setNote] = useState('');

  // Enhanced Bank Details State
  const [bankDetails, setBankDetails] = useState({
    accountName: '', 
    accountNumber: '', 
    iban: '',            // Added for Wire
    bankName: '', 
    bankAddress: '',     // Added for Wire
    routingNumber: '', 
    swiftCode: '',       // Added for Local & Wire
    accountType: 'Checking',
    country: ''
  });

  // Recipient & Crypto State
  const [searchQuery, setSearchQuery] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [asset, setAsset] = useState('USDT');
  const [walletAddress, setWalletAddress] = useState(''); 

  // System State
  const [assetBalances, setAssetBalances] = useState({
    USD: 0, USDT: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, BNB: 0
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // --- Initialization ---
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
        fetchBalances(currentUser.email, currentUser.balance);
    };
    init();
  }, [router]);

  const fetchBalances = async (email, fiatBalance) => {
    try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (res.ok) {
            const txs = await res.json();
            const cryptoBalances = calculateCryptoBalances(txs);
            // Combine Fiat (from User DB) with Crypto (from Tx history)
            setAssetBalances({ ...cryptoBalances, USD: fiatBalance });
        }
    } catch (e) { console.error("Balance Sync Failed", e); }
  };

  const calculateCryptoBalances = (txs) => {
    const balances = { USDT: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, BNB: 0 };
    txs.forEach(tx => {
        if (tx.status === 'APPROVED') {
            let key = 'USDT'; 
            const method = tx.method ? tx.method.toUpperCase() : '';
            if (method.includes('ETH')) key = 'ETH';
            else if (method.includes('BTC')) key = 'BTC';
            else if (method.includes('SOL')) key = 'SOL';
            else if (method.includes('TRX')) key = 'TRX';
            else if (method.includes('BNB')) key = 'BNB';

            if (tx.type === 'DEPOSIT') balances[key] += tx.amount;
            else if (tx.type === 'TRANSFER' || tx.type === 'WITHDRAW') balances[key] -= tx.amount;
        }
    });
    Object.keys(balances).forEach(k => { if(balances[k] < 0) balances[k] = 0; });
    return balances;
  };

  // --- Handlers ---

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setRecipient(null);
    try {
        const res = await fetch('/api/transfer/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery })
        });
        const data = await res.json();
        if (res.ok && data.found) {
            if (data.recipient.email === user.email) setSearchError("You cannot send money to yourself.");
            else setRecipient(data.recipient);
        } else {
            setSearchError("User not found.");
        }
    } catch (err) { setSearchError("Connection failed."); } 
    finally { setIsSearching(false); }
  };

  const handleTransfer = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    // Determine context ID
    const thirdPartyId = walletAddress; 

    const payload = {
        senderEmail: user.email,
        amount,
        pin,
        type: transferType === 'INTERNAL' ? 'TRANSFER' : 'WITHDRAW',
        method: transferType,
        asset: transferType === 'CRYPTO' ? asset : 'USD', 
        
        // Context specific fields
        ...(transferType === 'INTERNAL' && { recipientId: recipient?.id }),
        ...(transferType === 'LOCAL' && { details: bankDetails, recipientId: 'EXTERNAL_BANK' }),
        ...(transferType === 'WIRE' && { details: bankDetails, recipientId: 'INTERNATIONAL_WIRE' }),
        ...((['CRYPTO', 'PAYPAL', 'WISE', 'CASHAPP', 'ZELLE', 'VENMO', 'REVOLUT'].includes(transferType)) && { 
            recipientId: thirdPartyId, 
            details: { service: transferType, note } 
        })
    };

    try {
        const res = await fetch('/api/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (res.ok) {
            // Update UI State immediately
            const newBalance = user.balance - parseFloat(amount);
            const updatedUser = { ...user, balance: newBalance };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            // Also update the balances state
            setAssetBalances(prev => ({ ...prev, USD: newBalance }));
            setStep(3); 
        } else {
            setSubmitError(data.message || 'Transfer failed');
        }
    } catch (err) {
        setSubmitError("Connection failed. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Helpers ---
  const PRESETS = ['100', '500', '1000', 'Max'];
  const ASSETS = [
    { code: 'USDT', name: 'Tether' }, { code: 'BTC', name: 'Bitcoin' }, 
    { code: 'ETH', name: 'Ethereum' }, { code: 'SOL', name: 'Solana' }
  ];
  
  const MAIN_APPS = [
    { id: 'CRYPTO', name: 'Cryptocurrency', icon: <Wallet size={20}/>, color: 'text-orange-500' },
    { id: 'PAYPAL', name: 'PayPal', icon: <User size={20}/>, color: 'text-blue-700' },
    { id: 'WISE', name: 'Wise', icon: <Globe size={20}/>, color: 'text-green-600' },
    { id: 'CASHAPP', name: 'Cash App', icon: <Banknote size={20}/>, color: 'text-green-500' },
  ];
  const MORE_APPS = [
    { id: 'ZELLE', name: 'Zelle', icon: <Zap size={20}/>, color: 'text-purple-600' },
    { id: 'VENMO', name: 'Venmo', icon: <Smartphone size={20}/>, color: 'text-blue-400' },
    { id: 'REVOLUT', name: 'Revolut', icon: <Globe size={20}/>, color: 'text-pink-600' },
  ];

  // Get current available balance based on selected method
  const getAvailableBalance = () => {
      if (transferType === 'CRYPTO') return assetBalances[asset] || 0;
      return assetBalances.USD || 0;
  };
  
  const currentBalance = getAvailableBalance();
  const isBalanceLow = amount && parseFloat(amount) > currentBalance;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
             <button onClick={() => step === 0 ? router.push('/dashboard') : setStep(step - 1)} 
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
                <ArrowLeft size={20} />
             </button>
             <div className="flex-1">
                 <h1 className="font-bold text-lg leading-tight">
                    {step === 0 ? 'Transfer Money' : 
                     step === 3 ? 'Receipt' :
                     transferType === 'INTERNAL' ? 'Internal Transfer' :
                     transferType === 'LOCAL' ? 'Local Transfer' :
                     transferType === 'WIRE' ? 'International Wire' : 'Send Money'}
                 </h1>
             </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md pb-20">

                {/* === STEP 0: METHOD SELECTION === */}
                {step === 0 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* 1. Internal Transfer (Priority) */}
                        <button 
                            onClick={() => { setTransferType('INTERNAL'); setStep(1); }}
                            className="w-full bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-200 text-left relative overflow-hidden group transition hover:-translate-y-1"
                        >
                            <div className="absolute top-0 right-0 bg-white/20 px-4 py-1 rounded-bl-xl text-xs font-bold backdrop-blur-sm">
                                RECOMMENDED
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Zap size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Finora P2P</h3>
                                    <p className="text-blue-100 text-sm">Free & instant to Finora users</p>
                                </div>
                            </div>
                            {/* Decorative background circles */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition"></div>
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => { setTransferType('LOCAL'); setStep(1); }}
                                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group"
                            >
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <Building2 size={20} />
                                </div>
                                <h3 className="font-bold text-slate-800">Local Bank</h3>
                                <p className="text-xs text-slate-500 mt-1">Direct deposit</p>
                            </button>

                            <button 
                                onClick={() => { setTransferType('WIRE'); setStep(1); }}
                                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-purple-500 hover:shadow-md transition text-left group"
                            >
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <Globe size={20} />
                                </div>
                                <h3 className="font-bold text-slate-800">Intl. Wire</h3>
                                <p className="text-xs text-slate-500 mt-1">SWIFT / IBAN</p>
                            </button>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {[...MAIN_APPS, ...(showMoreOptions ? MORE_APPS : [])].map((m) => (
                                <button 
                                    key={m.id}
                                    onClick={() => { setTransferType(m.id); setStep(1); }}
                                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
                                >
                                    <div className={`w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center ${m.color}`}>
                                        {m.icon}
                                    </div>
                                    <span className="font-bold text-slate-700 flex-1 text-left">{m.name}</span>
                                    <ArrowRight size={16} className="text-slate-300"/>
                                </button>
                            ))}

                            {!showMoreOptions && (
                                <button 
                                    onClick={() => setShowMoreOptions(true)}
                                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition"
                                >
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                        <MoreHorizontal size={20} />
                                    </div>
                                    <span className="font-bold text-slate-500 flex-1 text-left">More Options</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* === STEP 1: DETAILS FORM === */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        
                        {/* 1. AMOUNT SECTION (Common for all) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount to Send</label>
                            
                            <div className="flex items-center justify-center my-4">
                                <span className="text-3xl font-bold text-slate-300 mr-2">
                                    {transferType === 'CRYPTO' ? '' : '$'}
                                </span>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-48 text-5xl font-bold text-slate-900 text-center outline-none bg-transparent placeholder-slate-200"
                                    placeholder="0"
                                    autoFocus
                                />
                                {transferType === 'CRYPTO' && <span className="text-lg font-bold text-slate-400 mt-2">{asset}</span>}
                            </div>

                            {/* Available Balance Indicator */}
                            <div className={`flex items-center justify-center gap-2 text-sm font-bold transition-colors ${isBalanceLow ? 'text-red-500' : 'text-slate-500'}`}>
                                <Wallet size={16} />
                                <span>Available: {transferType === 'CRYPTO' ? '' : '$'}{currentBalance.toLocaleString()}</span>
                            </div>
                            {isBalanceLow && <p className="text-xs text-red-500 font-bold mt-1 animate-pulse">Insufficient Balance</p>}

                            {/* Presets */}
                            <div className="flex gap-2 mt-6">
                                {PRESETS.map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => setAmount(p === 'Max' ? currentBalance : p)}
                                        className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition border border-transparent hover:border-slate-200"
                                    >
                                        {p === 'Max' ? 'MAX' : `$${p}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. DETAILS SECTION */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                            
                            {/* --- INTERNAL TRANSFER --- */}
                            {transferType === 'INTERNAL' && (
                                <>
                                    {!recipient ? (
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-4">Recipient</h3>
                                            <form onSubmit={handleSearch} className="relative">
                                                <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                                                <input 
                                                    type="text" required value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                    placeholder="Email or Finora ID"
                                                />
                                                <button type="submit" disabled={isSearching || !searchQuery} className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-lg flex items-center justify-center">
                                                    {isSearching ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                                </button>
                                            </form>
                                            {searchError && <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2"><AlertCircle size={16}/> {searchError}</div>}
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                                    {recipient.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{recipient.firstName} {recipient.lastName}</p>
                                                    <p className="text-xs text-slate-500">{recipient.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setRecipient(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 transition"><X size={16}/></button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* --- BANK & WIRE --- */}
                            {(transferType === 'LOCAL' || transferType === 'WIRE') && (
                                <>
                                    <h3 className="font-bold text-slate-900 mb-1">Beneficiary Details</h3>
                                    <div className="space-y-3">
                                        
                                        {/* Common Fields */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 ml-1">Account Holder Name</label>
                                            <input 
                                                type="text" placeholder="e.g. John Doe"
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                value={bankDetails.accountName} onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                                            />
                                        </div>

                                        {/* Local Specifics */}
                                        {transferType === 'LOCAL' && (
                                            <>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 ml-1">Account Number</label>
                                                    <input 
                                                        type="text" placeholder="10-12 digits"
                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                        value={bankDetails.accountNumber} onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-slate-400 ml-1">Bank Name</label>
                                                        <input 
                                                            type="text" placeholder="Bank Name"
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                            value={bankDetails.bankName} onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-slate-400 ml-1">Account Type</label>
                                                        <select 
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                            value={bankDetails.accountType} onChange={(e) => setBankDetails({...bankDetails, accountType: e.target.value})}
                                                        >
                                                            <option>Checking</option>
                                                            <option>Savings</option>
                                                            <option>Current</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-slate-400 ml-1">Routing Number</label>
                                                        <input 
                                                            type="text" placeholder="9 digits"
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                            value={bankDetails.routingNumber} onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-slate-400 ml-1">SWIFT Code</label>
                                                        <input 
                                                            type="text" placeholder="Optional"
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                            value={bankDetails.swiftCode} onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Wire Specifics */}
                                        {transferType === 'WIRE' && (
                                            <>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 ml-1">IBAN</label>
                                                    <input 
                                                        type="text" placeholder="International Bank Account Number"
                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500 uppercase"
                                                        value={bankDetails.iban} onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                     <div className="space-y-1">
                                                        <label className="text-xs font-bold text-slate-400 ml-1">SWIFT / BIC</label>
                                                        <input 
                                                            type="text" placeholder="8 or 11 characters"
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500 uppercase"
                                                            value={bankDetails.swiftCode} onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-slate-400 ml-1">Bank Name</label>
                                                        <input 
                                                            type="text" placeholder="Beneficiary Bank"
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                            value={bankDetails.bankName} onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 ml-1">Bank Address</label>
                                                    <input 
                                                        type="text" placeholder="Full Bank Branch Address"
                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                        value={bankDetails.bankAddress} onChange={(e) => setBankDetails({...bankDetails, bankAddress: e.target.value})}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* --- CRYPTO & APPS --- */}
                            {['CRYPTO', ...MAIN_APPS.map(a=>a.id), ...MORE_APPS.map(a=>a.id)].includes(transferType) && (
                                <div className="space-y-4">
                                     {transferType === 'CRYPTO' && (
                                         <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 ml-1">Select Asset</label>
                                            <div className="relative">
                                                <select 
                                                    value={asset} onChange={(e) => setAsset(e.target.value)} 
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold appearance-none outline-none focus:border-blue-500"
                                                >
                                                    {ASSETS.map(a => <option key={a.code} value={a.code}>{a.name} ({a.code})</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
                                            </div>
                                         </div>
                                     )}
                                     <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 ml-1">
                                            {transferType === 'CRYPTO' ? 'Wallet Address' : 
                                             transferType === 'PAYPAL' ? 'PayPal Email' :
                                             transferType === 'CASHAPP' ? '$Cashtag' : 'Recipient ID'}
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={walletAddress}
                                                onChange={(e) => setWalletAddress(e.target.value)}
                                                className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"
                                                placeholder="Enter destination..."
                                            />
                                            <ScanLine className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                                        </div>
                                     </div>
                                </div>
                            )}

                            {/* Continue Button */}
                            <button 
                                onClick={() => setStep(2)}
                                disabled={!amount || isBalanceLow || (transferType === 'INTERNAL' && !recipient)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition disabled:opacity-50 disabled:shadow-none mt-4"
                            >
                                Review Payment
                            </button>
                        </div>
                    </div>
                )}

                {/* === STEP 2: PIN CONFIRMATION === */}
                {step === 2 && (
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in duration-300">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Confirm Transaction</h2>
                        
                        <div className="bg-slate-50 p-4 rounded-xl mb-6 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Method</span>
                                <span className="font-bold">{transferType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Amount</span>
                                <span className="font-bold text-lg text-slate-900">
                                    {transferType === 'CRYPTO' ? '' : '$'}{amount} {transferType === 'CRYPTO' ? asset : ''}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                                <span className="text-slate-500">Total Debit</span>
                                <span className="font-bold text-red-500">
                                    {transferType === 'CRYPTO' ? '' : '$'}{amount}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-center text-xs font-bold text-slate-400 uppercase mb-3">Enter Security PIN</label>
                            <input 
                                type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)}
                                className="w-full text-center text-3xl font-bold tracking-[0.5em] p-4 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none transition"
                                placeholder="••••"
                            />
                        </div>

                        {submitError && <div className="text-center text-red-500 text-sm font-bold mb-4 bg-red-50 p-2 rounded-lg">{submitError}</div>}

                        <button 
                            onClick={handleTransfer}
                            disabled={isSubmitting || pin.length < 4}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> Confirm & Send</>}
                        </button>
                    </div>
                )}

                {/* === STEP 3: SUCCESS === */}
                {step === 3 && (
                    <div className="text-center animate-in zoom-in duration-500 pt-10">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Success!</h2>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                            Your <strong>{transferType === 'CRYPTO' ? '' : '$'}{amount}</strong> transfer has been processed successfully.
                        </p>
                        <button onClick={() => { setStep(0); setAmount(''); setPin(''); setRecipient(null); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition">
                            Make Another Transfer
                        </button>
                        <Link href="/dashboard" className="block mt-4 text-sm font-bold text-blue-600 hover:underline">
                            Return to Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}