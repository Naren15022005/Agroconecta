"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, User, ShoppingCart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';

export default function FavoritosPage() {
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const cart = useCartStore();

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/comprador/favoritos');
        if (r.ok) {
          const data = await r.json();
          setFavs(data.map((f: any) => f.product));
        }
      } catch (e) { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">❤️ Favoritos</h1>
          <Link href="/comprador/mercado" className="text-sm text-green-300">Seguir comprando</Link>
        </header>

        <div className="rounded-md border border-neutral-800 p-6">
          {loading ? (
            <p className="text-neutral-400">Cargando...</p>
          ) : favs.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">No tienes productos favoritos todavía.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favs.map((p: any) => {
                const imageUrl = p.imageUrl || p.imageUrl || (p.imagenes ? (Array.isArray(p.imagenes) ? p.imagenes[0] : (() => { try { return JSON.parse(p.imagenes)[0]; } catch { return null; } })()) : null) || '/favicon.ico';
                return (
                  <div key={p.id} className="bg-neutral-800 rounded-xl border border-neutral-700 hover:border-green-600 transition-colors duration-200 overflow-hidden group w-full">
                    <div className="relative pt-0 pb-0 px-0 text-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl.startsWith('http') ? imageUrl : `${typeof window !== 'undefined' ? window.location.origin : ''}${imageUrl}`}
                            alt={p.name}
                            className="w-full h-40 md:h-56 object-cover rounded-t-xl transition-opacity duration-200 hover:opacity-95 cursor-pointer mx-auto"
                            style={{ objectPosition: 'center' }}
                            onClick={() => router.push(`/mercado/producto/${encodeURIComponent(p.id)}`)}
                          />
                        ) : (
                          <div className="text-5xl flex items-center justify-center w-full h-40 md:h-56 rounded-t-2xl text-neutral-300 cursor-pointer" onClick={() => router.push(`/mercado/producto/${encodeURIComponent(p.id)}`)}>
                            🍃
                          </div>
                        )}
                      <button
                        onClick={async () => {
                          try {
                            // favorites page items are favorites by definition -> remove
                            const res = await fetch(`/api/comprador/favoritos?productId=${encodeURIComponent(p.id)}`, { method: 'DELETE' });
                            if (res.ok) {
                              setFavs(prev => prev.filter(x => x.id !== p.id));
                            }
                          } catch (e) { console.error('Error removing favorite', e); }
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 bg-red-600 text-white`}
                      >
                        <Heart className={`w-5 h-5 fill-current`} />
                      </button>
                    </div>

                    <div className="p-2 md:p-3 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-lg font-semibold text-neutral-100 mb-1 hover:text-green-400 transition-colors duration-200 cursor-pointer truncate" onClick={() => router.push(`/mercado/producto/${encodeURIComponent(p.id)}`)}>
                            {p.name}
                          </h3>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg md:text-xl font-bold text-green-400">
                            {p.price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.price) : ''}
                          </div>
                          <div className="text-xs text-neutral-500">por {p.unit || p.unidad || ''}</div>
                        </div>
                      </div>

                      <p className="text-neutral-300 text-xs md:text-sm leading-relaxed line-clamp-2 mb-1">
                        {p.description || p.descripcion}
                      </p>

                      <div className="pt-2 border-t border-neutral-800">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-neutral-200 min-w-0">
                            <User className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium truncate">{p.agricultor?.user?.nombre || p.agricultor?.user?.nombre || p.agricultor?.user?.nombre || p.agricultor || p.agricultorName || 'Agricultor'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-400 min-w-0">
                            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            <span className="truncate">{p.municipio || p.ubicacion || 'Colombia'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 md:py-2 px-3 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-2"
                          onClick={() => {
                            // add to cart (lightweight)
                            try {
                              cart.addItem({
                                id: p.id,
                                name: p.name || p.nombre,
                                price: p.price || p.precio || 0,
                                stock: p.stock ?? 0,
                                unit: p.unit || p.unidad || 'unidad',
                                purchaseUnit: null,
                                campesinoId: p.agricultorId || p.agricultor?.id || null,
                                campesinoName: p.agricultor?.user?.nombre || p.agricultor || '',
                                imageUrl: imageUrl
                              });
                              cart.toggleCart();
                            } catch (e) { console.error('add to cart error', e); }
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" /> Comprar Ahora
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
