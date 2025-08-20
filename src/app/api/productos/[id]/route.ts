import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productId = params.id;

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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productId = params.id;
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
    const { 
      name, description, price, stock, unit, categoryId, imageUrl, status,
      fechaCosecha, tiempoEntrega, stockMinimo, pesoAproximado, dimensiones,
      condicionesAlmacenamiento, certificaciones, metodosEntrega, 
      horariosDisponibles, notasEspeciales, municipio, vereda, tipoCultivo
    } = body;

    if (!name || !price || stock === undefined || !unit || !categoryId) {
      return NextResponse.json({ 
        error: "Faltan campos requeridos: name, price, stock, unit, categoryId" 
      }, { status: 400 });
    }

    // Procesar fecha de cosecha
    let fechaCosechaDate = null;
    if (fechaCosecha) {
      fechaCosechaDate = new Date(fechaCosecha);
    }

    // Procesar tipo de cultivo - convertir a mayúsculas para que coincida con el enum
    let tipoCultivoProcessed = 'CONVENCIONAL'; // valor por defecto
    if (tipoCultivo) {
      tipoCultivoProcessed = tipoCultivo.toUpperCase();
      // Validar que sea un valor válido del enum
      if (!['ORGANICO', 'CONVENCIONAL'].includes(tipoCultivoProcessed)) {
        tipoCultivoProcessed = 'CONVENCIONAL'; // fallback al valor por defecto
      }
    }

    // Actualizar el producto con todos los campos
    const productoActualizado = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        unit,
        categoryId,
        imageUrl: imageUrl || null,
        status: status || 'DISPONIBLE',
        // Campos extendidos
        fechaCosecha: fechaCosechaDate,
        tiempoEntrega: tiempoEntrega || null,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : null,
        pesoAproximado: pesoAproximado ? parseFloat(pesoAproximado) : null,
        dimensiones: dimensiones || null,
        condicionesAlmacenamiento: condicionesAlmacenamiento || null,
        certificaciones: certificaciones || [],
        metodosEntrega: metodosEntrega || [],
        horariosDisponibles: horariosDisponibles || null,
        notasEspeciales: notasEspeciales || null,
        municipio: municipio || null,
        vereda: vereda || null,
        tipoCultivo: tipoCultivoProcessed as 'ORGANICO' | 'CONVENCIONAL',
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        agricultor: {
          select: {
            id: true,
            user_id: true
          }
        }
      }
    });

    return NextResponse.json(productoActualizado);
  } catch (error) {
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
