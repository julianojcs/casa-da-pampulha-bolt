import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

// GET - Listar todos os usuários (apenas admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: Record<string, unknown> = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

// POST - Criar novo usuário (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { email, name, role, phone, avatar, isHost, host, staff } = body;

    // For staff, email is optional; for other roles, email is required
    if (role !== 'staff' && !email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Check if user already exists (only if email is provided)
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
      }
    }

    // Create user - password is not required when admin creates user
    const userData: Record<string, unknown> = {
      name,
      role,
      phone,
      avatar,
      isActive: true,
      emailVerified: true, // Admin creating user, no need for verification
    };

    // Only add email if provided
    if (email) {
      userData.email = email.toLowerCase();
    }

    // isHost is a characteristic for guests (indicates they are a host on Airbnb)
    if (role === 'guest' && isHost !== undefined) {
      userData.isHost = isHost;
    }

    // Host data is only for admin users who are property hosts
    if (role === 'admin' && host) {
      userData.host = host;
    }

    // If role is staff, include staff data
    if (role === 'staff' && staff) {
      userData.staff = staff;
    }

    const user = await User.create(userData);

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
  }
}

// PUT - Atualizar usuário (apenas admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { _id, email, name, role, phone, avatar, isActive, isHost, host, staff } = body;

    if (!_id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    // Only update email if provided and not empty
    if (email) {
      updateData.email = email.toLowerCase();
    } else if (email === '' && role === 'staff') {
      // Allow clearing email for staff
      updateData.email = null;
    }
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isActive !== undefined) updateData.isActive = isActive;

    // isHost is only for guests (indicates they are a host on Airbnb)
    if (role === 'guest' && isHost !== undefined) {
      updateData.isHost = isHost;
    } else if (role !== 'guest') {
      // Clear isHost if not a guest
      updateData.isHost = false;
    }

    // Host data is only for admin users who are property hosts
    if (role === 'admin' && host) {
      updateData.host = host;
    } else if (role !== 'admin') {
      // Clear host data if not admin
      updateData.host = null;
    }

    // If role is staff, include staff data
    if (role === 'staff' && staff) {
      updateData.staff = staff;
    } else if (role !== 'staff') {
      // Clear staff data if not staff
      updateData.staff = null;
    }

    const user = await User.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true }
    ).select('-password -emailVerificationToken');

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE - Excluir usuário (apenas admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Não é possível excluir sua própria conta' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
  }
}
