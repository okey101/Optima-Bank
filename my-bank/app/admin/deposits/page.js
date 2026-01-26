"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Loader2, ChevronLeft, DollarSign, 
  User, Calendar, ArrowDownLeft, XCircle 
} from 'lucide-react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // --- FETCH TRANSACTIONS ---
  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const res = await fetch('/api/admin/list');
      if (res.ok) {
        const data = await res.json();
        // Filter only PENDING DEPOSITS
        const pending = data.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
        setDeposits(pending);
      }
    } catch (error) {
      console.error("Error fetching deposits:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE APPROVAL ---
  const handleApprove = async (transactionId) => {
    setProcessingId(transactionId);
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });

      if (res.ok) {
        // Remove the approved transaction from the list
        setDeposits(prev => prev.filter(t => t.id !== transactionId));
        alert("Deposit Approved Successfully");
      } else {
        const err = await res.json();
        alert(err.message || "Approval failed");
      }
    } catch (error) {
      console.error(error);
      alert("Connection error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
        
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-2">
                <ChevronLeft size={14} /> Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <DollarSign className="text-green-600" size={32} /> Deposit Approvals
            </h1>
            <p className="text-slate-500 mt-1">Review and approve incoming crypto deposits.</p>
          </div>

          {/* List */}
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-400 text-sm font-medium">Loading deposits...</p>
             </div>
          ) : deposits.length === 0 ? (
             <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                <p className="text-slate-500 mt-2">No pending deposits found.</p>
             </div>
          ) : (
            <div className="grid gap-4">
              {deposits.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
                    
                    {/* Details */}
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl text-slate-900">${t.amount.toLocaleString()}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                    {t.method || 'CRYPTO'}
                                </span>
                                <span className="flex items-center gap-1"><User size={14}/> {t.user?.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block mr-4">
                             <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                             <p className="text-sm font-bold text-amber-500">PENDING APPROVAL</p>
                        </div>
                        
                        {/* Approve Button */}
                        <button 
                            onClick={() => handleApprove(t.id)}
                            disabled={processingId === t.id}
                            className="px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {processingId === t.id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                            Approve
                        </button>
                    </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}