import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

// GET - Buscar perfil do usuário logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
      .select('-password -emailVerificationToken')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

// PUT - Atualizar perfil do usuário
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, phone, avatar, address, city, state, country, birthDate, host } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (host) {
      updateData.host = {
        bio: host.bio || '',
        role: host.role || 'Coanfitrião',
        languages: host.languages || ['Português'],
        responseTime: host.responseTime || 'Dentro de uma hora',
        responseRate: host.responseRate || '100%',
        isSuperhost: host.isSuperhost || false,
        joinedDate: host.joinedDate ? new Date(host.joinedDate) : new Date(),
      };
    }

    const user = await User.findByIdAndUpdate(session.user.id, updateData, {
      new: true,
    }).select('-password -emailVerificationToken');

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
