"use client";

import React, { useState, useEffect } from 'react';
import { 
  Home, ArrowRightLeft, CreditCard, Settings, LogOut, Bell, 
  Menu, X, FileText, HelpCircle, Landmark, ShieldAlert, TrendingUp, 
  Globe, Download, Send, Gift, CheckCircle, Clock, ChevronRight, 
  Briefcase, GraduationCap, Home as HomeIcon, Plus, Loader2
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

export default function GrantsPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('EXPLORE'); // EXPLORE, APPLICATIONS
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Mock Grants Data
  const availableGrants = [
    { id: 1, title: "Small Business Boost", amount: "$10,000", icon: Briefcase, color: "bg-blue-100 text-blue-600", desc: "Support for startups and local businesses." },
    { id: 2, title: "Education Support", amount: "$5,000", icon: GraduationCap, color: "bg-purple-100 text-purple-600", desc: "Financial aid for tuition and books." },
    { id: 3, title: "Homeowner Relief", amount: "$15,000", icon: HomeIcon, color: "bg-green-100 text-green-600", desc: "Assistance for first-time homebuyers." },
  ];

  const [myApplications, setMyApplications] = useState([]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/login'); return; }
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
        setLoading(false);
    };
    init();
  }, [router]);

  const handleApply = (grant) => {
      setSelectedGrant(grant);
  };

  const submitApplication = () => {
      setIsApplying(true);
      setTimeout(() => {
          setIsApplying(false);
          setApplicationSuccess(true);
          const newApp = {
              id: Date.now(),
              title: selectedGrant.title,
              amount: selectedGrant.amount,
              status: 'Pending Review',
              date: new Date().toLocaleDateString()
          };
          setMyApplications([newApp, ...myApplications]);
          
          setTimeout(() => {
              setApplicationSuccess(false);
              setSelectedGrant(null);
              setActiveTab('APPLICATIONS');
          }, 2000);
      }, 1500);
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
                    {/* ACTIVE LINK */}
                    <SidebarLink href="/dashboard/grants" icon={Gift} label="Grants & Aid" active={true} />
                </div>
            </div>
            <div>
                <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</p>
                <div className="space-y-1">
                    <SidebarLink href="/dashboard/kyc" icon={ShieldAlert} label="Verification Center" />
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
                <h1 className="text-lg md:text-xl font-bold text-slate-900">Grants & Aid</h1>
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
                        { id: 'EXPLORE', label: 'Explore Grants', icon: <Gift size={16}/> },
                        { id: 'APPLICATIONS', label: 'My Applications', icon: <FileText size={16}/> },
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

                {/* --- CONTENT: EXPLORE --- */}
                {activeTab === 'EXPLORE' && !selectedGrant && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {availableGrants.map(grant => (
                            <div key={grant.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col justify-between h-full">
                                <div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${grant.color}`}>
                                        <grant.icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900">{grant.title}</h3>
                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{grant.desc}</p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <span className="font-bold text-slate-900 text-lg">{grant.amount}</span>
                                    <button onClick={() => handleApply(grant)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition">Apply Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- CONTENT: APPLYING --- */}
                {selectedGrant && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto animate-in zoom-in duration-300">
                        <button onClick={() => setSelectedGrant(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold mb-6 flex items-center gap-1">← Back to Grants</button>
                        
                        {applicationSuccess ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32}/>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
                                <p className="text-slate-500 mt-2">We have received your request for the {selectedGrant.title}.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selectedGrant.color}`}>
                                        <selectedGrant.icon size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{selectedGrant.title}</h2>
                                        <p className="text-slate-500">Maximum Funding: {selectedGrant.amount}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                                        <input type="text" value={`${user.firstName} ${user.lastName}`} disabled className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Reason for Application</label>
                                        <textarea placeholder="Tell us why you need this grant..." className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:border-blue-500 h-32 resize-none"></textarea>
                                    </div>
                                    <button onClick={submitApplication} disabled={isApplying} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
                                        {isApplying ? <Loader2 className="animate-spin" /> : 'Submit Application'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* --- CONTENT: APPLICATIONS --- */}
                {activeTab === 'APPLICATIONS' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900">Application History</h3>
                        </div>
                        {myApplications.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <FileText size={48} className="mx-auto text-slate-200 mb-4"/>
                                <p className="text-sm">You haven't applied for any grants yet.</p>
                                <button onClick={() => setActiveTab('EXPLORE')} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Explore Available Grants</button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {myApplications.map(app => (
                                    <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                                <Clock size={20}/>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{app.title}</h4>
                                                <p className="text-xs text-slate-500">Applied on {app.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">{app.amount}</p>
                                            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">{app.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
      </main>
    </div>
  );
}