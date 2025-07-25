"use client";
import Link from 'next/link';
import { Tractor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SuccessModal, ErrorModal } from '@/components/StatusModals';
import { LoadingModal } from '@/components/LoadingModal';

export default function ActivarPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const params = useParams();

  useEffect(() => {
    const activateAccount = async () => {
      if (!params.token) {
        setError('Token no válido');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/activate/${params.token}`);
        const result = await response.json();

        if (response.ok) {
          setSuccess(true);
          setMessage(result.message);
        } else {
          setError(result.error || 'Error en la activación');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    activateAccount();
  }, [params.token]);

  // Countdown y redirección automática cuando la activación es exitosa
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      // Intentar cerrar la pestaña primero
      if (window.opener) {
        window.close();
      } else {
        // Si no puede cerrar, mostrar mensaje para cerrar manualmente
      }
    }
  }, [success, countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <Tractor className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
            Activación de Cuenta
          </h2>
          <p className="text-center text-lg text-gray-600">
            Verificando tu cuenta de AgroConecta
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
          {/* Los modales manejan todos los estados */}
        </div>
        
        {/* Modal de carga */}
        <LoadingModal
          isOpen={loading}
          title="Activando tu cuenta"
          message="Por favor espera mientras procesamos tu activación..."
        />
        
        {/* Modal de éxito con countdown */}
        <SuccessModal
          isOpen={success}
          onClose={() => {}}
          title="¡Cuenta Activada Exitosamente!"
          message={message}
          subMessage={`Puedes cerrar esta ventana y volver al registro. Te permitirá iniciar sesión directamente. Auto-cierre en ${countdown} segundos.`}
          actionButton={
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Ir a Iniciar Sesión Ahora
              </Link>
              <p className="text-xs text-gray-500">
                Vuelve a la pestaña del registro para iniciar sesión
              </p>
            </div>
          }
        />
        
        {/* Modal de error */}
        <ErrorModal
          isOpen={!!error}
          onClose={() => {}}
          title="Error en la Activación"
          message={error || ''}
          suggestions={[
            "Verifica que el enlace sea correcto",
            "El token puede haber expirado (válido por 24 horas)",
            "La cuenta puede ya estar activada"
          ]}
          actionButton={
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center w-full py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                Intentar Iniciar Sesión
              </Link>
              
              <Link
                href="/auth/registro"
                className="inline-flex items-center justify-center w-full py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Registrarse Nuevamente
              </Link>
            </div>
          }
        />
        </div>
      </div>
    </div>
  );
}
