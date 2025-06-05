import { Local, CreateLocalPayload, UpdateLocalPayload } from '@/types/local';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const localsApi = {
    getLocals: async (): Promise<Local[]> => {
        const response = await fetch(`${API_BASE_URL}/local/`);
        if (!response.ok) {
            throw new Error('Error fetching locals');
        }
        const data = await response.json();
        if (data && Array.isArray(data.locals)) {
            return data.locals;
        } else if (Array.isArray(data)) {
            return data;
        }
        console.error('Unexpected data structure from /local/ endpoint:', data);
        throw new Error('Unexpected data structure from locals API for list');
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
    updateLocal: async (id: string, payload: UpdateLocalPayload): Promise<Local> => {
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
    bulkDeleteLocals: async (ids: string[]): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/local/bulk-delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
            body: JSON.stringify({ locals: ids }),
        });
        if (!response.ok) {
            throw new Error('Error bulk deleting locals');
        }
    },
    bulkCreateLocals: async (locals: CreateLocalPayload[]): Promise<Local[]> => {
        const response = await fetch(`${API_BASE_URL}/local/bulk-create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locals }),
        });
        if (!response.ok) {
            throw new Error('Error bulk creating locals');
        }
        return response.json();
    },
};