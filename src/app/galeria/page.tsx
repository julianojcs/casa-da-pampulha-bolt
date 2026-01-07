import dbConnect from '@/lib/mongodb';
import { GalleryItem } from '@/models/GalleryItem';
import { GalleryCategory } from '@/models/GalleryCategory';
import { Property } from '@/models/Property';
import GalleryGrid from '@/components/GalleryGrid';
import { Suspense } from 'react';

export const metadata = {
  title: 'Galeria | Casa da Pampulha',
  description: 'Veja fotos e vídeos da Casa da Pampulha - piscina, quartos, área gourmet e muito mais.',
};

async function getGalleryItems() {
  await dbConnect();
  const items = await GalleryItem.find({ isActive: true }).sort({ order: 1, category: 1 });
  return JSON.parse(JSON.stringify(items));
}

async function getCategories() {
  await dbConnect();

  // Try to get categories from GalleryCategory collection first
  const categories = await GalleryCategory.find({ isActive: { $ne: false } }).sort({ order: 1, name: 1 });
  if (categories.length > 0) {
    return categories.map(c => c.name);
  }

  // Fallback to property config
  const prop = await Property.findOne({}).lean() as { galleryCategories?: string[] } | null;
  if (prop?.galleryCategories?.length) {
    return prop.galleryCategories;
  }

  return null;
}

export default async function GaleriaPage() {
  const items = await getGalleryItems();
  const configCategories = await getCategories();
  const categories = configCategories || Array.from(new Set(items.map((i: { category: string }) => i.category)));

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-700 text-white py-16">
        <div className="container-section py-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeria</h1>
          <p className="text-lg text-amber-100">
            Explore nossa casa através de fotos e vídeos
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-section">
        <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>}>
          <GalleryGrid
            items={items}
            categories={categories as string[]}
          />
        </Suspense>
      </section>
    </div>
  );
}
