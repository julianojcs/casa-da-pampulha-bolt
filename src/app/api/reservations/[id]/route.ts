import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Reservation } from '@/models/Reservation';
import { User } from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const reservation = await Reservation.findById(params.id);

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Populate guest information
    const guest = await User.findById(reservation.userId).select('name email phone avatar');

    const reservationData = {
      ...reservation.toObject(),
      guest: guest ? {
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        avatar: guest.avatar,
      } : null,
    };

    return NextResponse.json({ reservation: reservationData });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reserva' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const reservation = await Reservation.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar reserva' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const reservation = await Reservation.findByIdAndDelete(params.id);

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Reserva excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir reserva' },
      { status: 500 }
    );
  }
}
