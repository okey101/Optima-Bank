"use client";

import React, { useState, useEffect } from 'react';
import { 
  Menu, Home, ArrowRightLeft, CreditCard, Settings, LogOut, Bell, 
  User, Shield, Mail, Phone, MapPin, Calendar, Copy, CheckCircle, 
  Camera, ChevronRight, Lock, Smartphone, Globe, Wallet
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  // --- FETCH USER ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100">
            <div className="relative w-40 h-12">
                <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left" priority />
            </div>
        </div>

        <nav className="p-6 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Main Menu</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <Home size={20} /> Dashboard
            </Link>
            <Link href="/dashboard/transactions" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <ArrowRightLeft size={20} /> Transactions
            </Link>
            <Link href="/dashboard/deposit" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <Wallet size={20} /> Deposit
            </Link>
            <Link href="/dashboard/cards" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <CreditCard size={20} /> My Cards
            </Link>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-3">Settings</p>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <Settings size={20} /> Settings
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition">
                <LogOut size={20} /> Logout
            </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50">
        
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 hidden md:block">My Profile</h1>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-6">
                <div className="relative pl-6 border-l border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-800 leading-none">{user.firstName} {user.lastName}</p>
                            <p className="text-[10px] text-slate-500 font-medium pt-1">Personal Account</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20 uppercase ring-2 ring-white">
                            {user.firstName[0]}
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* PROFILE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* --- 1. PROFILE HEADER CARD --- */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    
                    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-16">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 uppercase border border-slate-200">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md border-2 border-white">
                                <Camera size={16} />
                            </button>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-center md:text-left mb-2">
                            <h2 className="text-3xl font-bold text-slate-900">{user.firstName} {user.lastName}</h2>
                            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                                <Mail size={16} /> {user.email}
                            </p>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4 md:mb-2">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold text-sm border border-green-200">
                                <CheckCircle size={16} className="fill-current" />
                                Active Account
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- 2. LEFT COLUMN: ACCOUNT INFO --- */}
                    <div className="space-y-8">
                        {/* Account Details */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Wallet className="text-blue-600" size={20} /> Account Details
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-mono font-bold text-slate-800">{user.accountNumber}</p>
                                        <button onClick={() => handleCopy(user.accountNumber)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                                            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Type</p>
                                    <p className="text-slate-800 font-bold">Standard Savings</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Currency</p>
                                    <p className="text-slate-800 font-bold flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">🇺🇸</div>
                                        USD (United States Dollar)
                                    </p>
                                </div>
                            </div>
                        </div>

                         {/* Security Summary */}
                         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Shield className="text-blue-600" size={20} /> Security
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Lock size={18} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700">Change Password</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300" />
                                </div>
                                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Smartphone size={18} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700">2-Factor Auth</span>
                                    </div>
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Disabled</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- 3. RIGHT COLUMN: PERSONAL INFO FORM --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <User className="text-blue-600" size={20} /> Personal Information
                                </h3>
                                <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition">
                                    Edit Details
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                                    <input 
                                        type="text" 
                                        value={user.firstName} 
                                        readOnly 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={user.lastName} 
                                        readOnly 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <input 
                                            type="email" 
                                            value={user.email} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            value={user.phone || '+1 (555) 000-0000'} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Country */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Country</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            value={user.country || 'United States'} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Residential Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            value={user.address || '123 Banking Street, Finance City'} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            value={user.dob || '01 Jan 1990'} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </main>
    </div>
  );
}