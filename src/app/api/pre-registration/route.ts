import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { PreRegistration } from '@/models/PreRegistration';
import { Reservation } from '@/models/Reservation';
import { User } from '@/models/User';
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
    const {
      name,
      email,
      phone,
      notes,
      expirationDays = 30,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      adultsCount,
      childrenCount,
      petsCount,
      reservationValue,
      hasReviews,
      isHost,
      originCountry,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar datas se fornecidas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate) {
      const checkIn = new Date(checkInDate);
      if (checkIn < today) {
        return NextResponse.json(
          { error: 'Data de check-in não pode ser anterior a hoje' },
          { status: 400 }
        );
      }
    }

    if (checkOutDate) {
      const checkOut = new Date(checkOutDate);
      if (checkOut < today) {
        return NextResponse.json(
          { error: 'Data de check-out não pode ser anterior a hoje' },
          { status: 400 }
        );
      }

      if (checkInDate && new Date(checkOutDate) <= new Date(checkInDate)) {
        return NextResponse.json(
          { error: 'Data de check-out deve ser posterior à data de check-in' },
          { status: 400 }
        );
      }
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
      checkInDate: checkInDate ? new Date(checkInDate) : undefined,
      checkInTime,
      checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
      checkOutTime,
      adultsCount: adultsCount || 1,
      childrenCount: childrenCount || 0,
      petsCount: petsCount || 0,
      reservationValue,
      hasReviews: hasReviews || false,
      isHost: isHost || false,
      originCountry,
      createdBy: session.user?.email || 'admin',
    });

    // Criar usuário do tipo hóspede (sem senha, será definida no cadastro)
    let guestUser = null;
    try {
      // Verificar se já existe usuário com este email ou telefone
      const existingUser = await User.findOne({
        $or: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          { phone },
        ],
      });

      if (!existingUser) {
        guestUser = await User.create({
          name,
          email: email || undefined,
          phone,
          role: 'guest',
          isActive: false, // Será ativado quando confirmar o cadastro
          country: originCountry,
        });
      } else {
        guestUser = existingUser;
      }
    } catch (userError) {
      console.error('Erro ao criar usuário hóspede:', userError);
      // Não bloqueia a criação do pré-cadastro se o usuário falhar
    }

    // Criar pré-reserva (status pending) se tiver datas de check-in e check-out
    let reservationCreated = null;
    if (checkInDate && checkOutDate) {
      try {
        reservationCreated = await Reservation.create({
          userId: guestUser?._id?.toString() || 'pending',
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          checkInDate: new Date(checkInDate),
          checkInTime: checkInTime || '15:00',
          checkOutDate: new Date(checkOutDate),
          checkOutTime: checkOutTime || '11:00',
          status: 'pending', // Pré-reserva pendente de confirmação de email
          source: 'direct',
          notes: notes ? `[Pré-reserva] ${notes}` : '[Pré-reserva]',
          preRegistrationId: preRegistration._id.toString(),
          createdBy: session.user?.id || session.user?.email || 'admin',
        });
      } catch (reservationError) {
        console.error('Erro ao criar pré-reserva:', reservationError);
        // Não bloqueia a criação do pré-cadastro se a reserva falhar
      }
    }

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
      reservationCreated: !!reservationCreated,
      message: emailSent
        ? reservationCreated
          ? 'Pré-cadastro e pré-reserva criados! Email enviado!'
          : 'Pré-cadastro criado e email enviado!'
        : reservationCreated
          ? 'Pré-cadastro e pré-reserva criados com sucesso!'
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
    const { id, checkInDate, checkInTime, checkOutDate, checkOutTime, ...restData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData: Record<string, any> = { ...restData };

    // Processar datas de check-in/out se fornecidas
    if (checkInDate) {
      const checkIn = new Date(checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        return NextResponse.json(
          { error: 'Data de check-in não pode ser anterior a hoje' },
          { status: 400 }
        );
      }

      updateData.checkInDate = checkIn;
      if (checkInTime) updateData.checkInTime = checkInTime;
    }

    if (checkOutDate) {
      const checkOut = new Date(checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkOut < today) {
        return NextResponse.json(
          { error: 'Data de check-out não pode ser anterior a hoje' },
          { status: 400 }
        );
      }

      // Validar que check-out é após check-in
      const checkInToCompare = checkInDate ? new Date(checkInDate) : null;
      if (checkInToCompare && checkOut <= checkInToCompare) {
        return NextResponse.json(
          { error: 'Data de check-out deve ser posterior à data de check-in' },
          { status: 400 }
        );
      }

      updateData.checkOutDate = checkOut;
      if (checkOutTime) updateData.checkOutTime = checkOutTime;
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
