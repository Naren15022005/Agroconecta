"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { User, Phone, MapPin, BadgeCheck, Image as ImageIcon, Save } from "lucide-react";
import CitySelector from '@/components/CitySelector';

type PerfilResponse = {
  agricultor: {
    id: string;
    telefono: string | null;
    ubicacion: string | null;
    descripcion: string | null;
    foto: string | null;
    verificado: boolean;
    user: {
      id: string;
      nombre: string;
      correo: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
};

const inputBase =
  "w-full rounded-lg bg-neutral-900/60 border border-neutral-700 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-600/60";

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [perfil, setPerfil] = useState<PerfilResponse["agricultor"] | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    ubicacion: "",
    descripcion: "",
    foto: ""
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const savedTimerRef = useRef<number | null>(null);

  const verificadoLabel = useMemo(() => (perfil?.verificado ? "Verificado" : "No verificado"), [perfil?.verificado]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/agricultor/perfil");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo cargar el perfil");

        const agricultor = (json as PerfilResponse).agricultor;
        setPerfil(agricultor);
        setForm({
          nombre: agricultor.user.nombre || "",
          telefono: agricultor.telefono || "",
          ubicacion: agricultor.ubicacion || "",
          descripcion: agricultor.descripcion || "",
          foto: agricultor.foto || ""
        });
      } catch (e: any) {
        setError(e?.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const resetForm = () => {
    if (!perfil) return;
    setForm({
      nombre: perfil.user.nombre || "",
      telefono: perfil.telefono || "",
      ubicacion: perfil.ubicacion || "",
      descripcion: perfil.descripcion || "",
      foto: perfil.foto || ""
    });
    setError(null);
    setSuccess(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/agricultor/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono,
          ubicacion: form.ubicacion,
          descripcion: form.descripcion,
          foto: form.foto
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar");

      setSuccess("Cambios guardados correctamente");
      setShowSaved(true);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => setShowSaved(false), 3000);
      try {
        const refreshed = await fetch('/api/agricultor/perfil');
        if (refreshed.ok) {
          const j = await refreshed.json();
          setPerfil(j.agricultor);
        }
      } catch (_) {}
    } catch (e: any) {
      setError(e?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neutral-700 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-300">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-200 px-4">
        <div className="max-w-md w-full rounded-xl bg-neutral-800 border border-neutral-700 p-6 text-center">
          <p className="text-red-400">{error || "No se encontraron datos"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mi perfil</h1>
              <p className="text-sm text-neutral-400">Configura la información pública y de contacto</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800">
              <BadgeCheck className={perfil.verificado ? "w-4 h-4 text-green-400" : "w-4 h-4 text-neutral-400"} />
              <span className={perfil.verificado ? "text-sm text-green-300" : "text-sm text-neutral-300"}>{verificadoLabel}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className={`rounded-xl bg-neutral-800 border border-neutral-700 p-6 flex flex-col items-center gap-4 ${showSaved ? 'ring-4 ring-green-500/30' : ''}`}>
            {form.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.foto} alt="Avatar" className="w-28 h-28 rounded-full object-cover border border-neutral-700" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-neutral-900/60 border border-neutral-700 flex items-center justify-center text-neutral-500 text-sm">Sin foto</div>
            )}
            <div className="text-center">
              <div className="text-lg font-semibold truncate">{perfil.user.nombre}</div>
              <div className="text-sm text-neutral-400 truncate">{perfil.user.correo}</div>
            </div>
            <div className="w-full">
              <div className="text-xs text-neutral-400 mb-2">Estado</div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900/40 border border-neutral-700 text-sm">
                <BadgeCheck className={perfil.verificado ? "w-4 h-4 text-green-400" : "w-4 h-4 text-neutral-400"} />
                <span className={perfil.verificado ? "text-green-300" : "text-neutral-300"}>{verificadoLabel}</span>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-2">
            <form onSubmit={onSubmit} className="rounded-xl bg-neutral-800 border border-neutral-700 p-6">
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-neutral-200 mb-3">Información pública</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-neutral-300 mb-2">Nombre</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input className={`${inputBase} pl-9`} value={form.nombre} onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))} placeholder="Tu nombre" aria-label="Nombre" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-300 mb-2">Descripción</label>
                    <textarea className={`${inputBase} min-h-[110px]`} value={form.descripcion} onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))} placeholder="Descripción pública" aria-label="Descripción" />
                  </div>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-200 mb-3">Contacto y ubicación</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-neutral-300 mb-2">Teléfono</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input className={`${inputBase} pl-9`} value={form.telefono} onChange={(e) => setForm((s) => ({ ...s, telefono: e.target.value }))} placeholder="Ej: 3001234567" aria-label="Teléfono" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-300 mb-2">Ubicación</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <div className="pl-9">
                        <CitySelector
                          value={form.ubicacion || 'Todas'}
                          onChange={async (city) => {
                            // update local form immediately
                            setForm((s) => ({ ...s, ubicacion: city }));
                            setSaving(true);
                            setError(null);
                            try {
                              const res = await fetch('/api/agricultor/perfil', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ubicacion: city })
                              });
                              const j = await res.json();
                              if (!res.ok) throw new Error(j?.error || 'No se pudo guardar ubicación');
                              // update perfil state with returned agricultor
                              setPerfil((p) => p ? ({ ...p, ubicacion: j.agricultor?.ubicacion ?? city }) : p);
                              setSuccess('Ubicación guardada');
                              if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
                              savedTimerRef.current = window.setTimeout(() => setSuccess(null), 2500);
                            } catch (err: any) {
                              setError(err?.message || 'Error guardando ubicación');
                            } finally {
                              setSaving(false);
                            }
                          }}
                          placeholder="Buscar ciudad o departamento..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-200 mb-3">Foto de perfil</h3>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input className={`${inputBase} pl-9`} value={form.foto} onChange={(e) => setForm((s) => ({ ...s, foto: e.target.value }))} placeholder="Coloca una URL o sube una imagen" aria-label="Foto URL" />
                    <input ref={fileInputRef} id="profile-photo-file" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      setPhotoError(null);
                      const file = (e.target.files && e.target.files[0]) as File | undefined;
                      if (!file) return;
                      try {
                        setPhotoUploading(true);
                        const fd = new FormData();
                        fd.append('file', file);
                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                        const json = await res.json();
                        if (!res.ok) throw new Error(json?.error || 'Error al subir imagen');
                        const imageUrl = json.imageUrl || json.url;
                        setForm(s => ({ ...s, foto: imageUrl }));
                      } catch (err: any) {
                        setPhotoError(err?.message || 'Error al subir la imagen');
                      } finally {
                        setPhotoUploading(false);
                      }
                    }} />
                  </div>

                  <div className="flex items-center justify-start sm:justify-end gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900">Subir desde dispositivo</button>
                    {photoUploading ? <div className="text-sm text-neutral-400">Subiendo...</div> : photoError ? <div className="text-sm text-red-400">{photoError}</div> : null}
                    {form.foto && !photoUploading ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.foto} alt="Foto de perfil" className="w-14 h-14 rounded-full object-cover border border-neutral-700" />
                    ) : null}
                  </div>
                </div>
              </section>

              {(error || success) && (
                <div className="mt-2">
                  {error && <div className="rounded-lg border border-red-700 bg-red-600/10 px-4 py-3 text-sm text-red-300">{error}</div>}
                  {success && <div className="rounded-lg border border-green-700 bg-green-600/10 px-4 py-3 text-sm text-green-300">{success}</div>}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                <button type="button" onClick={resetForm} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/40 px-4 py-2 text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:text-neutral-300 px-4 py-2 font-semibold">
                  {showSaved ? (
                    <>
                      <BadgeCheck className="w-4 h-4 text-white" />
                      <span>Guardado</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
