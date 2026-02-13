'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function Header({ isNight }: { isNight?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  // 지구본 클릭 시 언어 토글 및 DB 업데이트
  const toggleLanguage = async () => {
    const currentLocale = pathname.split('/')[1];
    const newLocale = currentLocale === 'en' ? 'ko' : 'en';

    // 1. DB의 profiles 테이블 업데이트
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ 
        id: user.id, 
        language: newLocale,
        updated_at: new Date().toISOString()
      });
    }

    // 2. 주소창 변경 (i18n 적용)
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDate = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const currentTime = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Hydration Mismatch 방지: 클라이언트 마운트 전에는 렌더링하지 않음
  if (!mounted) return <div className="py-10 w-full h-32 bg-transparent" />;

  return (
    <header className="flex justify-between items-center py-10 w-full bg-transparent px-2 max-w-md mx-auto">
      <div className="flex-1 text-left leading-tight">
        <p className="text-[24px] font-black text-[#2CC2E4] tracking-tighter uppercase">ToDoList</p>
        <p className={`text-[16px] font-bold uppercase tracking-tight ${isNight ? 'text-white' : 'text-black'}`}>(INXX)</p>
      </div>

      <div className="flex-1 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
          {currentDate}
        </p>
        <p className={`text-3xl font-bold tracking-tight ${isNight ? 'text-white' : 'text-[#4A3F35]'}`}>
          {currentTime}
        </p>
      </div>

      <div className="flex-1 flex justify-end">
        <button onClick={toggleLanguage} className={`p-2 rounded-full transition-colors ${isNight ? 'bg-white/10 hover:bg-white/20' : 'bg-blue-50/50 hover:bg-blue-100'}`}>
          <Globe className="text-[#2CC2E4]" size={36} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}