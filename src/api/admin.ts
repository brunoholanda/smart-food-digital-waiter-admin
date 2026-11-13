import { api } from './client';
import type {
  DashboardStats,
  DisputePaymentPayload,
  FinanceDashboard,
  ListPaymentsParams,
  Payment,
  RectifyPaymentPayload,
  Restaurant,
  RestaurantStatus,
  ReviewRestaurantPayload,
  TransferPaymentPayload,
  UpdateRestaurantPayload,
  VerifyPaymentPayload,
} from '../types';

export async function getDashboard() {
  const { data } = await api.get<DashboardStats>('/admin/dashboard');
  return data;
}

export async function getFinanceDashboard() {
  const { data } = await api.get<FinanceDashboard>('/admin/finance/dashboard');
  return data;
}

export async function listRestaurants(status?: RestaurantStatus) {
  const { data } = await api.get<Restaurant[]>('/admin/restaurants', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getRestaurant(id: string) {
  const { data } = await api.get<Restaurant>(`/admin/restaurants/${id}`);
  return data;
}

export async function reviewRestaurant(
  id: string,
  payload: ReviewRestaurantPayload,
) {
  const { data } = await api.patch<Restaurant>(
    `/admin/restaurants/${id}/review`,
    payload,
  );
  return data;
}

export async function updateRestaurant(
  id: string,
  payload: UpdateRestaurantPayload,
) {
  const { data } = await api.patch<Restaurant>(
    `/admin/restaurants/${id}`,
    payload,
  );
  return data;
}

export async function listPayments(params?: ListPaymentsParams) {
  const { data } = await api.get<Payment[]>('/admin/payments', { params });
  return data;
}

export async function getPayment(id: string) {
  const { data } = await api.get<Payment>(`/admin/payments/${id}`);
  return data;
}

export async function verifyPayment(id: string, payload?: VerifyPaymentPayload) {
  const { data } = await api.post<Payment>(
    `/admin/payments/${id}/verify`,
    payload ?? {},
  );
  return data;
}

export async function rectifyPayment(
  id: string,
  payload: RectifyPaymentPayload,
) {
  const { data } = await api.post<Payment>(
    `/admin/payments/${id}/rectify`,
    payload,
  );
  return data;
}

export async function transferPayment(
  id: string,
  payload: TransferPaymentPayload,
) {
  const { data } = await api.post<Payment>(
    `/admin/payments/${id}/transfer`,
    payload,
  );
  return data;
}

export async function disputePayment(
  id: string,
  payload: DisputePaymentPayload,
) {
  const { data } = await api.post<Payment>(
    `/admin/payments/${id}/dispute`,
    payload,
  );
  return data;
}

export async function listRestaurantPayments(restaurantId: string) {
  const { data } = await api.get<Payment[]>(
    `/admin/restaurants/${restaurantId}/payments`,
  );
  return data;
}
