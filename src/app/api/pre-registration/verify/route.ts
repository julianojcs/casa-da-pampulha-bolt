import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PreRegistration } from '@/models/PreRegistration';

export const dynamic = 'force-dynamic';

// GET - Verificar token de pré-cadastro
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    await dbConnect();

    const preRegistration = await PreRegistration.findOne({
      token,
      status: 'pending',
    });

    if (!preRegistration) {
      return NextResponse.json(
        { error: 'Link de cadastro inválido ou já utilizado' },
        { status: 404 }
      );
    }

    // Verificar se expirou
    if (new Date() > preRegistration.expiresAt) {
      // Marcar como expirado
      await PreRegistration.findByIdAndUpdate(preRegistration._id, {
        status: 'expired',
      });

      return NextResponse.json(
        { error: 'Link de cadastro expirado. Entre em contato com o anfitrião.' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      preRegistration: {
        _id: preRegistration._id,
        name: preRegistration.name,
        email: preRegistration.email,
        phone: preRegistration.phone,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar token' },
      { status: 500 }
    );
  }
}
