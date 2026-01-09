"use client";

import React, { useState } from 'react';
import { Phone, Clock, Landmark, ArrowRight, User, ShieldCheck, Mail, MapPin, Send, Menu, X, ChevronDown, ChevronUp, Briefcase, Handshake, Gift, CreditCard, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false); // NEW: State for mobile dropdown

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm">
        <div className="px-6 h-28 flex items-center justify-between">
            
            {/* Logo Area - UNIFIED FOR MOBILE & DESKTOP */}
            <Link href="/" className="flex items-center no-underline gap-2">
                {/* Responsive Width: w-64 on mobile, w-96 on desktop */}
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
                
                {/* Active Contact Link */}
                <Link href="/contact" className="text-blue-600 font-bold h-full flex items-center border-b-4 border-blue-600 tracking-wide">Contact</Link>
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
                        {/* Toggle Icon */}
                        {isMobileServicesOpen ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} />}
                    </button>
                    
                    {/* Collapsible List */}
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

                <Link href="/contact" className="text-blue-600 font-bold text-lg py-3 border-b border-slate-50">Contact</Link>
                
                <div className="flex flex-col gap-4 mt-4">
                    <Link href="/login" className="text-center text-blue-600 font-bold text-lg py-3 border-2 border-blue-100 rounded-xl">Login</Link>
                    <Link href="/signup" className="text-center bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-md">Open Account</Link>
                </div>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="bg-slate-900 py-24 text-center text-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="container mx-auto px-6 relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Contact Us</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                We're here to help with all your banking needs. Reach out to us anytime regarding your account, loans, or general inquiries.
            </p>
        </div>
      </section>

      {/* --- MAIN CONTENT (Form & Info) --- */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* LEFT: FORM */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Send us a Message</h2>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="john@example.com" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="How can we help?" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                        <textarea rows="6" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" placeholder="Type your message here..."></textarea>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 text-lg">
                        <Send size={20} /> Send Message
                    </button>
                </form>
            </div>

            {/* RIGHT: CONTACT INFO */}
            <div>
                <div className="mb-12">
                    <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold mb-4">SUPPORT CENTER</div>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Get in Touch</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        Have questions about our services? Need help with your account? Our team is ready to assist you.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Item 1: Phone */}
                    <div className="flex items-start gap-6 group">
                        <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                            <Phone size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">Phone</h4>
                            <p className="text-blue-600 font-bold text-lg">1-800-FINORA</p>
                            <p className="text-slate-500">Available 24/7 for urgent inquiries.</p>
                        </div>
                    </div>

                    {/* Item 2: Email */}
                    <div className="flex items-start gap-6 group">
                        <div className="bg-teal-100 text-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                            <Mail size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">Email</h4>
                            <p className="text-slate-900 font-medium">support@finora.com</p>
                            <p className="text-slate-500">We typically respond within 24 hours.</p>
                        </div>
                    </div>

                    {/* Item 3: Address */}
                    <div className="flex items-start gap-6 group">
                        <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                            <MapPin size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">Visit Us</h4>
                            <p className="text-slate-900 font-medium">123 Banking Street</p>
                            <p className="text-slate-500">Financial District, New York, NY 10001</p>
                        </div>
                    </div>

                    {/* Item 4: Hours */}
                    <div className="flex items-start gap-6 group">
                        <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">Banking Hours</h4>
                            <p className="text-slate-900 font-medium">Mon-Fri: 9AM - 5PM</p>
                            <p className="text-slate-900 font-medium">Sat: 9AM - 1PM</p>
                            <p className="text-red-500 font-bold">Sun: Closed</p>
                        </div>
                    </div>
                </div>
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
         
         {/* Bottom Bar */}
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