'use client';

export const runtime = 'edge';

import React from 'react';
import Header from '@/components/Header';
import { CheckCircle2, Circle } from 'lucide-react';

export default function HistoryPage() {
  const historyData = [
    { date: 'Today', tasks: ['Savoring a quiet cup of tea', 'Drawing in my journal for 10 mins'] },
    { date: 'Yesterday', tasks: ['Reading one chapter of poetry'] },
    { date: 'Oct 22, 2023', tasks: ['Organizing my digital workspace'], completed: false }
  ];

  return (
    <div className="max-w-md mx-auto px-6 pb-32 min-h-screen bg-[#FFFBF5]">
      <Header />
      
      <div className="pt-8 space-y-12">
        <h1 className="text-3xl font-bold text-[#4A3F35]">Task History</h1>

        <div className="space-y-12">
          {historyData.map((section) => (
            <div key={section.date} className="space-y-6">
              <h2 className="text-gray-400 font-bold text-sm tracking-widest uppercase">{section.date}</h2>
              <div className="space-y-4">
                {section.tasks.map((task, idx) => (
                  <div key={idx} className={`p-6 bg-white rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-5 ${section.completed === false ? 'opacity-40' : ''}`}>
                    {section.completed === false ? (
                      <Circle className="text-gray-200" size={28} />
                    ) : (
                      <div className="bg-blue-50 p-1 rounded-full text-[#2CC2E4]">
                        <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                      </div>
                    )}
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Focus Task</span>
                      <p className="text-lg font-serif italic font-medium text-[#4A3F35]">"{task}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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