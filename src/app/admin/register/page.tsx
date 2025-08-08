"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        role: 'ADMINISTRADOR',
      }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess('Administrador creado correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => router.push('/admin/login'), 2000);
    } else {
      setError(data.error || 'Error al registrar administrador.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-900">Registro Administrador</h1>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold">Nombre completo</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold">Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        {success && <div className="text-green-600 mb-4 text-center">{success}</div>}
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded font-bold hover:bg-green-800 transition">Registrar</button>
      </form>
    </main>
  );
}
