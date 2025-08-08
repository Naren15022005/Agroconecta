import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PedidosController } from "@/modules/pedidos/controller";
import { NotificacionesController } from "@/modules/notificaciones/controller";
import { prisma } from "@/lib/prisma";

const controller = new PedidosController();

// PATCH único para todos los cambios de estado
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const data = await req.json();
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
      if (pedido.status !== "PENDIENTE") return NextResponse.json({ error: "Solo se puede confirmar pedidos pendientes" }, { status: 400 });
      
      for (const item of pedido.items) {
        const producto = item.product;
        const disponible = producto.stock - producto.reservedStock;
        if (disponible < item.quantity) {
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
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message: `El agricultor ha confirmado tu pedido. Pronto recibirás novedades.`
      });
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
          mensaje = "El agricultor ha confirmado el pago. Tu pedido está en preparación.";
          break;
        case "PASARELA":
          mensaje = "El pago se ha procesado exitosamente. Tu pedido está en preparación.";
          break;
        default:
          mensaje = "El agricultor ha confirmado el pago. Tu pedido está en preparación.";
      }
      
      await prisma.order.update({ where: { id }, data: { status: "EN_PREPARACION" } });
      const notificaciones = new NotificacionesController();
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message: mensaje
      });
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
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message: `Tu pedido está listo para envío/recogida.`
      });
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
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message: `Tu pedido está en camino. Pronto lo recibirás.`
      });
      return NextResponse.json({ ok: true });
    }

    // Marcar pedido como 'ENTREGADO' (solo agricultor)
    if (action === "entregado") {
      // Verificar que el usuario sea agricultor
      const agricultor = await prisma.agricultor.findUnique({
        where: { user_id: session.user.id },
        select: { id: true }
      });
      if (!agricultor) return NextResponse.json({ error: "Usuario no es agricultor" }, { status: 403 });

      const pedido = await prisma.order.findUnique({ 
        where: { id },
        include: {
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
      
      if (pedido.status !== "EN_CAMINO") return NextResponse.json({ error: "Solo se puede marcar como entregado desde 'EN_CAMINO'" }, { status: 400 });
      await prisma.order.update({ where: { id }, data: { status: "ENTREGADO" } });
      const notificaciones = new NotificacionesController();
      await notificaciones.crearNotificacion({
        userId: pedido.buyerId,
        pedidoId: pedido.id,
        message: `¡Pedido entregado! Gracias por comprar en AgroConecta.`
      });
      return NextResponse.json({ ok: true });
    }

    // Cancelar pedido (por comprador)
    if (!status) return NextResponse.json({ error: "Status requerido" }, { status: 400 });
    const pedido = await controller.buscarPorId(id);
    if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    if (pedido.status !== "PENDIENTE") return NextResponse.json({ error: "Solo se puede cancelar pedidos pendientes" }, { status: 400 });
    if (pedido.buyerId !== session.user.id && pedido.buyerId !== session.user.email) {
      return NextResponse.json({ error: "No autorizado para cancelar este pedido" }, { status: 403 });
    }
    const actualizado = await controller.actualizarPedido(id, { status });
    // Si el pedido se cancela, eliminar notificaciones asociadas
    if (status === "CANCELADO") {
      await prisma.notification.deleteMany({ where: { pedidoId: id } });
    }
    return NextResponse.json(actualizado);
  } catch (error) {
    console.error('Error en PATCH pedidos:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
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
      return NextResponse.json(pedidos || []);
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
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}
