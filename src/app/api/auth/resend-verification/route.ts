import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';
import crypto from 'crypto';

// POST - Reenviar email de verificação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Buscar usuário pelo email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá o link de verificação.',
      });
    }

    // Verificar se o email já foi verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Este email já foi verificado. Tente fazer login.' },
        { status: 400 }
      );
    }

    // Gerar novo token de verificação
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    // Atualizar usuário com novo token
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Enviar email de verificação
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verificar-email?token=${emailVerificationToken}`;

    try {
      await sendEmail({
        to: email,
        subject: 'Verifique seu email - Casa da Pampulha',
        html: emailTemplates.verifyEmail(user.name, verificationLink),
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de verificação:', emailError);
      return NextResponse.json(
        { error: 'Erro ao enviar email. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    console.log('Link de verificação reenviado:', verificationLink);

    return NextResponse.json({
      success: true,
      message: 'Email de verificação reenviado com sucesso!',
      // Em desenvolvimento, retornar o link (remover em produção)
      ...(process.env.NODE_ENV === 'development' && { verificationLink }),
    });
  } catch (error) {
    console.error('Erro ao reenviar verificação:', error);
    return NextResponse.json(
      { error: 'Erro ao reenviar email de verificação' },
      { status: 500 }
    );
  }
}
