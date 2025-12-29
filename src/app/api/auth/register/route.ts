import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { PreRegistration } from '@/models/PreRegistration';
import { sendEmail, emailTemplates } from '@/lib/email';
import crypto from 'crypto';

// POST - Registrar novo usuário hóspede
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, preRegistrationId } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verificar se já existe usuário com este email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este email' },
        { status: 400 }
      );
    }

    // Verificar se já existe usuário com este telefone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este telefone' },
        { status: 400 }
      );
    }

    // Se foi passado preRegistrationId, validar e atualizar
    if (preRegistrationId) {
      const preRegistration = await PreRegistration.findById(preRegistrationId);

      if (!preRegistration) {
        return NextResponse.json(
          { error: 'Pré-cadastro não encontrado' },
          { status: 404 }
        );
      }

      if (preRegistration.status !== 'pending') {
        return NextResponse.json(
          { error: 'Este pré-cadastro já foi utilizado' },
          { status: 400 }
        );
      }
    }

    // Gerar token de verificação de email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    // Criar usuário
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'guest',
      isActive: false, // Será ativado após verificar email
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Atualizar pré-cadastro se existir
    if (preRegistrationId) {
      await PreRegistration.findByIdAndUpdate(preRegistrationId, {
        status: 'registered',
        registeredUserId: user._id.toString(),
      });
    }

    // Enviar email de verificação
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verificar-email?token=${emailVerificationToken}`;

    try {
      await sendEmail({
        to: email,
        subject: 'Verifique seu email - Casa da Pampulha',
        html: emailTemplates.verifyEmail(name, verificationLink),
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de verificação:', emailError);
      // Continua mesmo se o email falhar - usuário pode solicitar reenvio
    }

    console.log('Link de verificação:', verificationLink);

    return NextResponse.json({
      success: true,
      message: 'Conta criada! Verifique seu email para ativar.',
      // Em desenvolvimento, retornar o link (remover em produção)
      ...(process.env.NODE_ENV === 'development' && { verificationLink }),
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
