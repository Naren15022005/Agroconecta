import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: productId } = await params;

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

    return NextResponse.json({ message: "Producto eliminado exitosamente" });

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: productId } = await params;
    const body = await req.json();

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
      return NextResponse.json({ error: "No tienes permisos para editar este producto" }, { status: 403 });
    }

    // Validar datos requeridos
    const { name, description, price, stock, categoryId, subcategoryId, metodosEntrega } = body;

    if (!name || !description || !price || stock === undefined || !categoryId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar que la categoría existe
    const categoria = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoría no válida" }, { status: 400 });
    }

    // Si se proporciona subcategoría, verificar que existe y pertenece a la categoría
    if (subcategoryId) {
      const subcategoria = await prisma.subcategory.findUnique({
        where: { 
          id: subcategoryId,
          categoryId: categoryId
        }
      });

      if (!subcategoria) {
        return NextResponse.json({ error: "Subcategoría no válida" }, { status: 400 });
      }
    }

    // Actualizar el producto
    const productoActualizado = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        subcategoryId: subcategoryId || null,
        metodosEntrega: metodosEntrega ? JSON.stringify(metodosEntrega) : null,
        updatedAt: new Date()
      },
      include: {
        category: true,
        subcategory: true,
        agricultor: {
          include: {
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

    return NextResponse.json({
      message: "Producto actualizado exitosamente",
      producto: productoActualizado
    });

  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const producto = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        subcategory: true,
        agricultor: {
          include: {
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

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(producto);

  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
