import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

interface CustomSession extends Session {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

interface CustomJWT extends JWT {
  id?: string;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: Call your backend API to validate credentials
        // This is a mock implementation for MVP
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Mock validation - replace with actual API call
        if (credentials.email === 'user@example.com' && credentials.password === 'password') {
          return {
            id: '1',
            email: credentials.email,
            name: 'Test User',
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token as CustomJWT;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session as CustomSession;
    },
  },
});

export { handler as GET, handler as POST };
