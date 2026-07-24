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

    // Detectar si la BD local (MySQL) debe ser omitida para prevenir 504 Timeouts en Vercel
    const isVercel = Boolean(process.env.VERCEL);
    const dbUrl = process.env.DATABASE_URL || '';
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

    // Intento 1: Registro en Prisma (SOLO si NO estamos en Vercel con un DATABASE_URL local)
    if (!isVercel || !isLocalDb) {
      try {
        const connectPromise = (async () => {
          await prisma.$connect();
          return await prisma.role.findUnique({ where: { name: role } });
        })();

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
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
        console.warn('[Register] Omitiendo Prisma MySQL inaccesible:', String(prismaErr));
      }
    }

    // Intento 2: Backend Express Server en Entorno Local
    if (!isVercel) {
      try {
        const backendRes = await fetch('http://localhost:10000/firebase/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
          signal: AbortSignal.timeout(1000)
        });

        if (backendRes.ok) {
          const backendJson = await backendRes.json();
          if (backendJson.success) {
            return NextResponse.json({
              success: true,
              message: '¡Registro exitoso en el servidor backend!',
              user: backendJson.user
            });
          }
        }
      } catch (expressErr) {
        console.warn('[Register] Backend Express inaccesible:', String(expressErr));
      }
    }

    // Intento 3: Firebase Cloud Firestore Directo (Sin Timeouts en Vercel)
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
        message: '¡Registro exitoso en AgroConecta (Firebase Cloud)!',
        user: { id: userId, nombre: name, correo: email, rol: role }
      });
    } catch (fbErr: any) {
      console.error('[Register] Error en Firebase Firestore:', String(fbErr));
      return NextResponse.json({
        success: false,
        error: 'No se pudo conectar con el servicio de base de datos en la nube (Firebase).'
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
