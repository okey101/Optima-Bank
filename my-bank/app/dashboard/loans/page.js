"use client";

import React, { useState, useEffect } from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, Settings, LogOut, Bell, 
  Menu, X, FileText, HelpCircle, Landmark, ShieldAlert, Gift, TrendingUp, 
  Globe, Download, Send, Calculator, Briefcase, Car, CheckCircle, 
  Loader2, ChevronRight, Upload, AlertCircle, DollarSign, ShieldCheck 
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

export default function LoansPage() {
  const router = useRouter();
  
  // --- DASHBOARD STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState('PENDING');

  // --- LOAN APPLICATION STATE ---
  const [step, setStep] = useState(0); // 0: Dashboard/Calc, 1: Details, 2: Docs, 3: Success
  const [loanType, setLoanType] = useState('PERSONAL');
  const [amount, setAmount] = useState(5000);
  const [duration, setDuration] = useState(12); // Months
  const [purpose, setPurpose] = useState('');
  
  const [formData, setFormData] = useState({
    employmentStatus: 'Employed',
    employerName: '',
    monthlyIncome: '',
    housingStatus: 'Rent'
  });

  const [uploads, setUploads] = useState({
    idProof: null,
    incomeProof: null,
    addressProof: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
        setKycStatus(currentUser.kycStatus || 'UNVERIFIED');
        setLoading(false);
    };
    init();
  }, [router]);

  // --- CALCULATOR HELPER ---
  const calculateRepayment = () => {
    const rate = loanType === 'PERSONAL' ? 0.12 : loanType === 'BUSINESS' ? 0.15 : 0.05;
    const totalInterest = amount * rate * (duration / 12);
    const totalPayable = amount + totalInterest;
    const monthly = totalPayable / duration;
    return { monthly: monthly.toFixed(2), total: totalPayable.toFixed(2), rate: (rate * 100).toFixed(1) };
  };
  const { monthly, total, rate } = calculateRepayment();

  // --- FILE UPLOAD HANDLER ---
  const handleFileUpload = async (field, file) => {
    if (!file) return;

    // 1. Set status to uploading
    setUploads(prev => ({ ...prev, [field]: { name: file.name, status: 'uploading' } }));

    try {
        const formData = new FormData();
        formData.append('file', file);

        // 2. Send to API
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();

        if (data.success) {
            // 3. Save the returned URL
            setUploads(prev => ({ 
                ...prev, 
                [field]: { name: file.name, url: data.url, status: 'done' } 
            }));
        } else {
            alert("Upload failed. Please try again.");
            setUploads(prev => ({ ...prev, [field]: null }));
        }

    } catch (e) {
        console.error(e);
        alert("Error uploading file.");
        setUploads(prev => ({ ...prev, [field]: null }));
    }
  };

  // --- FINAL SUBMISSION HANDLER ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
        const res = await fetch('/api/loans/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                amount,
                duration,
                purpose,
                ...formData,
                // Send the URLs we got from the upload step
                documents: {
                    idProof: uploads.idProof?.url,       
                    incomeProof: uploads.incomeProof?.url, 
                    addressProof: uploads.addressProof?.url 
                }
            })
        });

        if (res.ok) {
            setStep(3); // Success
        } else {
            alert("Application failed. Please try again.");
        }
    } catch (error) {
        console.error(error);
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
                    {/* ACTIVE LINK */}
                    <SidebarLink href="/dashboard/loans" icon={Landmark} label="Loan Services" active={true} />
                    <SidebarLink href="/dashboard/grants" icon={Gift} label="Grants & Aid" />
                    <SidebarLink href="/dashboard/invest" icon={TrendingUp} label="Investments" />
                    <SidebarLink href="/dashboard/tax" icon={FileText} label="IRS Tax Refund" />
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

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Menu size={24} /></button>
                <h1 className="text-lg md:text-xl font-bold text-slate-900">Loan Services</h1>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition"><Bell size={20} /></button>
                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white">{user.firstName[0]}</div>
            </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 custom-scrollbar">
            <div className="max-w-4xl mx-auto pb-20">
                
                {/* --- LOAN STEP 0: DASHBOARD / CALCULATOR --- */}
                {step === 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Hero Banner */}
                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10 md:flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md"><Zap size={16} className="text-yellow-400"/></div>
                                        <span className="text-sm font-bold text-slate-300">Pre-Approved Offer</span>
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Instant Cash up to $50,000</h2>
                                    <p className="text-slate-400 mb-6 max-w-sm">Competitive rates starting at 5% APR. No hidden fees. Funds in your account within 24 hours.</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 w-full md:w-80">
                                    <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Monthly</span><span className="font-bold">${monthly}</span></div>
                                    <div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Total Interest</span><span className="font-bold text-green-400">${(total - amount).toFixed(2)}</span></div>
                                    <button onClick={() => setStep(1)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-blue-900/50">Apply Now</button>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Calculator */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Calculator size={20} className="text-blue-500"/> Loan Calculator
                                </h3>

                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <label className="text-xs font-bold text-slate-400 uppercase">I want to borrow</label>
                                            <div className="flex items-center gap-1"><span className="text-slate-400 font-bold">$</span><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-24 text-right font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none"/></div>
                                        </div>
                                        <input type="range" min="1000" max="50000" step="500" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Duration (Months)</label>
                                            <span className="font-bold text-slate-900">{duration} Months</span>
                                        </div>
                                        <input type="range" min="3" max="60" step="3" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3 pt-4">
                                        {[{id:'PERSONAL', l:'Personal', i:<Briefcase size={18}/>}, {id:'BUSINESS', l:'Business', i:<Landmark size={18}/>}, {id:'AUTO', l:'Auto Loan', i:<Car size={18}/>}].map(t => (
                                            <button key={t.id} onClick={() => setLoanType(t.id)} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${loanType === t.id ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                                                {t.i} <span className="text-[10px] font-bold uppercase">{t.l}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-4">Repayment Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Principal</span><span className="font-bold">${amount.toLocaleString()}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Interest Rate</span><span className="font-bold text-green-600">{rate}%</span></div>
                                        <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Term</span><span className="font-bold">{duration} Months</span></div>
                                        <div className="pt-4 border-t border-slate-100">
                                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Monthly Payment</p>
                                            <p className="text-4xl font-bold text-blue-600">${monthly}</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setStep(1)} className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                    Start Application <ChevronRight size={16}/>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- LOAN STEP 1: FORM --- */}
                {step === 1 && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setStep(0)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ArrowRightLeft size={20}/></button>
                            <div><h2 className="text-xl font-bold text-slate-900">Personal Details</h2><p className="text-sm text-slate-500">Step 1 of 2</p></div>
                        </div>

                        <div className="space-y-5">
                            <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Loan Purpose</label><input type="text" placeholder="e.g. Home Renovation" className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500" value={purpose} onChange={(e) => setPurpose(e.target.value)} /></div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Employment</label><select className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500" value={formData.employmentStatus} onChange={(e) => setFormData({...formData, employmentStatus: e.target.value})}><option>Employed</option><option>Self-Employed</option><option>Business Owner</option><option>Retired</option></select></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Housing</label><select className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500" value={formData.housingStatus} onChange={(e) => setFormData({...formData, housingStatus: e.target.value})}><option>Rent</option><option>Own</option><option>Family</option></select></div>
                            </div>

                            <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Employer Name</label><input type="text" placeholder="Company Name" className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500" value={formData.employerName} onChange={(e) => setFormData({...formData, employerName: e.target.value})} /></div>
                            
                            <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Monthly Income ($)</label><input type="number" placeholder="0.00" className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500" value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})} /></div>
                        </div>

                        <button onClick={() => setStep(2)} disabled={!formData.monthlyIncome || !purpose} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition">Next Step</button>
                    </div>
                )}

                {/* --- LOAN STEP 2: DOCUMENTS --- */}
                {step === 2 && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ArrowRightLeft size={20}/></button>
                            <div><h2 className="text-xl font-bold text-slate-900">Upload Documents</h2><p className="text-sm text-slate-500">Step 2 of 2</p></div>
                        </div>

                        <div className="space-y-4">
                            {[
                                {id:'idProof', label:'Government ID', sub:'Passport / Driver License', icon:<FileText size={20}/>},
                                {id:'incomeProof', label:'Proof of Income', sub:'Recent Payslip / Bank Statement', icon:<DollarSign size={20}/>},
                                {id:'addressProof', label:'Proof of Address', sub:'Utility Bill / Lease Agreement', icon:<Home size={20}/>}
                            ].map((doc) => (
                                <div key={doc.id} className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center gap-4 relative">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${uploads[doc.id]?.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                        {uploads[doc.id]?.status === 'done' ? <CheckCircle size={20}/> : doc.icon}
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

                        <div className="mt-6 p-4 bg-yellow-50 rounded-xl flex gap-3 text-yellow-800">
                            <AlertCircle size={20} className="shrink-0"/>
                            <p className="text-xs leading-relaxed">By submitting, you certify that all information is accurate. Finora Bank reserves the right to request additional verification.</p>
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || !uploads.idProof || !uploads.incomeProof} 
                            className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin"/> : 'Submit Application'}
                        </button>
                    </div>
                )}

                {/* --- LOAN STEP 3: SUCCESS --- */}
                {step === 3 && (
                    <div className="max-w-md mx-auto text-center animate-in zoom-in duration-500 pt-10">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
                        <p className="text-slate-500 mb-8 text-sm">
                            Your request for <strong>${amount.toLocaleString()}</strong> has been submitted. Reference ID: <span className="font-mono text-slate-900 bg-slate-100 px-1 rounded">LN-{Math.floor(Math.random()*10000)}</span>
                        </p>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-left mb-6 shadow-sm">
                            <h4 className="font-bold text-xs text-slate-400 uppercase mb-4">What happens next?</h4>
                            <ul className="space-y-4">
                                {['Document verification (24h)', 'Credit assessment', 'Funds disbursement'].map((text, i) => (
                                    <li key={i} className="flex gap-3 text-sm items-center">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                                        <span className="text-slate-700 font-medium">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button onClick={() => setStep(0)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">Return to Loan Dashboard</button>
                    </div>
                )}

            </div>
        </div>
      </main>
    </div>
  );
}