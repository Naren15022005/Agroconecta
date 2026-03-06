import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;
    const favs = await prisma.favorite.findMany({ where: { userId }, include: { product: true } });
    return NextResponse.json(favs.map(f => ({ id: f.id, product: f.product })));
  } catch (err) {
    console.error('[favoritos][GET] error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { productId } = body ?? {};
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    // ensure product exists
    const prod = await prisma.product.findUnique({ where: { id: productId } }).catch(() => null);
    if (!prod) return NextResponse.json({ error: 'product not found' }, { status: 404 });

    const fav = await prisma.favorite.create({ data: { userId: session.user.id, productId } });
    return NextResponse.json(fav);
  } catch (e:any) {
    console.error('[favoritos][POST] error', e);
    if (e?.code === 'P2002') return NextResponse.json({ error: 'Already favorited' }, { status: 409 });
    return NextResponse.json({ error: 'Error creating favorite' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });
    const del = await prisma.favorite.deleteMany({ where: { userId: session.user.id, productId } });
    return NextResponse.json({ deleted: del.count });
  } catch (err) {
    console.error('[favoritos][DELETE] error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
