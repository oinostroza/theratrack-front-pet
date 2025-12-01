export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  USERS: '/users',
  USERS_WITH_PASSWORDS: '/users/with-passwords',
  PATIENTS: '/patients',
  SESSIONS: '/sessions',
  PETS: '/pets',
  CARE_SESSIONS: '/care-sessions',
  SESSION_REPORTS: '/session-reports',
  LOCATIONS: '/locations',
  PHOTOS: '/photos',
  GPS_ROUTES: '/gps-routes',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

