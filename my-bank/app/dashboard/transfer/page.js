"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, CheckCircle, User, ArrowRight, 
  Loader2, ShieldCheck, AlertCircle, ChevronDown 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TransferPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('USDT'); 
  const [pin, setPin] = useState('');
  
  const [assetBalances, setAssetBalances] = useState({
    USDT: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, BNB: 0
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 1. Load User & Fetch Transactions
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        
        const currentUser = JSON.parse(stored);
        setUser(currentUser);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email })
            });
            if (res.ok) {
                const txs = await res.json();
                calculateBalances(txs);
            }
        } catch (e) { console.error("Balance Sync Failed", e); }
    };
    init();
  }, [router]);

  // ✅ FIXED LOGIC: Now matches Dashboard exactly (Base = ETH)
  const calculateBalances = (txs) => {
    const balances = { 
        USDT: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, BNB: 0 
    };

    txs.forEach(tx => {
        if (tx.status === 'APPROVED') {
            const method = tx.method ? tx.method.toUpperCase() : '';
            
            // Default to USDT if generic
            let key = 'USDT'; 

            // ✅ Same Keyword Logic as Dashboard
            if (method.includes('ETH') || method.includes('ERC20') || method.includes('BASE')) key = 'ETH';
            else if (method.includes('BTC') || method.includes('BITCOIN')) key = 'BTC';
            else if (method.includes('TRX') || method.includes('TRON')) key = 'TRX';
            else if (method.includes('SOL')) key = 'SOL';
            else if (method.includes('BNB') || method.includes('BSC')) key = 'BNB';
            // else remains USDT

            if (tx.type === 'DEPOSIT') {
                balances[key] += tx.amount;
            } else if (tx.type === 'TRANSFER' || tx.type === 'WITHDRAW') {
                balances[key] -= tx.amount;
            }
        }
    });

    Object.keys(balances).forEach(k => { if(balances[k] < 0) balances[k] = 0; });
    setAssetBalances(balances);
  };

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
            if (data.recipient.email === user.email) {
                setSearchError("You cannot send money to yourself.");
            } else {
                setRecipient(data.recipient);
            }
        } else {
            setSearchError("User not found. Check the Email or ID.");
        }
    } catch (err) {
        setSearchError("Connection failed.");
    } finally {
        setIsSearching(false);
    }
  };

  const handleTransfer = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
        const res = await fetch('/api/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                senderEmail: user.email,
                recipientId: recipient.id,
                amount, 
                asset, 
                pin 
            })
        });
        const data = await res.json();
        if (res.ok) {
            const updatedUser = { ...user, balance: user.balance - parseFloat(amount) };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            setAssetBalances(prev => ({
                ...prev,
                [asset]: Math.max(0, prev[asset] - parseFloat(amount))
            }));
            setStep(4); 
        } else {
            setSubmitError(data.message);
        }
    } catch (err) {
        setSubmitError("Transfer failed. Try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!user) return null;
  
  // Calculate current available for selected asset
  const currentAssetBalance = assetBalances[asset] || 0;

  const ASSET_OPTIONS = [
    { code: 'USDT', name: 'Tether (USDT)' },
    { code: 'BTC', name: 'Bitcoin (BTC)' },
    { code: 'ETH', name: 'Ethereum (ETH)' },
    { code: 'SOL', name: 'Solana (SOL)' },
    { code: 'TRX', name: 'Tron (TRX)' },
    { code: 'BNB', name: 'BNB Smart Chain' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center gap-4">
             <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
                <ArrowLeft size={20} />
             </Link>
             <h1 className="font-bold text-lg">Send Money</h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                            <h2 className="text-2xl font-bold mb-2">Who are you sending to?</h2>
                            <p className="text-slate-500 text-sm mb-6">Enter an Email Address or Finora ID.</p>
                            
                            <form onSubmit={handleSearch} className="relative mb-6">
                                <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    required
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setRecipient(null); setSearchError(''); }}
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="Email or User ID"
                                />
                                <button 
                                    type="submit"
                                    disabled={isSearching || !searchQuery}
                                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-bold transition disabled:opacity-50"
                                >
                                    {isSearching ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                </button>
                            </form>
                            {searchError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2 mb-4 animate-in shake">
                                    <AlertCircle size={16}/> {searchError}
                                </div>
                            )}
                            {recipient && (
                                <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-200 text-green-700 rounded-full flex items-center justify-center font-bold">
                                            {recipient.firstName[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{recipient.firstName} {recipient.lastName}</p>
                                            <p className="text-xs text-slate-500">{recipient.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(2)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition">
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && recipient && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                            <div className="mb-6 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400 mb-2">
                                    {recipient.firstName[0]}
                                </div>
                                <p className="text-slate-500 font-bold">Sending to {recipient.firstName}</p>
                            </div>

                            <div className="mb-6 text-left">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Asset</label>
                                <div className="relative">
                                    <select 
                                        value={asset} 
                                        onChange={(e) => setAsset(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {ASSET_OPTIONS.map(opt => (
                                            <option key={opt.code} value={opt.code}>
                                                {opt.name} — ${assetBalances[opt.code]?.toLocaleString() || '0'} Available
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount (USD Value)</label>
                                <div className="relative flex justify-center items-center mt-2">
                                    <span className="text-4xl font-bold text-slate-300 mr-2">$</span>
                                    <input 
                                        type="number" 
                                        autoFocus
                                        min="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-48 text-5xl font-bold text-slate-900 text-center outline-none border-b-2 border-slate-100 focus:border-blue-500 bg-transparent py-2"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 font-bold">
                                    Available {asset}: <span className="text-slate-900">${currentAssetBalance.toLocaleString()}</span>
                                </p>
                            </div>

                            <button 
                                onClick={() => setStep(3)}
                                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentAssetBalance}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition disabled:opacity-50"
                            >
                                Review Payment
                            </button>
                            <button onClick={() => setStep(1)} className="mt-4 text-slate-400 font-bold text-sm hover:text-slate-600">Cancel</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Confirm Transfer</h2>
                            <div className="bg-slate-50 p-4 rounded-xl mb-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Recipient</span>
                                    <span className="font-bold text-slate-900">{recipient.firstName} {recipient.lastName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Asset</span>
                                    <span className="font-bold text-slate-900">{asset}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Amount</span>
                                    <span className="font-bold text-slate-900 text-lg">${amount}</span>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-center text-xs font-bold text-slate-400 uppercase mb-3">Enter Security PIN</label>
                                <input 
                                    type="password" 
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full text-center text-3xl font-bold tracking-[0.5em] p-4 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none transition"
                                    placeholder="••••"
                                />
                            </div>
                            {submitError && (
                                <div className="text-center text-red-500 text-sm font-bold mb-4">{submitError}</div>
                            )}
                            <button 
                                onClick={handleTransfer}
                                disabled={isSubmitting || pin.length < 4}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> Confirm & Send</>}
                            </button>
                            <button onClick={() => setStep(2)} className="mt-4 w-full text-slate-400 font-bold text-sm hover:text-slate-600">Back</button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Success!</h2>
                        <p className="text-slate-500 mb-8">You sent <strong>${amount} ({asset})</strong> to <strong>{recipient.firstName}</strong>.</p>
                        <div className="space-y-3">
                            <button onClick={() => { setStep(1); setAmount(''); setPin(''); setRecipient(null); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition">
                                Send Another
                            </button>
                            <Link href="/dashboard" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}