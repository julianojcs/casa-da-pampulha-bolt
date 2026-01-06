import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Reservation } from '@/models/Reservation';

// GET - Public endpoint to get minimal reservation data for calendar display
// Only returns date ranges for future reservations, no personal data
export async function GET() {
  try {
    await dbConnect();

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch only upcoming and current reservations
    // Return minimal data needed for calendar display
    const reservations = await Reservation.find({
      status: { $in: ['upcoming', 'current'] },
      checkOutDate: { $gte: today },
    })
      .select('checkInDate checkOutDate status source reservationCode')
      .sort({ checkInDate: 1 })
      .lean();

    // Map to minimal structure without sensitive data
    const publicReservations = reservations.map((res: any) => ({
      _id: res._id.toString(),
      checkInDate: res.checkInDate,
      checkOutDate: res.checkOutDate,
      status: res.status,
      source: res.source,
      reservationCode: res.reservationCode,
      // Don't include personal data for public view
      guestName: 'Reservado',
      guestPhone: '',
    }));

    return NextResponse.json({
      reservations: publicReservations,
    });
  } catch (error) {
    console.error('Error fetching public reservations:', error);
    return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 });
  }
}
