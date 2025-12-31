import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Reservation } from '@/models';
import { User } from '@/models/User';
import { IReservation } from '@/types';

// GET - Listar reservas com filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'staff')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const period = searchParams.get('period'); // 'past', 'current', 'upcoming', 'all'
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    // Atualizar status das reservas baseado nas datas
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Atualizar reservas que começaram para 'current'
    await Reservation.updateMany(
      {
        status: 'upcoming',
        checkInDate: { $lte: now },
        checkOutDate: { $gt: today }
      },
      { status: 'current' }
    );

    // Atualizar reservas que terminaram para 'completed'
    await Reservation.updateMany(
      {
        status: { $in: ['upcoming', 'current'] },
        checkOutDate: { $lt: today }
      },
      { status: 'completed' }
    );

    // Construir query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (period === 'past') {
      query.status = 'completed';
    } else if (period === 'current') {
      query.status = 'current';
    } else if (period === 'upcoming') {
      query.status = 'upcoming';
    }

    if (userId) {
      query.userId = userId;
    }

    let queryBuilder = Reservation.find(query).sort({ checkInDate: -1 });

    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }

    const reservations = await queryBuilder.lean();

    // Fetch guest data for each reservation from User model
    const userIds = Array.from(new Set(reservations.map((r: any) => r.userId)));
    const guests = await User.find({ _id: { $in: userIds } }).select('_id name email phone avatar').lean();
    const guestMap = new Map(guests.map((g: any) => [g._id.toString(), g]));

    const reservationsWithGuests = reservations.map((r: any) => {
      const guest = guestMap.get(r.userId);
      return {
        ...r,
        guest: guest ? {
          _id: guest._id,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          avatar: guest.avatar,
        } : undefined,
      };
    });

    return NextResponse.json(reservationsWithGuests);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 }
    );
  }
}

// POST - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      userId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      numberOfGuests,
      notes,
      source,
      confirmationCode,
      totalAmount,
      isPaid,
    } = body;

    // Validações
    if (!userId || !guestName || !guestPhone || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: userId, guestName, guestPhone, checkInDate, checkOutDate' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: 'Data de check-out deve ser posterior ao check-in' },
        { status: 400 }
      );
    }

    // Verificar conflito de datas
    const conflict = await Reservation.findOne({
      status: { $ne: 'cancelled' },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn }
        }
      ]
    });

    if (conflict) {
      return NextResponse.json(
        { error: 'Já existe uma reserva para este período' },
        { status: 400 }
      );
    }

    // Determinar status inicial
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let status: IReservation['status'] = 'upcoming';

    if (checkIn <= now && checkOut > today) {
      status = 'current';
    } else if (checkOut < today) {
      status = 'completed';
    }

    const reservation = await Reservation.create({
      userId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate: checkIn,
      checkInTime: checkInTime || '15:00',
      checkOutDate: checkOut,
      checkOutTime: checkOutTime || '11:00',
      numberOfGuests,
      notes,
      status,
      source: source || 'direct',
      confirmationCode,
      totalAmount,
      isPaid: isPaid ?? false,
      createdBy: session.user?.email || 'admin',
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao criar reserva' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar reserva
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const {
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      numberOfGuests,
      notes,
      status,
      source,
      confirmationCode,
      totalAmount,
      isPaid,
    } = body;

    const updateData: Partial<IReservation> = {};

    if (guestName) updateData.guestName = guestName;
    if (guestEmail !== undefined) updateData.guestEmail = guestEmail;
    if (guestPhone) updateData.guestPhone = guestPhone;
    if (checkInDate) updateData.checkInDate = new Date(checkInDate);
    if (checkInTime) updateData.checkInTime = checkInTime;
    if (checkOutDate) updateData.checkOutDate = new Date(checkOutDate);
    if (checkOutTime) updateData.checkOutTime = checkOutTime;
    if (numberOfGuests !== undefined) updateData.numberOfGuests = numberOfGuests;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    if (source) updateData.source = source;
    if (confirmationCode !== undefined) updateData.confirmationCode = confirmationCode;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (isPaid !== undefined) updateData.isPaid = isPaid;

    // Validar datas se fornecidas
    if (updateData.checkInDate && updateData.checkOutDate) {
      if (updateData.checkOutDate <= updateData.checkInDate) {
        return NextResponse.json(
          { error: 'Data de check-out deve ser posterior ao check-in' },
          { status: 400 }
        );
      }
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar reserva' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir/cancelar reserva
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const cancel = searchParams.get('cancel'); // Se true, apenas marca como cancelada

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    if (cancel === 'true') {
      const reservation = await Reservation.findByIdAndUpdate(
        id,
        { status: 'cancelled' },
        { new: true }
      );

      if (!reservation) {
        return NextResponse.json(
          { error: 'Reserva não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Reserva cancelada', reservation });
    }

    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Reserva excluída' });
  } catch (error) {
    console.error('Erro ao excluir reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir reserva' },
      { status: 500 }
    );
  }
}
