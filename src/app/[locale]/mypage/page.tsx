'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
// 🚀 Header 임포트 제거 (메인 page.tsx의 전역 헤더를 사용함)
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, LogOut, ArrowLeft, Trash2 
} from 'lucide-react';
import { useParams } from 'next/navigation';

export default function MyPage() {
  const [view, setView] = useState<'auth' | 'detail'>('auth');
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const params = useParams();
  const locale = params?.locale || 'en';

  useEffect(() => {
    setIsMounted(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();
  }, []);

  if (!isMounted) return null;

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/${locale}/mypage` 
      }
    });
  };

  return (
    <div className="pb-32 font-sans">
      {/* 🚀 [중복 해결] <Header /> 호출 코드를 완전히 삭제했습니다. */}

      <main className="px-8 mt-10 space-y-12 text-center">
        {view === 'auth' ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <section className="space-y-3">
              <h2 className="text-[42px] font-black text-[#4A3F35] tracking-tight italic leading-tight">Identity Archive</h2>
              <p className="text-[10px] text-[#2CC2E4] font-black tracking-[0.4em] uppercase">Meaning Flow</p>
            </section>

            {!user ? (
              <div className="space-y-6 pt-4">
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

                <div className="space-y-4">
                  <input type="email" placeholder="Email" className="w-full p-6 bg-white border border-gray-50 rounded-[1.8rem] text-sm outline-none focus:ring-1 focus:ring-blue-100 shadow-sm transition-all" />
                  <input type="password" placeholder="Password" className="w-full p-6 bg-white border border-gray-50 rounded-[1.8rem] text-sm outline-none focus:ring-1 focus:ring-blue-100 shadow-sm transition-all" />
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white rounded-[3rem] border border-gray-50 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
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
          /* Settings View (기존 코드 유지) */
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
             <div className="flex items-center gap-4">
              <button onClick={() => setView('auth')} className="p-3 bg-white rounded-full shadow-sm text-gray-300 active:scale-90">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-[#4A3F35]">Settings</h2>
            </div>
            {/* 설정 상세 내용 생략 */}
          </div>
        )}
      </main>
    </div>
  );
}