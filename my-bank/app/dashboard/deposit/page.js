"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, CheckCircle, ChevronRight, Loader2, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from "react-qr-code"; // ✅ Import the QR Library

export default function DepositPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // --- STEPS STATE ---
  const [step, setStep] = useState(1); 

  // --- FORM DATA ---
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [amount, setAmount] = useState('');
  
  // --- UI STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- CRYPTO CONFIGURATION ---
  const cryptoOptions = [
    { 
        id: 'usdt', 
        name: 'Tether', 
        symbol: 'USDT', 
        color: 'bg-green-100 text-green-600',
        networks: [
            { name: 'Ethereum (ERC-20)', id: 'erc20', type: 'EVM' }, 
            { name: 'BNB Smart Chain (BEP-20)', id: 'bep20', type: 'EVM' }, 
            { name: 'Base Network', id: 'base', type: 'EVM' }, 
            { name: 'Solana (SPL)', id: 'spl', type: 'SOL' },
            { name: 'Tron (TRC-20)', id: 'trc20', type: 'TRON' } 
        ]
    },
    { 
        id: 'usdc', 
        name: 'USD Coin', 
        symbol: 'USDC', 
        color: 'bg-blue-100 text-blue-600',
        networks: [
            { name: 'Ethereum (ERC-20)', id: 'erc20', type: 'EVM' },
            { name: 'Base Network', id: 'base', type: 'EVM' }, 
            { name: 'Arbitrum One', id: 'arb', type: 'EVM' },
            { name: 'BNB Smart Chain (BEP-20)', id: 'bep20', type: 'EVM' },
            { name: 'Solana (SPL)', id: 'spl', type: 'SOL' }
        ]
    },
    { 
        id: 'eth', 
        name: 'Ethereum', 
        symbol: 'ETH', 
        color: 'bg-indigo-100 text-indigo-600',
        networks: [
            { name: 'Ethereum Mainnet', id: 'erc20', type: 'EVM' },
            { name: 'Base Network', id: 'base', type: 'EVM' },
            { name: 'Arbitrum One', id: 'arb', type: 'EVM' },
            { name: 'Optimism (OP Mainnet)', id: 'op', type: 'EVM' },
            { name: 'BNB Smart Chain', id: 'bep20', type: 'EVM' }
        ]
    },
    { 
        id: 'bnb', 
        name: 'BNB', 
        symbol: 'BNB', 
        color: 'bg-yellow-100 text-yellow-600',
        networks: [
            { name: 'BNB Smart Chain (BEP-20)', id: 'bep20', type: 'EVM' },
            { name: 'Ethereum Mainnet (ERC-20)', id: 'erc20', type: 'EVM' }
        ]
    },
    { 
        id: 'sol', 
        name: 'Solana', 
        symbol: 'SOL', 
        color: 'bg-purple-100 text-purple-600',
        networks: [
            { name: 'Solana', id: 'sol', type: 'SOL' }
        ]
    },
    { 
        id: 'btc', 
        name: 'Bitcoin', 
        symbol: 'BTC', 
        color: 'bg-orange-100 text-orange-600',
        networks: [
            { name: 'Bitcoin Network', id: 'btc', type: 'BTC' }
        ]
    },
    {
        id: 'trx',
        name: 'Tron',
        symbol: 'TRX',
        color: 'bg-red-100 text-red-600',
        networks: [
            { name: 'Tron (TRC-20)', id: 'trc20', type: 'TRON' }
        ]
    }
  ];

  // --- AUTH CHECK ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/login');
    }
  }, [router]);

  // --- MASTER AUTO-WATCHER (POLLING) ---
  useEffect(() => {
    let interval;
    if (step === 4 && !success && selectedNetwork?.id !== 'trc20' && user) {
        interval = setInterval(async () => {
            try {
                const res = await fetch('/api/deposit/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: user.email,
                        networkId: selectedNetwork.id 
                    })
                });
                
                const data = await res.json();
                
                if (data.newDeposit) {
                    clearInterval(interval);
                    setSuccess(true);
                    const updatedUser = { ...user, balance: (user.balance || 0) + data.amount };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setTimeout(() => router.push('/dashboard'), 3000);
                }
            } catch (err) {
                console.error("Polling...", err);
            }
        }, 5000); 
    }
    return () => clearInterval(interval);
  }, [step, selectedNetwork, success, user, router]);


  // --- HANDLERS ---
  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    if (coin.networks.length === 1) {
        setSelectedNetwork(coin.networks[0]);
        setStep(3); 
    } else {
        setStep(2); 
    }
  };

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setStep(3);
  };

  // --- SMART ADDRESS LOGIC ---
  const getDepositAddress = () => {
    if (!selectedNetwork || !user) return 'Loading...';

    if (selectedNetwork.type === 'EVM') return user.ethAddress || 'Generating Address...';
    if (selectedNetwork.type === 'BTC') return user.btcAddress || 'Generating Address...';
    if (selectedNetwork.type === 'SOL') return user.solAddress || 'Generating Address...';
    if (selectedNetwork.type === 'TRON') return user.trxAddress || 'Generating Address...';

    return "Address unavailable";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getDepositAddress());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- MANUAL SUBMIT ---
  const handleDeposit = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: user.email, 
            amount: parseFloat(amount) 
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2500);
      } else {
        alert("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      alert("Connection error.");
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
             <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 transition">
                <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to Dashboard</span>
             </Link>
             <h1 className="text-lg font-bold text-slate-800">Deposit Funds</h1>
             <div className="w-8"></div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                
                {/* PROGRESS BAR */}
                {!success && (
                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span className={step >= 1 ? 'text-blue-600' : ''}>1. Coin</span>
                        <span className={step >= 2 ? 'text-blue-600' : ''}>2. Network</span>
                        <span className={step >= 3 ? 'text-blue-600' : ''}>3. Amount</span>
                        <span className={step >= 4 ? 'text-blue-600' : ''}>4. Pay</span>
                    </div>
                )}

                {/* --- STEP 1: SELECT COIN --- */}
                {step === 1 && (
                    <div className="p-8 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">Select Asset</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {cryptoOptions.map((coin) => (
                                <button 
                                    key={coin.id}
                                    onClick={() => handleCoinSelect(coin)}
                                    className="p-4 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center gap-3 group"
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${coin.color} font-bold text-lg group-hover:scale-110 transition`}>
                                        {coin.symbol[0]}
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-slate-900">{coin.name}</span>
                                        <span className="block text-xs text-slate-500">{coin.symbol}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- STEP 2: SELECT NETWORK --- */}
                {step === 2 && selectedCoin && (
                    <div className="p-8 animate-in fade-in slide-in-from-right-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2 text-center">Select Network</h2>
                        <p className="text-slate-500 text-center mb-8 text-sm">Which network are you sending <strong>{selectedCoin.symbol}</strong> on?</p>
                        
                        <div className="space-y-3">
                            {selectedCoin.networks.map((net) => (
                                <button 
                                    key={net.id}
                                    onClick={() => handleNetworkSelect(net)}
                                    className="w-full p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition flex items-center justify-between group text-left"
                                >
                                    <div>
                                        <span className="block font-bold text-slate-900">{net.name}</span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">{net.type === 'EVM' ? 'Instant Confirmation' : 'Standard Confirmation'}</span>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-blue-600" />
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} className="mt-8 w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-800">Go Back</button>
                    </div>
                )}

                {/* --- STEP 3: AMOUNT --- */}
                {step === 3 && (
                    <div className="p-8 animate-in fade-in slide-in-from-right-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">Deposit Amount</h2>
                        
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount (USD)</label>
                            <div className="relative">
                                <span className="absolute left-0 top-1 text-3xl font-bold text-slate-400">$</span>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-transparent text-4xl font-bold text-slate-900 outline-none pl-6"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button 
                            onClick={() => setStep(4)}
                            disabled={!amount || amount <= 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                        <button onClick={() => setStep(selectedCoin.networks.length > 1 ? 2 : 1)} className="mt-4 w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-800">Go Back</button>
                    </div>
                )}

                {/* --- STEP 4: QR & PAYMENT (UPDATED) --- */}
                {step === 4 && !success && (
                    <div className="p-8 animate-in fade-in slide-in-from-right-4 text-center">
                        <div className="mb-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Send Payment</p>
                            <h2 className="text-3xl font-extrabold text-slate-900">${amount}</h2>
                            <div className="inline-flex items-center gap-1 mt-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                {selectedCoin.symbol} on {selectedNetwork.name}
                            </div>
                        </div>

                        {/* ✅ REAL SCANABLE QR CODE */}
                        <div className="flex justify-center mb-8">
                            <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                                <QRCode 
                                    value={getDepositAddress()} 
                                    size={160} 
                                    className="h-auto w-full max-w-[160px]"
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>

                        <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Wallet Address</label>
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="font-mono text-sm font-bold text-slate-800 break-all">{getDepositAddress()}</p>
                                <button onClick={handleCopy} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500">
                                    {copied ? <CheckCircle size={18} className="text-green-600"/> : <Copy size={18}/>}
                                </button>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3 text-left mb-8">
                            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                {selectedNetwork.type === 'TRON' 
                                    ? <span><strong>Note:</strong> Tron deposits are <strong>manually reviewed</strong>. Please click the button below once sent.</span>
                                    : <span>This transaction will <strong>automatically confirm</strong> once detected on the {selectedNetwork.name} blockchain.</span>
                                }
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep(3)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
                            
                            <button 
                                onClick={handleDeposit} 
                                disabled={isLoading}
                                className="flex-[2] bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : 'I Have Sent Funds'}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- SUCCESS --- */}
                {success && (
                    <div className="p-12 text-center animate-in zoom-in fade-in">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Deposit Successful!</h2>
                        <p className="text-slate-500 mb-8">Your funds have been received and credited to your account.</p>
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400">
                            <Loader2 className="animate-spin" size={16} /> Redirecting to Dashboard...
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
}