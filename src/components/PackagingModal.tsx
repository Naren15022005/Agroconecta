"use client";
import React, { useState } from "react";
import { X, Box, Package, Archive, Layers, ShoppingBag, PackageCheck, Plus, Check, Upload, Image as ImageIcon } from 'lucide-react';

export interface PurchaseUnit {
  unit: string;
  equivalencia: number;
  price?: number | null;
  imagen?: string | null;
}

interface Props {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: (items: PurchaseUnit[]) => void;
  baseUnitLabel?: string;
  baseUnit?: string;
  basePrice?: number | null;
}

type SelectedItemState = {
  equivalencia: number;
  price: number | null;
  imagen: string | null;
};

const GROUPS: { title: string; items: { key: string; label: string; icon?: React.ReactNode }[] }[] = [
  {
    title: 'Cajas / Bultos',
    items: [
      { key: 'Caja', label: 'Caja', icon: <Box className="w-5 h-5" /> },
      { key: 'Bulto', label: 'Bulto', icon: <Archive className="w-5 h-5" /> },
      { key: 'Saco', label: 'Saco', icon: <Package className="w-5 h-5" /> }
    ]
  },
  {
    title: 'Bolsas / Paquetes',
    items: [
      { key: 'Bolsa', label: 'Bolsa', icon: <Layers className="w-5 h-5" /> },
      { key: 'Paquete', label: 'Paquete', icon: <ShoppingBag className="w-5 h-5" /> }
    ]
  },
  {
    title: 'Presentaciones Especiales',
    items: [
      { key: 'Canasta', label: 'Canasta', icon: <PackageCheck className="w-5 h-5" /> },
      { key: 'Unidad', label: 'Unidad', icon: <Box className="w-5 h-5" /> },
      { key: 'Docena', label: 'Docena', icon: <Box className="w-5 h-5" /> }
    ]
  }
];

