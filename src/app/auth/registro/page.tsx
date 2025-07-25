"use client";
import Link from 'next/link'
import { Tractor } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ErrorModal } from '@/components/StatusModals'
import { RegistrationFlowModal } from '@/components/RegistrationFlowModal'

export default function RegistroPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [registeredName, setRegisteredName] = useState<string | null>(null);
  const [checkingActivation, setCheckingActivation] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Verificar periódicamente si la cuenta se activó (solo después del registro exitoso)
  useEffect(() => {
    if (!registeredEmail) return;

    const checkActivation = async () => {
      try {
        const response = await fetch('/api/auth/check-activation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registeredEmail }),
        });
        const result = await response.json();
        
        if (result.isActive) {
          setCheckingActivation(true);
          // En lugar de redirigir inmediatamente, mostrar mensaje de éxito y luego redirigir
          setTimeout(() => {
            window.location.href = '/auth/signin?activated=true';
          }, 3000);
        }
      } catch (error) {
        // Silencioso, no mostrar error si falla la verificación
      }
    };

    // Verificar cada 3 segundos si la cuenta se activó
    const interval = setInterval(checkActivation, 3000);
    return () => clearInterval(interval);
  }, [registeredEmail]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string;
    const address = formData.get('address') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, role, address, password }),
      });
      let result: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const text = await res.text();
        result.error = text;
      }
      if (!res.ok) throw new Error(result.error || 'Error en el registro');
      setError(null);
      setRegisteredEmail(email); // Guardar email para verificar activación
      setRegisteredName(name); // Guardar nombre para el modal
      setShowRegistrationModal(true); // Mostrar modal de registro
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
      setShowErrorModal(true); // Mostrar modal de error
    } finally {
      setLoading(false);
    }
  }

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
            Únete a AgroConecta
          </h2>
          <p className="text-center text-lg text-gray-600 mb-4">
            Conecta directamente con productores y compradores
          </p>
          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        
        {/* Modales */}
        <RegistrationFlowModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          userEmail={registeredEmail || ''}
          userName={registeredName || ''}
          isActivated={checkingActivation}
        />

        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error en el Registro"
          message={error || ''}
          suggestions={[
            "Verifica que todos los campos estén completos",
            "Asegúrate de que el correo no esté ya registrado",
            "Revisa que las contraseñas coincidan",
            "Intenta con un correo diferente"
          ]}
          actionButton={
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              Intentar de Nuevo
            </button>
          }
        />
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {(role === 'COMPRADOR' || role === 'EMPRESA') && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="+57 300 123 4567"
                />
              </div>
            )}

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Tipo de usuario
              </label>
              {role ? (
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-gray-700 sm:text-sm">
                  {role === 'CAMPESINO' && '🚜 Campesino/Agricultor'}
                  {role === 'COMPRADOR' && '🛒 Comprador Individual'}
                  {role === 'EMPRESA' && '🏢 Empresa'}
                  <input type="hidden" name="role" value={role} />
                </div>
              ) : (
                <select
                  id="role"
                  name="role"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">Selecciona tu tipo de usuario</option>
                  <option value="CAMPESINO">Campesino/Agricultor</option>
                  <option value="COMPRADOR">Comprador Individual</option>
                  <option value="EMPRESA">Empresa</option>
                </select>
              )}
            </div>

            {(role === 'COMPRADOR' || role === 'EMPRESA') && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Tu dirección completa"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Confirma tu contraseña"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              Acepto los{' '}
              <a href="#" className="text-green-600 hover:text-green-500">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="#" className="text-green-600 hover:text-green-500">
                política de privacidad
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Crear Cuenta</span>
                </div>
              )}
            </button>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Volver al inicio
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
