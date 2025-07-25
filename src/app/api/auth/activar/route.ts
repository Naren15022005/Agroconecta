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
