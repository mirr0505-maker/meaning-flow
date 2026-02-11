'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, Lock, User, Shield, 
  Bell, CreditCard, HelpCircle, MessageSquare, LogOut, ArrowLeft, Trash2 
} from 'lucide-react';

export default function MyPage() {
  const [view, setView] = useState<'auth' | 'detail'>('auth');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
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

  // 1. 구글 로그인 시 Sign up 여부 체크 로직 (가상 시나리오 반영)
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/en/mypage' }
    });
    // 실제 운영 시에는 여기서 DB의 user 테이블을 조회해 가입 여부를 확인하는 로직이 추가됩니다.
  };

  // 로그아웃 (단순 세션 종료)
  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setView('auth');
  };

  // 회원 탈퇴 (데이터 삭제 가정)
  const handleSignOut = async () => {
    if(confirm("Are you sure? All your data will be permanently deleted.")) {
      // 실제 구현 시 supabase.rpc 또는 관련 테이블 데이터 삭제 로직 실행
      await supabase.auth.signOut();
      alert("Account deleted.");
      setView('auth');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pb-32 min-h-screen bg-[#FFFBF5] font-sans">
      <Header />

      {/* 2. 상단 abc@mail.com 영역 완전 삭제 완료 */}

      <main className="mt-12 space-y-8">
        {view === 'auth' ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="text-center space-y-3">
              {/* 3. 워딩 수정: 'Your Space'를 텍스트로 변경 및 로그인 상태 체크 */}
              <h2 className="text-4xl font-black text-[#4A3F35] tracking-tight">Identity Archive</h2>
              <p className="text-sm text-[#2CC2E4] font-bold tracking-widest uppercase">Meaning Flow</p>
            </section>

            {!user ? (
              /* 로그인 전: 로그인 유도 UI */
              <div className="space-y-4 pt-4">
                <button onClick={handleGoogleLogin} className="w-full py-4 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                  <div className="w-5 h-5 bg-gray-800 rounded-sm flex items-center justify-center text-[10px] text-white font-bold">G</div>
                  <span className="font-bold text-[#4A3F35]">Continue with Google</span>
                </button>
                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or email</span>
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                </div>
                <div className="space-y-3">
                  <input type="email" placeholder="Email" className="w-full p-5 bg-white border border-gray-50 rounded-[1.5rem] text-sm focus:outline-none" />
                  <input type="password" placeholder="Password" className="w-full p-5 bg-white border border-gray-50 rounded-[1.5rem] text-sm focus:outline-none" />
                </div>
                <button className="w-full py-5 bg-[#2CC2E4] text-white rounded-[1.5rem] font-bold shadow-lg shadow-blue-100 mt-4">Log in</button>
                <button className="w-full py-5 bg-white border border-blue-50 text-[#2CC2E4] rounded-[1.5rem] font-bold">Sign up</button>
              </div>
            ) : (
              /* 로그인 후: 설정 진입 유도 UI */
              <div className="p-10 bg-white rounded-[3rem] border border-blue-50 text-center space-y-6 shadow-sm">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Logged in as</p>
                <p className="text-xl font-black text-[#4A3F35] break-all">{user.email}</p>
                <button 
                  onClick={() => setView('detail')} 
                  className="w-full py-4 bg-[#2CC2E4]/10 text-[#2CC2E4] rounded-2xl font-bold text-sm hover:bg-[#2CC2E4]/20 transition-colors"
                >
                  Go to Settings
                </button>
                {/* 4. 로그아웃 버튼 추가 */}
                <button onClick={handleLogOut} className="text-[11px] font-bold text-gray-300 border-b border-gray-200 pb-0.5 hover:text-gray-500">
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          /* [VIEW 2] 상세 설정 화면 */
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('auth')} className="p-3 bg-white rounded-full shadow-sm text-gray-400 hover:text-[#2CC2E4]">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-[#4A3F35]">Settings</h2>
            </div>

            <section className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-4">Account</p>
                <div className="bg-white rounded-[2rem] border border-gray-50 overflow-hidden shadow-sm">
                  <MenuItem icon={User} title="Profile Details" />
                  <MenuItem icon={Lock} title="Security" />
                  <MenuItem icon={CreditCard} title="Subscription" badge="PREMIUM" last />
                </div>
              </div>

              {/* 하단 액션 버튼들 */}
              <div className="pt-4 space-y-3">
                <button onClick={handleLogOut} className="w-full py-5 bg-white border border-gray-100 text-gray-400 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  <LogOut size={18} /> Log Out
                </button>
                <button onClick={handleSignOut} className="w-full py-5 bg-white border border-red-50 text-red-300 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-red-50/30 transition-colors">
                  <Trash2 size={18} /> Delete Account (Sign Out)
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 페이지 하단 광고: 하나만 유지 (레이아웃의 고정 광고는 삭제됨) */}
      <div className="mt-12 w-full h-24 bg-gray-50/50 border border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center">
        <span className="text-[9px] font-bold text-gray-300 tracking-[0.3em] uppercase">Advertisement Area</span>
      </div>
      
      <p className="text-center text-[10px] text-gray-200 mt-6 uppercase tracking-widest pb-10">
        Meaning Flow © 2026
      </p>
    </div>
  );
}

function MenuItem({ icon: Icon, title, badge, last }: any) {
  return (
    <div className={`flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer ${!last ? 'border-b border-gray-50/50' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-cyan-50 text-[#2CC2E4] rounded-xl"><Icon size={20} /></div>
        <span className="font-bold text-[#4A3F35] text-sm">{title}</span>
        {badge && <span className="text-[8px] font-black bg-cyan-100 text-[#2CC2E4] px-2 py-0.5 rounded-md ml-1">{badge}</span>}
      </div>
      <ChevronRight size={18} className="text-gray-200" />
    </div>
  );
}