// Handlers para endpoints de Agricultor (API Next.js)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { AgricultorController } from "./controller";

const controller = new AgricultorController();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agricultorId = searchParams.get("agricultorId");
  const pedidos = searchParams.get("pedidos");

  if (!agricultorId) return NextResponse.json({ error: "agricultorId requerido" }, { status: 400 });

  if (pedidos === "true") {
    const result = await controller.listarPedidosRecibidos(agricultorId);
    return NextResponse.json(result);
  }
  const productos = await controller.listarProductosPorAgricultor(agricultorId);
  return NextResponse.json(productos);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const { agricultorId } = data;
  if (!agricultorId) return NextResponse.json({ error: "agricultorId requerido" }, { status: 400 });
  const result = await controller.actualizarPerfil(agricultorId, data);
  return NextResponse.json(result);
}
