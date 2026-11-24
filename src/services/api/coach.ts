import { apiRequest } from './client';

export async function sendCoachMessageBackend(message: string) {
  return apiRequest('/coach/message/', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function fetchCoachHistory() {
  return apiRequest('/coach/history/');
}
