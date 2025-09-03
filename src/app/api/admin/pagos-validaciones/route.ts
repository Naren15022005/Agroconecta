import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/pagos-validaciones
export async function PATCH(req: NextRequest) {
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

	const { pedidoId, pagoVerificado } = await req.json();
	if (!pedidoId || typeof pagoVerificado !== 'boolean') {
		return NextResponse.json({ error: 'Datos requeridos: pedidoId y pagoVerificado (boolean)' }, { status: 400 });
	}

	// Actualizar el campo pagoVerificado del pedido
	const pedido = await prisma.order.update({
		where: { id: pedidoId },
		data: { pagoVerificado },
	});

	return NextResponse.json({ ok: true, pedido });
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
	let pagoVerificado: boolean | undefined = undefined;
	if (estado === 'VERIFICADO') pagoVerificado = true;
	if (estado === 'PENDIENTE') pagoVerificado = false;

	const where: any = {};
	if (typeof pagoVerificado === 'boolean') {
		where.pagoVerificado = pagoVerificado;
	}

	// Puedes agregar más filtros si lo necesitas
	const pedidos = await prisma.order.findMany({
		where,
		include: {
			buyer: true,
			items: { include: { product: true } },
			paymentTransactions: true
		},
		orderBy: { createdAt: 'desc' }
	});

	return NextResponse.json({ ok: true, pedidos });
}
