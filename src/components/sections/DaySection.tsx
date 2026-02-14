'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Circle, CheckCircle2, Zap, Heart, Anchor, Edit3, Trash2, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusTask {
  id: string;
  core_task: string;
  sub_task_1?: string;
  sub_task_2?: string;
  is_completed?: boolean;
}

export default function DaySection({ refreshData }: { refreshData: () => void }) {
  const [morningIdentity, setMorningIdentity] = useState('');
  const [morningTasks, setMorningTasks] = useState(['', '', '']);
  const [morningTasksDone, setMorningTasksDone] = useState([false, false, false]);
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);
  
  const [showInput, setShowInput] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const [subTask1, setSubTask1] = useState('');
  const [subTask2, setSubTask2] = useState('');

  // 🚀 데이터 로드 로직
  const loadTodayData = useCallback(async () => {
    const today = new Date().toLocaleDateString('en-CA');
    
    // Focus Tasks 로드
    const { data: tasks } = await supabase.from('focus_tasks').select('*').eq('target_date', today).order('created_at', { ascending: true });
    if (tasks) setFocusTasks(tasks as FocusTask[]);
    
    // Daily Log 로드
    const { data: log } = await supabase.from('daily_logs').select('*').eq('target_date', today).maybeSingle();
    if (log) {
      setMorningIdentity(log.morning_identity || '');
      if (log.morning_tasks) setMorningTasks(log.morning_tasks.slice(0, 3));
      if (log.morning_tasks_done) {
        setMorningTasksDone(log.morning_tasks_done.map((v: any) => v === true || v === "true"));
      }
    }
  }, []);

  useEffect(() => { loadTodayData(); }, [loadTodayData]);

  // 저장 로직
  const saveMorningData = async (identity = morningIdentity, tasks = morningTasks, done = morningTasksDone) => {
    const today = new Date().toLocaleDateString('en-CA');
    await supabase.from('daily_logs').upsert(
      { target_date: today, morning_identity: identity, morning_tasks: tasks, morning_tasks_done: done },
      { onConflict: 'target_date' }
    );
  };

  const toggleTaskDone = (idx: number) => {
    const newDone = [...morningTasksDone];
    newDone[idx] = !newDone[idx];
    setMorningTasksDone(newDone);
    saveMorningData(morningIdentity, morningTasks, newDone);
  };

  const handleSaveFocusTask = async () => {
    if (!newTask.trim()) return;
    const today = new Date().toLocaleDateString('en-CA');
    const taskData = { core_task: newTask, sub_task_1: subTask1, sub_task_2: subTask2, target_date: today };

    if (editingTaskId) await supabase.from('focus_tasks').update(taskData).eq('id', editingTaskId);
    else await supabase.from('focus_tasks').insert([taskData]);
    
    setNewTask(''); setSubTask1(''); setSubTask2('');
    setEditingTaskId(null); setShowInput(false); loadTodayData();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from('focus_tasks').delete().eq('id', id);
    loadTodayData();
  };

  const toggleFocusDone = async (task: FocusTask) => {
    const newStatus = !task.is_completed;
    if (newStatus) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    
    // 🚀 DB 상태 업데이트
    await supabase.from('focus_tasks').update({ is_completed: newStatus }).eq('id', task.id);
    loadTodayData(); // 데이터 새로고침으로 UI 반영
  };

  return (
    <div className="space-y-16">
      {/* 🌅 1. 아침 영역 */}
      <section className="space-y-10">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold leading-tight text-[#0D0D0D]">Who do I want to be<br />when this day ends?</h1>
          <div className="relative group">
            <input value={morningIdentity} onChange={(e) => setMorningIdentity(e.target.value)} placeholder="My Polaris Today" className="w-full p-6 bg-white rounded-full shadow-sm border-none text-lg italic outline-none pr-16 text-[#0D0D0D]" />
            <button onClick={() => { saveMorningData(); alert("Saved! ✨"); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#E0F7FA] rounded-full flex items-center justify-center text-[#2CC2E4] shadow-sm"><Check size={20} /></button>
          </div>
        </div>
        <div className="space-y-6 px-2">
          <p className="text-[16px] font-bold text-gray-400 uppercase tracking-[0.2em]">Don't think, just move your body</p>
          <div className="space-y-3">
            {morningTasks.map((task, idx) => (
              <div key={idx} className="relative flex items-center p-5 bg-white rounded-[2rem] border border-gray-50 shadow-sm gap-5 transition-all">
                <button onClick={() => toggleTaskDone(idx)} className="transition-transform active:scale-90">{morningTasksDone[idx] ? <CheckCircle2 className="text-[#2CC2E4]" size={26} /> : <Circle className="text-gray-200" size={26} />}</button>
                <input value={task} onChange={(e) => { const n = [...morningTasks]; n[idx] = e.target.value; setMorningTasks(n); }} placeholder={`Morning task ${idx + 1}`} className={`bg-transparent border-none focus:ring-0 text-base w-full outline-none font-sans pr-10 ${morningTasksDone[idx] ? 'line-through text-gray-300 italic' : 'text-[#4A3F35]'}`} />
                <button onClick={() => saveMorningData()} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2CC2E4]"><Edit3 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 2. 낮 영역 (Day Focus Task) */}
      <section className="space-y-10">
        <div className="relative text-center"><span className="text-[28px] font-bold text-gray-400 tracking-[0.4em] uppercase italic font-sans">Day Focus Task</span></div>
        <div className="flex justify-center -mt-4">
          <button onClick={() => { setEditingTaskId(null); setNewTask(''); setSubTask1(''); setSubTask2(''); setShowInput(true); }} className="w-16 h-16 bg-[#2CC2E4] rounded-full flex items-center justify-center text-white shadow-xl shadow-cyan-100 hover:scale-110 active:scale-95 transition-all border-4 border-white">
            <Plus size={32} />
          </button>
        </div>

        <div className="space-y-10">
          {focusTasks.map(task => (
            <div key={task.id} className="relative bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 space-y-6">
              <div className="absolute top-8 right-8 flex gap-3">
                <button onClick={() => { setEditingTaskId(task.id); setNewTask(task.core_task); setSubTask1(task.sub_task_1 || ''); setSubTask2(task.sub_task_2 || ''); setShowInput(true); }} className="text-gray-300 hover:text-[#2CC2E4]"><Edit3 size={20} /></button>
                <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={20} /></button>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#2CC2E4] uppercase tracking-widest">Core Task</span>
                <h3 className={`text-2xl font-bold leading-tight pr-10 ${task.is_completed ? 'line-through text-gray-300 italic' : 'text-[#4A3F35]'}`}>
                  {task.core_task}
                </h3>
              </div>
              <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-1 before:bottom-1 before:w-[1px] before:border-l-2 before:border-dashed before:border-[#E0F7FA]">
                {task.sub_task_1 && (
                  <div className="flex items-center gap-3">
                    <Zap size={14} className="text-[#2CC2E4] opacity-40" />
                    <p className={`text-base italic ${task.is_completed ? 'line-through text-gray-300' : 'text-gray-500'}`}>{task.sub_task_1}</p>
                  </div>
                )}
                {task.sub_task_2 && (
                  <div className="flex items-center gap-3">
                    <Heart size={14} className="text-[#2CC2E4] opacity-40" />
                    <p className={`text-base italic ${task.is_completed ? 'line-through text-gray-300' : 'text-gray-500'}`}>{task.sub_task_2}</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => toggleFocusDone(task)} 
                className={`w-full py-3.5 rounded-2xl font-bold text-[11px] text-center italic shadow-sm active:scale-95 transition-all ${task.is_completed ? 'bg-gray-100 text-gray-300' : 'bg-[#2CC2E4] text-white'}`}
              >
                {task.is_completed ? 'COMPLETED ✨' : '70% is enough!!!'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 작업 추가/수정 팝업 */}
      {showInput && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[10000]" onClick={() => setShowInput(false)}>
          <div className="bg-white w-[92%] max-w-sm rounded-[3rem] p-10 space-y-10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-[#2D2D2D] font-sans">{editingTaskId ? 'Edit Task' : 'New Task'}</h3>
              <p className="text-[#2CC2E4] text-[16px] font-bold font-sans">Focus on what truly matters.</p>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-gray-400 tracking-widest uppercase ml-4 font-sans">Identity Anchor</label>
                <div className="relative group">
                  <input autoFocus value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="What's on your mind?" className="w-full p-6 bg-white rounded-[2.5rem] border-2 border-[#E0F7FA] focus:border-[#2CC2E4] outline-none text-[#4A3F35] text-xl font-bold transition-all font-sans" />
                  <Anchor className="absolute right-8 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-50" size={26} />
                </div>
              </div>
              <div className="relative pl-12 space-y-8 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:border-l-2 before:border-dashed before:border-[#E0F7FA]">
                <div className="space-y-2">
                  <span className="text-[13px] font-bold text-gray-400 ml-2 italic font-sans">2-minute sub-action</span>
                  <div className="relative">
                    <input value={subTask1} onChange={e => setSubTask1(e.target.value)} placeholder="A tiny first step..." className="w-full p-5 bg-[#F8FDFF] rounded-[2rem] border-none text-[#4A3F35] text-lg italic outline-none shadow-sm font-sans" />
                    <Zap className="absolute right-8 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-40" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[13px] font-bold text-gray-400 ml-2 italic font-sans">2-minute sub-action</span>
                  <div className="relative">
                    <input value={subTask2} onChange={(e) => setSubTask2(e.target.value)} placeholder="Another small win..." className="w-full p-5 bg-[#F8FDFF] rounded-[2rem] border-none text-[#4A3F35] text-lg italic outline-none shadow-sm font-sans" />
                    <Heart className="absolute right-8 top-1/2 -translate-y-1/2 text-[#2CC2E4] opacity-40" size={20} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={handleSaveFocusTask} className="w-1/3 py-2 bg-[#2CC2E4] text-white rounded-full font-bold text-lg shadow-xl active:scale-95 transition-all font-sans">Save</button>
            </div>
            <button onClick={() => setShowInput(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-400 transition-colors">
              <X size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}