export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token de activación requerido.'
      }, { status: 400 });
    }

    // Buscar el token en la base de datos
    const verification = await prisma.verificationToken.findUnique({ where: { token } });
    if (!verification || verification.expires < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'El token es inválido o ha expirado.'
      }, { status: 400 });
    }

    // Activar el usuario
    await prisma.user.update({
      where: { correo: verification.identifier },
      data: { isActive: true }
    });

    // Eliminar el token
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({
      success: true,
      message: '¡Cuenta activada exitosamente! Ya puedes iniciar sesión.'
    });
  } catch (error: any) {
    console.error('Error en activación:', error);
    return NextResponse.json({
      success: false,
      error: 'Ocurrió un error al activar la cuenta. Intenta nuevamente.'
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 400 });
  }
  // Buscar el token en la base de datos
  const verification = await prisma.verificationToken.findUnique({ where: { token } });
  if (!verification || verification.expires < new Date()) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
  }
  // Activar el usuario
  await prisma.user.update({
    where: { correo: verification.identifier },
    data: { isActive: true },
  });
  // Eliminar el token para que no se reutilice
  await prisma.verificationToken.delete({ where: { token } });
  return NextResponse.json({ message: 'Cuenta activada correctamente. Ya puedes iniciar sesión.' });
}
