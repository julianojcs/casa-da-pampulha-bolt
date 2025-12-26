import dbConnect from '@/lib/mongodb';
import { Place } from '@/models/Place';
import PlaceCard from '@/components/PlaceCard';

export const metadata = {
  title: 'Guia Local | Casa da Pampulha',
  description: 'Descubra o que fazer e onde comer perto da Casa da Pampulha. Atrações, restaurantes, bares e muito mais.',
};

async function getPlaces() {
  await dbConnect();
  const places = await Place.find({ isActive: true }).sort({ rating: -1, name: 1 });
  return JSON.parse(JSON.stringify(places));
}

export default async function GuiaLocalPage() {
  const places = await getPlaces();

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-700 text-white py-16">
        <div className="container-section py-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Guia Local</h1>
          <p className="text-lg text-amber-100">
            Descubra o que fazer e onde comer na região da Pampulha
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container-section">
        <PlaceCard places={places} />
      </section>
    </div>
  );
}
