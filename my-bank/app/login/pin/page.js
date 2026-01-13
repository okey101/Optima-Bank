"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Smartphone, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function PinLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const isNewDevice = searchParams.get('newDevice') === 'true';

  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFinalize = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const res = await fetch('/api/login/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, pin, otp: isNewDevice ? otp : null })
        });
        
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/dashboard');
        } else {
            setError(data.message);
        }
    } catch (err) {
        setError("Network error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isNewDevice ? <Smartphone size={32} /> : <Lock size={32} />}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {isNewDevice ? "New Device Detected" : "Enter PIN"}
                </h2>
                <p className="text-slate-500 text-sm mt-2">
                    {isNewDevice 
                        ? "We sent a code to your email. Please enter it below along with your PIN." 
                        : "Please enter your 4-digit transaction PIN to continue."}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleFinalize} className="space-y-6">
                
                {/* 1. OTP Field (Only if New Device) */}
                {isNewDevice && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Verification Code</label>
                        <input 
                            type="text" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="123456"
                            maxLength={6}
                        />
                    </div>
                )}

                {/* 2. PIN Field (Always) */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Transaction PIN</label>
                    <input 
                        type="password" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="••••"
                        maxLength={4}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                    {isNewDevice ? "Verify & Login" : "Access Dashboard"}
                </button>
            </form>
        </div>
    </div>
  );
}