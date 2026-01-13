"use client";

import React, { useState } from 'react';
import { 
  Search, Key, Copy, Check, Lock, ShieldAlert, 
  ChevronLeft, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard'; // ✅ Import Guard

export default function AdminKeysPage() {
  const [email, setEmail] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [keys, setKeys] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const handleFetchKeys = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setKeys(null);

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, adminSecret })
      });

      const data = await res.json();

      if (res.ok) {
        setKeys(data.keys);
      } else {
        setError(data.message || "Failed to fetch keys");
      }
    } catch (err) {
      setError("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
        
        {/* HEADER */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link href="/admin" className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
             <ChevronLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <Key className="text-blue-600" /> Wallet Manager
              </h1>
              <p className="text-slate-500 mt-1">Retrieve private keys for user wallet recovery.</p>
            </div>
          </div>
        </div>

        {/* SEARCH FORM */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-8">
          <form onSubmit={handleFetchKeys} className="space-y-6">
              
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">User Email</label>
                  <div className="relative">
                      <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                      <input 
                          type="email" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="user@example.com"
                      />
                  </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Admin Secret</label>
                  <div className="relative">
                      <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                      <input 
                          type="password" 
                          required 
                          value={adminSecret}
                          onChange={(e) => setAdminSecret(e.target.value)}
                          className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter admin code"
                      />
                  </div>
              </div>

              {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold">
                      <ShieldAlert size={20} /> {error}
                  </div>
              )}

              <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
              >
                  {loading ? <Loader2 className="animate-spin" /> : 'Reveal Private Keys'}
              </button>
          </form>
        </div>

        {/* KEYS DISPLAY */}
        {keys && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
              
              {/* ETHEREUM / EVM */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-slate-800">Ethereum / EVM Key</h3>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold">ETH, BNB, BASE</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl font-mono text-xs break-all text-slate-600 border border-slate-100 mb-4">
                      {keys.eth}
                  </div>
                  <button 
                      onClick={() => copyToClipboard(keys.eth, 'eth')}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                  >
                      {copied === 'eth' ? <Check size={16}/> : <Copy size={16}/>} 
                      {copied === 'eth' ? 'Copied!' : 'Copy Key'}
                  </button>
              </div>

              {/* BITCOIN */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-slate-800">Bitcoin Key (WIF)</h3>
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-bold">BTC Legacy</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl font-mono text-xs break-all text-slate-600 border border-slate-100 mb-4">
                      {keys.btc}
                  </div>
                  <button 
                      onClick={() => copyToClipboard(keys.btc, 'btc')}
                      className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                  >
                      {copied === 'btc' ? <Check size={16}/> : <Copy size={16}/>} 
                      {copied === 'btc' ? 'Copied!' : 'Copy Key'}
                  </button>
              </div>

              {/* SOLANA */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-slate-800">Solana Secret Key</h3>
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-md font-bold">SOL Array</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl font-mono text-xs break-all text-slate-600 border border-slate-100 mb-4 max-h-24 overflow-y-auto">
                      {keys.sol}
                  </div>
                  <button 
                      onClick={() => copyToClipboard(keys.sol, 'sol')}
                      className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                  >
                      {copied === 'sol' ? <Check size={16}/> : <Copy size={16}/>} 
                      {copied === 'sol' ? 'Copied!' : 'Copy Key'}
                  </button>
              </div>

              {/* TRON */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-slate-800">Tron Private Key</h3>
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-md font-bold">TRX / TRC-20</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl font-mono text-xs break-all text-slate-600 border border-slate-100 mb-4">
                      {keys.trx}
                  </div>
                  <button 
                      onClick={() => copyToClipboard(keys.trx, 'trx')}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                  >
                      {copied === 'trx' ? <Check size={16}/> : <Copy size={16}/>} 
                      {copied === 'trx' ? 'Copied!' : 'Copy Key'}
                  </button>
              </div>

          </div>
        )}
      </div>
    </AdminGuard>
  );
}