import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
    if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const agricultor = await prisma.agricultor.findUnique({
      where: { id: params.id },
      include: { user: true, products: true }
    });

    if (!agricultor) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    return NextResponse.json(agricultor);
  } catch (err) {
    console.error('GET /api/admin/agricultores/[id]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
    if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const body = await request.json();
    const { action, data } = body;

    if (action === 'toggleActive') {
      const targetUserId = params.id;
      // Agricultor model id is the agric ID; need to find user id
      const agricultor = await prisma.agricultor.findUnique({ where: { id: params.id } });
      if (!agricultor) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
      const userId = agricultor.user_id;
      const updated = await prisma.user.update({ where: { id: userId }, data: { isActive: !(await prisma.user.findUnique({ where: { id: userId } })).isActive } });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'setVerified') {
      const { verified } = data || {};
      const updated = await prisma.agricultor.update({ where: { id: params.id }, data: { verificado: Boolean(verified) } });
      return NextResponse.json({ success: true, agricultor: updated });
    }

    if (action === 'updateProfile') {
      // update user profile fields via related User
      const agricultor = await prisma.agricultor.findUnique({ where: { id: params.id } });
      if (!agricultor) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
      const userId = agricultor.user_id;
      const updated = await prisma.user.update({ where: { id: userId }, data });
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (err) {
    console.error('PATCH /api/admin/agricultores/[id]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
    if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const agricultor = await prisma.agricultor.findUnique({ where: { id: params.id } });
    if (!agricultor) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    const targetUserId = agricultor.user_id;
    if (targetUserId === session.user.id) return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });

    const deleted = await prisma.user.delete({ where: { id: targetUserId } });
    return NextResponse.json({ success: true, user: deleted });
  } catch (err) {
    console.error('DELETE /api/admin/agricultores/[id]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
