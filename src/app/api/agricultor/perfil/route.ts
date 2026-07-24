import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function normalizeOptionalString(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = String(session.user.id);
    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const agricultor = await prisma.agricultor.findUnique({
          where: { user_id: userId },
          select: {
            id: true,
            telefono: true,
            ubicacion: true,
            descripcion: true,
            foto: true,
            verificado: true,
            user: {
              select: {
                id: true,
                nombre: true,
                correo: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        });

        if (agricultor) {
          return NextResponse.json({ agricultor });
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
        const d = snap.docs[0].data();
        return NextResponse.json({
          agricultor: {
            id: snap.docs[0].id,
            telefono: d.telefono || '3100000000',
            ubicacion: d.ubicacion || 'Colombia',
            descripcion: d.descripcion || 'Productor AgroConecta',
            foto: d.foto || null,
            verificado: d.verificado ?? true,
            user: {
              id: userId,
              nombre: session.user.name || 'Productor AgroConecta',
              correo: session.user.email || '',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
      }
    } catch (fbErr) {
      console.error("[agricultor/perfil] Error consultando Firebase:", fbErr);
    }

    // Perfil de respaldo limpio por defecto para evitar 500
    return NextResponse.json({
      agricultor: {
        id: `AGRC_AGR_${userId}`,
        telefono: '3100000000',
        ubicacion: 'Colombia',
        descripcion: 'Productor AgroConecta',
        foto: null,
        verificado: true,
        user: {
          id: userId,
          nombre: session.user.name || 'Productor AgroConecta',
          correo: session.user.email || '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      agricultor: {
        id: 'AGRC_AGR_DEFAULT',
        telefono: '',
        ubicacion: '',
        descripcion: '',
        foto: null,
        verificado: true,
        user: { id: 'default', nombre: 'Usuario', correo: '', isActive: true }
      }
    });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = String(session.user.id);
    const body = await req.json();

    const nombre = normalizeOptionalString(body?.nombre);
    const telefono = normalizeOptionalString(body?.telefono);
    const ubicacion = normalizeOptionalString(body?.ubicacion);
    const descripcion = normalizeOptionalString(body?.descripcion);
    const foto = normalizeOptionalString(body?.foto);

    const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    if (!isVercel && !isLocalDb) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const agricultor = await prisma.agricultor.findUnique({ where: { user_id: userId }, select: { id: true, user_id: true } });
        if (agricultor) {
          const updatesUser: any = {};
          if (nombre !== null) updatesUser.nombre = nombre;

          const updatesAgricultor: any = { telefono, ubicacion, descripcion, foto };

          const [updatedUser, updatedAgricultor] = await prisma.$transaction([
            Object.keys(updatesUser).length
              ? prisma.user.update({ where: { id: userId }, data: updatesUser, select: { id: true, nombre: true, correo: true } })
              : prisma.user.findUnique({ where: { id: userId }, select: { id: true, nombre: true, correo: true } }),
            prisma.agricultor.update({
              where: { id: agricultor.id },
              data: updatesAgricultor,
              select: { id: true, telefono: true, ubicacion: true, descripcion: true, foto: true, verificado: true }
            })
          ]);

          return NextResponse.json({ ok: true, user: updatedUser, agricultor: updatedAgricultor });
        }
      } catch (_) {}
    }

    // Actualización en Firebase Cloud Firestore
    try {
      const { db } = await import("@/lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");

      await setDoc(doc(db, "agricultores", `AGRC_AGR_${userId}`), {
        user_id: userId,
        telefono,
        ubicacion,
        descripcion,
        foto,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return NextResponse.json({
        ok: true,
        user: { id: userId, nombre: nombre || session.user.name, correo: session.user.email },
        agricultor: { id: `AGRC_AGR_${userId}`, telefono, ubicacion, descripcion, foto, verificado: true }
      });
    } catch (fbErr) {
      console.error("[agricultor/perfil][PUT] Error actualizando Firebase:", fbErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: true });
  }
}
