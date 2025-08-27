import React from "react";
import { ShieldCheck, Clock } from "lucide-react";

export default function ValidacionesPagosPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="text-[var(--accent-2)]" size={32} />
        Validaciones de pagos
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pendientes de validación */}
        <section className="bg-[#232a34] rounded-xl p-6 shadow-lg border border-[var(--accent)]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="text-yellow-400" size={22} /> Pendientes de validación
          </h2>
          <div className="text-gray-300">(Aquí se listarán los pagos pendientes de validar...)</div>
        </section>
        {/* Pagos validados */}
        <section className="bg-[#232a34] rounded-xl p-6 shadow-lg border border-[var(--accent-2)]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-green-400" size={22} /> Pagos validados
          </h2>
          <div className="text-gray-300">(Aquí se listarán los pagos ya validados...)</div>
        </section>
      </div>
    </div>
  );
}
