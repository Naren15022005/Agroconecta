"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.message || 'Error');
      } else {
        setMessage('Si el correo existe, te hemos enviado un enlace para restablecer la contraseña. Revisa tu bandeja de entrada.');
      }
    } catch (err) {
      setMessage('Error de servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-6">
      <div className="w-full max-w-md bg-neutral-800 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Recuperar contraseña</h2>
        <p className="text-sm text-neutral-400 mb-4">Ingresa tu correo y te enviaremos un enlace para restablecer la contraseña.</p>
        {message && <div className="mb-3 text-sm text-neutral-300">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="sr-only">Correo</label>
            <input type="email" required placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} className="w-full form-input" />
          </div>
          <div>
            <button disabled={loading} className="w-full py-2 bg-lime-600 rounded text-white">{loading ? 'Enviando...' : 'Enviar enlace'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
