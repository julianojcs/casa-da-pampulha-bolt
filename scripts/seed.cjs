const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const PlaceSchema = new mongoose.Schema({
  name: String,
  description: String,
  address: String,
  category: String,
  rating: Number,
  distanceWalk: String,
  distanceCar: String,
  distance: String,
  image: String,
  mapUrl: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const GalleryItemSchema = new mongoose.Schema({
  type: String,
  src: String,
  thumbnail: String,
  title: String,
  category: String,
  order: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const PropertySchema = new mongoose.Schema({
  name: String,
  tagline: String,
  description: String,
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
  coordinates: { lat: Number, lng: Number },
  maxGuests: Number,
  bedrooms: Number,
  beds: Number,
  bathrooms: Number,
  checkInTime: String,
  checkOutTime: String,
  minNights: Number,
  airbnbUrl: String,
  airbnbCalendarUrl: String,
  heroImage: String,
  heroImages: [String],
  welcomeMessage: String,
  phone: String,
  whatsapp: String,
  email: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const HostSchema = new mongoose.Schema({
  name: String,
  bio: String,
  photo: String,
  role: String,
  languages: [String],
  responseTime: String,
  responseRate: String,
  isSuperhost: Boolean,
  joinedDate: Date,
}, { timestamps: true });

const AmenitySchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  category: String,
  isActive: { type: Boolean, default: true },
  order: Number,
}, { timestamps: true });

const FAQSchema = new mongoose.Schema({
  question: String,
  answer: String,
  category: String,
  order: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const CheckinInfoSchema = new mongoose.Schema({
  type: String,
  title: String,
  content: String,
  icon: String,
  order: Number,
  isRestricted: Boolean,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const KidsAreaSchema = new mongoose.Schema({
  title: String,
  description: String,
  features: [String],
  images: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const SocialLinkSchema = new mongoose.Schema({
  platform: String,
  url: String,
  icon: String,
  isActive: { type: Boolean, default: true },
  order: Number,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  phone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Place = mongoose.models.Place || mongoose.model('Place', PlaceSchema);
const GalleryItem = mongoose.models.GalleryItem || mongoose.model('GalleryItem', GalleryItemSchema);
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);
const Host = mongoose.models.Host || mongoose.model('Host', HostSchema);
const Amenity = mongoose.models.Amenity || mongoose.model('Amenity', AmenitySchema);
const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
const CheckinInfo = mongoose.models.CheckinInfo || mongoose.model('CheckinInfo', CheckinInfoSchema);
const KidsArea = mongoose.models.KidsArea || mongoose.model('KidsArea', KidsAreaSchema);
const SocialLink = mongoose.models.SocialLink || mongoose.model('SocialLink', SocialLinkSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const RoomSchema = new mongoose.Schema({
  name: String,
  description: String,
  beds: [{
    type: { type: String },
    quantity: { type: Number }
  }],
  maxGuests: Number,
  amenities: [String],
  images: [String],
  order: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

// Minimal data (reused from TypeScript seed) - keep concise to avoid huge file
const placesData = [
  { name: "Lagoa da Pampulha", description: "Explore a beleza da Lagoa da Pampulha.", address: "Pampulha, Belo Horizonte", category: "attractions", rating: 5, distanceWalk: "4 min", distanceCar: "1 min", distance: "250 m", image: "/images/Lagoa_da_Pampulha.png" },
];

const galleryData = [
  { type: "image", src: "/gallery/20240119_114208.jpg", thumbnail: "/gallery/thumbnails/20240119_114208 Pequena.jpeg", title: "Cozinha da área gourmet", category: "Área Gourmet", order: 1 },
];

const propertyData = {
  name: "Casa da Pampulha",
  tagline: "Sua casa de férias perfeita em Belo Horizonte",
  description: "Bem-vindo à Casa da Pampulha...",
  address: "Pampulha",
  city: "Belo Horizonte",
  state: "Minas Gerais",
  country: "Brasil",
  zipCode: "31270-000",
  coordinates: { lat: -19.8157, lng: -43.9542 },
  maxGuests: 12,
  bedrooms: 4,
  beds: 7,
  bathrooms: 5,
  checkInTime: "15:00",
  checkOutTime: "11:00",
  minNights: 3,
  airbnbUrl: "https://www.airbnb.com.br/rooms/1028115044709052736",
  heroImage: "/gallery/20240119_114828.jpg",
  heroImages: ["/gallery/20240119_114828.jpg"],
  welcomeMessage: "Estamos muito felizes em recebê-lo!",
  phone: "+55 (31) 99999-9999",
  whatsapp: "5531999999999",
  email: "contato@casadapampulha.com.br"
};

const hostData = { name: "Anfitrião da Casa da Pampulha", bio: "Somos uma família apaixonada por receber bem.", photo: "/images/host.jpg", role: "Proprietário", languages: ["Português", "Inglês"], responseTime: "dentro de uma hora", responseRate: "100%", isSuperhost: true, joinedDate: new Date("2020-01-01") };

const amenitiesData = [
  { name: "Piscina Aquecida", description: "Piscina com aquecimento solar", icon: "FaSwimmingPool", category: "Lazer", order: 1, isActive: true },
  { name: "Internet Wi-Fi", description: "Alta velocidade", icon: "FaWifi", category: "Conveniência", order: 2, isActive: true },
  { name: "Ar Condicionado", description: "Em todos os quartos", icon: "FaSnowflake", category: "Conforto", order: 3, isActive: true },
  { name: "Estacionamento", description: "Para 5 veículos", icon: "FaParking", category: "Conveniência", order: 4, isActive: true },
  { name: "Smart TV", description: "Em todos os ambientes", icon: "FaTv", category: "Entretenimento", order: 5, isActive: true },
  { name: "Playground", description: "Para as crianças", icon: "FaChild", category: "Lazer", order: 6, isActive: true }
];

const roomsData = [
  {
    name: "Suíte Master",
    description: "Cama queen size, ar condicionado, vista para o jardim e piscina",
    beds: [{ type: "queen", quantity: 1 }],
    maxGuests: 2,
    amenities: ["Ar condicionado", "Smart TV", "Armário"],
    images: ["/gallery/20240204_132817.jpg"],
    order: 1,
    isActive: true
  },
  {
    name: "Quarto Família",
    description: "Cama de casal e solteiro, ideal para famílias",
    beds: [{ type: "casal", quantity: 1 }, { type: "solteiro", quantity: 1 }],
    maxGuests: 3,
    amenities: ["Ar condicionado", "Ventilador"],
    images: ["/gallery/20240119_113433.jpg"],
    order: 2,
    isActive: true
  },
  {
    name: "Quarto Crianças",
    description: "Beliches e camas de solteiro, perfeito para os pequenos",
    beds: [{ type: "solteiro", quantity: 4 }],
    maxGuests: 4,
    amenities: ["Ventilador", "Brinquedos"],
    images: ["/gallery/20240119_113558.jpg"],
    order: 3,
    isActive: true
  },
  {
    name: "Loft Independente",
    description: "Espaço privativo com sala, quarto e banheiro",
    beds: [{ type: "casal", quantity: 1 }, { type: "solteiro", quantity: 2 }],
    maxGuests: 4,
    amenities: ["Ar condicionado", "Smart TV", "Banheiro privativo"],
    images: ["/gallery/20240119_114440.jpg"],
    order: 4,
    isActive: true
  }
];

const faqsData = [ { question: "Qual o horário de check-in e check-out?", answer: "Check-in a partir das 15h e check-out até às 11h.", category: "Reservas", order: 1 } ];

const checkinInfoData = [ { type: "checkin", title: "Horário de Check-in", content: "A partir das 15:00.", icon: "clock", order: 1, isRestricted: false } ];

const kidsAreaData = {
  title: "Playground Exclusivo",
  description: "Temos um parquinho completo só para as crianças! Um espaço seguro e divertido para os pequenos brincarem enquanto os adultos relaxam.",
  features: ["Pula-pula grande", "Escorrega", "Balanços", "Gira-gira", "Casinha de madeira", "Bolas e brinquedos"],
  images: ["/gallery/20240119_114312.jpg"],
  isActive: true
};

const socialLinksData = [ { platform: "Instagram", url: "https://instagram.com/casadapampulha", icon: "instagram", order: 1 } ];

async function seed() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado!');

    console.log('Limpando dados existentes...');
    await Place.deleteMany({});
    await GalleryItem.deleteMany({});
    await Property.deleteMany({});
    await Host.deleteMany({});
    await Amenity.deleteMany({});
    await Room.deleteMany({});
    await FAQ.deleteMany({});
    await CheckinInfo.deleteMany({});
    await KidsArea.deleteMany({});
    await SocialLink.deleteMany({});

    console.log('Inserindo locais...');
    await Place.insertMany(placesData);
    console.log('Locais inseridos.');

    console.log('Inserindo galeria...');
    await GalleryItem.insertMany(galleryData);
    console.log('Galeria inserida.');

    console.log('Inserindo propriedade...');
    await Property.create(propertyData);
    console.log('Propriedade inserida.');

    console.log('Inserindo anfitrião...');
    await Host.create(hostData);
    console.log('Anfitrião inserido.');

    console.log('Inserindo comodidades...');
    await Amenity.insertMany(amenitiesData);
    console.log('Comodidades inseridas.');

    console.log('Inserindo quartos...');
    await Room.insertMany(roomsData);
    console.log('Quartos inseridos.');

    console.log('Inserindo FAQs...');
    await FAQ.insertMany(faqsData);
    console.log('FAQs inseridas.');

    console.log('Inserindo informações de check-in...');
    await CheckinInfo.insertMany(checkinInfoData);
    console.log('Checkin info inserida.');

    console.log('Inserindo área das crianças...');
    await KidsArea.create(kidsAreaData);
    console.log('Área das crianças inserida.');

    console.log('Inserindo redes sociais...');
    await SocialLink.insertMany(socialLinksData);
    console.log('Redes sociais inseridas.');

    console.log('Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ email: 'admin@casadapampulha.com.br', password: hashedPassword, name: 'Administrador', role: 'admin', isActive: true });
    console.log('Usuário admin criado (admin@casadapampulha.com.br / admin123)');

    console.log('\n✅ Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante o seed:', error);
    process.exit(1);
  }
}

seed();
