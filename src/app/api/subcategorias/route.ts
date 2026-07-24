import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');

    if (!categoriaId) {
      return NextResponse.json([], { status: 200 });
    }

    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const subcategorias = await prisma.subcategory.findMany({
          where: { categoryId: categoriaId, isActive: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        });
        if (subcategorias) {
          return NextResponse.json(subcategorias);
        }
      } catch (_) {}
    }

    // Fallback a Firebase Cloud Firestore
    try {
      const { db } = await import("@/lib/firebase");
      const { collection, getDocs, query, where } = await import("firebase/firestore");

      const subRef = collection(db, "subcategories");
      const q = query(subRef, where("categoryId", "==", categoriaId));
      const snap = await getDocs(q);

      const subs: any[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.isActive !== false) {
          subs.push({ id: doc.id, name: d.name || d.displayName || doc.id });
        }
      });
      return NextResponse.json(subs);
    } catch (fbErr) {
      console.error("[subcategorias] Error leyendo Firebase:", fbErr);
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}
