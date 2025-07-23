import { AdminService } from "./service";

export class AdminController {
  private service = new AdminService();

  async listarUsuarios() {
    return this.service.listarUsuarios();
  }

  async listarProductos() {
    return this.service.listarProductos();
  }

  async listarPedidos() {
    return this.service.listarPedidos();
  }

  async actualizarUsuario(id: string, data: any) {
    return this.service.actualizarUsuario(id, data);
  }

  async eliminarUsuario(id: string) {
    return this.service.eliminarUsuario(id);
  }

  async eliminarProducto(id: string) {
    return this.service.eliminarProducto(id);
  }

  async eliminarPedido(id: string) {
    return this.service.eliminarPedido(id);
  }
}
