"use client";
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { CIUDADES_PRINCIPALES, searchCities, type City } from '@/data/ciudades';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
}

export default function CitySelector({ value, onChange, placeholder = 'Buscar ciudad...' }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [municipiosLoaded, setMunicipiosLoaded] = useState(false);
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

  // Filtrar ciudades cuando cambia la búsqueda
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length === 0) {
      setFilteredCities([])
      return
    }

    // Primero mostramos resultados rápidos desde el dataset liviano
    const quick = searchCities(q).slice(0, 50)
    setFilteredCities(quick)

    // Si no hemos cargado el archivo completo, y el término tiene al menos 2 caracteres,
    // lo cargamos en background y reemplazamos resultados por los del dataset completo.
    if (!municipiosLoaded && !municipiosRef.current && q.length >= 2) {
      setLoadingMunicipios(true)
      fetch('/data/colombia-municipios.json')
        .then((res) => {
          if (!res.ok) throw new Error('failed to fetch municipios')
          return res.json()
        })
        .then((data) => {
          // Data may be either: [{ departamento, ciudades: [...] }, ...]
          // or [{ name, department }, ...]. Normalize to flat City[]
          let flat: City[] = []
          if (Array.isArray(data) && data.length > 0) {
            const first = data[0]
            if (first && typeof first === 'object' && 'departamento' in first && Array.isArray(first.ciudades)) {
              flat = data.flatMap((d: any) => d.ciudades.map((n: string) => ({ name: n, department: d.departamento })))
            } else if (first && typeof first === 'object' && 'name' in first && 'department' in first) {
              flat = data as City[]
            }
          }

          municipiosRef.current = flat
          setMunicipiosLoaded(true)
          const normalized = q.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
          const found = flat.filter((c) =>
            c.name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().includes(normalized)
          )
          setFilteredCities(found.slice(0, 50))
        })
        .catch((err) => {
          console.error('Error loading municipios', err)
        })
        .finally(() => setLoadingMunicipios(false))
    }
  }, [searchQuery]);

  const handleSelect = (cityName: string) => {
    onChange(cityName);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange('Todas');
    setSearchQuery('');
  };

  const displayValue = value === 'Todas' ? 'Todas las ciudades' : value;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input/Trigger */}
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
        className="w-full px-3 py-2 border border-neutral-700 rounded-md bg-neutral-800 text-white text-sm text-left flex items-center justify-between hover:border-neutral-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-neutral-400" />
          <span className={value === 'Todas' ? 'text-neutral-400' : 'text-white'}>
            {displayValue}
          </span>
        </span>
        {value !== 'Todas' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 hover:bg-neutral-700 rounded transition-colors"
            aria-label="Limpiar ubicación"
          >
            <X className="w-3 h-3 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-md shadow-lg max-h-96 overflow-hidden">
          {/* Búsqueda */}
          <div className="p-2 border-b border-neutral-700 sticky top-0 bg-neutral-800">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          {/* Lista de ciudades */}
          <div className="max-h-80 overflow-y-auto">
            {/* Opción "Todas" */}
            <button
              type="button"
              onClick={() => handleSelect('Todas')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-700 transition-colors ${
                value === 'Todas' ? 'bg-neutral-700 text-lime-400' : 'text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Todas las ciudades</span>
              </div>
            </button>

            {/* Resultados de búsqueda o ciudades principales */}
            {searchQuery.trim().length > 0 ? (
              <>
                {loadingMunicipios && (
                  <div className="px-3 py-2 text-sm text-neutral-400">Cargando lugares...</div>
                )}

                {filteredCities.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-neutral-400 bg-neutral-900/50">
                      {filteredCities.length} resultado{filteredCities.length !== 1 ? 's' : ''}
                    </div>
                    {filteredCities.map((city) => (
                      <button
                        key={`${city.name}-${city.department}`}
                        type="button"
                        onClick={() => handleSelect(city.name)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-700 transition-colors ${
                          value === city.name ? 'bg-neutral-700 text-lime-400' : 'text-white'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{city.name}</span>
                          <span className="text-xs text-neutral-400">{city.department}</span>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-8 text-center text-sm text-neutral-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron ciudades</p>
                    <p className="text-xs mt-1">Intenta con otro término</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="px-3 py-2 text-xs font-medium text-neutral-400 bg-neutral-900/50">
                  Ciudades principales
                </div>
                {CIUDADES_PRINCIPALES.map((cityName) => (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => handleSelect(cityName)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-700 transition-colors ${
                      value === cityName ? 'bg-neutral-700 text-lime-400' : 'text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{cityName}</span>
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
