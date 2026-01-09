"use client";

import React, { useState } from 'react';
import { ShieldCheck, User, Menu, X, ChevronDown, ChevronUp, Briefcase, Handshake, CreditCard, ArrowRight, CheckCircle, Home, Car, DollarSign, Gift, Lock, Facebook, Twitter, Linkedin, Instagram, GraduationCap, Building2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoansPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

  // --- LOAN CALCULATOR STATE ---
  const [loanAmount, setLoanAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(2.8);
  const [loanTerm, setLoanTerm] = useState(10);
  const [results, setResults] = useState({
    monthly: 95.64,
    totalInterest: 1476.83,
    totalPayment: 11476.83
  });

  // --- CALCULATOR LOGIC ---
  const calculateLoan = (e) => {
    e.preventDefault();
    const principal = parseFloat(loanAmount);
    const calculatedInterest = parseFloat(interestRate) / 100 / 12;
    const calculatedPayments = parseFloat(loanTerm) * 12;

    // Compute monthly payment
    const x = Math.pow(1 + calculatedInterest, calculatedPayments);
    const monthly = (principal * x * calculatedInterest) / (x - 1);

    if (isFinite(monthly)) {
      const total = monthly * calculatedPayments;
      const totalInterest = total - principal;
      
      setResults({
        monthly: monthly.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalPayment: total.toFixed(2)
      });
    }
  };

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
                <Link href="/" className="hover:text-blue-600 h-full flex items-center transition tracking-wide">Home</Link>
                <Link href="/about" className="hover:text-blue-600 h-full flex items-center transition tracking-wide">About</Link>
                
                {/* Services Dropdown */}
                <div className="relative group h-full flex items-center">
                    <button className="flex items-center gap-1 text-blue-600 h-full focus:outline-none transition border-b-4 border-blue-600 tracking-wide">
                    Services <ChevronDown size={16} strokeWidth={3} />
                    </button>
                    <div className="absolute top-[90%] left-[-20px] w-72 bg-white shadow-xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 p-3">
                        <Link href="/services/personal" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><User size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Personal Banking</span></Link>
                        <Link href="/services/business" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><Briefcase size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Business Banking</span></Link>
                        {/* Loans Active */}
                        <Link href="/services/loans" className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl group/item transition"><div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Handshake size={20} /></div><span className="text-blue-600 font-bold">Loans & Credit</span></Link>
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
                <Link href="/" className="text-slate-600 font-bold text-lg py-3 border-b border-slate-50">Home</Link>
                <Link href="/about" className="text-slate-600 font-bold text-lg py-3 border-b border-slate-50">About</Link>
                
                {/* EXPANDABLE MOBILE SERVICES MENU */}
                <div className="border-b border-slate-50">
                    <button 
                        onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                        className="flex items-center justify-between w-full text-blue-600 font-bold text-lg py-3 focus:outline-none"
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
                            <Link href="/services/loans" className="flex items-center gap-3 text-blue-600 font-bold py-2 transition">
                                <div className="bg-blue-50 text-blue-600 p-1.5 rounded"><Handshake size={16} /></div> Loans & Credit
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
      <section className="bg-green-900 py-28 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover opacity-20" alt="New Home" />
             <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-green-900/95 to-green-900/50"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-2/3">
                <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold mb-6 tracking-wide">
                    LENDING SOLUTIONS
                </div>
                <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                    Funding your <br/> next big dream.
                </h1>
                <p className="text-2xl text-green-100 mb-10 leading-relaxed max-w-2xl">
                    Whether it's a new home, a new car, or a personal goal, we have flexible loan options with competitive rates.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/signup" className="bg-white text-green-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition shadow-xl flex items-center gap-2">
                        Apply Now <ArrowRight size={20}/>
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* --- LOAN CALCULATOR SECTION --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Loan Calculator</h2>
                <p className="text-slate-600">Estimate your monthly payments with our easy-to-use calculator.</p>
            </div>

            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                {/* Input Side */}
                <div className="p-8 md:w-1/2 bg-white">
                    <form onSubmit={calculateLoan} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Loan Amount</label>
                            <input 
                                type="number" 
                                value={loanAmount} 
                                onChange={(e) => setLoanAmount(e.target.value)} 
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition font-bold text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Interest Rate (%)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                value={interestRate} 
                                onChange={(e) => setInterestRate(e.target.value)} 
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition font-bold text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Loan Term (years)</label>
                            <input 
                                type="number" 
                                value={loanTerm} 
                                onChange={(e) => setLoanTerm(e.target.value)} 
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition font-bold text-slate-800"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition">
                            Calculate Payment
                        </button>
                    </form>
                </div>

                {/* Result Side */}
                <div className="p-8 md:w-1/2 bg-slate-50 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100">
                    <h4 className="text-lg font-bold text-slate-900 mb-6">Payment Breakdown</h4>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                            <span className="text-slate-600">Monthly Payment:</span>
                            <span className="text-3xl font-extrabold text-blue-600">${results.monthly}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-slate-600 font-medium">Total Interest:</span>
                            <span className="text-slate-900 font-bold">${results.totalInterest}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">Total Payment:</span>
                            <span className="text-slate-900 font-bold">${results.totalPayment}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- LOAN PRODUCTS GRID (Expanded to 6 Items) --- */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. Home Loans */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-8 group-hover:scale-110 transition">
                    <Home size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Home Loans</h3>
                <p className="text-slate-500 mb-6 text-sm">Competitive mortgage rates for first-time buyers and refinancing.</p>
                <div className="space-y-2 mb-8 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Interest Rate:</span><span className="font-bold text-blue-600">From 3.25% APR</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Loan Amount:</span><span className="font-bold text-slate-800">Up to $1M</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Term:</span><span className="font-bold text-slate-800">15-30 years</span></div>
                </div>
                <Link href="/signup" className="text-green-600 font-bold hover:underline flex items-center gap-2">Apply Now <ArrowRight size={16}/></Link>
            </div>

            {/* 2. Auto Loans */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition">
                    <Car size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Auto Loans</h3>
                <p className="text-slate-500 mb-6 text-sm">Finance your dream car with our competitive auto loan rates.</p>
                <div className="space-y-2 mb-8 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Interest Rate:</span><span className="font-bold text-green-600">From 2.99% APR</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Loan Amount:</span><span className="font-bold text-slate-800">Up to $100K</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Term:</span><span className="font-bold text-slate-800">3-7 years</span></div>
                </div>
                <Link href="/signup" className="text-green-600 font-bold hover:underline flex items-center gap-2">Apply Now <ArrowRight size={16}/></Link>
            </div>

            {/* 3. Personal Loans */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition">
                    <DollarSign size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Personal Loans</h3>
                <p className="text-slate-500 mb-6 text-sm">Flexible personal loans for any purpose with quick approval.</p>
                <div className="space-y-2 mb-8 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Interest Rate:</span><span className="font-bold text-purple-600">From 5.99% APR</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Loan Amount:</span><span className="font-bold text-slate-800">Up to $50K</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Term:</span><span className="font-bold text-slate-800">2-7 years</span></div>
                </div>
                <Link href="/signup" className="text-purple-600 font-bold hover:underline flex items-center gap-2">Apply Now <ArrowRight size={16}/></Link>
            </div>

            {/* 4. Business Loans */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition">
                    <Briefcase size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Business Loans</h3>
                <p className="text-slate-500 mb-6 text-sm">Grow your business with our flexible commercial lending solutions.</p>
                <div className="space-y-2 mb-8 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Interest Rate:</span><span className="font-bold text-orange-600">From 4.25% APR</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Loan Amount:</span><span className="font-bold text-slate-800">Up to $5M</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Term:</span><span className="font-bold text-slate-800">5-20 years</span></div>
                </div>
                <Link href="/signup" className="text-orange-600 font-bold hover:underline flex items-center gap-2">Apply Now <ArrowRight size={16}/></Link>
            </div>

            {/* 5. Student Loans */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-8 group-hover:scale-110 transition">
                    <GraduationCap size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Student Loans</h3>
                <p className="text-slate-500 mb-6 text-sm">Invest in your education with competitive student loan rates.</p>
                <div className="space-y-2 mb-8 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Interest Rate:</span><span className="font-bold text-teal-600">From 3.75% APR</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Loan Amount:</span><span className="font-bold text-slate-800">Up to $200K</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Term:</span><span className="font-bold text-slate-800">5-15 years</span></div>
                </div>
                <Link href="/signup" className="text-teal-600 font-bold hover:underline flex items-center gap-2">Apply Now <ArrowRight size={16}/></Link>
            </div>

            {/* 6. Home Equity */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-8 group-hover:scale-110 transition">
                    <TrendingUp size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Home Equity</h3>
                <p className="text-slate-500 mb-6 text-sm">Tap into your home's equity for major expenses or investments.</p>
                <div className="space-y-2 mb-8 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Interest Rate:</span><span className="font-bold text-red-600">From 4.50% APR</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Loan Amount:</span><span className="font-bold text-slate-800">Up to $500K</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Term:</span><span className="font-bold text-slate-800">5-20 years</span></div>
                </div>
                <Link href="/signup" className="text-red-600 font-bold hover:underline flex items-center gap-2">Apply Now <ArrowRight size={16}/></Link>
            </div>

        </div>
      </section>

      {/* --- FOOTER (With Responsive Mobile Logo) --- */}
      <footer className="bg-slate-950 text-white py-16 border-t border-slate-900">
         <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Col 1: Brand & Socials */}
            <div>
               <div className="flex items-center mb-6">
                  {/* RESPONSIVE LOGO FIX: w-64 on mobile, w-96 on desktop */}
                  <div className="relative w-64 h-20 md:w-96 md:h-28">
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
         
         {/* Bottom Bar */}
         <div className="container mx-auto px-6 mt-16 pt-8 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
            <p>&copy; 2026 Finora Bank. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <span className="flex items-center gap-1"><ShieldCheck size={14}/> FDIC Insured</span>
               <span className="flex items-center gap-1"><Lock size={14} /> 256-bit SSL</span>
               <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
               <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}