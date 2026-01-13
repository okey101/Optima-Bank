"use client";

import React, { useState, useEffect } from 'react';
// ✅ FIXED: Changed 'ShieldLock' to 'Lock'
import { Lock, Loader2 } from 'lucide-react';

export default function AdminGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/check-session');
        if (res.ok) {
            setIsAuthenticated(true);
        }
      } catch (e) {
        console.log("Not logged in");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setError("Invalid Access Code");
      }
    } catch (err) {
      setError("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {/* ✅ FIXED: Using Lock icon */}
                <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h1>
            <p className="text-slate-400 text-center mb-8">Enter your 6-digit security PIN to access the control panel.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
                <input 
                    type="password" 
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-center text-3xl tracking-[0.5em] font-bold p-4 rounded-xl outline-none focus:border-blue-500 transition"
                    placeholder="••••••"
                    autoFocus
                />
                
                {error && <div className="text-red-400 text-sm font-bold text-center">{error}</div>}
                
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20">
                    Unlock Dashboard
                </button>
            </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}