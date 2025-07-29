import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }
    const agricultor = await prisma.agricultor.findUnique({ where: { user_id: userId } });
    if (!agricultor) {
      return NextResponse.json({ error: "Agricultor no encontrado" }, { status: 404 });
    }
    return NextResponse.json(agricultor);
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor", details: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}
