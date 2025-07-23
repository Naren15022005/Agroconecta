import { CompradorRepository } from "./repository";

export class CompradorService {
  private repo = new CompradorRepository();

  async listarPedidosPorComprador(compradorId: string) {
    return this.repo.listarPedidosPorComprador(compradorId);
  }

  async listarCarrito(compradorId: string) {
    return this.repo.listarCarrito(compradorId);
  }

  async actualizarPerfil(compradorId: string, data: any) {
    return this.repo.actualizarPerfil(compradorId, data);
  }
}
