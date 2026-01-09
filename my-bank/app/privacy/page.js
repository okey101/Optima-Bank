import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        
        <Link href="/signup" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition">
          <ArrowLeft size={16} /> Back to Signup
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: January 1, 2026</p>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal data against accidental or unlawful destruction, loss, change, or damage.</p>
          </section>

          <section>
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-start gap-4">
               <Lock className="text-green-600 flex-shrink-0" size={24} />
               <div>
                 <h3 className="font-bold text-green-900 mb-1">256-Bit Encryption</h3>
                 <p className="text-sm text-green-800">All sensitive data transmitted to and from Finora Bank is encrypted using industry-standard 256-bit SSL encryption protocols to ensure maximum security.</p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}