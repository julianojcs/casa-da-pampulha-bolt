import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { GuestRegistration } from '@/models/GuestRegistration';

export const dynamic = 'force-dynamic';

// GET - Buscar documentos do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const guestRegistration = await GuestRegistration.findOne({
      email: session.user.email,
    })
      .select('documentType document documentImage')
      .lean();

    if (!guestRegistration) {
      return NextResponse.json({
        documentType: 'CPF',
        document: '',
        documentImage: '',
      });
    }

    return NextResponse.json(guestRegistration);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar documentos' }, { status: 500 });
  }
}

// PUT - Atualizar documentos do usuário
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { documentType, document, documentImage } = body;

    // Buscar ou criar registro
    let guestRegistration = await GuestRegistration.findOne({
      email: session.user.email,
    });

    if (!guestRegistration) {
      guestRegistration = new GuestRegistration({
        name: session.user.name,
        email: session.user.email,
        phone: '',
        documentType: documentType || 'CPF',
        document: document || '',
        documentImage: documentImage || '',
        checkInDate: new Date(),
        checkOutDate: new Date(),
        agreedToRules: true,
      });
    } else {
      guestRegistration.documentType = documentType || guestRegistration.documentType;
      guestRegistration.document = document || guestRegistration.document;
      guestRegistration.documentImage = documentImage || guestRegistration.documentImage;
    }

    await guestRegistration.save();

    return NextResponse.json({
      documentType: guestRegistration.documentType,
      document: guestRegistration.document,
      documentImage: guestRegistration.documentImage,
    });
  } catch (error) {
    console.error('Erro ao atualizar documentos:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar documentos' },
      { status: 500 }
    );
  }
}
