import { NotificacionesRepository } from "./repository";

export class NotificacionesService {
  private repo = new NotificacionesRepository();

  async listarPorUsuario(userId: string) {
    return this.repo.listarPorUsuario(userId);
  }

  async crearNotificacion(data: any) {
    return this.repo.crearNotificacion(data);
  }

  async marcarComoLeida(id: string) {
    return this.repo.marcarComoLeida(id);
  }

  async eliminarNotificacion(id: string) {
    return this.repo.eliminarNotificacion(id);
  }
}
