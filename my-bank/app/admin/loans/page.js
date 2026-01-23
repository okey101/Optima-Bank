"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle, XCircle, FileText, Loader2, 
  DollarSign, Calendar, Briefcase, User, Download, Eye, Landmark 
} from 'lucide-react';
// ✅ FIXED IMPORT: Go up 3 levels to reach the root, then into components
import AdminGuard from '../../../components/AdminGuard'; 
import Link from 'next/link';

export default function AdminLoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/admin/loans');
      if (res.ok) setLoans(await res.json());
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleAction = async (loanId, status) => {
    setProcessingId(loanId);
    try {
        const res = await fetch('/api/admin/loans', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loanId, status })
        });
        if (res.ok) {
            // Update the local state to reflect the change immediately
            setLoans(loans.map(l => l.id === loanId ? { ...l, status } : l));
        }
    } catch (e) { console.error(e); }
    finally { setProcessingId(null); }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 flex">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full p-4">
             <h2 className="text-xl font-bold text-white mb-8 pl-4">ADMIN<span className="text-blue-500">PANEL</span></h2>
             <Link href="/admin" className="mb-4 px-4 hover:text-white transition flex items-center gap-2">
                ← Back to Dashboard
             </Link>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 ml-64 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Loan Applications</h1>
            
            {loading ? (
                <div className="flex justify-center pt-20">
                    <Loader2 className="animate-spin text-blue-600" size={40}/>
                </div>
            ) : (
                <div className="grid gap-6">
                    {loans.map(loan => (
                        <div key={loan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            
                            {/* HEADER: User Info & Status Badge */}
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {loan.user.firstName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{loan.user.firstName} {loan.user.lastName}</h3>
                                        <p className="text-sm text-slate-500">{loan.user.email}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                    loan.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    loan.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {loan.status}
                                </span>
                            </div>

                            {/* LOAN DETAILS GRID */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Requested Amount</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-1 text-lg">
                                        <DollarSign size={16}/> {loan.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Duration</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-1">
                                        <Calendar size={16}/> {loan.duration} Months
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Monthly Income</p>
                                    <p className="font-bold text-slate-900">${loan.monthlyIncome.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Employment</p>
                                    <p className="font-bold text-slate-900 flex items-center gap-1">
                                        <Briefcase size={16}/> {loan.employmentStatus}
                                    </p>
                                </div>
                            </div>

                            {/* DOCUMENT REVIEW SECTION (THE SCREENSHOTS) */}
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <FileText size={14}/> Submitted Documents
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Government ID', file: loan.idProof },
                                        { label: 'Proof of Income', file: loan.incomeProof },
                                        { label: 'Proof of Address', file: loan.addressProof },
                                    ].map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white hover:border-blue-400 transition group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                                    <FileText size={16}/>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 truncate">{doc.label}</p>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                                        {doc.file ? 'File Uploaded' : 'Not uploaded'}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* VIEW BUTTON */}
                                            {doc.file && (
                                                <a 
                                                    href={doc.file} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition flex items-center justify-center" 
                                                    title="View Document"
                                                >
                                                    <Eye size={16}/>
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <div className="text-sm text-slate-500">
                                    <span className="font-bold text-slate-700">Purpose:</span> "{loan.purpose}"
                                </div>
                                
                                {loan.status === 'PENDING' && (
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleAction(loan.id, 'REJECTED')}
                                            disabled={!!processingId}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition flex items-center gap-2"
                                        >
                                            {processingId === loan.id ? <Loader2 className="animate-spin" size={16}/> : <XCircle size={18}/>} 
                                            Reject
                                        </button>
                                        <button 
                                            onClick={() => handleAction(loan.id, 'APPROVED')}
                                            disabled={!!processingId}
                                            className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-200"
                                        >
                                            {processingId === loan.id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={18}/>} 
                                            Approve Loan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {loans.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                            <FileText size={48} className="mx-auto text-slate-300 mb-4"/>
                            <p className="text-slate-500 font-medium">No loan applications found.</p>
                        </div>
                    )}
                </div>
            )}
        </main>
      </div>
    </AdminGuard>
  );
}