import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Support – Gradly' };

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-5 border border-white dark:border-white/5">
      <p className="font-bold text-gray-900 dark:text-white text-sm mb-2">{q}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
    </div>
  );
}

export default function Support() {
  return (
    <div className="min-h-screen transition-colors duration-500">
      <div className="fixed inset-0 -z-20 bg-animated-gradient transition-colors duration-500" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-300 dark:bg-blue-900 mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-300 dark:bg-purple-900 mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-pink-300 dark:bg-pink-900 mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
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
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Support</span>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 flex flex-col gap-8">
        <div className="glass rounded-[36px] p-6 sm:p-10 flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Supporto</h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Hai domande su come funziona Gradly? Ecco le risposte alle domande più frequenti. Per qualsiasi altra richiesta, puoi contattarci via email.
          </p>
          <div className="flex flex-col gap-3">
            <FAQ q="Come viene calcolata la media ponderata?"
              a="La media ponderata si calcola come: somma(Voto × CFU) / somma(CFU). Un esame con Lode viene conteggiato con voto 30 nel calcolo." />
            <FAQ q="Come viene calcolato il voto di laurea?"
              a="Voto finale = (Media Ponderata × 110 / 30) + Punti Tesi + Punti Commissione. Il risultato viene arrotondato e limitato a 110. Se il punteggio supera 111, viene assegnata la Lode." />
            <FAQ q="Come funziona l'importazione da UniPa?"
              a="Clicca su 'Importa Materie', cerca il tuo corso di laurea, seleziona il curriculum e scegli le materie da importare. Vengono importate solo le materie con valutazione in trentesimi." />
            <FAQ q="I miei dati vengono salvati?"
              a="Sì. I tuoi esami vengono salvati su database PostgreSQL tramite una sessione anonima nel tuo browser (cookie). Non servono account o dati personali." />
            <FAQ q="Posso usare Gradly per qualsiasi università italiana?"
              a="Al momento l'importazione automatica è disponibile solo per UniPa. Puoi comunque inserire manualmente gli esami di qualsiasi università." />
            <FAQ q="Il calcolatore è gratuito?"
              a="Sì, Gradly è completamente gratuito e senza pubblicità." />
          </div>
          <div className="bg-gradient-to-br from-[#8a2387]/10 to-[#e94057]/10 dark:from-[#8a2387]/20 dark:to-[#e94057]/20 rounded-2xl p-5 border border-[#e94057]/10">
            <p className="font-bold text-gray-900 dark:text-white mb-1">Hai altri problemi?</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Scrivici e risponderemo entro 24 ore.</p>
            <a href="mailto:support@gradly.app" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8a2387] to-[#e94057] text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow hover:opacity-90 transition-all">
              📧 Contattaci
            </a>
          </div>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors self-start">
          ← Torna al calcolatore
        </Link>
      </main>
    </div>
  );
}
