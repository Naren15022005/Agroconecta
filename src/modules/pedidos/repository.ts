// Repositorio para acceso a datos de pedidos
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PedidosRepository {
  async listarTodos() {
    return prisma.order.findMany({ include: { buyer: true } });
  }

  async crearPedido(data: any) {
    return prisma.order.create({ data });
  }

  async actualizarPedido(id: string, data: any) {
    return prisma.order.update({ where: { id }, data });
  }

  async eliminarPedido(id: string) {
    return prisma.order.delete({ where: { id } });
  }

  async buscarPorId(id: string) {
    return prisma.order.findUnique({ where: { id }, include: { buyer: true } });
  }

  async listarPorUsuario(buyerId: string) {
    return prisma.order.findMany({ where: { buyerId } });
  }
}
