import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About – Gradly' };

export default function About() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#09090b] transition-colors duration-500">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[140px] opacity-60 dark:opacity-20 animate-blob"
          style={{ background: 'linear-gradient(to right, #8a2387, #e94057)' }}
        />
        <div
          className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[140px] opacity-60 dark:opacity-20 animate-blob animation-delay-2000"
          style={{ background: 'linear-gradient(to right, #f27121, #e94057)' }}
        />
      </div>
      <nav className="nav-blur sticky top-0 z-40 border-b border-black/5 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#gradLogoNav)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
              <defs>
                <linearGradient id="gradLogoNav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8a2387" />
                  <stop offset="100%" stopColor="#e94057" />
                </linearGradient>
              </defs>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-[#8a2387] to-[#e94057] bg-clip-text text-transparent">Gradly</span>
          </Link>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">About</span>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="glass rounded-3xl p-10 flex flex-col gap-8">
          <div className="flex items-center gap-5">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="url(#gradLogoLarge)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
              <defs>
                <linearGradient id="gradLogoLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8a2387" />
                  <stop offset="100%" stopColor="#e94057" />
                </linearGradient>
              </defs>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Gradly</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Il calcolatore universitario più elegante d'Italia</p>
            </div>
          </div>
          <div className="flex flex-col gap-5 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            <p>
              <strong className="text-gray-900 dark:text-white">Gradly</strong> è uno strumento gratuito che aiuta gli studenti universitari italiani a calcolare la propria <strong>media ponderata</strong> e a stimare il <strong>voto finale di laurea</strong>.
            </p>
            <p>
              Progettato con la stessa cura dei prodotti Apple, Gradly combina semplicità e potenza: puoi inserire i tuoi esami manualmente oppure importare il piano di studi direttamente dal portale della tua università — al momento supportiamo <strong>UniPa</strong> (Università degli Studi di Palermo).
            </p>
            <p>
              I tuoi dati vengono salvati in modo sicuro su un database PostgreSQL associato alla tua sessione anonima — nessun account richiesto, nessun dato personale raccolto.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🎓', title: 'Calcoli precisi', desc: 'Media ponderata e voto finale secondo la formula ufficiale 110/30.' },
              { icon: '🔒', title: 'Privacy first', desc: 'Sessioni anonime. Nessun account, nessun tracciamento personale.' },
              { icon: '🏫', title: 'Importazione corsi', desc: 'Importa il piano di studi direttamente da UniPa in pochi click.' },
            ].map((f) => (
              <div key={f.title} className="bg-white/60 dark:bg-black/20 rounded-2xl p-5 border border-white dark:border-white/5">
                <div className="text-3xl mb-3">{f.icon}</div>
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8a2387] to-[#e94057] text-white font-semibold px-6 py-3 rounded-full shadow hover:opacity-90 transition-all self-start">
            ← Torna al calcolatore
          </Link>
        </div>
      </main>
    </div>
  );
}
