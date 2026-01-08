// Repositorio para acceso a datos de Administrador
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AdminRepository {
  async listarUsuarios() {
    return prisma.user.findMany();
  }

  async listarProductos() {
    return prisma.product.findMany();
  }

  async listarPedidos() {
    return prisma.order.findMany({ where: { status: { not: 'CANCELADO' } } });
  }

  async actualizarUsuario(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  }

  async eliminarUsuario(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async eliminarProducto(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async eliminarPedido(id: string) {
    return prisma.order.delete({ where: { id } });
  }
}
