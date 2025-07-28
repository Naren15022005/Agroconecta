console.log('Cargando API productos...');
// API Route para productos
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { AgroConectaIdGenerator } from "@/lib/id-generator";

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
    console.log('[API productos] productos desde Prisma:', productos);
    return NextResponse.json(productos);
  } catch (error) {
    console.error('[API productos] error:', error);
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

    console.log(`Buscando usuario con ID: ${userId}`);

    // Buscar o crear el agricultor asociado al usuario
    let agricultor = await prisma.agricultor.findUnique({ 
      where: { user_id: userId } 
    });
    
    // Si no existe el agricultor, crearlo automáticamente
    if (!agricultor) {
      console.log(`Agricultor no encontrado para usuario ${userId}, buscando usuario...`);
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      console.log(`Usuario encontrado:`, user ? 'SÍ' : 'NO');
      
      if (!user) {
        console.log(`Usuario ${userId} no existe en la base de datos`);
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }

      console.log(`Creando agricultor para usuario ${user.nombre}...`);
      
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
      
      console.log(`Agricultor creado con ID: ${agricultor.id}`);
    } else {
      console.log(`Agricultor existente encontrado: ${agricultor.id}`);
    }

    // Procesar fecha de cosecha
    let fechaCosecha = null;
    if (data.fechaCosecha) {
      fechaCosecha = new Date(data.fechaCosecha);
    }

    // Procesar tipo de cultivo - convertir a mayúsculas para que coincida con el enum
    let tipoCultivo = 'CONVENCIONAL'; // valor por defecto
    if (data.tipoCultivo) {
      tipoCultivo = data.tipoCultivo.toUpperCase();
      // Validar que sea un valor válido del enum
      if (!['ORGANICO', 'CONVENCIONAL'].includes(tipoCultivo)) {
        tipoCultivo = 'CONVENCIONAL'; // fallback al valor por defecto
      }
    }

    // Crear producto en la base de datos con todos los campos
    const productoId = AgroConectaIdGenerator.generateProductId();
    const producto = await prisma.product.create({
      data: {
        id: productoId,
        name: data.name,
        description: data.description || '',
        price: data.price,
        unit: data.unit || 'kg',
        stock: data.stock || 0,
        stockMinimo: data.stockMinimo || 0,
        imageUrl: data.imageUrl || '',
        agricultorId: agricultor.id,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        // Nuevos campos extendidos
        fechaCosecha: fechaCosecha,
        tiempoEntrega: data.tiempoEntrega ? data.tiempoEntrega.toString() : "1",
        pesoAproximado: data.pesoAproximado || null,
        dimensiones: data.dimensiones || null,
        condicionesAlmacenamiento: data.condicionesAlmacenamiento || null,
        certificaciones: data.certificaciones || [],
        metodosEntrega: data.metodosEntrega || [],
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
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
