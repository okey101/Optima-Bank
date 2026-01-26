"use client";

import React, { useState, useEffect } from 'react';
import { 
  Wallet, Copy, CheckCircle, ArrowRight, 
  Loader2, AlertCircle, QrCode 
} from 'lucide-react';

export default function DepositPage() {
  const [selectedCoin, setSelectedCoin] = useState('BTC'); // Default
  const [amount, setAmount] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, SUCCESS, ERROR

  // 1. Fetch User Data (To get Wallet Addresses)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/status'); // Or your profile endpoint
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 2. Handle Manual USDT Deposit Submit
  const handleUsdtSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: parseFloat(amount),
          coin: 'USDT' // You might want to track this in your DB too
        })
      });

      if (res.ok) {
        setStatus('SUCCESS');
        setAmount('');
      } else {
        setStatus('ERROR');
      }
    } catch (error) {
      setStatus('ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Get Address based on selection
  const getAddress = () => {
    if (!user) return 'Loading...';
    switch (selectedCoin) {
      case 'BTC': return user.btcAddress || 'Not generated';
      case 'ETH': return user.ethAddress || 'Not generated';
      case 'SOL': return user.solAddress || 'Not generated';
      case 'USDT': return user.ethAddress || 'Not generated'; // USDT typically uses ETH or TRC20 address
      default: return '...';
    }
  };

  // Helper: Copy to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getAddress());
    alert("Address copied!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Deposit Crypto</h1>
        <p className="text-slate-500">Select a currency to view your deposit address.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 1. COIN SELECTOR */}
        <div className="md:col-span-1 space-y-3">
          {['BTC', 'ETH', 'SOL', 'USDT'].map((coin) => (
            <button
              key={coin}
              onClick={() => { setSelectedCoin(coin); setStatus('IDLE'); }}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${
                selectedCoin === coin 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  selectedCoin === coin ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {coin[0]}
                </div>
                <span className="font-bold">{coin}</span>
              </div>
              {selectedCoin === coin && <CheckCircle size={18} />}
            </button>
          ))}
        </div>

        {/* 2. DEPOSIT AREA */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            
            {/* Address Display (Always Shown) */}
            <div className="mb-8 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Your {selectedCoin} Deposit Address
              </p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 group hover:border-blue-300 transition cursor-pointer" onClick={copyToClipboard}>
                <QrCode size={64} className="text-slate-800 opacity-80" />
                <p className="font-mono text-sm md:text-base text-slate-600 break-all max-w-[80%]">
                  {getAddress()}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">
                  <Copy size={12} /> Click to Copy
                </div>
              </div>
            </div>

            {/* --- LOGIC SPLIT --- */}

            {selectedCoin === 'USDT' ? (
              /* --- USDT FLOW (Manual Input) --- */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6 flex gap-3">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> USDT deposits require manual verification. 
                    Please enter the amount below <strong>after</strong> you have sent the funds.
                  </p>
                </div>

                {status === 'SUCCESS' ? (
                   <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
                      <CheckCircle className="mx-auto mb-2" size={32} />
                      <h3 className="font-bold text-lg">Request Submitted!</h3>
                      <p className="text-sm">Admin will review and credit your balance shortly.</p>
                      <button onClick={() => setStatus('IDLE')} className="mt-4 text-sm underline font-bold">Deposit More</button>
                   </div>
                ) : (
                  <form onSubmit={handleUsdtSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Amount Sent (USDT)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input 
                          type="number" 
                          required
                          step="0.01"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Deposit Request'}
                    </button>
                  </form>
                )}
              </div>

            ) : (
              /* --- BTC/ETH/SOL FLOW (Automatic) --- */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-blue-600" size={16} />
                    </div>
                    <p className="text-sm font-medium">
                      Waiting for network confirmation...
                    </p>
                    <p className="text-xs text-blue-600/70">
                      Your balance will update automatically once the transaction is confirmed on the blockchain.
                    </p>
                 </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}