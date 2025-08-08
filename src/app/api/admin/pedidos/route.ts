import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Endpoint para gestión administrativa de pedidos
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || user.role.name !== "ADMINISTRADOR") {
      return NextResponse.json({ error: "Acceso denegado. Solo administradores." }, { status: 403 });
    }

    const data = await req.json();
    const { action, pedidoIds, filters } = data;

    switch (action) {
      case "archive":
        // Archivar pedidos seleccionados
        if (!pedidoIds || !Array.isArray(pedidoIds)) {
          return NextResponse.json({ error: "IDs de pedidos requeridos" }, { status: 400 });
        }

        const archivedOrders = await prisma.order.updateMany({
          where: {
            id: { in: pedidoIds },
            archived: false
          },
          data: {
            archived: true,
            archivedAt: new Date(),
            archivedBy: session.user.id
          }
        });

        return NextResponse.json({
          success: true,
          message: `${archivedOrders.count} pedidos archivados`,
          archivedCount: archivedOrders.count
        });

      case "unarchive":
        // Desarchivar pedidos seleccionados
        if (!pedidoIds || !Array.isArray(pedidoIds)) {
          return NextResponse.json({ error: "IDs de pedidos requeridos" }, { status: 400 });
        }

        const unarchivedOrders = await prisma.order.updateMany({
          where: {
            id: { in: pedidoIds },
            archived: true
          },
          data: {
            archived: false,
            archivedAt: null,
            archivedBy: null
          }
        });

        return NextResponse.json({
          success: true,
          message: `${unarchivedOrders.count} pedidos desarchivados`,
          unarchivedCount: unarchivedOrders.count
        });

      case "archive_by_criteria":
        // Archivar pedidos por criterios (ej: más de 6 meses y completados)
        const { olderThanDays = 180, statuses = ["ENTREGADO", "CANCELADO"] } = filters || {};
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const criteriaArchivedOrders = await prisma.order.updateMany({
          where: {
            createdAt: { lt: cutoffDate },
            status: { in: statuses },
            archived: false
          },
          data: {
            archived: true,
            archivedAt: new Date(),
            archivedBy: session.user.id
          }
        });

        return NextResponse.json({
          success: true,
          message: `${criteriaArchivedOrders.count} pedidos archivados por criterios`,
          archivedCount: criteriaArchivedOrders.count,
          criteria: { olderThanDays, statuses }
        });

      case "hard_delete":
        // CUIDADO: Eliminación física (solo para casos extremos)
        if (!pedidoIds || !Array.isArray(pedidoIds)) {
          return NextResponse.json({ error: "IDs de pedidos requeridos" }, { status: 400 });
        }

        // Solo permitir eliminar pedidos archivados por más de 1 año
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const ordersToDelete = await prisma.order.findMany({
          where: {
            id: { in: pedidoIds },
            archived: true,
            archivedAt: { lt: oneYearAgo }
          },
          select: { id: true }
        });

        if (ordersToDelete.length === 0) {
          return NextResponse.json({
            error: "Solo se pueden eliminar pedidos archivados por más de 1 año"
          }, { status: 400 });
        }

        // Eliminar elementos relacionados primero
        await prisma.orderItem.deleteMany({
          where: { orderId: { in: ordersToDelete.map(o => o.id) } }
        });

        // Eliminar notificaciones relacionadas
        await prisma.notification.deleteMany({
          where: { pedidoId: { in: ordersToDelete.map(o => o.id) } }
        });

        // Eliminar pedidos
        const deletedOrders = await prisma.order.deleteMany({
          where: { id: { in: ordersToDelete.map(o => o.id) } }
        });

        return NextResponse.json({
          success: true,
          message: `${deletedOrders.count} pedidos eliminados permanentemente`,
          deletedCount: deletedOrders.count,
          warning: "Esta acción es irreversible"
        });

      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en gestión administrativa de pedidos:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// Obtener estadísticas de pedidos para administradores
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || user.role.name !== "ADMINISTRADOR") {
      return NextResponse.json({ error: "Acceso denegado. Solo administradores." }, { status: 403 });
    }

    const stats = await Promise.all([
      // Total de pedidos activos (no archivados)
      prisma.order.count({ where: { archived: false } }),
      
      // Total de pedidos archivados
      prisma.order.count({ where: { archived: true } }),
      
      // Pedidos por estado (solo activos)
      prisma.order.groupBy({
        by: ['status'],
        where: { archived: false },
        _count: { _all: true }
      }),
      
      // Pedidos candidatos para archivo (más de 6 meses y completados)
      prisma.order.count({
        where: {
          archived: false,
          status: { in: ["ENTREGADO", "CANCELADO"] },
          createdAt: { lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
        }
      }),
      
      // Pedidos archivados candidatos para eliminación (más de 1 año archivados)
      prisma.order.count({
        where: {
          archived: true,
          archivedAt: { lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const [activeCount, archivedCount, statusGroups, archiveCandidates, deleteCandidates] = stats;

    const statusCounts = statusGroups.reduce((acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      summary: {
        active: activeCount,
        archived: archivedCount,
        total: activeCount + archivedCount
      },
      byStatus: statusCounts,
      maintenance: {
        archiveCandidates,
        deleteCandidates
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de pedidos:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
