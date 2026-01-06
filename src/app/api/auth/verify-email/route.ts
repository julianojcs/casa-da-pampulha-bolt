import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { PreRegistration } from '@/models/PreRegistration';
import { Reservation } from '@/models/Reservation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=Token inválido', request.url)
      );
    }

    await dbConnect();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=Link expirado ou inválido', request.url)
      );
    }

    // Ativar conta
    user.isActive = true;
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // Clear temporary check-in/check-out dates from User model
    // These were used for pre-registration and are now moved to Reservation model
    user.checkInDate = undefined;
    user.checkOutDate = undefined;

    await user.save();

    // Buscar pré-cadastro associado ao usuário e confirmar reservas pendentes
    try {
      const preRegistration = await PreRegistration.findOne({
        registeredUserId: user._id.toString(),
      });

      if (preRegistration) {
        // Buscar e confirmar reservas pendentes associadas ao pré-cadastro
        const pendingReservations = await Reservation.find({
          preRegistrationId: preRegistration._id.toString(),
          status: 'pending',
        });

        for (const reservation of pendingReservations) {
          reservation.userId = user._id.toString();
          reservation.status = 'upcoming';
          reservation.notes = reservation.notes?.replace('[Pré-reserva]', '[Confirmada]') || '[Confirmada]';
          await reservation.save();
        }

        // Atualizar status do pré-cadastro para completed
        preRegistration.status = 'completed';
        await preRegistration.save();

        console.log(`Reservas confirmadas para usuário ${user.email}: ${pendingReservations.length}`);
      }
    } catch (reservationError) {
      console.error('Erro ao confirmar reservas:', reservationError);
      // Não bloqueia a verificação se houver erro nas reservas
    }

    // Redirecionar para login com mensagem de sucesso
    return NextResponse.redirect(
      new URL('/login?success=Email verificado! Faça login para continuar.', request.url)
    );
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.redirect(
      new URL('/login?error=Erro ao verificar email', request.url)
    );
  }
}
