import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'El parámetro categoriaId es requerido' },
        { status: 400 }
      );
    }

    // Obtener subcategorías de la categoría especificada
    const subcategorias = await prisma.subcategory.findMany({
      where: { 
        categoryId: categoriaId,
        isActive: true 
      },
      select: { 
        id: true, 
        name: true 
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(subcategorias, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
