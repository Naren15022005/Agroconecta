// Repositorio para acceso a datos de Notificaciones
// TODO: Implementar modelo de Notification en Prisma
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export class NotificacionesRepository {
  async listarPorUsuario(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async crearNotificacion(data: any) {
    // Implementa la creación de notificación usando Prisma
    return prisma.notification.create({ 
      data: {
        ...data,
        id: randomUUID() // Generar ID único para la notificación
      }
    }); // El modelo se llama 'notification' en Prisma Client
  }

  async marcarComoLeida(id: string) {
    // TODO: Implementar cuando se cree el modelo de Notification
    return null;
  }

  async eliminarNotificacion(id: string) {
    // TODO: Implementar cuando se cree el modelo de Notification
    return null;
  }
}
