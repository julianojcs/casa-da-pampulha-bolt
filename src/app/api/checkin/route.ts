import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { CheckinInfo } from '@/models/CheckinInfo';
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

    const items = await CheckinInfo.find(query).sort({ order: 1 });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching checkin info:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações de check-in' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const item = await CheckinInfo.create(body);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating checkin info:', error);
    return NextResponse.json(
      { error: 'Erro ao criar informação de check-in' },
      { status: 500 }
    );
  }
}
