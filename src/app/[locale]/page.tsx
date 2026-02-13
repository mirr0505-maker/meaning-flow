'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { Plus, Circle, Lock, Mic, Sparkles, X, Zap, Heart, Anchor } from 'lucide-react';

interface FocusTask {
  id: string;
  core_task: string;
  sub_task_1?: string;
  sub_task_2?: string;
}

export default function Page() {
  const [morningIdentity, setMorningIdentity] = useState('');
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);
  const [showInput, setShowInput] = useState(false);
  
  const [newTask, setNewTask] = useState('');
  const [subTask1, setSubTask1] = useState('');
  const [subTask2, setSubTask2] = useState('');

  const [isNight, setIsNight] = useState(false); 
  const [vaultText, setVaultText] = useState('');
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(225); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [microSteps, setMicroSteps] = useState(['', '', '']);

  // 🚀 팝업 시 배경 스크롤 차단
  useEffect(() => {
    if (showInput) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showInput]);

  const loadTodayData = useCallback(async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const { data: tasks } = await supabase.from('focus_tasks').select('*').eq('target_date', today);
      if (tasks) setFocusTasks(tasks as FocusTask[]);
      const { data: log } = await supabase.from('daily_logs').select('*').eq('target_date', today).maybeSingle();
      if (log) setMorningIdentity(log.morning_identity || '');
    } catch (error) {
      console.error("Data loading failed:", error);
    }
  }, []);

  useEffect(() => { loadTodayData(); }, [loadTodayData]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const today = new Date().toLocaleDateString('en-CA');
    const { error } = await supabase.from('focus_tasks').insert([
      { core_task: newTask, sub_task_1: subTask1, sub_task_2: subTask2, target_date: today }
    ]);
    if (!error) {
      setNewTask(''); setSubTask1(''); setSubTask2('');
      setShowInput(false);
      loadTodayData();
    }
  };

  // 타이머 로직 복구
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerActive, timerSeconds]);

  const formatTime = useMemo(() => {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timerSeconds]);

  return (
    <div className="max-w-md mx-auto min-h-screen font-sans pb-40 overflow-x-hidden relative" style={{ backgroundColor: '#FFFBF5' }}>
      <Header isNight={isNight} />
      
      <main className="px-8 pt-10 space-y-16">
        {/* 🌅 1. 아침 영역 */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold leading-tight text-[#0D0D0D]">Who do I want to be<br />when this day ends?</h1>
          <div className="relative">
            <input value={morningIdentity} readOnly placeholder="My Polaris" className="w-full p-6 bg-white rounded-full shadow-sm border-none text-lg italic text-[#0D0D0D] outline-none" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#E0F7FA] rounded-full flex items-center justify-center text-[#2CC2E4]"><Sparkles size={20} /></div>
          </div>
        </section>

        {/* 🎯 2. 낮 영역 (할 일 리스트) */}
        <section className="space-y-10">
          <div className="relative text-center"><span className="text-[10px] font-bold text-gray-400 tracking-[0.4em] uppercase italic font-sans">Day Focus</span></div>
          <div className="space-y-6">
            {focusTasks.map(task => (
              <div key={task.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-4 border border-gray-50 text-left">
                <span className="text-[10px] font-bold text-[#2CC2E4] uppercase tracking-wider font-sans">Focus Task</span>
                <h3 className="text-xl font-bold text-[#4A3F35] leading-tight font-sans">{task.core_task}</h3>
                <div className="w-full py-3.5 bg-[#2CC2E4] text-white rounded-2xl font-bold text-[11px] text-center italic shadow-sm font-sans">70% is enough!!!</div>
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <button onClick={() => setShowInput(true)} className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#2CC2E4] border border-gray-100 hover:scale-110 active:scale-95 transition-all"><Plus size={32} /></button>
            </div>
          </div>
        </section>

        {/* 🌙 3. 밤 영역 (나이트 3종 완벽 복구) */}
        <div className="pt-10 space-y-24">
          <div className="text-center space-y-4">
            <div className="flex justify-center"><div className="w-14 h-14 bg-[#1A1625] rounded-full flex items-center justify-center text-3xl shadow-lg">🌙</div></div>
            <h2 className="text-4xl font-serif italic font-bold text-[#0D0D0D] tracking-tight text-center font-sans">Brain Off-boarding</h2>
          </div>

          {/* [나이트 1] Thought Vault */}
          <section className="bg-[#1A1625] rounded-[3.5rem] p-10 border border-white/5 shadow-2xl space-y-10 text-left">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4 font-sans">Step 1. Thought Vault</p>
            <textarea value={vaultText} onChange={(e) => setVaultText(e.target.value)} disabled={isVaultLocked} placeholder="A brain dump of all my worries..." className="w-full h-32 bg-transparent border-none text-sm italic text-gray-400 resize-none outline-none font-sans" />
            <button onClick={() => setIsVaultLocked(!isVaultLocked)} className={`w-full py-6 rounded-[2rem] font-bold flex items-center justify-center gap-4 transition-all ${isVaultLocked ? 'bg-gray-800 text-gray-500' : 'bg-[#12101A] border border-white/10 text-white shadow-xl'}`}><Lock size={18} /> {isVaultLocked ? 'LOCKED' : 'LOCK IN CHEST'}</button>
          </section>

          {/* [나이트 2] Ni Timer Boundary */}
          <section className="bg-[#1A1625] rounded-[3.5rem] p-12 border border-white/5 text-center shadow-2xl space-y-10">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left ml-4 font-sans">Step 2. Ni Timer Boundary</p>
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="88" cy="88" r="75" fill="none" stroke="#221F2E" strokeWidth="10" />
                <circle cx="88" cy="88" r="75" fill="none" stroke="#A88BFF" strokeWidth="10" strokeDasharray="471" strokeDashoffset={471 - (471 * timerSeconds / 300)} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="text-4xl font-light text-white font-mono">{formatTime}</div>
            </div>
            <button onClick={() => setIsTimerActive(!isTimerActive)} className="w-full py-5 bg-[#A88BFF] text-white rounded-[1.8rem] font-black text-xs flex items-center justify-center gap-3 shadow-lg shadow-purple-900/40 font-sans tracking-widest italic">
              <Mic size={18} /> {isTimerActive ? 'STOP RECORDING' : 'START RECORDING GENIUS IDEAS'}
            </button>
          </section>

          {/* [나이트 3] Micro-Start */}
          <section className="space-y-16 pb-20 text-center">
            <h3 className="text-3xl font-serif italic text-[#0D0D0D] leading-tight font-bold font-sans">When was your most<br/>authentic moment today?</h3>
            <div className="space-y-10 px-2">
              <h4 className="text-xl font-bold text-[#0D0D0D] tracking-tight font-sans">3 things to do tomorrow</h4>
              <div className="space-y-4 text-left">
                {microSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center p-6 bg-[#1A1625] rounded-3xl border border-white/5 gap-5 shadow-sm">
                    <Circle className="text-gray-800" size={24} />
                    <input value={step} onChange={(e) => { const newSteps = [...microSteps]; newSteps[idx] = e.target.value; setMicroSteps(newSteps); }} placeholder={`Micro-step ${idx + 1}...`} className="bg-transparent border-none focus:ring-0 text-sm text-gray-300 w-full outline-none font-sans" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 🚀 글자 크기 20% 확대 Identity Anchor 팝업 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[10000]" onClick={() => setShowInput(false)}>
          <div className="bg-white w-[92%] max-w-sm rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto -mt-2 opacity-50" />
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-[#2D2D2D]">Create New Focus Task</h3>
              <p className="text-[#2CC2E4] text-[15px] font-bold">Add two 2-minute tasks you can do right now</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-gray-400 tracking-widest uppercase ml-3">Identity Anchor / Core Task</label>
                <div className="relative">
                  <input autoFocus value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="What's on your mind?" className="w-full p-5 bg-white rounded-[2rem] border-2 border-[#E0F7FA] focus:border-[#2CC2E4] outline-none text-[#4A3F35] text-lg font-bold transition-all font-sans" />
                  <Anchor className="absolute right-6 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-50" size={22} />
                </div>
              </div>

              <div className="relative pl-10 space-y-6 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:border-l-2 before:border-dashed before:border-[#E0F7FA]">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 ml-1 italic font-sans">2-minute sub-action</span>
                  <div className="relative">
                    <input value={subTask1} onChange={(e) => setSubTask1(e.target.value)} placeholder="A tiny first step..." className="w-full p-4.5 bg-[#F8FDFF] rounded-[1.8rem] border-none text-[#4A3F35] text-base font-medium italic outline-none shadow-sm font-sans" />
                    <Zap className="absolute right-6 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-40" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 ml-1 italic font-sans">2-minute sub-action</span>
                  <div className="relative">
                    <input value={subTask2} onChange={(e) => setSubTask2(e.target.value)} placeholder="Another small win..." className="w-full p-4.5 bg-[#F8FDFF] rounded-[1.8rem] border-none text-[#4A3F35] text-base font-medium italic outline-none shadow-sm font-sans" />
                    <Heart className="absolute right-6 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-40" size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-center">
              <button onClick={handleAddTask} className="w-full py-5.5 bg-[#2CC2E4] text-white rounded-[2.2rem] font-bold text-xl shadow-lg shadow-cyan-100 active:scale-95 transition-all font-sans">
                Add to My Day ⚓._🌿RK
              </button>
              <p className="text-gray-500 text-[12px] font-medium italic font-sans">Take it easy, one step at a time.</p>
            </div>
            
            <button onClick={() => setShowInput(false)} className="absolute top-6 right-6 text-gray-300"><X size={24} /></button>
          </div>
        </div>
      )}
    </div>
  );
}