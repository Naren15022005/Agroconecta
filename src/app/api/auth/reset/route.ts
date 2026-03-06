import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/password';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ message: 'Missing' }, { status: 400 });

    const record = await prisma.verificationToken.findUnique({ where: { id: token } });
    if (!record) return NextResponse.json({ message: 'Token inválido' }, { status: 400 });
    if (record.expires < new Date()) return NextResponse.json({ message: 'Token expirado' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { correo: record.identifier } });
    if (!user) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });

    // Validate password strength
    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) return NextResponse.json({ message: pwCheck.errors.join(' ') }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { contraseña: hashed } });
    await prisma.verificationToken.delete({ where: { id: token } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
