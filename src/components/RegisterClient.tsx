"use client";
export const dynamic = 'force-dynamic';
import dynamicImport from 'next/dynamic';
const StakeholderSelect = dynamicImport(() => import('@/components/StakeholderSelect'), { ssr: false });
import Link from 'next/link';
import BrandIcon from '@/components/BrandIcon';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingDots from '@/components/LoadingDots';
import { ErrorModal } from '@/components/StatusModals';
import { RegistrationFlowModal } from '@/components/RegistrationFlowModal';
import { validatePassword } from '@/lib/password';

export default function RegisterClient({ initialRole }: { initialRole?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState(initialRole || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [registeredName, setRegisteredName] = useState<string | null>(null);
  const [checkingActivation, setCheckingActivation] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    setGoogleEnabled(false);
  }, []);

  useEffect(() => {
    if (!registeredEmail) return;
    const checkActivation = async () => {
      try {
        const response = await fetch('/api/auth/check-activation', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: registeredEmail })
        });
        const result = await response.json();
        if (result.isActive) {
          setCheckingActivation(true);
          setTimeout(() => router.push('/auth/signin?activated=true'), 1500);
        }
      } catch (e) {}
    };
    const i = setInterval(checkActivation, 3000);
    return () => clearInterval(i);
  }, [registeredEmail, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      setError(pwCheck.errors.join(' '));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, role, password })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Error en el registro');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      setRegisteredEmail(email);
      setRegisteredName(name);
      setShowRegistrationModal(true);
      setName(''); setEmail(''); setPassword(''); setConfirm('');
    } catch (err: any) {
      setError(err?.message || 'Error en registro');
      setShowErrorModal(true);
    } finally { setLoading(false); }
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
            <h2 className="text-2xl font-bold text-white">Regístrate</h2>
            <p className="text-sm text-neutral-400 mt-1">Crea tu cuenta en AgroConecta</p>
          </div>

          {error && (<div className="mb-4 bg-red-900/5 border border-red-800 rounded-md p-3"><div className="text-sm text-red-300">{error}</div></div>)}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="sr-only">Nombre completo</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Nombre completo" className="w-full form-input" />
            </div>
            <div>
              <label className="sr-only">Correo</label>
              <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="Correo electrónico" className="w-full form-input" />
            </div>
            <div>
              <input type="hidden" name="role" value={role} />
              <StakeholderSelect value={role} onChange={setRole} />
            </div>
            <div>
              <label className="sr-only">Contraseña</label>
              <input value={password} onChange={e => setPassword(e.target.value)} required type="password" placeholder="Mínimo 12 caracteres, mayúscula, minúscula, número y carácter especial" className="w-full form-input" />
            </div>
            <div>
              <label className="sr-only">Confirmar contraseña</label>
              <input value={confirm} onChange={e => setConfirm(e.target.value)} required type="password" placeholder="Confirma tu contraseña" className="w-full form-input" />
            </div>

            <div>
              <button disabled={loading} type="submit" className="w-full py-3 rounded-md bg-gradient-to-r from-lime-600 to-lime-500 text-white font-semibold hover:from-lime-500 hover:to-lime-600 disabled:opacity-60 transition-all shadow-2xl shadow-lime-900/60">
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </div>

            <div>
              {googleEnabled === null ? (
                <div className="w-full py-2 rounded-lg border border-neutral-700 text-neutral-200 flex items-center justify-center"><LoadingDots /></div>
              ) : googleEnabled ? (
                <button type="button" onClick={() => signIn('google', { callbackUrl: '/auth/redirect' })} className="w-full py-2 rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800/30 transition-colors">Registrarte con Google</button>
              ) : (
                <div className="w-full py-2 rounded-lg border border-neutral-700 text-neutral-500 bg-neutral-900/20 text-center">Proveedor Google no configurado. Consulta .env</div>
              )}
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-neutral-400">¿Ya tienes cuenta? {' '}<Link href="/auth/signin" className="font-semibold text-lime-400 hover:text-lime-300">Inicia sesión</Link></p>
            </div>
          </form>

          <RegistrationFlowModal isOpen={showRegistrationModal} onClose={() => setShowRegistrationModal(false)} userEmail={registeredEmail || ''} userName={registeredName || ''} isActivated={checkingActivation} />
          <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Error en el Registro" message={error || ''} suggestions={["Verifica que todos los campos estén completos","Asegúrate de que el correo no esté ya registrado","Revisa que las contraseñas coincidan","Intenta con un correo diferente"]} />
        </div>
      </div>
    </div>
  );
}
