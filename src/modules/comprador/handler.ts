// Handlers para endpoints de Comprador (API Next.js)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { CompradorController } from "./controller";

const controller = new CompradorController();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const compradorId = searchParams.get("compradorId");
  const carrito = searchParams.get("carrito");

  if (!compradorId) return NextResponse.json({ error: "compradorId requerido" }, { status: 400 });

  if (carrito === "true") {
    const result = await controller.listarCarrito(compradorId);
    return NextResponse.json(result);
  }
  const pedidos = await controller.listarPedidosPorComprador(compradorId);
  return NextResponse.json(pedidos);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const { compradorId } = data;
  if (!compradorId) return NextResponse.json({ error: "compradorId requerido" }, { status: 400 });
  const result = await controller.actualizarPerfil(compradorId, data);
  return NextResponse.json(result);
}
