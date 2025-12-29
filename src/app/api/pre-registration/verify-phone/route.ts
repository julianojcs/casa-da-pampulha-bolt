import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PreRegistration } from '@/models/PreRegistration';

// POST - Verificar pré-cadastro por telefone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Buscar pré-cadastro por telefone
    const preRegistration = await PreRegistration.findOne({
      phone,
      status: 'pending',
    });

    if (!preRegistration) {
      return NextResponse.json(
        {
          error:
            'Não encontramos um pré-cadastro com este telefone. Entre em contato com o anfitrião.',
        },
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
        {
          error:
            'Seu pré-cadastro expirou. Entre em contato com o anfitrião para um novo link.',
        },
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
    console.error('Erro ao verificar telefone:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar telefone' },
      { status: 500 }
    );
  }
}
