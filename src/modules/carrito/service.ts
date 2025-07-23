import { CarritoRepository } from "./repository";

export class CarritoService {
  private repo = new CarritoRepository();

  async listarPorUsuario(userId: string) {
    return this.repo.listarPorUsuario(userId);
  }

  async agregarItem(data: any) {
    return this.repo.agregarItem(data);
  }

  async actualizarItem(id: string, data: any) {
    return this.repo.actualizarItem(id, data);
  }

  async eliminarItem(id: string) {
    return this.repo.eliminarItem(id);
  }

  async limpiarCarrito(userId: string) {
    return this.repo.limpiarCarrito(userId);
  }
}
