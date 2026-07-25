"use client";
import React, { useState } from "react";
import { X, Box, Package, Archive, Layers, ShoppingBag, PackageCheck, Plus, Check } from 'lucide-react';

interface PurchaseUnit {
  unit: string;
  equivalencia: number;
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

export default function PackagingModal({ open, isOpen, onClose, onConfirm, baseUnitLabel, baseUnit }: Props) {
  const isModalOpen = open ?? isOpen ?? false;
  const unitLabel = baseUnit || baseUnitLabel || 'unidad';
  const [selected, setSelected] = useState<Record<string, number>>({});

  const toggleItem = (key: string) => {
    setSelected(prev => {
      if (key in prev) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: 10 };
    });
  };

  const setEquivalence = (key: string, value: number) => {
    setSelected(prev => ({ ...prev, [key]: value }));
  };

  const confirm = () => {
    const items: PurchaseUnit[] = Object.entries(selected).map(([unit, equivalencia]) => ({ unit, equivalencia }));
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
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-7 space-y-5 z-50">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Agregar Empaques al por Mayor</h3>
              <p className="text-xs text-neutral-400">Define cuántas {unitLabel}s contiene cada empaque</p>
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
        <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1">
          {GROUPS.map(g => (
            <div key={g.title} className="space-y-2">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{g.title}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {g.items.map(it => {
                  const active = it.key in selected;
                  return (
                    <div 
                      key={it.key} 
                      className={`p-3 rounded-xl border transition-all ${
                        active 
                          ? 'border-lime-500/60 bg-lime-500/10' 
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
                          <span className="text-sm font-medium text-white">{it.label}</span>
                        </div>
                        {active && <Check className="w-4 h-4 text-lime-400 font-bold" />}
                      </button>

                      {active && (
                        <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                          <label className="text-xs text-neutral-400">Contiene:</label>
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number" 
                              min={1} 
                              value={selected[it.key]} 
                              onChange={e => setEquivalence(it.key, Math.max(1, Number(e.target.value || 1)))} 
                              className="w-16 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-750 text-white text-xs font-bold text-center focus:outline-none focus:border-lime-500" 
                            />
                            <span className="text-xs font-medium text-neutral-300">{unitLabel}s</span>
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
                  const name = (document.getElementById('customUnitName') as HTMLInputElement).value.trim();
                  const eq = parseFloat((document.getElementById('customUnitEq') as HTMLInputElement).value || '0');
                  if (!name || !eq || eq <= 0) { alert('Ingresa un nombre y cantidad válida'); return; }
                  setSelected(prev => ({ ...prev, [name]: eq }));
                  (document.getElementById('customUnitName') as HTMLInputElement).value = '';
                  (document.getElementById('customUnitEq') as HTMLInputElement).value = '';
                }} 
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-lime-400 rounded-xl text-xs font-bold border border-neutral-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
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
