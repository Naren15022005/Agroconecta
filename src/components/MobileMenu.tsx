"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, UserPlus, Download } from 'lucide-react';

interface MobileMenuProps {
  showMarketLink?: boolean;
}

export default function MobileMenu({ showMarketLink = false }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function onBeforeInstallPrompt(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    function onAppInstalled() {
      setDeferredPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', onAppInstalled as EventListener);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', onAppInstalled as EventListener);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="p-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-750 border border-neutral-700/80 text-neutral-200 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-lime-500/50 cursor-pointer select-none active:scale-95 flex items-center justify-center"
      >
        {open ? (
          <X className="w-5 h-5 text-lime-400 pointer-events-none" />
        ) : (
          <Menu className="w-5 h-5 text-white pointer-events-none" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-neutral-900/95 border border-neutral-700/80 rounded-xl shadow-2xl backdrop-blur-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <nav className="flex flex-col space-y-2">
            {showMarketLink && (
              <Link
                href="/comprador/mercado"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                🌾 Explorar Mercado
              </Link>
            )}

            <Link
              href="/auth/signin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
            >
              <LogIn className="w-4 h-4 text-neutral-400 pointer-events-none" />
              <span>Iniciar sesión</span>
            </Link>

            <Link
              href="/auth/registro"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-600 rounded-lg transition-all shadow-lg shadow-lime-900/50"
            >
              <UserPlus className="w-4 h-4 pointer-events-none" />
              <span>Registrarse</span>
            </Link>

            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  await deferredPrompt.userChoice;
                  setDeferredPrompt(null);
                } else {
                  window.open('/manifest.json', '_blank');
                }
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-lg transition-colors pt-2 border-t border-neutral-800"
            >
              <Download className="w-3.5 h-3.5 pointer-events-none" />
              <span>Descargar App (PWA)</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
