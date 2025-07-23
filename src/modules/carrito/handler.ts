// Handlers para endpoints de carrito (API Next.js)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { CarritoController } from "./controller";

const controller = new CarritoController();

function validarItem(data: any) {
  if (!data.userId || typeof data.userId !== "string") return "userId requerido";
  if (!data.productId || typeof data.productId !== "string") return "productId requerido";
  if (!data.quantity || typeof data.quantity !== "number") return "Cantidad requerida";
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  const items = await controller.listarPorUsuario(userId);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const error = validarItem(data);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const item = await controller.agregarItem(data);
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const error = validarItem(data);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const item = await controller.actualizarItem(id, data);
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const item = await controller.eliminarItem(id);
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  // Limpiar carrito del usuario
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const { userId } = data;
  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  const result = await controller.limpiarCarrito(userId);
  return NextResponse.json(result);
}
