"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LinkAccountClient({ email, provider, providerAccountId }: { email: string; provider: string; providerAccountId: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, provider, providerAccountId })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || 'Error enlazando cuenta');
        setLoading(false);
        return;
      }
      const s = await signIn('credentials', { redirect: false, email, password } as any);
      if ((s as any)?.ok) {
        router.push('/auth/redirect');
      } else {
        setError('Enlace creado, pero no se pudo iniciar sesión automáticamente. Inicia sesión manualmente.');
      }
    } catch (err) {
      setError('Error en el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-6">
      <div className="w-full max-w-md bg-neutral-800 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Enlazar cuenta Google</h2>
        <p className="text-sm text-neutral-400 mb-4">Se detectó una cuenta existente para <strong className="text-lime-300">{email}</strong>. Ingresa tu contraseña para confirmar y enlazar la cuenta Google.</p>
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleLink} className="space-y-3">
          <div>
            <label className="sr-only">Contraseña</label>
            <input type="password" required placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full form-input" />
          </div>
          <div>
            <button disabled={loading} className="w-full py-2 bg-lime-600 rounded text-white">{loading ? 'Procesando...' : 'Enlazar y entrar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
