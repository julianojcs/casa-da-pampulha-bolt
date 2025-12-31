import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { StaffSupply } from '@/models/StaffSupply';

export const dynamic = 'force-dynamic';

// GET - Listar materiais/suprimentos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const query: any = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const supplies = await StaffSupply.find(query)
      .sort({ urgency: -1, status: 1, order: 1 })
      .lean();

    return NextResponse.json(supplies);
  } catch (error) {
    console.error('Error fetching supplies:', error);
    return NextResponse.json({ error: 'Erro ao buscar materiais' }, { status: 500 });
  }
}

// POST - Solicitar material (staff e admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const supply = await StaffSupply.create({
      ...body,
      requestedBy: session.user.id,
      requestedByName: session.user.name,
    });

    return NextResponse.json(supply, { status: 201 });
  } catch (error) {
    console.error('Error creating supply request:', error);
    return NextResponse.json({ error: 'Erro ao solicitar material' }, { status: 500 });
  }
}

// PUT - Atualizar material
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Support both query param and body for ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || body._id || body.id;
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Remove _id and id from body to avoid issues
    const { _id, id: bodyId, ...updateData } = body;

    // Se for aprovação, adicionar dados do aprovador
    if (updateData.approvedBy === undefined && session.user.role === 'admin' && updateData.status === 'ok') {
      updateData.approvedBy = session.user.id;
      updateData.approvedAt = new Date();
    }

    const supply = await StaffSupply.findByIdAndUpdate(id, updateData, { new: true });
    if (!supply) {
      return NextResponse.json({ error: 'Material não encontrado' }, { status: 404 });
    }

    return NextResponse.json(supply);
  } catch (error) {
    console.error('Error updating supply:', error);
    return NextResponse.json({ error: 'Erro ao atualizar material' }, { status: 500 });
  }
}

// DELETE - Excluir material (apenas admin)
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

    await StaffSupply.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supply:', error);
    return NextResponse.json({ error: 'Erro ao excluir material' }, { status: 500 });
  }
}
