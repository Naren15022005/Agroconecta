import { AdminRepository } from "./repository";

export class AdminService {
  private repo = new AdminRepository();

  async listarUsuarios() {
    return this.repo.listarUsuarios();
  }

  async listarProductos() {
    return this.repo.listarProductos();
  }

  async listarPedidos() {
    return this.repo.listarPedidos();
  }

  async actualizarUsuario(id: string, data: any) {
    return this.repo.actualizarUsuario(id, data);
  }

  async eliminarUsuario(id: string) {
    return this.repo.eliminarUsuario(id);
  }

  async eliminarProducto(id: string) {
    return this.repo.eliminarProducto(id);
  }

  async eliminarPedido(id: string) {
    return this.repo.eliminarPedido(id);
  }
}
