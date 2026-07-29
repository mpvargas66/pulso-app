// PULSO v2 - NextAuth.js Configuration
// Auth con JWT + bcrypt + Supabase PostgreSQL

import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña requeridos');
        }

        // Buscar usuario en DB
        const user = await getUserByEmail(credentials.email);

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        // Validar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta');
        }

        // Retornar usuario para JWT
        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
        };
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // Refresh cada 24h
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
