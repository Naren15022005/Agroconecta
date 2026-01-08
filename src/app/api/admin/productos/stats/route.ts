import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || user.role.name !== 'ADMINISTRADOR') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Estadísticas generales de productos
    const totalProductos = await prisma.product.count({
      where: { isActive: true }
    });

    const productosInactivos = await prisma.product.count({
      where: { isActive: false }
    });

    const totalCategorias = await prisma.category.count({
      where: { isActive: true }
    });

    // Productos con bajo stock (stock <= COALESCE(stock_minimo, 5))
    const productosStockBajoRaw: Array<{ count: number }> = await prisma.$queryRaw`
      SELECT CAST(COUNT(*) AS INTEGER) as count
      FROM products
      WHERE "isActive" = true
        AND stock <= COALESCE("stockMinimo", 5)
    `;
    const productosStockBajo = productosStockBajoRaw[0]?.count || 0;

    // Productos más vendidos (basado en OrderItems)
    const productosMasVendidos = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        subtotal: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // Obtener detalles de los productos más vendidos
    const productosVendidosDetalle = await Promise.all(
      productosMasVendidos.map(async (item) => {
        const producto = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            category: true,
            agricultor: {
              include: {
                user: {
                  select: {
                    nombre: true
                  }
                }
              }
            }
          }
        });

        return {
          id: producto?.id,
          nombre: producto?.name,
          categoria: producto?.category.name,
          agricultor: producto?.agricultor.user.nombre,
          cantidadVendida: item._sum.quantity || 0,
          totalVentas: item._sum.subtotal || 0,
          numeroVentas: item._count.id,
          precio: producto?.price,
          stock: producto?.stock,
          imageUrl: producto?.imageUrl
        };
      })
    );

    // Productos por categoría
    const productosPorCategoria = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: {
        products: {
          _count: 'desc'
        }
      }
    });

    // Productos recién agregados
    const productosRecientes = await prisma.product.findMany({
      where: { isActive: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        agricultor: {
          include: {
            user: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    });

    // Productos sin ventas
    const productosSinVentas = await prisma.product.findMany({
      where: {
        isActive: true,
        orderItems: {
          none: {}
        }
      },
      take: 10,
      include: {
        category: true,
        agricultor: {
          include: {
            user: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    });

    // Valor total del inventario
    const inventarioTotal = await prisma.product.aggregate({
      where: { isActive: true },
      _sum: {
        stock: true
      }
    });

    const valorInventario = await prisma.$queryRaw<Array<{ total: number }>>`
      SELECT CAST(SUM(price * stock) AS FLOAT) as total
      FROM products
      WHERE "isActive" = true
    `;

    const stats = {
      resumen: {
        totalProductos,
        productosInactivos,
        totalCategorias,
        productosStockBajo,
        totalStock: inventarioTotal._sum.stock || 0,
        valorInventario: valorInventario[0]?.total || 0
      },
      productosMasVendidos: productosVendidosDetalle,
      productosPorCategoria: productosPorCategoria.map(cat => ({
        id: cat.id,
        nombre: cat.name,
        totalProductos: cat._count.products,
        descripcion: cat.description
      })),
      productosRecientes: productosRecientes.map(p => ({
        id: p.id,
        nombre: p.name,
        categoria: p.category.name,
        agricultor: p.agricultor.user.nombre,
        precio: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        fechaCreacion: p.createdAt
      })),
      productosSinVentas: productosSinVentas.map(p => ({
        id: p.id,
        nombre: p.name,
        categoria: p.category.name,
        agricultor: p.agricultor.user.nombre,
        precio: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error en /api/admin/productos/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de productos' },
      { status: 500 }
    );
  }
}
