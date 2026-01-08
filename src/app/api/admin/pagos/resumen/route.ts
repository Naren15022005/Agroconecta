import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function parseDateParam(dateParam: string | null) {
  if (!dateParam) return null;
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return null;
  const start = new Date(`${dateParam}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(`${dateParam}T23:59:59.999`);
  return { start, end, date: dateParam };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
  if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const parsed = parseDateParam(searchParams.get('date'));
  if (!parsed) return NextResponse.json({ error: 'Parámetro "date" inválido. Usa formato YYYY-MM-DD.' }, { status: 400 });

  const liquidaciones = await prisma.liquidacion.findMany({
    where: {
      fecha_pago: {
        gte: parsed.start,
        lte: parsed.end,
      },
    },
    orderBy: { fecha_pago: 'desc' },
  });

  const agricultorIds = Array.from(new Set(liquidaciones.map((l) => l.agricultor_id)));
  const agricultores = await prisma.agricultor.findMany({
    where: { id: { in: agricultorIds } },
    include: { user: { select: { nombre: true, correo: true } } },
  });

  const agricById = new Map(agricultores.map((a) => [a.id, a] as const));

  const items = liquidaciones.map((l) => {
    const agric = agricById.get(l.agricultor_id);
    return {
      id: l.id,
      agricultorId: l.agricultor_id,
      agricultorNombre: agric?.user?.nombre ?? null,
      agricultorCorreo: agric?.user?.correo ?? null,
      totalPagado: Number(l.total_pagado),
      cantidadPedidos: l.cantidad_pedidos,
      tipoPago: l.tipo_pago,
      metodoPago: l.metodo_pago ?? null,
      comprobanteUrl: l.comprobante_url ?? null,
      fechaPago: l.fecha_pago,
    };
  });

  const totalPagado = items.reduce((s, it) => s + Number(it.totalPagado || 0), 0);
  const cantidadLiquidaciones = items.length;
  const cantidadPedidos = items.reduce((s, it) => s + Number(it.cantidadPedidos || 0), 0);

  return NextResponse.json({
    date: parsed.date,
    totalPagado,
    cantidadLiquidaciones,
    cantidadPedidos,
    items,
  });
}
