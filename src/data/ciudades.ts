export interface City {
  name: string;
  department: string;
  isPrincipal: boolean;
}

// Ciudades principales de Colombia (capitales y ciudades grandes)
export const CIUDADES_PRINCIPALES = [
  'Bogotá',
  'Medellín', 
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
  'Santa Marta',
  'Cúcuta',
  'Ibagué',
  'Manizales',
  'Villavicencio',
  'Pasto',
  'Montería',
  'Valledupar',
  'Armenia'
];

// Lista completa de ciudades de Colombia organizadas por departamento
export const CIUDADES_COLOMBIA: City[] = [
  // Amazonas
  { name: 'Leticia', department: 'Amazonas', isPrincipal: false },
  { name: 'Puerto Nariño', department: 'Amazonas', isPrincipal: false },
  
  // Antioquia
  { name: 'Medellín', department: 'Antioquia', isPrincipal: true },
  { name: 'Bello', department: 'Antioquia', isPrincipal: false },
  { name: 'Itagüí', department: 'Antioquia', isPrincipal: false },
  { name: 'Envigado', department: 'Antioquia', isPrincipal: false },
  { name: 'Apartadó', department: 'Antioquia', isPrincipal: false },
  { name: 'Turbo', department: 'Antioquia', isPrincipal: false },
  { name: 'Rionegro', department: 'Antioquia', isPrincipal: false },
  { name: 'Caucasia', department: 'Antioquia', isPrincipal: false },
  { name: 'Sabaneta', department: 'Antioquia', isPrincipal: false },
  { name: 'La Estrella', department: 'Antioquia', isPrincipal: false },
  { name: 'Caldas', department: 'Antioquia', isPrincipal: false },
  { name: 'Copacabana', department: 'Antioquia', isPrincipal: false },
  { name: 'Marinilla', department: 'Antioquia', isPrincipal: false },
  { name: 'La Ceja', department: 'Antioquia', isPrincipal: false },
  { name: 'El Carmen de Viboral', department: 'Antioquia', isPrincipal: false },
  { name: 'Chigorodó', department: 'Antioquia', isPrincipal: false },
  { name: 'Necoclí', department: 'Antioquia', isPrincipal: false },
  { name: 'Santa Fe de Antioquia', department: 'Antioquia', isPrincipal: false },
  
  // Arauca
  { name: 'Arauca', department: 'Arauca', isPrincipal: false },
  { name: 'Tame', department: 'Arauca', isPrincipal: false },
  { name: 'Saravena', department: 'Arauca', isPrincipal: false },
  
  // Atlántico
  { name: 'Barranquilla', department: 'Atlántico', isPrincipal: true },
  { name: 'Soledad', department: 'Atlántico', isPrincipal: false },
  { name: 'Malambo', department: 'Atlántico', isPrincipal: false },
  { name: 'Sabanalarga', department: 'Atlántico', isPrincipal: false },
  { name: 'Puerto Colombia', department: 'Atlántico', isPrincipal: false },
  { name: 'Galapa', department: 'Atlántico', isPrincipal: false },
  
  // Bogotá D.C.
  { name: 'Bogotá', department: 'Bogotá D.C.', isPrincipal: true },
  
  // Bolívar
  { name: 'Cartagena', department: 'Bolívar', isPrincipal: true },
  { name: 'Magangué', department: 'Bolívar', isPrincipal: false },
  { name: 'Turbaco', department: 'Bolívar', isPrincipal: false },
  { name: 'Arjona', department: 'Bolívar', isPrincipal: false },
  { name: 'El Carmen de Bolívar', department: 'Bolívar', isPrincipal: false },
  { name: 'Santa Rosa del Sur', department: 'Bolívar', isPrincipal: false },
  
  // Boyacá
  { name: 'Tunja', department: 'Boyacá', isPrincipal: false },
  { name: 'Duitama', department: 'Boyacá', isPrincipal: false },
  { name: 'Sogamoso', department: 'Boyacá', isPrincipal: false },
  { name: 'Chiquinquirá', department: 'Boyacá', isPrincipal: false },
  { name: 'Moniquirá', department: 'Boyacá', isPrincipal: false },
  { name: 'Villa de Leyva', department: 'Boyacá', isPrincipal: false },
  { name: 'Nobsa', department: 'Boyacá', isPrincipal: false },
  { name: 'Paipa', department: 'Boyacá', isPrincipal: false },
  
  // Caldas
  { name: 'Manizales', department: 'Caldas', isPrincipal: true },
  { name: 'La Dorada', department: 'Caldas', isPrincipal: false },
  { name: 'Chinchiná', department: 'Caldas', isPrincipal: false },
  { name: 'Villamaría', department: 'Caldas', isPrincipal: false },
  { name: 'Riosucio', department: 'Caldas', isPrincipal: false },
  
  // Caquetá
  { name: 'Florencia', department: 'Caquetá', isPrincipal: false },
  { name: 'San Vicente del Caguán', department: 'Caquetá', isPrincipal: false },
  { name: 'Puerto Rico', department: 'Caquetá', isPrincipal: false },
  
  // Casanare
  { name: 'Yopal', department: 'Casanare', isPrincipal: false },
  { name: 'Aguazul', department: 'Casanare', isPrincipal: false },
  { name: 'Villanueva', department: 'Casanare', isPrincipal: false },
  
  // Cauca
  { name: 'Popayán', department: 'Cauca', isPrincipal: false },
  { name: 'Santander de Quilichao', department: 'Cauca', isPrincipal: false },
  { name: 'Puerto Tejada', department: 'Cauca', isPrincipal: false },
  { name: 'Piendamó', department: 'Cauca', isPrincipal: false },
  
  // Cesar
  { name: 'Valledupar', department: 'Cesar', isPrincipal: true },
  { name: 'Aguachica', department: 'Cesar', isPrincipal: false },
  { name: 'Bosconia', department: 'Cesar', isPrincipal: false },
  { name: 'Codazzi', department: 'Cesar', isPrincipal: false },
  { name: 'La Paz', department: 'Cesar', isPrincipal: false },
  
  // Chocó
  { name: 'Quibdó', department: 'Chocó', isPrincipal: false },
  { name: 'Istmina', department: 'Chocó', isPrincipal: false },
  { name: 'Condoto', department: 'Chocó', isPrincipal: false },
  
  // Córdoba
  { name: 'Montería', department: 'Córdoba', isPrincipal: true },
  { name: 'Cereté', department: 'Córdoba', isPrincipal: false },
  { name: 'Lorica', department: 'Córdoba', isPrincipal: false },
  { name: 'Sahagún', department: 'Córdoba', isPrincipal: false },
  { name: 'Tierralta', department: 'Córdoba', isPrincipal: false },
  
  // Cundinamarca
  { name: 'Soacha', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Facatativá', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Zipaquirá', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Chía', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Girardot', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Fusagasugá', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Madrid', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Mosquera', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Funza', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Cajicá', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Cota', department: 'Cundinamarca', isPrincipal: false },
  { name: 'La Calera', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Tenjo', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Sopó', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Tocancipá', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Villeta', department: 'Cundinamarca', isPrincipal: false },
  { name: 'Tabio', department: 'Cundinamarca', isPrincipal: false },
  
  // Guainía
  { name: 'Inírida', department: 'Guainía', isPrincipal: false },
  
  // Guaviare
  { name: 'San José del Guaviare', department: 'Guaviare', isPrincipal: false },
  
  // Huila
  { name: 'Neiva', department: 'Huila', isPrincipal: true },
  { name: 'Pitalito', department: 'Huila', isPrincipal: false },
  { name: 'Garzón', department: 'Huila', isPrincipal: false },
  { name: 'La Plata', department: 'Huila', isPrincipal: false },
  { name: 'Campoalegre', department: 'Huila', isPrincipal: false },
  
  // La Guajira
  { name: 'Riohacha', department: 'La Guajira', isPrincipal: false },
  { name: 'Maicao', department: 'La Guajira', isPrincipal: false },
  { name: 'Uribia', department: 'La Guajira', isPrincipal: false },
  { name: 'Manaure', department: 'La Guajira', isPrincipal: false },
  
  // Magdalena
  { name: 'Santa Marta', department: 'Magdalena', isPrincipal: true },
  { name: 'Ciénaga', department: 'Magdalena', isPrincipal: false },
  { name: 'Fundación', department: 'Magdalena', isPrincipal: false },
  { name: 'El Banco', department: 'Magdalena', isPrincipal: false },
  { name: 'Plato', department: 'Magdalena', isPrincipal: false },
  
  // Meta
  { name: 'Villavicencio', department: 'Meta', isPrincipal: true },
  { name: 'Acacías', department: 'Meta', isPrincipal: false },
  { name: 'Granada', department: 'Meta', isPrincipal: false },
  { name: 'Puerto López', department: 'Meta', isPrincipal: false },
  { name: 'San Martín', department: 'Meta', isPrincipal: false },
  
  // Nariño
  { name: 'Pasto', department: 'Nariño', isPrincipal: true },
  { name: 'Ipiales', department: 'Nariño', isPrincipal: false },
  { name: 'Tumaco', department: 'Nariño', isPrincipal: false },
  { name: 'Túquerres', department: 'Nariño', isPrincipal: false },
  { name: 'Samaniego', department: 'Nariño', isPrincipal: false },
  
  // Norte de Santander
  { name: 'Cúcuta', department: 'Norte de Santander', isPrincipal: true },
  { name: 'Villa del Rosario', department: 'Norte de Santander', isPrincipal: false },
  { name: 'Los Patios', department: 'Norte de Santander', isPrincipal: false },
  { name: 'Ocaña', department: 'Norte de Santander', isPrincipal: false },
  { name: 'Pamplona', department: 'Norte de Santander', isPrincipal: false },
  
  // Putumayo
  { name: 'Mocoa', department: 'Putumayo', isPrincipal: false },
  { name: 'Puerto Asís', department: 'Putumayo', isPrincipal: false },
  { name: 'Orito', department: 'Putumayo', isPrincipal: false },
  
  // Quindío
  { name: 'Armenia', department: 'Quindío', isPrincipal: true },
  { name: 'Calarcá', department: 'Quindío', isPrincipal: false },
  { name: 'La Tebaida', department: 'Quindío', isPrincipal: false },
  { name: 'Montenegro', department: 'Quindío', isPrincipal: false },
  { name: 'Quimbaya', department: 'Quindío', isPrincipal: false },
  
  // Risaralda
  { name: 'Pereira', department: 'Risaralda', isPrincipal: true },
  { name: 'Dosquebradas', department: 'Risaralda', isPrincipal: false },
  { name: 'Santa Rosa de Cabal', department: 'Risaralda', isPrincipal: false },
  { name: 'La Virginia', department: 'Risaralda', isPrincipal: false },
  { name: 'Marsella', department: 'Risaralda', isPrincipal: false },
  
  // San Andrés y Providencia
  { name: 'San Andrés', department: 'San Andrés y Providencia', isPrincipal: false },
  { name: 'Providencia', department: 'San Andrés y Providencia', isPrincipal: false },
  
  // Santander
  { name: 'Bucaramanga', department: 'Santander', isPrincipal: true },
  { name: 'Floridablanca', department: 'Santander', isPrincipal: false },
  { name: 'Girón', department: 'Santander', isPrincipal: false },
  { name: 'Piedecuesta', department: 'Santander', isPrincipal: false },
  { name: 'Barrancabermeja', department: 'Santander', isPrincipal: false },
  { name: 'San Gil', department: 'Santander', isPrincipal: false },
  { name: 'Socorro', department: 'Santander', isPrincipal: false },
  { name: 'Barbosa', department: 'Santander', isPrincipal: false },
  
  // Sucre
  { name: 'Sincelejo', department: 'Sucre', isPrincipal: false },
  { name: 'Corozal', department: 'Sucre', isPrincipal: false },
  { name: 'San Marcos', department: 'Sucre', isPrincipal: false },
  
  // Tolima
  { name: 'Ibagué', department: 'Tolima', isPrincipal: true },
  { name: 'Espinal', department: 'Tolima', isPrincipal: false },
  { name: 'Melgar', department: 'Tolima', isPrincipal: false },
  { name: 'Honda', department: 'Tolima', isPrincipal: false },
  { name: 'Chaparral', department: 'Tolima', isPrincipal: false },
  
  // Valle del Cauca
  { name: 'Cali', department: 'Valle del Cauca', isPrincipal: true },
  { name: 'Buenaventura', department: 'Valle del Cauca', isPrincipal: false },
  { name: 'Palmira', department: 'Valle del Cauca', isPrincipal: false },
  { name: 'Tuluá', department: 'Valle del Cauca', isPrincipal: false },
  { name: 'Buga', department: 'Valle del Cauca', isPrincipal: false },
  { name: 'Cartago', department: 'Valle del Cauca', isPrincipal: false },
  { name: 'Jamundí', department: 'Valle del Cauca', isPrincipal: false },
  { name: 'Yumbo', department: 'Valle del Cauca', isPrincipal: false },
  { name: 'Candelaria', department: 'Valle del Cauca', isPrincipal: false },
  { name: 'Florida', department: 'Valle del Cauca', isPrincipal: false },
  
  // Vaupés
  { name: 'Mitú', department: 'Vaupés', isPrincipal: false },
  
  // Vichada
  { name: 'Puerto Carreño', department: 'Vichada', isPrincipal: false },
  { name: 'Cumaribo', department: 'Vichada', isPrincipal: false },
];

// Función helper para obtener solo nombres de ciudades
export function getCityNames(): string[] {
  return ['Todas', ...CIUDADES_COLOMBIA.map(city => city.name)];
}

// Función para buscar ciudades
export function searchCities(query: string): City[] {
  if (!query || query === 'Todas') {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return CIUDADES_COLOMBIA.filter(city => {
    const normalizedCity = city.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedDept = city.department.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    return normalizedCity.includes(normalizedQuery) || normalizedDept.includes(normalizedQuery);
  });
}

// Función para obtener ciudades principales
export function getPrincipalCities(): City[] {
  return CIUDADES_COLOMBIA.filter(city => city.isPrincipal);
}
