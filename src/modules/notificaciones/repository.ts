// Repositorio para acceso a datos de Notificaciones
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NotificacionesRepository {
  async listarPorUsuario(userId: string) {
    return prisma.notification.findMany({ where: { userId } });
  }

  async crearNotificacion(data: any) {
    return prisma.notification.create({ data });
  }

  async marcarComoLeida(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async eliminarNotificacion(id: string) {
    return prisma.notification.delete({ where: { id } });
  }
}
