'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { Plus, Circle, CheckCircle2, Lock, Mic, Sparkles, X, Zap, Heart, Anchor, ArrowRightCircle, Send, Edit3, Check } from 'lucide-react';

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
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const [newTask, setNewTask] = useState('');
  const [subTask1, setSubTask1] = useState('');
  const [subTask2, setSubTask2] = useState('');

  const [isNight, setIsNight] = useState(false); 
  const [vaultText, setVaultText] = useState('');
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(225); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [microSteps, setMicroSteps] = useState(['', '', '']);
  
  const [morningTasks, setMorningTasks] = useState(['', '', '']);
  const [morningTasksDone, setMorningTasksDone] = useState([false, false, false]);
  const [reflectionText, setReflectionText] = useState('');

  // 🚀 데이터 로드
  const loadTodayData = useCallback(async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const { data: tasks } = await supabase.from('focus_tasks').select('*').eq('target_date', today).order('created_at', { ascending: true });
      if (tasks) setFocusTasks(tasks as FocusTask[]);
      
      const { data: log } = await supabase.from('daily_logs').select('*').eq('target_date', today).maybeSingle();
      if (log) {
        setMorningIdentity(log.morning_identity || '');
        if (log.morning_tasks && Array.isArray(log.morning_tasks)) {
          const loadedTasks = [...log.morning_tasks];
          while (loadedTasks.length < 3) loadedTasks.push('');
          setMorningTasks(loadedTasks.slice(0, 3));
        }
        // 추가된 컬럼 데이터 로드
        if (log.morning_tasks_done && Array.isArray(log.morning_tasks_done)) {
          setMorningTasksDone(log.morning_tasks_done);
        }
        if (log.reflection_text) setReflectionText(log.reflection_text);
      }
    } catch (error) {
      console.error("Data loading failed:", error);
    }
  }, []);

  useEffect(() => { loadTodayData(); }, [loadTodayData]);

  // 🚀 [수정 완료] 아침 데이터 확정 저장 (새 컬럼 반영)
  const saveMorningData = async (identity = morningIdentity, tasks = morningTasks, done = morningTasksDone) => {
    const today = new Date().toLocaleDateString('en-CA');
    const { error } = await supabase.from('daily_logs').upsert(
      { 
        target_date: today, 
        morning_identity: identity, 
        morning_tasks: tasks, 
        morning_tasks_done: done 
      },
      { onConflict: 'target_date' }
    );
    if (!error) alert("Successfully Saved! ✨");
    else console.error("Save failed:", error.message);
  };

  const toggleTaskDone = (idx: number) => {
    const newDone = [...morningTasksDone];
    newDone[idx] = !newDone[idx];
    setMorningTasksDone(newDone);
    saveMorningData(morningIdentity, morningTasks, newDone); // 완료 상태 즉시 저장
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const today = new Date().toLocaleDateString('en-CA');
    const taskData = { core_task: newTask, sub_task_1: subTask1, sub_task_2: subTask2, target_date: today };
    if (editingTaskId) await supabase.from('focus_tasks').update(taskData).eq('id', editingTaskId);
    else await supabase.from('focus_tasks').insert([taskData]);
    setNewTask(''); setSubTask1(''); setSubTask2('');
    setEditingTaskId(null); setShowInput(false); loadTodayData();
  };

  const openEditPopup = (task: FocusTask) => {
    setEditingTaskId(task.id); setNewTask(task.core_task);
    setSubTask1(task.sub_task_1 || ''); setSubTask2(task.sub_task_2 || '');
    setShowInput(true);
  };

  const sendToTomorrowMorning = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
    await supabase.from('daily_logs').upsert({ target_date: tomorrowStr, morning_tasks: microSteps }, { onConflict: 'target_date' });
    alert("Sent! 🚀");
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerActive && timerSeconds > 0) interval = setInterval(() => setTimerSeconds(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  const formatTime = useMemo(() => {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [timerSeconds]);

  return (
    <div className="max-w-md mx-auto min-h-screen font-sans pb-40 overflow-x-hidden relative" style={{ backgroundColor: '#FFFBF5' }}>
      <Header isNight={isNight} />
      <main className="px-8 pt-10 space-y-16">
        {/* 🌅 1. 아침 영역 (수정 버튼 시스템 & 완료 저장 완결) */}
        <section className="space-y-10">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-tight text-[#0D0D0D]">Who do I want to be<br />when this day ends?</h1>
            <div className="relative group">
              <input value={morningIdentity} onChange={(e) => setMorningIdentity(e.target.value)} placeholder="My Polaris Today" className="w-full p-6 bg-white rounded-full shadow-sm border-none text-lg italic outline-none pr-16" />
              <button onClick={() => saveMorningData()} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#E0F7FA] rounded-full flex items-center justify-center text-[#2CC2E4] hover:scale-110 active:scale-95 transition-all shadow-sm">
                {morningIdentity ? <Check size={20} /> : <Sparkles size={20} />}
              </button>
            </div>
          </div>
          <div className="space-y-6 px-2">
            <p className="text-[14px] font-bold text-gray-400 uppercase tracking-[0.2em]">Don't think, just move your body</p>
            <div className="space-y-3">
              {morningTasks.map((task, idx) => (
                <div key={idx} className="relative flex items-center p-5 bg-white rounded-[2rem] border border-gray-50 shadow-sm gap-5 transition-all">
                  <button onClick={() => toggleTaskDone(idx)} className="transition-transform active:scale-90">
                    {morningTasksDone[idx] ? <CheckCircle2 className="text-[#2CC2E4]" size={26} /> : <Circle className="text-gray-200" size={26} />}
                  </button>
                  <input 
                    value={task} 
                    onChange={(e) => { const n = [...morningTasks]; n[idx] = e.target.value; setMorningTasks(n); }} 
                    placeholder={`Morning task ${idx + 1}`} 
                    className={`bg-transparent border-none focus:ring-0 text-base w-full outline-none font-sans pr-10 ${morningTasksDone[idx] ? 'line-through text-gray-300 italic' : 'text-[#4A3F35]'}`} 
                  />
                  <button onClick={() => saveMorningData(morningIdentity, morningTasks, morningTasksDone)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2CC2E4] hover:scale-110 active:scale-90 transition-all">
                    {task ? <Check size={18} /> : <Edit3 size={18} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🎯 2. 낮 영역 (수정 절대 금지 준수) */}
        <section className="space-y-10">
          <div className="relative text-center"><span className="text-[24px] font-bold text-gray-400 tracking-[0.4em] uppercase italic font-sans">Day Focus Task</span></div>
          <div className="space-y-10">
            {focusTasks.map(task => (
              <div key={task.id} className="relative bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 space-y-6">
                <button onClick={() => openEditPopup(task)} className="absolute top-8 right-8 text-gray-300 hover:text-[#2CC2E4] transition-colors"><Edit3 size={20} /></button>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#2CC2E4] uppercase tracking-widest">Core Task</span>
                  <h3 className="text-2xl font-bold text-[#4A3F35] leading-tight pr-10">{task.core_task}</h3>
                </div>
                <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-1 before:bottom-1 before:w-[1px] before:border-l-2 before:border-dashed before:border-[#E0F7FA]">
                  {task.sub_task_1 && <div className="flex items-center gap-3"><Zap size={14} className="text-[#2CC2E4] opacity-40" /><p className="text-base text-gray-500 italic">{task.sub_task_1}</p></div>}
                  {task.sub_task_2 && <div className="flex items-center gap-3"><Heart size={14} className="text-[#2CC2E4] opacity-40" /><p className="text-base text-gray-500 italic">{task.sub_task_2}</p></div>}
                </div>
                <div className="w-full py-3.5 bg-[#2CC2E4] text-white rounded-2xl font-bold text-[11px] text-center italic shadow-sm">70% is enough!!!</div>
              </div>
            ))}
            <div className="flex justify-center"><button onClick={() => { setEditingTaskId(null); setShowInput(true); setNewTask(''); setSubTask1(''); setSubTask2(''); }} className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#2CC2E4] border border-gray-100 hover:scale-110 active:scale-95 transition-all"><Plus size={32} /></button></div>
          </div>
        </section>

        {/* 🌙 3. 밤 영역 (수정 절대 금지 준수) */}
        <div className="pt-10 space-y-24">
          <div className="text-center space-y-4">
            <div className="flex justify-center"><div className="w-14 h-14 bg-[#1A1625] rounded-full flex items-center justify-center text-3xl shadow-lg text-yellow-300">🌙</div></div>
            <h2 className="text-4xl font-serif italic font-bold text-[#0D0D0D] text-center font-sans">Brain Off-boarding</h2>
          </div>
          <section className="bg-[#1A1625] rounded-[3.5rem] p-10 border border-white/5 shadow-2xl space-y-10 text-left">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4 font-sans">Step 1. Thought Vault</p>
            <textarea value={vaultText} onChange={(e) => setVaultText(e.target.value)} disabled={isVaultLocked} placeholder="A brain dump..." className="w-full h-32 bg-transparent border-none text-sm italic text-gray-400 resize-none outline-none font-sans" />
            <button onClick={() => setIsVaultLocked(!isVaultLocked)} className={`w-full py-6 rounded-[2rem] font-bold flex items-center justify-center gap-4 transition-all ${isVaultLocked ? 'bg-gray-800 text-gray-500' : 'bg-[#12101A] border border-white/10 text-white shadow-xl'}`}><Lock size={18} /> {isVaultLocked ? 'LOCKED' : 'LOCK IN CHEST'}</button>
          </section>
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
          <section className="space-y-12 text-center px-2">
            <h3 className="text-3xl font-serif italic text-[#0D0D0D] font-bold font-sans">When was your most authentic moment today?</h3>
            <div className="relative bg-[#1A1625] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <textarea value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} placeholder="Record reflections..." className="w-full h-40 bg-transparent border-none text-gray-300 italic outline-none resize-none text-lg" />
              <div className="flex justify-end gap-3 mt-4">
                <button className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 transition-all"><Mic size={20} /></button>
                <button onClick={() => saveMorningData()} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A1625] shadow-lg transition-all"><Send size={20} /></button>
              </div>
            </div>
          </section>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-6 uppercase tracking-widest pb-10 font-sans">Meaning Flow © 2026</p>
      </main>

      {/* 🚀 Identity Anchor 팝업 (수정 절대 금지 준수) */}
      {showInput && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[10000]" onClick={() => { setShowInput(false); setEditingTaskId(null); }}>
          <div className="bg-white w-[92%] max-w-sm rounded-[3rem] p-10 space-y-10 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-[#2D2D2D] font-sans">{editingTaskId ? 'Edit Focus Task' : 'Create New Focus Task'}</h3>
              <p className="text-[#2CC2E4] text-[16px] font-bold font-sans">Focus on what truly matters.</p>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-gray-400 tracking-widest uppercase ml-4 font-sans">Identity Anchor / Core Task</label>
                <div className="relative group"><input autoFocus value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="What's on your mind?" className="w-full p-6 bg-white rounded-[2.5rem] border-2 border-[#E0F7FA] focus:border-[#2CC2E4] outline-none text-[#4A3F35] text-xl font-bold transition-all font-sans" /><Anchor className="absolute right-8 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-50" size={26} /></div>
              </div>
              <div className="relative pl-12 space-y-8 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:border-l-2 before:border-dashed before:border-[#E0F7FA]">
                <div className="space-y-2"><span className="text-[13px] font-bold text-gray-400 ml-2 italic font-sans">2-minute sub-action</span><div className="relative"><input value={subTask1} onChange={e => setSubTask1(e.target.value)} placeholder="A tiny first step..." className="w-full p-5 bg-[#F8FDFF] rounded-[2rem] border-none text-[#4A3F35] text-lg italic outline-none shadow-sm font-sans" /><Zap className="absolute right-8 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-40" size={20} /></div></div>
                <div className="space-y-2"><span className="text-[13px] font-bold text-gray-400 ml-2 italic font-sans">2-minute sub-action</span><div className="relative"><input value={subTask2} onChange={(e) => setSubTask2(e.target.value)} placeholder="Another small win..." className="w-full p-5 bg-[#F8FDFF] rounded-[2rem] border-none text-[#4A3F35] text-lg italic outline-none shadow-sm font-sans" /><Heart className="absolute right-8 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-40" size={20} /></div></div>
              </div>
            </div>
            <div className="space-y-6 text-center">
              <button onClick={handleAddTask} className="w-full py-6 bg-[#2CC2E4] text-white rounded-[2.5rem] font-bold text-2xl shadow-xl active:scale-95 transition-all font-sans">{editingTaskId ? 'Update My Day 🌿' : 'Add to My Day ⚓._🌿RK'}</button>
            </div>
            <button onClick={() => { setShowInput(false); setEditingTaskId(null); }} className="absolute top-8 right-8 text-gray-300 hover:text-red-400 transition-colors"><X size={28} /></button>
          </div>
        </div>
      )}
    </div>
  );
}