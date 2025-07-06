import {
  Session,
  CreateSessionPayload,
  UpdateSessionPayload,
  BulkCreateSessionPayload,
  BulkDeleteSessionPayload,
  SessionFilters,
} from '@/types/session';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

// Función para convertir fecha de Lima (UTC-5) a UTC - simplificada
export const convertLimaToUTC = (limaDateTimeString: string): string => {
  if (!limaDateTimeString) {
    throw new Error('Invalid date string provided to convertLimaToUTC');
  }

  try {
    console.log('Original Lima date string:', limaDateTimeString);
    
    // Parsear la fecha como si fuera en zona horaria local
    const limaDate = new Date(limaDateTimeString);
    
    if (isNaN(limaDate.getTime())) {
      throw new Error(`Invalid date format: ${limaDateTimeString}`);
    }
    
    // Agregar 5 horas para convertir de Lima (UTC-5) a UTC
    const utcDate = new Date(limaDate.getTime());
    
    const isoString = utcDate.toISOString();
    console.log('Converted to UTC:', isoString);
    return isoString;
    
  } catch (error) {
    console.error('Error in convertLimaToUTC:', error, limaDateTimeString);
    throw error;
  }
};

// Función para convertir fechas UTC a hora de Lima para mostrar en la UI
export const convertUTCToLima = (utcDateTimeString: string): Date => {
  if (!utcDateTimeString) {
    throw new Error('Invalid UTC date string provided');
  }

  try {
    const utcDate = new Date(utcDateTimeString);
    
    if (isNaN(utcDate.getTime())) {
      throw new Error(`Cannot parse UTC date: ${utcDateTimeString}`);
    }
    
    // Convertir UTC a Lima (UTC-5)
    const limaTime = new Date(utcDate.getTime());
    
    return limaTime;
  } catch (error) {
    console.error('Error in convertUTCToLima:', error, utcDateTimeString);
    // Si hay error, devolvemos la fecha original
    return new Date(utcDateTimeString);
  }
};

export interface CheckConflictRequest {
  date: string;
  startTime: string;
  endTime: string;
  professionalId: string;
  localId?: string;
  excludeId?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  professionalConflicts: Session[];
  localConflicts: Session[];
}

export interface AvailabilityRequest {
  date: string;
  professionalId?: string;
  localId?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  title: string;
  type: 'professional' | 'local';
}

export interface AvailabilityResult {
  isAvailable: boolean;
  busySlots: TimeSlot[];
}

