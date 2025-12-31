import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Reservation, IReservation } from '@/models/Reservation';

export const dynamic = 'force-dynamic';

// PUT - Update guests and vehicles for a reservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { guests, vehicles } = body;

    await dbConnect();

    // Find the reservation and verify ownership
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Check if user owns this reservation (by userId or guestEmail)
    const isOwner =
      reservation.userId === session.user.id ||
      reservation.guestEmail === session.user.email;

    if (!isOwner && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Validate vehicles limit
    if (vehicles && vehicles.length > 5) {
      return NextResponse.json(
        { error: 'Máximo de 5 veículos permitidos' },
        { status: 400 }
      );
    }

    // Update reservation with guests and vehicles
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      {
        guests: guests || [],
        vehicles: vehicles || [],
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Erro ao atualizar hóspedes/veículos:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar informações' },
      { status: 500 }
    );
  }
}

// GET - Get guests and vehicles for a reservation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const reservation = await Reservation.findById(id).lean<IReservation>();

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Check ownership
    const isOwner =
      reservation.userId === session.user.id ||
      reservation.guestEmail === session.user.email;

    if (!isOwner && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json({
      guests: reservation.guests || [],
      vehicles: reservation.vehicles || [],
    });
  } catch (error) {
    console.error('Erro ao buscar hóspedes/veículos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações' },
      { status: 500 }
    );
  }
}
