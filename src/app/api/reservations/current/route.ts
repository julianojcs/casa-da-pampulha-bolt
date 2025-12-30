import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Reservation, User } from '@/models';
import { IReservation } from '@/types';

interface ReservationDoc extends IReservation {
  _id: string;
}

// GET - Buscar reserva atual (em andamento)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Atualizar status das reservas primeiro
    await Reservation.updateMany(
      {
        status: 'upcoming',
        checkInDate: { $lte: now },
        checkOutDate: { $gt: today }
      },
      { status: 'current' }
    );

    await Reservation.updateMany(
      {
        status: { $in: ['upcoming', 'current'] },
        checkOutDate: { $lt: today }
      },
      { status: 'completed' }
    );

    // Buscar reserva atual
    const currentReservation = await Reservation.findOne({
      status: 'current'
    }).lean() as ReservationDoc | null;

    if (!currentReservation) {
      // Buscar próxima reserva se não houver atual
      const nextReservation = await Reservation.findOne({
        status: 'upcoming',
        checkInDate: { $gte: today }
      })
        .sort({ checkInDate: 1 })
        .lean() as ReservationDoc | null;

      if (nextReservation) {
        // Buscar dados do hóspede
        const guest = await User.findById(nextReservation.userId).lean() as any;

        return NextResponse.json({
          current: null,
          next: {
            ...nextReservation,
            guest: guest ? {
              _id: guest._id,
              name: guest.name,
              email: guest.email,
              phone: guest.phone,
              avatar: guest.avatar,
            } : null
          }
        });
      }

      return NextResponse.json({ current: null, next: null });
    }

    // Buscar dados do hóspede da reserva atual
    const guest = await User.findById(currentReservation.userId).lean() as any;

    // Buscar próxima reserva também
    const nextReservation = await Reservation.findOne({
      status: 'upcoming',
      checkInDate: { $gt: currentReservation.checkOutDate }
    })
      .sort({ checkInDate: 1 })
      .lean() as ReservationDoc | null;

    let nextWithGuest = null;
    if (nextReservation) {
      const nextGuest = await User.findById(nextReservation.userId).lean() as any;
      nextWithGuest = {
        ...nextReservation,
        guest: nextGuest ? {
          _id: nextGuest._id,
          name: nextGuest.name,
          email: nextGuest.email,
          phone: nextGuest.phone,
          avatar: nextGuest.avatar,
        } : null
      };
    }

    return NextResponse.json({
      current: {
        ...currentReservation,
        guest: guest ? {
          _id: guest._id,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          avatar: guest.avatar,
        } : null
      },
      next: nextWithGuest
    });
  } catch (error) {
    console.error('Erro ao buscar reserva atual:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reserva atual' },
      { status: 500 }
    );
  }
}
