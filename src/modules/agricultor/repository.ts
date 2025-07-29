// Repositorio para acceso a datos de Agricultor
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AgricultorRepository {
  async listarProductosPorAgricultor(agricultorId: string) {
    // Solo productos activos
    return prisma.product.findMany({ where: { agricultorId: agricultorId, isActive: true }, include: { category: true } });
  }

  async listarPedidosRecibidos(agricultorId: string) {
    return prisma.orderItem.findMany({ where: { product: { agricultorId: agricultorId } }, include: { order: true, product: true } });
  }

  async actualizarPerfil(agricultorId: string, data: any) {
    return prisma.user.update({ where: { id: agricultorId }, data });
  }

  // Eliminación lógica de producto
  async eliminarProducto(productId: string) {
    return prisma.product.update({ where: { id: productId }, data: { isActive: false } });
  }

  // Eliminación lógica de cuenta agricultor (User)
  async eliminarCuentaAgricultor(userId: string) {
    // Desactiva usuario y todos sus productos
    await prisma.product.updateMany({ where: { agricultorId: userId }, data: { isActive: false } });
    return prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  }
}
