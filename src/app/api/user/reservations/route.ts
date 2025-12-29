import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { GuestRegistration } from '@/models/GuestRegistration';

export const dynamic = 'force-dynamic';

// GET - Listar reservas do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    // Buscar todos os registros de hóspede pelo email do usuário
    const reservations = await GuestRegistration.find({
      email: session.user.email,
    })
      .sort({ checkInDate: -1 })
      .lean();

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 });
  }
}
