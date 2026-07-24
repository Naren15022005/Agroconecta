import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    let email = '';
    try {
      const body = await req.json();
      email = body?.email || '';
    } catch (_) {}

    if (!email) {
      return NextResponse.json({ isActive: true });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const dbPromise = prisma.user.findUnique({
          where: { correo: cleanEmail },
          select: { isActive: true }
        });
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 800));
        const user = await Promise.race([dbPromise, timeoutPromise]);

        if (user) {
          return NextResponse.json({ isActive: user.isActive });
        }
      } catch (dbErr) {
        // ignore
      }
    }

    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('correo', '==', cleanEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        return NextResponse.json({ isActive: docData.isActive !== false });
      }
    } catch (fbErr) {
      // ignore
    }

    return NextResponse.json({ isActive: true });
  } catch (error) {
    return NextResponse.json({ isActive: true });
  }
}
