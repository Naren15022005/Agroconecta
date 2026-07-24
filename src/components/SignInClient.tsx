"use client";
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import BrandIcon from '@/components/BrandIcon';
import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingDots from '@/components/LoadingDots';

const ROLE_ROUTES: Record<string, string> = {
  COMPRADOR: '/comprador/mercado',
  EMPRESA: '/comprador/mercado',
  CAMPESINO: '/agricultor/mercado',
  ADMINISTRADOR: '/admin',
};

export default function SignInClient({ activated }: { activated: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showActivationSuccess, setShowActivationSuccess] = useState(activated);
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (activated) {
      setShowActivationSuccess(true);
      setTimeout(() => setShowActivationSuccess(false), 5000);
    }
    try {
      const saved = localStorage.getItem('agc_remember_email');
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch (e) {}

    setGoogleEnabled(false);
  }, [activated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        remember
      } as any);
      const ok = (res as any)?.ok || (res as any)?.status === 200 || (res as any)?.url;
      if (ok) {
        try {
          if (remember) {
            localStorage.setItem('agc_remember_email', email);
          } else {
            localStorage.removeItem('agc_remember_email');
          }
        } catch (e) {}
        const session = await getSession();
        const role = session?.user?.role;
        const dest = (role && ROLE_ROUTES[role]) || '/';
        router.push(dest);
        return;
      }
      const errorMsg = (res as any)?.error || 'No se pudo iniciar sesión. Intenta nuevamente.';
      setError(errorMsg);
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-lime-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-lime-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-md relative">
        <div className="signin-card rounded-2xl p-8 relative z-10">
          <div className="flex flex-col items-center mb-6">
            <BrandIcon className="brand-icon w-16 h-16 mb-3" />
            <h2 className="text-2xl font-bold text-white">Iniciar sesión</h2>
            <p className="text-sm text-neutral-400 mt-1">Accede con tu correo y contraseña</p>
          </div>

          {showActivationSuccess && (
            <div className="mb-4 bg-emerald-900/5 border border-emerald-800 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-800/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-300">¡Cuenta activada!</p>
                  <p className="text-xs text-neutral-300">Ya puedes iniciar sesión con tus credenciales.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-900/5 border border-red-800 rounded-md p-3">
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full form-input"
                placeholder="Correo electrónico"
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full form-input"
                placeholder="Contraseña"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 rounded"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Recordarme
              </label>
              <Link href="/auth/forgot" className="text-sm text-lime-400 hover:text-lime-300">¿Olvidaste tu contraseña?</Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-gradient-to-r from-lime-600 to-lime-500 text-white font-semibold hover:from-lime-500 hover:to-lime-600 disabled:opacity-60 transition-all shadow-2xl shadow-lime-900/60"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div>
              {googleEnabled === null ? (
                <div className="w-full py-2 rounded-lg border border-neutral-700 text-neutral-200 flex items-center justify-center">
                  <LoadingDots />
                </div>
              ) : googleEnabled ? (
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl: '/auth/redirect' })}
                  className="w-full py-2 rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800/30 transition-colors"
                >
                  Iniciar con Google
                </button>
              ) : (
                <div className="w-full py-2 rounded-lg border border-neutral-700 text-neutral-500 bg-neutral-900/20 text-center">
                  Proveedor Google no configurado. Consulta <span className="font-medium text-lime-400">.env</span>
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-neutral-400">¿No tienes cuenta? {' '}
                <Link href="/auth/registro" className="font-semibold text-lime-400 hover:text-lime-300">Regístrate</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
