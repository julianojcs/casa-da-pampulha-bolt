import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Property } from '@/models/Property';

export async function GET() {
  try {
    await dbConnect();

    const property = await Property.findOne({ isActive: true });

    if (!property) {
      return NextResponse.json(
        { error: 'Propriedade não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar propriedade' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Only one property should exist
    const existingProperty = await Property.findOne();

    if (existingProperty) {
      const updatedProperty = await Property.findByIdAndUpdate(
        existingProperty._id,
        body,
        { new: true }
      );
      return NextResponse.json(updatedProperty);
    }

    const property = await Property.create(body);
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating property:', error);
    return NextResponse.json(
      { error: 'Erro ao criar/atualizar propriedade' },
      { status: 500 }
    );
  }
}
