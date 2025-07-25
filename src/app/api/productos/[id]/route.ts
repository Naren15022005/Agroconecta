import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productId = params.id;
    Logger.log(`DELETE /api/productos/${productId} - Usuario: ${session.user.id}`);

    // Verificar que el producto existe y pertenece al usuario
    const producto = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        agricultor: {
          select: {
            user_id: true
          }
        }
      }
    });

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    if (producto.agricultor.user_id !== session.user.id) {
      return NextResponse.json({ error: "No tienes permisos para eliminar este producto" }, { status: 403 });
    }

    // Eliminar el producto
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
