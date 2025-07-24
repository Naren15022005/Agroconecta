import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, role, address, password } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        address,
        password: hashedPassword,
        isActive: false, // Activación por email
      },
    });

    // Generar token de activación
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    await sendWelcomeEmail(user.email, user.name, token);
    return NextResponse.json({ message: 'Registro exitoso. Revisa tu correo para activar la cuenta.' });
  } catch (error: any) {
    let message = 'Error en el registro';
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
