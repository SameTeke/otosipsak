/* eslint-disable jsx-a11y/anchor-is-valid */
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const navItems = [
  { label: 'Araba Al', href: '/araba-al' },
  { label: 'Araba Sat', href: '/arac-sat' },
  { label: 'Motosiklet Sat', href: '/motosiklet-sat' },
  { label: 'Konsinye Bırak', href: '/konsinye-birak' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'İletişim', href: '/iletisim' },
  { label: 'Blog', href: '/blog' }
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" onClick={closeMenu}>
          <Image
            src="/images/otosipsak-header-logo.png"
            alt="Otosipsak A.Ş."
            width={260}
            height={72}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Menüyü aç/kapat"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
        >
          <span className="text-xl">☰</span>
        </button>

        <nav
          className={`absolute left-0 right-0 top-full mx-4 mt-2 origin-top rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200 transition-[transform,opacity] duration-200 ease-out will-change-transform ${
            open
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'pointer-events-none opacity-0 -translate-y-2 scale-[0.98]'
          } md:static md:mx-0 md:mt-0 md:flex md:items-center md:gap-4 md:bg-transparent md:p-0 md:opacity-100 md:translate-y-0 md:shadow-none md:ring-0 md:pointer-events-auto`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 lg:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="text-sm font-medium text-slate-700 transition hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/arac-sat"
              onClick={closeMenu}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:ml-2 animate-pulse-scale"
            >
              Arabanı Hemen Sat
            </Link>
          </div>
        </nav>
      </div>

      <style jsx global>{`
        @keyframes pulse-scale {
          0% {
            transform: scale(1);
            box-shadow: 0 10px 25px -12px rgba(0, 0, 0, 0.2);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 12px 28px -10px rgba(255, 167, 38, 0.45);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 10px 25px -12px rgba(0, 0, 0, 0.2);
          }
        }
        .animate-pulse-scale {
          animation: pulse-scale 1.8s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
}

