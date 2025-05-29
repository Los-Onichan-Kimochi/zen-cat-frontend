import { Local, CreateLocalPayload, UpdateLocalPayloadLocal } from '@/types/local';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const localsApi = {
    getLocals: async (): Promise<Local[]> => {
        const response = await fetch(`${API_BASE_URL}/local/`);
        if (!response.ok) {
            throw new Error('Error fetching locals');
        }
        return response.json(); 
    },
    getLocalById: async (id: string): Promise<Local> => {
        const response = await fetch(`${API_BASE_URL}/local/${id}/`);
        if (!response.ok) {
            throw new Error(`Error fetching local with id ${id}`);
        }
        return response.json(); 
    },
    createLocal: async (payload: CreateLocalPayload): Promise<Local> => {
        const response = await fetch(`${API_BASE_URL}/local/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error('Error creating local');
        }
        return response.json(); 
    },
    updateLocal: async (id: string, payload: UpdateLocalPayloadLocal): Promise<Local> => {
        const response = await fetch(`${API_BASE_URL}/local/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Error updating local with id ${id}`);
        }
        return response.json(); 
    },
    deleteLocal: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/local/${id}/`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Error deleting local with id ${id}`);
        }
    },
};