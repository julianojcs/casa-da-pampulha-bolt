import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { StaffTask } from '@/models/StaffTask';

export const dynamic = 'force-dynamic';

// GET - Listar tarefas (staff vê as suas, admin vê todas)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const assignedTo = searchParams.get('assignedTo');

    const query: any = {};

    // Staff só vê suas próprias tarefas
    if (session.user.role === 'staff') {
      query.assignedTo = session.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const tasks = await StaffTask.find(query)
      .sort({ priority: -1, dueDate: 1, order: 1 })
      .lean();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Erro ao buscar tarefas' }, { status: 500 });
  }
}

// POST - Criar tarefa (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const task = await StaffTask.create({
      ...body,
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 });
  }
}

// PUT - Atualizar tarefa
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Get id from body or searchParams
    const { searchParams } = new URL(request.url);
    const id = body.id || searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Staff só pode atualizar status de suas tarefas
    if (session.user.role === 'staff') {
      const task = await StaffTask.findById(id);
      if (!task || task.assignedTo !== session.user.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
      // Staff só pode mudar status e notes
      const allowedUpdates: any = {};
      if (body.status) {
        allowedUpdates.status = body.status;
        if (body.status === 'completed') {
          allowedUpdates.completedAt = new Date();
          allowedUpdates.completedBy = session.user.id;
        }
      }
      if (body.notes !== undefined) allowedUpdates.notes = body.notes;

      const updated = await StaffTask.findByIdAndUpdate(id, allowedUpdates, { new: true });
      return NextResponse.json(updated);
    }

    // Admin pode atualizar tudo
    const task = await StaffTask.findByIdAndUpdate(id, body, { new: true });
    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 });
  }
}

// DELETE - Excluir tarefa (apenas admin)
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

    await StaffTask.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Erro ao excluir tarefa' }, { status: 500 });
  }
}
