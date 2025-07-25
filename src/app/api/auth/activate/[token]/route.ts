import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    // Buscar el token de verificación
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json({ 
        error: 'Token inválido o ya utilizado' 
      }, { status: 400 });
    }

    // Verificar si el token ha expirado
    if (verificationToken.expires < new Date()) {
      // Eliminar token expirado
      await prisma.verificationToken.delete({
        where: { token }
      });
      return NextResponse.json({ 
        error: 'Token expirado. Solicita un nuevo enlace de activación.' 
      }, { status: 400 });
    }

    // Buscar el usuario por email
    const user = await prisma.user.findUnique({
      where: { correo: verificationToken.identifier }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    if (user.isActive) {
      // Eliminar token ya que la cuenta ya está activa
      await prisma.verificationToken.delete({
        where: { token }
      });
      return NextResponse.json({ 
        message: 'La cuenta ya está activada' 
      });
    }

    // Activar la cuenta del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true }
    });

    // Eliminar el token de verificación ya utilizado
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({
      message: 'Cuenta activada exitosamente. Ya puedes iniciar sesión.',
      success: true
    });

  } catch (error: any) {
    console.error('Error en activación:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
