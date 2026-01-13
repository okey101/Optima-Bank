"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, ChevronLeft, Eye, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard'; // ✅ Import Guard

export default function AdminKYCPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // --- MODAL STATE ---
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
        // Remove from list and close modal
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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900 relative">
        
        {/* --- DOCUMENT VIEWER MODAL --- */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-xl font-bold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                          <p className="text-sm text-slate-500">{selectedUser.email}</p>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-200 rounded-full transition">
                          <X size={24} className="text-slate-500" />
                      </button>
                  </div>

                  {/* Modal Body (Scrollable) */}
                  <div className="p-8 overflow-y-auto flex-1 bg-slate-100/50">
                      
                      {/* Applicant Details Section */}
                      <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Applicant Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                              <div>
                                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Full Name</p>
                                  <p className="font-bold text-slate-700 mt-1">{selectedUser.firstName} {selectedUser.lastName}</p>
                              </div>
                              <div>
                                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Date of Birth</p>
                                  <p className="font-bold text-slate-700 mt-1">{selectedUser.dateOfBirth || 'N/A'}</p>
                              </div>
                              <div>
                                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Address</p>
                                  <p className="font-bold text-slate-700 mt-1">
                                      {selectedUser.streetAddress ? `${selectedUser.streetAddress}, ${selectedUser.city}, ${selectedUser.country}` : 'N/A'}
                                  </p>
                              </div>
                              <div>
                                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">ID Document</p>
                                  <p className="font-bold text-slate-700 mt-1">
                                      {selectedUser.idType || 'ID'} — <span className="text-blue-600">{selectedUser.idNumber || 'N/A'}</span>
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Image Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Selfie */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Live Selfie</p>
                              <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                                  {selectedUser.kycSelfie ? (
                                      <img src={selectedUser.kycSelfie} alt="Selfie" className="w-full h-full object-cover" />
                                  ) : <div className="flex items-center justify-center h-full text-slate-400">No Image</div>}
                              </div>
                          </div>

                          {/* ID Front */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-3">ID Front</p>
                              <div className="aspect-[3/2] relative rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                                  {selectedUser.kycFront ? (
                                      <img src={selectedUser.kycFront} alt="Front ID" className="w-full h-full object-contain" />
                                  ) : <div className="flex items-center justify-center h-full text-slate-400">No Image</div>}
                              </div>
                          </div>

                          {/* ID Back */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-3">ID Back</p>
                              <div className="aspect-[3/2] relative rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                                  {selectedUser.kycBack ? (
                                      <img src={selectedUser.kycBack} alt="Back ID" className="w-full h-full object-contain" />
                                  ) : <div className="flex items-center justify-center h-full text-slate-400">No Image</div>}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer (Actions) */}
                  <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
                      <button 
                          onClick={() => handleAction(selectedUser.id, 'REJECT')}
                          disabled={processingId === selectedUser.id}
                          className="px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                      >
                          Reject Application
                      </button>
                      <button 
                          onClick={() => handleAction(selectedUser.id, 'APPROVE')}
                          disabled={processingId === selectedUser.id}
                          className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2"
                      >
                          {processingId === selectedUser.id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                          Approve & Verify
                      </button>
                  </div>
              </div>
          </div>
        )}

        {/* --- MAIN PAGE CONTENT --- */}
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin" className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
               <ChevronLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex justify-between items-center">
              <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                      <ShieldCheck className="text-blue-600" /> KYC Verifications
                  </h1>
                  <p className="text-slate-500 mt-1">Review user identities securely.</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm font-bold text-sm border border-slate-200">
                  Pending: <span className="text-blue-600">{requests.length}</span>
              </div>
            </div>
          </div>

          {/* Content List */}
          {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : requests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
                  <p className="text-slate-500">There are no pending KYC requests.</p>
              </div>
          ) : (
              <div className="grid gap-4">
                  {requests.map((req) => (
                      <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
                          
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg overflow-hidden relative">
                                  {req.kycSelfie ? (
                                      <img src={req.kycSelfie} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : req.firstName[0]}
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-slate-900">{req.firstName} {req.lastName}</h3>
                                  <p className="text-sm text-slate-500">{req.email}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Review</span>
                                  </div>
                              </div>
                          </div>

                          <div>
                              <button 
                                  onClick={() => setSelectedUser(req)}
                                  className="px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition flex items-center gap-2"
                              >
                                  <Eye size={18} /> View Documents
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