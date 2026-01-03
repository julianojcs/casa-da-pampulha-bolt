import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Reservation } from '@/models/Reservation';
import { User } from '@/models/User';

// Helper function to calculate age from birthDate
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export const dynamic = 'force-dynamic';

// GET - Listar reservas do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    // Buscar dados do usuário incluindo birthDate
    const user = await User.findById(session.user.id).lean() as any;
    const userAge = user?.birthDate ? calculateAge(new Date(user.birthDate)) : null;

    // Buscar reservas pelo userId OU pelo email do usuário
    const reservations = await Reservation.find({
      $or: [
        { userId: session.user.id },
        { guestEmail: session.user.email }
      ]
    })
      .sort({ checkInDate: -1 })
      .lean();

    return NextResponse.json({
      reservations,
      user: {
        name: user?.name,
        email: user?.email,
        birthDate: user?.birthDate,
        age: userAge,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 });
  }
}
