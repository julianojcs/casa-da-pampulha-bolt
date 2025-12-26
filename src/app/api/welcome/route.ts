import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WelcomeGuide } from '@/models/WelcomeGuide';

export async function GET() {
  try {
    await dbConnect();

    const guide = await WelcomeGuide.findOne({ isActive: true });

    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error fetching welcome guide:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar guia de boas-vindas' },
      { status: 500 }
    );
  }
}
