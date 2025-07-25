import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "Usuario requerido" }, { status: 400 });
    }

    // Buscar el agricultor asociado al usuario
    const agricultor = await prisma.agricultor.findUnique({
      where: { user_id: userId }
    });

    if (!agricultor) {
      return NextResponse.json({ error: "Agricultor no encontrado" }, { status: 404 });
    }

    // Obtener productos del agricultor
    const productos = await prisma.product.findMany({
      where: {
        agricultorId: agricultor.id
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

    return NextResponse.json(productos);
  } catch (error) {
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
