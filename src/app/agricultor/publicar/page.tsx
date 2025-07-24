

"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function PublicarPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    unit: '',
    ubicacion: '',
    imageUrl: '',
    description: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [categorias, setCategorias] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    if (!session?.user?.id) {
      setMensaje('Debes iniciar sesión para publicar productos.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          unit: form.unit,
          imageUrl: form.imageUrl,
          description: form.description,
          categoryId: form.categoryId,
          ubicacion: form.ubicacion,
          farmerId: session.user.id,
        }),
      });
      if (res.ok) {
        setMensaje('¡Producto publicado exitosamente!');
        setForm({ name: '', categoryId: '', price: '', unit: '', ubicacion: '', imageUrl: '', description: '' });
      } else {
        const error = await res.json();
        setMensaje(error.error || 'Error al publicar producto');
      }
    } catch (err) {
      setMensaje('Error de red o servidor');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 space-y-6 mt-8">
      <h2 className="text-2xl font-bold text-green-700 mb-2">Publicar nuevo producto</h2>
      {mensaje && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{mensaje}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="w-full border rounded px-3 py-2">
            <option value="">Selecciona</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Precio</label>
          <input name="price" value={form.price} onChange={handleChange} required type="number" min="0" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unidad</label>
          <input name="unit" value={form.unit} onChange={handleChange} required placeholder="kg, caja, etc." className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ubicación</label>
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Imagen (URL)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} type="url" className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition disabled:opacity-60">{loading ? 'Publicando...' : 'Publicar producto'}</button>
    </form>
  );
}
