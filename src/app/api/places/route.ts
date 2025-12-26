import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Place } from '@/models/Place';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rating = searchParams.get('rating');
    const maxDistance = searchParams.get('maxDistance');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (rating) {
      query.rating = { $gte: parseInt(rating) };
    }

    let places = await Place.find(query).sort({ rating: -1, name: 1 });

    // Filter by distance if provided
    if (maxDistance) {
      const maxDist = parseFloat(maxDistance);
      places = places.filter(place => {
        if (!place.distance) return true;
        const distMatch = place.distance.match(/[\d.]+/);
        if (!distMatch) return true;
        const dist = parseFloat(distMatch[0]);
        const isKm = place.distance.includes('km');
        const distInKm = isKm ? dist : dist / 1000;
        return distInKm <= maxDist;
      });
    }

    return NextResponse.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar locais' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const place = await Place.create(body);

    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Erro ao criar local' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const place = await Place.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!place) {
      return NextResponse.json(
        { error: 'Local não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);
  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar local' },
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
        { error: 'ID não fornecido' },
        { status: 400 }
      );
    }

    const place = await Place.findByIdAndDelete(id);

    if (!place) {
      return NextResponse.json(
        { error: 'Local não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Local removido com sucesso' });
  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar local' },
      { status: 500 }
    );
  }
}
