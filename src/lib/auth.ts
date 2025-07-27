
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import fs from 'fs'
import path from 'path'

function logToFile(msg: string) {
  const logPath = path.join(process.cwd(), 'login_debug.log');
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        logToFile('AUTH: credentials ' + JSON.stringify(credentials));
        if (!credentials?.email || !credentials?.password) {
          logToFile('AUTH: Faltan credenciales');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            correo: credentials.email
          },
          include: {
            role: true
          }
        });
        logToFile('AUTH: user encontrado ' + JSON.stringify(user));

        if (!user) {
          logToFile('AUTH: Usuario no encontrado');
          return null;
        }
        if (!user.isActive) {
          logToFile('AUTH: Usuario inactivo');
          return null;
        }

        // Log de contraseñas para depuración
        logToFile('AUTH: contraseña ingresada: ' + credentials.password);
        logToFile('AUTH: hash en base de datos: ' + user.contraseña);

        let isValidPassword = false;
        try {
          isValidPassword = await bcrypt.compare(
            credentials.password,
            user.contraseña
          );
        } catch (err) {
          logToFile('AUTH: Error comparando hash ' + err);
        }
        logToFile('AUTH: isValidPassword ' + isValidPassword);

        if (!isValidPassword) {
          logToFile('AUTH: Contraseña incorrecta');
          return null;
        }

        logToFile('AUTH: Login exitoso');
        return {
          id: user.id,
          email: user.correo,
          name: user.nombre,
          role: user.role.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    // Configurar duración de sesión más práctica
    maxAge: 30 * 24 * 60 * 60, // 30 días (en segundos)
    updateAge: 24 * 60 * 60,   // Actualizar cada 24 horas
  },
  jwt: {
    // JWT expira en 30 días
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
