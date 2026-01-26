"use client";

import React, { useState, useEffect } from 'react';
import { 
  Copy, CheckCircle, Loader2, AlertCircle, 
  ArrowDownLeft, ArrowUpRight, History 
} from 'lucide-react';
import Link from 'next/link';

export default function DepositPage() {
  const [selectedCoin, setSelectedCoin] = useState('BTC'); 
  const [amount, setAmount] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, SUCCESS, ERROR

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/status'); 
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
          coin: 'USDT' 
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
    if (!user) return '';
    switch (selectedCoin) {
      case 'BTC': return user.btcAddress || 'Generate a BTC Address first';
      case 'ETH': return user.ethAddress || 'Generate an ETH Address first';
      case 'SOL': return user.solAddress || 'Generate a SOL Address first';
      case 'USDT': return user.ethAddress || 'Generate an ETH Address first'; // USDT (ERC20)
      default: return '';
    }
  };

  // Helper: Copy to Clipboard
  const copyToClipboard = () => {
    const addr = getAddress();
    if (addr) {
      navigator.clipboard.writeText(addr);
      alert("Address copied!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      
      {/* --- 1. RESTORED NAV BAR --- */}
      <div className="flex items-center gap-6 border-b border-slate-200 mb-8 pb-1">
        <button className="flex items-center gap-2 px-2 py-3 border-b-2 border-blue-600 text-blue-600 font-bold">
          <ArrowDownLeft size={18} /> Deposit
        </button>
        <Link href="/dashboard/withdraw" className="flex items-center gap-2 px-2 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium transition">
          <ArrowUpRight size={18} /> Withdraw
        </Link>
        <Link href="/dashboard/transactions" className="flex items-center gap-2 px-2 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium transition">
          <History size={18} /> History
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- 2. COIN SELECTOR (Left Column) --- */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-bold text-slate-900 mb-4">Select Asset</h3>
          {['BTC', 'ETH', 'SOL', 'USDT'].map((coin) => (
            <button
              key={coin}
              onClick={() => { setSelectedCoin(coin); setStatus('IDLE'); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition ${
                selectedCoin === coin 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  selectedCoin === coin ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {coin[0]}
                </div>
                <div className="text-left">
                  <span className="block font-bold">{coin}</span>
                  <span className={`text-xs ${selectedCoin === coin ? 'text-slate-300' : 'text-slate-400'}`}>
                    {coin === 'USDT' ? 'Tether' : coin === 'BTC' ? 'Bitcoin' : coin}
                  </span>
                </div>
              </div>
              {selectedCoin === coin && <CheckCircle size={20} className="text-blue-400" />}
            </button>
          ))}
        </div>

        {/* --- 3. DEPOSIT AREA (Right Column) --- */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />

            <h2 className="text-xl font-bold text-slate-900 mb-2">Deposit {selectedCoin}</h2>
            <p className="text-slate-500 text-sm mb-8">
              Scan the QR code or copy the address below to deposit funds.
            </p>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              
              {/* --- REAL QR CODE --- */}
              <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 shadow-sm shrink-0">
                 {/* Using a reliable API to generate the QR Code image */}
                 <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${getAddress()}`} 
                    alt="Wallet QR"
                    className="w-40 h-40 object-contain mix-blend-multiply opacity-90"
                 />
              </div>

              <div className="flex-1 w-full space-y-6">
                
                {/* --- WALLET ADDRESS DISPLAY --- */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Your {selectedCoin} Address
                  </label>
                  <div 
                    onClick={copyToClipboard}
                    className="group bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl p-4 flex items-center justify-between cursor-pointer transition"
                  >
                    <p className="font-mono text-sm text-slate-600 break-all pr-4">
                      {getAddress()}
                    </p>
                    <Copy size={18} className="text-slate-400 group-hover:text-blue-600" />
                  </div>
                </div>

                {/* --- USDT MANUAL FORM (Conditional) --- */}
                {selectedCoin === 'USDT' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pt-4 border-t border-slate-100">
                     
                     <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6 flex gap-3">
                        <AlertCircle className="text-amber-600 shrink-0" size={20} />
                        <div className="text-sm text-amber-900">
                          <strong className="block mb-1">Manual Verification Required</strong>
                          Since this is a USDT deposit, please enter the amount you sent below so we can track and approve it.
                        </div>
                     </div>

                     {status === 'SUCCESS' ? (
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
                            <CheckCircle size={24} />
                            <div>
                                <h4 className="font-bold">Deposit Request Sent</h4>
                                <p className="text-xs">Your balance will update once Admin approves.</p>
                            </div>
                        </div>
                     ) : (
                        <form onSubmit={handleUsdtSubmit} className="flex gap-4">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input 
                                  type="number" 
                                  required
                                  step="0.01"
                                  placeholder="0.00"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900"
                                />
                            </div>
                            <button 
                              type="submit" 
                              disabled={submitting}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 rounded-xl transition disabled:opacity-50 whitespace-nowrap"
                            >
                              {submitting ? 'Sending...' : 'Confirm'}
                            </button>
                        </form>
                     )}
                  </div>
                )}

                {/* --- AUTO MESSAGE (For Others) --- */}
                {selectedCoin !== 'USDT' && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
                    <Loader2 size={14} className="animate-spin" />
                    Waiting for blockchain confirmation...
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}