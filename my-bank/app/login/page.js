"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Zap, Globe, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [showSimulation, setShowSimulation] = useState(true);
  const [loadingText, setLoadingText] = useState("Authenticating Secure Gateway...");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");

  // --- 1. OPENING SIMULATION LOGIC (Preserved) ---
  useEffect(() => {
    const timer1 = setTimeout(() => setLoadingText("Verifying Encryption Keys..."), 800);
    const timer2 = setTimeout(() => setLoadingText("Establishing Secure Connection..."), 1800);
    const timer3 = setTimeout(() => setShowSimulation(false), 2600); 

    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
    };
  }, []);

  // --- 2. REAL LOGIN HANDLER (Updated) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user and redirect
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- RENDER: LOADING SIMULATION SCREEN ---
  if (showSimulation) {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center font-sans">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-48 h-16 mb-8">
                    <Image src="/logo.png" alt="Finora Logo" fill className="object-contain" priority />
                </div>
                <div className="relative w-24 h-24 flex items-center justify-center mb-8">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                    <div className="absolute inset-2 bg-blue-500 rounded-full opacity-30 animate-pulse"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-xl">
                        <ShieldCheck className="text-blue-600" size={40} />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Finora Secure Gateway</h2>
                <p className="text-blue-600 font-medium animate-pulse">{loadingText}</p>
            </div>
        </div>
    );
  }

  // --- RENDER: MAIN SPLIT SCREEN ---
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row animate-fadeIn">
      
      {/* --- LEFT SIDE: MARKETING PANEL --- */}
      <div className="md:w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 relative hidden md:flex flex-col justify-between p-12 text-white overflow-hidden">
         {/* Abstract Circles */}
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>

         {/* Logo */}
         <div className="relative z-10 w-40 h-12">
            <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left invert brightness-0 grayscale opacity-100" />
         </div>

         {/* Center Content */}
         <div className="relative z-10 mt-8">
            <div className="bg-white/10 backdrop-blur-md inline-block px-4 py-1 rounded-full text-xs font-bold mb-6 border border-white/20">
                Finora Banking
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">Welcome Back</h1>
            <h2 className="text-2xl font-medium text-blue-100 mb-8">Finora</h2>
            
            <p className="text-blue-100 mb-10 leading-relaxed text-sm opacity-90 max-w-sm">
                Swift and secure money transfers worldwide. Experience banking reimagined.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <ShieldCheck className="mb-2 opacity-80" size={20} />
                    <p className="font-bold text-sm">Bank-Grade Security</p>
                    <p className="text-[10px] opacity-60">256-bit encryption</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <Zap className="mb-2 opacity-80" size={20} />
                    <p className="font-bold text-sm">Instant Transfers</p>
                    <p className="text-[10px] opacity-60">Real-time processing</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <Globe className="mb-2 opacity-80" size={20} />
                    <p className="font-bold text-sm">Global Reach</p>
                    <p className="text-[10px] opacity-60">200+ countries</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <Smartphone className="mb-2 opacity-80" size={20} />
                    <p className="font-bold text-sm">Mobile First</p>
                    <p className="text-[10px] opacity-60">iOS & Android</p>
                </div>
            </div>
         </div>

         {/* Footer */}
         <div className="relative z-10 text-xs text-blue-200 opacity-60 mt-auto">
            <p>© 2026 Finora Bank. All rights reserved.</p>
         </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="md:w-7/12 w-full bg-slate-50 flex flex-col items-center justify-center py-12 px-6 md:px-20 overflow-y-auto">
        
        {/* Mobile Logo (Visible on small screens) */}
        <div className="md:hidden w-full flex justify-center mb-8">
            <div className="relative w-40 h-10">
                <Image src="/logo.png" alt="Finora Logo" fill className="object-contain" priority />
            </div>
        </div>

        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
            
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
                <p className="text-slate-500 text-sm">Access your Finora account</p>
            </div>

            {/* Error Message UI */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Email Input */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email Address or Username</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition font-medium" 
                            placeholder="Enter your email address" 
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="block text-xs font-bold text-slate-700">Password</label>
                        <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot Password?</a>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition font-medium" 
                            placeholder="Enter your password" 
                        />
                    </div>
                </div>

                {/* Keep me signed in */}
                <div className="flex items-center">
                    <input type="checkbox" id="keep-signed-in" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                    <label htmlFor="keep-signed-in" className="ml-2 text-sm text-slate-600 cursor-pointer">Keep me signed in</label>
                </div>

                {/* Sign In Button */}
                <button 
                    type="submit" 
                    disabled={isLoggingIn}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition transform active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : "Sign In to Account"}
                </button>

            </form>

            {/* Divider */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-xs text-slate-400 uppercase tracking-wide font-semibold">New to Finora?</span>
                </div>
            </div>

            {/* Create Account Button */}
            <Link 
                href="/signup" 
                className="w-full block text-center py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition"
            >
                Create New Account
            </Link>

            {/* Bottom Links */}
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer"><ShieldCheck size={12}/> Security</span>
                <Link href="/privacy" className="hover:text-slate-600 cursor-pointer">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-slate-600 cursor-pointer">Terms</Link>
            </div>

        </div>
      </div>
    </div>
  );
}