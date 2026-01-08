import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
    if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const users = await prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(users);
  } catch (err) {
    console.error('GET /api/admin/usuarios', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
