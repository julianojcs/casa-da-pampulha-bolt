import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { PreRegistration } from '@/models/PreRegistration';
import { Place } from '@/models/Place';
import { GalleryItem } from '@/models/GalleryItem';
import { FAQ } from '@/models/FAQ';
import { Room } from '@/models/Room';
import { Amenity } from '@/models/Amenity';
import { Reservation } from '@/models/Reservation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    // Contadores em paralelo para performance
    const [
      totalUsers,
      totalGuests,
      pendingPreRegistrations,
      totalPlaces,
      totalGalleryItems,
      totalFaqs,
      totalRooms,
      totalAmenities,
      activeReservations,
      totalReservations,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'guest', isActive: true }),
      PreRegistration.countDocuments({ status: 'pending' }),
      Place.countDocuments({ isActive: true }),
      GalleryItem.countDocuments({ isActive: true }),
      FAQ.countDocuments({ isActive: true }),
      Room.countDocuments({ isActive: true }),
      Amenity.countDocuments({ isActive: true }),
      Reservation.countDocuments({ status: { $in: ['upcoming', 'current'] } }),
      Reservation.countDocuments({ status: { $ne: 'cancelled' } }),
    ]);

    return NextResponse.json({
      users: totalUsers,
      guests: totalGuests,
      preRegistrations: pendingPreRegistrations,
      places: totalPlaces,
      gallery: totalGalleryItems,
      faqs: totalFaqs,
      rooms: totalRooms,
      amenities: totalAmenities,
      // Total para o grupo Usuários
      usersGroupTotal: totalGuests + pendingPreRegistrations,
      // Contadores de reservas
      activeReservations: activeReservations,
      totalReservations: totalReservations,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
