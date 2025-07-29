"use client";

const roles = [
  { value: '', label: 'Selecciona tu tipo de usuario' },
  { value: 'CAMPESINO', label: 'Campesino/Agricultor' },
  { value: 'CLIENTE', label: 'Cliente Individual' },
  { value: 'EMPRESA', label: 'Empresa' },
];

export default function StakeholderSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900"
      value={value}
      onChange={e => onChange(e.target.value)}
      required
      style={{ color: value ? '#111827' : '#9ca3af', backgroundColor: '#fff' }}
    >
      <option value="" disabled hidden>
        Selecciona tu tipo de usuario
      </option>
      <option value="CAMPESINO">Campesino/Agricultor</option>
      <option value="CLIENTE">Cliente Individual</option>
      <option value="EMPRESA">Empresa</option>
    </select>
  );
}
