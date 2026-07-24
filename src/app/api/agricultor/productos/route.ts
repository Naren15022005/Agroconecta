import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agricultorId = searchParams.get('agricultorId');
    if (!agricultorId) {
      return NextResponse.json([]);
    }

    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const productos = await prisma.product.findMany({
          where: { agricultorId: agricultorId },
          include: { category: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        });
        if (productos) {
          return NextResponse.json(Array.isArray(productos) ? productos : []);
        }
      } catch (_) {}
    }

    // Fallback a Firebase Cloud Firestore
    try {
      const { db } = await import("@/lib/firebase");
      const { collection, getDocs, query, where } = await import("firebase/firestore");

      const prodsRef = collection(db, "products");
      const q = query(prodsRef, where("agricultorId", "==", agricultorId));
      const snap = await getDocs(q);

      const prodsData: any[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        prodsData.push({ id: docSnap.id, ...d });
      });

      return NextResponse.json(prodsData);
    } catch (fbErr) {
      console.error("[agricultor/productos] Error consultando Firebase:", fbErr);
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}
