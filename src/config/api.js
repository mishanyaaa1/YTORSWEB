// Конфигурация API
export const API_BASE_URL = '';

// Функция для создания полного URL API
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Конфигурация для fetch запросов
export const fetchConfig = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};
