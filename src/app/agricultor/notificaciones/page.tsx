import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificacionesRepository } from '@/modules/notificaciones/repository';

export default async function AgricultorNotificacionesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return <div className="p-6 text-red-500">No autenticado</div>;
  }
  const repo = new NotificacionesRepository();
  const notificaciones = await repo.listarPorUsuario(session.user.id);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notificaciones</h1>
      {notificaciones.length === 0 ? (
        <div className="text-gray-500">No tienes notificaciones nuevas.</div>
      ) : (
        <ul className="space-y-4">
          {notificaciones.map((notif: any) => (
            <li key={notif.id} className={`border rounded-lg p-4 shadow-sm ${notif.isRead ? 'bg-gray-100' : 'bg-white'}`}>
              <div className="font-semibold">{notif.message}</div>
              <div className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleString()}</div>
              {!notif.isRead && (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Nueva</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
