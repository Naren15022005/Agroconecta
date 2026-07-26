import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    // Intento 1: Prisma DB
    try {
      const producto = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: { select: { id: true, name: true } },
          agricultor: {
            select: {
              id: true,
              user_id: true,
              user: { select: { nombre: true } }
            }
          }
        }
      });
      if (producto) {
        return NextResponse.json(producto);
      }
    } catch (e) {
      console.warn('[API productos/[id]] Prisma no disponible, buscando en Firebase Cloud Firestore...');
    }

    // Intento 2: Fallback a Firebase Cloud Firestore
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const fbData = { id: docSnap.id, ...docSnap.data() };
      return NextResponse.json(fbData, { status: 200 });
    }

    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor", details: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}

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
    const { 
      name, description, price, stock, unit, categoryId, imageUrl, status,
      fechaCosecha, tiempoEntrega, stockMinimo, pesoAproximado,
      certificaciones, metodosEntrega, purchaseUnits,
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

    // Procesar tipo de cultivo
    let tipoCultivoProcessed = 'CONVENCIONAL';
    if (tipoCultivo) {
      tipoCultivoProcessed = tipoCultivo.toUpperCase();
      if (!['ORGANICO', 'CONVENCIONAL'].includes(tipoCultivoProcessed)) {
        tipoCultivoProcessed = 'CONVENCIONAL';
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
        unit,
        categoryId,
        imageUrl: imageUrl || null,
        status: status || 'DISPONIBLE',
        fechaCosecha: fechaCosechaDate,
        tiempoEntrega: tiempoEntrega || null,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : null,
        pesoAproximado: pesoAproximado ? parseFloat(pesoAproximado) : null,
        certificaciones: certificaciones || [],
        metodosEntrega: metodosEntrega || [],
        purchaseUnits: Array.isArray(purchaseUnits) ? JSON.stringify(purchaseUnits) : (typeof purchaseUnits === 'string' ? purchaseUnits : null),
        imagenes: Array.isArray(body.imagenes) ? JSON.stringify(body.imagenes) : (typeof body.imagenes === 'string' ? body.imagenes : null),
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
