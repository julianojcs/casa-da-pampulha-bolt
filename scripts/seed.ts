import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

// Define schemas inline to avoid import issues
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

// Data
const placesData = [
  { name: "Lagoa da Pampulha", description: "Explore a beleza da Lagoa da Pampulha, projetada por Oscar Niemeyer, com suas casas e igrejas arquitetonicamente interessantes. Lugar adequado para quem curte andar de bike e praticar exercício.", address: "Pampulha, Belo Horizonte", category: "attractions", rating: 5, distanceWalk: "4 min", distanceCar: "1 min", distance: "250 m", image: "/images/Lagoa_da_Pampulha.png" },
  { name: "Santuário São Francisco de Assis", description: "Igrejinha da Pampulha (Oscar Niemeyer). Consagrada em 1959, esta capela católica moderna e única foi projetada por Oscar Niemeyer. Patrimônio Cultural da Humanidade pela UNESCO.", address: "Av. Otacílio Negrão de Lima, 3000", category: "attractions", rating: 5, distanceWalk: "1 h 32 min", distanceCar: "14 min", distance: "6.4 km", image: "/images/Santuario_Arquidiocesano_Sao_Francisco_de_Assis.png", mapUrl: "https://maps.app.goo.gl/QpLFzQ9mYX4N1aXeA" },
  { name: "Estádio Mineirão", description: "O maior estádio de Minas Gerais e um dos mais importantes do Brasil. Sede de grandes jogos e shows internacionais.", address: "Av. Antônio Abrahão Caram, 1001", category: "attractions", rating: 5, distanceWalk: "1 h 39 min", distanceCar: "15 min", distance: "7.1 km", image: "/images/Mineirao.png", mapUrl: "https://maps.app.goo.gl/6ujVrUgsNg6cwb67A" },
  { name: "Jardim Zoológico de Belo Horizonte", description: "Uma opção para famílias, o zoológico abriga diversas espécies de animais. Passeio tradicional para as crianças.", address: "Av. Otacílio Negrão de Lima, 8000", category: "kids", rating: 5, distanceCar: "6 min", distanceWalk: "42 min", distance: "2.9 km", image: "/images/Jardim_Zoologico_De_Belo_Horizonte.png", mapUrl: "https://maps.app.goo.gl/vkqhZcLjGNwHXrXw8" },
  { name: "Parque Ecológico da Pampulha", description: "Parque Ecológico Francisco Lins do Rego. Ótimo para caminhadas, observação de aves e contato com a natureza.", address: "Av. Otacílio Negrão de Lima", category: "attractions", rating: 4, distanceCar: "10 min", distanceWalk: "1 h 12 min", distance: "5.1 km", image: "/images/Parque_Ecologico_da_Pampulha.png", mapUrl: "https://maps.app.goo.gl/yvEpqrDVpc1mAE4W8" },
  { name: "Museu Casa Kubitschek", description: "Casa-museu do ex-presidente Juscelino Kubitschek, com acervo histórico e arquitetura modernista.", address: "Av. Otacílio Negrão de Lima, 4188", category: "attractions", rating: 5, distanceCar: "13 min", distanceWalk: "1 h 32 min", distance: "6.4 km", image: "/images/Museu_Casa_Kubitschek.png", mapUrl: "https://maps.app.goo.gl/9kREWhZhYHRHgxZV7" },
  { name: "Parque Guanabara", description: "Um dos 10 melhores parques de diversões do Brasil! As crianças simplesmente AMAM! Atrações clássicas incluindo carrinhos de bate-bate e roda gigante.", address: "Av. Expedicionário Benvindo Belém de Lima, 15 - São Luiz", category: "kids", rating: 5, distanceCar: "13 min", distanceWalk: "1 h 32 min", distance: "6.3 km", image: "/images/Parque_Guanabara.png", mapUrl: "https://maps.app.goo.gl/YJuV2bwGuuQEPwKj6" },
  { name: "Museu de Arte da Pampulha", description: "Museu de arte contemporânea com exposições rotativas em edifício modernista de Oscar Niemeyer.", address: "Av. Otacílio Negrão de Lima, 16585", category: "attractions", rating: 5, distanceCar: "7 min", distanceWalk: "57 min", distance: "4.3 km", image: "/images/Museu_de_Arte_da_Pampulha.png", mapUrl: "https://maps.app.goo.gl/6GbKz4bq9XetpAHm7" },
  { name: "Casa do Baile", description: "Centro de Referência de Arquitetura, Urbanismo e Design. Obra de Oscar Niemeyer às margens da Lagoa.", address: "Av. Otacílio Negrão de Lima, 751", category: "attractions", rating: 5, distanceCar: "10 min", distanceWalk: "1 h 20 min", distance: "5.9 km", image: "/images/Casa_do_Baile.png", mapUrl: "https://maps.app.goo.gl/xkwKSsgfy1XYPS2f8" },
  { name: "Marco Zero Belo Horizonte", description: "Atração turística que marca o ponto de referência geográfico da cidade.", address: "Pampulha, Belo Horizonte", category: "attractions", rating: 4, distanceCar: "12 min", distanceWalk: "1 h 17 min", distance: "5.5 km", image: "/images/Marco_Zero_da_Pampulha.png", mapUrl: "https://maps.app.goo.gl/NFRVSKqRGwZrLhwn7" },
  { name: "Mercado Central de BH", description: "Encontre todos os tipos de queijos mineiros, artesanato, cachaças, biscoitos e doce de leite para levar como lembrança.", address: "Av. Augusto de Lima, 744 - Centro", category: "attractions", rating: 5, distanceCar: "22 min", distanceWalk: "3 h 25 min", distance: "14.5 km", image: "/images/Mercado_Central_de_Belo_Horizonte.png" },
  { name: "Restaurante Xapuri", description: "Restaurante tradicional que oferece pratos típicos mineiros, com uma atmosfera aconchegante e hospitalidade típica de Minas.", address: "Rua Mandacarú, 260 - Trevo", category: "restaurants", rating: 5, distanceCar: "4 min", distanceWalk: "25 min", distance: "1.7 km", image: "/images/Restaurante_Xapuri.png" },
  { name: "Caipira Xique", description: "Excelente restaurante com pratos típicos mineiros, atmosfera aconchegante e ótimo para crianças. Bem perto da Casa da Pampulha.", address: "R. Francisco Bretas Bering, 324, Copacabana", category: "restaurants", rating: 4, distanceCar: "3 min", distanceWalk: "16 min", distance: "1.1 km", image: "/images/Caipira_Xique_Restaurante.png" },
  { name: "Anella Restaurante", description: "Um dos melhores restaurantes italianos de BH. Ambiente sofisticado e pratos excepcionais.", address: "Av. Min. Guilhermino de Oliveira, 325 - Santa Amelia", category: "restaurants", rating: 5, distanceCar: "8 min", distanceWalk: "53 min", distance: "3.6 km", image: "/images/Anella_Restaurante.png" },
  { name: "Grill e Restaurante Dom Toro", description: "Ótima opção para refeições saborosas com ambiente agradável.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 4, distanceCar: "7 min", distanceWalk: "44 min", distance: "3.1 km", image: "/images/Grill_E_Restaurante_Dom_Toro.png", mapUrl: "https://maps.app.goo.gl/sSENZJhkQsMFTF3d9" },
  { name: "Padaria e Panificadora Portugal", description: "Padaria e panificadora com pães frescos, doces e lanches variados.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 4, distanceCar: "6 min", distanceWalk: "42 min", distance: "3 km", image: "/images/Padaria_E_Panificadora_Portugal.png", mapUrl: "https://maps.app.goo.gl/NZtZGZEc1EvUw6YG8" },
  { name: "Restaurante Paladino", description: "Restaurante muito bom e fica relativamente perto da casa. Ótima comida e atendimento.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 5, distanceCar: "8 min", distanceWalk: "37 min", distance: "2.6 km", image: "/images/Restaurante_Paladino.png", mapUrl: "https://maps.app.goo.gl/Bm4cTFWCMxZXEvMe9" },
  { name: "Chopp da Fábrica Pampulha", description: "Restaurante de Comida Mineira com chopp gelado. Ambiente tradicional e boa culinária.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 4, distanceCar: "1 h 38 min", distanceWalk: "50 min", distance: "6.8 km", image: "/images/Chopp_da_Fabrica_Pampulha.png", mapUrl: "https://maps.app.goo.gl/fpxBvAT9ohnDLBXu5" },
  { name: "McDonald's Av. Portugal", description: "Rede de fast-food conhecida mundialmente. Prático para refeições rápidas.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 4, distanceCar: "7 min", distanceWalk: "52 min", distance: "3.8 km", image: "/images/McDonalds.png", mapUrl: "https://maps.app.goo.gl/nARf6K9Zk7RdSaui8" },
  { name: "Cozinha Japonesa/Oriental", description: "Restaurante de comida japonesa e oriental com pratos típicos e frescos.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 4, distanceCar: "8 min", distanceWalk: "46 min", distance: "3.1 km", image: "/images/Cozinha_Japonesa_Oriental.png", mapUrl: "https://maps.app.goo.gl/XRL9VYDWbc8KapjG6" },
  { name: "Divino Restaurante", description: "Super recomendado! De dia tem um ótimo self-service e a noite funciona uma pizzaria muito boa. Tem parquinho para crianças.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 5, distanceCar: "6 min", distanceWalk: "43 min", distance: "3.1 km", image: "/images/Divino_Restaurante.png", mapUrl: "https://maps.app.goo.gl/J7GfLcE9K6WaDn996" },
  { name: "Lagoas Frutas Caldo De Cana", description: "Ótimo lugar para tomar um caldo de cana e comer um pastel. Fica a poucos metros da casa, em frente a lagoa. Dá pra ir a pé.", address: "Em frente à Lagoa da Pampulha", category: "restaurants", rating: 5, distanceWalk: "9 min", distanceCar: "2 min", distance: "650 m", image: "/images/Lagoas_Frutas_Caldo_De_Cana.png", mapUrl: "https://maps.app.goo.gl/xgf9oVpohNP1dP3w8" },
  { name: "Ponto do Açaí Fruto D'Amazônia", description: "Lanchonete de caldo de cana, frutas e pastel frito na hora. Ambiente simples e saboroso.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 4, distanceCar: "4 min", distanceWalk: "26 min", distance: "1.9 km", image: "/images/Ponto_do_Acai_Fruto_D_Amazonia.png", mapUrl: "https://maps.app.goo.gl/ktFCbghYGWHdtVp3A" },
  { name: "Lanchonete e Pastelaria Pampulha", description: "Opção para lanches rápidos e pastéis frescos.", address: "Pampulha, Belo Horizonte", category: "restaurants", rating: 3, distanceCar: "1 min", distanceWalk: "4 min", distance: "350 m", image: "/images/Lanchonete_Pampulha.png", mapUrl: "https://maps.app.goo.gl/5ohZmJQ77VMmmF4R6" },
  { name: "Seu Pai Bar & Drinkeria", description: "Bar com drinks especiais e ambiente descolado.", address: "Pampulha, Belo Horizonte", category: "bars", rating: 4, distanceCar: "8 min", distanceWalk: "58 min", distance: "4 km", image: "/images/Seu_Pai_Bar_E_Drinkeria.png", mapUrl: "https://maps.app.goo.gl/59fhHGoQHVqKmN4L7" },
  { name: "Lagoa Rock Bar", description: "Bar temático de rock às margens da Lagoa da Pampulha.", address: "Pampulha, Belo Horizonte", category: "bars", rating: 4, distanceCar: "8 min", distanceWalk: "59 min", distance: "4.1 km", image: "/images/Lagoa_Rock_Bar.png", mapUrl: "https://maps.app.goo.gl/t9jpmyWUogrHGTMUA" },
  { name: "Zero Grau Distribuidora de Bebidas", description: "Faz entregas e possui preços muito bons. Ótima opção para abastecer a casa.", address: "Pampulha, Belo Horizonte", category: "services", rating: 5, distanceCar: "7 min", distanceWalk: "48 min", distance: "3.5 km", image: "/images/Zero_Grau_Distribuidora_de_Bebidas.png", mapUrl: "https://maps.app.goo.gl/a6L9tB2jDxXdUQ6ZA" },
  { name: "Supernosso Pampulha", description: "Supermercado que nós recomendamos. Ótima variedade e qualidade.", address: "Pampulha, Belo Horizonte", category: "services", rating: 5, distanceCar: "8 min", distanceWalk: "50 min", distance: "3.6 km", image: "/images/Supernosso_Pampulha.png", mapUrl: "https://maps.app.goo.gl/U1RhPdNo9d66Q6436" },
  { name: "Supermercados BH", description: "Supermercado mais popular. Fica bem perto da casa.", address: "Pampulha, Belo Horizonte", category: "services", rating: 4, distanceWalk: "19 min", distanceCar: "3 min", distance: "1.4 km", image: "/images/Supermercados_BH.png", mapUrl: "https://maps.app.goo.gl/cTBNBHeyXyeVrY2C8" },
  { name: "Sacolão Total", description: "Frutas e verduras fresquinhas. Bem perto da Casa.", address: "Pampulha, Belo Horizonte", category: "services", rating: 4, distanceWalk: "3 min", distanceCar: "1 min", distance: "180 m", image: "/images/Sacolao_Total.png", mapUrl: "https://maps.app.goo.gl/WvMCk76KhjMhnFRg6" },
  { name: "Ao Gosto Carnes Nobres e Exóticas", description: "Açougue com carnes nobres e exóticas. Para um churrasco especial.", address: "Pampulha, Belo Horizonte", category: "services", rating: 5, distanceCar: "7 min", distanceWalk: "48 min", distance: "3.5 km", image: "/images/Ao_Gosto_Carnes_Nobres_E_Exoticas.png", mapUrl: "https://maps.app.goo.gl/5F9WXBUAy6R3C6bD8" },
  { name: "Drogaria Araújo", description: "Drogaria/Farmácia. Fica bem próxima à casa.", address: "Pampulha, Belo Horizonte", category: "services", rating: 4, distanceWalk: "19 min", distanceCar: "4 min", distance: "1.4 km", image: "/images/Drogaria_Araujo.png", mapUrl: "https://maps.app.goo.gl/5qWFNuVRJB3tMsjJ8" },
  { name: "Posto Ipiranga Copacabana", description: "Posto de combustível mais próximo.", address: "Pampulha, Belo Horizonte", category: "services", rating: 4, distanceWalk: "14 min", distanceCar: "3 min", distance: "1 km", image: "/images/Posto_Ipiranga.png", mapUrl: "https://maps.app.goo.gl/VmxPBvCdN3qQfJb69" },
  { name: "Arena MRV", description: "Estádio do Atlético Mineiro. Casa do Galo!", address: "Pampulha, Belo Horizonte", category: "sports", rating: 5, distanceCar: "17 min", distanceWalk: "1 h 33 min", distance: "7.2 km", image: "/images/Arena_MRV.png", mapUrl: "https://maps.app.goo.gl/rWYB2qhLp2rP1dPp9" },
  { name: "Toca da Raposa - Cruzeiro", description: "Centro de Treinamento do Cruzeiro Esporte Clube.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "8 min", distanceWalk: "57 min", distance: "3.9 km", image: "/images/Toca_da_Raposa_Cruzeiro_Esporte_Clube.png", mapUrl: "https://maps.app.goo.gl/1yDt4qN7fX7GHvjh8" },
  { name: "Território do Galo", description: "Loja oficial do Atlético Mineiro.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "15 min", distanceWalk: "1 h 23 min", distance: "6 km", image: "/images/Territorio_do_Galo.png", mapUrl: "https://maps.app.goo.gl/5kRJ2mXeX8TT7qN16" },
  { name: "Smart Fit Pampulha", description: "Academia Smart Fit na Pampulha.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "8 min", distanceWalk: "1 h 1 min", distance: "4.4 km", image: "/images/Academia_Smart_Fit_Pampulha.png", mapUrl: "https://maps.app.goo.gl/Apm9aCrL3fqJjDLv6" },
  { name: "Califa Beach Sports", description: "Beach Sports com quadras de areia para prática de esportes.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "4 min", distanceWalk: "26 min", distance: "1.8 km", image: "/images/Califa_Beach_Sports.png", mapUrl: "https://maps.app.goo.gl/hRW3vpzPhtSN9sMU7" },
  { name: "Arena Marco Zero BH", description: "Arena de esportes como Beach Tenis e Futevôlei.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "14 min", distanceWalk: "1 h 23 min", distance: "6 km", image: "/images/Arena_Marco_Zero_BH.png", mapUrl: "https://maps.app.goo.gl/6bmhGJWNZa4EqMU47" },
  { name: "AABB BH", description: "Clube com piscinas, quadras e atividades para toda a família.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "5 min", distanceWalk: "34 min", distance: "2.4 km", image: "/images/AABB.png", mapUrl: "https://maps.app.goo.gl/MXHqQKbE7J4hfV9E9" },
  { name: "Estação 08 BIKE BH", description: "Estação de aluguel de bicicletas para passeios na orla da Lagoa.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceWalk: "8 min", distanceCar: "1 min", distance: "550 m", image: "/images/Estacao_08_BIKE_BH.png", mapUrl: "https://maps.app.goo.gl/1eCh3X6E5eGt6pMn7" },
  { name: "Barnabé Bar e Espetaria", description: "Bar com espaço para crianças. Ótimo para famílias.", address: "Pampulha, Belo Horizonte", category: "kids", rating: 4, distanceCar: "5 min", distanceWalk: "36 min", distance: "2.5 km", image: "/images/Barnabe_Bar_E_Espetaria.png", mapUrl: "https://maps.app.goo.gl/rSR4sSixSNmJDRvj8" },
];

const galleryData = [
  { type: "image", src: "/gallery/20240119_114208.jpg", thumbnail: "/gallery/thumbnails/20240119_114208 Pequena.jpeg", title: "Cozinha da área gourmet", category: "Área Gourmet", order: 1 },
  { type: "image", src: "/gallery/20240119_114214.jpg", thumbnail: "/gallery/thumbnails/20240119_114214 Pequena.jpeg", title: "Cantinho do churrasqueiro", category: "Área Gourmet", order: 2 },
  { type: "image", src: "/gallery/20240119_114222.jpg", thumbnail: "/gallery/thumbnails/20240119_114222 Pequena.jpeg", title: "Cantinho do cervejeiro", category: "Área Gourmet", order: 3 },
  { type: "image", src: "/gallery/20240119_114237.jpg", thumbnail: "/gallery/thumbnails/20240119_114237 Pequena.jpeg", title: "Mesa da área gourmet", category: "Área Gourmet", order: 4 },
  { type: "image", src: "/gallery/20240204_132819.jpg", thumbnail: "/gallery/thumbnails/20240204_132819 Pequena.jpeg", title: "Vista da Lagoa da Pampulha", category: "Arredores", order: 5 },
  { type: "image", src: "/gallery/20240204_132820.jpg", thumbnail: "/gallery/thumbnails/20240204_132820 Pequena.jpeg", title: "Por do sol na Lagoa da Pampulha", category: "Arredores", order: 6 },
  { type: "image", src: "/gallery/20240119_113828.jpg", thumbnail: "/gallery/thumbnails/20240119_113828 Pequena.jpeg", title: "Banheiro social", category: "Banheiros", order: 7 },
  { type: "image", src: "/gallery/20240119_113840.jpg", thumbnail: "/gallery/thumbnails/20240119_113840 Pequena.jpeg", title: "Banheiro social", category: "Banheiros", order: 8 },
  { type: "image", src: "/gallery/20240119_113853.jpg", thumbnail: "/gallery/thumbnails/20240119_113853 Pequena.jpeg", title: "Banheiro social", category: "Banheiros", order: 9 },
  { type: "image", src: "/gallery/20240119_114200.jpg", thumbnail: "/gallery/thumbnails/20240119_114200 Pequena.jpeg", title: "Banheiro area gourmet", category: "Banheiros", order: 10 },
  { type: "image", src: "/gallery/20240119_114551.jpg", thumbnail: "/gallery/thumbnails/20240119_114551 Pequena.jpeg", title: "Banheiro do loft", category: "Banheiros", order: 11 },
  { type: "image", src: "/gallery/20240119_114603.jpg", thumbnail: "/gallery/thumbnails/20240119_114603 Pequena.jpeg", title: "Banheiro do loft", category: "Banheiros", order: 12 },
  { type: "image", src: "/gallery/20231225_160419.jpg", thumbnail: "/gallery/thumbnails/20231225_160419 Pequena.jpeg", title: "Lavabo da sala de estar", category: "Banheiros", order: 13 },
  { type: "image", src: "/gallery/20240119_113657.jpg", thumbnail: "/gallery/thumbnails/20240119_113657 Pequena.jpeg", title: "Cozinha", category: "Cozinha Completa", order: 14 },
  { type: "image", src: "/gallery/20240119_113706.jpg", thumbnail: "/gallery/thumbnails/20240119_113706 Pequena.jpeg", title: "Cozinha", category: "Cozinha Completa", order: 15 },
  { type: "image", src: "/gallery/20240119_113716.jpg", thumbnail: "/gallery/thumbnails/20240119_113716 Pequena.jpeg", title: "Cozinha", category: "Cozinha Completa", order: 16 },
  { type: "image", src: "/gallery/20240119_114342.jpg", thumbnail: "/gallery/thumbnails/20240119_114342 Pequena.jpeg", title: "Estacionamento e palmeiras real", category: "Estacionamento", order: 17 },
  { type: "image", src: "/gallery/20240119_114408.jpg", thumbnail: "/gallery/thumbnails/20240119_114408 Pequena.jpeg", title: "Estacionamento para 5 veículos", category: "Estacionamento", order: 18 },
  { type: "image", src: "/gallery/20231225_174638.jpg", thumbnail: "/gallery/thumbnails/20231225_174638 Pequena.jpeg", title: "Estacionamento para 5 veículos", category: "Estacionamento", order: 19 },
  { type: "image", src: "/gallery/20240119_114009.jpg", thumbnail: "/gallery/thumbnails/20240119_114009 Pequena.jpeg", title: "Varanda com rampa de acesso", category: "Jardim", order: 20 },
  { type: "image", src: "/gallery/20240118_144304.jpg", thumbnail: "/gallery/thumbnails/20240118_144304 Pequena.jpeg", title: "Flores do jardim", category: "Jardim", order: 21 },
  { type: "image", src: "/gallery/20240119_114019.jpg", thumbnail: "/gallery/thumbnails/20240119_114019 Pequena.jpeg", title: "Varanda", category: "Jardim", order: 22 },
  { type: "image", src: "/gallery/20240119_114059.jpg", thumbnail: "/gallery/thumbnails/20240119_114059 Pequena.jpeg", title: "Varanda", category: "Jardim", order: 23 },
  { type: "image", src: "/gallery/20240119_114034.jpg", thumbnail: "/gallery/thumbnails/20240119_114034 Pequena.jpeg", title: "Jardim", category: "Jardim", order: 24 },
  { type: "image", src: "/gallery/20240119_114929.jpg", thumbnail: "/gallery/thumbnails/20240119_114929 Pequena.jpeg", title: "Jardim", category: "Jardim", order: 25 },
  { type: "image", src: "/gallery/20240119_114828.jpg", thumbnail: "/gallery/thumbnails/20240119_114828 Pequena.jpeg", title: "Piscina", category: "Piscina/Jacuzzi", order: 60 },
  { type: "image", src: "/gallery/20240119_114847.jpg", thumbnail: "/gallery/thumbnails/20240119_114847 Pequena.jpeg", title: "Piscina", category: "Piscina/Jacuzzi", order: 61 },
  { type: "image", src: "/gallery/20240119_114922.jpg", thumbnail: "/gallery/thumbnails/20240119_114922 Pequena.jpeg", title: "Jacuzzi", category: "Piscina/Jacuzzi", order: 65 },
  { type: "image", src: "/gallery/20240119_114141.jpg", thumbnail: "/gallery/thumbnails/20240119_114141 Pequena.jpeg", title: "Pula-pula", category: "Playground", order: 68 },
  { type: "image", src: "/gallery/20240119_114304.jpg", thumbnail: "/gallery/thumbnails/20240119_114304 Pequena.jpeg", title: "Piscina e parquinho", category: "Playground", order: 69 },
  { type: "image", src: "/gallery/20240119_114312.jpg", thumbnail: "/gallery/thumbnails/20240119_114312 Pequena.jpeg", title: "Casa de madeira com escorrega e balanços", category: "Playground", order: 73 },
  { type: "image", src: "/gallery/20240119_113558.jpg", thumbnail: "/gallery/thumbnails/20240119_113558 Pequena.jpeg", title: "Quarto crianças", category: "Quarto Crianças", order: 75 },
  { type: "image", src: "/gallery/20240119_113433.jpg", thumbnail: "/gallery/thumbnails/20240119_113433 Pequena.jpeg", title: "Quarto Família", category: "Quarto Família", order: 81 },
  { type: "image", src: "/gallery/20240119_113916.jpg", thumbnail: "/gallery/thumbnails/20240119_113916 Pequena.jpeg", title: "Sala de TV", category: "Sala de Estar", order: 95 },
  { type: "image", src: "/gallery/20240204_132817.jpg", thumbnail: "/gallery/thumbnails/20240204_132817 Pequena.jpeg", title: "Cama Queen Size com roupas de cama e banho envelopadas", category: "Suite Master", order: 102 },
  { type: "image", src: "/gallery/20240119_114440.jpg", thumbnail: "/gallery/thumbnails/20240119_114440 Pequena.jpeg", title: "Área interna do loft com vista para a piscina", category: "Loft", order: 50 },
  { type: "video", src: "https://www.youtube.com/embed/OGmQQiDLc28", thumbnail: "/gallery/thumbnails/20240119_113916 Pequena.jpeg", title: "Como chegar", category: "Vídeos", order: 104 },
  { type: "video", src: "https://www.youtube.com/embed/v30i_54VFz0", thumbnail: "/gallery/thumbnails/20240119_113916 Pequena.jpeg", title: "Conheça o Loft", category: "Vídeos", order: 105 },
  { type: "video", src: "https://www.youtube.com/embed/xHoo8ZMQRq0", thumbnail: "/gallery/thumbnails/20240119_113916 Pequena.jpeg", title: "Tour Virtual da Casa", category: "Vídeos", order: 106 },
];

const propertyData = {
  name: "Casa da Pampulha",
  tagline: "Sua casa de férias perfeita em Belo Horizonte",
  description: "Bem-vindo à Casa da Pampulha, um refúgio perfeito para famílias e grupos que buscam conforto, privacidade e uma localização privilegiada em Belo Horizonte. Localizada a poucos metros da Lagoa da Pampulha, nossa casa oferece uma experiência única de hospedagem com piscina e jacuzzi aquecidas, amplo playground para crianças, área gourmet completa e muito mais.",
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
  heroImages: ["/gallery/20240119_114828.jpg", "/gallery/20240119_113916.jpg", "/gallery/20240119_114208.jpg"],
  welcomeMessage: "Estamos muito felizes em recebê-lo! Nossa casa foi preparada com carinho para oferecer a você e sua família uma experiência inesquecível. Aproveite cada momento e sinta-se em casa!",
};

const hostData = {
  name: "Anfitrião da Casa da Pampulha",
  bio: "Somos uma família apaixonada por receber bem. Criamos este espaço com muito carinho para proporcionar momentos inesquecíveis aos nossos hóspedes.",
  photo: "/images/host.jpg",
  role: "Proprietário",
  languages: ["Português", "Inglês", "Espanhol"],
  responseTime: "dentro de uma hora",
  responseRate: "100%",
  isSuperhost: true,
  joinedDate: new Date("2020-01-01"),
};

const amenitiesData = [
  { name: "Piscina Aquecida", description: "Piscina com aquecimento solar", icon: "pool", category: "Lazer", order: 1 },
  { name: "Jacuzzi Aquecida", description: "Jacuzzi com hidromassagem aquecida", icon: "hot-tub", category: "Lazer", order: 2 },
  { name: "Wi-Fi", description: "Internet de alta velocidade em toda a casa", icon: "wifi", category: "Tecnologia", order: 3 },
  { name: "Ar Condicionado", description: "Ar condicionado em todos os quartos", icon: "snowflake", category: "Conforto", order: 4 },
  { name: "Estacionamento", description: "Estacionamento privativo para 5 veículos", icon: "car", category: "Serviços", order: 5 },
  { name: "Smart TV", description: "Smart TV em todos os ambientes", icon: "tv", category: "Tecnologia", order: 6 },
  { name: "Secador de Cabelo", description: "Secador de cabelo disponível", icon: "hairdryer", category: "Conforto", order: 7 },
  { name: "Máquina de Lavar e Secar", description: "Lavanderia completa", icon: "washer", category: "Serviços", order: 8 },
  { name: "Playground", description: "Parquinho completo para crianças", icon: "playground", category: "Lazer", order: 9 },
  { name: "Área Gourmet", description: "Churrasqueira e cozinha externa", icon: "grill", category: "Lazer", order: 10 },
];

const faqsData = [
  { question: "Qual o horário de check-in e check-out?", answer: "Check-in a partir das 15h e check-out até às 11h. Horários flexíveis podem ser negociados mediante disponibilidade.", category: "Reservas", order: 1 },
  { question: "A piscina e jacuzzi são aquecidas?", answer: "Sim! Tanto a piscina quanto a jacuzzi possuem sistema de aquecimento solar, proporcionando água agradável mesmo nos dias mais frios.", category: "Comodidades", order: 2 },
  { question: "Quantos hóspedes a casa comporta?", answer: "A casa acomoda confortavelmente até 14 hóspedes, distribuídos em 5 quartos e um loft independente.", category: "Reservas", order: 3 },
  { question: "Posso levar animais de estimação?", answer: "Infelizmente não aceitamos animais de estimação na propriedade.", category: "Regras", order: 4 },
  { question: "Tem estacionamento?", answer: "Sim, a propriedade possui estacionamento privativo com capacidade para 5 veículos.", category: "Comodidades", order: 5 },
  { question: "É permitido fazer festas?", answer: "Não é permitida a realização de festas ou eventos na propriedade. A casa é destinada a hospedagem familiar.", category: "Regras", order: 6 },
  { question: "Como funciona o check-in?", answer: "Após a confirmação da reserva, enviaremos todas as instruções detalhadas de check-in, incluindo localização das chaves e senhas de acesso.", category: "Reservas", order: 7 },
  { question: "A casa tem Wi-Fi?", answer: "Sim, oferecemos internet Wi-Fi de alta velocidade em toda a propriedade.", category: "Comodidades", order: 8 },
];

const checkinInfoData = [
  { type: "checkin", title: "Horário de Check-in", content: "A partir das 15:00. Chegadas após as 22:00 devem ser comunicadas previamente.", icon: "clock", order: 1, isRestricted: false },
  { type: "checkin", title: "Acesso à Propriedade", content: "As chaves estão em um cofre na entrada. O código será enviado por mensagem no dia do check-in.", icon: "key", order: 2, isRestricted: true },
  { type: "checkout", title: "Horário de Check-out", content: "Até às 11:00. Saídas tardias podem ser negociadas mediante disponibilidade.", icon: "clock", order: 1, isRestricted: false },
  { type: "checkout", title: "Antes de Sair", content: "Por favor, deixe a casa organizada, retire o lixo e desligue os aparelhos de ar condicionado.", icon: "home", order: 2, isRestricted: false },
  { type: "rule", title: "Proibido Fumar", content: "É proibido fumar em qualquer área interna da casa.", icon: "no", order: 1, isRestricted: false },
  { type: "rule", title: "Sem Animais", content: "Não são permitidos animais de estimação.", icon: "no", order: 2, isRestricted: false },
  { type: "rule", title: "Sem Festas", content: "Não é permitida a realização de festas ou eventos.", icon: "no", order: 3, isRestricted: false },
  { type: "rule", title: "Horário de Silêncio", content: "Respeite o horário de silêncio das 22h às 8h.", icon: "shield", order: 4, isRestricted: false },
  { type: "instruction", title: "Wi-Fi", content: "Rede: CasaPampulha\nSenha: será informada no check-in", icon: "wifi", order: 1, isRestricted: true },
  { type: "instruction", title: "Piscina e Jacuzzi", content: "O aquecimento é solar. Para melhores resultados, mantenha a capa térmica durante a noite.", icon: "home", order: 2, isRestricted: false },
];

const kidsAreaData = {
  title: "Playground Exclusivo",
  description: "Temos um parquinho completo só para as crianças! Um espaço seguro e divertido para os pequenos brincarem enquanto os adultos relaxam.",
  features: ["Pula-pula grande", "Escorrega", "Balanços", "Gira-gira", "Casinha de madeira", "Bolas e brinquedos"],
  images: ["/gallery/20240119_114312.jpg", "/gallery/20240119_114141.jpg", "/gallery/20240119_114304.jpg"],
};

const socialLinksData = [
  { platform: "Instagram", url: "https://instagram.com/casadapampulha", icon: "instagram", order: 1 },
  { platform: "Facebook", url: "https://facebook.com/casadapampulha", icon: "facebook", order: 2 },
  { platform: "WhatsApp", url: "https://wa.me/5531999999999", icon: "whatsapp", order: 3 },
  { platform: "Airbnb", url: "https://www.airbnb.com.br/rooms/1028115044709052736", icon: "airbnb", order: 4 },
];

async function seed() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado!');

    // Clear existing data
    console.log('Limpando dados existentes...');
    await Place.deleteMany({});
    await GalleryItem.deleteMany({});
    await Property.deleteMany({});
    await Host.deleteMany({});
    await Amenity.deleteMany({});
    await FAQ.deleteMany({});
    await CheckinInfo.deleteMany({});
    await KidsArea.deleteMany({});
    await SocialLink.deleteMany({});

    // Seed places
    console.log('Inserindo locais...');
    await Place.insertMany(placesData);
    console.log(`${placesData.length} locais inseridos.`);

    // Seed gallery
    console.log('Inserindo galeria...');
    await GalleryItem.insertMany(galleryData);
    console.log(`${galleryData.length} itens da galeria inseridos.`);

    // Seed property
    console.log('Inserindo propriedade...');
    await Property.create(propertyData);
    console.log('Propriedade inserida.');

    // Seed host
    console.log('Inserindo anfitrião...');
    await Host.create(hostData);
    console.log('Anfitrião inserido.');

    // Seed amenities
    console.log('Inserindo comodidades...');
    await Amenity.insertMany(amenitiesData);
    console.log(`${amenitiesData.length} comodidades inseridas.`);

    // Seed FAQs
    console.log('Inserindo FAQs...');
    await FAQ.insertMany(faqsData);
    console.log(`${faqsData.length} FAQs inseridas.`);

    // Seed checkin info
    console.log('Inserindo informações de check-in...');
    await CheckinInfo.insertMany(checkinInfoData);
    console.log(`${checkinInfoData.length} informações de check-in inseridas.`);

    // Seed kids area
    console.log('Inserindo área das crianças...');
    await KidsArea.create(kidsAreaData);
    console.log('Área das crianças inserida.');

    // Seed social links
    console.log('Inserindo redes sociais...');
    await SocialLink.insertMany(socialLinksData);
    console.log(`${socialLinksData.length} redes sociais inseridas.`);

    // Create admin user
    console.log('Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@casadapampulha.com.br',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      isActive: true,
    });
    console.log('Usuário admin criado (admin@casadapampulha.com.br / admin123)');

    console.log('\n✅ Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante o seed:', error);
    process.exit(1);
  }
}

seed();
