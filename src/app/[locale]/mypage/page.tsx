'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, User, CreditCard, FileText, Shield, LifeBuoy, LogOut, ArrowLeft, Trash2 
} from 'lucide-react';
import { useParams } from 'next/navigation';

export default function MyPage() {
  const [view, setView] = useState<'auth' | 'detail'>('auth');
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false); // Hydration 방지용
  const params = useParams();
  const locale = params?.locale || 'en';

  // 1. 컴포넌트 마운트 확인 (서버/클라이언트 불일치 방지)
  useEffect(() => {
    setIsMounted(true);
    
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!isMounted) return null; // 마운트 전에는 렌더링하지 않음

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/${locale}/mypage` 
      }
    });
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setView('auth');
  };

  const handleSignOut = async () => {
    if(confirm("Are you sure? All your data will be permanently deleted.")) {
      await supabase.auth.signOut();
      alert("Account deleted.");
      setView('auth');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FFFBF5] pb-32 font-sans">
      <Header />

      <main className="px-8 mt-12 space-y-8">
        {view === 'auth' ? (
          <div className="space-y-10 animate-in fade-in duration-500 text-center">
            <section className="space-y-3">
              <h2 className="text-4xl font-black text-[#4A3F35] tracking-tight italic">Identity Archive</h2>
              <p className="text-[10px] text-[#2CC2E4] font-black tracking-[0.3em] uppercase">Meaning Flow</p>
            </section>

            {!user ? (
              <div className="space-y-4 pt-4">
                <button onClick={handleGoogleLogin} className="w-full py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="font-bold text-[#4A3F35]">Continue with Google</span>
                </button>
                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                  <span className="text-[9px] font-bold text-gray-200 uppercase tracking-widest italic">or archive by mail</span>
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                </div>
                <div className="space-y-3">
                  <input type="email" placeholder="Email" className="w-full p-5 bg-white border border-gray-50 rounded-[1.5rem] text-sm focus:ring-1 focus:ring-blue-100 outline-none" />
                  <input type="password" placeholder="Password" className="w-full p-5 bg-white border border-gray-50 rounded-[1.5rem] text-sm focus:ring-1 focus:ring-blue-100 outline-none" />
                </div>
                <button className="w-full py-5 bg-[#2CC2E4] text-white rounded-[1.5rem] font-bold shadow-lg shadow-cyan-100 mt-4 active:scale-95 transition-all">Log in</button>
              </div>
            ) : (
              <div 
                onClick={() => setView('detail')}
                className="p-8 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#2CC2E4] rounded-full flex items-center justify-center text-white text-2xl font-bold italic shadow-lg shadow-cyan-50">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-xl font-bold text-[#4A3F35]">My Profile</h3>
                    <p className="text-[10px] text-gray-400 font-medium tracking-tight">{user.email}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-200 group-hover:text-[#2CC2E4] transition-colors" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('auth')} className="p-3 bg-white rounded-full shadow-sm text-gray-300 active:scale-90 transition-all">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-[#4A3F35]">Settings</h2>
            </div>

            <section className="space-y-8">
              <div className="flex flex-col items-center space-y-3 py-6 text-center">
                <div className="w-20 h-20 bg-[#2CC2E4] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-cyan-50 mb-2">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-[#4A3F35]">{user?.email}</h3>
                <span className="px-4 py-1.5 bg-gray-100 text-gray-400 text-[9px] font-bold rounded-full uppercase tracking-widest italic">Free Member</span>
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em] ml-4">General</p>
                <div className="bg-white rounded-[2.5rem] border border-gray-50 overflow-hidden shadow-sm">
                  <MenuItem icon={CreditCard} title="Subscription" badge="PREMIUM" />
                  <MenuItem icon={LifeBuoy} title="Help & Support" />
                  <MenuItem icon={FileText} title="Privacy Policy" />
                  <MenuItem icon={Shield} title="Terms of Service" last />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button onClick={handleLogOut} className="w-full py-5 bg-white border border-gray-100 text-gray-400 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  <LogOut size={18} /> Log Out
                </button>
                <button onClick={handleSignOut} className="w-full py-5 bg-white border border-red-50 text-red-200 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                  <Trash2 size={18} /> Delete Account
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Google Ads Area */}
        <div className="w-full h-24 bg-gray-50 flex items-center justify-center my-8 rounded-xl border border-dashed border-gray-200">
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Google Ads</span>
        </div>
      </main>

      <p className="text-center text-[9px] text-gray-200 mt-10 uppercase tracking-[0.3em]">Meaning Flow © 2026</p>
    </div>
  );
}

function MenuItem({ icon: Icon, title, badge, last }: any) {
  return (
    <div className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors ${!last ? 'border-b border-gray-50/50' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-[#F8FDFF] text-[#2CC2E4] rounded-xl"><Icon size={18} /></div>
        <span className="font-bold text-[#4A3F35] text-sm">{title}</span>
        {badge && <span className="text-[8px] font-black bg-cyan-50 text-[#2CC2E4] px-2 py-0.5 rounded-md ml-1 tracking-tighter">{badge}</span>}
      </div>
      <ChevronRight size={16} className="text-gray-100" />
    </div>
  );
}