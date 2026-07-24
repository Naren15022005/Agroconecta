import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/password';
import AgroConectaIdGenerator from '@/lib/id-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    let role = body.role;

    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        error: 'Por favor completa todos los campos requeridos.'
      }, { status: 400 });
    }

    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'El correo electrónico no es válido.'
      }, { status: 400 });
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      return NextResponse.json({ success: false, error: pwCheck.errors.join(' ') }, { status: 400 });
    }

    let user: any = null;
    let roleName = role;

    // Intento 1: Registro directo en Prisma (MySQL) con timeout ultrarrápido (800ms)
    try {
      const connectPromise = (async () => {
        await prisma.$connect();
        const roleRecord = await prisma.role.findUnique({ where: { name: role } });
        return roleRecord;
      })();

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 800)
      );

      const roleRecord = await Promise.race([connectPromise, timeoutPromise]);
      if (roleRecord) {
        const existingUser = await prisma.user.findUnique({ where: { correo: email } });
        if (existingUser) {
          return NextResponse.json({ success: false, error: 'El correo electrónico ya está registrado.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
          data: {
            id: AgroConectaIdGenerator.generateUserId(),
            nombre: name,
            correo: email,
            contraseña: hashedPassword,
            roleId: roleRecord.id,
            isActive: true,
          },
        });
        roleName = roleRecord.displayName || roleRecord.name;
        
        return NextResponse.json({
          success: true,
          message: '¡Registro exitoso en AgroConecta!',
          user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: roleName }
        });
      }
    } catch (prismaErr) {
      console.warn('[Register] Prisma no disponible, conectando al Backend Express/Firebase:', String(prismaErr));
    }

    // Intento 2: Backend Express Server (si está configurado o en entorno local)
    const backendUrl = process.env.BACKEND_URL || (!process.env.VERCEL ? 'http://localhost:10000' : '');
    if (backendUrl) {
      try {
        const backendRes = await fetch(`${backendUrl}/firebase/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
          signal: AbortSignal.timeout(1200)
        });

      if (backendRes.ok) {
        const backendJson = await backendRes.json();
        if (backendJson.success) {
          return NextResponse.json({
            success: true,
            message: '¡Registro exitoso en el backend Firebase de AgroConecta!',
            user: backendJson.user
          });
        } else {
          return NextResponse.json({ success: false, error: backendJson.error }, { status: 400 });
        }
      }
    } catch (expressErr) {
      console.warn('[Register] Backend Express inaccesible, ejecutando fallback Firestore cliente direct:', String(expressErr));
    }

    // Intento 3: Fallback cliente Firestore directo
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, query, where, setDoc, doc } = await import('firebase/firestore');

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('correo', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return NextResponse.json({ success: false, error: 'El correo electrónico ya está registrado.' }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = AgroConectaIdGenerator.generateUserId();
      user = {
        id: userId,
        nombre: name,
        correo: email,
        contraseña: hashedPassword,
        role: role,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userId), user);
      
      return NextResponse.json({
        success: true,
        message: '¡Registro exitoso en la nube de AgroConecta!',
        user: { id: userId, nombre: name, correo: email, rol: role }
      });
    } catch (fbErr: any) {
      console.error('[Register] Error crítico procesando registro:', String(fbErr));
      return NextResponse.json({
        success: false,
        error: 'No se pudo conectar con el servidor de registros de AgroConecta.'
      }, { status: 503 });
    }
  } catch (error: any) {
    console.error('Error general en registro:', String(error));
    return NextResponse.json({
      success: false,
      error: error?.message || 'Error inesperado al procesar el registro.'
    }, { status: 500 });
  }
}
