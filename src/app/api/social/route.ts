import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SocialLink } from '@/models/SocialLink';

export async function GET() {
  try {
    await dbConnect();

    const links = await SocialLink.find({ isActive: true }).sort({ order: 1 });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching social links:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar redes sociais' },
      { status: 500 }
    );
  }
}
