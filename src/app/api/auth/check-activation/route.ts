import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isVercel = Boolean(process.env.VERCEL);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    // Intento 1: Prisma MySQL (solo si no es Vercel con URL local)
    if (!isVercel || !isLocalDb) {
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
        // Fallback a Firebase
      }
    }

    // Intento 2: Firebase Cloud Firestore
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
      // Ignore
    }

    // Por defecto, las cuentas registradas en Firebase nacen activas
    return NextResponse.json({ isActive: true });
  } catch (error) {
    return NextResponse.json({ isActive: true });
  }
}
