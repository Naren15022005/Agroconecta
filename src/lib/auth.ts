
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import fs from 'fs'
import path from 'path'
import AgroConectaIdGenerator from './id-generator'

function logToFile(msg: string) {
  const logPath = path.join(process.cwd(), 'login_debug.log');
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
}

export const authOptions: NextAuthOptions = {
  logger: {
    error(code, metadata) {
      console.error('[next-auth][error]', code, metadata);
    },
    warn(code) {
      console.warn('[next-auth][warn]', code);
    },
    debug(code, metadata) {
      console.debug('[next-auth][debug]', code, metadata);
    }
  },
  // Wrap PrismaAdapter to adapt our schema (user email field is `correo`)
  adapter: (() => {
    const base = PrismaAdapter(prisma) as any;
    return {
      ...base,
      // NextAuth calls `getUserByEmail(email)` — our schema uses `correo`
      async getUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { correo: email } });
      },
      // Ensure createUser returns a shape compatible with NextAuth when called
      async createUser(data: any) {
        // Map `email` -> `correo` if present
        const toCreate: any = { ...data };
        if (toCreate.email) {
          toCreate.correo = toCreate.email;
          delete toCreate.email;
        }
        // Prisma schema may require `contraseña` field; ensure it's present
        if (toCreate.contraseña === undefined) toCreate.contraseña = '';
        return prisma.user.create({ data: toCreate as any });
      }
    } as any;
  })(),
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          scope: 'openid email profile'
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember', type: 'text' }
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

        // Do not log plaintext passwords or full hashes. Log attempt metadata only.
        logToFile(`AUTH: login attempt for ${credentials.email} (userId=${user.id})`);

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
          remember: credentials?.remember === 'true' || credentials?.remember === true
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    // Configurar duración de sesión más práctica
    // Default session duration (90 days). We set a longer global maxAge
    // to make 'Recordarme' behavior effective immediately for cookie lifetime.
    // The jwt callback still sets token.exp dynamically per-session.
    maxAge: 90 * 24 * 60 * 60, // 90 días (en segundos)
    updateAge: 24 * 60 * 60,   // Actualizar cada 24 horas
  },
  jwt: {
    // JWT default expiry 90 days; for 'remember' we still set token.exp manually in callback
    maxAge: 90 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // When user logs in, copy basic fields and set token.remember if provided
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.sub = (user as any).id;
        if ((user as any).remember) token.remember = true;

        // Set token expiry dynamically: 90 days if remember, otherwise keep default (30 days)
        const now = Math.floor(Date.now() / 1000);
        const defaultExp = now + 30 * 24 * 60 * 60;
        const rememberExp = now + 90 * 24 * 60 * 60;
        token.exp = (token.remember ? rememberExp : defaultExp) as unknown as number;
      } else {
        // On subsequent requests, ensure token.exp remains
        if (!token.exp) {
          const now = Math.floor(Date.now() / 1000);
          token.exp = now + 30 * 24 * 60 * 60;
        }
        // ONLY query DB if token.role is missing or when explicitly triggered by update.
        // This avoids blocking every session check for 5+ seconds when DB connection is slow.
        if (!token.role || trigger === "update") {
          try {
            if (token.sub || token.id) {
              const userIdRaw = (token.sub || token.id) as string;
              let userId = userIdRaw;
              if (userId && userId.startsWith('AGRC_')) {
                try { userId = AgroConectaIdGenerator.normalizeId(userId); } catch (e) { /* ignore */ }
              }
              const dbUser = await Promise.race([
                prisma.user.findUnique({ where: { id: userId }, include: { role: true } }),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
              ]);
              if (dbUser && dbUser.role && dbUser.role.name) {
                token.role = dbUser.role.name;
              }
            }
          } catch (err) {
            console.error('Error loading role in jwt callback:', err);
          }
        }
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth: ensure a corresponding user exists in our custom schema
      try {
        if (account?.provider === 'google' && profile?.email) {
          // Try to find existing user by correo
          const existing = await prisma.user.findUnique({ where: { correo: profile.email } });
          // If user exists, check if an Account linking Google already exists
          if (existing) {
            const linked = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId
                }
              }
            });
            if (!linked) {
              // Redirect user to a linking UI where they must confirm with password
              const redirectTo = `/auth/link?email=${encodeURIComponent(profile.email as string)}&provider=${encodeURIComponent(account.provider)}&providerAccountId=${encodeURIComponent(account.providerAccountId as string)}`;
              return redirectTo;
            }
            // if linked, allow sign in
            return true;
          }
          // If no existing user, create one and allow adapter to link
          const role = await prisma.role.findFirst({ where: { name: 'COMPRADOR' } });
          const roleId = role ? role.id : (await prisma.role.findFirst()).id;
          await prisma.user.create({
            data: {
              id: (require('crypto').randomUUID?.() || require('crypto').randomBytes(16).toString('hex')),
              nombre: (profile.name as string) || (profile.email as string).split('@')[0],
              correo: profile.email as string,
              contraseña: '',
              roleId: roleId
            }
          });
        }
      } catch (err) {
        console.error('Error in signIn callback for google:', err);
        // allow sign in to proceed but log the error
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        let idFromToken = (token.id ?? token.sub) as string | undefined;
        // Normalize token id if legacy format
        if (idFromToken && idFromToken.startsWith('AGRC_')) {
          try {
            idFromToken = AgroConectaIdGenerator.normalizeId(idFromToken);
          } catch (e) {
            // ignore
          }
        }
        if (idFromToken) session.user.id = idFromToken;
        session.user.role = token.role as string;
        // Log when session role differs from token or when assigned
        try {
          const logRole = token.role as string | undefined;
          console.info(`[auth] session built for user=${idFromToken} role=${logRole}`);
        } catch (e) {
          /* ignore logging errors */
        }
        session.user.remember = Boolean(token.remember);
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
