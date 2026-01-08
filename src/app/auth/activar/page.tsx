"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ActivarContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Activando tu cuenta...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado.');
      return;
    }
    fetch(`/api/auth/activar?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Cuenta activada correctamente.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al activar la cuenta.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Error de red al activar la cuenta.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Activación de cuenta</h2>
        <p className={status === 'success' ? 'text-green-600' : 'text-red-600'}>{message}</p>
        {status === 'success' && (
          <Link href="/auth/signin" className="mt-6 inline-block text-green-700 font-semibold hover:underline">
            Iniciar sesión
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ActivarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-green-50 flex items-center justify-center"><div>Cargando...</div></div>}>
      <ActivarContent />
    </Suspense>
  );
}
