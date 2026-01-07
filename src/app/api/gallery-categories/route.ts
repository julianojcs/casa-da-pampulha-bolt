import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GalleryCategory } from '@/models/GalleryCategory';
import { GalleryItem } from '@/models/GalleryItem';

// Default categories to seed if none exist
const defaultCategories = [
  'Fachada e Entrada',
  'Áreas Comuns',
  'Sala de Estar',
  'Quartos',
  'Suite Master',
  'Quarto Crianças',
  'Quarto Família',
  'Cozinha',
  'Área Gourmet',
  'Banheiros',
  'Área Externa',
  'Jardim',
  'Piscina/Jacuzzi',
  'Playground',
  'Estacionamento',
  'Arredores',
  'Comodidades',
  'Vizinhança',
  'Loft',
  'Vídeos',
];

// GET - List all categories
export async function GET() {
  try {
    await dbConnect();

    let categories = await GalleryCategory.find({}).sort({ order: 1, name: 1 });

    // Seed default categories if none exist
    if (categories.length === 0) {
      const categoriesToCreate = defaultCategories.map((name, index) => ({
        name,
        isDefault: name === 'Outros', // 'Outros' will be default if exists
        order: index,
        isActive: true,
      }));

      // Add 'Outros' as default category if not in list
      if (!defaultCategories.includes('Outros')) {
        categoriesToCreate.push({
          name: 'Outros',
          isDefault: true,
          order: defaultCategories.length,
          isActive: true,
        });
      }

      await GalleryCategory.insertMany(categoriesToCreate);
      categories = await GalleryCategory.find({}).sort({ order: 1, name: 1 });
    }

    // Ensure at least one default exists
    const hasDefault = categories.some(c => c.isDefault);
    if (!hasDefault && categories.length > 0) {
      // Make the first category default
      await GalleryCategory.findByIdAndUpdate(categories[0]._id, { isDefault: true });
      categories[0].isDefault = true;
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    // Check if category already exists
    const existing = await GalleryCategory.findOne({ name: data.name });
    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    // Get max order
    const maxOrder = await GalleryCategory.findOne({}).sort({ order: -1 });
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const category = await GalleryCategory.create({
      name: data.name,
      isDefault: data.isDefault || false,
      order,
      isActive: data.isActive !== false,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery category:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery category' },
      { status: 500 }
    );
  }
}

// PUT - Update a category
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await request.json();

    // Check if renaming to existing name
    if (data.name) {
      const existing = await GalleryCategory.findOne({
        name: data.name,
        _id: { $ne: id }
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 400 }
        );
      }
    }

    const oldCategory = await GalleryCategory.findById(id);
    if (!oldCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // If renaming, update all gallery items with the old category name
    if (data.name && data.name !== oldCategory.name) {
      await GalleryItem.updateMany(
        { category: oldCategory.name },
        { category: data.name }
      );
    }

    const category = await GalleryCategory.findByIdAndUpdate(id, data, { new: true });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating gallery category:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category and reassign orphaned items to default
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const category = await GalleryCategory.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Prevent deleting the default category
    if (category.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete the default category' },
        { status: 400 }
      );
    }

    // Find the default category to reassign orphaned items
    let defaultCategory = await GalleryCategory.findOne({ isDefault: true });

    // If no default exists, create one
    if (!defaultCategory) {
      defaultCategory = await GalleryCategory.create({
        name: 'Outros',
        isDefault: true,
        order: 999,
        isActive: true,
      });
    }

    // Reassign all gallery items from deleted category to default
    await GalleryItem.updateMany(
      { category: category.name },
      { category: defaultCategory.name }
    );

    // Delete the category
    await GalleryCategory.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      reassignedTo: defaultCategory.name
    });
  } catch (error) {
    console.error('Error deleting gallery category:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery category' },
      { status: 500 }
    );
  }
}
