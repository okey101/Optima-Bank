"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Shield, Activity, Search, 
  ChevronRight, Lock, Keypad, LogOut, CheckCircle, XCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // --- DASHBOARD DATA STATE ---
  const [stats, setStats] = useState({ users: 0, pendingDeposits: 0, pendingKyc: 0 });
  const [loading, setLoading] = useState(false);

  // --- 1. PIN VERIFICATION LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '194759') {
      setIsAuthenticated(true);
      fetchDashboardData(); // Load data only after login
    } else {
      setError('Incorrect Access Code');
      setPin('');
    }
  };

  // --- 2. FETCH REAL ADMIN DATA ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ Connect to the new API you created
      const res = await fetch('/api/admin/stats'); 
      
      if (res.ok) {
        const data = await res.json();
        setStats({
          users: data.users || 0,           // Real User Count
          pendingKyc: data.pendingKyc || 0, // Real KYC Count
          pendingDeposits: 0                // Still dummy (we will build this next)
        });
      } else {
        console.error("Failed to fetch stats");
      }

    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 🔒 LOCK SCREEN UI ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-slate-900" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Access</h1>
          <p className="text-slate-500 mb-6 text-sm">Enter the 6-digit security PIN to continue.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              placeholder="000000"
              maxLength={6}
              className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-b-2 border-slate-200 focus:border-blue-600 outline-none transition text-slate-900 placeholder:text-slate-200"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs font-bold animate-pulse">{error}</p>}
            
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 🔓 MAIN DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8 text-slate-900">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
           <p className="text-slate-500">Overview of system activity.</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition">
            <LogOut size={18} /> Lock
        </button>
      </div>

      {/* QUICK STATS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* USERS CARD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase">Total Users</p>
                    <h3 className="text-2xl font-bold">
                        {loading ? '...' : stats.users}
                    </h3> 
                </div>
            </div>
            <Link href="/admin/users" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Manage Users <ChevronRight size={16} />
            </Link>
        </div>

        {/* KYC CARD (Active Link) */}
        <Link href="/admin/kyc" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <Shield size={24} />
                </div>
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase">KYC Requests</p>
                    <h3 className="text-2xl font-bold">{loading ? '...' : stats.pendingKyc}</h3>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-purple-600 text-sm font-bold flex items-center gap-1">
                    Review Pending <ChevronRight size={16} />
                </span>
                {stats.pendingKyc > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {stats.pendingKyc} New
                    </span>
                )}
            </div>
        </Link>

        {/* DEPOSITS CARD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase">Pending Deposits</p>
                    <h3 className="text-2xl font-bold">{stats.pendingDeposits}</h3> 
                </div>
            </div>
            <button className="text-green-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                View Transactions <ChevronRight size={16} />
            </button>
        </div>

      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <h3 className="font-bold text-slate-900 mb-6">Recent System Activity</h3>
          
          <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <CheckCircle size={20} />
                      </div>
                      <div>
                          <p className="font-bold text-slate-900">System Online</p>
                          <p className="text-xs text-slate-500">Admin panel accessed successfully.</p>
                      </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Just now</span>
              </div>
          </div>
      </div>

    </div>
  );
}