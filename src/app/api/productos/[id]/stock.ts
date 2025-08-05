import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  const prod = await prisma.product.findUnique({ where: { id: id } });
  if (!prod) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  return NextResponse.json({ stock: prod.stock, name: prod.name, id: prod.id });
}
