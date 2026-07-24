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
    let registeredWithPrisma = false;

    // Intento 1: Registro vía Prisma (MySQL)
    try {
      const connectPromise = (async () => {
        await prisma.$connect();
        const roleRecord = await prisma.role.findUnique({ where: { name: role } });
        return roleRecord;
      })();

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 1200)
      );

      const roleRecord = await Promise.race([connectPromise, timeoutPromise]);
      if (!roleRecord) {
        throw new Error('Base de datos local no disponible o timeout (1.2s)');
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
      registeredWithPrisma = true;

      // Perfil específico en Prisma
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
      } catch (profileError) {
        console.error('Error creando perfil en Prisma:', String(profileError));
      }
    } catch (dbErr: any) {
      console.warn('[Register] Servidor Prisma MySQL no accesible, procesando registro en Firebase Cloud Firestore:', String(dbErr));
      
      // Intento 2: Registro vía Firebase Cloud Firestore
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
        console.log('[Register] Usuario registrado con éxito en Firebase Cloud Firestore:', userId);
      } catch (fbErr: any) {
        console.error('[Register] Error crítico guardando en Firebase Firestore:', String(fbErr));
        return NextResponse.json({ 
          success: false, 
          error: 'No se pudo completar el registro en la base de datos de producción (Firebase).' 
        }, { status: 503 });
      }
    }

    // Generar token de verificación si aplica
    const token = randomBytes(32).toString('hex');
    if (registeredWithPrisma) {
      try {
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
        await prisma.verificationToken.create({
          data: {
            id: crypto.randomUUID(),
            identifier: user.correo,
            token,
            expires,
          },
        });
      } catch (tokenErr) {
        console.warn('Error guardando token de verificación en Prisma:', String(tokenErr));
      }
    }

    // Enviar correo de bienvenida (asíncrono sin bloquear)
    sendWelcomeEmail(user.correo, user.nombre, token).catch(e => console.warn('Error enviando email de bienvenida:', String(e)));

    return NextResponse.json({
      success: true,
      message: '¡Registro exitoso! Tu cuenta ha sido creada. Ya puedes iniciar sesión.',
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: roleName,
      },
    });
  } catch (error: any) {
    console.error('Error en registro:', String(error));
    return NextResponse.json({
      success: false,
      error: error?.message || 'Ocurrió un error inesperado al procesar tu registro.'
    }, { status: 500 });
  }
}
