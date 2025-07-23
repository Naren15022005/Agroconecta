import { ProductosService } from "./service";

export class ProductosController {
  private service = new ProductosService();

  async listarTodos() {
    return this.service.listarTodos();
  }

  async crearProducto(data: any) {
    return this.service.crearProducto(data);
  }

  async actualizarProducto(id: string, data: any) {
    return this.service.actualizarProducto(id, data);
  }

  async eliminarProducto(id: string) {
    return this.service.eliminarProducto(id);
  }

  async buscarPorId(id: string) {
    return this.service.buscarPorId(id);
  }

  async filtrarPorCategoria(categoryId: string) {
    return this.service.filtrarPorCategoria(categoryId);
  }
}
