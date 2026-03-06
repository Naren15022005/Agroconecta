import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, provider, providerAccountId } = body;
    if (!email || !password || !provider || !providerAccountId) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { correo: email } });
    if (!user) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });

    const valid = await bcrypt.compare(password, user.contraseña);
    if (!valid) return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 });

    // Create account link
    try {
      await prisma.account.create({
        data: {
          id: require('crypto').randomUUID?.() || require('crypto').randomBytes(16).toString('hex'),
          userId: user.id,
          type: 'oauth',
          provider: provider,
          providerAccountId: providerAccountId,
          // tokens not available here; left null
        }
      });
    } catch (err) {
      console.error('Error creating account link:', err);
      return NextResponse.json({ message: 'Error creando enlace' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
