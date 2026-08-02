'use client';

import { useState, useEffect } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';
import Link from 'next/link';

// ─── Sun / Moon icons ─────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
interface NavbarProps {
  onImport: () => void;
}

const NAV_LINKS = [
  { label: 'About',   href: '/about'   },
  { label: 'Support', href: '/support' },
  { label: 'Privacy', href: '/privacy' },
];

export default function Navbar({ onImport }: NavbarProps) {
  return (
    <div className="pt-4 px-4 w-full flex justify-center sticky top-0 z-40">
      <nav className="nav-blur w-full max-w-5xl rounded-full border border-black/5 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="px-5 h-14 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1.5 group cursor-pointer">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#gradLogoNav)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
              <defs>
                <linearGradient id="gradLogoNav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8a2387" />
                  <stop offset="100%" stopColor="#e94057" />
                </linearGradient>
              </defs>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#8a2387] to-[#e94057] bg-clip-text text-transparent pb-0.5 group-hover:opacity-80 transition-opacity duration-300">
              Graduam
            </span>
          </a>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={onImport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8a2387]/10 dark:bg-[#8a2387]/20 text-[#8a2387] dark:text-[#e94057] font-semibold text-sm hover:bg-[#8a2387]/20 transition-colors"
            >
              Importa
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </div>
  );
}
