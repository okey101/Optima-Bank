import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        
        <Link href="/signup" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition">
          <ArrowLeft size={16} /> Back to Signup
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last updated: January 1, 2026</p>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the services provided by Finora Bank ("we," "us," or "our"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Banking Services</h2>
            <p>Finora Bank provides financial services including but not limited to savings accounts, checking accounts, loans, and credit facilities. All services are subject to applicable federal and state laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Responsibilities</h2>
            <p>You agree to provide accurate, current, and complete information during the registration process. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Limitation of Liability</h2>
            <p>Finora Bank shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.</p>
          </section>

          <section>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start gap-4">
               <ShieldCheck className="text-blue-600 flex-shrink-0" size={24} />
               <div>
                 <h3 className="font-bold text-blue-900 mb-1">FDIC Insurance</h3>
                 <p className="text-sm text-blue-800">Funds deposited with Finora Bank are insured by the Federal Deposit Insurance Corporation (FDIC) up to the standard maximum deposit insurance amount of $250,000 per depositor, per insured bank, for each account ownership category.</p>
               </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400">&copy; 2026 Finora Bank. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}