import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, subject } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nome, email e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    // Email de validação básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Enviar email para o admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_SERVER_USER;

    if (!adminEmail) {
      console.warn('⚠️ Email do admin não configurado');
      // Em desenvolvimento, apenas logar a mensagem
      console.log('📧 Mensagem de contato recebida:', { name, email, phone, message });
      return NextResponse.json({
        success: true,
        message: 'Mensagem recebida! Entraremos em contato em breve.',
      });
    }

    const result = await sendEmail({
      to: adminEmail,
      subject: subject || `[Casa da Pampulha] Nova mensagem de ${name}`,
      html: emailTemplates.contactForm(name, email, phone || 'Não informado', message),
    });

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada! Entraremos em contato em breve.',
      ...(result.previewUrl && { previewUrl: result.previewUrl }),
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
