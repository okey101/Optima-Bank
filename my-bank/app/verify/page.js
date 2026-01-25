"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// 1. Logic Component (Isolated for Suspense)
function VerifyLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('VERIFYING');
  const [message, setMessage] = useState('Verifying your credentials...');

  useEffect(() => {
    const verifyUser = async () => {
      const email = searchParams.get('email');
      const code = searchParams.get('code');

      if (!email || !code) {
        setStatus('ERROR');
        setMessage('Invalid verification link.');
        return;
      }

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

    verifyUser();
  }, [searchParams, router]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
      {status === 'VERIFYING' && (
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-900">Verifying...</h2>
          <p className="text-slate-500 mt-2">{message}</p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="flex flex-col items-center animate-in zoom-in">
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

      {status === 'ERROR' && (
        <div className="flex flex-col items-center animate-in zoom-in">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <XCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
          <p className="text-slate-500 mt-2 mb-6">{message}</p>
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}

// 2. Main Page Component (Must be the default export)
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