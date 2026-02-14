'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Mic, Send, Circle, Check, ArrowRightCircle, Unlock } from 'lucide-react';

export default function NightSection({ refreshData }: { refreshData: () => void }) {
  const [vaultText, setVaultText] = useState('');
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('');
  
  const [timerSeconds, setTimerSeconds] = useState(225);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [microSteps, setMicroSteps] = useState(['', '', '']);

  // [기존 로직: loadNightData, 실시간 카운트다운, 타이머, 핸들러 등은 절대 수정/삭제 없이 유지]
  useEffect(() => {
    const loadNightData = async () => {
      const today = new Date().toLocaleDateString('en-CA');
      const { data: vaultData } = await supabase.from('thought_vault').select('*').eq('target_date', today).maybeSingle();
      if (vaultData) {
        setVaultText(vaultData.content || '');
        setIsVaultLocked(vaultData.is_locked);
        setLockedAt(vaultData.created_at);
      }
      const { data: log } = await supabase.from('daily_logs').select('*').eq('target_date', today).maybeSingle();
      if (log && log.night_reflection) setReflectionText(log.night_reflection);
    };
    loadNightData();
  }, []);

  useEffect(() => {
    if (!isVaultLocked || !lockedAt) {
      setRemainingTime('');
      return;
    }
    const timer = setInterval(() => {
      const eightHoursInMs = 8 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const lockTime = new Date(lockedAt).getTime();
      const diff = eightHoursInMs - (now - lockTime);
      if (diff <= 0) {
        setRemainingTime('AVAILABLE NOW');
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setRemainingTime(`${h}h ${m}m ${s}s LEFT`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isVaultLocked, lockedAt]);

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

  const handleVaultAction = async () => {
    const today = new Date().toLocaleDateString('en-CA');
    if (isVaultLocked) {
      if (remainingTime === 'AVAILABLE NOW') {
        const { error } = await supabase.from('thought_vault').update({ is_locked: false }).eq('target_date', today);
        if (!error) { setIsVaultLocked(false); setLockedAt(null); alert("금고가 열렸습니다. 🔓"); }
      } else {
        alert(`아직 숙성 중입니다! ${remainingTime} 후에 다시 오세요. 🔐`);
      }
      return;
    }
    if (!vaultText.trim()) return alert("생각을 먼저 입력해주세요.");
    const now = new Date().toISOString();
    const { error } = await supabase.from('thought_vault').upsert({ target_date: today, content: vaultText, is_locked: true, created_at: now }, { onConflict: 'target_date' });
    if (!error) { setIsVaultLocked(true); setLockedAt(now); alert("생각이 DB에 박제되었습니다. 🔐"); }
  };

  const saveReflection = async () => {
    const today = new Date().toLocaleDateString('en-CA');
    await supabase.from('daily_logs').upsert({ target_date: today, night_reflection: reflectionText }, { onConflict: 'target_date' });
    alert("오늘의 회고가 보관되었습니다. ✨");
  };

  const sendToTomorrow = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
    await supabase.from('daily_logs').upsert({ target_date: tomorrowStr, morning_tasks: microSteps, morning_tasks_done: [false, false, false] }, { onConflict: 'target_date' });
    alert("전송 완료! 🚀");
  };

  return (
    <div className="pt-20 pb-40 space-y-32 -mx-8 px-8 bg-gradient-to-b from-[#FFFBF5] via-[#1A1625] to-[#0D0D0D]">
      
      {/* 🌙 타이틀 영역 */}
      <div className="text-center space-y-6 pt-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#2D283E] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-3xl">🌙</span>
          </div>
        </div>
        <h2 className="text-4xl font-serif italic font-bold text-white tracking-tight drop-shadow-lg font-sans">Brain Off-boarding</h2>
      </div>

      {/* Step 1. Thought Vault: 디자인 밸런스 조정 및 텍스트 은닉 */}
      <section className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.5)] space-y-8 text-center">
        <div className="flex justify-between items-center px-2">
          <p className="text-[16px] font-bold text-indigo-200/90 uppercase tracking-[0.3em] font-sans">Step 1. Thought Vault</p>
          {isVaultLocked && <span className="text-[10px] font-black text-indigo-400 animate-pulse bg-white/10 px-3 py-1 rounded-full uppercase">Locked</span>}
        </div>
        
        <div className="relative min-h-[200px] flex items-center justify-center py-4">
          {isVaultLocked ? (
            /* 🚀 박제 시 텍스트 은닉 처리 */
            <div className="space-y-4 animate-in fade-in zoom-in duration-700">
              <Lock size={48} className="mx-auto text-indigo-300/30" strokeWidth={1.5} />
              <p className="text-lg italic text-white/40 font-sans tracking-tight">Thoughts are securely locked away...</p>
            </div>
          ) : (
            <textarea 
              value={vaultText} 
              onChange={(e) => setVaultText(e.target.value)} 
              placeholder="Just type out any worries, ideas, or to-dos that pop into your head, even if they're not sentences." 
              className="w-full h-40 bg-transparent border-none text-lg text-center italic text-white/80 placeholder:text-white/10 resize-none outline-none font-sans leading-relaxed" 
            />
          )}
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleVaultAction} 
            className={`w-full py-6 rounded-[2rem] font-bold text-lg flex flex-col items-center justify-center gap-1 transition-all duration-500 ${
              isVaultLocked ? 'bg-white/5 text-indigo-200/60 border border-white/5' : 'bg-white text-[#1A1625] shadow-2xl active:scale-95'
            }`}
          >
            <div className="flex items-center gap-2">
              {isVaultLocked ? <Lock size={18} /> : <Unlock size={18} className="animate-bounce" />}
              <span>{isVaultLocked ? 'UNLOCK KEY' : 'LOCK IN CHEST'}</span>
            </div>
            {isVaultLocked && <span className="text-[11px] font-mono opacity-80 tracking-widest">{remainingTime}</span>}
          </button>
          <p className="text-[11px] text-white/20 italic font-sans px-4">
            *It's been stored in the database. You can only open it after 8 hours.
          </p>
        </div>
      </section>

      {/* Step 2. Ni Timer Boundary */}
      <section className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.5)] space-y-8 text-center">
        <p className="text-[16px] font-bold text-indigo-200/90 uppercase tracking-[0.3em] font-sans">Step 2. Ni Timer Boundary</p>
        <div className="relative w-[22rem] h-[22rem] mx-auto flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="176" cy="176" r="150" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle cx="176" cy="176" r="150" fill="none" stroke="#A88BFF" strokeWidth="12" strokeDasharray="942" strokeDashoffset={942 - (942 * timerSeconds / 225)} strokeLinecap="round" />
          </svg>
          <div className="text-7xl font-light text-white font-mono tracking-tighter drop-shadow-2xl">{formatTime}</div>
        </div>
        <button onClick={() => setIsTimerActive(!isTimerActive)} className="w-full py-8 bg-[#A88BFF] text-white rounded-[3rem] font-black text-xl flex items-center justify-center gap-4 italic shadow-lg active:scale-95 transition-all">
          <Mic size={28} /> {isTimerActive ? 'STOP RECORDING' : 'RECORD GENIUS IDEAS'}
        </button>
      </section>

      <section className="space-y-12 text-center px-4">
        <h3 className="text-3xl font-serif italic text-white/90 font-bold leading-snug font-sans">When was your most authentic moment today?</h3>
        <div className="relative bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl">
          <textarea value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} placeholder="Record reflections gently..." className="w-full h-40 bg-transparent border-none text-white/80 text-center italic outline-none resize-none text-xl placeholder:text-white/5 font-sans leading-relaxed" />
          <div className="flex justify-center gap-6 mt-6">
            <button className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-white/30"><Mic size={22} /></button>
            <button onClick={saveReflection} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#1A1625] shadow-xl active:scale-90 transition-all"><Send size={22} /></button>
          </div>
        </div>
      </section>

      <section className="space-y-16 pb-20 text-center">
        <div className="space-y-10">
          <h4 className="text-xl font-bold text-white/80 font-sans tracking-tight">3 things to do tomorrow morning</h4>
          <div className="space-y-4 text-left">
            {microSteps.map((s, i) => (
              <div key={i} className="flex items-center p-6 bg-white/5 rounded-[2rem] border border-white/5 gap-4 shadow-xl">
                <Circle className="text-indigo-400/50" size={24} />
                <input value={s} onChange={(e) => { const n = [...microSteps]; n[i] = e.target.value; setMicroSteps(n); }} placeholder={`Tomorrow Task ${i + 1}...`} className="bg-transparent border-none text-lg text-white/80 placeholder:text-white/5 w-full outline-none font-sans" />
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-8">
            <button onClick={sendToTomorrow} className="flex items-center gap-3 text-white font-bold text-lg bg-indigo-500/80 px-12 py-5 rounded-full shadow-lg active:scale-95 transition-all">
              <ArrowRightCircle size={22} /> Send to Morning
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}