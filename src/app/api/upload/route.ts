
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Detectar tipo de contenido
    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let ext = "jpg";
    let originalName = "imagen";

    if (contentType.includes("application/json")) {
      // Soporte para base64 JSON
      const body = await request.json();
      const image: string = body.image;
      if (!image || typeof image !== "string") {
        return NextResponse.json({ error: "No se encontró imagen" }, { status: 400 });
      }
      // Extraer tipo y base64
      const match = image.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "Formato de imagen inválido" }, { status: 400 });
      }
      ext = match[2] === "jpeg" ? "jpg" : match[2];
      buffer = Buffer.from(match[3], "base64");
      originalName = `base64upload.${ext}`;
    } else if (contentType.includes("multipart/form-data")) {
      // Soporte para form-data tradicional
      const data = await request.formData();
      const file: File | null = data.get('file') as unknown as File;
      if (!file) {
        return NextResponse.json({ error: "No se encontró archivo" }, { status: 400 });
      }
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "La imagen debe pesar menos de 5MB" }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      // Extraer extensión
      const fileMatch = file.type.match(/image\/(png|jpeg|jpg|webp)/);
      ext = fileMatch ? (fileMatch[1] === "jpeg" ? "jpg" : fileMatch[1]) : "jpg";
      originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    } else {
      return NextResponse.json({ error: "Tipo de contenido no soportado" }, { status: 400 });
    }

    if (!buffer) {
      return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });
    }

    // Crear directorio si no existe (siempre antes de guardar)
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'productos');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Si falla, retorna error real
      return NextResponse.json({ error: 'No se pudo crear el directorio de imágenes' }, { status: 500 });
    }


    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `${timestamp}_${uuidv4()}_${originalName}`;
    const filePath = join(uploadDir, fileName);

    // Guardar archivo
    try {
      await writeFile(filePath, buffer);
    } catch (err) {
      return NextResponse.json({ error: 'No se pudo guardar la imagen' }, { status: 500 });
    }

    // Retornar URL pública
    const publicUrl = `/uploads/productos/${fileName}`;
    return NextResponse.json({ 
      success: true, 
      imageUrl: publicUrl,
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}
