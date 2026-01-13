"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, Mail, ArrowRight, ArrowLeft, Banknote, Globe, Phone, ChevronDown, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  
  // --- UI STATE ---
  const [step, setStep] = useState(1);
  const [showSimulation, setShowSimulation] = useState(true);
  const [loadingText, setLoadingText] = useState("Establishing Secure Connection...");
  
  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    username: '',
    email: '',
    phone: '',
    country: 'United States',
    currency: 'USD - US Dollar',
    accountType: 'Savings Account',
    pin: '', // This stores the 4-digit PIN
    password: '',
    confirmPassword: ''
  });

  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- 1. SIMULATION LOGIC ---
  useEffect(() => {
    const timer1 = setTimeout(() => setLoadingText("Verifying Browser Integrity..."), 1000);
    const timer2 = setTimeout(() => setLoadingText("Encrypting Session (256-bit SSL)..."), 2000);
    const timer3 = setTimeout(() => setShowSimulation(false), 3000);

    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
    };
  }, []);

  // --- 2. INPUT HANDLER ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 3. NAVIGATION LOGIC ---
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  // --- 4. REGISTRATION LOGIC (FIXED) ---
  const handleRegister = async () => {
    setError('');
    
    // --- VALIDATION START ---
    if (!agreed) {
        setError("You must agree to the terms.");
        return;
    }
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
    }
    // ✅ NEW: Validate PIN Length
    if (formData.pin.length !== 4) {
        setError("Transaction PIN must be exactly 4 digits.");
        return;
    }
    // --- VALIDATION END ---

    setIsLoading(true);

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                pin: formData.pin // ✅ CRITICAL FIX: Send PIN to server
            })
        });

        const data = await res.json();

        if (res.ok) {
            // Redirect to Verify Page
            router.push(`/verify?email=${formData.email}`);
        } else {
            setError(data.message || "Registration failed. Please try again.");
        }
    } catch (err) {
        setError("Network error. Please check your connection.");
    } finally {
        setIsLoading(false);
    }
  };

  // --- RENDER: LOADING SIMULATION SCREEN ---
  if (showSimulation) {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center font-sans px-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white"></div>
            <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
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
                <p className="text-blue-600 font-medium animate-pulse text-sm">{loadingText}</p>
            </div>
        </div>
    );
  }

  // --- RENDER: MAIN FORM ---
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row animate-fadeIn">
      
      {/* --- LEFT SIDE: MARKETING PANEL (Hidden on Mobile) --- */}
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 relative flex-col justify-between p-12 text-white overflow-hidden">
         <div className="absolute top-20 right-[-50px] w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-20 left-[-50px] w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>

         <div className="relative z-10 w-40 h-12">
            <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left invert brightness-0 grayscale opacity-100" />
         </div>

         <div className="relative z-10 mt-10">
            <div className="bg-white/10 backdrop-blur-md inline-block px-4 py-1 rounded-full text-xs font-bold mb-6 border border-white/20">
                Finora Banking
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">Join Finora. <br/> Create Your Banking Account.</h1>
            <p className="text-blue-100 mb-10 leading-relaxed text-sm opacity-90">
                Start your financial journey with Finora. Secure, fast, and reliable banking at your fingertips.
            </p>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <ShieldCheck className="mb-2 opacity-80" size={20} />
                    <p className="font-bold text-sm">Secure Platform</p>
                    <p className="text-[10px] opacity-60">Bank-grade security</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <ArrowRight className="mb-2 opacity-80" size={20} />
                    <p className="font-bold text-sm">Fast Transfers</p>
                    <p className="text-[10px] opacity-60">Instant payments</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <Clock className="mb-2 opacity-80" size={20} />
                    <p className="font-bold text-sm">24/7 Access</p>
                    <p className="text-[10px] opacity-60">Always available</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <Globe className="mb-2 opacity-80" size={20} />
                    <p className="font-bold text-sm">Global Banking</p>
                    <p className="text-[10px] opacity-60">Worldwide access</p>
                </div>
            </div>
         </div>

         <div className="relative z-10 text-xs text-blue-200 opacity-60 mt-auto">
            <p>© 2026 Finora Bank. All rights reserved.</p>
         </div>
      </div>

      {/* --- RIGHT SIDE: 4-STEP WIZARD (Responsive) --- */}
      <div className="md:w-7/12 w-full bg-slate-50 flex flex-col items-center py-8 md:py-12 px-4 md:px-20 overflow-y-auto">
        
        {/* MOBILE LOGO HEADER */}
        <div className="md:hidden w-full flex justify-center mb-8">
            <div className="relative w-40 h-10">
                <Image src="/logo.png" alt="Finora Logo" fill className="object-contain" priority />
            </div>
        </div>

        <div className="max-w-md w-full bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
            
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Create Account</h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Step {step} of 4</span>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Step Indicator */}
            <div className="flex justify-between mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
                {['Personal', 'Contact', 'Account', 'Security'].map((label, index) => {
                    const stepNum = index + 1;
                    const isActive = step >= stepNum;
                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center bg-white px-1">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                                {stepNum === 1 && <User size={14} className="md:w-4 md:h-4" />}
                                {stepNum === 2 && <Mail size={14} className="md:w-4 md:h-4" />}
                                {stepNum === 3 && <Banknote size={14} className="md:w-4 md:h-4" />}
                                {stepNum === 4 && <Lock size={14} className="md:w-4 md:h-4" />}
                            </div>
                            <span className={`text-[9px] md:text-[10px] mt-2 font-bold uppercase tracking-wide hidden sm:block ${isActive ? 'text-blue-600' : 'text-slate-300'}`}>{label}</span>
                        </div>
                    );
                })}
            </div>

            <form className="space-y-6">
                
                {/* --- STEP 1: PERSONAL --- */}
                {step === 1 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2"><User size={24} /></div>
                            <h3 className="font-bold text-slate-800">Personal Information</h3>
                            <p className="text-xs text-slate-500">Tell us about yourself</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">First Name *</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Last Name *</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Middle Name</label>
                            <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="David" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Username *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-400 text-sm">@</span>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full pl-8 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="johnsmith123" required />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STEP 2: CONTACT --- */}
                {step === 2 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2"><Mail size={24} /></div>
                            <h3 className="font-bold text-slate-800">Contact Information</h3>
                            <p className="text-xs text-slate-500">How can we reach you?</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+1 (234) 567-8901" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Country *</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <select name="country" value={formData.country} onChange={handleChange} className="w-full pl-10 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                                    <option>United States</option>
                                    <option>Canada</option>
                                    <option>United Kingdom</option>
                                    <option>Bahrain</option>
                                    <option>Nigeria</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400" size={18} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STEP 3: ACCOUNT --- */}
                {step === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2"><Banknote size={24} /></div>
                            <h3 className="font-bold text-slate-800">Account Setup</h3>
                            <p className="text-xs text-slate-500">Choose your account preferences</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Currency *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-500 text-sm">$</span>
                                <select name="currency" value={formData.currency} onChange={handleChange} className="w-full pl-8 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                                    <option>USD - US Dollar</option>
                                    <option>EUR - Euro</option>
                                    <option>GBP - British Pound</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400" size={18} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Account Type *</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <select name="accountType" value={formData.accountType} onChange={handleChange} className="w-full pl-10 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                                    <option>Savings Account</option>
                                    <option>Checking Account</option>
                                    <option>Business Account</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400" size={18} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Transaction PIN *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input type="password" name="pin" value={formData.pin} onChange={handleChange} className="w-full pl-10 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="4-digit PIN" maxLength={4} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STEP 4: SECURITY --- */}
                {step === 4 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2"><ShieldCheck size={24} /></div>
                            <h3 className="font-bold text-slate-800">Security Setup</h3>
                            <p className="text-xs text-slate-500">Secure your account</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Create strong password" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Confirm Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Confirm your password" required />
                            </div>
                        </div>
                        
                        {/* AGREEMENT CHECKBOX */}
                        <div className={`flex items-start p-4 rounded-lg border transition-colors ${agreed ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                             <input 
                                type="checkbox" 
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer flex-shrink-0" 
                             />
                             <label className="ml-3 text-xs text-slate-600 leading-relaxed cursor-pointer select-none" onClick={() => setAgreed(!agreed)}>
                                I agree to the <Link href="/terms" target="_blank" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>.
                             </label>
                        </div>
                    </div>
                )}

                {/* --- NAVIGATION BUTTONS --- */}
                <div className="pt-6 flex flex-col-reverse md:flex-row items-center justify-between gap-4 border-t border-slate-100 mt-6">
                    {step > 1 ? (
                        <button type="button" onClick={handleBack} className="w-full md:w-auto px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition flex items-center justify-center gap-2">
                            <ArrowLeft size={16} /> Previous
                        </button>
                    ) : (
                         <div className="text-xs text-slate-400 w-full md:w-auto text-center md:text-left">Have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link></div>
                    )}

                    {step < 4 ? (
                        <button type="button" onClick={handleNext} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20">
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        // FINAL BUTTON
                        <button 
                            type="button" 
                            onClick={handleRegister}
                            disabled={!agreed || isLoading}
                            className={`w-full md:w-auto px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition shadow-md ${agreed && !isLoading ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-green-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={16}/> : <ShieldCheck size={16} />} Create Account
                        </button>
                    )}
                </div>

            </form>
        </div>
      </div>
    </div>
  );
}