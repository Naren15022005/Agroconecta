import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { randomBytes } from 'crypto';
import AgroConectaIdGenerator from '@/lib/id-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    let role = body.role;

    // Los roles ya deben venir con los nombres correctos de la BD
    // No necesitamos normalizar, solo validar que sean roles válidos

    // Validación estricta de campos
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        error: 'Por favor completa todos los campos requeridos.'
      }, { status: 400 });
    }
    // Validar formato de email
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'El correo electrónico no es válido.'
      }, { status: 400 });
    }
    // Validar longitud de contraseña
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres.'
      }, { status: 400 });
    }

    // Validar que el rol sea válido y obtener el roleId
    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) {
      return NextResponse.json({
        success: false,
        error: 'El rol seleccionado no es válido.'
      }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { correo: email } });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'El correo electrónico ya está registrado. ¿Olvidaste tu contraseña?'
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario base SOLO con los campos de la tabla users
    const user = await prisma.user.create({
      data: {
        id: AgroConectaIdGenerator.generateUserId(),
        nombre: name,
        correo: email,
        contraseña: hashedPassword,
        roleId: roleRecord.id,
        isActive: false,
      },
    });

    // Crear perfil específico según el rol (solo si corresponde)
    try {
      if (role === 'CAMPESINO') {
        await prisma.agricultor.create({
          data: {
            id: AgroConectaIdGenerator.generateAgricultorId(),
            user_id: user.id,
            telefono: body.phone || null,
            ubicacion: body.address || null,
            verificado: false,
          },
        });
      } else if (role === 'COMPRADOR') {
        await prisma.cliente.create({
          data: {
            id: AgroConectaIdGenerator.generateClienteId(),
            user_id: user.id,
            telefono: body.phone || null,
            direccion: body.address || null,
          },
        });
      } else if (role === 'EMPRESA') {
        await prisma.empresa.create({
          data: {
            id: AgroConectaIdGenerator.generateEmpresaId(),
            user_id: user.id,
            razon_social: name,
            nit: '',
            telefono: body.phone || null,
            direccion: body.address || null,
            verificada: false,
          },
        });
      }
      // ADMINISTRADOR no necesita perfil
    } catch (profileError) {
      // Si falla la creación del perfil, eliminar el usuario creado
      console.error('Error creando perfil:', profileError);
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json({
        success: false,
        error: 'Hubo un problema al crear el perfil. Intenta nuevamente o contacta soporte.'
      }, { status: 500 });
    }

    // Generar token de activación
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await prisma.verificationToken.create({
      data: {
        id: crypto.randomUUID(),
        identifier: user.correo,
        token,
        expires,
      },
    });

    // Enviar email de bienvenida (no fallar si hay error)
    try {
      await sendWelcomeEmail(user.correo, user.nombre, token);
    } catch (emailError) {
      console.log('Error enviando email de bienvenida:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: '¡Registro exitoso! Revisa tu correo para activar la cuenta. Una vez activada, podrás iniciar sesión.',
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: roleRecord.displayName || roleRecord.name,
      },
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    let message = 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }
}
