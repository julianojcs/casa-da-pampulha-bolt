import nodemailer from 'nodemailer';

// Configuração do transporter para Gmail ou outro serviço SMTP
const createTransporter = () => {
  // Opção 1: Gmail (requer senha de app ou OAuth2)
  if (process.env.GMAIL_SERVER_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_SERVER_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Opção 2: SMTP genérico
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Ethereal (apenas para testes)
  console.warn('⚠️ Nenhum serviço de email configurado. Usando modo de teste.');
  return null;
};

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  transporter = createTransporter();

  // Se não houver configuração, criar conta de teste
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
  try {
    const transport = await getTransporter();

    if (!transport) {
      throw new Error('Transporter não configurado');
    }

    const mailOptions = {
      from: process.env.GMAIL_FROM_NAME || process.env.GMAIL_SERVER_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transport.sendMail(mailOptions);

    // Se for conta de teste, mostrar URL de preview
    let previewUrl: string | undefined;
    if (info.messageId && !process.env.GMAIL_SERVER_USER && !process.env.SMTP_HOST) {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log('📧 Preview URL:', previewUrl);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}

// Templates de email
export const emailTemplates = {
  // Template base
  baseLayout: (content: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Casa da Pampulha</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏠 Casa da Pampulha</h1>
        </div>

        <!-- Content -->
        <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px;">
          ${content}
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
          <p>Casa da Pampulha - Belo Horizonte, MG</p>
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Email de verificação de conta
  verifyEmail: (name: string, verificationLink: string) => {
    const content = `
      <h2 style="color: #333; margin-top: 0;">Olá, ${name}! 👋</h2>

      <p style="color: #555; line-height: 1.6;">
        Bem-vindo(a) à Casa da Pampulha! Para ativar sua conta, clique no botão abaixo:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}"
           style="display: inline-block; background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Verificar Email
        </a>
      </div>

      <p style="color: #888; font-size: 14px;">
        Se você não criou uma conta, pode ignorar este email.
      </p>

      <p style="color: #888; font-size: 12px;">
        Link alternativo: <a href="${verificationLink}" style="color: #f59e0b;">${verificationLink}</a>
      </p>
    `;
    return emailTemplates.baseLayout(content);
  },

  // Email de pré-cadastro para hóspede
  preRegistrationInvite: (name: string, registrationLink: string) => {
    const content = `
      <h2 style="color: #333; margin-top: 0;">Olá, ${name}! 👋</h2>

      <p style="color: #555; line-height: 1.6;">
        Você foi convidado(a) para criar sua conta na <strong>Casa da Pampulha</strong>!
      </p>

      <p style="color: #555; line-height: 1.6;">
        Clique no botão abaixo para completar seu cadastro e ter acesso ao sistema:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${registrationLink}"
           style="display: inline-block; background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Completar Cadastro
        </a>
      </div>

      <p style="color: #888; font-size: 14px;">
        Este link é válido por 30 dias.
      </p>

      <p style="color: #888; font-size: 12px;">
        Link alternativo: <a href="${registrationLink}" style="color: #f59e0b;">${registrationLink}</a>
      </p>
    `;
    return emailTemplates.baseLayout(content);
  },

  // Email de confirmação de reserva
  reservationConfirmation: (
    name: string,
    checkIn: string,
    checkOut: string,
    guests: number
  ) => {
    const content = `
      <h2 style="color: #333; margin-top: 0;">Reserva Confirmada! ✅</h2>

      <p style="color: #555; line-height: 1.6;">
        Olá, <strong>${name}</strong>! Sua reserva foi confirmada com sucesso.
      </p>

      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">Detalhes da Reserva</h3>
        <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
        <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
        <p style="margin: 5px 0;"><strong>Hóspedes:</strong> ${guests} pessoa(s)</p>
      </div>

      <p style="color: #555; line-height: 1.6;">
        Lembre-se de preencher seus dados e dos demais hóspedes no sistema antes do check-in.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/hospede"
           style="display: inline-block; background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Acessar Minha Área
        </a>
      </div>
    `;
    return emailTemplates.baseLayout(content);
  },

  // Email de contato/formulário
  contactForm: (name: string, email: string, phone: string, message: string) => {
    const content = `
      <h2 style="color: #333; margin-top: 0;">Nova Mensagem de Contato 📬</h2>

      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 8px 0;"><strong>Nome:</strong> ${name}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 8px 0;"><strong>Telefone:</strong> ${phone}</p>
      </div>

      <h3 style="color: #333;">Mensagem:</h3>
      <div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>

      <p style="color: #888; font-size: 12px; margin-top: 20px;">
        Responda diretamente para: <a href="mailto:${email}" style="color: #f59e0b;">${email}</a>
      </p>
    `;
    return emailTemplates.baseLayout(content);
  },

  // Email de recuperação de senha
  passwordReset: (name: string, resetLink: string) => {
    const content = `
      <h2 style="color: #333; margin-top: 0;">Recuperação de Senha 🔐</h2>

      <p style="color: #555; line-height: 1.6;">
        Olá, <strong>${name}</strong>! Recebemos uma solicitação para redefinir sua senha.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}"
           style="display: inline-block; background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Redefinir Senha
        </a>
      </div>

      <p style="color: #888; font-size: 14px;">
        Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email.
      </p>

      <p style="color: #888; font-size: 12px;">
        Link alternativo: <a href="${resetLink}" style="color: #f59e0b;">${resetLink}</a>
      </p>
    `;
    return emailTemplates.baseLayout(content);
  },
};
