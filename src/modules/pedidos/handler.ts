// Handlers para endpoints de pedidos (API Next.js)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { PedidosController } from "./controller";

const controller = new PedidosController();

function validarPedido(data: any) {
  if (!data.buyerId || typeof data.buyerId !== "string") return "buyerId requerido";
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) return "Items requeridos";
  if (!data.total || typeof data.total !== "number") return "Total requerido";
  if (!data.address || typeof data.address !== "string") return "Dirección requerida";
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get("buyerId");
  const id = searchParams.get("id");

  if (id) {
    const pedido = await controller.buscarPorId(id);
    return NextResponse.json(pedido);
  }
  if (buyerId) {
    const pedidos = await controller.listarPorUsuario(buyerId);
    return NextResponse.json(pedidos);
  }
  const pedidos = await controller.listarTodos();
  return NextResponse.json(pedidos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const error = validarPedido(data);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const pedido = await controller.crearPedido(data);
  return NextResponse.json(pedido);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const error = validarPedido(data);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const pedido = await controller.actualizarPedido(id, data);
  return NextResponse.json(pedido);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const pedido = await controller.eliminarPedido(id);
  return NextResponse.json(pedido);
}
