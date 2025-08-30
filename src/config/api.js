// Конфигурация API
export const API_CONFIG = {
  BASE_URL: 'https://ytorsweb-backend.onrender.com',
  ENDPOINTS: {
    ADMIN_LOGIN: '/api/admin/login',
    ADMIN_LOGOUT: '/api/admin/logout',
    ADMIN_ME: '/api/admin/me',
    ADMIN_BOT: '/api/admin/bot',
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    BRANDS: '/api/brands',
    PROMOTIONS: '/api/promotions',
    PROMOCODES: '/api/promocodes',
    TERRAIN_TYPES: '/api/terrain-types',
    VEHICLE_TYPES: '/api/vehicle-types',
    UPLOAD_IMAGE: '/api/upload/image',
    ORDERS: '/api/orders',
  }
};

export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
