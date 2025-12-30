import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Amenity } from '@/models/Amenity';
import { FAQ } from '@/models/FAQ';
import { Room } from '@/models/Room';
import { GalleryItem } from '@/models/GalleryItem';
import { GuestInfo } from '@/models/GuestInfo';

type ModelType = 'amenities' | 'faqs' | 'rooms' | 'gallery' | 'guest-info';

const models: Record<ModelType, any> = {
  amenities: Amenity,
  faqs: FAQ,
  rooms: Room,
  gallery: GalleryItem,
  'guest-info': GuestInfo,
};

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { model, items } = await request.json();

    if (!model || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Model e items são obrigatórios' },
        { status: 400 }
      );
    }

    if (!models[model as ModelType]) {
      return NextResponse.json(
        { error: 'Model inválido' },
        { status: 400 }
      );
    }

    const Model = models[model as ModelType];

    // Atualizar ordem de cada item
    const updatePromises = items.map((item: { _id: string; order: number }) =>
      Model.updateOne({ _id: item._id }, { $set: { order: item.order } })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering items:', error);
    return NextResponse.json(
      { error: 'Erro ao reordenar itens' },
      { status: 500 }
    );
  }
}
