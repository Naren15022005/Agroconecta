import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const proxy = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const userRole = (token?.role as string)?.toUpperCase();

    // 1. Protección de Rutas de Administración (/admin/*)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN' && userRole !== 'ADMINISTRADOR') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    // 2. Protección de Rutas de Agricultor (/agricultor/*)
    if (pathname.startsWith('/agricultor')) {
      if (userRole !== 'CAMPESINO' && userRole !== 'ADMIN' && userRole !== 'SUPERADMIN' && userRole !== 'ADMINISTRADOR') {
        return NextResponse.redirect(new URL('/auth/signin?error=AccessDenied', req.url));
      }
    }

    // 3. Protección de Rutas Privadas de Comprador (/comprador/*)
    if (pathname.startsWith('/comprador') && !pathname.startsWith('/comprador/mercado')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Rutas públicas accesibles sin autenticación
        if (
          pathname === '/' ||
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/admin/login') ||
          pathname.startsWith('/mercado') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname.startsWith('/uploads')
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/agricultor/:path*',
    '/comprador/carrito/:path*',
    '/comprador/checkout/:path*',
    '/comprador/favoritos/:path*',
    '/comprador/pedidos/:path*',
    '/admin/dashboard/:path*',
    '/admin/usuarios/:path*',
    '/admin/agricultores/:path*',
    '/admin/productos/:path*',
    '/admin/pedidos/:path*',
    '/admin/pagos/:path*',
    '/admin/billetera/:path*'
  ],
};
