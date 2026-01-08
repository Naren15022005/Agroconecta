import AdminUsuariosList from './AdminUsuariosList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Usuarios | Admin - AgroConecta'
};

export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return <div className="p-6 text-red-500">No autenticado</div>;
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { role: true } });
  if (!user || user.role.name !== 'ADMINISTRADOR') {
    return <div className="p-6 text-red-500">Acceso denegado</div>;
  }

  const users = await prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: 'desc' } });

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Administrar Usuarios</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Lista de usuarios registrados y acciones administrativas</p>
        </header>

        {/* @ts-expect-error Server Component */}
        <AdminUsuariosList users={users} />
      </div>
    </main>
  );
}
