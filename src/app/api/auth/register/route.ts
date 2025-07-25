import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { randomBytes } from 'crypto';
import { AgroConectaIdGenerator } from '@/lib/id-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name;
    const email = body.email;
    const password = body.password;
    let role = body.role;
    // Normalizar nombre de rol
    if (role === 'CAMPESINO') role = 'agricultor';
    if (role === 'COMPRADOR') role = 'cliente';
    if (role === 'EMPRESA') role = 'empresa';

    // Validar campos obligatorios
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Validar que el rol sea válido y obtener el roleId
    const roleRecord = await prisma.role.findUnique({
      where: { name: role }
    });
    if (!roleRecord) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { correo: email } });
    if (existingUser) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 409 });
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
      if (role === 'agricultor') {
        await prisma.agricultor.create({
          data: {
            id: AgroConectaIdGenerator.generateAgricultorId(),
            user_id: user.id,
            telefono: body.phone || null,
            ubicacion: body.address || null,
            verificado: false,
          },
        });
      } else if (role === 'cliente') {
        await prisma.cliente.create({
          data: {
            id: AgroConectaIdGenerator.generateClienteId(),
            user_id: user.id,
            telefono: body.phone || null,
            direccion: body.address || null,
          },
        });
      } else if (role === 'empresa') {
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
      // admin no necesita perfil
    } catch (profileError) {
      // Si falla la creación del perfil, eliminar el usuario creado
      console.error('Error creating profile:', profileError);
      await prisma.user.delete({ where: { id: user.id } });
      throw new Error('Error al crear el perfil del usuario');
    }

    // Generar token de activación
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await prisma.verificationToken.create({
      data: {
        identifier: user.correo,
        token,
        expires,
      },
    });

    // Enviar email de bienvenida
    await sendWelcomeEmail(user.correo, user.nombre, token);

    return NextResponse.json({
      message: 'Registro exitoso. Revisa tu correo para activar la cuenta. Una vez activada, serás redirigido automáticamente para iniciar sesión.',
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: roleRecord.displayName || roleRecord.name,
      },
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    let message = 'Error en el registro';
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
