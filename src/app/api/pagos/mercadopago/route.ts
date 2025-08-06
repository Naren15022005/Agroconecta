import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MercadoPagoService from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { pedidoId } = await req.json();

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'ID del pedido requerido' },
        { status: 400 }
      );
    }

    // Buscar el pedido
    const pedido = await prisma.order.findUnique({
      where: { id: pedidoId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        buyer: true
      }
    });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea el comprador del pedido
    if (pedido.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para este pedido' },
        { status: 403 }
      );
    }

    // Verificar que el pedido esté en estado CONFIRMADO y método de pago sea MERCADOPAGO
    if (pedido.status !== 'CONFIRMADO' || pedido.paymentMethod !== 'MERCADOPAGO') {
      return NextResponse.json(
        { error: 'El pedido no está disponible para pago con Mercado Pago' },
        { status: 400 }
      );
    }

    // Preparar items para Mercado Pago
    const items = pedido.items.map((item: any) => ({
      id: item.product.id.toString(),
      title: `${item.product.name} - ${item.product.unit}`,
      quantity: item.quantity,
      unit_price: parseFloat(item.price.toString()),
      currency_id: 'COP'
    }));

    // URLs de retorno
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const preferenceOptions = {
      items,
      payer: {
        name: pedido.buyer.nombre || 'Usuario AgroConecta',
        email: pedido.buyer.correo
      },
      back_urls: {
        success: `${baseUrl}/comprador/pedidos?payment=success&order=${pedidoId}`,
        failure: `${baseUrl}/comprador/pedidos?payment=failure&order=${pedidoId}`,
        pending: `${baseUrl}/comprador/pedidos?payment=pending&order=${pedidoId}`
      },
      auto_return: 'approved' as const,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      external_reference: pedidoId,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    };

    // Crear preferencia en Mercado Pago
    const preference = await MercadoPagoService.createPreference(preferenceOptions);

    // Guardar la preferencia ID en el pedido para referencia
    await prisma.order.update({
      where: { id: pedidoId },
      data: {
        mercadoPagoPreferenceId: preference.id
      }
    });

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point
    });

  } catch (error) {
    console.error('Error creando preferencia de pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
