import Image from 'next/image';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { Place } from '@/models/Place';
import { Amenity } from '@/models/Amenity';
import { Room } from '@/models/Room';
import { KidsArea } from '@/models/KidsArea';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  SparklesIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import * as FaIcons from 'react-icons/fa';
import { FaChild } from 'react-icons/fa';

// Hero Section
function HeroSection({
  stats,
}: {
  stats: { maxGuests: number; bedrooms: number; bathrooms: number; rating: number };
}) {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/gallery/20240119_114828.jpg"
          alt="Casa da Pampulha"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
          Casa da Pampulha
        </h1>
        <p className="text-xl md:text-2xl mb-4 text-white/90">
          Sua casa de férias perfeita em Belo Horizonte
        </p>
        <p className="text-lg md:text-xl mb-8 text-white/80">
          Piscina aquecida • Jacuzzi • Playground • Vista para a Lagoa
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://www.airbnb.com.br/rooms/1028115044709052736"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg"
          >
            Reserve Agora
          </a>
          <Link href="#sobre" className="btn-secondary">
            Conheça a Casa
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.maxGuests ?? '–'}</div>
            <div className="text-sm text-white/80">Hóspedes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.bedrooms ?? '–'}</div>
            <div className="text-sm text-white/80">Quartos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.bathrooms ?? '–'}</div>
            <div className="text-sm text-white/80">Banheiros</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-bold text-amber-400">{(stats.rating ?? 0).toFixed(1)}</span>
              <StarIcon className="h-6 w-6 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-sm text-white/80">Avaliação</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/80 rounded-full" />
        </div>
      </div>
    </section>
  );
}

