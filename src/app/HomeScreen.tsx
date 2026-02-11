"use client";

import React, { useState, useRef } from 'react';
import { Trash2, Plus, GripVertical, Moon, Mic, Edit2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';

const HomeScreen = ({
  savedIdentity,
  identity,
  setIdentity,
  saveIdentity,
  editing,
  setEditing,
  editValue,
  setEditValue,
  immediates,
  setImmediates,
  isCoreDone,
  setIsCoreDone,
  focusTasks,
  setFocusTasks,
  persistFocusTasks,
  recording,
  setRecording,
  tomorrowSteps,
  setTomorrowSteps,
  triggerToast,
  user,
  showFocusModal,
  setShowFocusModal,
  persistImmediate,
  onEditFocusTask,
  reviewText,
  setReviewText,
  isNightReviewSaved,
  handleSaveNightReview,
}: any) => {
  const t = useTranslations();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updatedTasks = [...focusTasks];
    const [draggedItem] = updatedTasks.splice(draggedIndex, 1);
    updatedTasks.splice(dropIndex, 0, draggedItem);

    setFocusTasks(updatedTasks);
    persistFocusTasks(new Date().toISOString().split('T')[0], updatedTasks);
    setDraggedIndex(null);
  };

  return (
  <div className="animate-in fade-in duration-500">
    <section className="px-6 mb-10 pt-4">
      <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-orange-100/50">
        <h2 className="text-[#2D2D2D] text-2xl font-serif mb-6 leading-tight whitespace-pre-line">{t('morningTitle')}</h2>
        {savedIdentity ? (
          <div className="p-5 bg-orange-50/60 rounded-2xl border border-orange-100 text-[#FF8C00] font-bold text-center text-lg italic flex items-center justify-between">
            <span className="flex-1">" {savedIdentity} "</span>
            {!editing ? (
              <button className="ml-4 text-sm text-[#4DA6FF] hover:underline" onClick={() => { setEditValue(savedIdentity); setEditing(true); }}>{t('edit')}</button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <input className="flex-1 p-2 rounded-md border" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveIdentity(editValue); }} />
                <button className="px-3 py-1 bg-gray-100 rounded-md text-sm" onClick={() => { setEditing(false); setEditValue(''); }}>{t('cancel')}</button>
                <button className="px-3 py-1 bg-[#4DA6FF] text-white rounded-md text-sm" onClick={() => saveIdentity(editValue)}>{t('save')}</button>
              </div>
            )}
          </div>
        ) : (
          <input type="text" value={identity} onChange={(e) => setIdentity(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveIdentity(); }} placeholder={t('northStar')} className="w-full p-5 bg-white rounded-2xl border-none shadow-inner focus:ring-2 focus:ring-orange-200 outline-none" />
        )}
      </div>
      <div className="mt-8 space-y-3">
        <p className="text-gray-400 text-sm mb-4 ml-1 font-medium italic">{t('immediateLabel')}</p>
        {immediates.map((slot: any, i: number) => (
          <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl shadow-sm border border-gray-50 ${slot.done ? 'bg-gray-100' : 'bg-white/80'}`}>
            <input type="checkbox" checked={slot.done} onChange={() => {
              const next = [...immediates];
              next[i].done = !next[i].done;
              setImmediates(next);
              persistImmediate(new Date().toISOString().split('T')[0], next);
            }} className="w-4 h-4" />
            <input className={`flex-1 bg-transparent outline-none ${slot.done ? 'line-through text-gray-400 opacity-50' : ''}`} placeholder={`${t('immediatePlaceholder')} ${i + 1}`} value={slot.text} onChange={(e) => {
              const next = [...immediates]; next[i].text = e.target.value; setImmediates(next); persistImmediate(new Date().toISOString().split('T')[0], next);
            }} />
            <button className="text-gray-400 hover:text-red-400 transition-colors" onClick={() => {
              const next = immediates.filter((_, idx) => idx !== i);
              setImmediates(next);
              persistImmediate(new Date().toISOString().split('T')[0], next);
            }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {/* Add to My Day 버튼 추가 */}
        <button className="flex items-center gap-2 text-gray-400 hover:text-[#4DA6FF] transition-colors mt-3 ml-1" onClick={() => {
          const next = [...immediates, { text: '', done: false }];
          setImmediates(next);
          persistImmediate(new Date().toISOString().split('T')[0], next);
        }}>
          <Plus size={16} />
          <span className="text-sm font-medium">{t('addToMyDay')}</span>
        </button>
      </div>
    </section>
    <section className="px-6 mb-10">
      <button onClick={() => setIsCoreDone(!isCoreDone)} className={`w-full mb-6 py-4 rounded-[1.5rem] font-bold shadow-lg transition-all duration-500 ${isCoreDone ? "bg-green-500 text-white" : "bg-[#4DA6FF] text-white animate-pulse"}`}>
        {isCoreDone ? t('enoughDone') : t('enough70')}
      </button>
      <div className={`bg-white rounded-[2rem] p-7 shadow-sm border transition-all ${isCoreDone ? "opacity-50" : "border-blue-50"}`}>
        <h4 className={`font-bold text-gray-800 text-xl ${isCoreDone ? "line-through" : ""}`}>{t('focusTitle')}</h4>
        <div className="space-y-4 mt-4">
          {focusTasks.map((task: any, idx: number) => (
            <div 
              key={task.id} 
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, idx)}
              className={`p-4 rounded-2xl border ${task.done70 ? 'bg-gray-100' : 'bg-white'} transition-all ${draggedIndex === idx ? 'opacity-50' : 'opacity-100'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-300 cursor-grab active:cursor-grabbing" />
                  <div className="text-sm text-gray-500">{t('focusTask')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`px-3 py-1 rounded-full text-white text-xs ${task.done70 ? 'bg-green-400' : 'bg-[#4DA6FF]'}`} onClick={() => {
                    let next = focusTasks.map((t: any) => t.id === task.id ? { ...t, done70: !t.done70 } : t);
                    next.sort((a: any, b: any) => Number(a.done70) - Number(b.done70));
                    setFocusTasks(next);
                    persistFocusTasks(new Date().toISOString().split('T')[0], next);
                    if (!task.done70) {
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                      });
                    }
                  }}>{task.done70 ? t('enoughDone').split(' ')[0] : t('enough70').split(' ')[0]}</button>
                  <button className="text-gray-400 hover:text-[#4DA6FF] transition-colors" title="Edit Task" onClick={() => onEditFocusTask(task)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-red-400 transition-colors" title="Delete Task" onClick={() => {
                    const next = focusTasks.filter((t: any) => t.id !== task.id);
                    setFocusTasks(next);
                    persistFocusTasks(new Date().toISOString().split('T')[0], next, task.id);
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <input
                className={`mt-3 font-semibold text-lg w-full bg-transparent outline-none placeholder-gray-400 ${task.done70 ? 'line-through text-gray-500 opacity-50' : 'text-gray-800'}`}
                value={task.core}
                placeholder="Focus Task 입력"
                onChange={(e) => {
                  const next = focusTasks.map((t: any, i: number) => i === idx ? { ...t, core: e.target.value } : t);
                  setFocusTasks(next);
                  persistFocusTasks(new Date().toISOString().split('T')[0], next);
                }}
              />
              <div className="mt-3 space-y-2 ml-4">
                {task.subs.map((s: string, si: number) => (
                  <div key={si} className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    <input
                      className={`flex-1 bg-transparent text-sm outline-none placeholder-gray-300 ${task.done70 ? 'line-through text-gray-400 opacity-50' : 'text-gray-600'}`}
                      value={s}
                      placeholder="Sub task 입력"
                      onChange={(e) => {
                        const next = focusTasks.map((t: any, i: number) => i === idx ? { ...t, subs: t.subs.map((sub: string, j: number) => j === si ? e.target.value : sub) } : t);
                        setFocusTasks(next);
                        persistFocusTasks(new Date().toISOString().split('T')[0], next);
                      }}
                    />
                    <button className="text-gray-400 hover:text-red-400 transition-colors" title="Delete Subtask" onClick={() => {
                      const next = focusTasks.map((t: any) => t.id === task.id ? { ...t, subs: t.subs.filter((_: string, i: number) => i !== si) } : t);
                      setFocusTasks(next);
                      persistFocusTasks(new Date().toISOString().split('T')[0], next);
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  className="text-xs text-gray-400 hover:text-[#4DA6FF] flex items-center gap-1 mt-2"
                  onClick={() => {
                    const next = focusTasks.map((t: any, i: number) => i === idx ? { ...t, subs: [...t.subs, ''] } : t);
                    setFocusTasks(next);
                    persistFocusTasks(new Date().toISOString().split('T')[0], next);
                  }}
                >
                  <Plus size={12} /> Add Sub Task
                </button>
              </div>
            </div>
          ))}
          <div className="mt-3">
            <button className="px-4 py-2 bg-white rounded-full border hover:bg-gray-50 transition-colors" onClick={() => setShowFocusModal(true)}>{t('addTask')}</button>
          </div>
        </div>
      </div>
    </section>
    <section className="mx-4 mt-8 mb-28">
      {/* Ads placeholder */}
      <div className="mb-6">
        <div className="bg-white/5 border border-white/6 rounded-2xl p-6 text-center text-sm text-gray-300">Google Ads Placeholder</div>
      </div>

      <div className="rounded-[2.5rem] bg-gradient-to-b from-[#0b1220] to-[#0a0f18] text-white p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-white/8 rounded-full mb-4">
            <Moon size={36} className="text-yellow-300" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 whitespace-pre-line">{t('nightTitle')}</h3>
          <p className="text-sm text-gray-300 mb-6">{t('voicePrompt')}</p>

          <div className="w-full max-w-2xl mt-6 mb-8">
             <label className="block text-sm font-semibold text-gray-300 mb-2 text-center">{t('nightReviewLabel')}</label>
             <div className="w-full bg-white/5 rounded-2xl p-4 flex items-start gap-3">
              <textarea
                className="flex-1 bg-transparent resize-none outline-none text-white placeholder-gray-400 text-sm"
                placeholder={t('nightReviewPlaceholder')}
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div className="flex flex-col gap-3 items-center">
                <button
                  onClick={() => setRecording(!recording)}
                  className={`p-3 rounded-full transition-colors ${recording ? 'bg-red-500' : 'bg-white/10'}`}
                  aria-pressed={recording}
                >
                  <Mic size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full max-w-2xl text-sm text-gray-400">
            <p className="mb-3 text-center font-semibold text-blue-400">{t('tomorrowLabelV2')}</p>
            <div className="space-y-2">
              {tomorrowSteps.map((s: string, i: number) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  value={s}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (i < tomorrowSteps.length - 1) {
                        inputRefs.current[i + 1]?.focus();
                      } else {
                        handleSaveNightReview();
                      }
                    }
                  }}
                  onChange={(e) => {
                  const next = [...tomorrowSteps]; next[i] = e.target.value; setTomorrowSteps(next);
                }} placeholder={[t('tomorrowPlaceholder1'), t('tomorrowPlaceholder2'), t('tomorrowPlaceholder3')][i]} className="w-full p-3 rounded-xl bg-white/5 text-white outline-none focus:bg-white/10 transition-colors" />
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <button className="w-full py-4 bg-[#4DA6FF] rounded-2xl text-white font-bold shadow-lg hover:bg-[#3b8ac4] transition-all active:scale-[0.98]" onClick={handleSaveNightReview}>
                {isNightReviewSaved ? t('saveUpdate') : t('saveNew')}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">{t('syncMessage')}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
};

export default HomeScreen;