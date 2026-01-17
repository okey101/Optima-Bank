"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, Lock, ArrowRight, Loader2, AlertCircle, 
  CheckCircle2, ShieldCheck, Globe, ChevronRight 
} from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Animation loop for the left sidebar features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ CRITICAL FIX: Save email BEFORE navigating
        if (typeof window !== 'undefined') {
            localStorage.setItem('loginEmail', formData.email);
        }
        
        // Small delay to allow the animation to feel "complete"
        setTimeout(() => {
            router.push('/login/pin');
        }, 300);

      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
        title: "Global Banking",
        desc: "Access your funds from anywhere in the world with zero latency.",
        icon: Globe
    },
    {
        title: "Bank-Grade Security",
        desc: "Your data is protected by military-grade encryption and 2FA.",
        icon: ShieldCheck
    },
    {
        title: "Instant Transfers",
        desc: "Send money to friends and family instantly with zero fees.",
        icon: CheckCircle2
    }
  ];

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDE: ANIMATED SIDEBAR (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        {/* ✅ LOGO SECTION (Updated) */}
        <div className="relative z-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
             <div className="relative w-10 h-10">
                <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    fill 
                    className="object-contain" 
                    priority
                />
             </div>
             <span className="text-2xl font-bold tracking-tight">Optima Bank</span>
        </div>

        {/* Feature Carousel */}
        <div className="relative z-10 max-w-md">
            <div className="relative h-48">
                {features.map((feat, index) => (
                    <div 
                        key={index}
                        className={`absolute top-0 left-0 transition-all duration-700 ease-in-out transform ${
                            index === activeFeature 
                                ? 'opacity-100 translate-x-0 translate-y-0' 
                                : 'opacity-0 translate-y-8 translate-x-4'
                        }`}
                    >
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-blue-400 border border-white/5">
                            <feat.icon size={28} />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 leading-tight">{feat.title}</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">{feat.desc}</p>
                    </div>
                ))}
            </div>

            {/* Carousel Indicators */}
            <div className="flex gap-2 mt-8">
                {features.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setActiveFeature(i)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${activeFeature === i ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}
                    />
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
            © 2026 Optima Banking Group. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-slate-50 lg:bg-white relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            
            <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                <p className="text-slate-500">Please enter your details to sign in.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 border border-red-100 animate-in shake">
                    <AlertCircle size={20} className="shrink-0" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-blue-600 transition-colors">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input 
                            type="email" 
                            required
                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="group">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase group-focus-within:text-blue-600 transition-colors">Password</label>
                        <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot Password?</Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input 
                            type="password" 
                            required
                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-200 hover:shadow-blue-600/30 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
                </button>
            </form>

            <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-sm font-medium text-slate-500">
                    Don't have an account yet?{' '}
                    <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 group">
                        Create Account 
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </p>
            </div>
            
            {/* Mobile Footer */}
            <div className="lg:hidden text-center text-xs text-slate-400 mt-8">
                Protected by reCAPTCHA and subject to the Privacy Policy.
            </div>

        </div>
      </div>
    </div>
  );
}