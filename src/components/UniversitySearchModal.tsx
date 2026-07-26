'use client';

import { useState, useEffect, useCallback } from 'react';

interface SearchResult {
  name: string;
  links: { name: string; oid: string }[];
}

interface Props {
  onClose: () => void;
  onImport: (exams: { name: string; cfu: number }[]) => void;
}

type Step = 'search' | 'curricula' | 'preview';

export default function UniversitySearchModal({ onClose, onImport }: Props) {
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery]         = useState('');
  const [year, setYear]           = useState(new Date().getFullYear().toString());
  const [results, setResults]     = useState<SearchResult[]>([]);
  const [filtered, setFiltered]   = useState<SearchResult[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [selected, setSelected]   = useState<SearchResult | null>(null);
  const [lectures, setLectures]   = useState<{ name: string; cfu: number }[]>([]);
  const [degreeName, setDegreeName] = useState('');
  const [chosen, setChosen]       = useState<Set<number>>(new Set());

  // Filter results client-side on query change
  useEffect(() => {
    if (!results.length) { setFiltered([]); return; }
    const q = query.toLowerCase();
    setFiltered(q ? results.filter(r => r.name.toLowerCase().includes(q)) : results);
  }, [query, results]);

  const searchUnipa = useCallback(async () => {
    setLoading(true);
    setError('');
    setResults([]);
    setFiltered([]);
    try {
      const res = await fetch(`/api/unipa/search?anno=${year}`);
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResults(data);
      setFiltered(data);
      setStep('search');
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  }, [year]);

  // Auto-load on mount
  useEffect(() => { searchUnipa(); }, [searchUnipa]);

  const pickCurriculum = async (oid: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/unipa/fetch?oid=${oid}`);
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setLectures(data.lectures ?? []);
      setDegreeName(data.name ?? '');
      setChosen(new Set(data.lectures.map((_: unknown, i: number) => i)));
      setStep('preview');
    } catch {
      setError('Errore nel recupero del piano di studi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAll = () => {
    if (chosen.size === lectures.length) setChosen(new Set());
    else setChosen(new Set(lectures.map((_, i) => i)));
  };

  const confirmImport = () => {
    onImport(lectures.filter((_, i) => chosen.has(i)));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass dark:bg-[#18181b]/80 animate-scale-in w-full max-w-2xl rounded-3xl flex flex-col max-h-[85vh] overflow-hidden border border-black/5 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#gradLogoModal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
              <defs>
                <linearGradient id="gradLogoModal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8a2387" />
                  <stop offset="100%" stopColor="#e94057" />
                </linearGradient>
              </defs>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {step === 'preview' ? 'Scegli le materie' : 'Importa Piano di Studi'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Università degli Studi di Palermo (UniPa)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step === 'preview' && (
              <button
                onClick={() => setStep('search')}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                ← Indietro
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 overflow-hidden p-6 gap-4">

          {step !== 'preview' && (
            <>
              {/* Search bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cerca corso di laurea (es. Informatica)..."
                    className="w-full pl-9 pr-4 py-3 bg-white/80 dark:bg-white/5 border border-black/8 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-[#e94057] focus:ring-4 focus:ring-[#e94057]/15 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-white/80 dark:bg-[#27272a] border border-black/8 dark:border-white/10 rounded-xl px-3 py-3 text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-[#e94057] transition-all"
                >
                  {[0, 1, 2, 3].map((offset) => {
                    const y = (new Date().getFullYear() - offset).toString();
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
                <button
                  onClick={searchUnipa}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#8a2387] to-[#e94057] text-white text-sm font-semibold px-4 py-3 rounded-xl shadow hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {loading ? '...' : '↻'}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 text-sm font-medium px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {loading && !results.length && (
                <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
                  <div className="w-8 h-8 border-2 border-[#e94057]/30 border-t-[#e94057] rounded-full animate-spin" />
                  <p className="text-sm font-medium">Caricamento offerta formativa UniPa...</p>
                </div>
              )}
            </>
          )}

          {/* Results list */}
          {step === 'search' && filtered.length > 0 && (
            <div className="flex-1 overflow-y-auto -mx-1 px-1 flex flex-col gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{filtered.length} corsi trovati</p>
              {filtered.map((r, i) => (
                <div key={i} className="bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-white dark:border-white/5 rounded-2xl p-4 transition-all cursor-pointer group"
                  onClick={() => { setSelected(r); setStep('curricula'); }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm group-hover:text-[#e94057] transition-colors">{r.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.links.length} curriculum{r.links.length !== 1 ? 'a' : ''}</p>
                    </div>
                    <svg className="text-gray-300 dark:text-gray-600 group-hover:text-[#e94057] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Curricula picker */}
          {step === 'curricula' && selected && (
            <div className="flex-1 overflow-y-auto -mx-1 px-1 flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{selected.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Seleziona il tuo curriculum:</p>
              {selected.links.map((link, i) => (
                <button
                  key={i}
                  onClick={() => pickCurriculum(link.oid)}
                  disabled={loading}
                  className="w-full text-left bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-white dark:border-white/5 rounded-2xl p-4 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-[#e94057] dark:hover:text-[#e94057] transition-all disabled:opacity-50"
                >
                  {loading ? 'Caricamento...' : link.name || 'Curriculum standard'}
                </button>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-gray-400 text-sm pt-2">
                  <div className="w-5 h-5 border-2 border-[#e94057]/30 border-t-[#e94057] rounded-full animate-spin flex-shrink-0" />
                  Recupero piano di studi...
                </div>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {/* Preview */}
          {step === 'preview' && (
            <div className="flex flex-col flex-1 overflow-hidden gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{degreeName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{chosen.size} / {lectures.length} materie selezionate</p>
                </div>
                <button onClick={toggleAll} className="text-xs font-semibold text-[#e94057] hover:opacity-80 transition-opacity">
                  {chosen.size === lectures.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto -mx-1 px-1 flex flex-col gap-1.5">
                {lectures.map((lec, i) => (
                  <label key={i} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${chosen.has(i) ? 'bg-[#e94057]/10 dark:bg-[#e94057]/20 border border-[#e94057]/20' : 'bg-white/40 dark:bg-white/5 border border-transparent hover:bg-white/60 dark:hover:bg-white/10'}`}>
                    <input
                      type="checkbox"
                      checked={chosen.has(i)}
                      onChange={() => {
                        const next = new Set(chosen);
                        if (next.has(i)) next.delete(i); else next.add(i);
                        setChosen(next);
                      }}
                      className="accent-[#e94057] w-4 h-4"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{lec.name}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">{lec.cfu} CFU</span>
                  </label>
                ))}
              </div>
              <button
                onClick={confirmImport}
                disabled={chosen.size === 0}
                className="w-full bg-gradient-to-r from-[#8a2387] to-[#e94057] text-white font-semibold py-3.5 rounded-xl shadow-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Importa {chosen.size} materie
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
