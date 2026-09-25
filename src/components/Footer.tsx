'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="store-footer border-t border-line pt-8 pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-8 px-[4.5%] bg-canvas flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
      <Link href="/" className="brand !text-base" aria-label="CampusTuck Home">
        <span className="brand-mark !w-5 !h-5 mr-2">
          <Check size={12} strokeWidth={2.8} />
        </span>
        <span>campus</span>
        <span className="brand-dot">tuck.</span>
      </Link>

      <p className="text-center text-muted">COMSATS University Islamabad (Park Road, Chak Shahzad) • Pickup in minutes</p>

      <span>© {new Date().getFullYear()} CampusTuck</span>
    </footer>
  );
}
