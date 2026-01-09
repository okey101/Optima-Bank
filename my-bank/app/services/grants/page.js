"use client";

import React, { useState } from 'react';
import { ShieldCheck, User, Menu, X, ChevronDown, ChevronUp, Briefcase, Handshake, CreditCard, Gift, Lock, Facebook, Twitter, Linkedin, Instagram, GraduationCap, Building2, Heart, ArrowRight, CheckCircle, Home, Stethoscope, Users, Phone, Clock, Mail, MapPin, Store, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function GrantsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

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
                        <Link href="/services/loans" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><Handshake size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Loans & Credit</span></Link>
                        <Link href="/services/cards" className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl group/item transition"><div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover/item:bg-blue-100"><CreditCard size={20} /></div><span className="text-slate-600 font-medium group-hover/item:text-blue-600">Cards</span></Link>
                        
                        {/* Grants Active Here */}
                        <Link href="/services/grants" className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl group/item transition"><div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Gift size={20} /></div><span className="text-blue-600 font-bold">Grants & Aid</span></Link>
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
                                <div className="bg-blue-50 text-blue-600 p-1.5 rounded"><Handshake size={16} /></div> Loans & Credit
                            </Link>
                            <Link href="/services/cards" className="flex items-center gap-3 text-slate-500 font-medium py-2 hover:text-blue-600 transition">
                                <div className="bg-purple-50 text-purple-600 p-1.5 rounded"><CreditCard size={16} /></div> Cards
                            </Link>
                            <Link href="/services/grants" className="flex items-center gap-3 text-blue-600 font-bold py-2 transition">
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
      <section className="bg-orange-600 py-28 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover opacity-20" alt="Community Support" />
             <div className="absolute inset-0 bg-gradient-to-r from-orange-950 via-orange-900/95 to-orange-900/50"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-2/3">
                <div className="inline-block bg-white text-orange-600 px-4 py-1 rounded-full text-xs font-bold mb-6 tracking-wide">
                    COMMUNITY SUPPORT
                </div>
                <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                    Empowering our <br/> community.
                </h1>
                <p className="text-2xl text-orange-100 mb-10 leading-relaxed max-w-2xl">
                    We believe in giving back. Explore our grant programs designed to support education, small businesses, and community development.
                </p>
                <div className="flex flex-wrap gap-4">
                    <a href="#programs" className="bg-white text-orange-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition shadow-xl flex items-center gap-2">
                        View Programs <ArrowRight size={20}/>
                    </a>
                </div>
            </div>
        </div>
      </section>

      {/* --- AVAILABLE GRANT PROGRAMS --- */}
      <section id="programs" className="py-24 container mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Available Grant Programs</h2>
            <p className="text-xl text-slate-600">Explore our comprehensive grant programs designed to support various financial needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. Small Business Grant */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition">
                    <Store size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Small Business Grant</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">Up to $50,000 in funding for small business startups and expansion projects.</p>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> No collateral required</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Flexible repayment terms</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Business mentorship included</li>
                </ul>
                <Link href="/contact" className="text-blue-600 font-bold hover:underline flex items-center gap-2">Learn More <ArrowRight size={16}/></Link>
            </div>

            {/* 2. Education Grant */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition">
                    <GraduationCap size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Education Grant</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">Financial assistance for higher education, vocational training, and skill development.</p>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Up to $25,000 per year</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Merit-based selection</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Career guidance support</li>
                </ul>
                <Link href="/contact" className="text-purple-600 font-bold hover:underline flex items-center gap-2">Learn More <ArrowRight size={16}/></Link>
            </div>

            {/* 3. Home Ownership Grant */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-8 group-hover:scale-110 transition">
                    <Home size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Home Ownership Grant</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">Down payment assistance and closing cost support for first-time homebuyers.</p>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Up to $15,000 assistance</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> First-time buyer priority</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Homebuyer education</li>
                </ul>
                <Link href="/contact" className="text-green-600 font-bold hover:underline flex items-center gap-2">Learn More <ArrowRight size={16}/></Link>
            </div>

            {/* 4. Emergency Relief Grant */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-8 group-hover:scale-110 transition">
                    <Heart size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Emergency Relief Grant</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">Immediate financial assistance for unexpected emergencies and hardships.</p>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Quick approval process</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Up to $10,000 immediate</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> 24/7 application support</li>
                </ul>
                <Link href="/contact" className="text-red-600 font-bold hover:underline flex items-center gap-2">Learn More <ArrowRight size={16}/></Link>
            </div>

            {/* 5. Community Development */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition">
                    <Users size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Community Development</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">Support for community projects, non-profits, and local development initiatives.</p>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Up to $100,000 funding</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Community impact focus</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Ongoing project support</li>
                </ul>
                <Link href="/contact" className="text-orange-600 font-bold hover:underline flex items-center gap-2">Learn More <ArrowRight size={16}/></Link>
            </div>

            {/* 6. Healthcare Grant */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 hover:-translate-y-2 transition duration-300 group">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-8 group-hover:scale-110 transition">
                    <Activity size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Healthcare Grant</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">Medical expense assistance and healthcare accessibility support programs.</p>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Medical bill assistance</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Prescription drug support</li>
                    <li className="flex items-center gap-3 text-slate-700 text-sm font-bold"><CheckCircle className="text-green-500" size={18} /> Health insurance help</li>
                </ul>
                <Link href="/contact" className="text-teal-600 font-bold hover:underline flex items-center gap-2">Learn More <ArrowRight size={16}/></Link>
            </div>

        </div>
      </section>

      {/* --- HOW TO APPLY --- */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">How to Apply</h2>
            <p className="text-xl text-slate-600 mb-16">Simple steps to get the financial assistance you need</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6">1</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Choose Program</h4>
                    <p className="text-slate-500 text-sm">Select the grant program that best fits your needs</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6">2</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Submit Application</h4>
                    <p className="text-slate-500 text-sm">Complete our online application with required documents</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6">3</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Review Process</h4>
                    <p className="text-slate-500 text-sm">Our team reviews your application within 5-7 business days</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6">4</div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Receive Funding</h4>
                    <p className="text-slate-500 text-sm">Approved grants are disbursed directly to your account</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- READY TO APPLY CTA --- */}
      <section className="bg-blue-600 py-20 text-center text-white">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-extrabold mb-6">Ready to Apply for a Grant?</h2>
            <p className="text-xl text-blue-100 mb-10">Take the first step towards achieving your financial goals with our grant programs</p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
                <Link href="/contact" className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-lg flex items-center justify-center gap-2">
                    <Briefcase size={20}/> Start Application
                </Link>
                <Link href="/contact" className="bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition shadow-lg border border-blue-500 flex items-center justify-center gap-2">
                    <Phone size={20}/> Speak with Advisor
                </Link>
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