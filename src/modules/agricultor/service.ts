import { AgricultorRepository } from "./repository";

export class AgricultorService {
  private repo = new AgricultorRepository();

  async listarProductosPorAgricultor(agricultorId: string) {
    return this.repo.listarProductosPorAgricultor(agricultorId);
  }

  async listarPedidosRecibidos(agricultorId: string) {
    return this.repo.listarPedidosRecibidos(agricultorId);
  }

  async actualizarPerfil(agricultorId: string, data: any) {
    return this.repo.actualizarPerfil(agricultorId, data);
  }

  async eliminarProducto(productId: string) {
    return this.repo.eliminarProducto(productId);
  }

  async eliminarCuentaAgricultor(userId: string) {
    return this.repo.eliminarCuentaAgricultor(userId);
  }
}
