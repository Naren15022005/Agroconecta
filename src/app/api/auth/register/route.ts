import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/password';
import { sendWelcomeEmail } from '@/lib/email';
import { randomBytes } from 'crypto';
import AgroConectaIdGenerator from '@/lib/id-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    let role = body.role;

    // Los roles ya deben venir con los nombres correctos de la BD
    // No necesitamos normalizar, solo validar que sean roles válidos

    // Validación estricta de campos
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        error: 'Por favor completa todos los campos requeridos.'
      }, { status: 400 });
    }
    // Validar formato de email
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'El correo electrónico no es válido.'
      }, { status: 400 });
    }
    // Validar contraseña con reglas de seguridad
    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      return NextResponse.json({ success: false, error: pwCheck.errors.join(' ') }, { status: 400 });
    }

    let user: any = null;
    let roleName = role;

    try {
      const connectPromise = (async () => {
        await prisma.$connect();
        const roleRecord = await prisma.role.findUnique({ where: { name: role } });
        return roleRecord;
      })();

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 1000)
      );

      const roleRecord = await Promise.race([connectPromise, timeoutPromise]);
      if (!roleRecord) {
        throw new Error('Base de datos local no disponible o timeout alcanzado (1s)');
      }

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
    } catch (dbErr: any) {
      console.warn('[Register] Prisma MySQL no respondió rápidamente, ejecutando registro en Firebase Cloud Firestore:', String(dbErr));
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, getDocs, query, where, setDoc, doc } = await import('firebase/firestore');

        // Check if user exists in Firebase Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('correo', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          return NextResponse.json({ success: false, error: 'El correo electrónico ya está registrado en Firebase.' }, { status: 409 });
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
        console.log('[Register] Usuario registrado en Firebase Cloud Firestore:', userId);
      } catch (fbErr: any) {
        console.error('[Register] Error crítico en Firebase Firestore fallback:', String(fbErr));
        return NextResponse.json({ success: false, error: 'No se pudo conectar a la base de datos de producción (Firebase).' }, { status: 503 });
      }
    }

    // Crear perfil específico según el rol (solo si corresponde)
    try {
      if (role === 'CAMPESINO') {
        await prisma.agricultor.create({
          data: {
            id: AgroConectaIdGenerator.generateAgricultorId(),
            user_id: user.id,
            telefono: body.phone || null,
            ubicacion: body.address || null,
            verificado: false,
          },
        });
      } else if (role === 'COMPRADOR') {
        await prisma.cliente.create({
          data: {
            id: AgroConectaIdGenerator.generateClienteId(),
            user_id: user.id,
            telefono: body.phone || null,
            direccion: body.address || null,
          },
        });
      } else if (role === 'EMPRESA') {
        await prisma.empresa.create({
          data: {
            id: AgroConectaIdGenerator.generateEmpresaId(),
            user_id: user.id,
            razon_social: name,
            nit: '',
            telefono: body.phone || null,
            direccion: body.address || null,
            verificada: false,
          },
        });
      }
      // ADMINISTRADOR no necesita perfil
    } catch (profileError) {
      // Si falla la creación del perfil, eliminar el usuario creado
      console.error('Error creando perfil:', String(profileError));
      try { await prisma.user.delete({ where: { id: user.id } }); } catch (e) { console.error('Error cleaning up user after profile failure:', String(e)); }
      return NextResponse.json({
        success: false,
        error: 'Hubo un problema al crear el perfil. Intenta nuevamente o contacta soporte.'
      }, { status: 500 });
    }

    // Generar token de activación
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await prisma.verificationToken.create({
      data: {
        id: crypto.randomUUID(),
        identifier: user.correo,
        token,
        expires,
      },
    });

    // Enviar email de bienvenida (no fallar si hay error)
    try {
      await sendWelcomeEmail(user.correo, user.nombre, token);
    } catch (emailError) {
      console.log('Error enviando email de bienvenida:', String(emailError));
    }

    return NextResponse.json({
      success: true,
      message: '¡Registro exitoso! Revisa tu correo para activar la cuenta. Una vez activada, podrás iniciar sesión.',
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: roleRecord.displayName || roleRecord.name,
      },
    });
  } catch (error: any) {
    console.error('Error en registro:', String(error));
    let message = 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }
}
