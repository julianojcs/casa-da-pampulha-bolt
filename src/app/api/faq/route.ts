import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { FAQ } from '@/models/FAQ';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query).sort({ order: 1 });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perguntas frequentes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const faq = await FAQ.create(body);

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pergunta frequente' },
      { status: 500 }
    );
  }
}

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
    const faq = await FAQ.findByIdAndUpdate(id, body, { new: true });

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pergunta frequente' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'FAQ excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir pergunta frequente' },
      { status: 500 }
    );
  }
}
