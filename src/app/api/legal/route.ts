import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LegalContent } from '@/models/LegalContent';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      const content = await LegalContent.findOne({ type });
      return NextResponse.json(content);
    }

    const contents = await LegalContent.find({});
    return NextResponse.json(contents);
  } catch (error) {
    console.error('Error fetching legal content:', error);
    return NextResponse.json({ error: 'Erro ao buscar conteúdo' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const content = await LegalContent.create(body);
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating legal content:', error);
    return NextResponse.json({ error: 'Erro ao criar conteúdo' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Tipo é obrigatório' }, { status: 400 });
    }

    const content = await LegalContent.findOneAndUpdate(
      { type },
      { items: body.items },
      { new: true, upsert: true }
    );

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating legal content:', error);
    return NextResponse.json({ error: 'Erro ao atualizar conteúdo' }, { status: 500 });
  }
}
