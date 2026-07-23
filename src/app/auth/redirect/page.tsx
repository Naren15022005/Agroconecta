"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

const ROLE_ROUTES: Record<string, string> = {
  COMPRADOR: '/comprador/mercado',
  EMPRESA: '/comprador/mercado',
  CAMPESINO: '/agricultor/mercado',
  ADMINISTRADOR: '/admin',
};

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      const role = session?.user?.role;
      const dest = (role && ROLE_ROUTES[role]) || '/';
      router.replace(dest);
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)' }} />
    </div>
  );
}