// About Section
function AboutSection({ property }: { property?: any }) {
  const p: any = property;

  return (
    <section id="sobre" className="container-section bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="section-title">Sobre a Casa</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{p?.tagline ?? 'Bem-vindo à Casa da Pampulha, um refúgio perfeito para famílias e grupos que buscam conforto, privacidade e uma localização privilegiada em Belo Horizonte.'}</p>
          <p className="text-gray-600 mb-6 leading-relaxed">{p?.description ?? 'Localizada a poucos metros da Lagoa da Pampulha, nossa casa oferece uma experiência única de hospedagem com piscina e jacuzzi aquecidas, amplo playground para crianças, área gourmet completa e muito mais.'}</p>
          <p className="text-gray-600 mb-8 leading-relaxed">{p?.welcomeMessage ?? 'Com vários quartos confortáveis, nossa casa acomoda grupos grandes com todo o conforto e comodidade.'}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <HomeIcon className="h-8 w-8 text-amber-600" />
              <div>
                <div className="font-semibold text-gray-800">{p?.maxGuests ?? '16+'}</div>
                <div className="text-sm text-gray-500">Hóspedes</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-amber-600" />
              <div>
                <div className="font-semibold text-gray-800">{p?.bedrooms ?? 5}</div>
                <div className="text-sm text-gray-500">Quartos</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <MapPinIcon className="h-8 w-8 text-amber-600" />
              <div>
                <div className="font-semibold text-gray-800">{p?.city ?? 'Pampulha'}</div>
                <div className="text-sm text-gray-500">Localização</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-amber-600" />
              <div>
                <div className="font-semibold text-gray-800">{p?.minNights ?? 1}</div>
                <div className="text-sm text-gray-500">Noites mín.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src={p?.heroImages?.[0] ?? '/gallery/20240119_113916.jpg'}
                alt="Sala de estar"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={p?.heroImages?.[1] ?? '/gallery/20240119_114828.jpg'}
                alt="Piscina"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={p?.heroImages?.[2] ?? '/gallery/20240119_114208.jpg'}
                alt="Área gourmet"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src={p?.heroImages?.[3] ?? '/gallery/20240119_114312.jpg'}
                alt="Playground"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Amenities Section
function AmenitiesSection({ amenities }: { amenities: any[] }) {
  const ICON_MAP: Record<string, any> = {
    FaSwimmingPool: FaIcons.FaSwimmingPool,
    FaWifi: FaIcons.FaWifi,
    FaSnowflake: FaIcons.FaSnowflake,
    FaParking: FaIcons.FaParking,
    FaTv: FaIcons.FaTv,
    FaChild: FaIcons.FaChild,
    FaUtensils: FaIcons.FaUtensils,
    FaGamepad: FaIcons.FaGamepad,
    FaFire: FaIcons.FaFire,
  };

  return (
    <section id="comodidades" className="container-section bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="section-title">Comodidades</h2>
        <p className="section-subtitle max-w-2xl mx-auto">
          Tudo o que você precisa para uma estadia perfeita
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {amenities.map((amenity: any, index: number) => {
          const IconComponent = ICON_MAP[amenity.icon] || FaIcons.FaStar;
          return (
            <div
              key={amenity._id?.toString() || index}
              className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <IconComponent className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-1">{amenity.name}</h3>
              <p className="text-sm text-gray-500">{amenity.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link href="/#quartos" className="btn-primary">
          Ver Quartos
        </Link>
      </div>
    </section>
  );
}

// Rooms Preview Section
function RoomsSection({ rooms }: { rooms: any[] }) {
  const formatBeds = (beds: any[]) => {
    if (!beds || beds.length === 0) return 'N/A';
    return beds.map((bed: any) => `${bed.quantity} ${bed.type}`).join(' + ');
  };

  return (
    <section id="quartos" className="container-section bg-white">
      <div className="text-center mb-12">
        <h2 className="section-title">Quartos e Dormitórios</h2>
        <p className="section-subtitle max-w-2xl mx-auto">
          Quartos confortáveis para acomodar toda a família
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rooms.map((room: any, index: number) => {
          const mainImage = room.images?.[0] || '/gallery/20240119_113433.jpg';
          return (
            <div key={room._id?.toString() || index} className="card group">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={mainImage}
                  alt={room.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-4">{room.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>🛏️ {formatBeds(room.beds)}</span>
                  <span>👥 {room.maxGuests} hóspedes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link href="/galeria" className="btn-secondary">
          Ver Galeria Completa
        </Link>
      </div>
    </section>
  );
}

// Kids Section
function KidsSection({ kidsArea }: { kidsArea: any }) {
  if (!kidsArea) return null;

  const mainImage = kidsArea.images?.[0] || '/gallery/20240119_114312.jpg';
  const features = kidsArea.features || [];

  return (
    <section className="container-section bg-amber-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative h-96 rounded-xl overflow-hidden">
          <Image
            src={mainImage}
            alt={kidsArea.title}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
            <FaChild className="h-5 w-5" />
            <span className="font-medium">Para Crianças</span>
          </div>

          <h2 className="section-title">{kidsArea.title}</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {kidsArea.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <Link href="/galeria?categoria=Playground" className="btn-primary">
            Ver Fotos do Playground
          </Link>
        </div>
      </div>
    </section>
  );
}

// Welcome Section
function WelcomeSection() {
  return (
    <section className="container-section bg-gradient-to-br from-amber-600 to-amber-700 text-white">
      <div className="text-center max-w-3xl mx-auto">
        <SparklesIcon className="h-16 w-16 mx-auto mb-6 text-amber-200" />
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Bem-vindo à Casa da Pampulha!
        </h2>
        <p className="text-lg text-amber-100 mb-8 leading-relaxed">
          Estamos muito felizes em recebê-lo! Nossa casa foi preparada com carinho
          para oferecer a você e sua família uma experiência inesquecível.
          Aproveite cada momento e sinta-se em casa!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/guest-info" className="bg-white text-amber-700 hover:bg-amber-50 font-semibold py-3 px-6 rounded-lg transition-colors">
            Instruções de Check-in
          </Link>
          <Link href="/guia-local" className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-lg transition-colors">
            Guia Local
          </Link>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ airbnbUrl, whatsapp }: { airbnbUrl?: string; whatsapp?: string }) {
  const airbnb = airbnbUrl || 'https://www.airbnb.com.br/rooms/1028115044709052736';
  const whatsappLink = whatsapp || '5531999999999';
  const whatsappUrl = whatsapp?.startsWith('http') ? whatsapp : `https://wa.me/${whatsappLink.replace(/\D/g, '')}`;

  return (
    <section id="contato" className="container-section bg-gray-900 text-white">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Pronto para sua próxima aventura?
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Reserve agora e garanta sua estadia na Casa da Pampulha.
          Estamos esperando por você!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={airbnb}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg"
          >
            Reserve pelo Airbnb
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-lg"
          >
            Fale Conosco
          </a>
        </div>
      </div>
    </section>
  );
}

// Main Page
export default async function HomePage() {
  try {
    await dbConnect();

    const property = await Property.findOne({ isActive: true }).lean();
    const placeRatings = await Place.find({ isActive: true }).select('rating').lean();
    const amenities = await Amenity.find({ isActive: true }).sort({ order: 1 }).lean();
    const rooms = await Room.find({ isActive: true }).sort({ order: 1 }).lean();
    const kidsArea = await KidsArea.findOne({ isActive: true }).lean();

    const avgRating = placeRatings && placeRatings.length
      ? placeRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / placeRatings.length
      : 0;

    const propertyAny: any = property;

    const stats = {
      maxGuests: propertyAny?.maxGuests,
      bedrooms: propertyAny?.bedrooms,
      bathrooms: propertyAny?.bathrooms,
      rating: Number(avgRating.toFixed(1)),
    };

    // Serializar dados para evitar problemas com lean()
    const serializedAmenities = JSON.parse(JSON.stringify(amenities || []));
    const serializedRooms = JSON.parse(JSON.stringify(rooms || []));
    const serializedKidsArea = JSON.parse(JSON.stringify(kidsArea));

    return (
      <>
        <HeroSection stats={stats} />
        <AboutSection property={propertyAny} />
        <AmenitiesSection amenities={serializedAmenities} />
        <RoomsSection rooms={serializedRooms} />
        <KidsSection kidsArea={serializedKidsArea} />
        <WelcomeSection />
        <CTASection airbnbUrl={propertyAny?.airbnbUrl} whatsapp={propertyAny?.whatsapp} />
      </>
    );
  } catch (error) {
    console.error('Error loading home data:', error);
    const fallback = { maxGuests: 16, bedrooms: 5, bathrooms: 5, rating: 5.0 };
    return (
      <>
        <HeroSection stats={fallback} />
        <AboutSection />
        <AmenitiesSection amenities={[]} />
        <RoomsSection rooms={[]} />
        <KidsSection kidsArea={null} />
        <WelcomeSection />
        <CTASection />
      </>
    );
  }
}
