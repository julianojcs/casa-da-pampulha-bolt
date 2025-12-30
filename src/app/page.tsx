import Image from 'next/image';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { formatValue, formatRating, toNumber } from '@/lib/utils';
import { Property } from '@/models/Property';
import { Place } from '@/models/Place';
import { Amenity } from '@/models/Amenity';
import { Room } from '@/models/Room';
import { KidsArea } from '@/models/KidsArea';
import {
  CalendarIcon,
  MapPinIcon,
  SparklesIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Users, Bed } from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import { FaChild } from 'react-icons/fa';

// Types para os componentes
interface HeroProps {
  property: {
    name: string | null;
    heroTagline: string | null;
    heroSubtitle: string | null;
    airbnbUrl: string | null;
    maxGuests: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    rating: number | null;
  };
}

// Hero Section
function HeroSection({ property }: HeroProps) {
  const p = property;

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/gallery/20240119_114828.jpg"
          alt={p.name || 'Casa da Pampulha'}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
          {p.name || 'Casa da Pampulha'}
        </h1>
        <p className="text-xl md:text-2xl mb-4 text-white/90">
          {p.heroTagline || '-'}
        </p>
        <p className="text-lg md:text-xl mb-8 text-white/80">
          {p.heroSubtitle || '-'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={p.airbnbUrl || '#'}
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
            <div className="text-3xl font-bold text-amber-400">{formatValue(p.maxGuests)}</div>
            <div className="text-sm text-white/80">Hóspedes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{formatValue(p.bedrooms)}</div>
            <div className="text-sm text-white/80">Quartos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{formatValue(p.bathrooms)}</div>
            <div className="text-sm text-white/80">Banheiros</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-bold text-amber-400">{formatRating(p.rating)}</span>
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

// Types para AboutSection
interface AboutProps {
  property: {
    aboutTitle: string | null;
    aboutDescription: string[] | null;
    maxGuests: number | null;
    bedrooms: number | null;
    city: string | null;
    minNights: number | null;
    heroImages: string[];
  };
}

// About Section
function AboutSection({ property }: AboutProps) {
  const p = property;

  return (
    <section id="sobre" className="container-section bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="section-title">{p.aboutTitle || 'Sobre a Casa'}</h2>
          {p.aboutDescription && p.aboutDescription.length > 0 ? (
            p.aboutDescription.map((desc, index) => (
              <p key={index} className="text-gray-600 mb-6 leading-relaxed">{desc}</p>
            ))
          ) : (
            <p className="text-gray-600 mb-6 leading-relaxed">-</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <Users className="h-8 w-8 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-800">{formatValue(p.maxGuests)}</div>
                <div className="text-sm text-gray-500">Hóspedes</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <Bed className="h-8 w-8 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-800">{formatValue(p.bedrooms)}</div>
                <div className="text-sm text-gray-500">Quartos</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <MapPinIcon className="h-8 w-8 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-800">{formatValue(p.city)}</div>
                <div className="text-sm text-gray-500">Localização</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-800">{formatValue(p.minNights)}</div>
                <div className="text-sm text-gray-500">Noites mín.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src={p.heroImages?.[0] || '/gallery/20240119_113916.jpg'}
                alt="Sala de estar"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={p.heroImages?.[1] || '/gallery/20240119_114828.jpg'}
                alt="Piscina"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={p.heroImages?.[2] || '/gallery/20240119_114208.jpg'}
                alt="Área gourmet"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src={p.heroImages?.[3] || '/gallery/20240119_114312.jpg'}
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
        <Link href="/galeria?categoria=quartos" className="btn-primary">
          Ver Quartos
        </Link>
      </div>
    </section>
  );
}

// Rooms Preview Section
function RoomsSection({ rooms }: { rooms: any[] }) {
  const formatBeds = (beds: any[]) => {
    if (!beds || beds.length === 0) return '-';
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
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4 flex-shrink-0" />
                    {formatBeds(room.beds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    {formatValue(room.maxGuests)} hóspedes
                  </span>
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
  const airbnb = airbnbUrl || 'https://www.airbnb.com.br';
  const whatsappLink = whatsapp || 'não informado';
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
    const amenities = await Amenity.find({ isActive: true }).sort({ order: 1 }).lean();
    const rooms = await Room.find({ isActive: true }).sort({ order: 1 }).lean();
    const kidsArea = await KidsArea.findOne({ isActive: true }).lean();

    const propertyAny: any = property;

    // Convert Decimal128 rating to primitive number using helper
    const rating = toNumber(propertyAny?.rating);

    // Prepare hero props with null fallbacks
    const heroProps: HeroProps['property'] = {
      name: propertyAny?.name || null,
      heroTagline: propertyAny?.heroTagline || null,
      heroSubtitle: propertyAny?.heroSubtitle || null,
      airbnbUrl: propertyAny?.airbnbUrl || null,
      maxGuests: toNumber(propertyAny?.maxGuests),
      bedrooms: toNumber(propertyAny?.bedrooms),
      bathrooms: toNumber(propertyAny?.bathrooms),
      rating: rating,
    };

    // Prepare about props with null fallbacks
    const aboutProps: AboutProps['property'] = {
      aboutTitle: propertyAny?.aboutTitle || null,
      aboutDescription: propertyAny?.aboutDescription || null,
      maxGuests: toNumber(propertyAny?.maxGuests),
      bedrooms: toNumber(propertyAny?.bedrooms),
      city: propertyAny?.city || null,
      minNights: toNumber(propertyAny?.minNights),
      heroImages: propertyAny?.heroImages || [],
    };

    // Serializar dados para evitar problemas com lean()
    const serializedAmenities = JSON.parse(JSON.stringify(amenities || []));
    const serializedRooms = JSON.parse(JSON.stringify(rooms || []));
    const serializedKidsArea = JSON.parse(JSON.stringify(kidsArea));

    return (
      <>
        <HeroSection property={heroProps} />
        <AboutSection property={aboutProps} />
        <AmenitiesSection amenities={serializedAmenities} />
        <RoomsSection rooms={serializedRooms} />
        <KidsSection kidsArea={serializedKidsArea} />
        <WelcomeSection />
        <CTASection airbnbUrl={propertyAny?.airbnbUrl} whatsapp={propertyAny?.whatsapp} />
      </>
    );
  } catch (error) {
    console.error('Error loading home data:', error);

    // Fallback props with null values
    const fallbackHero: HeroProps['property'] = {
      name: null,
      heroTagline: null,
      heroSubtitle: null,
      airbnbUrl: null,
      maxGuests: null,
      bedrooms: null,
      bathrooms: null,
      rating: null,
    };

    const fallbackAbout: AboutProps['property'] = {
      aboutTitle: null,
      aboutDescription: null,
      maxGuests: null,
      bedrooms: null,
      city: null,
      minNights: null,
      heroImages: [],
    };

    return (
      <>
        <HeroSection property={fallbackHero} />
        <AboutSection property={fallbackAbout} />
        <AmenitiesSection amenities={[]} />
        <RoomsSection rooms={[]} />
        <KidsSection kidsArea={null} />
        <WelcomeSection />
        <CTASection />
      </>
    );
  }
}
