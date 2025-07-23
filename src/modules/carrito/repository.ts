// Repositorio para acceso a datos de carrito
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CarritoRepository {
  async listarPorUsuario(userId: string) {
    return prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
  }

  async agregarItem(data: any) {
    return prisma.cartItem.create({ data });
  }

  async actualizarItem(id: string, data: any) {
    return prisma.cartItem.update({ where: { id }, data });
  }

  async eliminarItem(id: string) {
    return prisma.cartItem.delete({ where: { id } });
  }

  async limpiarCarrito(userId: string) {
    return prisma.cartItem.deleteMany({ where: { userId } });
  }
}
