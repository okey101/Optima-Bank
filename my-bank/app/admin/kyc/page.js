"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, ChevronLeft, Eye, X, ShieldCheck, MapPin, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';

export default function AdminKYCPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // --- FETCH REQUESTS ---
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/admin/kyc');
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Error fetching KYC:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // --- HANDLE ACTION ---
  const handleAction = async (userId, action) => {
    setProcessingId(userId);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });

      if (res.ok) {
        setRequests(prev => prev.filter(user => user.id !== userId));
        setSelectedUser(null);
      } else {
        alert("Action failed");
      }
    } catch (error) {
      console.error(error);
      alert("Connection error");
    } finally {
      setProcessingId(null);
    }
  };

  // Helper to safely format address
  const formatAddress = (user) => {
    return [user.streetAddress, user.city, user.state, user.zipCode, user.country]
      .filter(Boolean) // Removes null/undefined/empty strings
      .join(', ') || 'No address provided';
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900 relative">
        
        {/* --- DOCUMENT VIEWER MODAL --- */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                              {selectedUser.firstName[0]}
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                              <p className="text-sm text-slate-500 font-mono">{selectedUser.email}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-200 rounded-full transition">
                          <X size={24} className="text-slate-500" />
                      </button>
                  </div>

                  {/* Modal Body (Scrollable) */}
                  <div className="p-8 overflow-y-auto flex-1 bg-white">
                      
                      {/* 1. DATA GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          
                          {/* Identity Card */}
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                  <User size={18} className="text-blue-500"/> Personal Identity
                              </h4>
                              <div className="space-y-4">
                                  <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-xs font-bold text-slate-400 uppercase">First Name</span>
                                      <span className="text-sm font-bold text-slate-700">{selectedUser.firstName}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-xs font-bold text-slate-400 uppercase">Last Name</span>
                                      <span className="text-sm font-bold text-slate-700">{selectedUser.lastName}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-xs font-bold text-slate-400 uppercase">Date of Birth</span>
                                      <span className="text-sm font-bold text-slate-700">{selectedUser.dateOfBirth || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between pt-1">
                                      <span className="text-xs font-bold text-slate-400 uppercase">Nationality</span>
                                      <span className="text-sm font-bold text-slate-700">{selectedUser.country || 'N/A'}</span>
                                  </div>
                              </div>
                          </div>

                          {/* Contact & ID Card */}
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                  <FileText size={18} className="text-blue-500"/> Document Info
                              </h4>
                              <div className="space-y-4">
                                  <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-xs font-bold text-slate-400 uppercase">ID Type</span>
                                      <span className="text-sm font-bold text-slate-700 bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase text-[10px]">
                                          {selectedUser.idType || 'PASSPORT'}
                                      </span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-xs font-bold text-slate-400 uppercase">ID Number (SSN)</span>
                                      <span className="text-sm font-bold text-slate-900 font-mono tracking-wider">{selectedUser.idNumber || 'N/A'}</span>
                                  </div>
                                  <div>
                                      <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Full Address</span>
                                      <p className="text-sm font-medium text-slate-700 leading-relaxed bg-white p-2 rounded border border-slate-200">
                                          {formatAddress(selectedUser)}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 2. IMAGES GRID */}
                      <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Submitted Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* Live Selfie */}
                          <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-slate-500 uppercase">Live Selfie</p>
                                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Liveness Check</span>
                              </div>
                              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm group">
                                  {selectedUser.kycSelfie ? (
                                      <img src={selectedUser.kycSelfie} alt="Selfie" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                  ) : (
                                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                          <User size={32} className="opacity-20 mb-2"/>
                                          <span className="text-xs">No Selfie</span>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* ID Front */}
                          <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-500 uppercase">Document Front</p>
                              <div className="aspect-[3/2] relative rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm group">
                                  {selectedUser.kycFront ? (
                                      <img src={selectedUser.kycFront} alt="Front ID" className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                                  ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><FileText size={32} className="opacity-20"/><span className="text-xs">Missing</span></div>}
                              </div>
                          </div>

                          {/* ID Back */}
                          <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-500 uppercase">Document Back</p>
                              <div className="aspect-[3/2] relative rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm group">
                                  {selectedUser.kycBack ? (
                                      <img src={selectedUser.kycBack} alt="Back ID" className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                                  ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><FileText size={32} className="opacity-20"/><span className="text-xs">Missing</span></div>}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                      <button 
                          onClick={() => handleAction(selectedUser.id, 'REJECT')}
                          disabled={processingId === selectedUser.id}
                          className="px-6 py-3 rounded-xl font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition disabled:opacity-50"
                      >
                          Reject Request
                      </button>
                      <button 
                          onClick={() => handleAction(selectedUser.id, 'APPROVE')}
                          disabled={processingId === selectedUser.id}
                          className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2"
                      >
                          {processingId === selectedUser.id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                          Verify Identity
                      </button>
                  </div>
              </div>
          </div>
        )}

        {/* --- MAIN PAGE LIST --- */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <Link href="/admin" className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-2"><ChevronLeft size={14} /> Dashboard</Link>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <ShieldCheck className="text-blue-600" size={32} /> Identity Verification
                </h1>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="font-bold text-slate-600 text-sm">Pending Requests: <span className="text-slate-900 text-lg ml-1">{requests.length}</span></span>
            </div>
          </div>

          {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                  <p className="text-slate-400 text-sm font-medium">Loading requests...</p>
              </div>
          ) : requests.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">There are no pending identity verification requests at this moment.</p>
              </div>
          ) : (
              <div className="grid gap-4">
                  {requests.map((req) => (
                      <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 hover:shadow-md transition group">
                          
                          <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                                  {req.kycSelfie ? (
                                      <img src={req.kycSelfie} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : req.firstName[0]}
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition">{req.firstName} {req.lastName}</h3>
                                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                      <span className="flex items-center gap-1"><User size={14}/> {req.email}</span>
                                      <span className="hidden md:inline text-slate-300">•</span>
                                      <span className="flex items-center gap-1"><MapPin size={14}/> {req.country || 'Unknown'}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="flex items-center gap-4 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                              <div className="text-right hidden md:block mr-4">
                                  <p className="text-xs font-bold text-slate-400 uppercase">Submitted</p>
                                  <p className="text-sm font-bold text-slate-700">Today</p>
                              </div>
                              <button 
                                  onClick={() => setSelectedUser(req)}
                                  className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition flex items-center justify-center gap-2"
                              >
                                  <Eye size={18} /> Inspect
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