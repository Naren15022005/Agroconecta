import { ProductosRepository } from "./repository";

export class ProductosService {
  private repo = new ProductosRepository();

  async listarTodos() {
    return this.repo.listarTodos();
  }

  async crearProducto(data: any) {
    return this.repo.crearProducto(data);
  }

  async actualizarProducto(id: string, data: any) {
    return this.repo.actualizarProducto(id, data);
  }

  async eliminarProducto(id: string) {
    return this.repo.eliminarProducto(id);
  }

  async buscarPorId(id: string) {
    return this.repo.buscarPorId(id);
  }

  async filtrarPorCategoria(categoryId: string) {
    return this.repo.filtrarPorCategoria(categoryId);
  }
}
