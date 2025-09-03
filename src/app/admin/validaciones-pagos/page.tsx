"use client";
import React, { useEffect, useState } from "react";
import { ShieldCheck, Clock, CheckCircle } from "lucide-react";

type Pago = {
  id: string;
  pedidoId: string;
  compradorId: string;
  agricultorId: string;
  monto: string;
  fecha: string;
  metodo: string;
  estado: string;
  comprobanteUrl?: string;
};

export default function ValidacionesPage() {
  const [pendientes, setPendientes] = useState<Pago[]>([]);
  const [validados, setValidados] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar pagos
  const fetchPagos = async () => {
    setLoading(true);
    try {
      const [pendRes, valRes] = await Promise.all([
        fetch("/api/admin/pagos-validaciones?estado=PENDIENTE"),
        fetch("/api/admin/pagos-validaciones?estado=VERIFICADO"),
      ]);
      const pend = pendRes.ok ? await pendRes.json() : { pagos: [] };
      const val = valRes.ok ? await valRes.json() : { pagos: [] };
      setPendientes(pend.pagos || []);
      setValidados(val.pagos || []);
    } catch (e) {
      setPendientes([]);
      setValidados([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  // Validar pago
  const validarPago = async (id: string) => {
    await fetch(`/api/pagos/${id}`, { method: "PATCH" });
    fetchPagos(); // Refresca la lista
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="text-[var(--accent-2)]" size={32} />
        Validaciones
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pendientes de validación */}
        <section className="bg-[#232a34] rounded-xl p-6 shadow-lg border border-[var(--accent)]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="text-yellow-400" size={22} /> Pendientes de validación
          </h2>
          {loading ? (
            <div className="text-gray-400">Cargando...</div>
          ) : pendientes.length === 0 ? (
            <div className="text-gray-400">No hay pagos pendientes.</div>
          ) : (
            <ul className="space-y-3">
              {pendientes.map((pago) => (
                <li key={pago.id} className="bg-[#232a34] border border-yellow-700 rounded-lg p-4 flex flex-col gap-1">
                  <span className="font-semibold text-yellow-300">Pedido: {pago.pedidoId}</span>
                  <span>Monto: <b>${pago.monto}</b></span>
                  <span>Método: {pago.metodo}</span>
                  <span>Fecha: {new Date(pago.fecha).toLocaleString()}</span>
                  {pago.comprobanteUrl && (
                    <a href={pago.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline">Ver comprobante</a>
                  )}
                  <button
                    className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 w-fit"
                    onClick={() => validarPago(pago.id)}
                  >
                    <CheckCircle size={18} /> Validar pago
                  </button>
                  <span className="text-xs text-gray-400">Estado: {pago.estado}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Pagos validados */}
        <section className="bg-[#232a34] rounded-xl p-6 shadow-lg border border-[var(--accent-2)]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-green-400" size={22} /> Pagos validados
          </h2>
          {loading ? (
            <div className="text-gray-400">Cargando...</div>
          ) : validados.length === 0 ? (
            <div className="text-gray-400">No hay pagos validados.</div>
          ) : (
            <ul className="space-y-3">
              {validados.map((pago) => (
                <li key={pago.id} className="bg-[#232a34] border border-green-700 rounded-lg p-4 flex flex-col gap-1">
                  <span className="font-semibold text-green-300">Pedido: {pago.pedidoId}</span>
                  <span>Monto: <b>${pago.monto}</b></span>
                  <span>Método: {pago.metodo}</span>
                  <span>Fecha: {new Date(pago.fecha).toLocaleString()}</span>
                  {pago.comprobanteUrl && (
                    <a href={pago.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline">Ver comprobante</a>
                  )}
                  <span className="text-xs text-gray-400">Estado: {pago.estado}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
