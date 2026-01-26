"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, DollarSign, Activity, 
  Bell, LogOut, Key, Landmark, FileText 
} from 'lucide-react';
import Link from 'next/link';
import AdminGuard from '../../components/AdminGuard'; 

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pendingKyc: 0, deposits: 0 });

  useEffect(() => {
    // You can fetch real stats here if you want
    setStats({ users: 12, pendingKyc: 3, deposits: 14500 });
  }, []);

  return (
    <AdminGuard>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
            
            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full overflow-y-auto">
                <div className="h-24 flex items-center justify-center border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white tracking-wider">ADMIN<span className="text-blue-500">PANEL</span></h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold">
                        <Activity size={20}/> Dashboard
                    </Link>
                    
                    {/* ✅ NEW: Deposits Link */}
                    <Link href="/admin/deposits" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition">
                        <DollarSign size={20}/> Deposits
                    </Link>

                    <Link href="/admin/kyc" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition">
                        <ShieldCheck size={20}/> KYC Requests
                    </Link>
                    <Link href="/admin/loans" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition">
                        <Landmark size={20}/> Loan Requests
                    </Link>
                    <Link href="/admin/tax" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition">
                        <FileText size={20}/> Tax Requests
                    </Link>
                    <Link href="/admin/keys" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition">
                        <Key size={20}/> Wallet Keys
                    </Link>
                    <div className="pt-8 pb-8">
                        <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-xl transition w-full">
                            <LogOut size={20}/> Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                        <p className="text-slate-500 text-sm">Welcome back, Admin.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition text-slate-600"><Bell size={20}/></button>
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">A</div>
                    </div>
                </header>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={28}/></div>
                        <div>
                            <p className="text-slate-500 text-sm font-bold">Total Users</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.users}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><ShieldCheck size={28}/></div>
                        <div>
                            <p className="text-slate-500 text-sm font-bold">Pending KYC</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.pendingKyc}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><DollarSign size={28}/></div>
                        <div>
                            <p className="text-slate-500 text-sm font-bold">Total Deposits</p>
                            <h3 className="text-2xl font-bold text-slate-900">${stats.deposits.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* ✅ NEW: Deposit Action */}
                    <Link href="/admin/deposits" className="p-6 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex flex-col items-center gap-2 text-center">
                        <DollarSign size={32} />
                        <span className="font-bold">Approve Deposits</span>
                    </Link>

                    <Link href="/admin/kyc" className="p-6 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex flex-col items-center gap-2 text-center">
                        <ShieldCheck size={32} />
                        <span className="font-bold">Review KYC</span>
                    </Link>

                    <Link href="/admin/loans" className="p-6 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex flex-col items-center gap-2 text-center">
                        <Landmark size={32} />
                        <span className="font-bold">Loan Requests</span>
                    </Link>

                    <Link href="/admin/tax" className="p-6 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 flex flex-col items-center gap-2 text-center">
                        <FileText size={32} />
                        <span className="font-bold">Tax Refunds</span>
                    </Link>
                </div>
            </main>
        </div>
    </AdminGuard>
  );
}