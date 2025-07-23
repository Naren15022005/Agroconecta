import { NotificacionesService } from "./service";

export class NotificacionesController {
  private service = new NotificacionesService();

  async listarPorUsuario(userId: string) {
    return this.service.listarPorUsuario(userId);
  }

  async crearNotificacion(data: any) {
    return this.service.crearNotificacion(data);
  }

  async marcarComoLeida(id: string) {
    return this.service.marcarComoLeida(id);
  }

  async eliminarNotificacion(id: string) {
    return this.service.eliminarNotificacion(id);
  }
}
