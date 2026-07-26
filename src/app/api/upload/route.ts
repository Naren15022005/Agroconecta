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

    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let ext = "jpg";
    let originalName = "imagen";
    let base64String: string | null = null;

    if (contentType.includes("application/json")) {
      // Soporte para base64 JSON
      const body = await request.json();
      const image: string = body.image;
      if (!image || typeof image !== "string") {
        return NextResponse.json({ error: "No se encontró imagen" }, { status: 400 });
      }

      base64String = image;

      // Extraer tipo y base64
      const match = image.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/);
      if (match) {
        ext = match[2] === "jpeg" ? "jpg" : match[2];
        buffer = Buffer.from(match[3], "base64");
        originalName = `base64upload.${ext}`;
      } else if (image.startsWith('http')) {
        // Es una URL directa
        return NextResponse.json({
          success: true,
          imageUrl: image,
          url: image,
          fileName: 'external_image'
        });
      }
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
      const fileMatch = file.type.match(/image\/(png|jpeg|jpg|webp)/);
      ext = fileMatch ? (fileMatch[1] === "jpeg" ? "jpg" : fileMatch[1]) : "jpg";
      originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      base64String = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // Intentar guardar en disco local si el entorno lo permite (ej: desarrollo local)
    try {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'productos');
      await mkdir(uploadDir, { recursive: true });
      const timestamp = Date.now();
      const fileName = `${timestamp}_${uuidv4()}_${originalName}`;
      const filePath = join(uploadDir, fileName);
      if (buffer) {
        await writeFile(filePath, buffer);
        const publicUrl = `/uploads/productos/${fileName}`;
        return NextResponse.json({ 
          success: true, 
          imageUrl: publicUrl,
          url: publicUrl,
          fileName: fileName
        });
      }
    } catch (fsErr) {
      console.warn('[API upload] Sistema de archivos de solo lectura (Vercel serverless). Usando Data URL fallback.');
    }

    // Fallback seguro si el sistema de archivos es de solo lectura (Vercel): Retornar Data URL o URL directa
    if (base64String) {
      return NextResponse.json({
        success: true,
        imageUrl: base64String,
        url: base64String,
        fileName: `dataurl_${Date.now()}`
      }, { status: 200 });
    }

    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error procesando imagen"
    }, { status: 500 });
  }
}
