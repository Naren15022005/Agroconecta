// Repositorio para acceso a datos de Agricultor
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AgricultorRepository {
  async listarProductosPorAgricultor(agricultorId: string) {
    return prisma.product.findMany({ where: { campesinoId: agricultorId }, include: { category: true } });
  }

  async listarPedidosRecibidos(agricultorId: string) {
    return prisma.orderItem.findMany({ where: { product: { campesinoId: agricultorId } }, include: { order: true, product: true } });
  }

  async actualizarPerfil(agricultorId: string, data: any) {
    return prisma.user.update({ where: { id: agricultorId }, data });
  }
}
