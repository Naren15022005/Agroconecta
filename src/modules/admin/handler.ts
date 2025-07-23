// Handlers para endpoints de Admin (API Next.js)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { AdminController } from "./controller";

const controller = new AdminController();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  if (!tipo) return NextResponse.json({ error: "tipo requerido" }, { status: 400 });

  if (tipo === "usuarios") {
    const usuarios = await controller.listarUsuarios();
    return NextResponse.json(usuarios);
  }
  if (tipo === "productos") {
    const productos = await controller.listarProductos();
    return NextResponse.json(productos);
  }
  if (tipo === "pedidos") {
    const pedidos = await controller.listarPedidos();
    return NextResponse.json(pedidos);
  }
  return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const { id, tipo } = data;
  if (!id || !tipo) return NextResponse.json({ error: "ID y tipo requeridos" }, { status: 400 });
  if (tipo === "usuario") {
    const usuario = await controller.actualizarUsuario(id, data);
    return NextResponse.json(usuario);
  }
  return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const tipo = searchParams.get("tipo");
  if (!id || !tipo) return NextResponse.json({ error: "ID y tipo requeridos" }, { status: 400 });
  if (tipo === "usuario") {
    const usuario = await controller.eliminarUsuario(id);
    return NextResponse.json(usuario);
  }
  if (tipo === "producto") {
    const producto = await controller.eliminarProducto(id);
    return NextResponse.json(producto);
  }
  if (tipo === "pedido") {
    const pedido = await controller.eliminarPedido(id);
    return NextResponse.json(pedido);
  }
  return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
}
