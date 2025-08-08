"use client";
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, CreditCard, Truck, MapPin, Phone, User, Clock } from 'lucide-react';

export default function CheckoutPage() {
  const cart = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Entrega, 2: Pago, 3: Confirmación
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para los datos del checkout
  const [deliveryMethod, setDeliveryMethod] = useState('ENTREGA_DIRECTA');
  const [paymentMethod, setPaymentMethod] = useState('CONTRAENTREGA');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center text-gray-500 py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="mb-6">Agrega algunos productos antes de proceder al checkout</p>
          <button
            onClick={() => router.push('/comprador/mercado')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Ir al mercado
          </button>
        </div>
      </div>
    );
  }

  const groupedByFarmer = cart.items.reduce((acc, item) => {
    if (!acc[item.campesinoId]) {
      acc[item.campesinoId] = {
        farmerName: item.campesinoName,
        items: [],
        total: 0
      };
    }
    acc[item.campesinoId].items.push(item);
    acc[item.campesinoId].total += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { farmerName: string; items: any[]; total: number }>);

  const handleProcessOrder = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const allItems = cart.items.map(item => ({
        productoId: item.id,
        nombre: item.name,
        cantidad: item.quantity,
        precioUnitario: item.price,
        agricultorId: item.campesinoId,
        stockDisponible: item.stock,
        metodoEntrega: deliveryMethod,
        metodoPago: paymentMethod,
        direccionEntrega: deliveryAddress,
        telefonoContacto: contactPhone,
        fechaEntrega: deliveryDate,
        horaEntrega: deliveryTime,
        instruccionesEspeciales: specialInstructions,
      }));

      const response = await fetch('/api/carrito/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: allItems }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || 'Error al procesar el pedido.');
        return;
      }

      cart.clearCart();
      setSuccess('¡Pedido realizado exitosamente! Pronto recibirás notificaciones.');
      setTimeout(() => router.push('/comprador/pedidos'), 2000);
    } catch (e) {
      setError('Error inesperado al procesar el pedido. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceedToPayment = deliveryMethod && deliveryAddress && contactPhone;
  const canProceedToConfirmation = paymentMethod;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-green-700">Finalizar Compra</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}>
            3
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Delivery Information */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Truck size={24} className="text-green-600" />
                Información de Entrega
              </h2>

              {/* Delivery Method */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Método de Entrega</label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="ENTREGA_DIRECTA"
                      checked={deliveryMethod === 'ENTREGA_DIRECTA'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold">Entrega Directa</div>
                      <div className="text-sm text-gray-500">El agricultor entrega directamente en tu ubicación</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="PUNTO_ENCUENTRO"
                      checked={deliveryMethod === 'PUNTO_ENCUENTRO'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold">Punto de Encuentro</div>
                      <div className="text-sm text-gray-500">Nos encontramos en un lugar acordado</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="EMPRESA_TRANSPORTADORA"
                      checked={deliveryMethod === 'EMPRESA_TRANSPORTADORA'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold">Empresa Transportadora</div>
                      <div className="text-sm text-gray-500">Envío a través de servicio de transporte (+$5,000)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Dirección de Entrega
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Ingresa tu dirección completa o punto de encuentro"
                  className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                  required
                />
              </div>

              {/* Contact Phone */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="300 123 4567"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Delivery Date and Time */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Fecha Preferida
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Hora Preferida</label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Selecciona una hora</option>
                    <option value="06:00-08:00">6:00 AM - 8:00 AM</option>
                    <option value="08:00-10:00">8:00 AM - 10:00 AM</option>
                    <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                    <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                    <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                    <option value="18:00-20:00">6:00 PM - 8:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Instrucciones Especiales (Opcional)</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="¿Hay alguna instrucción especial para la entrega?"
                  className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedToPayment}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continuar al Pago
              </button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-green-600" />
                Método de Pago
              </h2>

              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CONTRAENTREGA"
                    checked={paymentMethod === 'CONTRAENTREGA'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Pago Contra Entrega</div>
                    <div className="text-sm text-gray-500">Paga cuando recibas tu pedido en efectivo</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="TRANSFERENCIA"
                    checked={paymentMethod === 'TRANSFERENCIA'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Transferencia Bancaria</div>
                    <div className="text-sm text-gray-500">Transfiere a nuestra cuenta y adjunta el comprobante</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="NEQUI"
                    checked={paymentMethod === 'NEQUI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Nequi</div>
                    <div className="text-sm text-gray-500">Pago rápido y seguro por Nequi</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DAVIPLATA"
                    checked={paymentMethod === 'DAVIPLATA'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Daviplata</div>
                    <div className="text-sm text-gray-500">Pago a través de la app Daviplata</div>
                  </div>
                </label>
              </div>

              {/* Payment Information */}
              {paymentMethod !== 'CONTRAENTREGA' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">Información de Pago</h3>
                  <div className="text-sm text-blue-700">
                    {paymentMethod === 'TRANSFERENCIA' && (
                      <div>
                        <p className="mb-2"><strong>Banco:</strong> Bancolombia</p>
                        <p className="mb-2"><strong>Cuenta Ahorros:</strong> 123-456-789-01</p>
                        <p className="mb-2"><strong>Titular:</strong> AgroConecta SAS</p>
                        <p className="text-xs">Después del pago, adjunta el comprobante en el chat del pedido.</p>
                      </div>
                    )}
                    {paymentMethod === 'NEQUI' && (
                      <div>
                        <p className="mb-2"><strong>Número Nequi:</strong> 300 123 4567</p>
                        <p className="mb-2"><strong>Nombre:</strong> AgroConecta</p>
                        <p className="text-xs">Después del pago, adjunta la captura en el chat del pedido.</p>
                      </div>
                    )}
                    {paymentMethod === 'DAVIPLATA' && (
                      <div>
                        <p className="mb-2"><strong>Número Daviplata:</strong> 300 987 6543</p>
                        <p className="mb-2"><strong>Nombre:</strong> AgroConecta</p>
                        <p className="text-xs">Después del pago, adjunta la captura en el chat del pedido.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Volver
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedToConfirmation}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Revisar Pedido
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Confirmation */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User size={24} className="text-green-600" />
                Confirmar Pedido
              </h2>

              {/* Order Summary */}
              <div className="space-y-4 mb-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Información de Entrega</h3>
                  <p className="text-sm"><strong>Método:</strong> {
                    deliveryMethod === 'ENTREGA_DIRECTA' ? 'Entrega Directa' :
                    deliveryMethod === 'PUNTO_ENCUENTRO' ? 'Punto de Encuentro' :
                    'Empresa Transportadora'
                  }</p>
                  <p className="text-sm"><strong>Dirección:</strong> {deliveryAddress}</p>
                  <p className="text-sm"><strong>Teléfono:</strong> {contactPhone}</p>
                  {deliveryDate && <p className="text-sm"><strong>Fecha:</strong> {deliveryDate}</p>}
                  {deliveryTime && <p className="text-sm"><strong>Hora:</strong> {deliveryTime}</p>}
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Método de Pago</h3>
                  <p className="text-sm">{
                    paymentMethod === 'CONTRAENTREGA' ? 'Pago Contra Entrega' :
                    paymentMethod === 'TRANSFERENCIA' ? 'Transferencia Bancaria' :
                    paymentMethod === 'NEQUI' ? 'Nequi' :
                    'Daviplata'
                  }</p>
                </div>
              </div>

              {error && <div className="text-red-600 mb-4">{error}</div>}
              {success && <div className="text-green-600 mb-4">{success}</div>}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={isProcessing}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  onClick={handleProcessOrder}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 sticky top-4">
            <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>
            
            {Object.entries(groupedByFarmer).map(([farmerId, group]) => (
              <div key={farmerId} className="mb-6 last:mb-0">
                <h4 className="font-semibold text-green-700 mb-2">{group.farmerName}</h4>
                <div className="space-y-2 mb-3">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>${group.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {deliveryMethod === 'EMPRESA_TRANSPORTADORA' && (
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Costo de envío</span>
                  <span>$5,000</span>
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-xl font-bold text-green-700">
                <span>Total</span>
                <span>${(cart.getTotalPrice() + (deliveryMethod === 'EMPRESA_TRANSPORTADORA' ? 5000 : 0)).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Los precios incluyen IVA cuando aplique
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
