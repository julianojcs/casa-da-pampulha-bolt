import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GuestRegistration } from '@/models/GuestRegistration';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const registrations = await GuestRegistration.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching guest registrations:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar registros de hóspedes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.agreedToRules) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    const registration = await GuestRegistration.create(body);

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Error creating guest registration:', error);
    return NextResponse.json(
      { error: 'Erro ao criar registro de hóspede' },
      { status: 500 }
    );
  }
}

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

    // Prevent removing required agreedToRules flag
    if (body.agreedToRules === undefined) {
      body.agreedToRules = true;
    }

    const updated = await GuestRegistration.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Hóspede não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating guest registration:', error);
    return NextResponse.json({ error: 'Erro ao atualizar registro de hóspede' }, { status: 500 });
  }
}

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

    const deleted = await GuestRegistration.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Hóspede não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guest registration:', error);
    return NextResponse.json({ error: 'Erro ao excluir registro de hóspede' }, { status: 500 });
  }
}
