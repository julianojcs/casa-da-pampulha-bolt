import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Room } from '@/models/Room';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (!includeInactive) {
      query.isActive = true;
    }

    const rooms = await Room.find(query).sort({ order: 1 });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar quartos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const room = await Room.create(body);

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Erro ao criar quarto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const room = await Room.findByIdAndUpdate(id, body, { new: true });

    if (!room) {
      return NextResponse.json(
        { error: 'Quarto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar quarto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return NextResponse.json(
        { error: 'Quarto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir quarto' },
      { status: 500 }
    );
  }
}
