"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, Settings, ShieldCheck, ShieldAlert, 
  CheckCircle2, ChevronRight, UploadCloud, Camera, FileText, User, Lock, 
  Loader2, Menu, X, Globe, Download, Send, Landmark, Eye, EyeOff, 
  RefreshCw, Image as ImageIcon, AlertTriangle, Gift, HelpCircle, LogOut, TrendingUp // <--- Added Gift, HelpCircle, LogOut, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- COMPONENTS ---

const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center w-full mb-12 px-4">
    <div className="flex items-center w-full max-w-4xl">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={index} className="flex flex-col items-center relative z-10 flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 border-4 
              ${isActive ? 'bg-blue-600 border-blue-100 text-white shadow-xl scale-110' : 
                (isCompleted ? 'bg-green-500 border-green-100 text-white' : 'bg-white border-slate-100 text-slate-400')}`}>
              {isCompleted ? <CheckCircle2 size={20} /> : stepNum}
            </div>
            <p className={`text-xs mt-3 font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step}</p>
            {index !== steps.length - 1 && (
              <div className="absolute top-6 left-1/2 w-full h-1 -z-10">
                <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-slate-100'}`}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const FileUpload = ({ label, onFileSelect, uploadedFile }) => {
  const inputRef = useRef(null);

  return (
    <div 
      onClick={() => inputRef.current.click()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group h-64 flex flex-col justify-center items-center relative overflow-hidden
      ${uploadedFile ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} 
        className="hidden" 
        accept="image/jpeg,image/png,application/pdf"
      />
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition shadow-sm ${uploadedFile ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400 group-hover:text-blue-500'}`}>
        {uploadedFile ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
      </div>
      <p className="text-base font-bold text-slate-800">{uploadedFile ? 'File Selected' : label}</p>
      <p className="text-sm text-slate-400 mt-2 px-4 truncate w-full">
        {uploadedFile ? uploadedFile.name : 'Click to browse files'}
      </p>
    </div>
  );
};

// --- SHARED SIDEBAR COMPONENT ---
const SidebarLink = ({ icon: Icon, label, href, active }) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default function KYCPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Start loading true
  const [statusLoading, setStatusLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('UNVERIFIED');
  
  const [step, setStep] = useState(1);
  const [showSSN, setShowSSN] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', dob: '', address: '', 
    ssn: '', nationality: 'United States' 
  });
  const [idType, setIdType] = useState('passport');
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  
  // Selfie State
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const selfieInputRef = useRef(null);

  // --- 1. INITIAL STATUS CHECK ---
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) {
            router.push('/login');
            return;
        }
        
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);

        try {
            // Fetch fresh status from DB
            const res = await fetch('/api/user/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: parsedUser.email })
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentStatus(data.user.kycStatus || 'UNVERIFIED');
                // Update local storage to keep dashboard in sync
                localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...data.user }));
            }
        } catch (error) {
            console.error("Status Check Error", error);
        } finally {
            setLoading(false);
            setStatusLoading(false);
        }
    };

    init();
  }, [router]);

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    setIsCameraOpen(true);
    setSelfieFile(null); setSelfiePreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("Camera access denied."); setIsCameraOpen(false); }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const file = new File([blob], "selfie_capture.jpg", { type: "image/jpeg" });
        setSelfieFile(file);
        setSelfiePreview(URL.createObjectURL(file));
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleSelfieSelect = (e) => {
    if (e.target.files[0]) {
      setSelfieFile(e.target.files[0]);
      setSelfiePreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  
  const handleDocUpload = (file, side) => {
    if (side === 'front') setIdFront(file);
    if (side === 'back') setIdBack(file);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- SUBMISSION LOGIC ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
        const data = new FormData();
        data.append('email', user?.email || 'unknown');
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('dob', formData.dob);
        data.append('address', formData.address);
        data.append('ssn', formData.ssn);
        data.append('nationality', formData.nationality);
        data.append('idType', idType);

        if (idFront) data.append('idFront', idFront);
        if (idBack) data.append('idBack', idBack);
        if (selfieFile) data.append('selfie', selfieFile);

        const res = await fetch('/api/kyc/submit', { method: 'POST', body: data });

        if (res.ok) {
            setCurrentStatus('PENDING'); // Update local state immediately
            window.scrollTo(0, 0);
        } else {
            alert('Submission failed. Please try again.');
        }
    } catch (error) {
        console.error("KYC Error", error);
        alert('An error occurred.');
    } finally {
        setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
        setLoading(true);
        setTimeout(() => { setLoading(false); setStep(step + 1); }, 500);
    } else {
        handleSubmit(); 
    }
  };
  
  const handleLogout = () => { localStorage.removeItem('user'); router.push('/login'); };

  // --- RENDER STATES ---

  if (statusLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;
  }

  // 1. VERIFIED STATE
  if (currentStatus === 'VERIFIED') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-[2rem] p-12 shadow-2xl max-w-2xl w-full text-center border border-slate-100">
                <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in">
                    <CheckCircle2 size={64} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">You are Verified!</h2>
                <p className="text-slate-500 text-base mb-10 max-w-md mx-auto">
                    Your identity has been confirmed. You now have access to higher transaction limits and premium features.
                </p>
                <button onClick={() => router.push('/dashboard')} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg">
                    Go to Dashboard
                </button>
            </div>
        </div>
      );
  }

  // 2. PENDING STATE
  if (currentStatus === 'PENDING') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-[2rem] p-12 shadow-2xl max-w-2xl w-full text-center border border-slate-100">
                <div className="w-32 h-32 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <ShieldCheck size={64} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Verification In Progress</h2>
                <p className="text-slate-500 text-base mb-10 max-w-lg mx-auto">
                    We are currently reviewing your documents. This process usually takes <strong>24 hours</strong>. We will notify you once completed.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100 inline-block text-left w-full">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-500 font-bold">Current Status</span>
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Pending Review</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Estimated Completion</span>
                        <span className="text-slate-900 font-bold">~24 Hours</span>
                    </div>
                </div>
                <button onClick={() => router.push('/dashboard')} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition">
                    Return to Dashboard
                </button>
            </div>
        </div>
      );
  }

  // 3. REJECTED or UNVERIFIED (Show Form)
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* SIDEBAR */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shrink-0`}>
        <div className="h-40 flex items-center justify-center px-4 border-b border-slate-100 shrink-0 bg-slate-50/30">
             <div className="relative w-full h-32"><Image src="/logo.png" alt="Logo" fill className="object-contain" priority /></div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-slate-400"><X size={24}/></button>
        </div>
        
        {/* User Info in Sidebar */}
        <div className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">{user?.firstName?.[0]}</div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
            </div>
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
                    <SidebarLink href="/dashboard/invest" icon={TrendingUp} label="Investments" />
                    <SidebarLink href="/dashboard/tax" icon={FileText} label="IRS Tax Refund" />
                    {/* ✅ REPLACED BILL PAYMENTS WITH GRANTS */}
                    <SidebarLink href="/dashboard/grants" icon={Gift} label="Grants & Aid" />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/kyc" icon={ShieldCheck} label="Verification Center" active={true} />
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Menu size={24} /></button>
                <h1 className="text-xl font-bold text-slate-900">Verification Center</h1>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <Lock size={14} className="text-green-500" /> 256-bit SSL Secured
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/50">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                
                {/* REJECTED ALERT */}
                {currentStatus === 'REJECTED' && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="text-red-800 font-bold text-sm">Verification Failed</h3>
                            <p className="text-red-600 text-xs mt-1">Your previous application was rejected. Please ensure all documents are clear and valid before resubmitting.</p>
                        </div>
                    </div>
                )}

                {/* Intro Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-10 text-white mb-8 shadow-xl relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"><ShieldAlert size={40} className="text-blue-100"/></div>
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Verify your Identity</h2>
                            <p className="text-blue-100 text-base max-w-2xl leading-relaxed">
                                Complete this process to unlock all banking features.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 flex-1 flex flex-col">
                    <StepIndicator currentStep={step} steps={['Personal Info', 'Document Upload', 'Face Check']} />
                    <div className="flex-1">
                    
                    {/* STEP 1: PERSONAL INFO */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-2xl font-bold text-slate-900">Personal Details</h3>
                                <p className="text-slate-500 mt-1">Please enter your details exactly as they appear on your ID.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2"><label className="text-sm font-bold text-slate-600 ml-1">First Name</label><input name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none" placeholder="e.g. John" /></div>
                                <div className="space-y-2"><label className="text-sm font-bold text-slate-600 ml-1">Last Name</label><input name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none" placeholder="e.g. Doe" /></div>
                                <div className="space-y-2"><label className="text-sm font-bold text-slate-600 ml-1">Date of Birth</label><input name="dob" value={formData.dob} onChange={handleChange} type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none" /></div>
                                <div className="space-y-2"><label className="text-sm font-bold text-slate-600 ml-1">Nationality</label><select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none"><option>United States</option><option>United Kingdom</option><option>Canada</option></select></div>
                                <div className="space-y-2 lg:col-span-2"><label className="text-sm font-bold text-slate-600 ml-1">Home Address</label><input name="address" value={formData.address} onChange={handleChange} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none" placeholder="123 Main St" /></div>
                                <div className="space-y-2 lg:col-span-3">
                                    <label className="text-sm font-bold text-slate-600 ml-1">SSN / Government ID</label>
                                    <div className="relative"><input name="ssn" value={formData.ssn} onChange={handleChange} type={showSSN ? "text" : "password"} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none tracking-widest" /><button onClick={() => setShowSSN(!showSSN)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-2">{showSSN ? <EyeOff size={20}/> : <Eye size={20}/>}</button></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DOCUMENTS */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-2xl font-bold text-slate-900">Document Upload</h3>
                                <p className="text-slate-500 mt-1">Select the type of document you wish to upload.</p>
                            </div>
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                {['passport', 'license', 'id_card'].map(type => (
                                    <button key={type} onClick={() => setIdType(type)} className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 font-bold text-sm capitalize transition-all ${idType === type ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-100 text-slate-500'}`}><div className={`mb-3 p-3 rounded-full ${idType === type ? 'bg-blue-100' : 'bg-slate-50'}`}><FileText size={24}/></div>{type.replace('_', ' ')}</button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FileUpload label="Front Side" onFileSelect={(file) => handleDocUpload(file, 'front')} uploadedFile={idFront} />
                                <FileUpload label="Back Side" onFileSelect={(file) => handleDocUpload(file, 'back')} uploadedFile={idBack} />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SELFIE */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-2xl font-bold text-slate-900">Liveness Check</h3>
                                <p className="text-slate-500 mt-1">Position your face within the frame or upload a photo.</p>
                            </div>
                            <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-400 relative overflow-hidden border-4 border-slate-900">
                                {isCameraOpen && !selfiePreview && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>}
                                {selfiePreview && <img src={selfiePreview} alt="Selfie" className="w-full h-full object-contain" />}
                                {!isCameraOpen && !selfiePreview && <div className="flex flex-col items-center"><User size={40} className="opacity-50 mb-2"/><p>Ready to capture</p></div>}
                                <canvas ref={canvasRef} className="hidden"></canvas>
                            </div>
                            <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
                                <button onClick={() => selfieInputRef.current.click()} className="bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2"><ImageIcon size={20} /> Upload Photo</button>
                                <input type="file" ref={selfieInputRef} onChange={handleSelfieSelect} accept="image/*" className="hidden" />
                                <button onClick={isCameraOpen ? capturePhoto : (selfiePreview ? () => {setSelfiePreview(null); setSelfieFile(null); startCamera();} : startCamera)} className="bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">{isCameraOpen ? <><Camera size={20} /> Capture</> : <><RefreshCw size={20}/> {selfiePreview ? 'Retake' : 'Camera'}</>}</button>
                            </div>
                        </div>
                    )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                        {step > 1 ? <button onClick={() => { setStep(step - 1); stopCamera(); }} className="text-slate-500 text-base font-bold hover:text-slate-800 px-6">Back</button> : <div></div>}
                        <button onClick={handleNext} disabled={loading || (step === 2 && (!idFront || !idBack)) || (step === 3 && !selfieFile)} className="bg-blue-600 text-white px-12 py-4 rounded-xl font-bold text-base shadow-lg hover:bg-blue-700 transition flex items-center gap-3 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={20}/> : (step === 3 ? 'Submit Verification' : 'Continue')}
                            {!loading && <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}