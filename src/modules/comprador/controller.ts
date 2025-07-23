import { CompradorService } from "./service";

export class CompradorController {
  private service = new CompradorService();

  async listarPedidosPorComprador(compradorId: string) {
    return this.service.listarPedidosPorComprador(compradorId);
  }

  async listarCarrito(compradorId: string) {
    return this.service.listarCarrito(compradorId);
  }

  async actualizarPerfil(compradorId: string, data: any) {
    return this.service.actualizarPerfil(compradorId, data);
  }
}
