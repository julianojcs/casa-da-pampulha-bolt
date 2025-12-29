import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=Token inválido', request.url)
      );
    }

    await dbConnect();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=Link expirado ou inválido', request.url)
      );
    }

    // Ativar conta
    user.isActive = true;
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Redirecionar para login com mensagem de sucesso
    return NextResponse.redirect(
      new URL('/login?success=Email verificado! Faça login para continuar.', request.url)
    );
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.redirect(
      new URL('/login?error=Erro ao verificar email', request.url)
    );
  }
}
