import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GalleryItem } from '@/models/GalleryItem';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (category && category !== 'Todos') {
      query.category = category;
    }

    const items = await GalleryItem.find(query).sort({ order: 1, category: 1 });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar itens da galeria' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const item = await GalleryItem.create(body);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Erro ao criar item da galeria' },
      { status: 500 }
    );
  }
}
