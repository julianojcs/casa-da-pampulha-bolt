import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { PreRegistration } from '@/models/PreRegistration';
import { sendEmail, emailTemplates } from '@/lib/email';
import crypto from 'crypto';

// GET - Listar todos os pré-cadastros (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const preRegistrations = await PreRegistration.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(preRegistrations);
  } catch (error) {
    console.error('Erro ao buscar pré-cadastros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pré-cadastros' },
      { status: 500 }
    );
  }
}

// POST - Criar novo pré-cadastro (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, email, phone, notes, expirationDays = 30 } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe pré-cadastro pendente para este telefone
    const existingPending = await PreRegistration.findOne({
      phone,
      status: 'pending',
    });

    if (existingPending) {
      return NextResponse.json(
        { error: 'Já existe um pré-cadastro pendente para este telefone' },
        { status: 400 }
      );
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const preRegistration = await PreRegistration.create({
      name,
      email,
      phone,
      token,
      status: 'pending',
      expiresAt,
      notes,
      createdBy: session.user?.email || 'admin',
    });

    // Gerar link de cadastro
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const registrationLink = `${baseUrl}/cadastro?token=${token}`;

    // Enviar email de convite se tiver email
    let emailSent = false;
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'Convite para Cadastro - Casa da Pampulha',
          html: emailTemplates.preRegistrationInvite(name, registrationLink),
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Erro ao enviar email de convite:', emailError);
      }
    }

    return NextResponse.json({
      preRegistration,
      registrationLink,
      emailSent,
      message: emailSent
        ? 'Pré-cadastro criado e email enviado!'
        : 'Pré-cadastro criado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao criar pré-cadastro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pré-cadastro' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar pré-cadastro (admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const preRegistration = await PreRegistration.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!preRegistration) {
      return NextResponse.json(
        { error: 'Pré-cadastro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(preRegistration);
  } catch (error) {
    console.error('Erro ao atualizar pré-cadastro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pré-cadastro' },
      { status: 500 }
    );
  }
}

// DELETE - Remover pré-cadastro (admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const preRegistration = await PreRegistration.findByIdAndDelete(id);

    if (!preRegistration) {
      return NextResponse.json(
        { error: 'Pré-cadastro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Pré-cadastro removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover pré-cadastro:', error);
    return NextResponse.json(
      { error: 'Erro ao remover pré-cadastro' },
      { status: 500 }
    );
  }
}
