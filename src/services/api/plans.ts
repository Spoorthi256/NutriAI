import { apiRequest } from './client';

export async function fetchCurrentPlan() {
  return apiRequest('/plans/current/');
}

export async function generateWeeklyPlanBackend() {
  return apiRequest('/plans/generate/', {
    method: 'POST',
  });
}

export async function replaceMealItemBackend(planId: number, itemId: number, targetMealId?: string) {
  return apiRequest(`/plans/${planId}/items/${itemId}/replace/`, {
    method: 'POST',
    body: JSON.stringify({ targetMealId }),
  });
}

export async function toggleLockMealItemBackend(planId: number, itemId: number) {
  return apiRequest(`/plans/${planId}/items/${itemId}/lock/`, {
    method: 'POST',
  });
}
