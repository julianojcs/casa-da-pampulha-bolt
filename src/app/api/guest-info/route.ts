import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GuestInfo } from '@/models/GuestInfo';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeRestricted = searchParams.get('includeRestricted') === 'true';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (type) {
      query.type = type;
    }

    // Only include restricted items if user is authenticated
    if (!includeRestricted) {
      const session = await getServerSession(authOptions);
      if (!session) {
        query.isRestricted = false;
      }
    }

    const items = await GuestInfo.find(query).sort({ order: 1 });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching guest info:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações para hóspedes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const item = await GuestInfo.create(body);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating guest info:', error);
    return NextResponse.json(
      { error: 'Erro ao criar informação para hóspede' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await request.json();
    const updated = await GuestInfo.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating guest info:', error);
    return NextResponse.json({ error: 'Erro ao atualizar informação para hóspede' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const deleted = await GuestInfo.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guest info:', error);
    return NextResponse.json({ error: 'Erro ao deletar informação para hóspede' }, { status: 500 });
  }
}
