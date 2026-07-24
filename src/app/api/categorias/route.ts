import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
  const dbUrl = process.env.DATABASE_URL || '';
  const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

  if (!isVercel && !isLocalDb) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const categorias = await prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      if (categorias && categorias.length > 0) {
        return NextResponse.json(categorias);
      }
    } catch (_) {}
  }

  // Fallback a Firebase Cloud Firestore
  try {
    const { db } = await import("@/lib/firebase");
    const { collection, getDocs } = await import("firebase/firestore");
    const snap = await getDocs(collection(db, "categories"));
    const categories: any[] = [];
    snap.forEach((doc) => {
      const d = doc.data();
      if (d.isActive !== false) {
        categories.push({ id: doc.id, name: d.name || d.displayName || doc.id });
      }
    });
    if (categories.length > 0) {
      return NextResponse.json(categories);
    }
  } catch (fbErr) {
    console.error("[categorias] Error leyendo Firebase:", fbErr);
  }

  // Fallback por defecto si no hay conexión
  return NextResponse.json([
    { id: "AGRC_CAT_FRUTAS", name: "Frutas" },
    { id: "AGRC_CAT_VERDURAS", name: "Verduras" },
    { id: "AGRC_CAT_TUBERCULOS", name: "Tubérculos" },
    { id: "AGRC_CAT_CAFE", name: "Café" },
    { id: "AGRC_CAT_LACTEOS", name: "Lácteos" },
    { id: "AGRC_CAT_GRANOS", name: "Granos" },
    { id: "AGRC_CAT_HIERBAS", name: "Hierbas" }
  ]);
}
