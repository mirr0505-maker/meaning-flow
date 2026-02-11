'use client';

import React from 'react';
import Header from '@/components/Header';
import { Sun, Moon } from 'lucide-react';

export default function BelovedPage() {
  const archives = [
    {
      day: 'YESTERDAY',
      date: 'Oct 23',
      identity: 'I am a creator of peace and a harbor for those in need.',
      reflection: 'Today I found beauty in the quiet moments of the rain. I felt loved when I shared tea with a friend and really listened to their heart.'
    },
    {
      day: '2 DAYS AGO',
      date: 'Oct 22',
      identity: 'I seek truth in the abstract and value in the forgotten.',
      reflection: 'My sensitivity felt like a superpower today. I noticed the way the light hits the floor and it made me smile.'
    }
  ];

  return (
    <div className="max-w-md mx-auto px-6 pb-32 min-h-screen bg-[#FFFBF5]">
      <Header />

      <div className="pt-8 text-center space-y-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#4A3F35]">Identity Archive</h1>
          <p className="text-[#2CC2E4] font-medium tracking-wide">Be Loved</p>
        </div>

        <div className="space-y-8">
          {archives.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm space-y-8 text-left">
              <div className="flex justify-between items-start">
                <span className="bg-blue-50 text-[#2CC2E4] text-[10px] font-bold px-4 py-1.5 rounded-full tracking-widest">{item.day}</span>
                <span className="text-gray-300 text-xs font-bold uppercase">{item.date}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300 font-bold text-[10px] uppercase tracking-widest">
                  <Sun size={14} /> Morning Identity
                </div>
                <p className="text-2xl font-serif italic font-medium text-[#4A3F35] leading-tight">"{item.identity}"</p>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2 text-gray-300 font-bold text-[10px] uppercase tracking-widest">
                  <Moon size={14} /> Night Reflection
                </div>
                <p className="text-[#6B6158] leading-relaxed font-medium">
                  {item.reflection}
                </p>
              </div>
            </div>
          ))}
        </div>

        <footer className="pt-8 italic text-gray-300 text-sm font-medium">
          "Your growth is quiet, constant, and beautiful."
        </footer>
      </div>

      {/* 페이지 하단 광고 */}
      <div className="mt-12 w-full h-24 bg-gray-50/50 border border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center">
        <span className="text-[9px] font-bold text-gray-300 tracking-[0.3em] uppercase">Advertisement Area</span>
      </div>
      
      <p className="text-center text-[10px] text-gray-200 mt-6 uppercase tracking-widest pb-10">
        Meaning Flow © 2026
      </p>
    </div>
  );
}