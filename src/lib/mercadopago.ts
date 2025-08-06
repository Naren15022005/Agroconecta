import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración inicial de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000, idempotencyKey: 'abc' }
});

const preference = new Preference(client);

export interface PaymentItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface PaymentPreferenceOptions {
  items: PaymentItem[];
  payer: {
    name: string;
    email: string;
    phone?: {
      area_code: string;
      number: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  notification_url: string;
  external_reference: string; // ID del pedido
  payment_methods: {
    excluded_payment_methods: Array<{ id: string }>;
    excluded_payment_types: Array<{ id: string }>;
    installments: number;
  };
}

export class MercadoPagoService {
  static async createPreference(options: PaymentPreferenceOptions) {
    try {
      const preferenceData = {
        items: options.items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'COP'
        })),
        payer: options.payer,
        back_urls: options.back_urls,
        auto_return: options.auto_return,
        notification_url: options.notification_url,
        external_reference: options.external_reference,
        payment_methods: options.payment_methods,
        statement_descriptor: 'AgroConecta',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      };

      const result = await preference.create({ body: preferenceData });
      return result;
    } catch (error) {
      console.error('Error creando preferencia de pago:', error);
      throw error;
    }
  }

  static async getPayment(paymentId: string) {
    try {
      // Implementar cuando sea necesario consultar un pago específico
      return null;
    } catch (error) {
      console.error('Error obteniendo información del pago:', error);
      throw error;
    }
  }
}

export default MercadoPagoService;
