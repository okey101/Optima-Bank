"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Home, ArrowRightLeft, CreditCard, Settings, LogOut, 
  Wallet, ShieldCheck, FileText, UploadCloud, Camera, CheckCircle, 
  ChevronRight, AlertTriangle, Loader2, User, X, RefreshCw
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

export default function KYCPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // --- KYC STATE ---
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState({ front: null, back: null, selfie: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- CAMERA STATE (For Step 3) ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [scanStatus, setScanStatus] = useState("idle"); // idle, scanning, captured

  // --- FETCH USER ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.kycStatus === 'PENDING' || parsedUser.kycStatus === 'VERIFIED') {
        setIsSubmitted(true);
      }
    }

    // Cleanup camera on unmount
    return () => stopCamera();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // --- FILE HANDLING (Step 2) ---
  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File is too large! Please upload an image smaller than 4MB.");
        return;
      }
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    if (type === 'selfie') {
        setScanStatus("idle");
    }
  };

  // --- CAMERA LOGIC (Step 3) ---
  const startCamera = async () => {
    setIsCameraActive(true);
    setScanStatus("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } // Use front camera on mobile
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Could not access camera. Please allow camera permissions.");
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
      
      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob/file
      canvas.toBlob((blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setFiles(prev => ({ ...prev, selfie: file }));
        setScanStatus("captured");
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  // --- SUBMIT LOGIC ---
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
                front: frontBase64,
                back: backBase64,
                selfie: selfieBase64
            })
        });

        if (res.ok) {
            setIsSubmitted(true);
            const updatedUser = { ...user, kycStatus: 'PENDING' };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } else {
            const data = await res.json();
            alert(data.message || "Upload failed. Please try again.");
        }

    } catch (error) {
        console.error(error);
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

        {/* KYC CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* STATUS BANNER */}
                {isSubmitted ? (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-100 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Verification Pending</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            Your documents are being reviewed. This usually takes <strong>1-24 hours</strong>.
                        </p>
                        <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-500/30">
                            Back to Dashboard
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-slate-900">Verify Your Identity</h2>
                            <p className="text-slate-500 mt-2">Complete the steps below to unlock full account features.</p>
                        </div>

                        {/* STEPS INDICATOR */}
                        <div className="flex items-center justify-between relative mb-12 px-4">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
                            
                            <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= 1 ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 border-white text-slate-400'}`}>1</div>
                                <span className="text-xs font-bold uppercase tracking-wider bg-slate-50 px-2">Info</span>
                            </div>
                            <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= 2 ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 border-white text-slate-400'}`}>2</div>
                                <span className="text-xs font-bold uppercase tracking-wider bg-slate-50 px-2">ID Card</span>
                            </div>
                            <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= 3 ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 border-white text-slate-400'}`}>3</div>
                                <span className="text-xs font-bold uppercase tracking-wider bg-slate-50 px-2">Face</span>
                            </div>
                        </div>

                        {/* --- STEP 1: CONFIRM INFO --- */}
                        {step === 1 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <User className="text-blue-600" /> Confirm Personal Details
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <label className="text-xs font-bold text-slate-400 uppercase">First Name</label>
                                        <p className="font-bold text-slate-900 text-lg">{user.firstName}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Last Name</label>
                                        <p className="font-bold text-slate-900 text-lg">{user.lastName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2">
                                    Details are Correct <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                        {/* --- STEP 2: UPLOAD ID --- */}
                        {step === 2 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <FileText className="text-blue-600" /> Upload ID Document
                                </h3>
                                <p className="text-slate-500 text-sm mb-6">Upload a clear photo of your ID Front and Back.</p>
                                
                                {/* Front Upload */}
                                <div className="mb-6">
                                    <label className="text-sm font-bold text-slate-700 mb-2 block">Front Side</label>
                                    {!files.front ? (
                                        <label className="border-2 border-dashed border-slate-200 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
                                            <UploadCloud className="text-blue-600 mb-2" size={24} />
                                            <p className="text-sm font-bold text-slate-500">Click to upload Front</p>
                                            <input type="file" className="hidden" onChange={(e) => handleFileChange('front', e)} accept="image/*,.pdf" />
                                        </label>
                                    ) : (
                                        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-900">{files.front.name}</span>
                                            <button onClick={() => removeFile('front')} className="p-2 text-red-500"><X size={18} /></button>
                                        </div>
                                    )}
                                </div>

                                {/* Back Upload */}
                                <div className="mb-8">
                                    <label className="text-sm font-bold text-slate-700 mb-2 block">Back Side</label>
                                    {!files.back ? (
                                        <label className="border-2 border-dashed border-slate-200 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
                                            <UploadCloud className="text-blue-600 mb-2" size={24} />
                                            <p className="text-sm font-bold text-slate-500">Click to upload Back</p>
                                            <input type="file" className="hidden" onChange={(e) => handleFileChange('back', e)} accept="image/*,.pdf" />
                                        </label>
                                    ) : (
                                        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-900">{files.back.name}</span>
                                            <button onClick={() => removeFile('back')} className="p-2 text-red-500"><X size={18} /></button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 rounded-xl">Back</button>
                                    <button 
                                        onClick={() => setStep(3)} 
                                        disabled={!files.front || !files.back}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- STEP 3: LIVE CAMERA CHECK --- */}
                        {step === 3 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Camera className="text-blue-600" /> Face Verification
                                </h3>
                                <p className="text-slate-500 text-sm mb-6">Position your face in the frame to prove liveness.</p>

                                <div className="mb-8 relative rounded-3xl overflow-hidden bg-slate-900 aspect-[3/4] max-w-sm mx-auto shadow-2xl">
                                    
                                    {/* STATE 1: IDLE / CAPTURED */}
                                    {!isCameraActive && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-slate-900">
                                            {files.selfie ? (
                                                <>
                                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
                                                        <CheckCircle size={40} />
                                                    </div>
                                                    <p className="font-bold text-lg">Face Captured</p>
                                                    <button onClick={() => setFiles(prev => ({...prev, selfie: null}))} className="mt-4 text-sm text-slate-400 underline hover:text-white">Retake Photo</button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                                        <User size={40} className="text-slate-500" />
                                                    </div>
                                                    <p className="font-bold text-lg mb-6">Ready to Scan</p>
                                                    <button 
                                                        onClick={startCamera} 
                                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition shadow-lg shadow-blue-500/50"
                                                    >
                                                        Start Camera
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* VIDEO ELEMENT */}
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? 'opacity-100' : 'opacity-0'}`} 
                                    />
                                    <canvas ref={canvasRef} className="hidden" />

                                    {/* STATE 2: SCANNING OVERLAY */}
                                    {isCameraActive && (
                                        <>
                                            {/* Dark Mask with Oval Cutout */}
                                            <div className="absolute inset-0 bg-slate-900/60 z-10">
                                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-white/50 rounded-[50%] shadow-[0_0_0_9999px_rgba(15,23,42,0.8)] overflow-hidden">
                                                     {/* Scanning Line Animation */}
                                                     <div className="w-full h-1 bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                                 </div>
                                            </div>

                                            {/* Instructions */}
                                            <div className="absolute top-8 left-0 w-full text-center z-20">
                                                <p className="text-white font-bold text-lg drop-shadow-md">Position face in oval</p>
                                                <p className="text-white/70 text-sm mt-1">Hold still...</p>
                                            </div>

                                            {/* Capture Button */}
                                            <div className="absolute bottom-8 left-0 w-full flex justify-center z-20">
                                                <button 
                                                    onClick={capturePhoto} 
                                                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 transition"
                                                >
                                                    <div className="w-12 h-12 bg-white rounded-full"></div>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Privacy Note */}
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 mb-8">
                                    <ShieldCheck className="text-blue-600 flex-shrink-0" size={20} />
                                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                        We compare this photo with your ID document to verify your identity.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(2)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition">Back</button>
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={!files.selfie || isSubmitting}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Verification'}
                                    </button>
                                </div>
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