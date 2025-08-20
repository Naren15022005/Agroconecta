import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Buscar el rol ADMINISTRADOR
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMINISTRADOR' } });
    if (!adminRole) return NextResponse.json({ error: 'Rol ADMINISTRADOR no encontrado' }, { status: 404 });

    // Buscar todos los usuarios admin
    const admins = await prisma.user.findMany({ where: { roleId: adminRole.id } });
    if (!admins.length) return NextResponse.json({ error: 'No hay usuarios admin' }, { status: 404 });

    // Buscar todas las billeteras de admins
    const wallets = await prisma.wallet.findMany({ where: { userId: { in: admins.map(a => a.id) } } });
    if (!wallets.length) return NextResponse.json({ error: 'No hay billeteras de admin' }, { status: 404 });

    // Buscar todas las transacciones de esas billeteras
    const walletIds = wallets.map(w => w.id);
    const transactions = await prisma.walletTransaction.findMany({ where: { walletId: { in: walletIds } }, orderBy: { createdAt: 'desc' } });

    return NextResponse.json({ admins, wallets, transactions });
  } catch (error: any) {
    const message = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
