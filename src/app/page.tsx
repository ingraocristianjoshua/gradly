'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';


import GradeArc               from '@/components/GradeArc';
import PointsSlider           from '@/components/PointsSlider';
import Navbar                 from '@/components/Navbar';
import UniversitySearchModal  from '@/components/UniversitySearchModal';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Exam {
  id: string;
  name: string;
  grade: number;
  cfu: number;
  lode: boolean;
  isCore?: boolean;
}

export interface BonusRule {
  id: string;
  min: number;
  max: number;
  points: number;
}

// ─── Small shared UI ─────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center gap-1 hover:scale-[1.03] transition-transform duration-200">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-extrabold tracking-tight ${accent ? 'text-[#e94057]' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcStats(exams: Exam[], worstCfuToDrop: number = 0, bonusRules: BonusRule[] = []) {
  let totalCfu = 0;
  let excludedCfu = 0;
  
  exams.forEach((e) => { 
    totalCfu += e.cfu; 
    if (e.isCore === false) {
      excludedCfu += e.cfu;
    }
  });

  const countedGraded = exams.filter((e) => e.grade > 0 && e.isCore !== false);
  
  const sorted = [...countedGraded].sort((a, b) => {
    const aGrade = a.lode ? 30.1 : a.grade;
    const bGrade = b.lode ? 30.1 : b.grade;
    return aGrade - bGrade;
  });

  let remainingDrop = worstCfuToDrop;
  let sumGrades = 0, sumWeighted = 0, gradedCfu = 0;
  let discardedCfu = 0;
  let countedExams = 0;
  let droppedExams: Array<{name: string, cfuDropped: number, grade: number}> = [];

  for (const e of sorted) {
    let cfuToCount = e.cfu;
    
    if (remainingDrop > 0) {
      const drop = Math.min(e.cfu, remainingDrop);
      cfuToCount -= drop;
      remainingDrop -= drop;
      discardedCfu += drop;
      droppedExams.push({ name: e.name, cfuDropped: drop, grade: e.grade });
    }

    if (cfuToCount > 0) {
      const g = e.lode ? 30 : e.grade;
      sumGrades += g;
      countedExams += 1;
      sumWeighted += g * cfuToCount;
      gradedCfu += cfuToCount;
    }
  }

  const aritmetica = countedExams > 0 ? sumGrades / countedExams : 0;
  const ponderata  = gradedCfu > 0 ? sumWeighted / gradedCfu : 0;
  const partenza   = ponderata * 110 / 30;
  
  let computedBonus = 0;
  for (const r of bonusRules) {
    if (ponderata >= r.min && ponderata <= r.max) {
      if (r.points > computedBonus) computedBonus = r.points;
    }
  }
  
  return { aritmetica, ponderata, partenza, totalCfu, gradedCfu, excludedCfu, discardedCfu, droppedExams, computedBonus };
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed`);
  return res.json();
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  // ── State ──
  const [exams, setExams]           = useState<Exam[]>([]);
  const [thesisPoints, setThesis]   = useState(0);
  const [committeePoints, setComm]  = useState(0);
  const [worstCfu, setWorstCfu]     = useState(0);
  const [bonusRules, setBonusRules] = useState<BonusRule[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const [dbReady, setDbReady]       = useState(false);

  // Bonus rule form state
  const [ruleMin, setRuleMin] = useState('26');
  const [ruleMax, setRuleMax] = useState('27');
  const [rulePts, setRulePts] = useState('3');

  // Form state
  const [examName, setExamName]   = useState('');
  const [examGrade, setExamGrade] = useState<number | null>(null);
  const [examLode, setExamLode]   = useState(false);
  const [examCfu, setExamCfu]     = useState('');
  const [examIsCore, setExamIsCore] = useState(true);
  const [adding, setAdding]       = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEditing = (exam: Exam) => {
    setEditingId(exam.id);
    setExamName(exam.name);
    setExamGrade(exam.grade > 0 ? exam.grade : null);
    setExamLode(exam.lode);
    setExamCfu(exam.cfu.toString());
    setExamIsCore(exam.isCore ?? true);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setExamName('');
    setExamGrade(null);
    setExamLode(false);
    setExamCfu('');
    setExamIsCore(true);
  };

  // ── Load from DB (with localStorage fallback) ──
  const loadData = useCallback(async () => {
    try {
      const [er, sr] = await Promise.all([fetch('/api/exams'), fetch('/api/settings')]);
      if (er.ok) setExams(await er.json());
      if (sr.ok) {
        const s = await sr.json();
        if (s) {
          setThesis(s.thesisPoints || 0);
          setComm(s.committeePoints || 0);
          setWorstCfu(s.worstCfu || 0);
        }
      }
    } catch {
      const e = localStorage.getItem('gradly_exams');
      if (e) setExams(JSON.parse(e));
      setThesis(parseInt(localStorage.getItem('gradly_thesis') || '0'));
      setComm(parseInt(localStorage.getItem('gradly_committee') || '0'));
      setWorstCfu(parseInt(localStorage.getItem('gradly_worst_cfu') || '0'));
      
      const b = localStorage.getItem('gradly_bonus_rules');
      if (b) setBonusRules(JSON.parse(b));
    } finally {
      setDbReady(true);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Persist settings (debounced) ──
  useEffect(() => {
    if (!dbReady) return;
    const id = setTimeout(() => {
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thesisPoints, committeePoints, worstCfu }),
      }).catch(() => {
        localStorage.setItem('gradly_thesis',     thesisPoints.toString());
        localStorage.setItem('gradly_committee',  committeePoints.toString());
        localStorage.setItem('gradly_worst_cfu',  worstCfu.toString());
        localStorage.setItem('gradly_bonus_rules', JSON.stringify(bonusRules));
      });
    }, 600);
    return () => clearTimeout(id);
  }, [thesisPoints, committeePoints, worstCfu, bonusRules, dbReady]);

  // ── Persist exams to local storage ──
  useEffect(() => {
    if (dbReady) {
      localStorage.setItem('gradly_exams', JSON.stringify(exams));
    }
  }, [exams, dbReady]);

  // ── Save exam (add or update) ──
  const saveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (examGrade === null || !examCfu) return;
    const cfu = parseInt(examCfu);
    if (isNaN(cfu) || cfu <= 0) return;

    setAdding(true);
    const payload = {
      name: examName.trim() || `Esame ${exams.length + 1}`,
      grade: examGrade,
      cfu,
      lode: examLode && examGrade === 30,
      isCore: examIsCore,
    };

    if (editingId) {
      // Update existing
      try {
        const updated = await fetch(`/api/exams/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(r => r.ok ? r.json() : null);
        if (updated) {
          setExams(prev => prev.map(ex => ex.id === editingId ? updated : ex));
        } else {
          throw new Error();
        }
      } catch {
        setExams(prev => prev.map(ex => ex.id === editingId ? { ...ex, ...payload } : ex));
      }
    } else {
      // Add new
      try {
        const newExam = await apiPost<Exam>('/api/exams', payload);
        setExams((prev) => [...prev, newExam]);
      } catch {
        setExams((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
      }
    }
    
    cancelEditing();
    setAdding(false);
  };

  // ── Remove exam ──
  const removeExam = async (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    try { await fetch(`/api/exams/${id}`, { method: 'DELETE' }); } catch {}
  };

  // ── Clear all ──
  const clearAll = async () => {
    if (!confirm('Eliminare tutti gli esami?')) return;
    setExams([]);
    try { await fetch('/api/exams', { method: 'DELETE' }); } catch {}
  };

  // ── Import from university modal ──
  const importExams = async (imported: { name: string; cfu: number }[]) => {
    const existing = new Set(exams.map((e) => e.name.toLowerCase()));
    for (const ex of imported) {
      if (existing.has(ex.name.toLowerCase())) continue;
      try {
        const newExam = await apiPost<Exam>('/api/exams', { ...ex, grade: 0, lode: false });
        setExams((prev) => [...prev, newExam]);
        existing.add(ex.name.toLowerCase());
      } catch {
        const fallback: Exam = { id: crypto.randomUUID(), ...ex, grade: 0, lode: false };
        setExams((prev) => [...prev, fallback]);
      }
    }
    setShowImport(false);
  };

  // ── Stats Calculation ──
  const { aritmetica, ponderata, partenza, totalCfu, gradedCfu, excludedCfu, discardedCfu, droppedExams, computedBonus } = calcStats(exams, worstCfu, bonusRules);
  const hasGrade = gradedCfu > 0;
  let finaleCapped = 0;
  let lodeFinale = false;

  if (hasGrade) {
    const finalBonus = Math.max(committeePoints, computedBonus);
    let totale = partenza + thesisPoints + finalBonus;
    finaleCapped = Math.min(Math.round(totale), 110);
    lodeFinale = totale >= 111;
  }

  const coreExams = exams.filter((e) => e.isCore !== false);
  const excludedExams = exams.filter((e) => e.isCore === false);

  // ── Render ──
  return (
    <>
      <Navbar onImport={() => setShowImport(true)} />
      {/* ── Animated Mesh Background ── */}
      <div className="fixed inset-0 -z-20 bg-[#f8f9fa] dark:bg-[#09090b] transition-colors duration-500" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[140px] opacity-30 dark:opacity-15 animate-blob"
          style={{ background: 'linear-gradient(to right, #8a2387, #e94057)' }}
        />
        <div
          className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[140px] opacity-30 dark:opacity-15 animate-blob animation-delay-2000"
          style={{ background: 'linear-gradient(to right, #f27121, #e94057)' }}
        />
        <div
          className="absolute bottom-[-20%] left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[140px] opacity-30 dark:opacity-15 animate-blob animation-delay-4000"
          style={{ background: 'linear-gradient(to right, #8a2387, #818cf8)' }}
        />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10">

        {/* ── Hero: grade arc ── */}
        <section className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-[12px] md:gap-[18px] mb-2">
              <svg className="w-[68px] h-[68px] md:w-[102px] md:h-[102px] drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="url(#gradLogoHero)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="gradLogoHero" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8a2387" />
                    <stop offset="100%" stopColor="#e94057" />
                  </linearGradient>
                </defs>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <h1 className="text-[48px] md:text-[72px] font-extrabold tracking-tight bg-gradient-to-r from-[#8a2387] to-[#e94057] bg-clip-text text-transparent pb-[4px] md:pb-[6px] leading-none">
                Gradly
              </h1>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Calcola il tuo voto di laurea
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-base font-medium max-w-lg">
              Inserisci o importa gli esami — il calcolo è automatico.
            </p>
          </div>

          <GradeArc
            grade={hasGrade ? finaleCapped : 0}
            lode={lodeFinale}
            partenza={partenza}
            thesisPoints={thesisPoints}
            committeePoints={Math.max(committeePoints, computedBonus)}
          />

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
            <StatCard label="Media Aritmetica" value={aritmetica ? aritmetica.toFixed(2) : '—'} />
            <StatCard label="Media Ponderata"  value={ponderata  ? ponderata.toFixed(2)  : '—'} accent />
            <StatCard label="Base / 110"        value={partenza   ? partenza.toFixed(2)   : '—'} />
            <StatCard label="CFU"               value={`${gradedCfu}/${totalCfu}`} />
          </div>
        </section>

        {/* ── Content grid ── */}
        <div className="flex flex-col gap-6 animate-fade-in">

          {/* TOP GRID: Form & Exam List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: form */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="glass rounded-3xl p-6 sm:p-8 h-full">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Modifica esame' : 'Aggiungi esame'}
                </h2>
                {editingId && (
                  <button type="button" onClick={cancelEditing} className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                    Annulla
                  </button>
                )}
              </div>
              <form onSubmit={saveExam} className="flex flex-col gap-4">
                {/* Settore 1: Nome */}
                <div className="bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                    1. Nome materia
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      placeholder="es. Analisi Matematica I"
                      className="app-input bg-white/70 dark:bg-black/40"
                    />
                    {!editingId && (
                      <button
                        type="button"
                        onClick={() => { setExamName('Materia a Scelta'); setExamCfu('6'); setExamIsCore(false); }}
                        className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 self-start px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-md transition-colors"
                      >
                        + Aggiungi rapido: Materia a Scelta
                      </button>
                    )}
                  </div>
                  
                  {/* Toggle Caratterizzante */}
                  <label className="flex items-center gap-3 mt-4 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={examIsCore} 
                        onChange={(e) => setExamIsCore(e.target.checked)} 
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${examIsCore ? 'bg-[#e94057]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${examIsCore ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Materia caratterizzante</span>
                      <span className="text-[10px] text-gray-400">Rilevante per il conteggio finale</span>
                    </div>
                  </label>
                </div>

                {/* Settore 2: CFU */}
                <div className="bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                    2. Crediti (CFU)
                  </label>
                  <select
                    value={examCfu}
                    onChange={(e) => setExamCfu(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/10 rounded-[14px] px-4 py-2.5 text-[15px] font-medium text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8a2387]/50 transition-all border border-transparent hover:bg-black/10 dark:hover:bg-white/20"
                  >
                    <option value="" disabled>Seleziona i CFU</option>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(c => (
                      <option key={c} value={c.toString()}>{c} CFU</option>
                    ))}
                  </select>
                </div>

                {/* Settore 3: Voto */}
                <div className="bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                    3. Voto in 30esimi
                  </label>
                  <select
                    value={examLode && examGrade === 30 ? '30L' : (examGrade || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '30L') {
                        setExamGrade(30);
                        setExamLode(true);
                      } else {
                        setExamGrade(parseInt(val));
                        setExamLode(false);
                      }
                    }}
                    className="w-full bg-black/5 dark:bg-white/10 rounded-[14px] px-4 py-2.5 text-[15px] font-medium text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8a2387]/50 transition-all border border-transparent hover:bg-black/10 dark:hover:bg-white/20"
                  >
                    <option value="" disabled>Seleziona il voto</option>
                    {Array.from({ length: 13 }, (_, i) => 18 + i).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="30L">30 e Lode ✨</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={examGrade === null || !examCfu || adding}
                  className="w-full bg-gradient-to-r from-[#8a2387] to-[#e94057] text-white font-semibold
                    py-3.5 rounded-2xl shadow-lg hover:opacity-90 hover:scale-[1.01]
                    disabled:opacity-40 disabled:scale-100 transition-all mt-2"
                >
                  {adding ? 'Salvataggio…' : (editingId ? 'Salva Modifiche →' : 'Aggiungi Esame →')}
                </button>
              </form>
            </div>
          </div>
            
          {/* Right: exam list */}
          <div className="lg:col-span-6 flex flex-col">
            {exams.length > 0 ? (
              <div className="glass rounded-3xl p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Esami{' '}
                    <span className="text-[#e94057]">({exams.length})</span>
                  </h2>
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-1.5
                      rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    Elimina tutti
                  </button>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto flex-1 max-h-[500px] pr-1">
                  {coreExams.map((exam) => (
                    <div
                      key={exam.id}
                      onClick={() => startEditing(exam)}
                      className="flex items-center gap-3 p-3.5 rounded-2xl
                        bg-white/50 dark:bg-white/5
                        border border-white/60 dark:border-white/8
                        hover:bg-white/70 dark:hover:bg-white/8
                        transition-all group cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {exam.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{exam.cfu} CFU</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {exam.grade > 0 ? (
                          <span className="flex items-center gap-1.5">
                            <span className="text-base font-extrabold text-gray-900 dark:text-white">
                              {exam.grade}
                            </span>
                            {exam.lode && (
                              <span className="text-[10px] font-extrabold bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-1.5 py-0.5 rounded-md">
                                LODE
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-gray-600 italic">—</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeExam(exam.id); }}
                          className="w-7 h-7 rounded-full text-gray-300 dark:text-gray-600
                            hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                            flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-all text-sm"
                          aria-label={`Rimuovi ${exam.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Escluse section */}
                  {excludedExams.length > 0 && (
                    <>
                      <div className="mt-4 mb-2 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Escluse dalla media</h3>
                        <span className="text-[10px] font-semibold bg-gray-200 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md">
                          {excludedCfu} CFU non conteggiati
                        </span>
                      </div>
                      {excludedExams.map((exam) => (
                        <div
                          key={exam.id}
                          onClick={() => startEditing(exam)}
                          className="flex items-center gap-3 p-3.5 rounded-2xl
                            bg-white/30 dark:bg-black/10
                            border border-white/40 dark:border-white/5
                            opacity-70 hover:opacity-100
                            transition-all group cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 truncate line-through decoration-gray-400/50">
                              {exam.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{exam.cfu} CFU</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {exam.grade > 0 ? (
                              <span className="text-base font-bold text-gray-400 dark:text-gray-500 line-through decoration-gray-400/50">
                                {exam.grade}{exam.lode ? 'L' : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-gray-600 italic">—</span>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeExam(exam.id); }}
                              className="w-7 h-7 rounded-full text-gray-300 dark:text-gray-600
                                hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                                flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition-all text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="glass rounded-3xl p-10 flex flex-col items-center gap-5 text-center h-full justify-center">
                <div className="text-6xl animate-bounce">🎓</div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">Nessun esame ancora</p>
                  <p className="text-gray-400 text-sm mt-1 max-w-xs">
                    Aggiungi esami dal form oppure importa il tuo piano di studi universitario.
                  </p>
                </div>
                <button
                  onClick={() => setShowImport(true)}
                  className="bg-gradient-to-r from-[#8a2387] to-[#e94057] text-white text-sm
                    font-semibold px-6 py-2.5 rounded-full shadow hover:opacity-90 transition-all"
                >
                  Importa piano di studi →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM WIDE BLOCK: Settings & Bonus */}
        <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8 w-full items-stretch animate-fade-in">
           
           {/* Left side: Points & Bonus Rules */}
           <div className="flex-1 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Punti aggiuntivi e Impostazioni</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Thesis Slider */}
                <div>
                  <PointsSlider
                    label="Punti tesi"
                    desc="Valutazione dell'elaborato"
                    value={thesisPoints} min={0} max={15}
                    onChange={setThesis}
                    color="#e94057"
                  />
                  
                  <div className="mt-8 border-t border-black/5 dark:border-white/5 pt-6">
                    <PointsSlider
                      label="Bonus Extra (Manuale)"
                      desc="Eventuali punti fissi extra"
                      value={committeePoints} min={0} max={7}
                      onChange={setComm}
                      color="#8a2387"
                    />
                  </div>
                </div>
                
                {/* Dynamic Rules for Average */}
                <div className="bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-white/50 dark:border-white/5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Regole Bonus Media</h3>
                  <p className="text-[11px] text-gray-500 mb-4">Aggiunge in automatico punti extra in base alla media ponderata.</p>
                  
                  {/* Add Rule Form */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold text-gray-500">Da</span>
                    <input type="number" step="0.5" className="app-input w-16 text-center text-sm py-1.5 px-2 bg-white/70 dark:bg-black/40" value={ruleMin} onChange={e => setRuleMin(e.target.value)} />
                    <span className="text-xs font-semibold text-gray-500">A</span>
                    <input type="number" step="0.5" className="app-input w-16 text-center text-sm py-1.5 px-2 bg-white/70 dark:bg-black/40" value={ruleMax} onChange={e => setRuleMax(e.target.value)} />
                    <span className="text-xs font-semibold text-gray-500">Pt:</span>
                    <input type="number" className="app-input w-12 text-center text-sm py-1.5 px-2 bg-white/70 dark:bg-black/40" value={rulePts} onChange={e => setRulePts(e.target.value)} />
                    <button 
                      onClick={() => {
                        if(ruleMin && ruleMax && rulePts) {
                          setBonusRules([...bonusRules, { id: crypto.randomUUID(), min: parseFloat(ruleMin), max: parseFloat(ruleMax), points: parseFloat(rulePts) }]);
                        }
                      }}
                      className="ml-auto bg-[#8a2387] hover:bg-[#e94057] transition-colors text-white text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
                    >+</button>
                  </div>
                  
                  {/* Rules List */}
                  <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {bonusRules.length === 0 && <div className="text-xs text-gray-400 italic text-center py-2">Nessuna regola definita</div>}
                    {bonusRules.map(r => {
                      const isActive = ponderata >= r.min && ponderata <= r.max;
                      return (
                        <div key={r.id} className={`flex items-center justify-between p-2 rounded-xl border text-sm transition-all ${isActive ? 'bg-[#8a2387]/10 border-[#8a2387]/30' : 'bg-black/5 dark:bg-white/5 border-transparent'}`}>
                          <div className="flex items-center gap-2">
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#e94057] animate-pulse"></div>}
                            <span className={`font-semibold ${isActive ? 'text-[#e94057]' : 'text-gray-600 dark:text-gray-300'}`}>{r.min} — {r.max}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#8a2387]">+{r.points} pt</span>
                            <button onClick={() => setBonusRules(bonusRules.filter(br => br.id !== r.id))} className="text-gray-400 hover:text-red-500">✕</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
           </div>
           
           {/* Right side: Worst CFU Exclusion & Manual Exclusion */}
           <div className="flex flex-col gap-6 lg:w-[320px] lg:border-l border-t lg:border-t-0 border-black/5 dark:border-white/5 pt-6 lg:pt-0 lg:pl-8">
              <div>
                <PointsSlider
                  label="Scarta peggiori (CFU)"
                  desc="CFU da escludere dalla media"
                  value={worstCfu} min={0} max={18}
                  onChange={setWorstCfu}
                  color="#f27121"
                />
              </div>

              {/* Dropped Exams Visual Receipt */}
              {droppedExams.length > 0 && (
                <div className="bg-[#f27121]/5 border border-[#f27121]/20 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f27121] uppercase tracking-wider">Materie Scartate ({discardedCfu} CFU)</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {droppedExams.map((dx, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-white/50 dark:bg-black/20 p-1.5 px-3 rounded-lg">
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[140px]" title={dx.name}>{dx.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-400">{dx.grade}</span>
                          <span className="text-[10px] font-bold bg-[#f27121] text-white px-1.5 rounded">- {dx.cfuDropped} cfu</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action for Manual Exclusion Popup */}
              <div className="mt-auto flex flex-col items-start gap-2 pt-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Esclusione Manuale</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Escludi intere materie dalla media.</p>
                  <button onClick={() => setShowExclusionModal(true)} className="mt-1 px-4 py-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-sm font-semibold transition-all text-gray-700 dark:text-gray-200 shadow-sm w-full">
                    Gestisci materie...
                  </button>
              </div>
           </div>
        </div>
        </div>
      </main>

      <footer className="mt-10 border-t border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-sm py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mt-0.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span className="font-semibold text-lg text-gray-500 dark:text-gray-400">Gradly</span>
          </div>
          <div className="flex gap-5">
            {[['About', '/about'], ['Support', '/support'], ['Privacy', '/privacy']].map(([l, h]) => (
              <Link key={h} href={h} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                {l}
              </Link>
            ))}
          </div>
          <span>© {new Date().getFullYear()} Gradly</span>
        </div>
      </footer>

      {showImport && (
        <UniversitySearchModal
          onClose={() => setShowImport(false)}
          onImport={importExams}
        />
      )}

      {showExclusionModal && (
        <div className="modal-backdrop" onClick={() => setShowExclusionModal(false)}>
          <div className="glass animate-scale-in w-full max-w-md rounded-3xl flex flex-col overflow-hidden max-h-[85vh] border border-black/5 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Materie Escluse</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Deseleziona le materie per escluderle dal calcolo della media.</p>
              </div>
              <button onClick={() => setShowExclusionModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {exams.map(ex => (
                 <label key={ex.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${ex.isCore !== false ? 'bg-[#e94057]/10 dark:bg-[#e94057]/20 border-[#e94057]/20' : 'bg-white/40 dark:bg-white/5 border-transparent opacity-60'}`}>
                    <input type="checkbox" className="accent-[#e94057] w-4 h-4" checked={ex.isCore !== false} onChange={(e) => {
                       const next = [...exams];
                       const idx = next.findIndex(x => x.id === ex.id);
                       next[idx] = { ...next[idx], isCore: e.target.checked };
                       setExams(next);
                    }}/>
                    <span className={`flex-1 text-sm font-medium ${ex.isCore !== false ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 line-through'}`}>{ex.name}</span>
                    <span className="text-xs font-bold text-gray-500 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">{ex.cfu} CFU</span>
                 </label>
              ))}
              {exams.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Nessun esame presente.</p>
              )}
            </div>
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20">
              <button onClick={() => setShowExclusionModal(false)} className="w-full bg-gradient-to-r from-[#8a2387] to-[#e94057] text-white py-3.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity">Fatto</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
