'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { Plus, Circle, CheckCircle2, Mic, Send, X } from 'lucide-react';

export default function HomeScreen() {
  const [morningIdentity, setMorningIdentity] = useState('');
  const [focusTasks, setFocusTasks] = useState<any[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newTask, setNewTask] = useState({ core: '', sub1: '', sub2: '' });
  const [reviewText, setReviewText] = useState('');
  
  // 아침 즉각 할 일 상태 (localStorage 연동 가능)
  const [immediates, setImmediates] = useState([
    { id: 1, text: 'Make the bed', done: false },
    { id: 2, text: 'Drink a glass of water', done: false },
    { id: 3, text: 'Morning stretch', done: false }
  ]);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: log } = await supabase.from('daily_logs').select('*').eq('target_date', today).maybeSingle();
    if (log) {
      setMorningIdentity(log.morning_identity || '');
      setReviewText(log.review_text || '');
    }
    const { data: tasks } = await supabase.from('focus_tasks').select('*').eq('target_date', today);
    if (tasks) setFocusTasks(tasks);
  };

  const handleSaveTask = async () => {
    if (!newTask.core) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('focus_tasks').upsert({
      user_id: user?.id,
      target_date: new Date().toISOString().split('T')[0],
      core_task: newTask.core,
      sub_task_1: newTask.sub1,
      sub_task_2: newTask.sub2
    });
    setNewTask({ core: '', sub1: '', sub2: '' });
    setShowInput(false); // 저장 후 대시보드로 복귀
    loadTodayData();
  };

  const toggleImmediate = (id: number) => {
    setImmediates(immediates.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const saveDailyLog = async (field: string, value: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('daily_logs').upsert({ 
      user_id: user?.id, 
      target_date: new Date().toISOString().split('T')[0],
      [field]: value 
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FFFBF5] pb-32 font-sans overflow-x-hidden relative px-6">
      <Header />
      
      {/* 🌅 Morning: My Polaris */}
      <section className="pt-10 space-y-6">
        <h1 className="text-3xl font-bold text-[#0D0D0D] leading-tight">Who do I want to be<br />when this day ends?</h1>
        <div className="relative">
          <input 
            value={morningIdentity}
            onChange={(e) => setMorningIdentity(e.target.value)}
            onBlur={() => saveDailyLog('morning_identity', morningIdentity)}
            placeholder="My Polaris"
            className="w-full p-6 bg-white rounded-full shadow-sm border-none text-lg italic focus:ring-2 focus:ring-[#2CC2E4]"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#E0F7FA] rounded-full flex items-center justify-center text-[#2CC2E4]">✨</div>
        </div>
      </section>

      {/* 🏃‍♂️ Immediate To-do 1, 2, 3 구현 */}
      <section className="mt-12 space-y-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center italic">Don't think, just move your body</p>
        <div className="space-y-3">
          {immediates.map((item) => (
            <button 
              key={item.id}
              onClick={() => toggleImmediate(item.id)}
              className="w-full flex items-center p-5 bg-white rounded-3xl shadow-sm gap-4 border border-transparent hover:border-blue-50 transition-all text-left"
            >
              {item.done ? <CheckCircle2 className="text-[#2CC2E4]" size={24} /> : <Circle className="text-gray-100" size={24} />}
              <span className={`text-sm font-medium ${item.done ? 'text-gray-300 line-through' : 'text-gray-600'}`}>{item.text}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 🎯 Day Focus Grid */}
      <section className="mt-20 space-y-10">
        <div className="relative text-center">
          <span className="bg-[#FFFBF5] px-4 text-[10px] font-bold text-gray-300 tracking-[0.4em] uppercase relative z-10 italic">Day Focus</span>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100 -z-0"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {focusTasks.map(task => (
            <div key={task.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6 border border-gray-50">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#2CC2E4] uppercase">Focus Task</span>
                <h3 className="text-xl font-bold text-[#4A3F35] leading-snug">{task.core_task}</h3>
              </div>
              <div className="w-full py-3.5 bg-[#2CC2E4] text-white rounded-2xl font-bold text-[11px] text-center shadow-lg shadow-cyan-100/50 italic">70% is enough!!! Just finish this</div>
              <ul className="space-y-3 text-xs text-gray-400 font-medium">
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-gray-200" /> {task.sub_task_1}</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-gray-200" /> {task.sub_task_2}</li>
              </ul>
            </div>
          ))}
          <button onClick={() => setShowInput(true)} className="w-20 h-20 mx-auto bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-[#2CC2E4] hover:scale-105 transition-all"><Plus size={32} /></button>
        </div>
      </section>

      {/* 🌙 Night Review: Deep Dark */}
      <section className="mt-24 bg-gradient-to-b from-[#1A1625] to-[#12101A] px-8 py-20 rounded-t-[4.5rem] text-center text-white space-y-12">
        <h2 className="text-2xl font-bold leading-tight">When was your most<br />authentic moment today?</h2>
        <div className="relative">
          <textarea 
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            onBlur={() => saveDailyLog('review_text', reviewText)}
            placeholder="Record your reflections gently..."
            className="w-full h-56 bg-white/5 rounded-[3rem] p-8 text-sm focus:ring-0 border-none italic text-gray-300 placeholder:text-gray-600 resize-none"
          />
          <div className="absolute bottom-6 right-6 flex gap-3">
            <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><Mic size={20} /></button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A1625] shadow-lg shadow-white/5"><Send size={20} /></button>
          </div>
        </div>
        <p className="text-[9px] text-gray-600 uppercase tracking-widest pt-10">Meaning Flow © 2026</p>
      </section>

      {/* 📝 New Task Input Modal: 대시보드 복귀 기능 포함 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-300">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-[3.5rem] p-10 pb-16 space-y-10 shadow-2xl animate-in slide-in-from-bottom duration-500 relative">
            {/* 상단 바 및 닫기 버튼 (대시보드로 돌아가기) */}
            <button 
              onClick={() => setShowInput(false)} 
              className="absolute top-8 right-10 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" />
            
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-[#0D0D0D]">Create New Focus Task</h2>
              <p className="text-[11px] text-[#2CC2E4] font-semibold uppercase tracking-wider">Add two 2-minute tasks you can do right now</p>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3 px-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic ml-2">Identity Anchor / Core Task</label>
                <input placeholder="What's on your mind?" value={newTask.core} onChange={e => setNewTask({...newTask, core: e.target.value})} className="w-full p-6 bg-white border border-blue-50 rounded-[2rem] shadow-sm text-lg italic focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="space-y-4 border-l-2 border-dashed border-blue-100 ml-10 pl-8">
                <input placeholder="A tiny first step..." value={newTask.sub1} onChange={e => setNewTask({...newTask, sub1: e.target.value})} className="w-full p-5 bg-[#F8FDFF] rounded-2xl text-sm border-none shadow-sm focus:ring-1 focus:ring-blue-100" />
                <input placeholder="Another small win..." value={newTask.sub2} onChange={e => setNewTask({...newTask, sub2: e.target.value})} className="w-full p-5 bg-[#F8FDFF] rounded-2xl text-sm border-none shadow-sm focus:ring-1 focus:ring-blue-100" />
              </div>
            </div>

            <button onClick={handleSaveTask} className="w-full py-6 bg-[#2CC2E4] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-cyan-100 transition-transform active:scale-95">
              Add to My Day 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}