import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { KidsArea } from '@/models/KidsArea';

export async function GET() {
  try {
    await dbConnect();

    const kidsArea = await KidsArea.findOne({ isActive: true });

    return NextResponse.json(kidsArea);
  } catch (error) {
    console.error('Error fetching kids area:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar área das crianças' },
      { status: 500 }
    );
  }
}
