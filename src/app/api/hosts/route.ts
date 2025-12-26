import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Host } from '@/models/Host';

export async function GET() {
  try {
    await dbConnect();

    const hosts = await Host.find().sort({ name: 1 });

    return NextResponse.json(hosts);
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar anfitriões' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const host = await Host.create(body);

    return NextResponse.json(host, { status: 201 });
  } catch (error) {
    console.error('Error creating host:', error);
    return NextResponse.json(
      { error: 'Erro ao criar anfitrião' },
      { status: 500 }
    );
  }
}
