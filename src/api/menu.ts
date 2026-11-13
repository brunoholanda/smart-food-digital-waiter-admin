import { api } from './client';
import type {
  CreateCategoryPayload,
  CreateItemPayload,
  MenuCategory,
  MenuItem,
  UpdateCategoryPayload,
  UpdateItemPayload,
} from '../types';

export async function createCategory(
  restaurantId: string,
  payload: CreateCategoryPayload,
) {
  const { data } = await api.post<MenuCategory>('/menu/categories', payload, {
    params: { restaurantId },
  });
  return data;
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload) {
  const { data } = await api.patch<MenuCategory>(`/menu/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete(`/menu/categories/${id}`);
  return data;
}

export async function uploadCategoryImage(id: string, file: File) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post<MenuCategory>(
    `/menu/categories/${id}/image`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function createItem(payload: CreateItemPayload) {
  const { data } = await api.post<MenuItem>('/menu/items', payload);
  return data;
}

export async function updateItem(id: string, payload: UpdateItemPayload) {
  const { data } = await api.patch<MenuItem>(`/menu/items/${id}`, payload);
  return data;
}

export async function deleteItem(id: string) {
  const { data } = await api.delete(`/menu/items/${id}`);
  return data;
}

export async function uploadItemImage(id: string, file: File) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post<MenuItem>(`/menu/items/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
