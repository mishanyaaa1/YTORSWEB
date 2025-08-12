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
export const isImageUrl = (data) => {
  return (
    typeof data === 'string' && (
      data.startsWith('/uploads/') ||
      data.startsWith('http://') ||
      data.startsWith('https://')
    )
  );
};

// Получить отображаемое изображение (возвращает объект с типом и данными)
export const getDisplayImageInfo = (imageData) => {
  if (isBase64Image(imageData) || isImageUrl(imageData)) {
    return { type: 'image', data: imageData };
  }
  // Возвращаем специальный маркер для логотипа бренда как fallback
  return { type: 'brand', data: null };
};
