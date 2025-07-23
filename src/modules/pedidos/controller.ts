import { PedidosService } from "./service";

export class PedidosController {
  private service = new PedidosService();

  async listarTodos() {
    return this.service.listarTodos();
  }

  async crearPedido(data: any) {
    return this.service.crearPedido(data);
  }

  async actualizarPedido(id: string, data: any) {
    return this.service.actualizarPedido(id, data);
  }

  async eliminarPedido(id: string) {
    return this.service.eliminarPedido(id);
  }

  async buscarPorId(id: string) {
    return this.service.buscarPorId(id);
  }

  async listarPorUsuario(buyerId: string) {
    return this.service.listarPorUsuario(buyerId);
  }
}
