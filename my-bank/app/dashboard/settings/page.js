"use client";

import React, { useState, useEffect } from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, Settings, LogOut, Bell, 
  Menu, X, FileText, HelpCircle, Landmark, ShieldAlert, TrendingUp, 
  Globe, Download, Send, User, Lock, Mail, Smartphone, MapPin, 
  Camera, CheckCircle, Loader2, Shield, AlertTriangle
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

export default function SettingsPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState('PENDING');

  // Settings State
  const [activeTab, setActiveTab] = useState('PROFILE'); // PROFILE, SECURITY, PREFS
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Forms
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', country: ''
  });

  const [securityData, setSecurityData] = useState({
    currentPass: '', newPass: '', confirmPass: '', twoFactor: false
  });

  const [prefs, setPrefs] = useState({
    emailAlerts: true, pushNotifs: true, marketing: false
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
        setKycStatus(currentUser.kycStatus || 'UNVERIFIED');
        
        // Populate fields
        setProfileData({
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            address: currentUser.streetAddress || '',
            city: currentUser.city || '',
            country: currentUser.country || ''
        });
        
        setLoading(false);
    };
    init();
  }, [router]);

  // --- HANDLERS ---
  const handleSave = async (section) => {
      setIsSaving(true);
      setSuccessMsg('');

      // Simulate API Call
      setTimeout(() => {
          setIsSaving(false);
          setSuccessMsg(`${section} updated successfully!`);
          
          // If updating profile, update local storage too
          if (section === 'Profile') {
              const updatedUser = { ...user, ...profileData };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
          }

          setTimeout(() => setSuccessMsg(''), 3000);
      }, 1500);
  };

  const handleAvatarUpload = async (file) => {
      if (!file) return;
      // Here you would implement the file upload logic to /api/upload
      // For now, we'll just simulate it
      alert("Profile picture upload coming soon!");
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
                    <SidebarLink href="/dashboard/tax" icon={FileText} label="IRS Tax Refund" />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/kyc" icon={ShieldAlert} label="Verification Center" />
                    {/* ACTIVE LINK */}
                    <SidebarLink href="/dashboard/settings" icon={Settings} label="Settings" active={true} />
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
      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-slate-50">
        
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition"><Menu size={24} /></button>
                <h1 className="text-lg md:text-xl font-bold text-slate-900">Settings</h1>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition"><Bell size={20} /></button>
                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white">{user.firstName[0]}</div>
            </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">

                <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>

                {/* TABS */}
                <div className="flex p-1 bg-white rounded-xl border border-slate-200 w-fit mb-8">
                    {[
                        { id: 'PROFILE', label: 'My Profile', icon: <User size={16}/> },
                        { id: 'SECURITY', label: 'Security', icon: <Lock size={16}/> },
                        { id: 'PREFS', label: 'Preferences', icon: <Settings size={16}/> },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSuccessMsg(''); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- PROFILE TAB --- */}
                {activeTab === 'PROFILE' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Avatar Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl">
                                    {user.firstName[0]}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-slate-700 transition border-2 border-white">
                                    <Camera size={14}/>
                                    <input type="file" className="hidden" onChange={(e) => handleAvatarUpload(e.target.files[0])}/>
                                </label>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-lg font-bold text-slate-900">{user.firstName} {user.lastName}</h3>
                                <p className="text-sm text-slate-500">{user.email}</p>
                                <p className="text-xs text-blue-600 font-bold mt-1 bg-blue-50 px-2 py-1 rounded-full inline-block">Member since 2026</p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-6">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">First Name</label><input type="text" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Last Name</label><input type="text" value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label><div className="relative mt-1"><Mail className="absolute left-3 top-3.5 text-slate-400" size={18}/><input type="email" value={profileData.email} disabled className="w-full pl-10 pr-3 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 outline-none cursor-not-allowed"/></div></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label><div className="relative mt-1"><Smartphone className="absolute left-3 top-3.5 text-slate-400" size={18}/><input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div></div>
                                <div className="md:col-span-2"><label className="text-xs font-bold text-slate-400 uppercase ml-1">Street Address</label><div className="relative mt-1"><MapPin className="absolute left-3 top-3.5 text-slate-400" size={18}/><input type="text" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">City</label><input type="text" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Country</label><input type="text" value={profileData.country} onChange={(e) => setProfileData({...profileData, country: e.target.value})} className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div>
                            </div>
                            <div className="flex items-center gap-4 mt-8">
                                <button onClick={() => handleSave('Profile')} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50">
                                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : 'Save Changes'}
                                </button>
                                {successMsg && <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-in fade-in"><CheckCircle size={16}/> {successMsg}</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'SECURITY' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Lock size={20} className="text-blue-500"/> Change Password</h3>
                            <div className="space-y-4 max-w-lg">
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Current Password</label><input type="password" value={securityData.currentPass} onChange={(e) => setSecurityData({...securityData, currentPass: e.target.value})} className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">New Password</label><input type="password" value={securityData.newPass} onChange={(e) => setSecurityData({...securityData, newPass: e.target.value})} className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Confirm New Password</label><input type="password" value={securityData.confirmPass} onChange={(e) => setSecurityData({...securityData, confirmPass: e.target.value})} className="w-full p-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"/></div>
                            </div>
                            <div className="flex items-center gap-4 mt-8">
                                <button onClick={() => handleSave('Password')} disabled={isSaving || !securityData.currentPass || !securityData.newPass} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-50">
                                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : 'Update Password'}
                                </button>
                                {successMsg && <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-in fade-in"><CheckCircle size={16}/> {successMsg}</span>}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Shield size={20} className="text-green-500"/> Two-Factor Authentication</h3>
                                <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={securityData.twoFactor} onChange={() => setSecurityData({...securityData, twoFactor: !securityData.twoFactor})} className="sr-only peer"/>
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* --- PREFS TAB --- */}
                {activeTab === 'PREFS' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                             <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Bell size={20} className="text-purple-500"/> Notifications</h3>
                             
                             <div className="space-y-6">
                                {[
                                    { id: 'emailAlerts', l: 'Email Alerts', d: 'Receive emails about your account activity and transactions.' },
                                    { id: 'pushNotifs', l: 'Push Notifications', d: 'Receive real-time alerts on your mobile device.' },
                                    { id: 'marketing', l: 'Marketing Emails', d: 'Receive news, updates, and special offers from Optima.' },
                                ].map(item => (
                                    <div key={item.id} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-bold text-slate-900">{item.l}</p>
                                            <p className="text-xs text-slate-500 mt-1 max-w-sm">{item.d}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={prefs[item.id]} onChange={() => setPrefs({...prefs, [item.id]: !prefs[item.id]})} className="sr-only peer"/>
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                             </div>
                        </div>
                        
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mt-8">
                             <h3 className="font-bold text-red-600 flex items-center gap-2 mb-2"><AlertTriangle size={20}/> Danger Zone</h3>
                             <p className="text-sm text-red-800 mb-4">Deleting your account is permanent and cannot be undone.</p>
                             <button className="bg-white border border-red-200 text-red-600 hover:bg-red-100 px-6 py-2 rounded-lg text-sm font-bold transition">Delete Account</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </main>
    </div>
  );
}