// Types for the application
import { Schema } from 'mongoose';

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
  lat?: number;
  lng?: number;
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
  // Highlight fields
  isHighlight: boolean;
  highlightColor?: string; // Tailwind color class (e.g., 'blue', 'green', 'amber')
  highlightDescription?: string; // Extended description for highlight display
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHost {
  _id?: string;
  bio: string;
  role: string;
  languages: string[];
  responseTime: string;
  responseRate: string;
  isSuperhost: boolean;
  joinedDate: Date;
  phoneVisibility?: 'public' | 'restricted' | 'private';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProperty {
  _id?: string;
  name: string;
  tagline: string;
  description: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  maxGuests: number | string;
  bedrooms: number | string;
  beds: number | string;
  bathrooms: number | string;
  rating: number | string;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  airbnbUrl: string;
  airbnbCalendarUrl?: string;
  heroImage: string;
  heroImages: string[];
  welcomeMessage: string;
  phone?: string;
  phoneVisibility?: 'public' | 'restricted' | 'private';
  whatsapp?: string;
  email?: string;
  isActive: boolean;

  // Door passwords
  doorPasswords?: {
    location: string;
    password: string;
    notes?: string;
  }[];

  // Temporary door password display settings
  doorPasswordConfig?: {
    showToGuests: boolean;
    addHashSuffix: boolean;
    hashSuffixNote: string;
  };

  // WiFi passwords
  wifiPasswords?: {
    network: string;
    password: string;
  }[];

  // Hero Section - textos dinâmicos
  heroTagline?: string;
  heroSubtitle?: string;
  heroHighlights?: string[];

  // About Section - textos dinâmicos
  aboutTitle?: string;
  aboutDescription?: string[];

  // Gallery Categories
  galleryCategories?: string[];

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
  showOnGuestDashboard: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Alias for GuestInfo (same structure as CheckinInfo)
export type IGuestInfo = ICheckinInfo;

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

export type UserRole = 'admin' | 'guest' | 'staff';

export type StaffJobType = 'piscineiro' | 'jardineiro' | 'faxineira' | 'manutencao' | 'outro';

export interface IChecklistItem {
  _id?: string;
  task: string;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface IPaymentInfo {
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountType?: 'corrente' | 'poupanca';
  pixKey?: string;
  pixKeyType?: 'cpf' | 'email' | 'telefone' | 'aleatoria';
  preferredPaymentMethod?: 'pix' | 'transferencia';
}

export interface IStaff {
  _id?: string;
  nickname?: string;
  jobType: StaffJobType;
  jobTitle?: string;
  hireDate?: Date;
  salary?: number;
  salaryType?: 'diaria' | 'mensal';
  paymentInfo?: IPaymentInfo;
  checklistTemplate?: IChecklistItem[];
  currentChecklist?: IChecklistItem[];
  lastChecklistReset?: Date;
  workDays?: string[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  _id?: string;
  email?: string;
  password?: string;
  name: string;
  role: UserRole;
  phone?: string;
  hasWhatsapp?: boolean;
  avatar?: string;
  reservationCode?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  isActive: boolean;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isHost?: boolean; // For guests: indicates if they are a host on Airbnb
  host?: IHost | null; // For admins: host profile data (property host)
  staff?: IStaff | null;
  // Guest profile fields
  document?: string;
  documentType?: 'CPF' | 'RG' | 'Passaporte' | 'Outro';
  nationality?: string;
  birthDate?: Date;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
  agreedToRules?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Reservation types
export type ReservationStatus = 'pending' | 'upcoming' | 'current' | 'completed' | 'cancelled';
export type ReservationSource = 'airbnb' | 'direct' | 'other';

export interface IReservation {
  _id?: string;
  userId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  guestCountry?: string;
  checkInDate: Date;
  checkInTime: string;
  checkOutDate: Date;
  checkOutTime: string;
  numberOfGuests?: number;
  notes?: string;
  status: ReservationStatus;
  source?: ReservationSource;
  reservationCode?: string;
  temporaryMainDoorPassword?: {
    location: string;
    password: string;
    notes?: string;
  };
  totalAmount?: number;
  isPaid?: boolean;
  preRegistrationId?: string;
  createdBy: string;
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
  avatar?: string;
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
  isActive?: boolean;
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
