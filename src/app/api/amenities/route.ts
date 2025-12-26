import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Amenity } from '@/models/Amenity';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    const amenities = await Amenity.find(query).sort({ order: 1 });

    return NextResponse.json(amenities);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comodidades' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const amenity = await Amenity.create(body);

    return NextResponse.json(amenity, { status: 201 });
  } catch (error) {
    console.error('Error creating amenity:', error);
    return NextResponse.json(
      { error: 'Erro ao criar comodidade' },
      { status: 500 }
    );
  }
}
