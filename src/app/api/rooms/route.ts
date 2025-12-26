import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Room } from '@/models/Room';

export async function GET() {
  try {
    await dbConnect();

    const rooms = await Room.find({ isActive: true }).sort({ order: 1 });

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
