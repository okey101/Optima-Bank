"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email'); // We get email from the URL

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-focus logic
  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    const fullCode = code.join('');

    const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode })
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
    } else {
        alert("Invalid Code!");
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
        <p className="text-slate-500 mb-8">We sent a code to <span className="font-bold text-slate-800">{email}</span></p>

        <div className="flex gap-2 mb-8 justify-center">
            {code.map((digit, i) => (
                <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className="w-12 h-14 border-2 border-slate-200 rounded-lg text-center text-2xl font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition"
                />
            ))}
        </div>

        <button 
            onClick={handleVerify}
            disabled={isLoading || code.includes('')}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
        >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Account'} <ArrowRight size={20} />
        </button>
    </div>
  );
}