import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/pagos-validaciones
export async function PATCH(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session) {
		console.error('[pagos-validaciones] PATCH - no session');
		return NextResponse.json({ error: 'No autorizado (sin sesión)' }, { status: 401 });
	}
	// Verificar que el usuario sea admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: { role: true }
	});
	if (!user) {
		console.error('[pagos-validaciones] PATCH - session user not found in DB', { sessionUserId: session.user.id });
		return NextResponse.json({ error: 'Acceso denegado. Usuario no encontrado.' }, { status: 403 });
	}
	if (user.role?.name !== 'ADMINISTRADOR') {
		console.error('[pagos-validaciones] PATCH - user not admin', { userId: user.id, role: user.role?.name });
		return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 });
	}

	const { pedidoId, pagoVerificado } = await req.json();
	console.log('[pagos-validaciones] PATCH incoming', { pedidoId, pagoVerificado, adminId: user.id });
	if (!pedidoId || typeof pagoVerificado !== 'boolean') {
		console.error('[pagos-validaciones] PATCH - bad payload', { body: { pedidoId, pagoVerificado } });
		return NextResponse.json({ error: 'Datos requeridos: pedidoId y pagoVerificado (boolean)' }, { status: 400 });
	}

	// Actualizar el campo pagoVerificado del pedido
	try {
		const pedido = await prisma.order.update({
			where: { id: pedidoId },
			data: { pagoVerificado },
		});

		// Mantener consistencia con payment_transactions
		try {
			await prisma.paymentTransaction.updateMany({
				where: { pedidoId },
				data: { estado: pagoVerificado ? 'VERIFICADO' : 'PENDIENTE' },
			});
		} catch (e) {
			console.warn('[pagos-validaciones] PATCH - unable to update paymentTransactions estado', e);
		}

		return NextResponse.json({ ok: true, pedido });
	} catch (err) {
		console.error('[pagos-validaciones] PATCH - update error', err);
		return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
	}
}

