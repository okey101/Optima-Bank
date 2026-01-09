"use client";

import React, { useState } from 'react';
import { ShieldCheck, User, Menu, X, ChevronDown, ChevronUp, Briefcase, Handshake, CreditCard, ArrowRight, CheckCircle, PieChart, Users, Building2, Gift, Lock, MapPin, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BusinessBankingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false); // NEW: State for mobile dropdown

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm">
        <div className="px-6 h-28 flex items-center justify-between">
            
            {/* Logo Area - UNIFIED */}
            <Link href="/" className="flex items-center no-underline gap-2">
                <div className="relative w-64 h-20 md:w-96 md:h-24">
                    <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left" priority />
                </div>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex gap-8 text-sm font-bold text-gray-600 h-full items-center">
                <Link href="/" className="hover:text-blue-600 h-full flex items-center transition tracking-wide">Home</Link>
                <Link href="/about" className="hover:text-blue-600 h-full flex items-center transition tracking-wide">About</Link>
                
                {/* Services Dropdown */}
                <div className="relative group h-full flex items-center">
                    <button className="flex items-center gap-1 text-blue-600 h-full focus:outline-none transition border-b-4 border-blue-600 tracking-wide">
                    Services <ChevronDown size={16} strokeWidth={3} />
                    </button>
                    <div className="absolute top-[90%] left-[-20px] w-72 bg-white shadow-xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 p-3">
                        <Link href="/services/personal" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><User size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Personal Banking</span></Link>
                        {/* Business Active Here */}
                        <Link href="/services/business" className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl group/item transition"><div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Briefcase size={20} /></div><span className="text-blue-600 font-bold">Business Banking</span></Link>
                        <Link href="/services/loans" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><Handshake size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Loans & Credit</span></Link>
                        <Link href="/services/cards" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><CreditCard size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Cards</span></Link>
                        <Link href="/services/grants" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><Gift size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Grants & Aid</span></Link>
                    </div>
                </div>
                
                <Link href="/contact" className="hover:text-blue-600 h-full flex items-center transition tracking-wide">Contact</Link>
            </div>

            {/* BUTTONS */}
            <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-blue-600 font-bold hover:underline tracking-wide">Login</Link>
                <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-md shadow-blue-600/20">
                    <User size={20} /> Open Account
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
                <Link href="/" className="text-slate-600 font-bold text-lg py-3 border-b border-slate-50">Home</Link>
                <Link href="/about" className="text-slate-600 font-bold text-lg py-3 border-b border-slate-50">About</Link>
                
                {/* EXPANDABLE MOBILE SERVICES MENU */}
                <div className="border-b border-slate-50">
                    <button 
                        onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                        className="flex items-center justify-between w-full text-blue-600 font-bold text-lg py-3 focus:outline-none"
                    >
                        <span>Services</span>
                        {/* Toggle Icon */}
                        {isMobileServicesOpen ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} />}
                    </button>
                    
                    {/* Collapsible List */}
                    {isMobileServicesOpen && (
                        <div className="flex flex-col pl-4 space-y-1 pb-4 animate-in slide-in-from-top-2">
                            <Link href="/services/personal" className="flex items-center gap-3 text-slate-500 font-medium py-2 hover:text-blue-600 transition">
                                <div className="bg-blue-50 text-blue-600 p-1.5 rounded"><User size={16} /></div> Personal Banking
                            </Link>
                            <Link href="/services/business" className="flex items-center gap-3 text-blue-600 font-bold py-2 transition">
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
      <section className="bg-slate-900 py-28 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover opacity-20" alt="Corporate Building" />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-900/50"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-2/3">
                <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold mb-6 tracking-wide">
                    FOR BUSINESS
                </div>
                <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                    Powering your <br/> business growth.
                </h1>
                <p className="text-2xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
                    From startups to enterprises, Finora provides the capital, tools, and expertise you need to scale.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition shadow-xl flex items-center gap-2">
                        Open Business Account
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* --- BUSINESS SOLUTIONS --- */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Comprehensive Business Solutions</h2>
            <p className="text-xl text-slate-600">We offer more than just a checking account. We offer a partnership for growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition">
                    <Briefcase size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Business Checking</h3>
                <p className="text-slate-600 mb-6 text-lg">Keep your business finances running smoothly with low fees and high transaction limits.</p>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle size={20} className="text-green-500"/> 500 Free Transactions/mo</li>
                    <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle size={20} className="text-green-500"/> Mobile Check Deposit</li>
                </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-8 group-hover:scale-110 transition">
                    <PieChart size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Merchant Services</h3>
                <p className="text-slate-600 mb-6 text-lg">Accept payments anywhere, anytime. Integrated POS systems and online payment gateways.</p>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle size={20} className="text-green-500"/> Next-Day Funding</li>
                    <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle size={20} className="text-green-500"/> Competitive Rates</li>
                </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition">
                    <Users size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Payroll Services</h3>
                <p className="text-slate-600 mb-6 text-lg">Simplify payday. Automated tax filings, direct deposit, and employee self-service portals.</p>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle size={20} className="text-green-500"/> Automated Tax Filing</li>
                    <li className="flex items-center gap-3 text-slate-700 font-bold"><CheckCircle size={20} className="text-green-500"/> Employee Portal</li>
                </ul>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 text-white py-16 border-t border-slate-900">
         <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Col 1: Brand & Socials */}
            <div>
               <div className="flex items-center mb-6">
                  <div className="relative w-96 h-28">
                      <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left" />
                  </div>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed mb-6">Building financial strength together with personalized banking solutions for every member.</p>
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

            {/* Col 2: Quick Links */}
            <div>
               <h4 className="font-bold text-lg mb-6 border-l-4 border-blue-600 pl-3">Quick Links</h4>
               <ul className="space-y-3 text-slate-400 text-sm">
                  <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                  <li><Link href="/services/personal" className="hover:text-white transition">Services</Link></li>
                  <li><Link href="/services/grants" className="hover:text-white transition">Grants & Aid</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
               </ul>
            </div>

            {/* Col 3: Services */}
            <div>
               <h4 className="font-bold text-lg mb-6 border-l-4 border-teal-500 pl-3">Services</h4>
               <ul className="space-y-3 text-slate-400 text-sm">
                  <li><Link href="/services/personal" className="hover:text-white transition">Personal Banking</Link></li>
                  <li><Link href="/services/business" className="hover:text-white transition">Business Banking</Link></li>
                  <li><Link href="/services/loans" className="hover:text-white transition">Loans & Credit</Link></li>
                  <li><Link href="/services/cards" className="hover:text-white transition">Cards</Link></li>
               </ul>
            </div>

            {/* Col 4: Member Services */}
            <div>
               <h4 className="font-bold text-lg mb-6 border-l-4 border-indigo-500 pl-3">Member Services</h4>
               <ul className="space-y-3 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">Online Banking</a></li>
                  <li><a href="#" className="hover:text-white transition">Mobile App</a></li>
                  <li><a href="#" className="hover:text-white transition">ATM Locations</a></li>
                  <li><a href="#" className="hover:text-white transition">Security Center</a></li>
               </ul>
            </div>
         </div>
         <div className="container mx-auto px-6 mt-16 pt-8 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
            <p>&copy; 2026 Finora Bank. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <span className="flex items-center gap-1"><ShieldCheck size={14}/> FDIC Insured</span>
               <span className="flex items-center gap-1"><Lock size={14} /> 256-bit SSL</span>
               <a href="/privacy" className="hover:text-white">Privacy Policy</a>
               <a href="/terms" className="hover:text-white">Terms of Service</a>
            </div>
         </div>
      </footer>
    </div>
  );
}