"use client";

import React, { useState, useEffect } from 'react';
import { 
  Phone, Clock, Landmark, ArrowRight, User, ShieldCheck, PiggyBank, Percent, 
  CreditCard, CheckCircle, Star, Lock, ChevronDown, ChevronUp, Briefcase, 
  Handshake, Gift, Menu, X, MapPin, Mail, Zap, Globe, Download, Wifi, Bell, Shield, Send // <--- Added Send here
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  
  // --- PWA INSTALL LOGIC ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("To install: Tap the 'Share' icon (Safari) or Menu (Chrome) and select 'Add to Home Screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };
  // -------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm">
        <div className="px-6 h-28 flex items-center justify-between">
            
            {/* Logo Area */}
            <Link href="/" className="flex items-center no-underline gap-2">
                <div className="relative w-64 h-20 md:w-96 md:h-24">
                    <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left" priority />
                </div>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex gap-8 text-sm font-bold text-gray-600 h-full items-center">
                <Link href="/" className="text-blue-600 font-bold h-full flex items-center border-b-4 border-blue-600 tracking-wide">Home</Link>
                <Link href="/about" className="hover:text-blue-600 h-full flex items-center transition tracking-wide">About</Link>
                
                {/* Desktop Dropdown */}
                <div className="relative group h-full flex items-center">
                    <button className="flex items-center gap-1 hover:text-blue-600 h-full focus:outline-none transition tracking-wide">
                    Services <ChevronDown size={16} strokeWidth={3} />
                    </button>
                    <div className="absolute top-[90%] left-[-20px] w-72 bg-white shadow-xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 p-3">
                        <Link href="/services/personal" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><User size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Personal Banking</span></Link>
                        <Link href="/services/business" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><Briefcase size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Business Banking</span></Link>
                        <Link href="/services/loans" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-green-50 text-green-600 p-2 rounded-lg group-hover/item:bg-green-100"><Handshake size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-green-600">Loans & Credit</span></Link>
                        <Link href="/services/cards" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-purple-50 text-purple-600 p-2 rounded-lg group-hover/item:bg-purple-100"><CreditCard size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-purple-600">Cards</span></Link>
                        <Link href="/services/grants" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-orange-50 text-orange-600 p-2 rounded-lg group-hover/item:bg-orange-100"><Gift size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-orange-600">Grants & Aid</span></Link>
                    </div>
                </div>
                
                <Link href="/contact" className="hover:text-blue-600 h-full flex items-center transition tracking-wide">Contact</Link>
            </div>

            {/* BUTTONS */}
            <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-blue-600 font-bold hover:underline tracking-wide">Login</Link>
                <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-md shadow-blue-600/20">
                    <User size={18} /> Open Account
                </Link>
            </div>

            {/* MOBILE HAMBURGER */}
            <button className="md:hidden text-slate-900 hover:text-blue-600 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-5 h-screen overflow-y-auto pb-20">
                <Link href="/" className="text-blue-600 font-bold text-lg py-3 border-b border-slate-50">Home</Link>
                <Link href="/about" className="text-slate-600 font-bold text-lg py-3 border-b border-slate-50">About</Link>
                
                {/* EXPANDABLE MOBILE SERVICES MENU */}
                <div className="border-b border-slate-50">
                    <button 
                        onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                        className="flex items-center justify-between w-full text-slate-600 font-bold text-lg py-3 focus:outline-none"
                    >
                        <span>Services</span>
                        {isMobileServicesOpen ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} />}
                    </button>
                    
                    {isMobileServicesOpen && (
                        <div className="flex flex-col pl-4 space-y-1 pb-4 animate-in slide-in-from-top-2">
                            <Link href="/services/personal" className="flex items-center gap-3 text-slate-500 font-medium py-2 hover:text-blue-600 transition">
                                <div className="bg-blue-50 text-blue-600 p-1.5 rounded"><User size={16} /></div> Personal Banking
                            </Link>
                            <Link href="/services/business" className="flex items-center gap-3 text-slate-500 font-medium py-2 hover:text-blue-600 transition">
                                <div className="bg-blue-50 text-blue-600 p-1.5 rounded"><Briefcase size={16} /></div> Business Banking
                            </Link>
                            <Link href="/services/loans" className="flex items-center gap-3 text-slate-500 font-medium py-2 hover:text-blue-600 transition">
                                <div className="bg-green-50 text-green-600 p-1.5 rounded"><Handshake size={16} /></div> Loans & Credit
                            </Link>
                            <Link href="/services/cards" className="flex items-center gap-3 text-slate-500 font-medium py-2 hover:text-blue-600 transition">
                                <div className="bg-purple-50 text-purple-600 p-1.5 rounded"><CreditCard size={16} /></div> Cards
                            </Link>
                            <Link href="/services/grants" className="flex items-center gap-3 text-slate-500 font-medium py-2 hover:text-blue-600 transition">
                                <div className="bg-orange-50 text-orange-600 p-1.5 rounded"><Gift size={16} /></div> Grants & Aid
                            </Link>
                        </div>
                    )}
                </div>

                <Link href="/contact" className="text-slate-600 font-bold text-lg py-3 border-b border-slate-50">Contact</Link>
                
                <div className="flex flex-col gap-4 mt-4">
                    <Link href="/login" className="text-center text-blue-600 font-bold text-lg py-3 border-2 border-blue-100 rounded-xl">Login</Link>
                    <Link href="/signup" className="text-center bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-md">Open Account</Link>
                </div>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" alt="Banking Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 to-blue-900/40"></div>
        </div>
        <div className="relative z-10 container mx-auto px-6 text-white max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">Banking built for you.</h1>
          <p className="text-lg md:text-2xl mb-10 leading-relaxed max-w-xl text-blue-100 font-medium">We believe that people come first, and that everyone deserves a great experience every step of their financial journey.</p>
          <div className="flex flex-col md:flex-row gap-4">
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition shadow-xl hover:scale-105 transform"><User size={20} /> Open Account Today</Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 border-2 border-white/30 transition hover:border-white">Login to Banking <ArrowRight size={20} /></Link>
          </div>
        </div>
      </section>

      {/* --- NEW INSTALL APP SECTION --- */}
      <section className="bg-gradient-to-br from-sky-500 to-blue-700 py-16 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

          <div className="container mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                  
                  {/* Left Side: Content */}
                  <div className="md:w-1/2 text-center md:text-left">
                      <div className="inline-block bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-pulse">
                          ✨ Native App Experience
                      </div>
                      <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                          Experience the future of mobile banking.
                      </h2>
                      <p className="text-blue-100 text-lg mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
                          Get native app performance with the convenience of web technology. No app store required – just instant access.
                      </p>

                      {/* Feature Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition">
                              <div className="w-12 h-12 bg-green-500/20 text-green-300 rounded-full flex items-center justify-center shrink-0">
                                  <Wifi size={24} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-white">Works Offline</h4>
                                  <p className="text-xs text-blue-100">Access account anywhere</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition">
                              <div className="w-12 h-12 bg-sky-500/20 text-sky-300 rounded-full flex items-center justify-center shrink-0">
                                  <Zap size={24} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-white">Lightning Fast</h4>
                                  <p className="text-xs text-blue-100">Instant loading</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition">
                              <div className="w-12 h-12 bg-purple-500/20 text-purple-300 rounded-full flex items-center justify-center shrink-0">
                                  <Bell size={24} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-white">Push Alerts</h4>
                                  <p className="text-xs text-blue-100">Stay updated instantly</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition">
                              <div className="w-12 h-12 bg-orange-500/20 text-orange-300 rounded-full flex items-center justify-center shrink-0">
                                  <Shield size={24} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-white">Secure</h4>
                                  <p className="text-xs text-blue-100">Bank-level protection</p>
                              </div>
                          </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                          <button 
                            onClick={handleInstallClick}
                            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:bg-blue-50 transition transform hover:-translate-y-1"
                          >
                             <Download size={22} /> {isInstallable ? "Install App Now" : "Install Finora App"}
                          </button>
                          <Link href="/login" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition">
                             Open Web Banking
                          </Link>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-center md:justify-start gap-6 opacity-60 grayscale hover:grayscale-0 transition duration-500">
                          <p className="text-xs text-blue-200">Compatible with:</p>
                          <div className="flex gap-4">
                            <Globe size={16} />
                          </div>
                      </div>
                  </div>

                  {/* Right Side: Phone Mockup */}
                  <div className="md:w-1/2 relative flex justify-center">
                      <div className="relative w-72 h-[550px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20"></div>
                          
                          <div className="w-full h-full bg-slate-50 relative overflow-hidden flex flex-col">
                             <div className="bg-blue-600 h-32 p-6 pt-12 text-white">
                                <div className="flex justify-between items-center mb-4">
                                   <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                   <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                </div>
                                <h3 className="font-bold text-lg">Welcome Back!</h3>
                                <p className="text-blue-100 text-xs">Your banking at your fingertips</p>
                             </div>
                             
                             <div className="p-4 flex-1">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                   <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-2 items-center justify-center aspect-square">
                                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Send size={20}/></div>
                                      <span className="text-xs font-bold text-slate-700">Transfer</span>
                                   </div>
                                   <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-2 items-center justify-center aspect-square">
                                      <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><CreditCard size={20}/></div>
                                      <span className="text-xs font-bold text-slate-700">Cards</span>
                                   </div>
                                </div>
                                
                                <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-lg mb-4">
                                   <p className="text-xs text-blue-200 mb-1">Available Balance</p>
                                   <h2 className="text-2xl font-bold">$12,847.50</h2>
                                   <p className="text-xs text-blue-200 mt-2">**** 1234</p>
                                </div>

                                <div className="bg-gradient-to-r from-teal-400 to-emerald-500 p-4 rounded-2xl text-white text-center mt-auto">
                                    <Download size={24} className="mx-auto mb-1" />
                                    <p className="text-xs font-bold">Install for offline access</p>
                                </div>
                             </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- INFO CARDS SECTION --- */}
      <div className="relative z-20 py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-2xl flex flex-col justify-between h-48 hover:-translate-y-2 transition duration-300">
            <div><p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">Global Access</p><h3 className="text-2xl font-bold">Manage Anywhere</h3><p className="text-blue-200 text-sm">Online & Mobile Banking</p></div>
            <div className="self-end opacity-50"><Globe size={48} /></div>
          </div>
          <div className="bg-teal-500 text-white p-8 rounded-3xl shadow-2xl flex flex-col justify-between h-48 hover:-translate-y-2 transition duration-300">
            <div><p className="text-teal-100 text-sm font-bold uppercase tracking-wider mb-1">Branch Hours</p><h3 className="text-2xl font-bold mb-1">Mon-Fri: 9AM-5PM</h3><p className="text-teal-100 text-sm">Sat: 9AM - 1PM</p></div>
            <div className="self-end opacity-50"><Clock size={48} /></div>
          </div>
          <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-2xl flex flex-col justify-between h-48 hover:-translate-y-2 transition duration-300">
            <div><p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">24/7 Support</p><h3 className="text-3xl font-bold mb-1">1-800-FINORA</h3><p className="text-indigo-200 text-sm">Always here to help</p></div>
            <div className="self-end opacity-50"><Phone size={48} /></div>
          </div>
        </div>
      </div>

      {/* --- RATES SECTION --- */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-bold mb-4">Finora Rates</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Finora Member Care</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-16">Discover competitive rates designed to help your money grow faster.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition duration-300 hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6"><PiggyBank size={32} /></div>
              <h3 className="text-5xl font-extrabold text-blue-600 mb-2">3.75%</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">APY*</p>
              <h4 className="text-xl font-bold text-slate-800 mb-2">High Yield Savings</h4>
              <p className="text-slate-500 mb-6">High Yield Savings Rate</p>
              <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">FEATURED</div>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition duration-300 hover:-translate-y-2">
              <div className="bg-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-6"><Percent size={32} /></div>
              <h3 className="text-5xl font-extrabold text-teal-600 mb-2">3.65%</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">APY*</p>
              <h4 className="text-xl font-bold text-slate-800 mb-2">18 Month Certificate</h4>
              <p className="text-slate-500 mb-6">Finora Certificate Rates</p>
              <div className="inline-block px-4 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded">SAVINGS</div>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition duration-300 hover:-translate-y-2">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-6"><CreditCard size={32} /></div>
              <h3 className="text-5xl font-extrabold text-purple-600 mb-2">4.00%</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">APR*</p>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Credit Cards</h4>
              <p className="text-slate-500 mb-6">Finora Credit Card Rates</p>
              <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">CREDIT</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROMO SECTION --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="md:w-1/2">
             <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm mb-6">$ Get $200* With a Checking Account Built for You</div>
             <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">Start Building Your <br/> <span className="text-green-600">Financial Strength</span></h2>
             <p className="text-slate-600 text-lg mb-8 leading-relaxed">For a limited time, get a $200 bonus when you open any new account.</p>
             <ul className="space-y-4 mb-8">
               <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle className="text-green-500" size={24} /> No minimum balance required</li>
               <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle className="text-green-500" size={24} /> Free online and mobile banking</li>
               <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle className="text-green-500" size={24} /> 24/7 customer support</li>
             </ul>
             <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center justify-center transition shadow-lg">Open Account Now</Link>
          </div>
          <div className="md:w-1/2">
             <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="rounded-[2.5rem] shadow-2xl w-full" alt="Man on laptop" />
          </div>
        </div>
      </section>

      {/* --- BLUE PRODUCT LINKS --- */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-center mb-16 text-white/90">Comprehensive Banking Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <Link href="/services/personal" className="group block bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-3xl hover:bg-white/20 transition cursor-pointer">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                        <Landmark size={32} />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Deposit Accounts</h3>
                    <p className="text-blue-50 text-lg">Secure your money with our high-yield savings and checking accounts designed for growth.</p>
                </Link>
                <Link href="/services/cards" className="group block bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-3xl hover:bg-white/20 transition cursor-pointer">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                        <CreditCard size={32} />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Credit Cards</h3>
                    <p className="text-blue-50 text-lg">Find the perfect credit card for your lifestyle and spending habits with competitive rates.</p>
                </Link>
            </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-16">Hear From Our Customers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-50 p-8 rounded-3xl">
                    <div className="flex justify-center text-yellow-400 mb-4"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div>
                    <p className="text-slate-600 italic mb-6">"I am impressed with the customer service and speed of payout. Truly a modern banking experience."</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">S</div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">Sarah Morris</p>
                            <p className="text-slate-500 text-xs">Verified Customer</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-3xl">
                    <div className="flex justify-center text-yellow-400 mb-4"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div>
                    <p className="text-slate-600 italic mb-6">"Excellent service and competitive rates. Highly recommended for business owners looking for support."</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">J</div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">John Davis</p>
                            <p className="text-slate-500 text-xs">Business Owner</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-3xl">
                    <div className="flex justify-center text-yellow-400 mb-4"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div>
                    <p className="text-slate-600 italic mb-6">"The mobile app is fantastic and customer support is top-notch. Managing my finances has never been easier."</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">E</div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">Emily Johnson</p>
                            <p className="text-slate-500 text-xs">Personal Banking</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- CONTACT INFO BAR --- */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4"><Clock size={20}/></div>
                <h4 className="font-bold text-slate-900">Banking Hours</h4>
                <p className="text-slate-500 text-sm mt-1">Mon-Fri: 9AM-5PM</p>
                <p className="text-slate-500 text-sm">Sat: 9AM-1PM</p>
                <p className="text-red-500 text-sm">Sun: Closed</p>
            </div>
            <div className="flex flex-col items-start">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-4"><Phone size={20}/></div>
                <h4 className="font-bold text-slate-900">Phone Banking</h4>
                <p className="text-slate-500 text-sm mt-1">Available 24/7</p>
                <p className="text-slate-500 text-sm">Call: 1-800-FINORA</p>
            </div>
            <div className="flex flex-col items-start">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4"><Mail size={20}/></div>
                <h4 className="font-bold text-slate-900">Email Support</h4>
                <p className="text-slate-500 text-sm mt-1">Response within 24hrs</p>
                <p className="text-slate-500 text-sm">support@finora.com</p>
            </div>
            <div className="flex flex-col items-start">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4"><MapPin size={20}/></div>
                <h4 className="font-bold text-slate-900">Visit Us</h4>
                <p className="text-slate-500 text-sm mt-1">123 Banking Street</p>
                <p className="text-slate-500 text-sm">New York, NY 10001</p>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 text-white py-20 border-t border-slate-900">
         <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
               <div className="flex items-center mb-8">
                  <div className="relative w-96 h-28">
                      <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left" />
                  </div>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed mb-8">Building financial strength together with personalized banking solutions for every member.</p>
               <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-600 transition group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-400 transition group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-700 transition group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-pink-600 transition group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
               </div>
            </div>
            
            <div className="mt-4">
               <h4 className="font-bold text-lg mb-6 border-l-4 border-blue-600 pl-3">Quick Links</h4>
               <ul className="space-y-4 text-slate-400 text-sm">
                  <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                  <li><Link href="/services/personal" className="hover:text-white transition">Personal Banking</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
               </ul>
            </div>
            
            <div className="mt-4">
               <h4 className="font-bold text-lg mb-6 border-l-4 border-teal-500 pl-3">Services</h4>
               <ul className="space-y-4 text-slate-400 text-sm">
                  <li><Link href="/services/business" className="hover:text-white transition">Business Banking</Link></li>
                  <li><Link href="/services/loans" className="hover:text-white transition">Loans & Credit</Link></li>
                  <li><Link href="/services/cards" className="hover:text-white transition">Cards</Link></li>
               </ul>
            </div>

            <div className="mt-4">
               <h4 className="font-bold text-lg mb-6 border-l-4 border-indigo-500 pl-3">Support</h4>
               <ul className="space-y-4 text-slate-400 text-sm">
                  <li><Link href="/login" className="hover:text-white transition">Online Banking</Link></li>
                  <li><a href="#" className="hover:text-white transition">Security Center</a></li>
                  <li><a href="#" className="hover:text-white transition">ATM Locations</a></li>
               </ul>
            </div>
         </div>
         <div className="container mx-auto px-6 mt-16 pt-8 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
            <p>&copy; 2026 Finora Bank. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <span className="flex items-center gap-1"><ShieldCheck size={14}/> FDIC Insured</span>
               <span className="flex items-center gap-1"><Lock size={14} /> 256-bit SSL</span>
               <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
               <a href="/terms" className="hover:text-white transition">Terms of Service</a>
            </div>
         </div>
      </footer>
    </div>
  );
}