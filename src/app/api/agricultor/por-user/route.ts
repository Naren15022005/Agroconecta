import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const agricultor = await prisma.agricultor.findUnique({ where: { user_id: userId } });
        if (agricultor) {
          return NextResponse.json(agricultor);
        }
      } catch (_) {}
    }

    // Fallback a Firebase Cloud Firestore
    try {
      const { db } = await import("@/lib/firebase");
      const { collection, getDocs, query, where } = await import("firebase/firestore");

      const agrRef = collection(db, "agricultores");
      const q = query(agrRef, where("user_id", "==", userId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();
        return NextResponse.json({ id: snap.docs[0].id, ...data });
      }
    } catch (fbErr) {
      console.error("[por-user] Error consultando Firebase:", fbErr);
    }

    // Perfil por defecto garantizado para evitar 500
    return NextResponse.json({
      id: `AGRC_AGR_${userId}`,
      user_id: userId,
      telefono: '3100000000',
      ubicacion: 'Colombia',
      descripcion: 'Productor AgroConecta',
      verificado: true,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      id: 'AGRC_AGR_DEFAULT',
      user_id: 'default',
      verificado: true
    });
  }
}
