// API Route para productos
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const productos = await prisma.product.findMany({
      include: {
        category: true,
        agricultor: {
          select: {
            id: true,
            user: {
              select: {
                nombre: true,
                correo: true
              }
            }
          }
        }
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

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validaciones básicas
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    if (!data.price || typeof data.price !== "number") {
      return NextResponse.json({ error: "Precio requerido" }, { status: 400 });
    }
    if (!data.categoryId || typeof data.categoryId !== "string") {
      return NextResponse.json({ error: "Categoría requerida" }, { status: 400 });
    }
    
    // Validar agricultorId recibido
    const userId = data.farmerId;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId (farmerId) requerido" }, { status: 400 });
    }

    // Buscar el agricultor asociado al usuario
    const agricultor = await prisma.agricultor.findUnique({ 
      where: { user_id: userId } 
    });
    if (!agricultor) {
      return NextResponse.json({ error: `No existe agricultor para el usuario ${userId}. Asegúrate de registrarte como agricultor.` }, { status: 404 });
    }

    // Crear producto en la base de datos
    const productoId = `product_${Date.now()}`;
    const producto = await prisma.product.create({
      data: {
        id: productoId,
        name: data.name,
        description: data.description || '',
        price: data.price,
        unit: data.unit || 'kg',
        stock: data.stock || 0,
        imageUrl: data.imageUrl || '',
        agricultorId: agricultor.id,
        categoryId: data.categoryId
      }
    });
    
    return NextResponse.json(producto, { status: 201 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
