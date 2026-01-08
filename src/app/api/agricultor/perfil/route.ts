import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    if (!agricultor) {
      return NextResponse.json({ error: "Agricultor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ agricultor });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error?.message
      },
      { status: 500 }
    );
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

    const agricultor = await prisma.agricultor.findUnique({ where: { user_id: userId }, select: { id: true, user_id: true } });
    if (!agricultor) {
      return NextResponse.json({ error: "Agricultor no encontrado" }, { status: 404 });
    }

    const updatesUser: any = {};
    if (nombre !== null) updatesUser.nombre = nombre;

    const updatesAgricultor: any = {
      telefono,
      ubicacion,
      descripcion,
      foto
    };

    // Nota: correo/contraseña no se exponen aquí a propósito.
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

    return NextResponse.json({
      ok: true,
      user: updatedUser,
      agricultor: updatedAgricultor
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error?.message
      },
      { status: 500 }
    );
  }
}
