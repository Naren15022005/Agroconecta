import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
  if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  try {
    const body = await req.json();
    const { liquidacionId, comprobanteUrl } = body;
    if (!liquidacionId || !comprobanteUrl) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

    const updated = await prisma.liquidacion.update({ where: { id: liquidacionId }, data: { comprobante_url: comprobanteUrl } });

    return NextResponse.json({ ok: true, updated: { id: updated.id, comprobanteUrl: updated.comprobante_url } });
  } catch (err: any) {
    console.error('Error updating comprobante:', err);
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 });
  }
}
