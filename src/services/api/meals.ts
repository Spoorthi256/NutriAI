import { apiRequest } from './client';
import { DatasetMeal } from '../../nutrition/types';

export async function fetchMeals(params?: { category?: string; dietType?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.dietType) query.append('dietType', params.dietType);
  if (params?.search) query.append('search', params.search);

  const endpoint = `/meals/${query.toString() ? '?' + query.toString() : ''}`;
  return apiRequest<DatasetMeal[]>(endpoint);
}

export async function fetchMealById(id: string) {
  return apiRequest<DatasetMeal>(`/meals/${id}/`);
}
