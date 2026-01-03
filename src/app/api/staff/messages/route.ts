import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { StaffMessage } from '@/models/StaffMessage';

export const dynamic = 'force-dynamic';

// GET - Listar mensagens
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const query: any = { isActive: true };
    const now = new Date();

    // Filtrar mensagens expiradas
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ];

    // Staff vê apenas mensagens direcionadas a ele
    if (session.user.role === 'staff') {
      const userJobType = (session.user as any).staff?.jobType;
      query.$and = [
        {
          $or: [
            { targetRoles: { $size: 0 } },
            { targetRoles: 'all' },
            { targetRoles: userJobType },
            { targetUsers: session.user.id },
          ],
        },
      ];
    }

    const messages = await StaffMessage.find(query)
      .sort({ isPinned: -1, priority: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 });
  }
}

// POST - Criar mensagem (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const message = await StaffMessage.create({
      ...body,
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Erro ao criar mensagem' }, { status: 500 });
  }
}

// PUT - Atualizar mensagem (admin) ou marcar como lida (staff)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    // Accept id from body or searchParams (support both 'id' and '_id')
    const id = body.id || body._id || searchParams.get('id');
    // Accept markAsRead from body or searchParams
    const markAsRead = body.markAsRead || searchParams.get('markAsRead');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Staff pode apenas marcar como lida
    if (markAsRead === true || markAsRead === 'true') {
      const message = await StaffMessage.findByIdAndUpdate(
        id,
        { $addToSet: { readBy: session.user.id } },
        { new: true }
      );
      return NextResponse.json(message);
    }

    // Admin pode editar
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const message = await StaffMessage.findByIdAndUpdate(id, body, { new: true });
    if (!message) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Erro ao atualizar mensagem' }, { status: 500 });
  }
}

// DELETE - Excluir mensagem (apenas admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    await StaffMessage.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Erro ao excluir mensagem' }, { status: 500 });
  }
}
