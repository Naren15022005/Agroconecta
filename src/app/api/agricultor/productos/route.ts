import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agricultorId = searchParams.get('agricultorId');
    if (!agricultorId) {
      return NextResponse.json({ error: "agricultorId requerido" }, { status: 400 });
    }
    // Obtener productos del agricultor
    const productos = await prisma.product.findMany({
      where: {
        agricultorId: agricultorId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    // Siempre retornar array, aunque esté vacío
    return NextResponse.json(Array.isArray(productos) ? productos : []);
  } catch (error) {
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
