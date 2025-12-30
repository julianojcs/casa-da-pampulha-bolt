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

        // Buscar usuário sem filtrar por isActive para poder dar feedback apropriado
        const user = await User.findOne({
          email: credentials.email.toLowerCase()
        });

        if (!user) {
          throw new Error('Usuário não encontrado ou senha incorreta');
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          throw new Error('Usuário não encontrado ou senha incorreta');
        }

        // Verificar se o email foi confirmado
        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        // Verificar se a conta está ativa
        if (!user.isActive) {
          throw new Error('Sua conta está desativada. Entre em contato com o administrador.');
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
          image: user.avatar || null,
          phone: user.phone || null,
          staff: user.staff ? {
            jobType: user.staff.jobType,
            jobTitle: user.staff.jobTitle,
            workDays: user.staff.workDays,
            checklistTemplate: user.staff.checklistTemplate,
          } : null,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
        token.phone = (user as any).phone;
        token.staff = (user as any).staff;
      }
      // Handle session update (when user updates their profile)
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = (token.image as string | null) || undefined;
        (session.user as any).phone = token.phone || null;
        (session.user as any).staff = token.staff || null;
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
