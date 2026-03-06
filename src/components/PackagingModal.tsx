"use client";
import React, { useState } from "react";
import { X, Box, Package, Archive, Layers, ShoppingBag, PackageCheck } from 'lucide-react';

interface PurchaseUnit {
  unit: string;
  equivalencia: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: PurchaseUnit[]) => void;
  baseUnitLabel?: string; // ej: 'kg' o 'libra'
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
    title: 'Presentaciones comunes',
    items: [
      { key: 'Canasta', label: 'Canasta', icon: <PackageCheck className="w-5 h-5" /> },
      { key: 'Unidad', label: 'Unidad', icon: <Box className="w-5 h-5" /> },
      { key: 'Docena', label: 'Docena', icon: <Box className="w-5 h-5" /> }
    ]
  }
];

export default function PackagingModal({ open, onClose, onConfirm, baseUnitLabel = 'unidad' }: Props) {
  const [selected, setSelected] = useState<Record<string, number>>({});

  const toggleItem = (key: string) => {
    setSelected(prev => {
      if (key in prev) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: 1 };
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl w-full max-w-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-100">Agregar empaques</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded"><X className="w-5 h-5 text-neutral-300" /></button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          {GROUPS.map(g => (
            <div key={g.title}>
              <div className="text-sm font-semibold text-neutral-300 mb-2">{g.title}</div>
              <div className="grid grid-cols-3 gap-2">
                {g.items.map(it => {
                  const active = it.key in selected;
                  return (
                    <div key={it.key} className={`p-2 rounded-lg border ${active ? 'border-green-600 bg-green-600/10' : 'border-neutral-700 bg-neutral-800'}`}>
                      <button type="button" onClick={() => toggleItem(it.key)} className="w-full flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center rounded bg-neutral-800/30">{it.icon}</div>
                        <div className="text-sm text-neutral-100">{it.label}</div>
                      </button>
                      {active && (
                        <div className="mt-2 flex items-center gap-2">
                          <input type="number" min={1} value={selected[it.key]} onChange={e => setEquivalence(it.key, Number(e.target.value || 1))} className="w-24 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-sm" />
                          <span className="text-xs text-neutral-400">{baseUnitLabel}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <div className="text-sm font-semibold text-neutral-300 mb-2">Medidas y empaques personalizados</div>
            <p className="text-xs text-neutral-400 mb-2">Si tu empaque no aparece en la lista, selecciona "Otro" y escribe el nombre y equivalencia.</p>
            <div className="flex gap-2">
              <input id="customUnitName" placeholder="Nombre (ej: Caja 20)" className="flex-1 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-sm" />
              <input id="customUnitEq" type="number" min={1} placeholder="Equiv." className="w-24 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-sm" />
              <button type="button" onClick={() => {
                const name = (document.getElementById('customUnitName') as HTMLInputElement).value.trim();
                const eq = parseFloat((document.getElementById('customUnitEq') as HTMLInputElement).value || '0');
                if (!name || !eq || eq <= 0) { alert('Ingrese nombre y equivalencia válida'); return; }
                setSelected(prev => ({ ...prev, [name]: eq }));
                (document.getElementById('customUnitName') as HTMLInputElement).value = '';
                (document.getElementById('customUnitEq') as HTMLInputElement).value = '';
              }} className="px-3 py-1 bg-green-600 text-white rounded">Agregar</button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">Cancelar</button>
          <button onClick={confirm} className="px-4 py-2 rounded bg-green-600 text-white">Agregar seleccionados</button>
        </div>

      </div>
    </div>
  );
}
