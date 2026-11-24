import { apiRequest } from './client';

export async function fetchProfile() {
  return apiRequest('/profile/');
}

export async function updateProfile(data: Record<string, any>) {
  return apiRequest('/profile/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function addAllergy(ingredient: string) {
  return apiRequest('/profile/allergies/', {
    method: 'POST',
    body: JSON.stringify({ ingredient }),
  });
}

export async function removeAllergy(ingredient: string) {
  return apiRequest('/profile/allergies/', {
    method: 'DELETE',
    body: JSON.stringify({ ingredient }),
  });
}

export async function addDislikedFood(ingredient: string) {
  return apiRequest('/profile/dislikes/', {
    method: 'POST',
    body: JSON.stringify({ ingredient }),
  });
}

export async function removeDislikedFood(ingredient: string) {
  return apiRequest('/profile/dislikes/', {
    method: 'DELETE',
    body: JSON.stringify({ ingredient }),
  });
}
