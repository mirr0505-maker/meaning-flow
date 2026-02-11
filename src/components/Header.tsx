'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
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
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDate = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const currentTime = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <header className="flex justify-between items-center py-10 w-full bg-transparent px-2 max-w-md mx-auto">
      <div className="flex-1 text-left leading-tight">
        <p className="text-[24px] font-black text-[#2CC2E4] tracking-tighter uppercase">ToDoList</p>
        <p className="text-[16px] font-bold text-black uppercase tracking-tight">(INXX)</p>
      </div>

      <div className="flex-1 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
          {currentDate}
        </p>
        <p className="text-3xl font-bold text-[#4A3F35] tracking-tight">
          {currentTime}
        </p>
      </div>

      <div className="flex-1 flex justify-end">
        <button onClick={toggleLanguage} className="p-2 rounded-full bg-blue-50/50 hover:bg-blue-100 transition-colors">
          <Globe className="text-[#2CC2E4]" size={36} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}