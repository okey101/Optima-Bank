"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Home, Settings, LogOut, Wallet, ShieldCheck, FileText, 
  UploadCloud, Camera, CheckCircle, ChevronRight, Loader2, User, 
  X, AlertTriangle, MapPin, Calendar, CreditCard
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// --- HELPER: Convert File/Blob to Base64 ---
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// ✅ THIS EXPORT IS REQUIRED FOR THE PAGE TO WORK
export default function KYCPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // --- KYC STATE ---
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState({ front: null, back: null, selfie: null });
  
  // --- NEW FORM DATA ---
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    idType: 'National ID',
    idNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('NOT_VERIFIED'); 

  // --- CAMERA STATE ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  // --- FETCH USER & REFRESH STATUS ---
  useEffect(() => {
    const initializeUser = async () => {
        const storedUser = localStorage.getItem('user');
        
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const parsedLocalUser = JSON.parse(storedUser);
        
        // 1. Set initial state from local storage (fast load)
        setUser(parsedLocalUser);
        setStatus(parsedLocalUser.kycStatus || 'NOT_VERIFIED');
        setFormData(prev => ({...prev, phone: parsedLocalUser.phone || ''}));

        // 2. Silently fetch the LATEST data from server
        try {
            const res = await fetch('/api/user/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: parsedLocalUser.email })
            });

            if (res.ok) {
                const data = await res.json();
                
                // 3. Update Local Storage & State with fresh DB data
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                setStatus(data.user.kycStatus || 'NOT_VERIFIED');
            }
        } catch (error) {
            console.error("Failed to refresh user data", error);
        }
    };

    initializeUser();

    return () => stopCamera();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File too large (Max 4MB)");
        return;
      }
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const removeFile = (type) => setFiles(prev => ({ ...prev, [type]: null }));

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied. Please allow camera permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setFiles(prev => ({ ...prev, selfie: file }));
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const frontBase64 = await toBase64(files.front);
        const backBase64 = await toBase64(files.back);
        const selfieBase64 = await toBase64(files.selfie);

        const res = await fetch('/api/kyc/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: user.email,
                ...formData, // Send all text fields
                front: frontBase64,
                back: backBase64,
                selfie: selfieBase64
            })
        });

        if (res.ok) {
            const updatedUser = { ...user, kycStatus: 'PENDING' };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setStatus('PENDING');
            setUser(updatedUser);
        } else {
            const data = await res.json();
            alert(data.message || "Upload failed. Please try again.");
        }
    } catch (error) {
        alert("Connection error. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100">
            <div className="relative w-40 h-12">
                <Image src="/logo.png" alt="Finora Logo" fill className="object-contain object-left" priority />
            </div>
        </div>
        <nav className="p-6 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Main Menu</p>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <Home size={20} /> Dashboard
            </Link>
            <Link href="/dashboard/deposit" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <Wallet size={20} /> Deposit
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
                <Settings size={20} /> Settings
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition">
                <LogOut size={20} /> Logout
            </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50">
        
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 hidden md:block">KYC Verification</h1>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-6">
                <div className="relative pl-6 border-l border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-800 leading-none">{user.firstName} {user.lastName}</p>
                            <p className="text-[10px] text-slate-500 font-medium pt-1">Personal Account</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20 uppercase ring-2 ring-white">
                            {user.firstName[0]}
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* KYC CONTENT SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* --- STATE: PENDING --- */}
                {status === 'PENDING' && (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-100">
                        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Under Review</h2>
                        <p className="text-slate-500 mb-8">We are currently reviewing your documents.</p>
                        <Link href="/dashboard" className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold">Back to Dashboard</Link>
                    </div>
                )}

                {/* --- STATE: VERIFIED --- */}
                {status === 'VERIFIED' && (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-100">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck size={48} /></div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Account Verified</h2>
                        <p className="text-slate-500 mb-8">You have full access to all features.</p>
                        <Link href="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Go to Dashboard</Link>
                    </div>
                )}

                {/* --- STATE: REJECTED (New) --- */}
                {status === 'REJECTED' && (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-red-100">
                        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={48} /></div>
                        <h2 className="text-3xl font-bold text-red-600 mb-2">Verification Failed</h2>
                        <p className="text-slate-500 mb-8">Your previous application was rejected. Please ensure your photos are clear and details match your ID.</p>
                        <button onClick={() => setStatus('NOT_VERIFIED')} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-200">Try Again</button>
                    </div>
                )}

                {/* --- STATE: FORM (NOT_VERIFIED) --- */}
                {status === 'NOT_VERIFIED' && (
                    <>
                        <div className="flex items-center justify-between mb-8 px-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= i ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>{i}</div>
                            ))}
                        </div>

                        {/* STEP 1: Personal Info */}
                        {step === 1 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold mb-6">Personal Details</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-slate-500">First Name</label><input disabled value={user.firstName} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" /></div>
                                        <div><label className="text-xs font-bold text-slate-500">Last Name</label><input disabled value={user.lastName} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" /></div>
                                    </div>
                                    <div><label className="text-xs font-bold text-slate-500">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200" /></div>
                                    <div><label className="text-xs font-bold text-slate-500">Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200" /></div>
                                </div>
                                <button onClick={() => setStep(2)} disabled={!formData.dateOfBirth} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">Next Step</button>
                            </div>
                        )}

                        {/* STEP 2: Address */}
                        {step === 2 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold mb-6">Residential Address</h3>
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold text-slate-500">Street Address</label><input name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200" placeholder="123 Main St" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-slate-500">City</label><input name="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200" /></div>
                                        <div><label className="text-xs font-bold text-slate-500">State/Province</label><input name="state" value={formData.state} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-slate-500">Zip Code</label><input name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200" /></div>
                                        <div><label className="text-xs font-bold text-slate-500">Country</label><input name="country" value={formData.country} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200" /></div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold text-slate-500">Back</button>
                                    <button onClick={() => setStep(3)} disabled={!formData.streetAddress || !formData.city} className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">Next Step</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: ID Upload */}
                        {step === 3 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold mb-6">Identity Document</h3>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Document Type</label>
                                        <select name="idType" value={formData.idType} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200">
                                            <option>National ID</option>
                                            <option>Passport</option>
                                            <option>Driver License</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">ID Number</label>
                                        <input name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full p-3 bg-white rounded-xl border border-slate-200" placeholder="Enter ID Number" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {['front', 'back'].map(side => (
                                        <div key={side}>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{side} Side</label>
                                            {!files[side] ? (
                                                <label className="border-2 border-dashed border-slate-200 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                                                    <UploadCloud className="text-blue-600 mb-1" size={20} />
                                                    <span className="text-xs text-slate-400">Upload</span>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileChange(side, e)} accept="image/*" />
                                                </label>
                                            ) : (
                                                <div className="bg-green-50 border border-green-100 rounded-xl h-32 flex flex-col items-center justify-center relative">
                                                    <CheckCircle className="text-green-600 mb-1" size={20} />
                                                    <span className="text-xs text-green-700 font-bold">Uploaded</span>
                                                    <button onClick={() => removeFile(side)} className="absolute top-1 right-1 p-1 bg-white rounded-full shadow text-red-500"><X size={12}/></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button onClick={() => setStep(2)} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold text-slate-500">Back</button>
                                    <button onClick={() => setStep(4)} disabled={!files.front || !files.back || !formData.idNumber} className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">Next Step</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Camera */}
                        {step === 4 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold mb-4">Face Verification</h3>
                                <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[3/4] max-w-sm mx-auto shadow-2xl mb-6">
                                    <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? 'opacity-100' : 'opacity-0'}`} />
                                    <canvas ref={canvasRef} className="hidden" />
                                    
                                    {!isCameraActive && !files.selfie && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                            <button onClick={startCamera} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">Start Camera</button>
                                        </div>
                                    )}
                                    {files.selfie && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white">
                                            <CheckCircle size={48} className="text-green-500 mb-2"/>
                                            <p className="font-bold">Photo Captured</p>
                                            <button onClick={() => setFiles(prev => ({...prev, selfie: null}))} className="text-sm underline mt-2 text-slate-300">Retake</button>
                                        </div>
                                    )}
                                    {isCameraActive && (
                                        <div className="absolute bottom-6 left-0 w-full flex justify-center z-20">
                                            <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20"><div className="w-12 h-12 bg-white rounded-full"></div></button>
                                        </div>
                                    )}
                                </div>
                                
                                <button onClick={handleSubmit} disabled={!files.selfie || isSubmitting} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Verification'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}