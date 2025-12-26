import dbConnect from '@/lib/mongodb';
import { GalleryItem } from '@/models/GalleryItem';
import GalleryGrid from '@/components/GalleryGrid';
import { galleryCategories } from '@/types';

export const metadata = {
  title: 'Galeria | Casa da Pampulha',
  description: 'Veja fotos e vídeos da Casa da Pampulha - piscina, quartos, área gourmet e muito mais.',
};

async function getGalleryItems() {
  await dbConnect();
  const items = await GalleryItem.find({ isActive: true }).sort({ order: 1, category: 1 });
  return JSON.parse(JSON.stringify(items));
}

export default async function GaleriaPage() {
  const items = await getGalleryItems();

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
        <GalleryGrid
          items={items}
          categories={galleryCategories as unknown as string[]}
        />
      </section>
    </div>
  );
}
