import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gradly – Calcola il tuo voto di laurea",
  description:
    "Gradly è il calcolatore universitario più elegante per la media ponderata e il voto finale di laurea.",
  keywords: "voto laurea, media ponderata, calcolo media università, UniPa",
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col antialiased bg-[#f5f5f7] dark:bg-[#0d0d10] text-gray-900 dark:text-gray-100 transition-colors duration-300"
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
