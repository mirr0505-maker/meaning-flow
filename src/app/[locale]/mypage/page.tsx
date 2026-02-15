'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, LogOut, X, 
  Anchor, Bell, CreditCard, HelpCircle, ShieldCheck, Mail, Lock 
} from 'lucide-react';
import { useParams } from 'next/navigation';

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const params = useParams();
  const locale = params?.locale || 'en';

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

  if (!isMounted) return null;

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/${locale}/mypage` }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowProfileModal(false);
  };

  return (
    <div className="w-full font-sans animate-in fade-in duration-500 pt-10">
      <main className="space-y-10">
        {!user ? (
          <div className="text-center space-y-10">
            <div className="space-y-3 pt-10">
              <h2 className="text-[42px] font-black text-[#4A3F35] tracking-tighter italic uppercase leading-none">Identity Archive</h2>
              <p className="text-[10px] text-[#2CC2E4] font-black tracking-[0.3em] uppercase">Connect to Save Your Soul</p>
            </div>
            
            <div className="space-y-4 max-w-sm mx-auto">
              {/* 🚀 구글 로그인 버튼 (구글 마크 포함) */}
              <button onClick={handleGoogleLogin} className="w-full py-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex items-center justify-center gap-4 active:scale-95 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-bold text-[#4A3F35] text-lg">Continue with Google</span>
              </button>

              <div className="flex items-center gap-4 py-4">
                <div className="h-[1px] flex-1 bg-gray-100"></div>
                <span className="text-[9px] font-bold text-gray-200 uppercase tracking-widest italic">or archive by mail</span>
                <div className="h-[1px] flex-1 bg-gray-100"></div>
              </div>

              {/* 🚀 메일 아이디 & 패스워드 입력 영역 */}
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-5 pl-14 bg-white border border-gray-50 rounded-[1.8rem] text-sm outline-none shadow-sm focus:ring-1 focus:ring-blue-100 transition-all" 
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-5 pl-14 bg-white border border-gray-50 rounded-[1.8rem] text-sm outline-none shadow-sm focus:ring-1 focus:ring-blue-100 transition-all" 
                  />
                </div>
                <button className="w-full py-5 bg-[#2CC2E4] text-white rounded-[1.8rem] font-bold shadow-lg shadow-cyan-100 active:scale-95 transition-all mt-2">
                  Sign In / Register
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 로그인 후 UI (기존 유지) */
          <div className="space-y-8">
            <div 
              onClick={() => setShowProfileModal(true)}
              className="p-8 bg-white rounded-[2.8rem] border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer group hover:shadow-md transition-all active:scale-95"
            >
              <div className="flex items-center gap-5 pointer-events-none">
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

            <button onClick={handleLogout} className="w-full py-5 bg-white/50 border border-gray-100 text-gray-400 rounded-[2rem] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        )}
      </main>

      {/* Profile Popup (기존 메뉴 유지) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-6" onClick={() => setShowProfileModal(false)}>
          <div className="bg-[#F8FBFC] w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col gap-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowProfileModal(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition-colors">
              <X size={24} />
            </button>
            <div className="space-y-2 pt-4">
              <h4 className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">Profile</h4>
              <div className="bg-white p-5 rounded-[2rem] border border-gray-50 flex flex-col gap-4 shadow-sm">
                <MenuRow icon={Anchor} title="Identity Anchors" color="text-cyan-400" bgColor="bg-cyan-50" />
                <MenuRow icon={Bell} title="Gentle Reminders" color="text-blue-400" bgColor="bg-blue-50" />
                <MenuRow icon={CreditCard} title="Subscription" color="text-indigo-400" bgColor="bg-indigo-50" last />
              </div>
            </div>
            <button onClick={handleLogout} className="text-sm font-bold text-gray-300 hover:text-red-400 transition-colors underline underline-offset-8 decoration-gray-100 mx-auto pt-2">
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuRow({ icon: Icon, title, color, bgColor, last }: any) {
  return (
    <div className={`flex items-center justify-between group cursor-pointer ${!last ? 'pb-4 border-b border-gray-50/50' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2.5 ${bgColor} ${color} rounded-2xl transition-transform group-hover:scale-110`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-[#4A3F35] text-[15px] tracking-tight">{title}</span>
      </div>
      <ChevronRight size={16} className="text-gray-200 group-hover:text-[#2CC2E4] transition-all" />
    </div>
  );
}