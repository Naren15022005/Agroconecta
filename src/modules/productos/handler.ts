// Handlers para endpoints de productos (API Next.js)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { ProductosController } from "./controller";

const controller = new ProductosController();

function validarProducto(data: any) {
  if (!data.name || typeof data.name !== "string") return "Nombre requerido";
  if (!data.price || typeof data.price !== "number") return "Precio requerido";
  if (!data.farmerId || typeof data.farmerId !== "string") return "farmerId requerido";
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const id = searchParams.get("id");

  if (id) {
    const producto = await controller.buscarPorId(id);
    return NextResponse.json(producto);
  }
  if (categoryId) {
    const productos = await controller.filtrarPorCategoria(categoryId);
    return NextResponse.json(productos);
  }
  const productos = await controller.listarTodos();
  return NextResponse.json(productos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const error = validarProducto(data);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const producto = await controller.crearProducto(data);
  return NextResponse.json(producto);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const error = validarProducto(data);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const producto = await controller.actualizarProducto(id, data);
  return NextResponse.json(producto);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const producto = await controller.eliminarProducto(id);
  return NextResponse.json(producto);
}
