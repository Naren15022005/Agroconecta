import { PedidosRepository } from "./repository";

export class PedidosService {
  private repo = new PedidosRepository();

  async listarTodos() {
    return this.repo.listarTodos();
  }

  async crearPedido(data: any) {
    return this.repo.crearPedido(data);
  }

  async actualizarPedido(id: string, data: any) {
    return this.repo.actualizarPedido(id, data);
  }

  async eliminarPedido(id: string) {
    return this.repo.eliminarPedido(id);
  }

  async buscarPorId(id: string) {
    return this.repo.buscarPorId(id);
  }

  async listarPorUsuario(buyerId: string) {
    return this.repo.listarPorUsuario(buyerId);
  }
}
