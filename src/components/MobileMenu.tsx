"use client";
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Handle PWA beforeinstallprompt so we can trigger install from the mobile menu
  useEffect(() => {
    function onBeforeInstallPrompt(e: any) {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    function onAppInstalled() {
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', onAppInstalled as EventListener)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', onAppInstalled as EventListener)
    }
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md bg-neutral-800/30 hover:bg-neutral-800/50 transition"
      >
        {open ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-40">
          <nav className="flex flex-col p-2">
            <Link href="/comprador/mercado" className="px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded">Mercado</Link>
            <Link href="/auth/signin" className="px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded">Iniciar sesión</Link>
            <Link href="/auth/registro" className="px-3 py-2 text-sm text-white bg-lime-600 rounded mt-1 text-center">Registrarse</Link>
            <button
              onClick={async (e) => {
                e.preventDefault()
                if (deferredPrompt) {
                  // Show the native install prompt
                  deferredPrompt.prompt()
                  const choice = await deferredPrompt.userChoice
                  // Clear the saved prompt regardless of choice
                  setDeferredPrompt(null)
                  // optionally handle choice.outcome ('accepted'|'dismissed') later
                  console.log('PWA install choice', choice)
                } else {
                  // No prompt available yet — fallback: guide user or link to manifest
                  // For now, open the manifest so the user can see PWA info (future improvement)
                  window.open('/manifest.json', '_blank')
                }
                setOpen(false)
              }}
              className="mt-2 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded text-left"
            >
              Descargar
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
