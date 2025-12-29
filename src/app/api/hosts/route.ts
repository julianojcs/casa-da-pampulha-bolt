import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Buscar usuários que são hosts (têm host data)
    const users = await User.find({
      host: { $ne: null },
      isActive: true
    })
      .select('name avatar host')
      .sort({ name: 1 })
      .lean();

    // Transformar para o formato esperado pelo frontend
    const hosts = users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      photo: user.avatar || '',
      bio: user.host?.bio || '',
      role: user.host?.role || '',
      languages: user.host?.languages || [],
      responseTime: user.host?.responseTime || '',
      responseRate: user.host?.responseRate || '',
      isSuperhost: user.host?.isSuperhost || false,
      joinedDate: user.host?.joinedDate || '',
    }));

    return NextResponse.json(hosts);
  } catch (error) {
    console.error('Error fetching hosts:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar anfitriões' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados de host de um usuário
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

    // Atualizar o host embedded no usuário
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          'host.bio': body.bio,
          'host.role': body.role,
          'host.languages': body.languages,
          'host.responseTime': body.responseTime,
          'host.responseRate': body.responseRate,
          'host.isSuperhost': body.isSuperhost,
          'host.joinedDate': body.joinedDate,
        }
      },
      { new: true }
    ).select('name avatar host');

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: user._id.toString(),
      name: user.name,
      photo: user.avatar || '',
      bio: user.host?.bio || '',
      role: user.host?.role || '',
      languages: user.host?.languages || [],
      responseTime: user.host?.responseTime || '',
      responseRate: user.host?.responseRate || '',
      isSuperhost: user.host?.isSuperhost || false,
      joinedDate: user.host?.joinedDate || '',
    });
  } catch (error) {
    console.error('Error updating host:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar anfitrião' },
      { status: 500 }
    );
  }
}
