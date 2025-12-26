// Types for the application

export type Category = "all" | "attractions" | "restaurants" | "kids" | "bars" | "services" | "sports";

export interface IPlace {
  _id?: string;
  name: string;
  description: string;
  address: string;
  category: Category;
  rating: number;
  distanceWalk?: string;
  distanceCar?: string;
  distance?: string;
  image: string;
  mapUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MediaType = "image" | "video";

export interface IGalleryItem {
  _id?: string;
  type: MediaType;
  src: string;
  thumbnail: string;
  title: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoom {
  _id?: string;
  name: string;
  description: string;
  beds: {
    type: string;
    quantity: number;
  }[];
  maxGuests: number;
  amenities: string[];
  images: string[];
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAmenity {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHost {
  _id?: string;
  name: string;
  bio: string;
  photo: string;
  role: string;
  languages: string[];
  responseTime: string;
  responseRate: string;
  isSuperhost: boolean;
  joinedDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProperty {
  _id?: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  airbnbUrl: string;
  airbnbCalendarUrl?: string;
  heroImage: string;
  heroImages: string[];
  welcomeMessage: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICheckinInfo {
  _id?: string;
  type: 'checkin' | 'checkout' | 'rule' | 'instruction';
  title: string;
  content: string;
  icon?: string;
  order: number;
  isRestricted: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFAQ {
  _id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IKidsArea {
  _id?: string;
  title: string;
  description: string;
  features: string[];
  images: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISocialLink {
  _id?: string;
  platform: string;
  url: string;
  icon: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRole = 'admin' | 'guest';

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  reservationCode?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGuestRegistration {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  document?: string;
  documentImage?: string;
  nationality?: string;
  birthDate?: Date;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  guests: {
    name: string;
    age: number;
    document?: string;
  }[];
  checkInDate: Date;
  checkOutDate: Date;
  specialRequests?: string;
  notes?: string;
  vehiclePlates?: {
    brand?: string;
    model?: string;
    color?: string;
    plate: string }[];
  agreedToRules: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWelcomeGuide {
  _id?: string;
  title: string;
  sections: {
    title: string;
    content: string;
    image?: string;
    order: number;
  }[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Category options
export const placeCategories = [
  { id: "all", label: "Todos" },
  { id: "attractions", label: "Atrações" },
  { id: "restaurants", label: "Restaurantes" },
  { id: "bars", label: "Bares" },
  { id: "services", label: "Serviços" },
  { id: "sports", label: "Esportes" },
  { id: "kids", label: "Crianças" },
] as const;

export const galleryCategories = [
  "Todos",
  "Área Gourmet",
  "Piscina/Jacuzzi",
  "Arredores",
  "Sala de Estar",
  "Cozinha Completa",
  "Quarto Família",
  "Quarto Crianças",
  "Suite Master",
  "Loft",
  "Banheiros",
  "Jardim",
  "Lavanderia",
  "Estacionamento",
  "Playground",
  "Vídeos"
] as const;
