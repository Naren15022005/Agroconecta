import { AgricultorService } from "./service";

export class AgricultorController {
  private service = new AgricultorService();

  async listarProductosPorAgricultor(agricultorId: string) {
    return this.service.listarProductosPorAgricultor(agricultorId);
  }

  async listarPedidosRecibidos(agricultorId: string) {
    return this.service.listarPedidosRecibidos(agricultorId);
  }

  async actualizarPerfil(agricultorId: string, data: any) {
    return this.service.actualizarPerfil(agricultorId, data);
  }

  async eliminarProducto(productId: string) {
    return this.service.eliminarProducto(productId);
  }

  async eliminarCuentaAgricultor(userId: string) {
    return this.service.eliminarCuentaAgricultor(userId);
  }
}
