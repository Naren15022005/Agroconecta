import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
    if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const body = await request.json();
    const { action, data } = body || {};

    if (action === 'toggleActive') {
      const target = await prisma.user.findUnique({ where: { id: params.id } });
      if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      const updated = await prisma.user.update({ where: { id: params.id }, data: { isActive: !target.isActive } });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'setRole') {
      const { isAdmin } = (data || {});
      const adminRole = await prisma.role.findUnique({ where: { name: 'ADMINISTRADOR' } });
      const defaultRole = await prisma.role.findUnique({ where: { name: 'COMPRADOR' } });
      if (!adminRole || !defaultRole) return NextResponse.json({ error: 'Roles no configurados' }, { status: 500 });
      const roleId = isAdmin ? adminRole.id : defaultRole.id;
      const updated = await prisma.user.update({ where: { id: params.id }, data: { roleId } });
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (err) {
    console.error('PATCH /api/admin/usuarios/[id]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
    if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const target = await prisma.user.findUnique({ where: { id: params.id }, include: { role: true } });
    if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json(target);
  } catch (err) {
    console.error('GET /api/admin/usuarios/[id]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
    if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    if (params.id === session.user.id) return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });

    const deleted = await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, user: deleted });
  } catch (err) {
    console.error('DELETE /api/admin/usuarios/[id]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
