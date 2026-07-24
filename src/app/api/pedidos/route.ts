import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PedidosController } from "@/modules/pedidos/controller";
import { NotificacionesController } from "@/modules/notificaciones/controller";
import { prisma } from "@/lib/prisma";
import { buildPedidoStatusEmail, sendEmail } from "@/lib/email";

const controller = new PedidosController();

// PATCH único para todos los cambios de estado
export async function PATCH(req: NextRequest) {
  try {
    console.log('[api/pedidos] PATCH incoming:', { url: req.url });
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const data = await req.json();
    console.log('[api/pedidos] PATCH - user:', session?.user?.id || session?.user?.email, 'data:', data);
    const { id, status, action } = data;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    // Confirmar pedido por agricultor
    if (action === "confirmar") {
      // Obtener el perfil de agricultor del usuario autenticado
      const agricultor = await prisma.agricultor.findUnique({
        where: { user_id: session.user.id },
        select: { id: true }
      });
      if (!agricultor) return NextResponse.json({ error: "Usuario no es agricultor" }, { status: 403 });

      const pedido = await prisma.order.findUnique({
        where: { id },
        include: {
          buyer: { select: { correo: true, nombre: true } },
          items: {
            include: {
              product: true
            }
          }
        }
      });
      if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      if (!pedido.items || pedido.items.length === 0) return NextResponse.json({ error: "Pedido sin productos" }, { status: 400 });
      const esAgricultor = pedido.items.every((item: any) => item.product.agricultorId === agricultor.id);
      if (!esAgricultor) return NextResponse.json({ error: "No autorizado para confirmar este pedido" }, { status: 403 });

      // Solo permitir avanzar si el pago fue validado para métodos que lo requieren
      // Nota: la validación de pago NO debe bloquear la aceptación (CONFIRMADO).
      // Se valida en pasos posteriores (p. ej. action=marcar_pagado) para métodos que lo requieren.

      for (const item of pedido.items) {
        const producto = item.product;
        const disponible = producto.stock - producto.reservedStock;
        if (disponible < item.quantity) {
          console.error('[api/pedidos] confirmar blocked - stock insuficiente', { pedidoId: id, productId: producto.id, disponible, requested: item.quantity });
          return NextResponse.json({ error: `Stock insuficiente para ${producto.name}` }, { status: 400 });
        }
      }

      for (const item of pedido.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { reservedStock: { increment: item.quantity } }
        });
      }

      await prisma.order.update({ where: { id }, data: { status: "CONFIRMADO" } });
      const notificaciones = new NotificacionesController();
      const message = `El agricultor ha confirmado tu pedido. Pronto recibirás novedades.`;
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message
      });

      if (pedido.buyer?.correo) {
        const email = buildPedidoStatusEmail({
          buyerName: pedido.buyer?.nombre,
          pedidoId: pedido.id,
          status: 'CONFIRMADO',
          message,
        });
        await sendEmail({ to: pedido.buyer.correo, ...email });
      }
      return NextResponse.json({ ok: true });
    }

    // Marcar pedido como pagado y avanzar a 'EN_PREPARACION' (solo agricultor)
    if (action === "marcar_pagado") {
      // Verificar que el usuario sea agricultor
      const agricultor = await prisma.agricultor.findUnique({
        where: { user_id: session.user.id },
        select: { id: true }
      });
      if (!agricultor) return NextResponse.json({ error: "Usuario no es agricultor" }, { status: 403 });

      const pedido = await prisma.order.findUnique({ 
        where: { id },
        include: {
          buyer: { select: { correo: true, nombre: true } },
          items: {
            include: {
              product: true
            }
          }
        }
      });
      if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      
      // Verificar que el agricultor es dueño de los productos del pedido
      const esAgricultor = pedido.items.every((item: any) => item.product.agricultorId === agricultor.id);
      if (!esAgricultor) return NextResponse.json({ error: "No autorizado para gestionar este pedido" }, { status: 403 });
      
      if (pedido.status !== "CONFIRMADO") return NextResponse.json({ error: "Solo se puede marcar como pagado pedidos confirmados" }, { status: 400 });
      
      // Lógica de pago basada en el método elegido
      let mensaje = "";
      switch (pedido.paymentMethod) {
        case "CONTRAENTREGA":
          mensaje = "El agricultor confirmó que recibirás el pedido y pagarás al momento de la entrega.";
          break;
        case "TRANSFERENCIA":
        case "NEQUI":
        case "DAVIPLATA":
          mensaje = "La plataforma ha confirmado tu pago. Tu pedido está en preparación.";
          break;
        case "PASARELA":
          mensaje = "El pago se ha procesado exitosamente. Tu pedido está en preparación.";
          break;
        default:
          mensaje = "La plataforma ha confirmado tu pago. Tu pedido está en preparación.";
      }
      
      // Si el método de pago requiere validación, crear transacción pendiente y bloquear avance si no está validado
      if (["TRANSFERENCIA", "NEQUI", "DAVIPLATA"].includes(pedido.paymentMethod)) {
        // Crear transacción pendiente si no existe
        const existePago = await prisma.paymentTransaction.findFirst({ where: { pedidoId: pedido.id } });
        if (!existePago) {
          await prisma.paymentTransaction.create({
            data: {
              pedidoId: pedido.id,
              compradorId: pedido.buyerId,
              agricultorId: pedido.items[0].product.agricultorId,
              monto: pedido.total,
              metodo: pedido.paymentMethod,
              estado: "PENDIENTE"
            }
          });
        }
        // Bloquear avance si el pago no está validado
        if (!pedido.pagoVerificado) {
          return NextResponse.json({ error: "El pago aún no ha sido validado por el administrador." }, { status: 403 });
        }
      }
      await prisma.order.update({ where: { id }, data: { status: "EN_PREPARACION" } });
      const notificaciones = new NotificacionesController();
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message: mensaje
      });

      if (pedido.buyer?.correo) {
        const email = buildPedidoStatusEmail({
          buyerName: pedido.buyer?.nombre,
          pedidoId: pedido.id,
          status: 'EN_PREPARACION',
          message: mensaje,
        });
        await sendEmail({ to: pedido.buyer.correo, ...email });
      }
      return NextResponse.json({ ok: true });
    }

    // Marcar pedido como 'EN_PUNTO' - listo para envío (solo agricultor)
    if (action === "listo_envio") {
      // Verificar que el usuario sea agricultor
      const agricultor = await prisma.agricultor.findUnique({
        where: { user_id: session.user.id },
        select: { id: true }
      });
      if (!agricultor) return NextResponse.json({ error: "Usuario no es agricultor" }, { status: 403 });

      const pedido = await prisma.order.findUnique({ 
        where: { id },
        include: {
          buyer: { select: { correo: true, nombre: true } },
          items: {
            include: {
              product: true
            }
          }
        }
      });
      if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      
      // Verificar que el agricultor es dueño de los productos del pedido
      const esAgricultor = pedido.items.every((item: any) => item.product.agricultorId === agricultor.id);
      if (!esAgricultor) return NextResponse.json({ error: "No autorizado para gestionar este pedido" }, { status: 403 });
      
      if (pedido.status !== "EN_PREPARACION") return NextResponse.json({ error: "Solo se puede marcar como listo desde 'EN_PREPARACION'" }, { status: 400 });
      
      await prisma.order.update({ where: { id }, data: { status: "EN_PUNTO" } });
      const notificaciones = new NotificacionesController();
      const message = `Tu pedido está listo para envío/recogida.`;
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message
      });

      if (pedido.buyer?.correo) {
        const email = buildPedidoStatusEmail({
          buyerName: pedido.buyer?.nombre,
          pedidoId: pedido.id,
          status: 'EN_PUNTO',
          message,
        });
        await sendEmail({ to: pedido.buyer.correo, ...email });
      }
      return NextResponse.json({ ok: true });
    }

    // Avanzar pedido a 'EN_CAMINO' (solo agricultor)
    if (action === "en_camino") {
      // Verificar que el usuario sea agricultor
      const agricultor = await prisma.agricultor.findUnique({
        where: { user_id: session.user.id },
        select: { id: true }
      });
      if (!agricultor) return NextResponse.json({ error: "Usuario no es agricultor" }, { status: 403 });

      const pedido = await prisma.order.findUnique({ 
        where: { id },
        include: {
          buyer: { select: { correo: true, nombre: true } },
          items: {
            include: {
              product: true
            }
          }
        }
      });
      if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
      
      // Verificar que el agricultor es dueño de los productos del pedido
      const esAgricultor = pedido.items.every((item: any) => item.product.agricultorId === agricultor.id);
      if (!esAgricultor) return NextResponse.json({ error: "No autorizado para gestionar este pedido" }, { status: 403 });
      
      if (pedido.status !== "EN_PUNTO") return NextResponse.json({ error: "Solo se puede avanzar a 'EN_CAMINO' desde 'EN_PUNTO'" }, { status: 400 });
      await prisma.order.update({ where: { id }, data: { status: "EN_CAMINO" } });
      const notificaciones = new NotificacionesController();
      const message = `Tu pedido está en camino. Pronto lo recibirás.`;
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message
      });

      if (pedido.buyer?.correo) {
        const email = buildPedidoStatusEmail({
          buyerName: pedido.buyer?.nombre,
          pedidoId: pedido.id,
          status: 'EN_CAMINO',
          message,
        });
        await sendEmail({ to: pedido.buyer.correo, ...email });
      }
      return NextResponse.json({ ok: true });
    }

    // Marcar pedido como 'ENTREGADO' (solo agricultor)
    if (action === "entregado") {
      // Verificar que el usuario sea agricultor
      const agricultor = await prisma.agricultor.findUnique({
        where: { user_id: session.user.id },
        select: { id: true, user_id: true }
      });
      if (!agricultor) return NextResponse.json({ error: "Usuario no es agricultor" }, { status: 403 });

      const pedido = await prisma.order.findUnique({ 
        where: { id },
        include: {
          items: {
            include: {
              product: true
            }
          },
          buyer: true
        }
      });
      if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

      // Verificar que el agricultor es dueño de los productos del pedido
      const esAgricultor = pedido.items.every((item: any) => item.product.agricultorId === agricultor.id);
      if (!esAgricultor) return NextResponse.json({ error: "No autorizado para gestionar este pedido" }, { status: 403 });

      if (pedido.status !== "EN_CAMINO") return NextResponse.json({ error: "Solo se puede marcar como entregado desde 'EN_CAMINO'" }, { status: 400 });

      // Actualizar estado a ENTREGADO
      await prisma.order.update({ where: { id }, data: { status: "ENTREGADO" } });

      // Crear una venta y comisión por cada producto del pedido
      const porcentajeComision = 10.0; // Puedes parametrizar esto
      for (const item of pedido.items) {
        // Crear venta
        const venta = await prisma.sale.create({
          data: {
            vendedorId: agricultor.user_id,
            compradorId: pedido.buyerId,
            productoId: item.productId,
            cantidad: item.quantity,
            precioUnitario: item.product.price,
            total: Number(item.product.price) * item.quantity,
            fecha: new Date()
          }
        });
        // Crear comisión
        const montoComision = Number((Number(item.product.price) * item.quantity * porcentajeComision / 100).toFixed(2));
        await prisma.comision.create({
          data: {
            ventaId: venta.id,
            porcentaje: porcentajeComision,
            monto: montoComision,
            fecha: new Date()
          }
        });
      }

      const notificaciones = new NotificacionesController();
      const message = `¡Pedido entregado! Gracias por comprar en AgroConecta.`;
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message
      });

      const buyerCorreo = (pedido as any)?.buyer?.correo;
      const buyerNombre = (pedido as any)?.buyer?.nombre;
      if (buyerCorreo) {
        const email = buildPedidoStatusEmail({
          buyerName: buyerNombre,
          pedidoId: pedido.id,
          status: 'ENTREGADO',
          message: 'Tu pedido ha sido entregado. ¡Gracias por comprar en AgroConecta!',
        });
        await sendEmail({ to: buyerCorreo, ...email });
      }
      return NextResponse.json({ ok: true });
    }

    // Cancelar pedido (por comprador)
    if (!status) return NextResponse.json({ error: "Status requerido" }, { status: 400 });
    // Only allow cancel flow when status === 'CANCELADO'
    if (status !== 'CANCELADO') return NextResponse.json({ error: 'Operación de cancelación no válida' }, { status: 400 });
    const pedido = await prisma.order.findUnique({ where: { id }, include: { items: true, paymentTransactions: true } });
    if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    if (pedido.status !== "PENDIENTE") return NextResponse.json({ error: "Solo se puede cancelar pedidos pendientes" }, { status: 400 });
    if (pedido.buyerId !== session.user.id && pedido.buyerId !== session.user.email) {
      return NextResponse.json({ error: "No autorizado para cancelar este pedido" }, { status: 403 });
    }

    // Perform a safe, atomic cancellation: restore stock/reservedStock, remove payment transactions and notifications, and delete the order.
    try {
      await prisma.$transaction(async (tx) => {
        // Restore stock and reservedStock if applicable
        for (const item of pedido.items || []) {
          try {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.quantity },
                reservedStock: { decrement: item.quantity }
              }
            });
          } catch (e) {
            // ignore per-product update errors to avoid blocking cancellation
            console.warn('[api/pedidos] warning restoring stock for product', item.productId, e);
          }
        }

        // Remove any payment transactions related to this order
        await tx.paymentTransaction.deleteMany({ where: { pedidoId: id } });

        // Remove notifications
        await tx.notification.deleteMany({ where: { pedidoId: id } });

        // Delete order items then order
        await tx.orderItem.deleteMany({ where: { orderId: id } }).catch(()=>{});
        await tx.order.delete({ where: { id } });
      });
    } catch (e) {
      console.error('[api/pedidos] error during cancellation transaction:', e);
      return NextResponse.json({ error: 'Error al cancelar pedido' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, cancelled: true });
  } catch (error) {
    console.error('Error en PATCH pedidos:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    try {
      console.log('[api/pedidos] GET incoming:', { url: req.url, params: Object.fromEntries(searchParams.entries()) });
    } catch (e) {
      console.log('[api/pedidos] GET incoming - unable to stringify params');
    }
    const buyerId = searchParams.get("buyerId");
    const id = searchParams.get("id");
    
    // Nuevos parámetros de filtrado y paginación
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const includeArchived = searchParams.get("includeArchived") === "true";

    if (id) {
      const pedido = await controller.buscarPorId(id);
      return NextResponse.json(pedido || null);
    }

    if (buyerId) {
      const pedidos = await controller.listarPorUsuario(buyerId);
      return NextResponse.json({ 
        success: true, 
        data: pedidos || [] 
      });
    }
    
    // Si hay filtros, usar consulta filtrada
    if (status || startDate || endDate || page > 1 || includeArchived) {
      const skip = (page - 1) * limit;
      
      // Construir filtros
      const filters: any = {};
      
      // Por defecto, excluir archivados a menos que se solicite explícitamente
      if (!includeArchived) {
        filters.archived = false;
      }
      
      if (status && status !== "TODOS") {
        filters.status = status;
      }
      
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) {
          filters.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          filters.createdAt.lte = new Date(endDate);
        }
      }

      // Consulta con filtros
      const [pedidos, total] = await Promise.all([
        prisma.order.findMany({
          where: filters,
          include: {
            buyer: {
              select: { id: true, nombre: true, correo: true }
            },
            items: {
              include: {
                product: {
                  select: { id: true, name: true, price: true }
                }
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.order.count({ where: filters })
      ]);

      return NextResponse.json({
        pedidos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    }
    
    // Si no hay filtros, usar el método original
    const pedidos = await controller.listarTodos();
    return NextResponse.json(pedidos || []);
  } catch (error) {
    console.error('Error en GET pedidos:', error);
    return NextResponse.json({ success: true, data: [], pedidos: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false } }, { status: 200 });
  }
}
