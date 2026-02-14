'use client';

export const runtime = 'edge';

import React from 'react';
// 🚀 Header 임포트 제거 (부모 page.tsx의 전역 헤더를 사용함)
import { Sun, Moon } from 'lucide-react';

export default function BelovedPage() {
  const archives = [
    {
      day: 'YESTERDAY',
      date: 'OCT 23',
      identity: 'I am a creator of peace and a harbor for those in need.',
      reflection: 'Today I found beauty in the quiet moments of the rain...'
    },
    {
      day: '2 DAYS AGO',
      date: 'OCT 22',
      identity: 'I seek truth in the abstract and value in the forgotten.',
      reflection: 'My sensitivity felt like a superpower today...'
    }
  ];

  return (
    <div className="pb-32 font-sans">
      {/* 🚀 [중복 해결] <Header /> 호출 코드를 삭제했습니다. */}

      <div className="pt-8 text-center space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#4A3F35] tracking-tight font-sans uppercase">Identity Archive</h1>
          <p className="text-[#2CC2E4] font-medium tracking-wide font-sans">Be Loved</p>
        </div>

        <div className="space-y-8">
          {archives.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm space-y-8 text-left">
              <div className="flex justify-between items-start">
                <span className="bg-[#EBF9FC] text-[#2CC2E4] text-[10px] font-bold px-4 py-1.5 rounded-full tracking-widest">{item.day}</span>
                <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">{item.date}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300 font-bold text-[9px] uppercase tracking-[0.2em]">
                  <Sun size={14} strokeWidth={3} /> Morning Identity
                </div>
                <p className="text-[26px] font-serif italic font-medium text-[#4A3F35] leading-tight">
                  "{item.identity}"
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-300 font-bold text-[9px] uppercase tracking-[0.2em]">
                  <Moon size={14} strokeWidth={3} /> Night Reflection
                </div>
                <p className="text-[#6B6158] leading-relaxed font-medium text-sm">
                  {item.reflection}
                </p>
              </div>
            </div>
          ))}
        </div>

        <footer className="pt-12 italic text-gray-300 text-xs font-medium font-sans">
          "Your growth is quiet, constant, and beautiful."
        </footer>
      </div>
    </div>
  );
}