import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
          isActive: true
        });

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          throw new Error('Senha incorreta');
        }

        // Check if guest access is still valid
        if (user.role === 'guest' && user.checkOutDate) {
          const now = new Date();
          const checkOut = new Date(user.checkOutDate);
          // Add 24 hours to checkout date for access
          checkOut.setHours(checkOut.getHours() + 24);

          if (now > checkOut) {
            throw new Error('Seu acesso expirou. Entre em contato com o anfitrião.');
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};
