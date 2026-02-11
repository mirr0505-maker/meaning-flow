'use client';

import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { Sparkles, Circle, Plus, Moon, Mic } from 'lucide-react';
import CreateTaskModal from './CreateTaskModal';
import { Plus, Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react';

export default function HomeScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [morningIdentity, setMorningIdentity] = useState('');
  const [focusTasks, setFocusTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({ core: '', sub1: '', sub2: '' });

  useEffect(() => {
    loadTodayData();
  }, []);

  // 오늘 날짜 데이터 로드 (daily_logs & focus_tasks)
  const loadTodayData = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Identity 로드
    const { data: log } = await supabase.from('daily_logs').select('morning_identity').eq('target_date', today).single();
    if (log) setMorningIdentity(log.morning_identity);

    // 2. Tasks 로드
    const { data: tasks } = await supabase.from('focus_tasks').select('*').eq('target_date', today);
    if (tasks) setFocusTasks(tasks);
  };

  // Focus Task 저장 (추가/수정)
  const handleSaveTask = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('focus_tasks').upsert({
      user_id: user.id,
      target_date: new Date().toISOString().split('T')[0],
      core_task: newTask.core,
      sub_task_1: newTask.sub1,
      sub_task_2: newTask.sub2
    });
    
    setNewTask({ core: '', sub1: '', sub2: '' });
    loadTodayData();
  };

  // Task 삭제
  const handleDeleteTask = async (id: string) => {
    if(confirm("Delete this focus?")) {
      await supabase.from('focus_tasks').delete().eq('id', id);
      loadTodayData();
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pb-32 min-h-screen bg-[#FFFBF5] space-y-8">
    <div className="max-w-md mx-auto px-6 pb-32 min-h-screen bg-[#FFFBF5] space-y-12">
      <Header />
      
      {/* 3. 메인 타이틀 섹션 */}
      <section className="text-center space-y-6">
        <h1 className="text-2xl font-bold text-[#4A3F35] leading-tight pt-4">
          Who do I want to be<br />when this day ends?
        </h1>
        <div className="relative max-w-sm mx-auto">
      {/* Identity 영역 연동 */}
      <section className="text-center space-y-4">
        <h2 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Morning Identity</h2>
        <input 
          value={morningIdentity}
          onChange={(e) => setMorningIdentity(e.target.value)}
          onBlur={async () => {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('daily_logs').upsert({ 
              user_id: user?.id, 
              target_date: new Date().toISOString().split('T')[0],
              morning_identity: morningIdentity 
            });
          }}
          className="w-full text-2xl font-serif italic text-center bg-transparent border-none focus:ring-0 text-[#4A3F35]"
        />
      </section>

      {/* Focus Task 입력 및 리스트 */}
      <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 space-y-6">
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="My Polaris"
            className="w-full py-4 px-6 bg-white rounded-full shadow-sm border border-orange-50 outline-none focus:ring-2 focus:ring-[#2CC2E4] text-center italic"
            placeholder="Core Task" 
            value={newTask.core} 
            onChange={e => setNewTask({...newTask, core: e.target.value})}
            className="w-full p-4 bg-[#FFFBF5] rounded-2xl text-sm font-bold"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-tr from-[#2CC2E4] to-[#B0F2FF] rounded-full text-white">
            <Sparkles size={18} />
          <div className="flex gap-2">
            <input placeholder="Sub 1" value={newTask.sub1} onChange={e => setNewTask({...newTask, sub1: e.target.value})} className="flex-1 p-3 bg-gray-50 rounded-xl text-xs" />
            <input placeholder="Sub 2" value={newTask.sub2} onChange={e => setNewTask({...newTask, sub2: e.target.value})} className="flex-1 p-3 bg-gray-50 rounded-xl text-xs" />
          </div>
          <button onClick={handleSaveTask} className="w-full py-4 bg-[#2CC2E4] text-white rounded-2xl font-bold">Add Today's Focus</button>
        </div>
      </section>

      {/* 2. 루틴 섹션 (간격 조정) */}
      <section className="space-y-4">
        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase text-center">
          Don't think, just move your body
        </p>
        <div className="space-y-3">
          {['Make the bed', 'Drink a glass of water', 'Morning stretch'].map((task) => (
            <div key={task} className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-orange-50/50 shadow-sm">
              <Circle className="text-gray-200" size={24} />
              <span className="font-medium">{task}</span>
        {/* 저장된 리스트 출력 */}
        <div className="space-y-4">
          {focusTasks.map(task => (
            <div key={task.id} className="group p-6 bg-gray-50/30 rounded-[2rem] border border-gray-50 relative">
              <button onClick={() => handleDeleteTask(task.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                <Trash2 size={16} />
              </button>
              <h4 className="font-bold text-[#4A3F35] mb-2">{task.core_task}</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• {task.sub_task_1}</li>
                <li>• {task.sub_task_2}</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 포커스 태스크 섹션 (Day Focus 복구) */}
      <section className="space-y-6">
        <div className="relative border-t border-gray-100 pt-8 text-center">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFFBF5] px-4 text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase">
            Day Focus
          </span>
        </div>

        {/* 1) 기존 포커스 카드 (데이터가 있을 때 먼저 노출) */}
        <div className="bg-white p-7 rounded-[2.5rem] border border-blue-50 shadow-sm space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#2CC2E4] uppercase tracking-wider">Focus Task</span>
            <h2 className="text-xl font-bold text-[#4A3F35]">Organize my cozy workspace</h2>
          </div>
          
          <button className="w-full py-4 bg-[#2CC2E4] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform text-sm">
            70% is enough!!! Just finish this
          </button>
          
          <ul className="space-y-3 pl-1">
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-100 rounded-full" />
              Clear clutter from desk (2-min start)
            </li>
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-100 rounded-full" />
              Light a favorite candle (2-min start)
            </li>
          </ul>
        </div>

        {/* 2) 새 작업 추가 버튼 (카드의 아래쪽으로 위치 변경) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-6 bg-white/50 border-2 border-dashed border-blue-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 text-blue-300 hover:bg-white transition-all group"
        >
          <div className="p-2 bg-blue-50 rounded-full group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="text-xs font-bold tracking-tight">Create New Focus Task</span>
        </button>
      </section>

      {/* 4. Google Ads 영역 (Day와 Night 사이) */}
      <section className="py-4">
        <div className="w-full h-24 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center">
          <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">Advertisement</span>
        </div>
      </section>

      {/* 5. 하단 밤 섹션 (배경이 겹치지 않게 분리) */}
      <section className="bg-[#1D1632] -mx-6 px-6 py-12 rounded-t-[3rem] space-y-8 text-white mt-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <Moon className="text-yellow-200 fill-yellow-200" size={32} />
          <h2 className="text-xl font-bold leading-snug">
            When was your most<br />authentic moment today?
          </h2>
        </div>
        <div className="relative bg-[#2D2445] rounded-3xl p-6 h-40 border border-white/5">
          <textarea 
            placeholder="Record your reflections..."
            className="w-full h-full bg-transparent outline-none resize-none text-white/60"
          />
        </div>
      </section>

      {/* 페이지 하단 광고 */}
      <div className="mt-12 w-full h-24 bg-gray-50/50 border border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center">
        <span className="text-[9px] font-bold text-gray-300 tracking-[0.3em] uppercase">Advertisement Area</span>
      </div>
      
      <p className="text-center text-[10px] text-gray-200 mt-6 uppercase tracking-widest pb-10">
        Meaning Flow © 2026
      </p>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}