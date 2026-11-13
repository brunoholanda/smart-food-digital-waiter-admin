export type Role = 'ADMIN' | 'RESTAURANT_OWNER';

export type RestaurantStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type CuisineType =
  | 'BRAZILIAN'
  | 'ITALIAN'
  | 'JAPANESE'
  | 'CHINESE'
  | 'MEXICAN'
  | 'ARABIC'
  | 'FAST_FOOD'
  | 'PIZZA'
  | 'BURGER'
  | 'SEAFOOD'
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'STEAKHOUSE'
  | 'CAFE'
  | 'BAKERY'
  | 'HEALTHY'
  | 'OTHER';

export type PriceType = 'FIXED' | 'FROM' | 'VARIABLE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  restaurant?: Restaurant | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface OwnerSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface OpeningHour {
  id: string;
  restaurantId: string;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export interface ItemVariation {
  id: string;
  itemId: string;
  name: string;
  price: string | number;
  isDefault: boolean;
  sortOrder: number;
}

export interface ItemAddon {
  id: string;
  groupId: string;
  name: string;
  price: string | number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface ItemAddonGroup {
  id: string;
  itemId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  addons: ItemAddon[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: string | number;
  priceType: PriceType;
  promotionalPrice?: string | number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  prepTimeMin?: number | null;
  calories?: number | null;
  servesPeople?: number | null;
  spicyLevel: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergens: string[];
  tags: string[];
  variations?: ItemVariation[];
  addonGroups?: ItemAddonGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  items: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  tradeName: string;
  legalName?: string | null;
  document?: string | null;
  email: string;
  phone: string;
  whatsapp?: string | null;
  description?: string | null;
  cuisineType: CuisineType;
  status: RestaurantStatus;
  rejectionReason?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  coverColor?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instagram?: string | null;
  website?: string | null;
  minOrderValue?: string | number | null;
  deliveryFee?: string | number | null;
  estimatedTime?: string | null;
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
  acceptsDineIn: boolean;
  isPublished: boolean;
  ownerId: string;
  owner?: OwnerSummary;
  openingHours?: OpeningHour[];
  categories?: MenuCategory[];
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  _count?: { categories: number };
}

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  items: number;
}

export type SettlementStatus =
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'RECTIFIED'
  | 'TRANSFERRED'
  | 'DISPUTED'
  | 'CANCELLED';

export type PaymentMethod = 'PIX' | 'CARD' | 'CASH';

export type OrderStatus =
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUNDED';

export interface FinanceDashboard {
  pendingReview: number;
  verified: number;
  rectified: number;
  transferred: number;
  disputed: number;
  awaitingPayoutCount: number;
  awaitingPayoutTotal: string | number;
  grossTotal: string | number;
  feesTotal: string | number;
  payoutsTotal: string | number;
}

export interface PaymentRestaurant {
  id: string;
  tradeName: string;
  slug: string;
  document?: string | null;
  bankPixKey?: string | null;
  bankAccountName?: string | null;
  bankAccountDoc?: string | null;
  platformFeePercent?: string | number | null;
}

export interface PaymentOrderItem {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  name: string;
  description?: string | null;
  unitPrice: string | number;
  quantity: number;
  notes?: string | null;
  variationName?: string | null;
  addonsJson?: unknown;
  lineTotal: string | number;
}

export interface PaymentOrder {
  id: string;
  code: string;
  tableNumber?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  total: string | number;
  paymentMethod?: PaymentMethod | null;
  status: OrderStatus;
  items?: PaymentOrderItem[];
}

export interface Payment {
  id: string;
  orderId: string;
  restaurantId: string;
  status: SettlementStatus;
  paymentMethod: PaymentMethod;
  paymentRef?: string | null;
  grossAmount: string | number;
  platformFeePercent: string | number;
  platformFeeAmount: string | number;
  netAmount: string | number;
  adjustedNetAmount?: string | number | null;
  payoutAmount: string | number;
  rectificationNote?: string | null;
  rectificationDelta?: string | number | null;
  disputeReason?: string | null;
  adminNotes?: string | null;
  verifiedAt?: string | null;
  rectifiedAt?: string | null;
  transferredAt?: string | null;
  transferRef?: string | null;
  transferNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
  restaurant?: PaymentRestaurant;
  order?: PaymentOrder;
}

export interface VerifyPaymentPayload {
  adminNotes?: string;
}

export interface RectifyPaymentPayload {
  payoutAmount: number;
  reason: string;
  adminNotes?: string;
}

export interface TransferPaymentPayload {
  transferRef: string;
  transferNotes?: string;
}

export interface DisputePaymentPayload {
  reason: string;
}

export interface ListPaymentsParams {
  status?: SettlementStatus;
  restaurantId?: string;
  search?: string;
}

export interface ReviewRestaurantPayload {
  status: RestaurantStatus;
  rejectionReason?: string;
}

export interface UpdateRestaurantPayload {
  tradeName?: string;
  legalName?: string;
  document?: string;
  phone?: string;
  whatsapp?: string;
  description?: string;
  cuisineType?: CuisineType;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  instagram?: string;
  website?: string;
  coverColor?: string;
  estimatedTime?: string;
  minOrderValue?: number;
  deliveryFee?: number;
  acceptsDelivery?: boolean;
  acceptsPickup?: boolean;
  acceptsDineIn?: boolean;
  isPublished?: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  priceType?: PriceType;
  promotionalPrice?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  prepTimeMin?: number;
  calories?: number;
  servesPeople?: number;
  spicyLevel?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  allergens?: string[];
  tags?: string[];
}

export type UpdateItemPayload = Partial<CreateItemPayload>;
