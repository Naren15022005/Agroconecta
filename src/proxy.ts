import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protege la ruta /admin y sus subrutas
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir acceso libre a /admin/login y /admin/register
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/register') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // Si no hay sesión o el rol no es admin, redirigir al home
    if (!token || token.role !== 'ADMINISTRADOR') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
