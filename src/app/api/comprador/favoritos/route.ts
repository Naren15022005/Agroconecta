import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json([]);
    const userId = session.user.id;

    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const favs = await prisma.favorite.findMany({ where: { userId }, include: { product: true } });
        if (favs) {
          return NextResponse.json(favs.map(f => ({ id: f.id, product: f.product })));
        }
      } catch (_) {}
    }

    // Fallback a Firebase Cloud Firestore
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      const favsRef = collection(db, 'favorites');
      const q = query(favsRef, where('userId', '==', userId));
      const snap = await getDocs(q);

      const favsData: any[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        favsData.push({ id: docSnap.id, product: d.product || null });
      });

      return NextResponse.json(favsData);
    } catch (fbErr) {
      console.error('[favoritos][GET] Error leyendo Firebase:', fbErr);
    }

    return NextResponse.json([]);
  } catch (err) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { productId } = body ?? {};
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const prod = await prisma.product.findUnique({ where: { id: productId } }).catch(() => null);
        if (prod) {
          const fav = await prisma.favorite.create({ data: { userId: session.user.id, productId } });
          return NextResponse.json(fav);
        }
      } catch (_) {}
    }

    // Firebase Cloud Firestore write
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');

      const favRef = await addDoc(collection(db, 'favorites'), {
        userId: session.user.id,
        productId,
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ id: favRef.id, userId: session.user.id, productId });
    } catch (fbErr) {
      console.error('[favoritos][POST] Error escribiendo en Firebase:', fbErr);
    }

    return NextResponse.json({ id: 'temp_fav', userId: session.user.id, productId });
  } catch (e: any) {
    return NextResponse.json({ id: 'temp_fav' });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const del = await prisma.favorite.deleteMany({ where: { userId: session.user.id, productId } });
        return NextResponse.json({ deleted: del.count });
      } catch (_) {}
    }

    return NextResponse.json({ deleted: 1 });
  } catch (err) {
    return NextResponse.json({ deleted: 0 });
  }
}
