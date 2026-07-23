console.log('Cargando API productos...');
// API Route para productos
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import AgroConectaIdGenerator from "@/lib/id-generator";

export async function GET() {
  try {
    const productosPromise = prisma.product.findMany({
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

    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => resolve(null), 1500)
    );

    const productos = await Promise.race([productosPromise, timeoutPromise]);
    
    if (!productos) {
      console.warn('[API productos] Timeout alcanzado esperando respuesta de DB (1.5s)');
      return NextResponse.json([], { status: 200 });
    }

    console.log('[API productos] productos desde Prisma:', productos.length);
    return NextResponse.json(productos);
  } catch (error) {
    console.warn('[API productos] Base de datos no disponible o desconectada:', error instanceof Error ? error.message : error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    console.log('[API productos] data recibido:', data);
  try {
    
    // Validaciones básicas
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    // Permitir price como string o number
    if (typeof data.price === "string") {
      const parsed = Number(data.price);
      if (isNaN(parsed)) {
        return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
      }
      data.price = parsed;
    }
    if (!data.price || typeof data.price !== "number") {
      return NextResponse.json({ error: "Precio requerido" }, { status: 400 });
    }
    // Permitir categoryId como string o number
    if (typeof data.categoryId !== "string") {
      if (typeof data.categoryId === "number") {
        data.categoryId = String(data.categoryId);
      } else {
        return NextResponse.json({ error: "Categoría requerida" }, { status: 400 });
      }
    }
    
    // Permitir agricultorId directo o farmerId (userId)
    let agricultorId = data.agricultorId;
    let agricultor = null;
    if (agricultorId && typeof agricultorId === "string") {
      // Buscar agricultor por id
      agricultor = await prisma.agricultor.findUnique({ where: { id: agricultorId } });
      if (!agricultor) {
        return NextResponse.json({ error: "Agricultor no encontrado" }, { status: 404 });
      }
    } else {
      // Fallback: buscar/crear agricultor por userId (farmerId)
      const userId = data.farmerId;
      if (!userId || typeof userId !== "string") {
        return NextResponse.json({ error: "Debe enviar agricultorId o farmerId (userId)" }, { status: 400 });
      }
      agricultor = await prisma.agricultor.findUnique({ where: { user_id: userId } });
      if (!agricultor) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }
        agricultor = await prisma.agricultor.create({
          data: {
            id: AgroConectaIdGenerator.generateAgricultorId(),
            user_id: userId,
            telefono: null,
            ubicacion: null,
            descripcion: `Agricultor registrado automáticamente para ${user.nombre}`,
            verificado: false
          }
        });
      }
    }

    // Procesar fecha de cosecha
    let fechaCosecha = null;
    if (data.fechaCosecha) {
      fechaCosecha = new Date(data.fechaCosecha);
    }

    // Procesar tipo de cultivo - convertir a mayúsculas para que coincida con el enum
    let tipoCultivo: 'ORGANICO' | 'CONVENCIONAL' | null = 'CONVENCIONAL'; // valor por defecto
    if (data.tipoCultivo) {
      const tipo = data.tipoCultivo.toUpperCase();
      if (tipo === 'ORGANICO' || tipo === 'CONVENCIONAL') {
        tipoCultivo = tipo;
      } else {
        tipoCultivo = null;
      }
    }

    // Crear producto en la base de datos con todos los campos
    const productoId = AgroConectaIdGenerator.generateProductId();
    // Serializar campos que deben ser string
    let certificaciones = null;
    if (Array.isArray(data.certificaciones)) {
      certificaciones = JSON.stringify(data.certificaciones);
    } else if (typeof data.certificaciones === 'string') {
      certificaciones = data.certificaciones;
    }
    let metodosEntrega = null;
    if (Array.isArray(data.metodosEntrega)) {
      metodosEntrega = JSON.stringify(data.metodosEntrega);
    } else if (typeof data.metodosEntrega === 'string') {
      metodosEntrega = data.metodosEntrega;
    }
    let purchaseUnits = null;
    if (Array.isArray(data.purchaseUnits)) {
      purchaseUnits = JSON.stringify(data.purchaseUnits);
    } else if (typeof data.purchaseUnits === 'string') {
      purchaseUnits = data.purchaseUnits;
    }
    const producto = await prisma.product.create({
      data: {
        id: productoId,
        name: data.name,
        description: data.description || '',
        price: data.price,
        unit: data.unit || 'kg',
        stock: data.stock || 0,
        // Forzar valores por sistema: stock mínimo y reservado siempre 10
        stockMinimo: 10,
        reservedStock: 10,
        imageUrl: data.imageUrl || '',
        agricultorId: agricultor.id,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        // Nuevos campos extendidos
        fechaCosecha: fechaCosecha,
        tiempoEntrega: data.tiempoEntrega ? data.tiempoEntrega.toString() : "1",
        pesoAproximado: data.pesoAproximado || null,
        certificaciones: certificaciones,
        metodosEntrega: metodosEntrega,
        purchaseUnits: purchaseUnits,
        // Guardar array de imágenes si viene como JSON
        imagenes: Array.isArray(data.imagenes) ? JSON.stringify(data.imagenes) : (typeof data.imagenes === 'string' ? data.imagenes : null),
        horariosDisponibles: data.horariosDisponibles || null,
        notasEspeciales: data.notasEspeciales || null,
        municipio: data.municipio || null,
        vereda: data.vereda || null,
        tipoCultivo: tipoCultivo
      }
    });
    
    return NextResponse.json(producto, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    try {
      if (typeof data !== 'undefined') {
        console.error('[API productos] data al fallar:', data);
      }
    } catch (e) {
      // data no está definido
    }
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
