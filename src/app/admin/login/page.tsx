"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError('Credenciales incorrectas o usuario no autorizado.');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f1117',
      padding: '1rem',
    }}>
      <div style={{
        background: '#1a1d24',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(28,198,228,0.05)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #1cc6e4, #0e8ba8)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(28,198,228,0.2)',
          }}>
            A
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#f1f5f9',
            margin: 0,
          }}>
            Acceso Administrador
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            marginTop: '0.375rem',
          }}>
            Panel de gestión AgroConecta
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#94a3b8',
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@agroconecta.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#0f1117',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                color: '#f1f5f9',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#1cc6e4'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#94a3b8',
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#0f1117',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                color: '#f1f5f9',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#1cc6e4'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              textAlign: 'center',
              background: 'rgba(239,68,68,0.1)',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #1cc6e4, #0e8ba8)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(28,198,228,0.25)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Ingresar
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a
            href="/"
            style={{
              fontSize: '0.875rem',
              color: '#475569',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#1cc6e4'}
            onMouseOut={e => e.currentTarget.style.color = '#475569'}
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