// GET /api/admin/pagos-validaciones?estado=VERIFICADO|PENDIENTE
export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}
	// Verificar que el usuario sea admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: { role: true }
	});
	if (!user || user.role.name !== 'ADMINISTRADOR') {
		return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 });
	}

	const { searchParams } = new URL(req.url);
	const estado = searchParams.get('estado');
	const userId = searchParams.get('userId');
	let pagoVerificado: boolean | undefined = undefined;
	if (estado === 'VERIFICADO') pagoVerificado = true;
	if (estado === 'PENDIENTE') pagoVerificado = false;

	const where: any = {};
	if (typeof pagoVerificado === 'boolean') {
		where.pagoVerificado = pagoVerificado;
	}

	// Puedes agregar más filtros si lo necesitas
	// Always exclude cancelled orders
	const whereWithStatus = { ...where, status: { not: 'CANCELADO' } };
	const pedidos = await prisma.order.findMany({
		where: whereWithStatus,
		include: {
			buyer: true,
			items: { include: { product: true } },
			paymentTransactions: true
		},
		orderBy: { createdAt: 'desc' }
	});

	// If a userId is provided, try to map it to the agricultor record
	// If agricId is provided use it directly
	const agricIdParam = searchParams.get('agricId');
	if (agricIdParam) {
		try {
			// Resolve agricultor record to support alternate id variants
			const agricultorRecord = await prisma.agricultor.findUnique({ where: { id: agricIdParam } });
			const altAgricId = agricultorRecord?.user_id;
			const agricultorIdCandidates = [agricIdParam, altAgricId].filter(Boolean);
			console.log('[pagos-validaciones] agricId candidates:', agricultorIdCandidates);

			const whereClause: any = {
				items: {
					some: {
						product: { agricultorId: { in: agricultorIdCandidates } }
					}
				},
				status: { not: 'CANCELADO' }
			};
			if (typeof pagoVerificado === 'boolean') whereClause.pagoVerificado = pagoVerificado;
			const pedidosPorAgricultor = await prisma.order.findMany({
				where: whereClause,
				include: {
					buyer: true,
					items: { include: { product: true } },
					paymentTransactions: true
				},
				orderBy: { createdAt: 'desc' }
			});
			console.log(`[pagos-validaciones] agricId=${agricIdParam} -> ordersCount=${pedidosPorAgricultor.length}`);
			if (pedidosPorAgricultor.length > 0) {
				console.log('[pagos-validaciones] sample order ids:', pedidosPorAgricultor.slice(0,5).map(o => o.id));
				return NextResponse.json({ ok: true, pedidos: pedidosPorAgricultor });
			}
			// Fallback: if no orders matched directly, assemble orders from orderItems for this agricultor
			console.log('[pagos-validaciones] no direct orders found, fallback to orderItems for agricId=', agricIdParam);
			const itemsWhere: any = { product: { agricultorId: { in: agricultorIdCandidates } } };
			if (typeof pagoVerificado === 'boolean') itemsWhere.order = { pagoVerificado };
			const items = await prisma.orderItem.findMany({
				where: itemsWhere,
				include: { order: true, product: true }
			});
			const groupedByOrder: Record<string, any> = {};
			for (const it of items) {
				const oid = it.orderId;
				if (!groupedByOrder[oid]) groupedByOrder[oid] = { id: oid, total: it.order?.total ?? 0, buyer: it.order?.buyerId ? { id: it.order.buyerId } : undefined, items: [] };
				groupedByOrder[oid].items.push({ id: it.id, quantity: it.quantity, subtotal: it.subtotal, product: it.product });
			}
			const fallbackPedidos = Object.values(groupedByOrder);
			console.log('[pagos-validaciones] fallbackPedidos count=', fallbackPedidos.length);
			return NextResponse.json({ ok: true, pedidos: fallbackPedidos });
		} catch (err) {
			console.error('Error querying orders for agricultor by agricId:', err);
			return NextResponse.json({ ok: true, pedidos: [] });
		}
	}

	// If a userId is provided, query orders that include products for that agricultor
	if (userId) {
		try {
			const agricultor = await prisma.agricultor.findUnique({ where: { user_id: userId } });
			console.log(`[pagos-validaciones] lookup agricultor for userId=${userId} -> agricultor=${agricultor?.id}`);
			if (!agricultor) {
				return NextResponse.json({ ok: true, pedidos: [] });
			}
			const agricId = agricultor.id;
			const agricultorIdCandidates2 = [agricultor.id, agricultor.user_id].filter(Boolean);
			console.log('[pagos-validaciones] userId branch agricId candidates:', agricultorIdCandidates2);
			// Query orders that include items whose product.agricultorId matches any candidate
			const whereClause2: any = {
				items: {
					some: {
						product: { agricultorId: { in: agricultorIdCandidates2 } }
					}
				},
				status: { not: 'CANCELADO' }
			};
			if (typeof pagoVerificado === 'boolean') whereClause2.pagoVerificado = pagoVerificado;
			const pedidosPorAgricultor = await prisma.order.findMany({
				where: whereClause2,
				include: {
					buyer: true,
					items: { include: { product: true } },
					paymentTransactions: true
				},
				orderBy: { createdAt: 'desc' }
			});
			console.log(`[pagos-validaciones] userId=${userId} -> agricId=${agricId} -> ordersCount=${pedidosPorAgricultor.length}`);
			if (pedidosPorAgricultor.length > 0) {
				console.log('[pagos-validaciones] sample order ids for userId:', pedidosPorAgricultor.slice(0,5).map(o => o.id));
				return NextResponse.json({ ok: true, pedidos: pedidosPorAgricultor });
			}
			// Fallback: assemble from orderItems matching any candidate
			console.log('[pagos-validaciones] no direct orders found for userId fallback, assembling from orderItems for agricId=', agricId);
			const itemsWhere2: any = { product: { agricultorId: { in: agricultorIdCandidates2 } } };
			if (typeof pagoVerificado === 'boolean') itemsWhere2.order = { pagoVerificado };
			const itemsForUser = await prisma.orderItem.findMany({ where: itemsWhere2, include: { order: true, product: true } });
			const grouped: Record<string, any> = {};
			for (const it of itemsForUser) {
				const oid = it.orderId;
				if (!grouped[oid]) grouped[oid] = { id: oid, total: it.order?.total ?? 0, buyer: it.order?.buyerId ? { id: it.order.buyerId } : undefined, items: [] };
				grouped[oid].items.push({ id: it.id, quantity: it.quantity, subtotal: it.subtotal, product: it.product });
			}
			const fallback = Object.values(grouped);
			console.log('[pagos-validaciones] fallbackPedidos count for userId=', fallback.length);
			return NextResponse.json({ ok: true, pedidos: fallback });
		} catch (err) {
			console.error('Error querying orders for agricultor:', err);
			return NextResponse.json({ ok: true, pedidos: [] });
		}
	}

	return NextResponse.json({ ok: true, pedidos });
}