export default function PackagingModal({ open, isOpen, onClose, onConfirm, baseUnitLabel, baseUnit, basePrice }: Props) {
  const isModalOpen = open ?? isOpen ?? false;
  const unitLabel = baseUnit || baseUnitLabel || 'unidad';
  const [selected, setSelected] = useState<Record<string, SelectedItemState>>({});
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setSelected(prev => {
      if (key in prev) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      const initialEq = 10;
      const initialPrice = basePrice ? basePrice * initialEq : null;
      return { ...prev, [key]: { equivalencia: initialEq, price: initialPrice, imagen: null } };
    });
  };

  const setEquivalence = (key: string, value: number) => {
    setSelected(prev => {
      const current = prev[key] || { equivalencia: 10, price: null, imagen: null };
      const newEq = Math.max(1, value);
      const newPrice = basePrice ? basePrice * newEq : current.price;
      return { ...prev, [key]: { ...current, equivalencia: newEq, price: newPrice } };
    });
  };

  const setCustomPrice = (key: string, priceValue: number | null) => {
    setSelected(prev => {
      const current = prev[key] || { equivalencia: 10, price: null, imagen: null };
      return { ...prev, [key]: { ...current, price: priceValue } };
    });
  };

  const setImage = (key: string, imgUrl: string | null) => {
    setSelected(prev => {
      const current = prev[key] || { equivalencia: 10, price: null, imagen: null };
      return { ...prev, [key]: { ...current, imagen: imgUrl } };
    });
  };

  const handleFileUpload = async (key: string, file: File) => {
    setUploadingState(prev => ({ ...prev, [key]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.imageUrl;
        if (url) {
          setImage(key, url);
        }
      } else {
        // Fallback to base64 data url if upload endpoint fails
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImage(key, reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error uploading packaging photo:', err);
    } finally {
      setUploadingState(prev => ({ ...prev, [key]: false }));
    }
  };

  const confirm = () => {
    const items: PurchaseUnit[] = Object.entries(selected).map(([unit, data]) => ({ 
      unit, 
      equivalencia: data.equivalencia,
      price: data.price,
      imagen: data.imagen
    }));
    onConfirm(items);
    setSelected({});
    onClose();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Telón de fondo con desenfoque */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Modal Principal */}
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl p-5 sm:p-7 space-y-5 z-50 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Agregar Empaques al por Mayor</h3>
              <p className="text-xs text-neutral-400">Define contenido, precio y sube foto para cada empaque</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grupos de empaque */}
        <div className="space-y-5 overflow-y-auto pr-1 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {GROUPS.map(g => (
            <div key={g.title} className="space-y-2">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{g.title}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {g.items.map(it => {
                  const active = it.key in selected;
                  const itemData = selected[it.key];
                  return (
                    <div 
                      key={it.key} 
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        active 
                          ? 'border-lime-500/60 bg-lime-500/10 shadow-md' 
                          : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/60'
                      }`}
                    >
                      <button 
                        type="button" 
                        onClick={() => toggleItem(it.key)} 
                        className="w-full flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${active ? 'text-lime-400 bg-lime-500/20' : 'text-neutral-400 bg-neutral-900'}`}>
                            {it.icon}
                          </div>
                          <span className="text-sm font-bold text-white">{it.label}</span>
                        </div>
                        {active && <Check className="w-4 h-4 text-lime-400 font-bold" />}
                      </button>

                      {active && (
                        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 space-y-2.5">
                          {/* Equivalencia */}
                          <div className="flex items-center justify-between gap-1.5">
                            <label className="text-[11px] font-medium text-neutral-400">Contiene:</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                min={1} 
                                value={itemData.equivalencia} 
                                onChange={e => setEquivalence(it.key, Number(e.target.value || 1))} 
                                className="w-14 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-750 text-white text-xs font-bold text-center focus:outline-none focus:border-lime-500" 
                              />
                              <span className="text-xs text-neutral-300 font-medium">{unitLabel}s</span>
                            </div>
                          </div>

                          {/* Precio */}
                          <div className="flex items-center justify-between gap-1.5">
                            <label className="text-[11px] font-medium text-neutral-400">Precio:</label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-lime-400 font-bold text-xs">$</span>
                              <input 
                                type="number" 
                                min={0} 
                                value={itemData.price !== null ? itemData.price : ''} 
                                onChange={e => setCustomPrice(it.key, e.target.value === '' ? null : Number(e.target.value))} 
                                placeholder="Precio" 
                                className="w-24 pl-5 pr-2 py-1 rounded-lg bg-neutral-900 border border-neutral-750 text-lime-400 text-xs font-bold text-right focus:outline-none focus:border-lime-500" 
                              />
                            </div>
                          </div>

                          {/* Subir Foto de Empaque */}
                          <div className="pt-2 border-t border-neutral-800/60">
                            <label className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center justify-between">
                              <span>Foto del Empaque</span>
                              {uploadingState[it.key] && <span className="text-[10px] text-lime-400 animate-pulse">Subiendo...</span>}
                            </label>

                            {itemData.imagen ? (
                              <div className="relative w-full h-20 rounded-xl overflow-hidden border border-lime-500/40 group">
                                <img src={itemData.imagen} alt={`Empaque ${it.key}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setImage(it.key, null)}
                                  className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 text-red-400 flex items-center justify-center gap-1 text-xs font-bold transition cursor-pointer"
                                >
                                  <X className="w-4 h-4" /> Eliminar foto
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center p-2 bg-neutral-900 border border-dashed border-neutral-750 hover:border-lime-500/60 rounded-xl cursor-pointer transition text-center group">
                                <Upload className="w-4 h-4 text-lime-400 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] text-neutral-300 font-medium">
                                  {uploadingState[it.key] ? 'Subiendo...' : '+ Añadir foto de empaque'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingState[it.key]}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(it.key, file);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empaque Personalizado */}
          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Empaque Personalizado</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                id="customUnitName" 
                placeholder="Nombre (ej: Canasta 25)" 
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-lime-500" 
              />
              <div className="flex items-center gap-2">
                <input 
                  id="customUnitEq" 
                  type="number" 
                  min={1} 
                  placeholder="Equiv." 
                  className="w-20 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-lime-500 font-bold text-center" 
                />
                <span className="text-xs text-neutral-400">{unitLabel}s</span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  const nameInput = document.getElementById('customUnitName') as HTMLInputElement;
                  const eqInput = document.getElementById('customUnitEq') as HTMLInputElement;
                  const name = nameInput?.value.trim();
                  const eq = parseFloat(eqInput?.value || '0');
                  if (!name || !eq || eq <= 0) { alert('Ingresa un nombre y cantidad válida'); return; }
                  const calcPrice = basePrice ? basePrice * eq : null;
                  setSelected(prev => ({ ...prev, [name]: { equivalencia: eq, price: calcPrice, imagen: null } }));
                  if (nameInput) nameInput.value = '';
                  if (eqInput) eqInput.value = '';
                }} 
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-lime-400 rounded-xl text-xs font-bold border border-neutral-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3 flex-shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="px-4 py-2.5 rounded-xl border border-neutral-750 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={confirm} 
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-lime-600 to-lime-500 text-neutral-950 font-extrabold text-xs hover:from-lime-500 hover:to-lime-400 transition-all shadow-md shadow-lime-950/40 cursor-pointer"
          >
            Confirmar y Agregar Empaques
          </button>
        </div>

      </div>
    </div>
  );
}
