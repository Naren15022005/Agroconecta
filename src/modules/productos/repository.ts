// Repositorio para acceso a datos de productos
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ProductosRepository {
  async listarTodos() {
    return prisma.product.findMany({
      include: { category: true }
    });
  }

  async crearProducto(data: any) {
    return prisma.product.create({ data });
  }

  async actualizarProducto(id: string, data: any) {
    return prisma.product.update({ where: { id }, data });
  }

  async eliminarProducto(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async buscarPorId(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  async filtrarPorCategoria(categoryId: string) {
    return prisma.product.findMany({ where: { categoryId } });
  }
}
