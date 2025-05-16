import { Session } from '@/types/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sessionsApi = {
  getSessions: async (): Promise<Session[]> => {
    const response = await fetch(`${API_BASE_URL}/session/`);
    if (!response.ok) {
      throw new Error('Error al obtener sesiones');
    }
    return response.json();
  },

  createSession: async (data: Omit<Session, 'id'>): Promise<Session> => {
    const response = await fetch(`${API_BASE_URL}/session/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Error al crear sesión');
    }
    return response.json();
  }
};
