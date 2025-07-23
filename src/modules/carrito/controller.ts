import { CarritoService } from "./service";

export class CarritoController {
  private service = new CarritoService();

  async listarPorUsuario(userId: string) {
    return this.service.listarPorUsuario(userId);
  }

  async agregarItem(data: any) {
    return this.service.agregarItem(data);
  }

  async actualizarItem(id: string, data: any) {
    return this.service.actualizarItem(id, data);
  }

  async eliminarItem(id: string) {
    return this.service.eliminarItem(id);
  }

  async limpiarCarrito(userId: string) {
    return this.service.limpiarCarrito(userId);
  }
}
