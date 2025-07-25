"use client";
import Modal from './Modal';
import { CheckCircle, Mail, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ActivatedLogin } from './ActivatedLogin';

interface RegistrationFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  isActivated?: boolean;
}

export function RegistrationFlowModal({ 
  isOpen, 
  onClose, 
  userEmail, 
  userName,
  isActivated = false 
}: RegistrationFlowModalProps) {
  const [step, setStep] = useState<'email-sent' | 'checking' | 'activated' | 'login'>('email-sent');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isActivated && step !== 'activated' && step !== 'login') {
      setStep('activated');
      setCountdown(3);
    }
  }, [isActivated, step]);

  useEffect(() => {
    if (step === 'activated' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === 'activated' && countdown === 0) {
      setStep('login'); // Cambiar a estado de login en lugar de redirigir
    }
  }, [step, countdown]);

  const openEmailClient = () => {
    // Detectar el dominio del email para abrir el cliente correcto
    const emailDomain = userEmail.split('@')[1]?.toLowerCase();
    
    let emailUrl = 'https://mail.google.com'; // Por defecto Gmail
    
    if (emailDomain?.includes('gmail')) {
      emailUrl = 'https://mail.google.com';
    } else if (emailDomain?.includes('outlook') || emailDomain?.includes('hotmail') || emailDomain?.includes('live')) {
      emailUrl = 'https://outlook.live.com';
    } else if (emailDomain?.includes('yahoo')) {
      emailUrl = 'https://mail.yahoo.com';
    } else if (emailDomain?.includes('icloud')) {
      emailUrl = 'https://www.icloud.com/mail';
    }
    
    window.open(emailUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="lg">
      <div className="p-8">
        {step === 'email-sent' && (
          <div className="text-center">
            {/* Email icon */}
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="h-12 w-12 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Registro Exitoso, {userName}!
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Te hemos enviado un correo de activación a:
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <p className="text-blue-800 font-semibold text-lg mb-2">
                {userEmail}
              </p>
              <p className="text-blue-600 text-sm">
                Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-medium text-sm">Detectando activación automáticamente</span>
              </div>
              <p className="text-green-600 text-xs">
                No necesitas refrescar esta página - te redirigiremos automáticamente cuando actives tu cuenta
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={openEmailClient}
                className="w-full inline-flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir mi correo
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                Continuar en esta página
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              ¿No ves el correo? Revisa tu carpeta de spam o correo no deseado
            </p>
          </div>
        )}

        {step === 'activated' && (
          <div className="text-center">
            {/* Success icon with animation */}
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Cuenta Activada Exitosamente!
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              ¡Perfecto! Tu cuenta ha sido activada. Ahora puedes iniciar sesión.
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-semibold">Redirigiendo automáticamente</span>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-green-200 mb-3 shadow-inner">
                  <span className="text-2xl font-bold text-green-600">{countdown}</span>
                </div>
                <p className="text-green-700 text-sm">
                  Te llevaremos al inicio de sesión automáticamente
                </p>
              </div>
            </div>
            
            <button
              onClick={() => window.location.href = '/auth/signin?activated=true'}
              className="w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
            >
              Ir a Iniciar Sesión Ahora
            </button>
          </div>
        )}

        {step === 'login' && (
          <ActivatedLogin
            userEmail={userEmail}
            onClose={() => setStep('email-sent')}
          />
        )}
      </div>
    </Modal>
  );
}
