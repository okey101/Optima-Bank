"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PinLogin() {
  const router = useRouter();
  
  // State for logic
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(null);
  
  // State for "Checking Email" loading screen
  const [isChecking, setIsChecking] = useState(true);

  // 1. Get Email from Storage on Load
  useEffect(() => {
    // Give the browser 500ms to find the email before kicking the user out
    const checkEmail = setTimeout(() => {
        const storedEmail = localStorage.getItem('loginEmail');
        
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            // If no email found, go back to start
            router.push('/login');
        }
        setIsChecking(false);
    }, 500);

    return () => clearTimeout(checkEmail);
  }, [router]);

  // 2. Handle PIN typing
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`).focus();
    }
  };

  // 3. Submit PIN to Server
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const pinCode = pin.join('');
    
    if (pinCode.length !== 4) {
        setError("Please enter a 4-digit PIN");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/login/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email,    // Sending the email we retrieved from storage
            pin: pinCode 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Save user data for the dashboard
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Clear the temporary login email
        localStorage.removeItem('loginEmail');
        
        // Go to Dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Something went wrong. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Loading Screen (while checking for email)
  if (isChecking) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );
  }

  // 5. Main PIN Interface
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Enter Security PIN</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
                {email ? `Welcome back, ${email}` : 'Please verify it is you'}
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={18} /> {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-4">
                {pin.map((digit, i) => (
                    <input
                        key={i}
                        id={`pin-${i}`}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        autoFocus={i === 0}
                    />
                ))}
            </div>

            <button
                type="submit"
                disabled={loading || pin.join('').length < 4}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
                {loading ? <Loader2 className="animate-spin" /> : <>Verify & Login <ArrowRight size={20} /></>}
            </button>
        </form>
        
        <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition">
                Switch Account
            </Link>
        </div>
      </div>
    </div>
  );
}