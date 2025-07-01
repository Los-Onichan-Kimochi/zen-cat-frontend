import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Función auxiliar para obtener los headers comunes
const getHeaders = () => {
  const token = Cookies.get('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Función para mapear los datos del backend a nuestro tipo User
const mapBackendUserToUser = (backendUser: any): User => {
  console.log('Mapping backend user:', backendUser);

  // Mantener el rol original del backend

  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    rol: backendUser.rol || backendUser.role || 'CLIENT',
    password: backendUser.password || '',
    isAuthenticated: false,
    permissions: backendUser.permissions || [],
    avatar: backendUser.image_url,
    address: backendUser.address,
    district: backendUser.district,
    phone: backendUser.phone,
    // Mapear datos del onboarding usando snake_case
    onboarding: backendUser.onboarding
      ? {
          id: backendUser.onboarding.id,
          documentType: backendUser.onboarding.document_type,
          documentNumber: backendUser.onboarding.document_number,
          phoneNumber: backendUser.onboarding.phone_number,
          birthDate: backendUser.onboarding.birth_date,
          gender: backendUser.onboarding.gender,
          city: backendUser.onboarding.city,
          postalCode: backendUser.onboarding.postal_code,
          district: backendUser.onboarding.district,
          address: backendUser.onboarding.address,
          createdAt: backendUser.onboarding.created_at,
          updatedAt: backendUser.onboarding.updated_at,
        }
      : undefined,
  };
};

// Función para transformar el payload del frontend al formato del backend
const transformPayloadToBackend = (payload: CreateUserPayload): any => {
  console.log('Original payload:', payload);

  const backendPayload: any = {
    name: payload.name,
    email: payload.email,
    rol: payload.rol, // Backend usa "rol"
    password: payload.password,
    image_url: payload.avatar || '',
  };

  // Solo agregar campos de onboarding si están presentes
  if (payload.onboarding) {
    // Formatear la fecha de nacimiento al formato ISO si existe
    let formattedBirthDate = null;
    if (payload.onboarding.birthDate) {
      // Convertir fecha de formato YYYY-MM-DD a formato ISO completo
      const date = new Date(payload.onboarding.birthDate);
      formattedBirthDate = date.toISOString();
    }

    backendPayload.onboarding = {
      document_type: payload.onboarding.documentType,
      document_number: payload.onboarding.documentNumber,
      phone_number: payload.onboarding.phoneNumber,
      birth_date: formattedBirthDate,
      gender: payload.onboarding.gender,
      city: payload.onboarding.city,
      postal_code: payload.onboarding.postalCode,
      district: payload.onboarding.district,
      address: payload.onboarding.address,
    };
  }

  console.log('Transformed backend payload:', backendPayload);
  return backendPayload;
};

// Función para transformar el payload de actualización al formato del backend
const transformUpdatePayloadToBackend = (payload: UpdateUserPayload): any => {
  console.log('Original update payload:', payload);

  const backendPayload: any = {};

  if (payload.name) backendPayload.name = payload.name;
  if (payload.email) backendPayload.email = payload.email;
  if (payload.rol) backendPayload.rol = payload.rol;
  if (payload.password) backendPayload.password = payload.password;
  if (payload.avatar !== undefined) backendPayload.image_url = payload.avatar;

  // Solo agregar campos de onboarding si están presentes
  if (payload.onboarding) {
    // Formatear la fecha de nacimiento al formato ISO si existe
    let formattedBirthDate = null;
    if (payload.onboarding.birthDate) {
      // Convertir fecha de formato YYYY-MM-DD a formato ISO completo
      const date = new Date(payload.onboarding.birthDate);
      formattedBirthDate = date.toISOString();
    }

    backendPayload.onboarding = {
      document_type: payload.onboarding.documentType,
      document_number: payload.onboarding.documentNumber,
      phone_number: payload.onboarding.phoneNumber,
      birth_date: formattedBirthDate,
      gender: payload.onboarding.gender,
      city: payload.onboarding.city,
      postal_code: payload.onboarding.postalCode,
      district: payload.onboarding.district,
      address: payload.onboarding.address,
    };
  }

  console.log('Transformed backend update payload:', backendPayload);
  return backendPayload;
};

// Función para transformar el payload de onboarding al formato del backend
const transformOnboardingPayloadToBackend = (onboardingData: any): any => {
  console.log('Original onboarding payload:', onboardingData);

  const backendPayload: any = {};

  // Solo agregar campos que estén presentes (todos son opcionales en PATCH)
  if (onboardingData.documentType) {
    backendPayload.document_type = onboardingData.documentType;
  }
  if (onboardingData.documentNumber) {
    backendPayload.document_number = onboardingData.documentNumber;
  }
  if (onboardingData.phoneNumber) {
    backendPayload.phone_number = onboardingData.phoneNumber;
  }
  if (onboardingData.birthDate) {
    // Formatear la fecha de nacimiento al formato ISO si existe
    const date = new Date(onboardingData.birthDate);
    backendPayload.birth_date = date.toISOString();
  }
  if (onboardingData.gender) {
    backendPayload.gender = onboardingData.gender;
  }
  if (onboardingData.city) {
    backendPayload.city = onboardingData.city;
  }
  if (onboardingData.postalCode) {
    backendPayload.postal_code = onboardingData.postalCode;
  }
  if (onboardingData.district) {
    backendPayload.district = onboardingData.district;
  }
  if (onboardingData.address) {
    backendPayload.address = onboardingData.address;
  }

  console.log('Transformed onboarding backend payload:', backendPayload);
  return backendPayload;
};

export const usuariosApi = {
  getUsuarios: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error fetching usuarios: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Raw received data:', data);

      let rawUsers: any[] = [];

      // Intentar diferentes estructuras de respuesta
      if (data && Array.isArray(data.users)) {
        rawUsers = data.users;
      } else if (data && Array.isArray(data.usuarios)) {
        rawUsers = data.usuarios;
      } else if (Array.isArray(data)) {
        rawUsers = data;
      } else {
        console.error('Unexpected data structure from /user/ endpoint:', data);
        throw new Error('Unexpected data structure from usuarios API for list');
      }

      // Mapear cada usuario usando la función de mapeo
      const mappedUsers = rawUsers.map(mapBackendUserToUser);
      console.log('Mapped users with onboarding:', mappedUsers);

      return mappedUsers;
    } catch (error) {
      console.error('Error in getUsuarios:', error);
      throw error;
    }
  },

  getUsuarioById: async (id: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${id}/`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error fetching usuario with id ${id}: ${response.status} ${response.statusText}`,
        );
      }

      const rawUser = await response.json();
      console.log('Raw user data:', rawUser);

      // Mapear el usuario individual
      const mappedUser = mapBackendUserToUser(rawUser);
      console.log('Mapped single user:', mappedUser);

      return mappedUser;
    } catch (error) {
      console.error('Error in getUsuarioById:', error);
      throw error;
    }
  },

  createUsuario: async (payload: CreateUserPayload): Promise<User> => {
    try {
      const transformedPayload = transformPayloadToBackend(payload);

      const response = await fetch(`${API_BASE_URL}/user/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(transformedPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error creating usuario: ${response.status} ${response.statusText}`,
        );
      }

      const rawUser = await response.json();
      console.log('Raw created user data:', rawUser);

      // Mapear el usuario creado
      const mappedUser = mapBackendUserToUser(rawUser);
      console.log('Mapped created user:', mappedUser);

      return mappedUser;
    } catch (error) {
      console.error('Error in createUsuario:', error);
      throw error;
    }
  },

  updateUsuario: async (
    id: string,
    payload: UpdateUserPayload,
  ): Promise<User> => {
    try {
      const transformedPayload = transformUpdatePayloadToBackend(payload);

      const response = await fetch(`${API_BASE_URL}/user/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(transformedPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error updating usuario with id ${id}: ${response.status} ${response.statusText}`,
        );
      }

      const rawUser = await response.json();
      console.log('Raw updated user data:', rawUser);

      // Mapear el usuario actualizado
      const mappedUser = mapBackendUserToUser(rawUser);
      console.log('Mapped updated user:', mappedUser);

      return mappedUser;
    } catch (error) {
      console.error('Error in updateUsuario:', error);
      throw error;
    }
  },

  updateOnboardingByUserId: async (
    userId: string,
    onboardingData: any,
  ): Promise<any> => {
    try {
      const transformedPayload =
        transformOnboardingPayloadToBackend(onboardingData);

      const response = await fetch(
        `${API_BASE_URL}/onboarding/user/${userId}/`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(transformedPayload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error updating onboarding for user ${userId}: ${response.status} ${response.statusText}`,
        );
      }

      const updatedOnboarding = await response.json();
      console.log('Raw updated onboarding data:', updatedOnboarding);

      return updatedOnboarding;
    } catch (error) {
      console.error('Error in updateOnboardingByUserId:', error);
      throw error;
    }
  },

  createOnboardingByUserId: async (
    userId: string,
    onboardingData: any,
  ): Promise<any> => {
    try {
      const transformedPayload =
        transformOnboardingPayloadToBackend(onboardingData);

      const response = await fetch(
        `${API_BASE_URL}/onboarding/user/${userId}/`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(transformedPayload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error creating onboarding for user ${userId}: ${response.status} ${response.statusText}`,
        );
      }

      const createdOnboarding = await response.json();
      console.log('Raw created onboarding data:', createdOnboarding);

      return createdOnboarding;
    } catch (error) {
      console.error('Error in createOnboardingByUserId:', error);
      throw error;
    }
  },

  deleteUsuario: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error deleting usuario with id ${id}: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Error in deleteUsuario:', error);
      throw error;
    }
  },

  bulkDeleteUsuarios: async (ids: string[]): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/bulk-delete/`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ users: ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(
          `Error bulk deleting usuarios: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Error in bulkDeleteUsuarios:', error);
      throw error;
    }
  },
//carga masiva
  bulkCreateUsuarios: async (payload: { users: CreateUserPayload[] }): Promise<void> => {
    try {
      const transformedUsers = payload.users.map(transformPayloadToBackend);

      const response = await fetch(`${API_BASE_URL}/user/bulk-create/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ users: transformedUsers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Error creando usuarios en masa: ${response.status} ${response.statusText}`
        );
      }

      console.log('Usuarios cargados exitosamente');
    } catch (error) {
      console.error('Error en bulkCreateUsuarios:', error);
      throw error;
    }
  }

};
