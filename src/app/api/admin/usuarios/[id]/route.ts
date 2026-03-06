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

    // Ensure params are awaited (Next.js dynamic params may be async)
    const targetId = await (params as any).id;

    if (action === 'toggleActive') {
      const target = await prisma.user.findUnique({ where: { id: targetId } });
      if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      const updated = await prisma.user.update({ where: { id: targetId }, data: { isActive: !target.isActive } });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'setRole') {
      const { isAdmin } = (data || {});
      const adminRole = await prisma.role.findUnique({ where: { name: 'ADMINISTRADOR' } });
      const defaultRole = await prisma.role.findUnique({ where: { name: 'COMPRADOR' } });
      if (!adminRole || !defaultRole) return NextResponse.json({ error: 'Roles no configurados' }, { status: 500 });
      const roleId = isAdmin ? adminRole.id : defaultRole.id;
      const updated = await prisma.user.update({ where: { id: targetId }, data: { roleId } });
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

    const targetId = await (params as any).id;
    const target = await prisma.user.findUnique({ where: { id: targetId }, include: { role: true } });
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

    const targetId = await (params as any).id;
    if (targetId === session.user.id) return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });

    // Check for dependent records that would block deletion
    const [ordersCount, cartCount, salesCompradorCount, salesVendedorCount, pagosCount, transCount] = await prisma.$transaction([
      prisma.order.count({ where: { buyerId: targetId } }),
      prisma.cartItem.count({ where: { userId: targetId } }),
      prisma.sale.count({ where: { compradorId: targetId } }),
      prisma.sale.count({ where: { vendedorId: targetId } }),
      prisma.pago.count({ where: { userId: targetId } }),
      prisma.transaccion.count({ where: { userId: targetId } }),
    ]);

    const totalDeps = ordersCount + cartCount + salesCompradorCount + salesVendedorCount + pagosCount + transCount;
    if (totalDeps > 0) {
      return NextResponse.json({ error: 'No se puede eliminar el usuario: existen registros dependientes. Elimina o reasigna pedidos/ventas/pagos antes.' , details: { ordersCount, cartCount, salesCompradorCount, salesVendedorCount, pagosCount, transCount }}, { status: 400 });
    }

    const deleted = await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ success: true, user: deleted });
  } catch (err) {
    console.error('DELETE /api/admin/usuarios/[id]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
