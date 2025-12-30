import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Listar todos os hóspedes (usuários com role='guest')
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Buscar usuários com role='guest'
    const guests = await User.find({ role: 'guest' })
      .select('-password -emailVerificationToken')
      .sort({ createdAt: -1 });

    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar hóspedes' },
      { status: 500 }
    );
  }
}

// POST - Criar novo hóspede (admin criando diretamente)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    // Validar campos obrigatórios
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe usuário com este email
    const existingEmail = await User.findOne({ email: body.email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 400 }
      );
    }

    // Verificar se já existe usuário com este telefone
    const existingPhone = await User.findOne({ phone: body.phone });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este telefone' },
        { status: 400 }
      );
    }

    // Gerar senha temporária
    const tempPassword = Math.random().toString(36).slice(-8);

    // Criar usuário hóspede
    const guest = await User.create({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      password: tempPassword,
      role: 'guest',
      isActive: body.isActive ?? true,
      emailVerified: body.emailVerified ?? false,
      avatar: body.avatar || '',
      // Campos adicionais de hóspede
      document: body.document,
      documentType: body.documentType,
      nationality: body.nationality,
      birthDate: body.birthDate,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      notes: body.notes,
    });

    return NextResponse.json(
      {
        ...guest.toObject(),
        password: undefined,
        tempPassword: tempPassword // Retornar senha temporária para o admin
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { error: 'Erro ao criar hóspede' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar hóspede
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID do hóspede não informado' }, { status: 400 });
    }

    await dbConnect();

    const body = await request.json();

    // Remover campos que não devem ser atualizados diretamente
    delete body.password;
    delete body.emailVerificationToken;
    delete body.emailVerificationExpires;

    // Se email for alterado, verificar duplicidade
    if (body.email) {
      const existing = await User.findOne({
        email: body.email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Já existe um usuário com este email' },
          { status: 400 }
        );
      }
      body.email = body.email.toLowerCase();
    }

    const updated = await User.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).select('-password -emailVerificationToken');

    if (!updated) {
      return NextResponse.json({ error: 'Hóspede não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json({ error: 'Erro ao atualizar hóspede' }, { status: 500 });
  }
}

// DELETE - Excluir hóspede
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID do hóspede não informado' }, { status: 400 });
    }

    await dbConnect();

    const deleted = await User.findOneAndDelete({ _id: id, role: 'guest' });
    if (!deleted) {
      return NextResponse.json({ error: 'Hóspede não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ error: 'Erro ao excluir hóspede' }, { status: 500 });
  }
}
