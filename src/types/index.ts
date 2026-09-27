// ==============================
// TypeScript Types for HMEC Website
// ==============================

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  is_active: boolean;
  is_staff?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  description: string;
  products: Product[];
  projects: Project[];
  reviews: Review[];
  services?: { id: string; name: string; nameEn: string }[];
}

export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
  price?: string;
}

export interface Project {
  id: string;
  title: string;
  image: string;
  description: string;
  agency?: string;
  date: string;
  location: string;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  date: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapUrl?: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface AboutItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface WhyChooseUs {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  icon: string;
  stat?: string;
  statEn?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface CartItem {
  id: string; // Unique key e.g. `${productId}_${unitName}`
  productId: string | number;
  nameAr: string;
  nameEn?: string;
  image?: string;
  unitNameAr?: string;
  unitNameEn?: string;
  unitPrice: number;
  quantity: number;
  brandNameAr?: string;
  brandNameEn?: string;
  numberProduct?: string;
  dbId?: number;
  unitId?: number;
  subtotal?: number;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  totalAmount: number;
  status: 'processing' | 'shipped' | 'cancelled' | 'modified' | 'accepted' | 'rejected';
  createdAt: string;
  itemsCount: number;
  notes?: string;
}

export interface SliderSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  isActive: boolean;
}

export interface BranchesInfoConfig {
  introTitle: string;
  introSubtitle: string;
  customerHotline: string;
  workingDays: string;
}

export interface MainContentConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  aboutTitle: string;
  aboutText: string;
  visionText: string;
  missionText: string;
  yearsExperience: string;
}

export interface GeneralServiceConfig {
  title: string;
  subtitle: string;
  guaranteeText: string;
  supportCoverage: string;
}

export interface ContactInfoConfig {
  phoneMain: string;
  phoneSales: string;
  whatsapp: string;
  email: string;
  hqAddress: string;
  googleMapsUrl: string;
  workingHours: string;
  facebookUrl: string;
  instagramUrl: string;
}

export interface CmsAgency {
  name: string;
  nameEn: string;
  logo: string;
  description: string;
  isFeatured: boolean;
}

export interface CmsService {
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

export interface CmsTestimonial {
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
  isApproved: boolean;
}
