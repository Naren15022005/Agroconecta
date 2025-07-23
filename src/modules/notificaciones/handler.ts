// Handlers para endpoints de Notificaciones (API Next.js)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { NotificacionesController } from "./controller";

const controller = new NotificacionesController();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  const notificaciones = await controller.listarPorUsuario(userId);
  return NextResponse.json(notificaciones);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  if (!data.userId || !data.message) return NextResponse.json({ error: "userId y message requeridos" }, { status: 400 });
  const notificacion = await controller.crearNotificacion(data);
  return NextResponse.json(notificacion);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const notificacion = await controller.marcarComoLeida(id);
  return NextResponse.json(notificacion);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const notificacion = await controller.eliminarNotificacion(id);
  return NextResponse.json(notificacion);
}
