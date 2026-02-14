'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import DaySection from '@/components/sections/DaySection';
import NightSection from '@/components/sections/NightSection';
import HistoryPage from './history/page';     
import BelovedPage from './beloved/page';    
import MyPage from './mypage/page'; 
import { Home, History, Heart, User } from 'lucide-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState('home'); 
  const [isNight, setIsNight] = useState(false); 

  const loadTodayData = useCallback(async () => {
    // 데이터 로드 로직
  }, []);

  useEffect(() => { loadTodayData(); }, [loadTodayData]);

  const renderContent = () => {
    // 🚀 콘텐츠 영역에 헤더 높이만큼의 확실한 상단 패딩(pt-32)을 부여합니다.
    const containerClass = "px-8 pt-32 pb-40 animate-in fade-in duration-500";

    switch (activeTab) {
      case 'history': return <div className={containerClass}><HistoryPage /></div>;
      case 'be_loved': return <div className={containerClass}><BelovedPage /></div>;
      case 'my_page': return <div className={containerClass}><MyPage /></div>;
      default:
        return (
          <main className={containerClass + " space-y-16"}>
            {isNight ? (
              <NightSection refreshData={loadTodayData} />
            ) : (
              <DaySection refreshData={loadTodayData} />
            )}
          </main>
        );
    }
  };

  return (
    <div className={`max-w-md mx-auto min-h-screen font-sans relative transition-colors duration-500 ${isNight ? 'bg-[#0D0B14]' : 'bg-[#FFFBF5]'}`}>
      
      {/* 🚀 [해결 핵심] Header를 상단에 고정하고 배경색을 입혀 콘텐츠가 겹쳐도 보이게 합니다. */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[6000] px-6 py-2 transition-colors duration-500 ${isNight ? 'bg-[#0D0B14]/90' : 'bg-[#FFFBF5]/90'} backdrop-blur-md`}>
        <Header isNight={isNight} setIsNight={setIsNight} />
      </div>
      
      {/* 콘텐츠 영역 */}
      <div className="relative w-full">
        {renderContent()}
      </div>

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around py-5 z-[5000]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#2CC2E4]' : 'text-gray-300'}`}>
          <Home size={24} /><span className="text-[10px] font-bold">HOME</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-[#2CC2E4]' : 'text-gray-300'}`}>
          <History size={24} /><span className="text-[10px] font-bold">HISTORY</span>
        </button>
        <button onClick={() => setActiveTab('be_loved')} className={`flex flex-col items-center gap-1 ${activeTab === 'be_loved' ? 'text-[#2CC2E4]' : 'text-gray-300'}`}>
          <Heart size={24} /><span className="text-[10px] font-bold">BE LOVED</span>
        </button>
        <button onClick={() => setActiveTab('my_page')} className={`flex flex-col items-center gap-1 ${activeTab === 'my_page' ? 'text-[#2CC2E4]' : 'text-gray-300'}`}>
          <User size={24} /><span className="text-[10px] font-bold">MY PAGE</span>
        </button>
      </nav>
    </div>
  );
}