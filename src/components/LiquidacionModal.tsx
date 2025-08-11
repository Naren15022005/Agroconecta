import React from 'react';
import { X, Calendar, DollarSign, User, TrendingUp, Receipt, CheckCircle } from 'lucide-react';

interface LiquidacionDetalle {
  id: string;
  agricultor: string;
  agricultorId: string;
  ventas: number;
  comision: number;
  aPagar: number;
  estado: 'pendiente' | 'sin_ventas' | 'liquidado';
  fechaLiquidacion?: string;
  numeroTransaccion?: string;
  metodoPago?: string;
  totalVentas?: number;
}

interface LiquidacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  liquidacion: LiquidacionDetalle | null;
}

export default function LiquidacionModal({ isOpen, onClose, liquidacion }: LiquidacionModalProps) {
  if (!isOpen || !liquidacion) return null;

  const formatCurrency = (amount: number) => 
    amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota'
    });
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-6" style={{background: 'rgba(0,0,0,0.6)'}}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-8 py-6 rounded-t-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Receipt size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Detalles de Liquidación</h2>
                <p className="text-emerald-100 text-sm">Información completa del pago procesado</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all duration-200"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Agricultor Info */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <User className="text-emerald-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Información del Agricultor</h3>
            </div>
            
            {/* Nombre */}
            <div className="mb-5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Nombre Completo</label>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-lg font-semibold text-gray-900">{liquidacion.agricultor}</p>
              </div>
            </div>

            {/* ID y Estado en fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">ID Agricultor</label>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <span className="text-sm font-mono text-gray-700 bg-gray-100 px-3 py-2 rounded-md border border-gray-300">
                    {liquidacion.agricultorId || 'No asignado'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Estado de Cuenta</label>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <span className={`text-sm font-semibold px-4 py-2 rounded-lg border ${
                    liquidacion.estado === 'liquidado' 
                      ? 'text-emerald-700 bg-emerald-100 border-emerald-300' 
                      : 'text-amber-700 bg-amber-100 border-amber-300'
                  }`}>
                    {liquidacion.estado === 'liquidado' ? '✓ Al día' : '⏳ Pendiente liquidación'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estado y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CheckCircle className="text-blue-600" size={20} />
                </div>
                <h4 className="font-semibold text-gray-800">Estado</h4>
              </div>
              <div className="flex justify-center">
                {liquidacion.estado === 'liquidado' ? (
                  <span className="bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-sm">
                    ✓ Liquidado
                  </span>
                ) : liquidacion.estado === 'pendiente' ? (
                  <span className="bg-amber-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-sm">
                    ⏳ Pendiente
                  </span>
                ) : (
                  <span className="bg-gray-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-sm">
                    📊 Sin Ventas
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="text-purple-600" size={20} />
                </div>
                <h4 className="font-semibold text-gray-800">Fecha de Liquidación</h4>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-gray-800">
                  {liquidacion.estado === 'liquidado' 
                    ? formatDate(liquidacion.fechaLiquidacion || new Date().toISOString())
                    : 'Pendiente de liquidación'
                  }
                </p>
                {liquidacion.estado === 'liquidado' && (
                  <p className="text-xs text-gray-500">
                    Procesado: {formatDateShort(liquidacion.fechaLiquidacion || new Date().toISOString())}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Montos */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Desglose Financiero</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Ventas Totales</label>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(liquidacion.ventas)}</p>
                <p className="text-xs text-gray-500 mt-1">Ingresos brutos generados</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-center mb-3">
                  <Receipt className="text-purple-600" size={24} />
                </div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Comisión (5%)</label>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(liquidacion.comision)}</p>
                <p className="text-xs text-gray-500 mt-1">Comisión de plataforma</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border-2 border-emerald-200">
                <div className="flex items-center justify-center mb-3">
                  <DollarSign className="text-emerald-600" size={24} />
                </div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Monto Liquidado</label>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(liquidacion.aPagar)}</p>
                <p className="text-xs text-gray-500 mt-1">Cantidad neta recibida</p>
              </div>
            </div>

            {/* Resumen adicional */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Porcentaje del agricultor:</span>
                <span className="font-semibold text-gray-800">95%</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Porcentaje de comisión:</span>
                <span className="font-semibold text-gray-800">5%</span>
              </div>
              {liquidacion.estado === 'liquidado' && (
                <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Estado del pago:</span>
                  <span className="font-semibold text-emerald-600">✓ Procesado exitosamente</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de Transacción */}
          {liquidacion.estado === 'liquidado' && (
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Receipt className="text-emerald-600" size={20} />
                </div>
                <h4 className="text-lg font-bold text-emerald-800">Información de Transacción</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800">Número de Transacción</h4>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-100">
                    <span className="font-mono text-sm text-emerald-800 font-medium tracking-wide">
                      {liquidacion.numeroTransaccion || `TXN-AGRC-USR-${liquidacion.agricultorId?.slice(-8) || 'XXXXXXXX'}-${Date.now().toString().slice(-6)}`}
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800">Método de Pago</h4>
                  </div>
                  <div className="text-lg font-semibold text-blue-700">
                    {liquidacion.metodoPago || 'Transferencia Bancaria'}
                  </div>
                </div>
              </div>
              
              {/* Detalles adicionales de la transacción */}
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <label className="text-xs text-gray-500 uppercase block mb-1">Fecha de Proceso</label>
                    <p className="font-semibold text-gray-800">
                      {formatDateShort(liquidacion.fechaLiquidacion || new Date().toISOString())}
                    </p>
                  </div>
                  <div className="text-center">
                    <label className="text-xs text-gray-500 uppercase block mb-1">Estado</label>
                    <p className="font-semibold text-emerald-600">Completado</p>
                  </div>
                  <div className="text-center">
                    <label className="text-xs text-gray-500 uppercase block mb-1">Tipo</label>
                    <p className="font-semibold text-gray-800">Liquidación Directa</p>
                  </div>
                </div>
              </div>

              {/* Nota informativa */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Nota:</strong> Los fondos fueron transferidos directamente a la billetera del agricultor. 
                  El proceso de liquidación se completó exitosamente el {formatDateShort(liquidacion.fechaLiquidacion || new Date().toISOString())}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
