'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Moon, Sun } from 'lucide-react'; // 🚀 Moon, Sun 아이콘 추가
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

// 🚀 [해결] setIsNight 속성을 받을 수 있도록 타입을 수정합니다.
interface HeaderProps {
  isNight?: boolean;
  setIsNight?: (value: boolean) => void;
}

export default function Header({ isNight, setIsNight }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  const toggleLanguage = async () => {
    const currentLocale = pathname.split('/')[1];
    const newLocale = currentLocale === 'en' ? 'ko' : 'en';

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ 
        id: user.id, 
        language: newLocale,
        updated_at: new Date().toISOString()
      });
    }

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

  if (!mounted) return <div className="py-10 w-full h-32 bg-transparent" />;

  return (
    <header className="flex justify-between items-center py-10 w-full bg-transparent px-2 max-w-md mx-auto">
      {/* 🚀 왼쪽: 나이트 모드 토글 버튼 추가 */}
      <div className="flex-1 text-left leading-tight flex items-center gap-3">
        <button 
          onClick={() => setIsNight && setIsNight(!isNight)} 
          className={`p-2 rounded-full transition-all ${isNight ? 'bg-white/10 text-yellow-400' : 'bg-gray-100 text-gray-400'}`}
        >
          {isNight ? <Sun size={24} strokeWidth={2.5} /> : <Moon size={24} strokeWidth={2.5} />}
        </button>
        <div>
          <p className="text-[20px] font-black text-[#2CC2E4] tracking-tighter uppercase leading-none">ToDoList</p>
          <p className={`text-[12px] font-bold uppercase tracking-tight ${isNight ? 'text-white/60' : 'text-black/40'}`}>(INXX)</p>
        </div>
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