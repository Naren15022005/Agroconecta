import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: list pending payment_orders for an agricultor
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
  if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const agricultorId = searchParams.get('agricultorId');
  if (!agricultorId) return NextResponse.json({ ok: true, pedidos: [] });

  // Build candidate IDs: the provided id might be either the Agricultor.id or the Agricultor.user_id
  const candidatoSet = new Set<string>();
  candidatoSet.add(agricultorId);
  try {
    const agricRecById = await prisma.agricultor.findUnique({ where: { id: agricultorId } });
    if (agricRecById?.user_id) candidatoSet.add(agricRecById.user_id);
    const agricRecByUser = await prisma.agricultor.findUnique({ where: { user_id: agricultorId } });
    if (agricRecByUser?.id) candidatoSet.add(agricRecByUser.id);
  } catch (e) {
    // ignore lookup errors, we'll still try with the provided id
  }
  const agricultorCandidates = Array.from(candidatoSet);

  // If `prisma.paymentOrder` is not available (Prisma client not regenerated),
  // provide a safe fallback that maps existing orders/orderItems to the
  // `PaymentOrder` shape so the UI can work until the Prisma client is rebuilt.
  const clientAny = prisma as any;
  if (typeof clientAny.paymentOrder === 'undefined') {
    // fallback: find orders that include items for this agricultor
    // Include CONFIRMADO and ENTREGADO orders that have pagoVerificado=true
    const orders = await prisma.order.findMany({
      where: {
        items: { some: { product: { agricultorId: { in: agricultorCandidates } } } },
        status: { in: ['CONFIRMADO', 'ENTREGADO'] },
        pagoVerificado: true
      },
      include: { items: { include: { product: true } }, buyer: true, paymentTransactions: true },
      orderBy: { createdAt: 'desc' }
    });

    const pedidosFallback = orders.map(o => {
      const itemsForAgric = (o.items || []).filter((it: any) => agricultorCandidates.includes(String(it.product?.agricultorId)));
      const monto_bruto = Number(o.total ?? 0);
      const monto_neto = itemsForAgric.reduce((s: number, it: any) => s + Number(it.subtotal ?? 0), 0);
      const producto_resumen = itemsForAgric.map((it: any) => it.product?.name).filter(Boolean).join(', ');
      // Commission is 10% of the agricultor's sales for these items
      const comision = Number((monto_neto * 0.10).toFixed(2));
      const agricultorAmount = Number((monto_neto * 0.90).toFixed(2));
      return {
        id: o.id,
        pedido_id: o.id,
        agricultor_id: agricultorId,
        cliente_nombre: o.buyer?.nombre ?? o.buyerId,
        producto_resumen,
        monto_bruto,
        comision_plataforma: comision,
        monto_neto,
        _agricultorAmount: agricultorAmount,
        metodo_pago_cliente: o.paymentMethod,
        estado: 'PENDIENTE',
        liquidacion_id: null,
        pagado_en: null,
        created_at: o.createdAt,
        updated_at: o.updatedAt,
        rawOrder: o
      };
    });

    return NextResponse.json({ ok: true, pedidos: pedidosFallback });
  }

  try {
    const pedidos = await prisma.paymentOrder.findMany({
      where: { agricultor_id: agricultorId, estado: 'PENDIENTE' },
      orderBy: { created_at: 'desc' }
    });
    // If the table exists but has no rows for this agricultor, return a fallback
    // mapping from orders/order_items so the UI can display matching pedidos
    if (!pedidos || pedidos.length === 0) {
      console.warn('payment_orders table present but no rows found for agricultor; using fallback mapping');
      const orders = await prisma.order.findMany({
        where: {
          items: { some: { product: { agricultorId: { in: agricultorCandidates } } } },
          status: { in: ['CONFIRMADO', 'ENTREGADO'] },
          pagoVerificado: true
        },
        include: { items: { include: { product: true } }, buyer: true, paymentTransactions: true },
        orderBy: { createdAt: 'desc' }
      });

      const pedidosFallback = orders.map(o => {
        const itemsForAgric = (o.items || []).filter((it: any) => agricultorCandidates.includes(String(it.product?.agricultorId)));
        const monto_bruto = Number(o.total ?? 0);
        const monto_neto = itemsForAgric.reduce((s: number, it: any) => s + Number(it.subtotal ?? 0), 0);
        const producto_resumen = itemsForAgric.map((it: any) => it.product?.name).filter(Boolean).join(', ');
        // Commission is 10% of the agricultor's sales for these items
        const comision = Number((monto_neto * 0.10).toFixed(2));
        const agricultorAmount = Number((monto_neto * 0.90).toFixed(2));
        return {
          id: o.id,
          pedido_id: o.id,
          agricultor_id: agricultorId,
          cliente_nombre: o.buyer?.nombre ?? o.buyerId,
          producto_resumen,
          monto_bruto,
          comision_plataforma: comision,
          monto_neto,
          _agricultorAmount: agricultorAmount,
          metodo_pago_cliente: o.paymentMethod,
          estado: 'PENDIENTE',
          liquidacion_id: null,
          pagado_en: null,
          created_at: o.createdAt,
          updated_at: o.updatedAt,
          rawOrder: o,
          _fallback: true,
        };
      });

      return NextResponse.json({ ok: true, pedidos: pedidosFallback });
    }
    return NextResponse.json({ ok: true, pedidos });
  } catch (err: any) {
    // If the DB table doesn't exist yet (P2021), fallback to mapping orders/orderItems
    if (err?.code === 'P2021') {
      console.warn('payment_orders table missing; using fallback mapping from orders/order_items');
        const orders = await prisma.order.findMany({
          where: {
            items: { some: { product: { agricultorId: { in: agricultorCandidates } } } },
            status: { in: ['CONFIRMADO', 'ENTREGADO'] },
            pagoVerificado: true
          },
          include: { items: { include: { product: true } }, buyer: true, paymentTransactions: true },
          orderBy: { createdAt: 'desc' }
        });

      const pedidosFallback = orders.map(o => {
        const itemsForAgric = (o.items || []).filter((it: any) => agricultorCandidates.includes(String(it.product?.agricultorId)));
        const monto_bruto = Number(o.total ?? 0);
        const monto_neto = itemsForAgric.reduce((s: number, it: any) => s + Number(it.subtotal ?? 0), 0);
        const producto_resumen = itemsForAgric.map((it: any) => it.product?.name).filter(Boolean).join(', ');
        // Commission is 10% of the agricultor's sales for these items
        const comision = Number((monto_neto * 0.10).toFixed(2));
        const agricultorAmount = Number((monto_neto * 0.90).toFixed(2));
        return {
          id: o.id,
          pedido_id: o.id,
          agricultor_id: agricultorId,
          cliente_nombre: o.buyer?.nombre ?? o.buyerId,
          producto_resumen,
          monto_bruto,
          comision_plataforma: comision,
          monto_neto,
          _agricultorAmount: agricultorAmount,
          metodo_pago_cliente: o.paymentMethod,
          estado: 'PENDIENTE',
          liquidacion_id: null,
          pagado_en: null,
          created_at: o.createdAt,
          updated_at: o.updatedAt,
          rawOrder: o
        };
      });

      return NextResponse.json({ ok: true, pedidos: pedidosFallback });
    }
    console.error('Error querying paymentOrder.findMany:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

// POST: perform actions (detail, pay-individual, refund, block, pay-all)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
  if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  const body = await req.json();
  const action = body.action;

  // Ensure Prisma models exist (user may need to run `prisma db push` / migrations)
  const clientAny = prisma as any;
  if (typeof clientAny.paymentOrder === 'undefined' || typeof clientAny.liquidacion === 'undefined') {
    return NextResponse.json({ error: 'Esquema DB incompleto: ejecuta `npx prisma db push` o aplica migraciones antes de usar acciones POST en payment-orders.' }, { status: 500 });
  }

  try {
    if (action === 'detail') {
      const orderId = body.orderId;
      const po = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
      return NextResponse.json({ ok: true, pedido: po });
    }

    if (action === 'pay-individual') {
      const orderId = body.orderId;
      // use transaction
      const result = await prisma.$transaction(async (tx) => {
        const po = await tx.paymentOrder.findUnique({ where: { id: orderId } });
        if (!po) throw new Error('PaymentOrder no existe');
        if (po.estado !== 'PENDIENTE') throw new Error('Solo se pueden pagar pedidos en estado PENDIENTE');
        if (po.estado === 'BLOQUEADO') throw new Error('No se puede pagar un pedido bloqueado');

        const liquidacionId = body.liquidacionId ?? `${Date.now()}-${orderId}`;
        const created = await tx.liquidacion.create({
          data: {
            id: liquidacionId,
            agricultor_id: po.agricultor_id,
            total_pagado: po.monto_neto,
            cantidad_pedidos: 1,
            tipo_pago: 'INDIVIDUAL',
            fecha_pago: new Date(),
          }
        });

        const history = (po.history as any[]) || [];
        history.push({ at: new Date(), by: session.user.id, action: 'PAGADO_INDIVIDUAL', liquidacionId });

        const updated = await tx.paymentOrder.update({
          where: { id: orderId },
          data: { estado: 'PAGADO_INDIVIDUAL', pagado_en: new Date(), liquidacion_id: liquidacionId, history }
        });

        return { liquidacion: created, pedido: updated };
      });
      return NextResponse.json({ ok: true, result });
    }

    if (action === 'refund') {
      const orderId = body.orderId;
      const motivo = body.motivo || null;
      const result = await prisma.$transaction(async (tx) => {
        const po = await tx.paymentOrder.findUnique({ where: { id: orderId } });
        if (!po) throw new Error('PaymentOrder no existe');
        if (po.estado !== 'PENDIENTE') throw new Error('Solo se pueden reembolsar pedidos en estado PENDIENTE');

        const history = (po.history as any[]) || [];
        history.push({ at: new Date(), by: session.user.id, action: 'REEMBOLSADO', motivo });

        const updated = await tx.paymentOrder.update({ where: { id: orderId }, data: { estado: 'REEMBOLSADO', history } });
        return updated;
      });
      return NextResponse.json({ ok: true, pedido: result });
    }

    if (action === 'block') {
      const orderId = body.orderId;
      const motivo = body.motivo || null;
      const result = await prisma.$transaction(async (tx) => {
        const po = await tx.paymentOrder.findUnique({ where: { id: orderId } });
        if (!po) throw new Error('PaymentOrder no existe');
        if (po.estado !== 'PENDIENTE') throw new Error('Solo se pueden bloquear pedidos en estado PENDIENTE');

        const history = (po.history as any[]) || [];
        history.push({ at: new Date(), by: session.user.id, action: 'BLOQUEADO', motivo });

        const updated = await tx.paymentOrder.update({ where: { id: orderId }, data: { estado: 'BLOQUEADO', history } });
        return updated;
      });
      return NextResponse.json({ ok: true, pedido: result });
    }

    if (action === 'pay-all') {
      const agricultorId = body.agricultorId;
      if (!agricultorId) return NextResponse.json({ error: 'agricultorId requerido' }, { status: 400 });

      console.log('[payment-orders][pay-all] started for agricultorId=', agricultorId, 'by user=', session.user.id);

      // fetch pending orders
      const pending = await prisma.paymentOrder.findMany({ where: { agricultor_id: agricultorId, estado: 'PENDIENTE' } });
      let result;
      if (!pending || pending.length === 0) {
        console.log('[payment-orders][pay-all] no paymentOrder rows found, building from orders/order_items');
        // No paymentOrder rows pending — build from orders/order_items and create/update paymentOrder rows
        // Build agricultor candidate ids (agricultor.id and agricultor.user_id)
        const candidatoSet = new Set<string>();
        candidatoSet.add(agricultorId);
        try {
          const agricRecById = await prisma.agricultor.findUnique({ where: { id: agricultorId } });
          if (agricRecById?.user_id) candidatoSet.add(agricRecById.user_id);
          const agricRecByUser = await prisma.agricultor.findUnique({ where: { user_id: agricultorId } });
          if (agricRecByUser?.id) candidatoSet.add(agricRecByUser.id);
        } catch (e) {
          // ignore
        }
        const agricultorCandidates = Array.from(candidatoSet);

        const orders = await prisma.order.findMany({
          where: {
            items: { some: { product: { agricultorId: { in: agricultorCandidates } } } },
            status: { not: 'CANCELADO' }
          },
          include: { items: { include: { product: true } }, buyer: true },
          orderBy: { createdAt: 'desc' }
        });

        console.log('[payment-orders][pay-all] matched orders count=', orders.length);

        if (!orders || orders.length === 0) return NextResponse.json({ error: 'No hay pedidos pendientes' }, { status: 400 });

        const liquidacionId = `LQ-${Date.now()}-${agricultorId}`;

        result = await prisma.$transaction(async (tx) => {
          // compute totals using item subtotals for this agricultor
          let totalToPay = 0;
          const poOps: Promise<any>[] = [];

          const l = await tx.liquidacion.create({ data: {
            id: liquidacionId,
            agricultor_id: agricultorId,
            total_pagado: 0,
            cantidad_pedidos: 0,
            tipo_pago: 'MASIVO',
            fecha_pago: new Date(),
          }});

          const now = new Date();

          for (const o of orders) {
            const itemsForAgric = (o.items || []).filter((it: any) => agricultorCandidates.includes(String(it.product?.agricultorId)));
            const monto_neto = itemsForAgric.reduce((s: number, it: any) => s + Number(it.subtotal ?? 0), 0);
            const comision = Number((monto_neto * 0.05).toFixed(2));
            const agricultorAmount = Number((monto_neto * 0.95).toFixed(2));
            totalToPay += agricultorAmount;

            // check existing paymentOrder
            const existing = await tx.paymentOrder.findUnique({ where: { id: o.id } }).catch(() => null);
            if (existing) {
              poOps.push(tx.paymentOrder.update({ where: { id: o.id }, data: { estado: 'PAGADO_MASIVO', pagado_en: now, liquidacion_id: liquidacionId, history: ((existing.history as any[]) || []).concat([{ at: now, by: session.user.id, action: 'PAGADO_MASIVO', liquidacionId }]) } }));
            } else {
              poOps.push(tx.paymentOrder.create({ data: {
                id: o.id,
                pedido_id: o.id,
                agricultor_id: agricultorId,
                cliente_nombre: o.buyer?.nombre ?? o.buyerId,
                producto_resumen: itemsForAgric.map((it:any)=>it.product?.name).filter(Boolean).join(', '),
                monto_bruto: Number(o.total ?? 0),
                comision_plataforma: comision,
                monto_neto: monto_neto,
                metodo_pago_cliente: o.paymentMethod,
                estado: 'PAGADO_MASIVO',
                liquidacion_id: liquidacionId,
                pagado_en: now,
                history: [{ at: now, by: session.user.id, action: 'PAGADO_MASIVO', liquidacionId }],
              }}));
            }
          }

          await Promise.all(poOps);

          // update liquidation totals (transactional)
          const updatedL = await tx.liquidacion.update({ where: { id: l.id }, data: { total_pagado: Number(totalToPay.toFixed(2)), cantidad_pedidos: orders.length } });

          console.log('[payment-orders][pay-all] transaction complete: orders=', orders.length, 'totalToPay=', Number(totalToPay.toFixed(2)));

          return { liquidacion: updatedL, count: orders.length, total: Number(totalToPay.toFixed(2)) };
        });

        return NextResponse.json({ ok: true, result });
      } else {
        const total = pending.reduce((s, p) => s + Number(p.monto_neto as any), 0);
        const liquidacionId = `LQ-${Date.now()}-${agricultorId}`;

        result = await prisma.$transaction(async (tx) => {
          const l = await tx.liquidacion.create({ data: {
            id: liquidacionId,
            agricultor_id: agricultorId,
            total_pagado: total,
            cantidad_pedidos: pending.length,
            tipo_pago: 'MASIVO',
            fecha_pago: new Date(),
          }});

          const now = new Date();
          const updates = pending.map(po => tx.paymentOrder.update({ where: { id: po.id }, data: { estado: 'PAGADO_MASIVO', pagado_en: now, liquidacion_id: liquidacionId, history: ((po.history as any[]) || []).concat([{ at: now, by: session.user.id, action: 'PAGADO_MASIVO', liquidacionId }]) } }));
          await Promise.all(updates);

          return { liquidacion: l, count: pending.length, total };
        });

        return NextResponse.json({ ok: true, result });
      }
    }

    return NextResponse.json({ error: 'Accion desconocida' }, { status: 400 });
  } catch (err: any) {
    console.error('payment-orders error:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
