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
import { StaffTask } from '@/models/StaffTask';
import { StaffSupply } from '@/models/StaffSupply';
import { StaffMessage } from '@/models/StaffMessage';
import { Product } from '@/models/Product';

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
      totalStaff,
      pendingPreRegistrations,
      totalPlaces,
      totalGalleryItems,
      totalFaqs,
      totalRooms,
      totalAmenities,
      activeReservations,
      totalReservations,
      pendingTasks,
      inProgressTasks,
      pendingSupplies,
      activeMessages,
      totalProducts,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'guest', isActive: true }),
      User.countDocuments({ role: 'staff', isActive: true }),
      PreRegistration.countDocuments({ status: 'pending' }),
      Place.countDocuments({ isActive: true }),
      GalleryItem.countDocuments({ isActive: true }),
      FAQ.countDocuments({ isActive: true }),
      Room.countDocuments({ isActive: true }),
      Amenity.countDocuments({ isActive: true }),
      Reservation.countDocuments({ status: { $in: ['upcoming', 'current'] } }),
      Reservation.countDocuments({ status: { $ne: 'cancelled' } }),
      StaffTask.countDocuments({ status: 'pending' }),
      StaffTask.countDocuments({ status: 'in-progress' }),
      StaffSupply.countDocuments({ status: { $in: ['low', 'critical', 'out-of-stock'] } }),
      StaffMessage.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
    ]);

    return NextResponse.json({
      users: totalUsers,
      guests: totalGuests,
      staff: totalStaff,
      preRegistrations: pendingPreRegistrations,
      places: totalPlaces,
      gallery: totalGalleryItems,
      faqs: totalFaqs,
      rooms: totalRooms,
      amenities: totalAmenities,
      // Total para o grupo Usuários
      usersGroupTotal: totalGuests + pendingPreRegistrations + totalStaff,
      // Contadores de reservas
      activeReservations: activeReservations,
      totalReservations: totalReservations,
      // Staff management stats
      pendingTasks: pendingTasks,
      inProgressTasks: inProgressTasks,
      totalActiveTasks: pendingTasks + inProgressTasks,
      pendingSupplies: pendingSupplies,
      activeMessages: activeMessages,
      // Products
      products: totalProducts,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
