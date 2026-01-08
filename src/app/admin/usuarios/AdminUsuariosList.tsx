"use client";
import { useState } from "react";

export default function AdminUsuariosList({ users }: any) {
  const [list, setList] = useState(users || []);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleActive = async (userId: string) => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggleActive' }) });
      const data = await res.json();
      if (data?.success) {
        setList((prev: any) => prev.map((u: any) => u.id === userId ? { ...u, isActive: !u.isActive } : u));
      } else {
        alert('Error al actualizar');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red');
    } finally {
      setLoadingId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('¿Confirma que desea eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data?.success) {
        setList((prev: any) => prev.filter((u: any) => u.id !== userId));
      } else {
        alert(data?.error || 'Error al eliminar usuario');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red');
    } finally {
      setLoadingId(null);
    }
  };

  

  return (
    <div className="rounded-lg" style={{ background: 'var(--card)', padding: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="text-left text-xs" style={{ color: 'var(--muted)', padding: '12px 24px', width: 260 }}>ID</th>
              <th className="text-left text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Nombre</th>
              <th className="text-center text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Rol</th>
              <th className="text-center text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Estado</th>
              <th className="text-center text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u: any) => (
              <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="px-6 py-3 text-sm" style={{ width: 260, color: 'var(--muted)' }}>{u.id}</td>
                <td className="px-6 py-3">
                  <div className="flex flex-col" style={{ gap: 4 }}>
                    <span className="text-sm font-semibold" style={{ color: '#ffffff', lineHeight: 1.1 }}>{u.nombre || u.name || u.user?.nombre}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{u.correo || u.email || u.user?.correo || u.username || ''}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-center text-sm" style={{ color: 'var(--accent)' }}>{typeof u.role === 'object' ? u.role.name : (u.role || 'USUARIO')}</td>
                <td className="px-6 py-3 text-center">
                  {u.isActive ? (
                    <span role="button" tabIndex={0} onClick={() => toggleActive(u.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleActive(u.id)} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', cursor: 'pointer' }} title="Haga click para desactivar">Activo</span>
                  ) : (
                    <span role="button" tabIndex={0} onClick={() => toggleActive(u.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleActive(u.id)} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer' }} title="Haga click para activar">Inactivo</span>
                  )}
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="inline-flex" style={{ gap: 12, justifyContent: 'center' }}>
                    <button
                      aria-label="Eliminar usuario"
                      title="Eliminar usuario"
                      disabled={loadingId === u.id}
                      onClick={() => deleteUser(u.id)}
                      style={{ background: 'transparent', color: '#ef4444', padding: 0, border: 'none', width: 'auto', height: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M3 6h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
