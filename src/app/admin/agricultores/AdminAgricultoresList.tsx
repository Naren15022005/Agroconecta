'use client';
import { useState } from 'react';

export default function AdminAgricultoresList({ agricultores }: any) {
  const [list, setList] = useState(agricultores || []);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleActive = async (agriId: string) => {
    setLoadingId(agriId);
    try {
      const res = await fetch(`/api/admin/agricultores/${agriId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggleActive' }) });
      const data = await res.json();
      if (data?.success) {
        // update list: toggle user.isActive
        setList((prev: any) => prev.map((a: any) => a.id === agriId ? { ...a, user: { ...a.user, isActive: !a.user.isActive } } : a));
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

  const setVerified = async (agriId: string, verified: boolean) => {
    setLoadingId(agriId);
    try {
      const res = await fetch(`/api/admin/agricultores/${agriId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'setVerified', data: { verified } }) });
      const data = await res.json();
      if (data?.success) {
        setList((prev: any) => prev.map((a: any) => a.id === agriId ? { ...a, verificado: verified } : a));
      } else {
        alert('Error al actualizar verificación');
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
              <th className="text-left text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Agricultor</th>
              <th className="text-right text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Productos</th>
              <th className="text-right text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Verificado</th>
              <th className="text-center text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Estado</th>
              <th className="text-center text-xs" style={{ color: 'var(--muted)', padding: '12px 24px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {list.map((agri: any) => (
              <tr key={agri.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="px-6 py-3 text-sm" style={{ width: 260, color: 'var(--muted)' }}>{agri.id}</td>
                <td className="px-6 py-3">
                  <div className="flex flex-col" style={{ gap: 4 }}>
                    <span className="text-sm font-semibold" style={{ color: '#ffffff', lineHeight: 1.1 }}>{agri.user?.nombre}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{agri.user?.correo}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-right text-sm" style={{ color: 'var(--accent)' }}>{agri._count?.products || 0}</td>
                <td className="px-6 py-3 text-center">
                  {agri.verificado ? <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}>Sí</span> : <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--muted)' }}>No</span>}
                </td>
                <td className="px-6 py-3 text-center">
                  {agri.user?.isActive ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleActive(agri.id)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleActive(agri.id)}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', cursor: 'pointer' }}
                      title="Haga click para desactivar"
                    >
                      Activo
                    </span>
                  ) : (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleActive(agri.id)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleActive(agri.id)}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer' }}
                      title="Haga click para activar"
                    >
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="inline-flex" style={{ gap: 12, justifyContent: 'center' }}>
                    <button
                      aria-label="Eliminar agricultor"
                      title="Eliminar agricultor"
                      disabled={loadingId === agri.id}
                      onClick={async () => {
                        if (!confirm('¿Confirma que desea eliminar este agricultor y su cuenta? Esta acción no se puede deshacer.')) return;
                        setLoadingId(agri.id);
                        try {
                          const res = await fetch(`/api/admin/agricultores/${agri.id}`, { method: 'DELETE' });
                          const data = await res.json();
                          if (data?.success) {
                            setList((prev: any) => prev.filter((a: any) => a.id !== agri.id));
                          } else {
                            alert(data?.error || 'Error al eliminar agricultor');
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Error de red');
                        } finally {
                          setLoadingId(null);
                        }
                      }}
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
