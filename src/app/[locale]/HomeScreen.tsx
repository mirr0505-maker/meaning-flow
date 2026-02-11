'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { Plus, Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react';

export default function HomeScreen() {
  const [morningIdentity, setMorningIdentity] = useState('');
  const [focusTasks, setFocusTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({ core: '', sub1: '', sub2: '' });

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: log } = await supabase.from('daily_logs').select('morning_identity').eq('target_date', today).single();
    if (log) setMorningIdentity(log.morning_identity);

    const { data: tasks } = await supabase.from('focus_tasks').select('*').eq('target_date', today);
    if (tasks) setFocusTasks(tasks);
  };

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

  const handleDeleteTask = async (id: string) => {
    if(confirm("Delete this focus?")) {
      await supabase.from('focus_tasks').delete().eq('id', id);
      loadTodayData();
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pb-32 min-h-screen bg-[#FFFBF5] space-y-12">
      <Header />
      
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

      <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 space-y-6">
        <div className="space-y-3">
          <input 
            placeholder="Core Task" 
            value={newTask.core} 
            onChange={e => setNewTask({...newTask, core: e.target.value})}
            className="w-full p-4 bg-[#FFFBF5] rounded-2xl text-sm font-bold"
          />
          <div className="flex gap-2">
            <input placeholder="Sub 1" value={newTask.sub1} onChange={e => setNewTask({...newTask, sub1: e.target.value})} className="flex-1 p-3 bg-gray-50 rounded-xl text-xs" />
            <input placeholder="Sub 2" value={newTask.sub2} onChange={e => setNewTask({...newTask, sub2: e.target.value})} className="flex-1 p-3 bg-gray-50 rounded-xl text-xs" />
          </div>
          <button onClick={handleSaveTask} className="w-full py-4 bg-[#2CC2E4] text-white rounded-2xl font-bold">Add Today's Focus</button>
        </div>

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