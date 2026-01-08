import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildLiquidacionEmail, sendEmail } from '@/lib/email';

// Endpoint para liquidar a un agricultor: debit admin wallet, credit agricultor, create Liquidacion + Pago
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // Only admins
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
  if (!user || user.role.name !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

  try {
    const body = await req.json();
    const { userId, monto, metodoPago, referencia, comprobanteUrl } = body;
    if (!userId || monto == null) return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });

    // NOTE: The system should allow the admin to register/execute payments to agricultores
    // even if the admin wallet does not have funds. The admin wallet in this system is
    // an accounting record and should not block payments. Therefore we do NOT check
    // or debit any admin wallet here. We only credit the agricultor and record the pago/liquidacion.


    // Resolve identifiers: callers may send either a `user.id` (user) or an `agricultor.id` (agricultor).
    // We need both: `resolvedUserId` for wallet/pago and `resolvedAgricId` for payment orders/liquidacion.
    let resolvedUserId: string | null = null;
    let resolvedAgricId: string | null = null;

    // Try treating incoming id as a User id first
    const maybeUser = await prisma.user.findUnique({ where: { id: userId } });
    if (maybeUser) {
      resolvedUserId = maybeUser.id;
      const agric = await prisma.agricultor.findFirst({ where: { user_id: resolvedUserId } });
      if (agric) resolvedAgricId = agric.id;
    } else {
      // Try treating incoming id as an Agricultor id
      const agric = await prisma.agricultor.findUnique({ where: { id: userId } });
      if (agric) {
        resolvedAgricId = agric.id;
        resolvedUserId = agric.user_id;
      }
    }

    if (!resolvedUserId || !resolvedAgricId) return NextResponse.json({ error: 'Agricultor no encontrado' }, { status: 404 });

    // Get recipient info for email (fail-soft if missing)
    const agricultorUser = await prisma.user.findUnique({
      where: { id: resolvedUserId },
      select: { correo: true, nombre: true },
    });

    const liquidacionId = `LQ_${Date.now()}`;

    const result = await prisma.$transaction(async (tx) => {
      // Credit agricultor wallet (create if missing)
      let agricultorWallet = await tx.wallet.findFirst({ where: { userId: resolvedUserId } });
      if (!agricultorWallet) {
        agricultorWallet = await tx.wallet.create({ data: { userId: resolvedUserId, balance: 0 } });
      }
      await tx.wallet.update({ where: { id: agricultorWallet.id }, data: { balance: { increment: montoNum } } });
      // Create wallet transaction for agricultor (income)
      await tx.walletTransaction.create({ data: { walletId: agricultorWallet.id, type: 'income', amount: montoNum, description: `Liquidación ${liquidacionId}` } });

      // Note: we intentionally do NOT create or debit an admin wallet transaction here.


      // Create Pago record for agricultor (include referencia/comprobante if provided)
      const pago = await tx.pago.create({ data: { userId: resolvedUserId, monto: montoNum, metodoPago: metodoPago ?? 'LIQUIDACION', referencia: referencia ?? null, comprobanteUrl: comprobanteUrl ?? null, estado: 'LIQUIDADO', fecha: new Date() } });

      // Create Liquidacion record
      // Count related payment_orders pending for this agricultor (use agricultor id)
      const pendingOrders = await tx.paymentOrder.findMany({ where: { agricultor_id: resolvedAgricId, estado: 'PENDIENTE' } });
      await tx.liquidacion.create({ data: { id: liquidacionId, agricultor_id: resolvedAgricId, total_pagado: montoNum, cantidad_pedidos: pendingOrders.length, tipo_pago: 'MASIVO', fecha_pago: new Date(), metodo_pago: metodoPago ?? null, comprobante_url: comprobanteUrl ?? null } });

      // Mark payment orders as paid (PAGADO_MASIVO)
      if (pendingOrders.length > 0) {
        await tx.paymentOrder.updateMany({ where: { agricultor_id: resolvedAgricId, estado: 'PENDIENTE' }, data: { estado: 'PAGADO_MASIVO', liquidacion_id: liquidacionId, pagado_en: new Date() } });
      }

      // Create a notification for the agricultor with payment details
      const notifId = `NOT_${Date.now()}`;
      const metodoText = metodoPago ?? 'LIQUIDACION';
      const referenciaText = referencia ?? 'N/A';
      await tx.notification.create({ data: { id: notifId, userId: resolvedUserId, pedidoId: null, message: `Se ha procesado un pago por ${montoNum} vía ${metodoText}. Referencia: ${referenciaText}`, isRead: false } });

      return { pagoId: pago.id, liquidacionId };
    });

    // Send email after successful transaction (do not fail the payout if email fails)
    if (agricultorUser?.correo) {
      const email = buildLiquidacionEmail({
        agricultorName: agricultorUser.nombre,
        monto: montoNum,
        metodoPago: metodoPago ?? null,
        referencia: referencia ?? null,
        comprobanteUrl: comprobanteUrl ?? null,
      });
      await sendEmail({ to: agricultorUser.correo, ...email });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('Error procesar pago:', err);
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 });
  }
}
