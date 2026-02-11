'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Sparkles, Zap, Heart } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [task, setTask] = useState('');
  const [sub1, setSub1] = useState('');
  const [sub2, setSub2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!task) return alert("할 일을 입력해주세요!");
    setLoading(true);

    // Supabase focus_tasks 테이블에 데이터 삽입
    const { error } = await supabase
      .from('focus_tasks')
      .insert([
        { 
          title: task, 
          sub_task1: sub1, 
          sub_task2: sub2,
          is_completed: false 
        }
      ]);

    setLoading(false);
    if (error) {
      console.error(error);
      alert("저장에 실패했습니다.");
    } else {
      alert("오늘의 포커스가 저장되었습니다! 🌱");
      setTask(''); setSub1(''); setSub2('');
      onClose();
      window.location.reload(); // 임시로 화면 새로고침하여 데이터 반영
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-[3rem] p-8 space-y-8 animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2 cursor-pointer" onClick={onClose} />
        
        <header className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#4A3F35]">Create New Focus Task</h2>
        </header>

        <div className="space-y-6">
          <input 
            value={task} onChange={(e) => setTask(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-6 bg-white border border-blue-50 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-[#2CC2E4]"
          />
          <div className="space-y-4 border-l-2 border-dashed border-blue-100 ml-6 pl-6">
            <input value={sub1} onChange={(e) => setSub1(e.target.value)} placeholder="A tiny first step..." className="w-full p-4 bg-blue-50/30 rounded-2xl outline-none" />
            <input value={sub2} onChange={(e) => setSub2(e.target.value)} placeholder="Another small win..." className="w-full p-4 bg-blue-50/30 rounded-2xl outline-none" />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full py-5 bg-[#2CC2E4] text-white rounded-[2rem] font-bold text-xl shadow-xl active:scale-95 transition-transform disabled:bg-gray-300"
        >
          {loading ? "Saving..." : "Add to My Day 🌱"}
        </button>
      </div>
    </div>
  );
}