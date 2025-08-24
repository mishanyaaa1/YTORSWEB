// Утилиты для работы с изображениями товаров

// Миграция старых данных: icon -> images
export const migrateProductImages = (product) => {
  // Если у товара уже есть images, возвращаем как есть
  if (product.images && Array.isArray(product.images)) {
    return product;
  }
  
  // Если есть только icon, создаем массив images
  if (product.icon) {
    return {
      ...product,
      images: [
        {
          id: 1,
          data: product.icon,
          isMain: true
        }
      ]
    };
  }
  
  // Если нет ни images, ни icon, создаем пустой массив
  return {
    ...product,
    images: []
  };
};

// Получить основное изображение товара
export const getMainImage = (product) => {
  const migratedProduct = migrateProductImages(product);
  const mainImage = migratedProduct.images.find(img => img.isMain);
  return mainImage || null;
};

// Получить все изображения товара
export const getAllImages = (product) => {
  const migratedProduct = migrateProductImages(product);
  return migratedProduct.images || [];
};

// Проверить, является ли изображение Base64
export const isBase64Image = (data) => {
  return typeof data === 'string' && data.startsWith('data:image');
};

// Проверить, является ли строка URL изображения (локальные /uploads или http)
// Нормализация путей изображений (учёт Windows-слэшей и отсутствующего ведущего слэша)
const normalizeImagePath = (data) => {
  if (typeof data !== 'string') return data;
  let s = data.trim();
  // Преобразуем обратные слэши в прямые
  s = s.replace(/\\/g, '/');
  // Если путь указывает на uploads без ведущего слэша — добавим его
  if (s.startsWith('uploads/')) s = '/' + s;
  // Удалим возможные дубли слэшей
  s = s.replace(/\/\/+/, '/');
  return s;
};

export const isImageUrl = (data) => {
  if (typeof data !== 'string') return false;
  
  // Простая проверка на HTTP/HTTPS URL
  if (/^https?:\/\//i.test(data)) {
    return true;
  }
  
  // Проверка на локальные uploads
  if (data.startsWith('/uploads/')) {
    return true;
  }
  
  return false;
};

// Вернуть нормализованный src, если это URL изображения, иначе null
export const resolveImageSrc = (data) => {
  if (typeof data !== 'string') return null;
  
  // Простая проверка на HTTP/HTTPS URL
  if (/^https?:\/\//i.test(data)) {
    return data;
  }
  
  // Проверка на локальные uploads
  if (data.startsWith('/uploads/')) {
    return data;
  }
  
  return null;
};

// Получить отображаемое изображение (возвращает объект с типом и данными)
export const getDisplayImageInfo = (imageData) => {
  const resolved = resolveImageSrc(imageData);
  if (isBase64Image(imageData) || resolved) {
    return { type: 'image', data: resolved || imageData };
  }
  // Возвращаем специальный маркер для логотипа бренда как fallback
  return { type: 'brand', data: null };
};
