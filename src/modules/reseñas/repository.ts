// Repositorio para acceso a datos de Reseñas
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ReseñasRepository {
  async listarPorProducto(productId: string) {
    return prisma.review.findMany({ where: { productId } });
  }

  async listarPorUsuario(userId: string) {
    return prisma.review.findMany({ where: { userId } });
  }

  async crearReseña(data: any) {
    return prisma.review.create({ data });
  }

  async eliminarReseña(id: string) {
    return prisma.review.delete({ where: { id } });
  }
}
