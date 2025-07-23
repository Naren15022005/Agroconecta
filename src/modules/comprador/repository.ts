// Repositorio para acceso a datos de Comprador
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CompradorRepository {
  async listarPedidosPorComprador(compradorId: string) {
    return prisma.order.findMany({ where: { buyerId: compradorId } });
  }

  async listarCarrito(compradorId: string) {
    return prisma.cartItem.findMany({ where: { userId: compradorId }, include: { product: true } });
  }

  async actualizarPerfil(compradorId: string, data: any) {
    return prisma.user.update({ where: { id: compradorId }, data });
  }
}
