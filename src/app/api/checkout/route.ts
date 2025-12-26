import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import CheckoutInfo from '../../../models/CheckoutInfo';

async function dbConnect() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');
  await mongoose.connect(uri);
}

export async function GET() {
  try {
    await dbConnect();
    const checkoutInfo = await CheckoutInfo.findOne({ isActive: true });
    return NextResponse.json(checkoutInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar informações de checkout' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const checkoutInfo = await CheckoutInfo.create(body);
    return NextResponse.json(checkoutInfo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar informações de checkout' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, ...updateData } = body;

    const checkoutInfo = await CheckoutInfo.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!checkoutInfo) {
      return NextResponse.json(
        { error: 'Informações de checkout não encontradas' },
        { status: 404 }
      );
    }

    return NextResponse.json(checkoutInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar informações de checkout' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      );
    }

    const checkoutInfo = await CheckoutInfo.findByIdAndDelete(id);

    if (!checkoutInfo) {
      return NextResponse.json(
        { error: 'Informações de checkout não encontradas' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Informações de checkout removidas com sucesso' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar informações de checkout' },
      { status: 500 }
    );
  }
}
