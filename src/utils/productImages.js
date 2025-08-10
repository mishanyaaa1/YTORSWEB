// Реальные изображения товаров для вездеходов
export const productImages = {
  // Двигатели
  1: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400', // Двигатель 2.0L дизельный
  2: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', // Поршень двигателя
  3: 'https://images.unsplash.com/photo-1601134991665-a020399422dd?w=400', // Воздушный фильтр
  4: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', // Масляный фильтр
  5: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400', // Радиатор охлаждения
  
  // Трансмиссия  
  6: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', // КПП механическая
  7: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400', // Привод передний
  8: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', // КПП механическая
  9: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=400', // Диск сцепления
  10: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400', // Дифференциал

  // Ходовая часть
  11: 'https://images.unsplash.com/photo-1565473049374-2baeb3f2f00b?w=400', // Гусеницы
  12: 'https://images.unsplash.com/photo-1523883289821-c57c7a77fbfb?w=400', // Амортизатор передний
  13: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', // Колесо опорное
  14: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400', // Тормозные колодки

  // Электрика
  15: 'https://images.unsplash.com/photo-1609086573011-de5a6eb3e0c8?w=400', // Аккумулятор 12V
  16: 'https://images.unsplash.com/photo-1594736797933-d0ca6eea3e47?w=400', // Фара головного света
  17: 'https://images.unsplash.com/photo-1631409867921-1204e503c2a4?w=400', // Жгут проводов
  18: 'https://images.unsplash.com/photo-1609086573011-de5a6eb3e0c8?w=400', // Стартер

  // Кабина
  19: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', // Сиденье водителя
  20: 'https://images.unsplash.com/photo-1609086573011-de5a6eb3e0c8?w=400', // Панель приборов
  21: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', // Отопитель кабины
  22: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', // Стекло лобовое

  // Дополнительно для недостающих товаров
  23: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400',
  24: 'https://images.unsplash.com/photo-1565473049374-2baeb3f2f00b?w=400',
  25: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  26: 'https://images.unsplash.com/photo-1523883289821-c57c7a77fbfb?w=400',
  27: 'https://images.unsplash.com/photo-1601134991665-a020399422dd?w=400',
  28: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  29: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400',
  30: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400'
};

// Функция для получения изображения товара
export const getProductImage = (productId) => {
  return productImages[productId] || 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400';
};
