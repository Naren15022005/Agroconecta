"use client";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ResetPage() {
  const params = useParams();
  const token = params?.token || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setMessage('Las contraseñas no coinciden');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.message || 'Error');
      } else {
        setMessage('Contraseña cambiada. Inicia sesión.');
        setTimeout(() => router.push('/auth/signin'), 1500);
      }
    } catch (err) {
      setMessage('Error del servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-6">
      <div className="w-full max-w-md bg-neutral-800 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Restablecer contraseña</h2>
        {message && <div className="mb-3 text-sm text-neutral-300">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="password" required placeholder="Nueva contraseña (mín. 12, mayúscula, minúscula, número, especial)" value={password} onChange={e=>setPassword(e.target.value)} className="w-full form-input" />
          <input type="password" required placeholder="Confirmar contraseña" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full form-input" />
          <button disabled={loading} className="w-full py-2 bg-lime-600 rounded text-white">{loading? 'Guardando...' : 'Cambiar contraseña'}</button>
        </form>
      </div>
    </div>
  );
}
