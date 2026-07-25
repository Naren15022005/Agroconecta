"use client";
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown } from 'lucide-react';
import { CIUDADES_PRINCIPALES, searchCities, CIUDADES_COLOMBIA, type City } from '@/data/ciudades';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
}

export default function CitySelector({ value, onChange, placeholder = 'Buscar municipio o ciudad...' }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const municipiosRef = useRef<City[] | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar municipios cuando cambia la búsqueda
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length === 0) {
      setFilteredCities([]);
      return;
    }

    // Resultados rápidos inmediatos
    const quick = searchCities(q).slice(0, 50);
    setFilteredCities(quick);

    // Cargar dataset completo en segundo plano si la búsqueda supera 2 caracteres
    if (!municipiosRef.current && q.length >= 2) {
      setLoadingMunicipios(true);
      fetch('/data/colombia-municipios.json')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch colombia-municipios.json');
          return res.json();
        })
        .then((data) => {
          let flat: City[] = [];
          if (Array.isArray(data) && data.length > 0) {
            const first = data[0];
            if (first && typeof first === 'object' && 'departamento' in first && Array.isArray(first.ciudades)) {
              flat = data.flatMap((d: any) => d.ciudades.map((n: string) => ({ name: n, department: d.departamento, isPrincipal: false })));
            } else if (first && typeof first === 'object' && 'name' in first && 'department' in first) {
              flat = data as City[];
            }
          }

          if (flat.length > 0) {
            municipiosRef.current = flat;
            const normalized = q.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
            const found = flat.filter((c) =>
              c.name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().includes(normalized) ||
              c.department.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().includes(normalized)
            );
            setFilteredCities(found.slice(0, 50));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingMunicipios(false));
    }
  }, [searchQuery]);

  const handleSelect = (cityName: string, departmentName?: string) => {
    const formatted = departmentName ? `${cityName}, ${departmentName}` : cityName;
    onChange(formatted);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange('');
    setSearchQuery('');
  };

  const displayValue = !value || value === 'Todas' ? '' : value;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botón Trigger de Selección */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
            if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm text-left flex items-center justify-between hover:border-neutral-700 transition-all cursor-pointer shadow-sm"
      >
        <span className="flex items-center gap-2.5 truncate">
          <MapPin className="w-4 h-4 text-lime-400 flex-shrink-0" />
          {displayValue ? (
            <span className="text-white font-medium truncate">{displayValue}</span>
          ) : (
            <span className="text-neutral-500">{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {displayValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Limpiar ubicación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Menú Desplegable con Buscador */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden max-h-80 flex flex-col">
          {/* Input de Búsqueda */}
          <div className="p-3 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-sm sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe municipio o departamento..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
              />
            </div>
          </div>

          {/* Lista Scrolleable de Opciones */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {searchQuery.trim().length > 0 ? (
              <>
                {loadingMunicipios && (
                  <div className="px-3 py-2 text-xs text-neutral-400 animate-pulse">Cargando municipios...</div>
                )}

                {filteredCities.length > 0 ? (
                  <>
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      {filteredCities.length} municipio{filteredCities.length !== 1 ? 's' : ''} encontrado{filteredCities.length !== 1 ? 's' : ''}
                    </div>
                    {filteredCities.map((city, idx) => (
                      <button
                        key={`${city.name}-${city.department}-${idx}`}
                        type="button"
                        onClick={() => handleSelect(city.name, city.department)}
                        className={`w-full px-3 py-2 text-left rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          value.includes(city.name) 
                            ? 'bg-lime-500/15 text-lime-400 font-bold border border-lime-500/30' 
                            : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{city.name}</span>
                          <span className="text-[10px] text-neutral-400">{city.department}</span>
                        </div>
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 opacity-60" />
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-6 text-center text-xs text-neutral-400 space-y-1">
                    <Search className="w-6 h-6 mx-auto text-neutral-500 opacity-60 mb-1" />
                    <p className="font-semibold text-neutral-300">No se encontraron municipios</p>
                    <p className="text-[10px] text-neutral-400">Verifica la ortografía o busca por departamento</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Ciudades y Capitales Principales
                </div>
                {CIUDADES_COLOMBIA.filter(c => c.isPrincipal).map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSelect(city.name, city.department)}
                    className={`w-full px-3 py-2 text-left rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      value.includes(city.name) 
                        ? 'bg-lime-500/15 text-lime-400 font-bold border border-lime-500/30' 
                        : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-lime-400" />
                      <div>
                        <span className="font-semibold">{city.name}</span>
                        <span className="text-[10px] text-neutral-400 ml-1">({city.department})</span>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