export const sessionsApi = {
  getSessions: async (filters?: SessionFilters): Promise<Session[]> => {
    const searchParams = new URLSearchParams();

    if (filters?.professionalIds?.length) {
      searchParams.append('professionalIds', filters.professionalIds.join(','));
    }
    if (filters?.localIds?.length) {
      searchParams.append('localIds', filters.localIds.join(','));
    }
    if (filters?.states?.length) {
      searchParams.append('states', filters.states.join(','));
    }

    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.SESSIONS.BASE}${queryString ? `?${queryString}` : ''}`;

    const data = await apiClient.get<any>(endpoint);
    if (data && Array.isArray(data.sessions)) {
      return data.sessions;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /session/ endpoint:', data);
    throw new Error('Unexpected data structure from sessions API');
  },

  getSessionById: async (id: string): Promise<Session> => {
    return apiClient.get<Session>(API_ENDPOINTS.SESSIONS.BY_ID(id));
  },

  createSession: async (payload: CreateSessionPayload): Promise<Session> => {
    // Convertir fechas de Lima (UTC-5) a UTC para el backend

    console.log (convertLimaToUTC(payload.start_time))
    const backendPayload = {
      title: payload.title,
      date: convertLimaToUTC(payload.date),
      start_time: convertLimaToUTC(payload.start_time),
      end_time: convertLimaToUTC(payload.end_time),
      capacity: payload.capacity,
      session_link: payload.session_link,
      professional_id: payload.professional_id,
      local_id: payload.local_id,
      community_service_id: payload.community_service_id,
    };

    return apiClient.post<Session>(API_ENDPOINTS.SESSIONS.BASE, backendPayload);
  },

  updateSession: async (
    id: string,
    payload: UpdateSessionPayload,
  ): Promise<Session> => {
    console.log('Original update payload:', payload);

    // Creamos un nuevo objeto para evitar modificar el original
    const backendPayload: UpdateSessionPayload = {};
    
    // Preparamos todas las fechas primero para asegurar consistencia
    let dateStr = "";
    let hasDateInfo = false;
    
    // Procesamos la fecha base primero si existe
    if (payload.date) {
      hasDateInfo = true;
      try {
        // Normalizamos la fecha para uso posterior
        dateStr = payload.date.includes('T') ? 
          payload.date.split('T')[0] : 
          payload.date;
          
        // Almacenamos en el payload solo la parte de fecha
        backendPayload.date = convertLimaToUTC(`${dateStr}T00:00:00`);
        console.log('Date converted to:', backendPayload.date);
      } catch (error) {
        console.error('Error processing date:', error);
        return Promise.reject(new Error('Error en el formato de fecha'));
      }
    }
    
    // Procesamos start_time 
    if (payload.start_time) {
      try {
        // Aseguramos que start_time tenga la misma fecha base que date si existe
        if (hasDateInfo && !payload.start_time.includes(dateStr)) {
          backendPayload.start_time = convertLimaToUTC(`${dateStr}T${payload.start_time}`);
        } else {
          backendPayload.start_time = convertLimaToUTC(payload.start_time);
        }
        console.log('Start time converted to:', backendPayload.start_time);
      } catch (error) {
        console.error('Error processing start_time:', error);
        return Promise.reject(new Error('Error en el formato de hora de inicio'));
      }
    }

    // Procesamos end_time
    if (payload.end_time) {
      try {
        // Aseguramos que end_time tenga la misma fecha base que date si existe
        if (hasDateInfo && !payload.end_time.includes(dateStr)) {
          backendPayload.end_time = convertLimaToUTC(`${dateStr}T${payload.end_time}`);
        } else {
          backendPayload.end_time = convertLimaToUTC(payload.end_time);
        }
        console.log('End time converted to:', backendPayload.end_time);
      } catch (error) {
        console.error('Error processing end_time:', error);
        return Promise.reject(new Error('Error en el formato de hora de fin'));
      }
    }
    
    // Ahora agregamos el resto de los campos
    if (payload.title !== undefined) backendPayload.title = payload.title;
    if (payload.capacity !== undefined) backendPayload.capacity = payload.capacity;
    if (payload.professional_id !== undefined) backendPayload.professional_id = payload.professional_id;
    if (payload.local_id !== undefined) backendPayload.local_id = payload.local_id;
    if (payload.session_link !== undefined) backendPayload.session_link = payload.session_link;
    if (payload.state !== undefined) backendPayload.state = payload.state;
    if (payload.community_service_id !== undefined) backendPayload.community_service_id = payload.community_service_id;

    console.log('Processed update payload:', backendPayload);

    // Verificar que tenemos los datos mínimos necesarios para actualizar
    if (Object.keys(backendPayload).length === 0) {
      console.error('No hay campos para actualizar');
      return Promise.reject(new Error('No hay campos para actualizar'));
    }

    try {
      // Primer intento con el payload procesado
      return await apiClient.patch<Session>(
        API_ENDPOINTS.SESSIONS.BY_ID(id),
        backendPayload,
      );
    } catch (error: any) {
      console.error('Error en updateSession:', error);
      
      // Si es un error de conflicto (409), intentamos una segunda estrategia
      if (error.message && error.message.includes('409')) {
        console.warn('Detectado error de conflicto 409. Intentando estrategia alternativa...');
        
        // Si el error es por conflicto, intentemos otra estrategia:
        // 1. Eliminamos las horas y solo actualizamos los otros campos
        const retryPayload = { ...backendPayload };
        delete retryPayload.date;
        delete retryPayload.start_time;
        delete retryPayload.end_time;
        
        // Si aún tenemos campos para actualizar
        if (Object.keys(retryPayload).length > 0) {
          console.log('Intentando actualizar solo campos no temporales:', retryPayload);
          try {
            return await apiClient.patch<Session>(
              API_ENDPOINTS.SESSIONS.BY_ID(id),
              retryPayload
            );
          } catch (retryError) {
            console.error('Error en el segundo intento de updateSession:', retryError);
            throw new Error('No se pudo actualizar la sesión después de múltiples intentos. Verifique que no haya conflictos de horario.');
          }
        } else {
          throw new Error('Se detectó un conflicto de horario con otra sesión existente. Por favor seleccione otra fecha u horario.');
        }
      }
      
      // Si no es error 409 o falla el segundo intento
      throw error;
    }
  },

  deleteSession: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.SESSIONS.BY_ID(id));
  },

  bulkCreateSessions: async (
    payload: BulkCreateSessionPayload,
  ): Promise<Session[]> => {
    const data = await apiClient.post<any>(
      `${API_ENDPOINTS.SESSIONS.BASE}bulk/`,
      payload,
    );
    return data.sessions || data;
  },

  bulkDeleteSessions: async (
    payload: BulkDeleteSessionPayload,
  ): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.SESSIONS.BULK_DELETE, payload);
  },

  checkConflicts: async (
    data: CheckConflictRequest,
  ): Promise<ConflictResult> => {
    // Convertir fechas de Lima (UTC-5) a UTC para el backend
    const payload = {
      date: convertLimaToUTC(`${data.date}T00:00:00`),
      start_time: convertLimaToUTC(`${data.date}T${data.startTime}:00`),
      end_time: convertLimaToUTC(`${data.date}T${data.endTime}:00`),
      professional_id: data.professionalId,
      local_id: data.localId || null,
      exclude_id: data.excludeId || null,
    };

    const result = await apiClient.post<any>(
      `${API_ENDPOINTS.SESSIONS.BASE}check-conflicts/`,
      payload,
    );

    return {
      hasConflict: result.has_conflict,
      professionalConflicts: result.professional_conflicts || [],
      localConflicts: result.local_conflicts || [],
    };
  },

  getAvailability: async (
    data: AvailabilityRequest,
  ): Promise<AvailabilityResult> => {
    // Convertir fecha de Lima (UTC-5) a UTC para el backend
    const payload = {
      date: convertLimaToUTC(`${data.date}T00:00:00`),
      professional_id: data.professionalId || null,
      local_id: data.localId || null,
    };

    const result = await apiClient.post<any>(
      `${API_ENDPOINTS.SESSIONS.BASE}availability/`,
      payload,
    );

    return {
      isAvailable: result.is_available,
      busySlots: result.busy_slots || [],
    };
  },
};
