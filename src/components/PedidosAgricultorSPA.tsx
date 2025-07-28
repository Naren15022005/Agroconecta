"use client";
import { useState, useEffect } from "react";

// Tipos base para demo, luego se pueden importar de types/
interface Pedido {
  id: string;
  comprador: string;
  producto: string;
  fecha: string;
  estado: "pendiente" | "aceptado" | "rechazado" | "en_camino" | "entregado";
}

const estadosCrud = [
  { key: "aceptado", label: "Aceptados" },
  { key: "rechazado", label: "Rechazados" },
  { key: "en_camino", label: "En Camino" },
  { key: "entregado", label: "Entregados" },
];

export default function PedidosAgricultorSPA() {
  // Demo: pedidos estáticos, luego se conecta a API
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: "00123",
      comprador: "Juan Pérez",
      producto: "10kg de Tomate",
      fecha: "25 de Julio, 2025",
      estado: "pendiente",
    },
    {
      id: "00122",
      comprador: "AgroDistribuidora S.A.",
      producto: "20kg de Cacao seco",
      fecha: "20 de Julio, 2025",
      estado: "entregado",
    },
    {
      id: "00121",
      comprador: "María López",
      producto: "5kg de Papa criolla",
      fecha: "18 de Julio, 2025",
      estado: "aceptado",
    },
    {
      id: "00120",
      comprador: "Supermercado El Campo",
      producto: "15kg de Yuca",
      fecha: "15 de Julio, 2025",
      estado: "rechazado",
    },
  ]);
  const [filtroCrud, setFiltroCrud] = useState("aceptado");

  // Acciones de aceptar/rechazar
  const aceptarPedido = (id: string) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: "aceptado" } : p))
    );
  };
  const rechazarPedido = (id: string) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: "rechazado" } : p))
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Columna izquierda: pedidos pendientes */}
      <div className="md:w-1/2 w-full">
        <h2 className="text-xl font-bold mb-4">Pedidos nuevos</h2>
        <div className="space-y-4">
          {pedidos.filter((p) => p.estado === "pendiente").length === 0 ? (
            <div className="text-gray-400 text-center py-8">No hay pedidos nuevos</div>
          ) : (
            pedidos
              .filter((p) => p.estado === "pendiente")
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-400 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">#Pedido {p.id}</h3>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                      Pendiente
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      <b>Comprador:</b> {p.comprador}
                    </div>
                    <div>
                      <b>Producto:</b> {p.producto}
                    </div>
                    <div>
                      <b>Fecha:</b> {p.fecha}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                      onClick={() => aceptarPedido(p.id)}
                    >
                      Aceptar
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                      onClick={() => rechazarPedido(p.id)}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      {/* Columna derecha: CRUD de pedidos */}
      <div className="md:w-1/2 w-full">
        <h2 className="text-xl font-bold mb-4">Gestión de pedidos</h2>
        <div className="flex gap-2 mb-4">
          {estadosCrud.map((e) => (
            <button
              key={e.key}
              className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors duration-150 ${
                filtroCrud === e.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
              }`}
              onClick={() => setFiltroCrud(e.key)}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {pedidos.filter((p) => p.estado === filtroCrud).length === 0 ? (
            <div className="text-gray-400 text-center py-8">No hay pedidos en esta categoría</div>
          ) : (
            pedidos
              .filter((p) => p.estado === filtroCrud)
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">#Pedido {p.id}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold capitalize">
                      {filtroCrud}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      <b>Comprador:</b> {p.comprador}
                    </div>
                    <div>
                      <b>Producto:</b> {p.producto}
                    </div>
                    <div>
                      <b>Fecha:</b> {p.fecha}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
