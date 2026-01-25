"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function VerifyLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for logic
  const [status, setStatus] = useState('IDLE'); // IDLE, VERIFYING, SUCCESS, ERROR
  const [message, setMessage] = useState('');
  
  // State for manual input
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');

  // 1. Check for Auto-Verify Link on Mount
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');

    if (emailParam && codeParam) {
      // Auto-fill and verify immediately
      verifyUser(emailParam, codeParam);
    } else {
      // No link? Stay in IDLE to show the manual form
      setStatus('IDLE');
      // If email was passed but no code (e.g. from signup redirect), pre-fill it
      if (emailParam) setEmailInput(emailParam);
    }
  }, [searchParams]);

  // 2. The Verification Function
  const verifyUser = async (email, code) => {
    setStatus('VERIFYING');
    setMessage('Verifying your credentials...');

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('SUCCESS');
        setMessage('Account verified successfully!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setStatus('ERROR');
        setMessage(data.message || 'Verification failed.');
      }
    } catch (error) {
      setStatus('ERROR');
      setMessage('Connection error. Please try again.');
    }
  };

  // 3. Manual Form Submit Handler
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!emailInput || !codeInput) return;
    verifyUser(emailInput, codeInput);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
      
      {/* CASE 1: MANUAL INPUT FORM (IDLE) */}
      {status === 'IDLE' && (
        <form onSubmit={handleManualSubmit} className="flex flex-col text-left">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
               <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Verify Account</h2>
            <p className="text-slate-500 text-sm mt-1 text-center">
              Enter the code sent to your email address.
            </p>
          </div>

          <label className="text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
          <input 
            type="email" 
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="name@example.com"
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
          />

          <label className="text-xs font-bold text-slate-700 uppercase mb-1">Verification Code</label>
          <input 
            type="text" 
            required
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="123456"
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-6 text-center text-lg tracking-widest font-mono"
          />

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
          >
            Verify Now
          </button>
        </form>
      )}

      {/* CASE 2: LOADING SPINNER */}
      {status === 'VERIFYING' && (
        <div className="flex flex-col items-center py-8">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-900">Verifying...</h2>
          <p className="text-slate-500 mt-2">{message}</p>
        </div>
      )}

      {/* CASE 3: SUCCESS */}
      {status === 'SUCCESS' && (
        <div className="flex flex-col items-center animate-in zoom-in py-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verified!</h2>
          <p className="text-slate-500 mt-2 mb-6">{message}</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full">
            Go to Login
          </Link>
        </div>
      )}

      {/* CASE 4: ERROR */}
      {status === 'ERROR' && (
        <div className="flex flex-col items-center animate-in zoom-in py-8">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <XCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
          <p className="text-red-500 mt-2 mb-6 text-sm bg-red-50 p-3 rounded-lg w-full">{message}</p>
          
          <button 
            onClick={() => setStatus('IDLE')} 
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition w-full mb-3"
          >
            Try Again
          </button>
          
          <Link href="/login" className="text-blue-600 font-bold hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 mx-auto mb-4">
          L
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Security Check</h1>
      </div>
      
      <Suspense fallback={
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-500 font-bold">Loading security...</p>
        </div>
      }>
        <VerifyLogic />
      </Suspense>
    </div>
  );
}