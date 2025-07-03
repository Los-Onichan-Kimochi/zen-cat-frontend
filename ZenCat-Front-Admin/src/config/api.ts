// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8098',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/login/',
    REGISTER: '/register/',
    REFRESH: '/auth/refresh/',
    LOGOUT: '/auth/logout/',
    ME: '/me/',
  },

  // Community endpoints
  COMMUNITIES: {
    BASE: '/community/',
    BULK_CREATE: '/community/bulk-create/',
    BULK_DELETE: '/community/bulk-delete/',
    BY_ID: (id: string) => `/community/${id}/`,
  },

  // User endpoints
  USERS: {
    BASE: '/user/',
    BY_ID: (id: string) => `/user/${id}/`,
    BULK_DELETE: '/user/bulk-delete/',
  },

  // Professional endpoints
  PROFESSIONALS: {
    BASE: '/professional/',
    BY_ID: (id: string) => `/professional/${id}/`,
    BULK_CREATE: '/professional/bulk-create/',
    BULK_DELETE: '/professional/bulk-delete/',
  },

  // Session endpoints
  SESSIONS: {
    BASE: '/session/',
    BY_ID: (id: string) => `/session/${id}/`,
    BULK_DELETE: '/session/bulk-delete/',
  },

  // Service endpoints
  SERVICES: {
    BASE: '/service/',
    BY_ID: (id: string) => `/service/${id}/`,
    BULK_DELETE: '/service/bulk-delete/',
  },

  // Local endpoints
  LOCALS: {
    BASE: '/local/',
    BY_ID: (id: string) => `/local/${id}/`,
    BULK_CREATE: '/local/bulk-create/',
    BULK_DELETE: '/local/bulk-delete/',
  },

  // Plan endpoints
  PLANS: {
    BASE: '/plan/',
    BY_ID: (id: string) => `/plan/${id}/`,
    BULK_CREATE: '/plan/bulk-create/',
    BULK_DELETE: '/plan/bulk-delete/',
  },

  // Reservation endpoints
  RESERVATIONS: {
    BASE: '/reservation/',
    BY_ID: (id: string) => `/reservation/${id}/`,
    BULK_DELETE: '/reservation/bulk-delete/',
  },

  // Service-Professional association endpoints
  SERVICE_PROFESSIONALS: {
    BASE: '/service-professional/',
    BULK: '/service-professional/bulk/',
    BY_IDS: (serviceId: string, professionalId: string) =>
      `/service-professional/${serviceId}/${professionalId}/`,
  },

  // Service-Local association endpoints
  SERVICE_LOCALS: {
    BASE: '/service-local/',
    BULK: '/service-local/bulk/',
    BY_IDS: (serviceId: string, localId: string) =>
      `/service-local/${serviceId}/${localId}/`,
  },

  // Community-Service association endpoints
  COMMUNITY_SERVICES: {
    BASE: '/community-service/',
    BULK_CREATE: '/community-service/bulk-create/',
    BULK_DELETE: '/community-service/bulk-delete/',
    BY_COMMUNITY_ID: (communityId: string) => `/community-service/${communityId}/`,
    BY_IDS: (communityId: string, serviceId: string) =>
      `/community-service/${communityId}/${serviceId}/`,
  },

  // Community-Plan association endpoints
  COMMUNITY_PLANS: {
    BASE: '/community-plan/',
    BULK_CREATE: '/community-plan/bulk-create/',
    BULK_DELETE: '/community-plan/bulk-delete/',
    BY_IDS: (communityId: string, planId: string) =>
      `/community-plan/${communityId}/${planId}/`,
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
