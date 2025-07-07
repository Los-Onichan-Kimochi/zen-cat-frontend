export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8098',
  TIMEOUT: 30000,
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
    GOOGLE_LOGIN: '/login/google/',
  },

  // Community endpoints (now public)
  COMMUNITIES: {
    BASE: '/community/',
    BULK_CREATE: '/community/bulk-create/',
    BULK_DELETE: '/community/bulk-delete/',
    BY_ID: (id: string) => `/community/${id}/`,
    BY_ID_WITH_IMAGE: (id: string) => `/community/${id}/image/`,
  },

  // Community Services endpoints (now public)
  COMMUNITY_SERVICES: {
    BASE: '/community-service/',
    BY_COMMUNITY_ID: (communityId: string) =>
      `/community-service/${communityId}/`,
    BY_ID: (id: string) => `/community-service/id/${id}/`,
  },

  // User endpoints
  USERS: {
    BASE: '/user/',
    BY_ID: (id: string) => `/user/${id}/`,
    BY_ID_WITH_IMAGE: (id: string) => `/user/${id}/image/`,
    BULK_DELETE: '/user/bulk-delete/',
    ONBOARDING: (userId: string) => `/user/${userId}/onboarding/`,
  },

  // Professional endpoints (now public)
  PROFESSIONALS: {
    BASE: '/professional/',
    BY_ID: (id: string) => `/professional/${id}/`,
    BY_ID_WITH_IMAGE: (id: string) => `/professional/${id}/image/`,
    BULK_DELETE: '/professional/bulk-delete/',
  },

  // Session endpoints (now public)
  SESSIONS: {
    BASE: '/session/',
    BY_ID: (id: string) => `/session/${id}/`,
    BULK_DELETE: '/session/bulk-delete/',
  },

  // Service endpoints (now public)
  SERVICES: {
    BASE: '/service/',
    BY_ID: (id: string) => `/service/${id}/`,
    BY_ID_WITH_IMAGE: (id: string) => `/service/${id}/image/`,
    BULK_DELETE: '/service/bulk-delete/',
  },

  // Local endpoints (now public)
  LOCALS: {
    BASE: '/local/',
    BY_ID: (id: string) => `/local/${id}/`,
    BY_ID_WITH_IMAGE: (id: string) => `/local/${id}/image/`,
    BULK_CREATE: '/local/bulk-create/',
    BULK_DELETE: '/local/bulk-delete/',
  },

  // Plan endpoints (now public)
  PLANS: {
    BASE: '/plan/',
    BY_ID: (id: string) => `/plan/${id}/`,
    BULK_CREATE: '/plan/bulk-create/',
    BULK_DELETE: '/plan/bulk-delete/',
  },

  // Reservation endpoints (client only)
  RESERVATIONS: {
    BASE: '/reservation/',
    BY_ID: (id: string) => `/reservation/${id}/`,
    BY_COMMUNITY_AND_USER: (communityId: string, userId: string) =>
      `/reservation/${communityId}/${userId}/`,
    BULK_DELETE: '/reservation/bulk-delete/',
  },

  // Contact endpoint
  CONTACT: {
    SEND: '/contact',
  },

  // Onboarding endpoints (client only)
  ONBOARDING: {
    BASE: '/onboarding/',
    BY_ID: (id: string) => `/onboarding/${id}/`,
    GET_BY_USER: (userId: string) => `/onboarding/user/${userId}/`,
    CREATE_FOR_USER: (userId: string) => `/onboarding/user/${userId}/`,
    UPDATE_FOR_USER: (userId: string) => `/onboarding/user/${userId}/`,
    DELETE_FOR_USER: (userId: string) => `/onboarding/user/${userId}/`,
  },

  // Community Plans endpoints (now public)
  COMMUNITY_PLANS: {
    BASE: '/community-plan/',
    BY_COMMUNITY_ID: (communityId: string) =>
      `/community-plan/?communityId=${communityId}`,
    BY_ID: (communityId: string, planId: string) =>
      `/community-plan/${communityId}/${planId}/`,
  },

  // Membership endpoints (client only)
  MEMBERSHIPS: {
    BASE: '/membership/',
    BY_ID: (id: string) => `/membership/${id}/`,
    BY_USER: (userId: string) => `/membership/user/${userId}/`,
    BY_COMMUNITY: (communityId: string) =>
      `/membership/community/${communityId}/`,
    BY_USER_AND_COMMUNITY: (userId: string, communityId: string) =>
      `/membership/user/${userId}/community/${communityId}`,
    CREATE_FOR_USER: (userId: string) => `/membership/user/${userId}/`,
    USERS_BY_COMMUNITY: (communityId: string) =>
      `/membership/community/${communityId}/users`,
  },

  // Service Local endpoints (now public)
  SERVICE_LOCALS: {
    BASE: '/service-local/',
    BY_SERVICE_AND_LOCAL: (serviceId: string, localId: string) =>
      `/service-local/${serviceId}/${localId}/`,
  },

  // Service Professional endpoints (now public)
  SERVICE_PROFESSIONALS: {
    BASE: '/service-professional/',
    BY_SERVICE_AND_PROFESSIONAL: (serviceId: string, professionalId: string) =>
      `/service-professional/${serviceId}/${professionalId}/`,
  },
} as const;
