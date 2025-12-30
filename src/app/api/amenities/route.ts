import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Amenity } from '@/models/Amenity';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (!includeInactive) {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    const amenities = await Amenity.find(query).sort({ order: 1 });

    return NextResponse.json(amenities, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
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

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const amenity = await Amenity.findByIdAndUpdate(id, body, { new: true });

    if (!amenity) {
      return NextResponse.json(
        { error: 'Comodidade não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(amenity);
  } catch (error) {
    console.error('Error updating amenity:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar comodidade' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const amenity = await Amenity.findByIdAndDelete(id);

    if (!amenity) {
      return NextResponse.json(
        { error: 'Comodidade não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir comodidade' },
      { status: 500 }
    );
  }
}
