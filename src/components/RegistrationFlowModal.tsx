"use client";
import Modal from './Modal';
import { CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RegistrationFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
}

export function RegistrationFlowModal({ 
  isOpen, 
  onClose, 
  userEmail, 
  userName,
}: RegistrationFlowModalProps) {
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/auth/signin?activated=true');
    }
  }, [isOpen, countdown, router]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="lg">
      <div className="p-8 bg-neutral-900 text-white rounded-2xl border border-neutral-800 shadow-2xl">
        <div className="text-center space-y-5">
          {/* Icono Resplandeciente Verde Lima */}
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-400 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              ¡Registro Completado, {userName}!
            </h3>
            <p className="text-sm text-neutral-400">
              Tu cuenta en AgroConecta ha sido activada correctamente.
            </p>
          </div>
          
          {/* Caja con Email y Confirmación */}
          <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-lime-400 uppercase tracking-wider">
              <Mail className="w-4 h-4" />
              <span>Correo de Bienvenida Enviado</span>
            </div>
            <p className="text-neutral-200 font-bold text-base">
              {userEmail}
            </p>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Te hemos enviado un correo de bienvenida con los detalles de tu cuenta.
            </p>
          </div>

          {/* Temporizador de Redirección */}
          <div className="bg-neutral-800/60 border border-neutral-750 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-neutral-300">
              <div className="w-2.5 h-2.5 bg-lime-500 rounded-full animate-pulse"></div>
              <span>Redirigiendo automáticamente al login...</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-lime-500/20 border border-lime-500/30 text-lime-400 font-bold text-xs flex items-center justify-center">
              {countdown}s
            </div>
          </div>
          
          {/* Botón Principal */}
          <div className="pt-2">
            <button
              onClick={() => router.push('/auth/signin?activated=true')}
              className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-lime-600 to-lime-500 hover:from-lime-500 hover:to-lime-600 transition-all shadow-lg shadow-lime-900/40 gap-2 cursor-pointer"
            >
              <span>Iniciar Sesión Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
