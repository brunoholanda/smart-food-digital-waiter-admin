import type {
  CuisineType,
  PaymentMethod,
  RestaurantStatus,
  SettlementStatus,
} from '../types';

export const statusLabels: Record<RestaurantStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  SUSPENDED: 'Suspenso',
};

export const statusColors: Record<
  RestaurantStatus,
  'default' | 'success' | 'warning' | 'error' | 'processing'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  SUSPENDED: 'default',
};

export const settlementLabels: Record<SettlementStatus, string> = {
  PENDING_REVIEW: 'Pendente',
  VERIFIED: 'Verificado',
  RECTIFIED: 'Retificado',
  TRANSFERRED: 'Transferido',
  DISPUTED: 'Em disputa',
  CANCELLED: 'Cancelado',
};

export const settlementColors: Record<
  SettlementStatus,
  'default' | 'success' | 'warning' | 'error' | 'processing' | 'blue'
> = {
  PENDING_REVIEW: 'warning',
  VERIFIED: 'processing',
  RECTIFIED: 'blue',
  TRANSFERRED: 'success',
  DISPUTED: 'error',
  CANCELLED: 'default',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  PIX: 'PIX',
  CARD: 'Cartão',
  CASH: 'Dinheiro',
};

export const cuisineLabels: Record<CuisineType, string> = {
  BRAZILIAN: 'Brasileira',
  ITALIAN: 'Italiana',
  JAPANESE: 'Japonesa',
  CHINESE: 'Chinesa',
  MEXICAN: 'Mexicana',
  ARABIC: 'Árabe',
  FAST_FOOD: 'Fast Food',
  PIZZA: 'Pizza',
  BURGER: 'Hambúrguer',
  SEAFOOD: 'Frutos do Mar',
  VEGETARIAN: 'Vegetariana',
  VEGAN: 'Vegana',
  STEAKHOUSE: 'Churrascaria',
  CAFE: 'Café',
  BAKERY: 'Padaria',
  HEALTHY: 'Saudável',
  OTHER: 'Outra',
};

export const dayLabels = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

/** Formats a value as Brazilian Real (BRL). */
export function formatCurrency(value?: string | number | null) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatPercent(value?: string | number | null) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return '—';
  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(amount)}%`;
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
