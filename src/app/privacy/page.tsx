import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy – Graduam' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{children}</div>
    </div>
  );
}

export default function Privacy() {
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
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-[#8a2387] to-[#e94057] bg-clip-text text-transparent">Graduam</span>
          </Link>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Privacy Policy</span>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass rounded-[36px] p-6 sm:p-10 flex flex-col gap-7">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
            <p className="text-xs text-gray-400">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex flex-col gap-6 divide-y divide-black/5 dark:divide-white/5">
            <Section title="1. Introduzione">
              Graduam è un calcolatore universitario che rispetta la tua privacy. Questa pagina descrive in modo chiaro e trasparente quali dati raccogliamo e come li utilizziamo.
            </Section>
            <div className="pt-6">
              <Section title="2. Dati raccolti">
                <p className="mb-2">Graduam raccoglie esclusivamente:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li><strong className="text-gray-700 dark:text-gray-300">Dati degli esami</strong>: nome, voto, CFU da te inseriti</li>
                  <li><strong className="text-gray-700 dark:text-gray-300">Impostazioni</strong>: punti tesi e commissione</li>
                  <li><strong className="text-gray-700 dark:text-gray-300">Cookie di sessione</strong>: un identificativo anonimo (UUID) per associare i dati al tuo browser, senza identificarti personalmente</li>
                </ul>
              </Section>
            </div>
            <div className="pt-6">
              <Section title="3. Dati NON raccolti">
                Graduam <strong className="text-gray-700 dark:text-gray-300">non raccoglie</strong> nome, cognome, email, numero di matricola, indirizzo IP, dati di geolocalizzazione, dati comportamentali o di tracciamento pubblicitario.
              </Section>
            </div>
            <div className="pt-6">
              <Section title="4. Come utilizziamo i dati">
                I dati vengono usati esclusivamente per fornire il servizio di calcolo della media e del voto di laurea. Non vengono condivisi con terze parti, non vengono usati per profilazione né venduti a inserzionisti.
              </Section>
            </div>
            <div className="pt-6">
              <Section title="5. Conservazione dei dati">
                I dati vengono conservati nel database per 12 mesi dall'ultimo accesso. Il cookie di sessione scade dopo 1 anno. Puoi eliminare i tuoi dati in qualsiasi momento cliccando su «Elimina tutti» nella pagina principale.
              </Section>
            </div>
            <div className="pt-6">
              <Section title="6. Sicurezza">
                I dati sono salvati su un database PostgreSQL in ambiente sicuro. La comunicazione tra il tuo browser e il server avviene esclusivamente via HTTPS.
              </Section>
            </div>
            <div className="pt-6">
              <Section title="7. Contatti">
                Per qualsiasi domanda sulla privacy, scrivi a{' '}
                <a href="mailto:privacy@graduam.app" className="text-[#e94057] font-medium hover:underline">privacy@graduam.app</a>.
              </Section>
            </div>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8a2387] to-[#e94057] text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow hover:opacity-90 transition-all self-start">
            ← Torna al calcolatore
          </Link>
        </div>
      </main>
    </div>
  );
}
