export interface Local {
  id: string;
  local_name: string;
  street_name: string;
  building_number: string;
  district: string;
  province: string;
  region: string;
  reference: string;
  capacity: number;
  image_url: string;
}

export interface LocalsResponse {
  locals: Local[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const localsApi = {
  // Get all locals
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
    throw new Error('Unexpected data structure from locals API');
  },

  // Get a specific local by ID
  getLocal: async (localId: string): Promise<Local> => {
    const response = await fetch(`${API_BASE_URL}/local/${localId}/`);
    if (!response.ok) {
      throw new Error(`Error fetching local with id ${localId}`);
    }
    return response.json();
  },
};
