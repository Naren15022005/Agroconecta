"use client";
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, CreditCard, Truck, MapPin, Phone, User, Clock, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const cart = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Entrega, 2: Pago, 3: Confirmación
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para los datos del checkout
  const [deliveryMethod, setDeliveryMethod] = useState('ENTREGA_DIRECTA');
  const [paymentMethod, setPaymentMethod] = useState('TRANSFERENCIA');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Función para manejar el cambio de método de entrega
  const handleDeliveryMethodChange = (method: string) => {
    setDeliveryMethod(method);
    
    // Si cambia a recoger en finca o mercado local, limpiar campos de dirección y fecha
    if (method === 'RECOGER_FINCA' || method === 'MERCADO_LOCAL') {
      setDeliveryAddress('');
      setDeliveryDate('');
      setDeliveryTime('');
      // Para recoger en finca, usar las instrucciones especiales para el horario
    } else {
      // Para otros métodos, limpiar las instrucciones especiales
      setSpecialInstructions('');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">🛒</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Carrito vacío</h2>
          <p className="text-gray-600 mb-8">Tu carrito está vacío. Agrega productos antes de continuar.</p>
          <button
            onClick={() => router.push('/comprador/mercado')}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Explorar productos
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

  // Obtener todos los métodos de entrega disponibles de los productos en el carrito
  const getAvailableDeliveryMethods = () => {
    const allMethods = new Set<string>();
    
    cart.items.forEach(item => {
      console.log('Producto en carrito:', item.name, 'metodosEntrega:', item.metodosEntrega);
      
      if (item.metodosEntrega) {
        try {
          // Si ya es un array, usarlo directamente
          if (Array.isArray(item.metodosEntrega)) {
            item.metodosEntrega.forEach(method => allMethods.add(method));
          } 
          // Si es un string, parsearlo
          else if (typeof item.metodosEntrega === 'string') {
            const methods = JSON.parse(item.metodosEntrega);
            if (Array.isArray(methods)) {
              methods.forEach(method => allMethods.add(method));
            }
          }
        } catch (e) {
          console.log('Error parsing metodosEntrega for item:', item.name, e);
        }
      } else {
        // Si no tiene métodos de entrega configurados, agregar por defecto "Recoger en finca"
        console.log('Producto sin métodos de entrega, agregando por defecto:', item.name);
        allMethods.add('Recoger en finca');
      }
    });
    
    console.log('Métodos de entrega disponibles:', Array.from(allMethods));
    return Array.from(allMethods);
  };

  const availableDeliveryMethods = getAvailableDeliveryMethods();

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
        body: JSON.stringify({ 
          items: allItems,
          deliveryInfo: {
            method: deliveryMethod,
            address: deliveryAddress,
            notes: specialInstructions
          },
          paymentInfo: {
            method: paymentMethod,
            details: `Teléfono: ${contactPhone}`
          }
        }),
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

  const canProceedToPayment = (() => {
    if (!deliveryMethod) return false;
    if (!contactPhone) return false;
    
    // Para métodos que requieren dirección
    if (deliveryMethod === 'ENTREGA_DIRECTA' || deliveryMethod === 'PUNTO_ENCUENTRO') {
      return !!deliveryAddress;
    }
    
    // Para recoger en finca o mercado local, solo necesita teléfono
    return true;
  })();
  const canProceedToConfirmation = paymentMethod;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
            <p className="text-gray-600 mt-1">Completa tu pedido en simples pasos</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-semibold text-lg ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}>
                {step > 1 ? <CheckCircle size={20} /> : '1'}
              </div>
              <span className="text-sm font-medium text-gray-600 mt-2">Información de Entrega</span>
            </div>
            <div className={`w-20 h-1 rounded ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-semibold text-lg ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}>
                {step > 2 ? <CheckCircle size={20} /> : '2'}
              </div>
              <span className="text-sm font-medium text-gray-600 mt-2">Método de Pago</span>
            </div>
            <div className={`w-20 h-1 rounded ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-semibold text-lg ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="text-sm font-medium text-gray-600 mt-2">Confirmación</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Information */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Truck size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Información de Entrega</h2>
                    <p className="text-gray-600 text-sm">Configura cómo y dónde recibirás tu pedido</p>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-900 mb-4">Método de Entrega</label>
                  <div className="space-y-3">
                    {availableDeliveryMethods.includes('domicilio') && (
                      <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="ENTREGA_DIRECTA"
                          checked={deliveryMethod === 'ENTREGA_DIRECTA'}
                          onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                          className="w-5 h-5 text-green-600 mr-4"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">� Entrega a Domicilio</div>
                          <div className="text-sm text-gray-600 mt-1">El agricultor entrega directamente en tu ubicación</div>
                        </div>
                      </label>
                    )}
                    
                    {availableDeliveryMethods.includes('finca') && (
                      <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="RECOGER_FINCA"
                          checked={deliveryMethod === 'RECOGER_FINCA'}
                          onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                          className="w-5 h-5 text-green-600 mr-4"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">🏡 Recoger en Finca</div>
                          <div className="text-sm text-gray-600 mt-1">Vas directamente a la finca del agricultor por tu pedido</div>
                        </div>
                      </label>
                    )}
                    
                    {availableDeliveryMethods.includes('punto') && (
                      <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="PUNTO_ENCUENTRO"
                          checked={deliveryMethod === 'PUNTO_ENCUENTRO'}
                          onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                          className="w-5 h-5 text-green-600 mr-4"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">📍 Punto de Encuentro</div>
                          <div className="text-sm text-gray-600 mt-1">Encuentro en un lugar acordado mutuamente</div>
                        </div>
                      </label>
                    )}
                    
                    {availableDeliveryMethods.includes('mercado') && (
                      <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="MERCADO_LOCAL"
                          checked={deliveryMethod === 'MERCADO_LOCAL'}
                          onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                          className="w-5 h-5 text-green-600 mr-4"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">🏪 Mercado Local</div>
                          <div className="text-sm text-gray-600 mt-1">Entrega en el mercado local de la zona</div>
                        </div>
                      </label>
                    )}
                    
                    {(availableDeliveryMethods.includes('Recoger en finca') || availableDeliveryMethods.length === 0) && (
                      <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="RECOGER_FINCA"
                          checked={deliveryMethod === 'RECOGER_FINCA'}
                          onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                          className="w-5 h-5 text-green-600 mr-4"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">🏡 Recoger en Finca (Por defecto)</div>
                          <div className="text-sm text-gray-600 mt-1">Vas directamente a la finca del agricultor por tu pedido</div>
                        </div>
                      </label>
                    )}
                    
                    {availableDeliveryMethods.length === 0 && (
                      <div className="p-5 border-2 border-gray-200 rounded-xl bg-gray-50">
                        <div className="text-center text-gray-600">
                          <div className="text-2xl mb-2">📦</div>
                          <p className="font-medium">No hay métodos de entrega disponibles</p>
                          <p className="text-sm mt-1">Los productos en tu carrito no tienen métodos de entrega configurados.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Campos condicionales según el método de entrega */}
                {deliveryMethod !== 'RECOGER_FINCA' && deliveryMethod !== 'MERCADO_LOCAL' && (
                  <>
                    {/* Address */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <MapPin size={16} className="inline mr-2" />
                        {deliveryMethod === 'ENTREGA_DIRECTA' ? 'Dirección de Entrega' : 
                         deliveryMethod === 'PUNTO_ENCUENTRO' ? 'Punto de Encuentro' :
                         'Dirección para Entrega'}
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder={deliveryMethod === 'ENTREGA_DIRECTA' 
                          ? "Ingresa tu dirección completa donde recibirás el producto" 
                          : deliveryMethod === 'PUNTO_ENCUENTRO'
                          ? "Describe el punto de encuentro acordado (ej: Parque central, frente a la iglesia, etc.)"
                          : "Ingresa tu dirección completa para la entrega"
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-24 resize-none text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-0 transition-colors"
                        required
                      />
                    </div>

                    {/* Contact Phone */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <Phone size={16} className="inline mr-2" />
                        Teléfono de Contacto
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="300 123 4567"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-0 transition-colors"
                        required
                      />
                    </div>

                    {/* Delivery Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          <Clock size={16} className="inline mr-2" />
                          Fecha Preferida
                        </label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-0 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Hora Preferida</label>
                        <select
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-0 transition-colors"
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
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Instrucciones Especiales (Opcional)</label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="¿Hay alguna instrucción especial para la entrega?"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-24 resize-none text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-0 transition-colors"
                      />
                    </div>
                  </>
                )}

                {/* Información especial para Recoger en Finca */}
                {deliveryMethod === 'RECOGER_FINCA' && (
                  <div className="mb-8">
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                      <h3 className="font-semibold text-orange-900 mb-4 text-lg">🏡 Información de Recogida en Finca</h3>
                      <p className="text-orange-800 mb-4">
                        Con esta opción visitarás directamente la finca del agricultor para recoger tu pedido. Te contactaremos con los datos del agricultor para coordinar tu visita.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-orange-900 mb-2">
                            <Phone size={16} className="inline mr-2" />
                            Tu teléfono de contacto
                          </label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="300 123 4567"
                            className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-0 transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-orange-900 mb-2">Horario preferido para la visita (Opcional)</label>
                          <textarea
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            placeholder="Ej: Prefiero ir en la mañana, entre semana, fines de semana..."
                            className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 h-20 resize-none text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-0 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToPayment}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar al Pago
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Método de Pago</h2>
                    <p className="text-gray-600 text-sm">Elige cómo quieres pagar tu pedido</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="TRANSFERENCIA"
                      checked={paymentMethod === 'TRANSFERENCIA'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-green-600 mr-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🏦 Transferencia Bancolombia</div>
                      <div className="text-sm text-gray-600 mt-1">Transfiere a nuestra cuenta Bancolombia y adjunta el comprobante</div>
                    </div>
                  </label>

                  <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-200">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="NEQUI"
                      checked={paymentMethod === 'NEQUI'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-green-600 mr-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">💜 Nequi</div>
                      <div className="text-sm text-gray-600 mt-1">Pago rápido y seguro por Nequi a nuestra cuenta</div>
                    </div>
                  </label>
                </div>

                {/* Payment Information */}
                {paymentMethod !== 'CONTRAENTREGA' && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-blue-900 mb-4 text-lg">📋 Información de Pago</h3>
                    <div className="text-sm text-blue-800">
                      {paymentMethod === 'TRANSFERENCIA' && (
                        <div className="space-y-2">
                          <p><strong>Banco:</strong> Bancolombia</p>
                          <p><strong>Cuenta Ahorros:</strong> 123-456-789-01</p>
                          <p><strong>Titular:</strong> AgroConecta SAS</p>
                          <p><strong>NIT/CC:</strong> 900.123.456-7</p>
                          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                            <p className="text-xs font-medium">💡 El pago se procesa en nuestra billetera del sistema. Después del pago, adjunta el comprobante en el chat del pedido.</p>
                          </div>
                        </div>
                      )}
                      {paymentMethod === 'NEQUI' && (
                        <div className="space-y-2">
                          <p><strong>Número Nequi:</strong> 300 123 4567</p>
                          <p><strong>Nombre:</strong> AgroConecta</p>
                          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                            <p className="text-xs font-medium">💡 El pago se procesa en nuestra billetera del sistema. Después del pago, adjunta la captura en el chat del pedido.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canProceedToConfirmation}
                    className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Revisar Pedido
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Confirmar Pedido</h2>
                    <p className="text-gray-600 text-sm">Revisa tu información antes de finalizar</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6 mb-8">
                  <div className="border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">🚛 Información de Entrega</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-700 font-medium">Método:</p>
                        <p className="font-semibold text-gray-900">{
                          deliveryMethod === 'ENTREGA_DIRECTA' ? 'Entrega a Domicilio' :
                          deliveryMethod === 'RECOGER_FINCA' ? 'Recoger en Finca' :
                          deliveryMethod === 'PUNTO_ENCUENTRO' ? 'Punto de Encuentro' :
                          deliveryMethod === 'MERCADO_LOCAL' ? 'Mercado Local' :
                          'Método de Entrega'
                        }</p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Teléfono:</p>
                        <p className="font-semibold text-gray-900">{contactPhone || 'No especificado'}</p>
                      </div>
                      {deliveryMethod !== 'RECOGER_FINCA' && deliveryMethod !== 'MERCADO_LOCAL' && (
                        <div className="md:col-span-2">
                          <p className="text-gray-700 font-medium">Dirección:</p>
                          <p className="font-semibold text-gray-900">{deliveryAddress || 'No especificada'}</p>
                        </div>
                      )}
                      {deliveryMethod === 'RECOGER_FINCA' && specialInstructions && (
                        <div className="md:col-span-2">
                          <p className="text-gray-700 font-medium">Horario preferido:</p>
                          <p className="font-semibold text-gray-900">{specialInstructions}</p>
                        </div>
                      )}
                      {deliveryDate && (
                        <div>
                          <p className="text-gray-700 font-medium">Fecha:</p>
                          <p className="font-semibold text-gray-900">{new Date(deliveryDate).toLocaleDateString('es-CO')}</p>
                        </div>
                      )}
                      {deliveryTime && (
                        <div>
                          <p className="text-gray-700 font-medium">Hora:</p>
                          <p className="font-semibold text-gray-900">{deliveryTime}</p>
                        </div>
                      )}
                      {deliveryMethod !== 'RECOGER_FINCA' && specialInstructions && (
                        <div className="md:col-span-2">
                          <p className="text-gray-700 font-medium">Instrucciones especiales:</p>
                          <p className="font-semibold text-gray-900">{specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">💳 Método de Pago</h3>
                    <p className="text-base font-semibold text-gray-900">{
                      paymentMethod === 'TRANSFERENCIA' ? '🏦 Transferencia Bancolombia' :
                      paymentMethod === 'NEQUI' ? '💜 Nequi' :
                      'Método de Pago'
                    }</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-800 font-medium">❌ {error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                    <p className="text-green-800 font-medium">✅ {success}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isProcessing}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleProcessOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? '⏳ Procesando...' : '🛒 Confirmar Pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">🛍️ Resumen del Pedido</h3>
              
              {Object.entries(groupedByFarmer).map(([farmerId, group]) => (
                <div key={farmerId} className="mb-6 last:mb-0">
                  <h4 className="font-semibold text-green-700 mb-3 text-lg">👨‍🌾 {group.farmerName}</h4>
                  <div className="space-y-3 mb-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-green-600">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t-2 border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Subtotal</span>
                      <span>${group.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {deliveryMethod === 'EMPRESA_TRANSPORTADORA' && (
                <div className="border-t-2 border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between text-sm bg-blue-50 p-3 rounded-lg">
                    <span className="text-blue-800">🚐 Costo de envío</span>
                    <span className="font-semibold text-blue-800">$5,000</span>
                  </div>
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between text-2xl font-bold text-gray-900 bg-green-50 p-4 rounded-xl">
                  <span>Total</span>
                  <span className="text-green-600">${(cart.getTotalPrice() + (deliveryMethod === 'EMPRESA_TRANSPORTADORA' ? 5000 : 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
                💡 Los precios incluyen IVA cuando aplique
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
