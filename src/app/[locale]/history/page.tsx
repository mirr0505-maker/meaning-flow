'use client';

export const runtime = 'edge';

import React from 'react';
// 🚀 Header 임포트 제거 (메인 page.tsx 전역 헤더 사용)
import { CheckCircle2, Circle } from 'lucide-react';

export default function HistoryPage() {
  const historyData = [
    { 
      date: 'Today', 
      tasks: ['Savoring a quiet cup of tea', 'Drawing in my journal for 10 mins'],
      completed: true 
    },
    { 
      date: 'Yesterday', 
      tasks: ['Reading one chapter of poetry'],
      completed: true 
    },
    { 
      date: 'Oct 22, 2023', 
      tasks: ['Organizing my digital workspace'], 
      completed: false 
    }
  ];

  return (
    /* 🚀 max-w-md와 배경색은 부모 page.tsx에서 관리하므로 내부 여백만 조정 */
    <div className="pb-32 font-sans">
      {/* 🚀 중복된 <Header /> 태그를 삭제했습니다. */}

      <div className="pt-4 space-y-12 text-left">
        <h1 className="text-3xl font-bold text-[#4A3F35] font-sans">Task History</h1>

        <div className="space-y-12 font-sans">
          {historyData.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-gray-400 font-bold text-xs tracking-widest uppercase">
                {section.date}
              </h2>
              
              <div className="space-y-4">
                {section.tasks.map((task, taskIdx) => (
                  <div 
                    key={taskIdx} 
                    className="p-6 bg-white rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-5"
                  >
                    {section.completed ? (
                      <div className="bg-blue-50 p-1 rounded-full text-[#2CC2E4]">
                        <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                      </div>
                    ) : (
                      <Circle className="text-gray-200" size={28} />
                    )}
                    <span className={`text-lg font-medium ${section.completed ? 'text-gray-400 line-through italic' : 'text-[#4A3F35]'}`}>
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}