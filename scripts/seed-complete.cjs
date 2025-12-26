const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'guest'], default: 'guest' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const FAQSchema = new mongoose.Schema({
  question: String,
  answer: String,
  order: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

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

const CheckoutInfoSchema = new mongoose.Schema({
  title: String,
  instructions: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const GuestInfoSchema = new mongoose.Schema({
  type: String,
  title: String,
  content: String,
  icon: String,
  order: Number,
  isRestricted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const HostSchema = new mongoose.Schema({
  name: String,
  role: String,
  bio: String,
  photo: String,
  languages: [String],
  responseTime: String,
  responseRate: String,
  isSuperhost: { type: Boolean, default: false },
  joinedDate: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// FAQ Data
const faqsData = [
  {
    question: "Tem estacionamento disponível no local?",
    answer: "Sim! Nosso estacionamento comporta até 5 carros com total segurança.",
    order: 1
  },
  {
    question: "Posso levar meu pet?",
    answer: "Infelizmente não aceitamos PETs em nossa propriedade.",
    order: 2
  },
  {
    question: "Como posso me conectar à rede Wi-Fi?",
    answer: "Temos duas redes de Wi-Fi disponíveis com velocidade de até 500MB. As senhas serão enviadas para o chat do aplicativo ou WhatsApp após a confirmação da reserva.",
    order: 3
  },
  {
    question: "Tem roupa de cama e banho disponível?",
    answer: "Sim! Fornecemos gratuitamente 1 toalha de banho, 1 lençol, 1 virol, 1 fronha e 1 travesseiro para cada hóspede. Cada banheiro é arrumado com 2 toalhas de rosto e tapete de chão. Também fornecemos 1 toalha de piscina por quarto (4 no total).",
    order: 4
  },
  {
    question: "Tem cobertores disponíveis?",
    answer: "Sim! Fornecemos gratuitamente 1 cobertor por hóspede.",
    order: 5
  },
  {
    question: "Como funciona a lavanderia?",
    answer: "A casa possui uma lavanderia para fins particulares. Caso tenha interesse em utilizar (máquina de lavar e secar roupa), é necessário solicitar antes do check-in e uma taxa de R$200,00 será cobrada.",
    order: 6
  },
  {
    question: "Qual o horário de funcionamento da piscina?",
    answer: "O horário de funcionamento da piscina é das 08h00 às 19h00 (finais de semana e feriados até 22h00). Por razões de segurança, não é permitido nadar após o anoitecer.",
    order: 7
  },
  {
    question: "Posso receber visitas durante a estadia?",
    answer: "Não é permitido receber visitantes. Casos excepcionais poderão ser previamente autorizados pelo anfitrião.",
    order: 8
  },
];

// Checkout Instructions (convertidas para registros individuais de GuestInfo)
const checkoutInstructionsData = [
  {
    type: 'checkout',
    title: 'Limpeza de Churrasqueira',
    content: 'Os espetos, grelhas e utensílios da churrasqueira devem ser entregues limpos (lavados)',
    icon: 'fire',
    order: 1,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Louças e Utensílios',
    content: 'O mesmo serve para louças, talheres, panelas, airfrier, misteira, etc',
    icon: 'utensils',
    order: 2,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Lixo dos Banheiros',
    content: 'Todo o lixo das lixeiras dos banheiros devem ser recolhidos, lacrados/amarrados e armazenados em sacos maiores',
    icon: 'trash',
    order: 3,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Restos de Alimentos',
    content: 'Todo o resto de alimentos devem ser recolhidos e dispensados em sacolas de lixo (não deixem restos de alimentos pela casa, sobre as mesas e bancadas, e nem dentro da geladeira, freezer, frigobar e cervejeira)',
    icon: 'food',
    order: 4,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Descarte de Lixo',
    content: 'Os sacos de lixo podem ser colocados no recipiente próprio da área externa da casa localizado na calçada (se atentar ao horário de Coleta de Lixo da prefeitura: terça, quinta e sábado pela manhã), ou deixados ao lado da lixeira grande na área gourmet para serem recolhidos posteriormente',
    icon: 'recycle',
    order: 5,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Verificação de Pertences',
    content: 'Verifique se não estão deixando nenhum pertence para trás (faça o check em todos os cômodos)',
    icon: 'search',
    order: 6,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Devolução de Chaves',
    content: 'Junte os controles da garagem e as chaves para que sejam entregues, EM MÃOS, ao responsável pelo check-out',
    icon: 'key',
    order: 7,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Controles e Apps',
    content: 'Verifique se os controles das tvs, dos amazon fire tv e ar condicionados estão em cima do rack e aproveite pra ver se, caso tenha feito login nos apps de streaming, fizeram o devido logout',
    icon: 'tv',
    order: 8,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Eletrodomésticos',
    content: 'Não desliguem a geladeira, freezer, frigobar e cervejeira',
    icon: 'appliance',
    order: 9,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Verificação de Pets',
    content: 'Caso tenham, de forma excepcional, levado algum Pet, não se esqueçam de dar aquela última olhada em toda a casa (principalmente nos jardins) para ver se não ficou nenhum cocô do seu bichinho perdido e não recolhido',
    icon: 'pet',
    order: 10,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Organização de Móveis',
    content: 'Caso tenha movido algum móvel do seu lugar, esse é o momento para retornar tudo às suas configurações iniciais',
    icon: 'home',
    order: 11,
    isRestricted: true,
    isActive: true
  },
  {
    type: 'checkout',
    title: 'Feedback Airbnb',
    content: 'Contamos com a sua colaboração. E caso tenham gostado do atendimento e da hospedagem, considere fazer um feedback 5 estrelas ⭐⭐⭐⭐⭐ no Airbnb (esse feedback é muito importante para nós)',
    icon: 'star',
    order: 12,
    isRestricted: true,
    isActive: true
  },
];

// Hosts Data
const hostsData = [
  {
    name: "Luciana Costa",
    role: "Anfitriã",
    bio: "Mora em Belo Horizonte e é formada em Medicina pela UFMG, foi professora adjunta do Departamento de Anatomia e Imagem da Faculdade de Medicina da UFMG. Fala português, inglês e espanhol. Apaixonada por viagens, após uma experiência com o Airbnb no exterior, começou a compartilhar sua casa como um hobby e logo no início tomou paixão pela 'arte de receber'.",
    photo: "/images/anfitria.png",
    languages: ["Português", "Inglês", "Espanhol"],
    responseTime: "Dentro de uma hora",
    responseRate: "100%",
    isSuperhost: true,
    joinedDate: new Date('2020-01-01')
  },
  {
    name: "Juliano Costa",
    role: "Coanfitrião",
    bio: "Após longos anos morando em Vila Velha/ES, resolveu retornar a BH em 2022, para ficar mais perto da família, quando foi convidado pela sua irmã, Luciana, a aceitar esse grande desafio que seria ser seu coanfitrião na Casa da Pampulha. Fala português e inglês. Formado em Ciência da Computação pela PUC Minas e atuando na área de segurança pública, assim como sua irmã, encontrou na hospedagem a sua vocação.",
    photo: "/images/coanfitriao.jpg",
    languages: ["Português", "Inglês"],
    responseTime: "Dentro de uma hora",
    responseRate: "100%",
    isSuperhost: true,
    joinedDate: new Date('2022-01-01')
  }
];

// Gallery Data (107 items)
const galleryData = [
  { order: 1, type: "image", src: "/gallery/20240119_114208.jpg", thumbnail: "/gallery/thumbnails/20240119_114208 Pequena.jpeg", title: "Cozinha da área gourmet", category: "Área Gourmet" },
  { order: 2, type: "image", src: "/gallery/20240119_114214.jpg", thumbnail: "/gallery/thumbnails/20240119_114214 Pequena.jpeg", title: "Cantinho do churrasqueiro", category: "Área Gourmet" },
  { order: 3, type: "image", src: "/gallery/20240119_114222.jpg", thumbnail: "/gallery/thumbnails/20240119_114222 Pequena.jpeg", title: "Cantinho do cervejeiro", category: "Área Gourmet" },
  { order: 4, type: "image", src: "/gallery/20240119_114237.jpg", thumbnail: "/gallery/thumbnails/20240119_114237 Pequena.jpeg", title: "Mesa da área gourmet", category: "Área Gourmet" },
  { order: 5, type: "image", src: "/gallery/20240204_132819.jpg", thumbnail: "/gallery/thumbnails/20240204_132819 Pequena.jpeg", title: "Vista da Lagoa da Pampulha", category: "Arredores" },
  { order: 6, type: "image", src: "/gallery/20240204_132820.jpg", thumbnail: "/gallery/thumbnails/20240204_132820 Pequena.jpeg", title: "Por do sol na Lagoa da Pampulha", category: "Arredores" },
  { order: 7, type: "image", src: "/gallery/20240119_113828.jpg", thumbnail: "/gallery/thumbnails/20240119_113828 Pequena.jpeg", title: "Banheiro social", category: "Banheiros" },
  { order: 8, type: "image", src: "/gallery/20240119_113840.jpg", thumbnail: "/gallery/thumbnails/20240119_113840 Pequena.jpeg", title: "Banheiro social", category: "Banheiros" },
  { order: 9, type: "image", src: "/gallery/20240119_113853.jpg", thumbnail: "/gallery/thumbnails/20240119_113853 Pequena.jpeg", title: "Banheiro social", category: "Banheiros" },
  { order: 10, type: "image", src: "/gallery/20240119_114200.jpg", thumbnail: "/gallery/thumbnails/20240119_114200 Pequena.jpeg", title: "Banheiro area gourmet", category: "Banheiros" },
  { order: 11, type: "image", src: "/gallery/20240119_114551.jpg", thumbnail: "/gallery/thumbnails/20240119_114551 Pequena.jpeg", title: "Banheiro do loft", category: "Banheiros" },
  { order: 12, type: "image", src: "/gallery/20240119_114603.jpg", thumbnail: "/gallery/thumbnails/20240119_114603 Pequena.jpeg", title: "Banheiro do loft", category: "Banheiros" },
  { order: 13, type: "image", src: "/gallery/20231225_160419.jpg", thumbnail: "/gallery/thumbnails/20231225_160419 Pequena.jpeg", title: "Lavabo da sala de estar", category: "Banheiros" },
  { order: 14, type: "image", src: "/gallery/20240119_113657.jpg", thumbnail: "/gallery/thumbnails/20240119_113657 Pequena.jpeg", title: "Cozinha", category: "Cozinha Completa" },
  { order: 15, type: "image", src: "/gallery/20240119_113706.jpg", thumbnail: "/gallery/thumbnails/20240119_113706 Pequena.jpeg", title: "Cozinha", category: "Cozinha Completa" },
  { order: 16, type: "image", src: "/gallery/20240119_113716.jpg", thumbnail: "/gallery/thumbnails/20240119_113716 Pequena.jpeg", title: "Cozinha", category: "Cozinha Completa" },
  { order: 17, type: "image", src: "/gallery/20240119_114342.jpg", thumbnail: "/gallery/thumbnails/20240119_114342 Pequena.jpeg", title: "Estacionamento e palmeiras real", category: "Estacionamento" },
  { order: 18, type: "image", src: "/gallery/20240119_114408.jpg", thumbnail: "/gallery/thumbnails/20240119_114408 Pequena.jpeg", title: "Estacionamento para 5 veículos", category: "Estacionamento" },
  { order: 19, type: "image", src: "/gallery/20231225_174638.jpg", thumbnail: "/gallery/thumbnails/20231225_174638 Pequena.jpeg", title: "Estacionamento para 5 veículos", category: "Estacionamento" },
  { order: 20, type: "image", src: "/gallery/20240119_114009.jpg", thumbnail: "/gallery/thumbnails/20240119_114009 Pequena.jpeg", title: "Varanda com rampa de acesso", category: "Jardim" },
  { order: 21, type: "image", src: "/gallery/20240118_144304.jpg", thumbnail: "/gallery/thumbnails/20240118_144304 Pequena.jpeg", title: "Flores do jardim", category: "Jardim" },
  { order: 22, type: "image", src: "/gallery/20240119_114019.jpg", thumbnail: "/gallery/thumbnails/20240119_114019 Pequena.jpeg", title: "Varanda", category: "Jardim" },
  { order: 23, type: "image", src: "/gallery/20240119_114059.jpg", thumbnail: "/gallery/thumbnails/20240119_114059 Pequena.jpeg", title: "Varanda", category: "Jardim" },
  { order: 24, type: "image", src: "/gallery/20240119_114034.jpg", thumbnail: "/gallery/thumbnails/20240119_114034 Pequena.jpeg", title: "Jardim", category: "Jardim" },
  { order: 25, type: "image", src: "/gallery/20240119_114929.jpg", thumbnail: "/gallery/thumbnails/20240119_114929 Pequena.jpeg", title: "Jardim", category: "Jardim" },
  { order: 26, type: "image", src: "/gallery/20240119_114039.jpg", thumbnail: "/gallery/thumbnails/20240119_114039 Pequena.jpeg", title: "Quaresmeira", category: "Jardim" },
  { order: 27, type: "image", src: "/gallery/20240119_114115.jpg", thumbnail: "/gallery/thumbnails/20240119_114115 Pequena.jpeg", title: "Quaresmeira", category: "Jardim" },
  { order: 28, type: "image", src: "/gallery/20240119_114149.jpg", thumbnail: "/gallery/thumbnails/20240119_114149 Pequena.jpeg", title: "Quaresmeira", category: "Jardim" },
  { order: 29, type: "image", src: "/gallery/20240119_114419.jpg", thumbnail: "/gallery/thumbnails/20240119_114419 Pequena.jpeg", title: "Jardim do loft", category: "Jardim" },
  { order: 30, type: "image", src: "/gallery/20240119_114643.jpg", thumbnail: "/gallery/thumbnails/20240119_114643 Pequena.jpeg", title: "Jardim do loft", category: "Jardim" },
  { order: 31, type: "image", src: "/gallery/20240119_114651.jpg", thumbnail: "/gallery/thumbnails/20240119_114651 Pequena.jpeg", title: "Jardim dos fundos do loft", category: "Jardim" },
  { order: 32, type: "image", src: "/gallery/20240119_114125.jpg", thumbnail: "/gallery/thumbnails/20240119_114125 Pequena.jpeg", title: "Quaresmeira e pula-pula", category: "Jardim" },
  { order: 33, type: "image", src: "/gallery/20240119_114717.jpg", thumbnail: "/gallery/thumbnails/20240119_114717 Pequena.jpeg", title: "Casa de passarinhos rústica", category: "Jardim" },
  { order: 34, type: "image", src: "/gallery/20240119_114900.jpg", thumbnail: "/gallery/thumbnails/20240119_114900 Pequena.jpeg", title: "Jardim da piscina", category: "Jardim" },
  { order: 35, type: "image", src: "/gallery/20240119_114910.jpg", thumbnail: "/gallery/thumbnails/20240119_114910 Pequena.jpeg", title: "Jabuticabeira e mangueira", category: "Jardim" },
  { order: 36, type: "image", src: "/gallery/20230220_144452.jpg", thumbnail: "/gallery/thumbnails/20230220_144452 Pequena.jpeg", title: "Mico dourado", category: "Jardim" },
  { order: 37, type: "image", src: "/gallery/20230220_144520.jpg", thumbnail: "/gallery/thumbnails/20230220_144520 Pequena.jpeg", title: "Mico dourado", category: "Jardim" },
  { order: 38, type: "image", src: "/gallery/20230220_144525.jpg", thumbnail: "/gallery/thumbnails/20230220_144525 Pequena.jpeg", title: "Mico dourado", category: "Jardim" },
  { order: 39, type: "image", src: "/gallery/20230220_144535.jpg", thumbnail: "/gallery/thumbnails/20230220_144535 Pequena.jpeg", title: "Mico dourado", category: "Jardim" },
  { order: 40, type: "image", src: "/gallery/20230220_144542.jpg", thumbnail: "/gallery/thumbnails/20230220_144542 Pequena.jpeg", title: "Mico dourado", category: "Jardim" },
  { order: 41, type: "image", src: "/gallery/20240119_113731.jpg", thumbnail: "/gallery/thumbnails/20240119_113731 Pequena.jpeg", title: "Area de serviço externa", category: "Lavanderia" },
  { order: 42, type: "image", src: "/gallery/20240119_113737.jpg", thumbnail: "/gallery/thumbnails/20240119_113737 Pequena.jpeg", title: "Area de serviço externa", category: "Lavanderia" },
  { order: 43, type: "image", src: "/gallery/20240119_113745.jpg", thumbnail: "/gallery/thumbnails/20240119_113745 Pequena.jpeg", title: "Varal e bicicletas na area de serviço externa", category: "Lavanderia" },
  { order: 44, type: "image", src: "/gallery/20240119_114322.jpg", thumbnail: "/gallery/thumbnails/20240119_114322 Pequena.jpeg", title: "Fundos do loft e gira-gira", category: "Loft" },
  { order: 45, type: "image", src: "/gallery/20240119_114334.jpg", thumbnail: "/gallery/thumbnails/20240119_114334 Pequena.jpeg", title: "Fundos do loft e estacionamento", category: "Loft" },
  { order: 46, type: "image", src: "/gallery/20240119_114351.jpg", thumbnail: "/gallery/thumbnails/20240119_114351 Pequena.jpeg", title: "Lateral do loft e estacionamento", category: "Loft" },
  { order: 47, type: "image", src: "/gallery/20240119_114400.jpg", thumbnail: "/gallery/thumbnails/20240119_114400 Pequena.jpeg", title: "Entrada para o loft", category: "Loft" },
  { order: 48, type: "image", src: "/gallery/20240119_114425.jpg", thumbnail: "/gallery/thumbnails/20240119_114425 Pequena.jpeg", title: "Vista frontal do loft", category: "Loft" },
  { order: 49, type: "image", src: "/gallery/20240119_114457.jpg", thumbnail: "/gallery/thumbnails/20240119_114457 Pequena.jpeg", title: "Cama de casal, solteiro (bicama) e sofá-cama do loft", category: "Loft" },
  { order: 50, type: "image", src: "/gallery/20240119_114440.jpg", thumbnail: "/gallery/thumbnails/20240119_114440 Pequena.jpeg", title: "Área interna do loft com vista para a piscina", category: "Loft" },
  { order: 51, type: "image", src: "/gallery/20240119_114502.jpg", thumbnail: "/gallery/thumbnails/20240119_114502 Pequena.jpeg", title: "Área interna do loft", category: "Loft" },
  { order: 52, type: "image", src: "/gallery/20240119_114517.jpg", thumbnail: "/gallery/thumbnails/20240119_114517 Pequena.jpeg", title: "Vista ampla da sala de tv e espaço de trabalho do loft", category: "Loft" },
  { order: 53, type: "image", src: "/gallery/20240119_114524.jpg", thumbnail: "/gallery/thumbnails/20240119_114524 Pequena.jpeg", title: "Sala de tv e espaço de trabalho do loft", category: "Loft" },
  { order: 54, type: "image", src: "/gallery/20240119_114528.jpg", thumbnail: "/gallery/thumbnails/20240119_114528 Pequena.jpeg", title: "Sofá cama do loft", category: "Loft" },
  { order: 55, type: "image", src: "/gallery/20240119_114537.jpg", thumbnail: "/gallery/thumbnails/20240119_114537 Pequena.jpeg", title: "Vista interna da entrada do loft", category: "Loft" },
  { order: 56, type: "image", src: "/gallery/20240119_114600.jpg", thumbnail: "/gallery/thumbnails/20240119_114600 Pequena.jpeg", title: "Banheiro do loft", category: "Loft" },
  { order: 57, type: "image", src: "/gallery/20240119_114048.jpg", thumbnail: "/gallery/thumbnails/20240119_114048 Pequena.jpeg", title: "Área da piscina, mangueira e jabuticabeira", category: "Piscina/Jacuzzi" },
  { order: 58, type: "image", src: "/gallery/20240119_114107.jpg", thumbnail: "/gallery/thumbnails/20240119_114107 Pequena.jpeg", title: "Aquecedor da piscina e casa de máquinas", category: "Piscina/Jacuzzi" },
  { order: 59, type: "image", src: "/gallery/20240204_132813.jpg", thumbnail: "/gallery/thumbnails/20240204_132813 Pequena.jpeg", title: "Aquecedor da piscina e casa de máquinas", category: "Piscina/Jacuzzi" },
  { order: 60, type: "image", src: "/gallery/20240119_114259.jpg", thumbnail: "/gallery/thumbnails/20240119_114259 Pequena.jpeg", title: "Área da piscina", category: "Piscina/Jacuzzi" },
  { order: 61, type: "image", src: "/gallery/20240119_114828.jpg", thumbnail: "/gallery/thumbnails/20240119_114828 Pequena.jpeg", title: "Piscina", category: "Piscina/Jacuzzi" },
  { order: 62, type: "image", src: "/gallery/20240119_114847.jpg", thumbnail: "/gallery/thumbnails/20240119_114847 Pequena.jpeg", title: "Piscina", category: "Piscina/Jacuzzi" },
  { order: 63, type: "image", src: "/gallery/20240204_132814.jpg", thumbnail: "/gallery/thumbnails/20240204_132814 Pequena.jpeg", title: "Iluminação da piscina", category: "Piscina/Jacuzzi" },
  { order: 64, type: "image", src: "/gallery/20230205_012010.jpg", thumbnail: "/gallery/thumbnails/20230205_012010 Pequena.jpeg", title: "Iluminação da piscina", category: "Piscina/Jacuzzi" },
  { order: 65, type: "image", src: "/gallery/20240119_114922.jpg", thumbnail: "/gallery/thumbnails/20240119_114922 Pequena.jpeg", title: "Jacuzzi", category: "Piscina/Jacuzzi" },
  { order: 66, type: "image", src: "/gallery/20240119_114923.jpg", thumbnail: "/gallery/thumbnails/20240119_114923 Pequena.jpeg", title: "Jacuzzi", category: "Piscina/Jacuzzi" },
  { order: 67, type: "image", src: "/gallery/20240119_114935.jpg", thumbnail: "/gallery/thumbnails/20240119_114935 Pequena.jpeg", title: "Chuveiro da piscina", category: "Piscina/Jacuzzi" },
  { order: 68, type: "image", src: "/gallery/20240119_114141.jpg", thumbnail: "/gallery/thumbnails/20240119_114141 Pequena.jpeg", title: "Pula-pula", category: "Playground" },
  { order: 69, type: "image", src: "/gallery/20240119_114304.jpg", thumbnail: "/gallery/thumbnails/20240119_114304 Pequena.jpeg", title: "Piscina e parquinho", category: "Playground" },
  { order: 70, type: "image", src: "/gallery/20240119_114318.jpg", thumbnail: "/gallery/thumbnails/20240119_114318 Pequena.jpeg", title: "Casa de madeira e gira-gira", category: "Playground" },
  { order: 71, type: "image", src: "/gallery/20240119_114700.jpg", thumbnail: "/gallery/thumbnails/20240119_114700 Pequena.jpeg", title: "Casa de madeira e gira-gira", category: "Playground" },
  { order: 72, type: "image", src: "/gallery/20240119_114705.jpg", thumbnail: "/gallery/thumbnails/20240119_114705 Pequena.jpeg", title: "Gira-gira e rampa de cordas da casa de madeira", category: "Playground" },
  { order: 73, type: "image", src: "/gallery/20240119_114312.jpg", thumbnail: "/gallery/thumbnails/20240119_114312 Pequena.jpeg", title: "Casa de madeira com escorrega e balanços", category: "Playground" },
  { order: 74, type: "image", src: "/gallery/20240119_114621.jpg", thumbnail: "/gallery/thumbnails/20240119_114621 Pequena.jpeg", title: "Gramado da área do playground", category: "Playground" },
  { order: 75, type: "image", src: "/gallery/20240119_113558.jpg", thumbnail: "/gallery/thumbnails/20240119_113558 Pequena.jpeg", title: "Quarto crianças", category: "Quarto Crianças" },
  { order: 76, type: "image", src: "/gallery/20240204_132815.jpg", thumbnail: "/gallery/thumbnails/20240204_132815 Pequena.jpeg", title: "Quarto crianças", category: "Quarto Crianças" },
  { order: 77, type: "image", src: "/gallery/20231225_160727.jpg", thumbnail: "/gallery/thumbnails/20231225_160727 Pequena.jpeg", title: "Quarto crianças", category: "Quarto Crianças" },
  { order: 78, type: "image", src: "/gallery/20231225_160732.jpg", thumbnail: "/gallery/thumbnails/20231225_160732 Pequena.jpeg", title: "Quarto crianças", category: "Quarto Crianças" },
  { order: 79, type: "image", src: "/gallery/20240119_113609.jpg", thumbnail: "/gallery/thumbnails/20240119_113609 Pequena.jpeg", title: "Quarto com 2 camas de solteiro", category: "Quarto Crianças" },
  { order: 80, type: "image", src: "/gallery/20231225_160702.jpg", thumbnail: "/gallery/thumbnails/20231225_160702 Pequena.jpeg", title: "Quarto com 2 camas de solteiro", category: "Quarto Crianças" },
  { order: 81, type: "image", src: "/gallery/20240119_113433.jpg", thumbnail: "/gallery/thumbnails/20240119_113433 Pequena.jpeg", title: "Quarto Família", category: "Quarto Família" },
  { order: 82, type: "image", src: "/gallery/20240119_113453.jpg", thumbnail: "/gallery/thumbnails/20240119_113453 Pequena.jpeg", title: "Quarto Família", category: "Quarto Família" },
  { order: 83, type: "image", src: "/gallery/20240119_113506.jpg", thumbnail: "/gallery/thumbnails/20240119_113506 Pequena.jpeg", title: "Cama de casal do quarto Família", category: "Quarto Família" },
  { order: 84, type: "image", src: "/gallery/20240119_113514.jpg", thumbnail: "/gallery/thumbnails/20240119_113514 Pequena.jpeg", title: "SmartTv e Ventilador de teto do quarto Família", category: "Quarto Família" },
  { order: 85, type: "image", src: "/gallery/20240118_194536.jpg", thumbnail: "/gallery/thumbnails/20240118_194536 Pequena.jpeg", title: "Cristaleira", category: "Sala de Estar" },
  { order: 86, type: "image", src: "/gallery/20240118_194552.jpg", thumbnail: "/gallery/thumbnails/20240118_194552 Pequena.jpeg", title: "Taças cristaleira", category: "Sala de Estar" },
  { order: 87, type: "image", src: "/gallery/20240118_194556.jpg", thumbnail: "/gallery/thumbnails/20240118_194556 Pequena.jpeg", title: "Pratos cristaleira", category: "Sala de Estar" },
  { order: 88, type: "image", src: "/gallery/20240118_194625.jpg", thumbnail: "/gallery/thumbnails/20240118_194625 Pequena.jpeg", title: "Xicaras Nespresso", category: "Sala de Estar" },
  { order: 89, type: "image", src: "/gallery/20240118_194727.jpg", thumbnail: "/gallery/thumbnails/20240118_194727 Pequena.jpeg", title: "Fogão a lenha", category: "Sala de Estar" },
  { order: 90, type: "image", src: "/gallery/20240119_113240.jpg", thumbnail: "/gallery/thumbnails/20240119_113240 Pequena.jpeg", title: "Fogão a lenha", category: "Sala de Estar" },
  { order: 91, type: "image", src: "/gallery/20240119_113211.jpg", thumbnail: "/gallery/thumbnails/20240119_113211 Pequena.jpeg", title: "Antessala", category: "Sala de Estar" },
  { order: 92, type: "image", src: "/gallery/20240119_113320.jpg", thumbnail: "/gallery/thumbnails/20240119_113320 Pequena.jpeg", title: "Antessala", category: "Sala de Estar" },
  { order: 93, type: "image", src: "/gallery/20240119_113348.jpg", thumbnail: "/gallery/thumbnails/20240119_113348 Pequena.jpeg", title: "Antessala", category: "Sala de Estar" },
  { order: 94, type: "image", src: "/gallery/20240119_113332.jpg", thumbnail: "/gallery/thumbnails/20240119_113332 Pequena.jpeg", title: "Aparadouro", category: "Sala de Estar" },
  { order: 95, type: "image", src: "/gallery/20240119_113916.jpg", thumbnail: "/gallery/thumbnails/20240119_113916 Pequena.jpeg", title: "Sala de TV", category: "Sala de Estar" },
  { order: 96, type: "image", src: "/gallery/20240119_113925.jpg", thumbnail: "/gallery/thumbnails/20240119_113925 Pequena.jpeg", title: "Sala de jantar", category: "Sala de Estar" },
  { order: 97, type: "image", src: "/gallery/20231225_160149.jpg", thumbnail: "/gallery/thumbnails/20231225_160149 Pequena.jpeg", title: "Sala de jantar", category: "Sala de Estar" },
  { order: 98, type: "image", src: "/gallery/20240119_113941.jpg", thumbnail: "/gallery/thumbnails/20240119_113941 Pequena.jpeg", title: "Sala de jantar e de TV", category: "Sala de Estar" },
  { order: 99, type: "image", src: "/gallery/20240119_113956.jpg", thumbnail: "/gallery/thumbnails/20240119_113956 Pequena.jpeg", title: "Sala de jantar e de TV", category: "Sala de Estar" },
  { order: 100, type: "image", src: "/gallery/20231225_160221.jpg", thumbnail: "/gallery/thumbnails/20231225_160221 Pequena.jpeg", title: "Sala de jantar e de TV", category: "Sala de Estar" },
  { order: 101, type: "image", src: "/gallery/20231225_160209.jpg", thumbnail: "/gallery/thumbnails/20231225_160209 Pequena.jpeg", title: "Sala de TV", category: "Sala de Estar" },
  { order: 102, type: "image", src: "/gallery/20240204_132817.jpg", thumbnail: "/gallery/thumbnails/20240204_132817 Pequena.jpeg", title: "Cama Queen Size com roupas de cama e banho envelopadas", category: "Suite Master" },
  { order: 103, type: "image", src: "/gallery/20240204_132818.jpg", thumbnail: "/gallery/thumbnails/20240204_132818 Pequena.jpeg", title: "Suite Master com vista para o jardim e piscina", category: "Suite Master" },
  { order: 104, type: "video", src: "https://www.youtube.com/embed/OGmQQiDLc28", thumbnail: "/images/hall.jpg", title: "Como chegar", category: "Vídeos" },
  { order: 105, type: "video", src: "https://www.youtube.com/embed/v30i_54VFz0", thumbnail: "/images/hall.jpg", title: "Conheça o Loft", category: "Vídeos" },
  { order: 106, type: "video", src: "https://www.youtube.com/embed/xHoo8ZMQRq0", thumbnail: "/images/hall.jpg", title: "Tour Virtual da Casa", category: "Vídeos" },
  { order: 107, type: "video", src: "https://www.youtube.com/embed/vJADRfDqq14", thumbnail: "/images/hall.jpg", title: "Continuação do Tour Virtual da Casa", category: "Vídeos" },
];

// Places Data (45 items)
const placesData = [
  // Atrações
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
  // Restaurantes
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
  // Bares
  { name: "Seu Pai Bar & Drinkeria", description: "Bar com drinks especiais e ambiente descolado.", address: "Pampulha, Belo Horizonte", category: "bars", rating: 4, distanceCar: "8 min", distanceWalk: "58 min", distance: "4 km", image: "/images/Seu_Pai_Bar_E_Drinkeria.png", mapUrl: "https://maps.app.goo.gl/59fhHGoQHVqKmN4L7" },
  { name: "Lagoa Rock Bar", description: "Bar temático de rock às margens da Lagoa da Pampulha.", address: "Pampulha, Belo Horizonte", category: "bars", rating: 4, distanceCar: "8 min", distanceWalk: "59 min", distance: "4.1 km", image: "/images/Lagoa_Rock_Bar.png", mapUrl: "https://maps.app.goo.gl/t9jpmyWUogrHGTMUA" },
  // Serviços
  { name: "Zero Grau Distribuidora de Bebidas", description: "Faz entregas e possui preços muito bons. Ótima opção para abastecer a casa.", address: "Pampulha, Belo Horizonte", category: "services", rating: 5, distanceCar: "7 min", distanceWalk: "48 min", distance: "3.5 km", image: "/images/Zero_Grau_Distribuidora_de_Bebidas.png", mapUrl: "https://maps.app.goo.gl/a6L9tB2jDxXdUQ6ZA" },
  { name: "Supernosso Pampulha", description: "Supermercado que nós recomendamos. Ótima variedade e qualidade.", address: "Pampulha, Belo Horizonte", category: "services", rating: 5, distanceCar: "8 min", distanceWalk: "50 min", distance: "3.6 km", image: "/images/Supernosso_Pampulha.png", mapUrl: "https://maps.app.goo.gl/U1RhPdNo9d66Q6436" },
  { name: "Supermercados BH", description: "Supermercado mais popular. Fica bem perto da casa.", address: "Pampulha, Belo Horizonte", category: "services", rating: 4, distanceWalk: "19 min", distanceCar: "3 min", distance: "1.4 km", image: "/images/Supermercados_BH.png", mapUrl: "https://maps.app.goo.gl/cTBNBHeyXyeVrY2C8" },
  { name: "Sacolão Total", description: "Frutas e verduras fresquinhas. Bem perto da Casa.", address: "Pampulha, Belo Horizonte", category: "services", rating: 4, distanceWalk: "3 min", distanceCar: "1 min", distance: "180 m", image: "/images/Sacolao_Total.png", mapUrl: "https://maps.app.goo.gl/WvMCk76KhjMhnFRg6" },
  { name: "Ao Gosto Carnes Nobres e Exóticas", description: "Açougue com carnes nobres e exóticas. Para um churrasco especial.", address: "Pampulha, Belo Horizonte", category: "services", rating: 5, distanceCar: "7 min", distanceWalk: "48 min", distance: "3.5 km", image: "/images/Ao_Gosto_Carnes_Nobres_E_Exoticas.png", mapUrl: "https://maps.app.goo.gl/5F9WXBUAy6R3C6bD8" },
  { name: "Drogaria Araújo", description: "Drogaria/Farmácia. Fica bem próxima à casa.", address: "Pampulha, Belo Horizonte", category: "services", rating: 4, distanceWalk: "19 min", distanceCar: "4 min", distance: "1.4 km", image: "/images/Drogaria_Araujo.png", mapUrl: "https://maps.app.goo.gl/5qWFNuVRJB3tMsjJ8" },
  { name: "Posto Ipiranga Copacabana", description: "Posto de combustível mais próximo.", address: "Pampulha, Belo Horizonte", category: "services", rating: 4, distanceWalk: "14 min", distanceCar: "3 min", distance: "1 km", image: "/images/Posto_Ipiranga.png", mapUrl: "https://maps.app.goo.gl/VmxPBvCdN3qQfJb69" },
  // Esportes
  { name: "Arena MRV", description: "Estádio do Atlético Mineiro. Casa do Galo!", address: "Pampulha, Belo Horizonte", category: "sports", rating: 5, distanceCar: "17 min", distanceWalk: "1 h 33 min", distance: "7.2 km", image: "/images/Arena_MRV.png", mapUrl: "https://maps.app.goo.gl/rWYB2qhLp2rP1dPp9" },
  { name: "Toca da Raposa - Cruzeiro", description: "Centro de Treinamento do Cruzeiro Esporte Clube.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "8 min", distanceWalk: "57 min", distance: "3.9 km", image: "/images/Toca_da_Raposa_Cruzeiro_Esporte_Clube.png", mapUrl: "https://maps.app.goo.gl/1yDt4qN7fX7GHvjh8" },
  { name: "Território do Galo", description: "Loja oficial do Atlético Mineiro.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "15 min", distanceWalk: "1 h 23 min", distance: "6 km", image: "/images/Territorio_do_Galo.png", mapUrl: "https://maps.app.goo.gl/5kRJ2mXeX8TT7qN16" },
  { name: "Smart Fit Pampulha", description: "Academia Smart Fit na Pampulha.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "8 min", distanceWalk: "1 h 1 min", distance: "4.4 km", image: "/images/Academia_Smart_Fit_Pampulha.png", mapUrl: "https://maps.app.goo.gl/Apm9aCrL3fqJjDLv6" },
  { name: "Califa Beach Sports", description: "Beach Sports com quadras de areia para prática de esportes.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "4 min", distanceWalk: "26 min", distance: "1.8 km", image: "/images/Califa_Beach_Sports.png", mapUrl: "https://maps.app.goo.gl/hRW3vpzPhtSN9sMU7" },
  { name: "Arena Marco Zero BH", description: "Arena de esportes como Beach Tenis e Futevôlei.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "14 min", distanceWalk: "1 h 23 min", distance: "6 km", image: "/images/Arena_Marco_Zero_BH.png", mapUrl: "https://maps.app.goo.gl/6bmhGJWNZa4EqMU47" },
  { name: "AABB BH", description: "Clube com piscinas, quadras e atividades para toda a família.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceCar: "5 min", distanceWalk: "34 min", distance: "2.4 km", image: "/images/AABB.png", mapUrl: "https://maps.app.goo.gl/MXHqQKbE7J4hfV9E9" },
  { name: "Estação 08 BIKE BH", description: "Estação de aluguel de bicicletas para passeios na orla da Lagoa.", address: "Pampulha, Belo Horizonte", category: "sports", rating: 4, distanceWalk: "8 min", distanceCar: "1 min", distance: "550 m", image: "/images/Estacao_08_BIKE_BH.png", mapUrl: "https://maps.app.goo.gl/1eCh3X6E5eGt6pMn7" },
  // Crianças
  { name: "Barnabé Bar e Espetaria", description: "Bar com espaço para crianças. Ótimo para famílias.", address: "Pampulha, Belo Horizonte", category: "kids", rating: 4, distanceCar: "5 min", distanceWalk: "36 min", distance: "2.5 km", image: "/images/Barnabe_Bar_E_Espetaria.png", mapUrl: "https://maps.app.goo.gl/rSR4sSixSNmJDRvj8" },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Create models
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
    const Place = mongoose.models.Place || mongoose.model('Place', PlaceSchema);
    const GalleryItem = mongoose.models.GalleryItem || mongoose.model('GalleryItem', GalleryItemSchema);
    const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);
    const CheckoutInfo = mongoose.models.CheckoutInfo || mongoose.model('CheckoutInfo', CheckoutInfoSchema);
    const GuestInfo = mongoose.models.GuestInfo || mongoose.model('GuestInfo', GuestInfoSchema);
    const Host = mongoose.models.Host || mongoose.model('Host', HostSchema);

    console.log('🗑️  Limpando coleções...');
    await FAQ.deleteMany({});
    await CheckoutInfo.deleteMany({});
    await GuestInfo.deleteMany({});
    await Host.deleteMany({});
    await GalleryItem.deleteMany({});
    // Don't clear places and property if they might have data

    console.log('📝 Inserindo FAQs...');
    await FAQ.insertMany(faqsData);
    console.log(`✅ ${faqsData.length} FAQs inseridos`);

    console.log('📋 Inserindo instruções de check-out (formato otimizado)...');
    await GuestInfo.insertMany(checkoutInstructionsData);
    console.log(`✅ ${checkoutInstructionsData.length} instruções de check-out inseridas`);

    console.log('👥 Inserindo anfitriões...');
    await Host.insertMany(hostsData);
    console.log(`✅ ${hostsData.length} anfitriões inseridos`);

    console.log('🖼️  Inserindo galeria (107 itens)...');
    await GalleryItem.insertMany(galleryData);
    console.log(`✅ ${galleryData.length} itens da galeria inseridos`);

    console.log('📍 Inserindo locais (45 itens)...');
    await Place.insertMany(placesData);
    console.log(`✅ ${placesData.length} locais inseridos`);

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@casa-da-pampulha.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Administrador',
        email: 'admin@casa-da-pampulha.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Usuário admin criado');
    }

    console.log('✅ Seed completo!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
