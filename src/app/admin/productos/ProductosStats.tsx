import { Package, TrendingUp, AlertTriangle, Layers, Activity } from 'lucide-react';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ProductoVendido {
  id: string;
  nombre: string;
  categoria: string;
  agricultor: string;
  cantidadVendida: number;
  totalVentas: number;
  numeroVentas: number;
  precio: number;
  stock: number;
  imageUrl?: string;
}

interface Stats {
  resumen: {
    totalProductos: number;
    productosInactivos: number;
    totalCategorias: number;
    productosStockBajo: number;
    totalStock: number;
    valorInventario: number;
  };
  productosMasVendidos: ProductoVendido[];
  productosPorCategoria: Array<{
    id: string;
    nombre: string;
    totalProductos: number;
    descripcion?: string;
  }>;
  productosRecientes: Array<never>;
  productosSinVentas: Array<{
    id: string;
    nombre: string;
    categoria: string;
    agricultor: string;
    precio: number;
    stock: number;
    imageUrl?: string;
  }>;
}

export default async function ProductosStats() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return <div className="p-6 text-red-500">No autenticado</div>;
  }

  // ensure user is admin
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
  if (!user || user.role.name !== 'ADMINISTRADOR') {
    return <div className="p-6 text-red-500">Acceso denegado</div>;
  }

  // Build stats directly using prisma (same logic as API)
  let stats: Stats | null = null;
  try {
    const totalProductos = await prisma.product.count({ where: { isActive: true } });
    const productosInactivos = await prisma.product.count({ where: { isActive: false } });
    const totalCategorias = await prisma.category.count({ where: { isActive: true } });

    const productosMasVendidos = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, subtotal: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    const productosVendidosDetalle = await Promise.all(
      productosMasVendidos.map(async (item) => {
        const producto = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true, agricultor: { include: { user: { select: { nombre: true } } } } }
        });

        return {
          id: producto?.id,
          nombre: producto?.name,
          categoria: producto?.category?.name,
          agricultor: producto?.agricultor?.user?.nombre,
          cantidadVendida: item._sum.quantity || 0,
          totalVentas: item._sum.subtotal || 0,
          numeroVentas: item._count.id,
          precio: producto?.price ? Number(producto.price) : 0,
          stock: producto?.stock,
          imageUrl: producto?.imageUrl
        };
      })
    );

    const productosPorCategoria = await prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { isActive: true } } } } }
    });

    const productosSinVentas = await prisma.product.findMany({
      where: { isActive: true, orderItems: { none: {} } },
      take: 10,
      include: { category: true, agricultor: { include: { user: { select: { nombre: true } } } } }
    });

    const inventarioTotal = await prisma.product.aggregate({ where: { isActive: true }, _sum: { stock: true } });

    // Conteo de productos con stock crítico: stock <= COALESCE(stock_minimo, 5)
    const productosStockBajoRaw: Array<{ count: number }> = await prisma.$queryRaw`
      SELECT CAST(COUNT(*) AS INTEGER) as count
      FROM products
      WHERE "isActive" = true
        AND stock <= COALESCE("stockMinimo", 5)
    `;

    const productosStockBajo = productosStockBajoRaw[0]?.count || 0;

    stats = {
      resumen: {
        totalProductos,
        productosInactivos,
        totalCategorias,
        productosStockBajo,
        totalStock: inventarioTotal._sum.stock || 0,
        valorInventario: 0
      },
      productosMasVendidos: productosVendidosDetalle as any,
      productosPorCategoria: productosPorCategoria.map(cat => ({ id: cat.id, nombre: cat.name, totalProductos: (cat as any)._count?.products || 0, descripcion: cat.description })),
      productosRecientes: [],
      productosSinVentas: productosSinVentas.map(p => ({ id: p.id, nombre: p.name, categoria: p.category?.name || '', agricultor: p.agricultor?.user?.nombre || '', precio: p.price ? Number(p.price) : 0, stock: p.stock, imageUrl: p.imageUrl }))
    };
  } catch (err) {
    console.error('ProductosStats: error building stats', err);
  }

  if (!stats) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ background: '#232a34', border: '1px solid rgba(239,68,68,0.15)' }}>
        <Activity size={24} style={{ color: '#ef4444' }} className="mx-auto mb-3" />
        <p className="text-sm font-semibold mb-1" style={{ color: '#ef4444' }}>Error al cargar estadísticas</p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };
    return new Intl.NumberFormat('es-CO', options).format(val);
  };

  const cards = [
    {
      title: 'Productos Activos',
      value: stats.resumen.totalProductos,
      icon: Package,
      color: 'var(--accent)'
    },
    {
      title: 'Stock Total',
      value: stats.resumen.totalStock.toLocaleString(),
      icon: Layers,
      color: 'var(--accent)'
    },
    {
      title: 'Categorías',
      value: stats.resumen.totalCategorias,
      icon: TrendingUp,
      color: 'var(--accent)'
    },
    {
      title: 'Stock Bajo',
      value: stats.resumen.productosStockBajo,
      icon: AlertTriangle,
      color: '#ffffff'
    },
    {
      title: 'Inactivos',
      value: stats.resumen.productosInactivos,
      icon: Activity,
      color: '#94a3b8'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de resumen */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="rounded-lg p-3"
              style={{
                background: '#232a34',
                border: '1px solid rgba(28,198,228,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                minHeight: 110
              }}
            >
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <Icon size={16} style={{ color: card.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="text-xs font-medium mb-0" style={{ color: '#94a3b8' }}>{card.title}</p>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-semibold mt-1" style={{ color: '#ffffff' }}>{card.value}</p>
                </div>
              </div>
              <div className="mt-1">
                <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="h-full rounded-full" style={{ width: '60%', background: card.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Productos más vendidos */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>
          Top 10 - Productos Más Vendidos
        </h2>
        <div className="rounded-lg overflow-hidden" style={{ background: '#232a34', border: '1px solid rgba(28,198,228,0.12)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Agricultor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: '#94a3b8' }}>Unidades</th>
                  <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: '#94a3b8' }}>Ventas</th>
                  <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: '#94a3b8' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.productosMasVendidos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>
                      No hay productos vendidos aún
                    </td>
                  </tr>
                ) : (
                  stats.productosMasVendidos.map((producto, idx) => (
                    <tr key={producto.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {producto.imageUrl ? (
                            <Image
                              src={producto.imageUrl}
                              alt={producto.nombre}
                              width={40}
                              height={40}
                              className="rounded"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <Package size={20} style={{ color: '#94a3b8' }} />
                            </div>
                          )}
                          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{producto.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#94a3b8' }}>{producto.categoria}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#94a3b8' }}>{producto.agricultor}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                        {producto.cantidadVendida}
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: '#94a3b8' }}>
                        {producto.numeroVentas}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#ffffff' }}>
                        {formatCurrency(producto.totalVentas)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Productos por categoría */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>
          Productos por Categoría
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.productosPorCategoria.map((cat) => (
            <div
              key={cat.id}
              className="rounded-lg p-4"
              style={{
                background: '#232a34',
                border: '1px solid rgba(28,198,228,0.12)'
              }}
            >
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#ffffff' }}>
                {cat.nombre}
              </h3>
              <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>
                {cat.descripcion || 'Sin descripción'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {cat.totalProductos}
                </span>
                <span className="text-xs" style={{ color: '#94a3b8' }}>productos</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Productos sin ventas */}
      {stats.productosSinVentas.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#ffffff' }}>
            Productos Sin Ventas
          </h2>
          <div className="rounded-lg overflow-hidden" style={{ background: '#232a34', border: '1px solid rgba(28,198,228,0.12)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#94a3b8' }}>Agricultor</th>
                    <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: '#94a3b8' }}>Precio</th>
                    <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: '#94a3b8' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.productosSinVentas.map((producto) => (
                    <tr key={producto.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {producto.imageUrl ? (
                            <Image
                              src={producto.imageUrl}
                              alt={producto.nombre}
                              width={40}
                              height={40}
                              className="rounded"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <Package size={20} style={{ color: '#94a3b8' }} />
                            </div>
                          )}
                          <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{producto.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#94a3b8' }}>{producto.categoria}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#94a3b8' }}>{producto.agricultor}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#ffffff' }}>
                        {formatCurrency(Number(producto.precio))}
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: '#94a3b8' }}>
                        {producto.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
