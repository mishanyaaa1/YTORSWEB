/* eslint-disable */
// Начальные данные для инициализации БД (CommonJS)

const categoryStructure = {
  'Двигатель': ['Основные узлы', 'Фильтры', 'Масла и жидкости', 'Система охлаждения'],
  'Трансмиссия': ['Коробка передач', 'Приводы', 'Сцепление', 'Дифференциал'],
  'Ходовая часть': ['Гусеницы', 'Подвеска', 'Колеса', 'Тормозная система'],
  'Электрика': ['Освещение', 'Проводка', 'Аккумуляторы', 'Стартеры и генераторы'],
  'Кабина': ['Сиденья', 'Приборы', 'Отопление', 'Стекла']
};

const initialProducts = [
  {
    id: 1,
    title: 'Двигатель 2.0L дизельный',
    price: 180000,
    category: 'Двигатель',
    subcategory: 'Основные узлы',
    brand: 'ТехноМотор',
    available: true,
    quantity: 3,
    images: [{ id: 1, data: '⚙️', isMain: true }],
    description: 'Дизельный двигатель мощностью 75 л.с.',

    features: [
      'Высокая надежность',
      'Экономичный расход топлива',
      'Простое обслуживание',
      'Совместим с большинством вездеходов'
    ]
  },
  {
    id: 2,
    title: 'Блок цилиндров',
    price: 85000,
    category: 'Двигатель',
    subcategory: 'Основные узлы',
    brand: 'ТехноМотор',
    available: true,
    quantity: 5,
    images: [{ id: 1, data: '🔩', isMain: true }],
    description: 'Блок цилиндров для двигателя 2.0L'
  },
  {
    id: 3,
    title: 'Фильтр воздушный',
    price: 3500,
    category: 'Двигатель',
    subcategory: 'Фильтры',
    brand: 'ТехноМотор',
    available: true,
    quantity: 12,
    icon: '🌀',
    description: 'Воздушный фильтр высокой очистки'
  },
  {
    id: 4,
    title: 'Фильтр топливный',
    price: 2800,
    category: 'Двигатель',
    subcategory: 'Фильтры',
    brand: 'FilterPro',
    available: true,
    quantity: 8,
    icon: '⛽',
    description: 'Топливный фильтр тонкой очистки'
  },
  {
    id: 5,
    title: 'Фильтр масляный',
    price: 1200,
    category: 'Двигатель',
    subcategory: 'Фильтры',
    brand: 'FilterPro',
    available: true,
    quantity: 15,
    icon: '🛢️',
    description: 'Масляный фильтр с байпасным клапаном'
  },
  {
    id: 6,
    title: 'Масло моторное 10W-40',
    price: 2500,
    category: 'Двигатель',
    subcategory: 'Масла и жидкости',
    brand: 'LubeMax',
    available: true,
    quantity: 25,
    icon: '🛢️',
    description: 'Полусинтетическое моторное масло 5L'
  },
  {
    id: 7,
    title: 'Антифриз -40°C',
    price: 1800,
    category: 'Двигатель',
    subcategory: 'Система охлаждения',
    brand: 'CoolMax',
    available: true,
    quantity: 18,
    icon: '❄️',
    description: 'Антифриз готовый к применению 5L'
  },
  {
    id: 8,
    title: 'Коробка передач механическая',
    price: 95000,
    category: 'Трансмиссия',
    subcategory: 'Коробка передач',
    brand: 'Вездеход-Мастер',
    available: false,
    quantity: 0,
    icon: '🔧',
    description: '5-ступенчатая механическая КПП'
  },
  {
    id: 9,
    title: 'Ремень приводной',
    price: 2200,
    category: 'Трансмиссия',
    subcategory: 'Приводы',
    brand: 'DrivePro',
    available: true,
    quantity: 6,
    icon: '⛓️',
    description: 'Приводной ремень усиленный'
  },
  {
    id: 10,
    title: 'Диск сцепления',
    price: 8500,
    category: 'Трансмиссия',
    subcategory: 'Сцепление',
    brand: 'ClutchMax',
    available: true,
    quantity: 4,
    icon: '⚙️',
    description: 'Ведомый диск сцепления 240мм'
  },
  {
    id: 11,
    title: 'Гусеницы для вездехода',
    price: 45000,
    category: 'Ходовая часть',
    subcategory: 'Гусеницы',
    brand: 'Вездеход-Мастер',
    available: true,
    quantity: 2,
    images: [{ id: 1, data: '🔗', isMain: true }],
    description: 'Высококачественные резинометаллические гусеницы для вездеходов различных марок.',

    features: [
      'Высокая износостойкость',
      'Отличное сцепление на снегу и грязи',
      'Простая установка',
      'Совместимость с большинством вездеходов'
    ]
  },
  {
    id: 12,
    title: 'Амортизатор передний',
    price: 12000,
    category: 'Ходовая часть',
    subcategory: 'Подвеска',
    brand: 'СуперТрек',
    available: true,
    quantity: 7,
    icon: '🛠️',
    description: 'Газомасляный амортизатор'
  },
  {
    id: 13,
    title: 'Колесо опорное',
    price: 8500,
    category: 'Ходовая часть',
    subcategory: 'Колеса',
    brand: 'WheelTech',
    available: true,
    quantity: 10,
    icon: '⚙️',
    description: 'Опорное колесо с подшипником'
  },
  {
    id: 14,
    title: 'Фара LED рабочая',
    price: 5500,
    category: 'Электрика',
    subcategory: 'Освещение',
    brand: 'LightMax',
    available: true,
    quantity: 14,
    icon: '💡',
    description: 'LED фара 48W с широким лучом'
  },
  {
    id: 15,
    title: 'Аккумулятор 12V 100Ah',
    price: 15000,
    category: 'Электрика',
    subcategory: 'Аккумуляторы',
    brand: 'PowerMax',
    available: true,
    quantity: 6,
    icon: '🔋',
    description: 'Гелевый аккумулятор повышенной емкости'
  },
  {
    id: 16,
    title: 'Проводка основная',
    price: 3500,
    category: 'Электрика',
    subcategory: 'Проводка',
    brand: 'WirePro',
    available: true,
    quantity: 9,
    icon: '🔌',
    description: 'Жгут проводов основной системы'
  },
  {
    id: 17,
    title: 'Сиденье водителя',
    price: 25000,
    category: 'Кабина',
    subcategory: 'Сиденья',
    brand: 'ComfortSeat',
    available: true,
    quantity: 3,
    icon: '🪑',
    description: 'Эргономичное сиденье с подогревом'
  },
  {
    id: 18,
    title: 'Панель приборов',
    price: 18000,
    category: 'Кабина',
    subcategory: 'Приборы',
    brand: 'InstrumentPro',
    available: true,
    quantity: 5,
    icon: '📊',
    description: 'Цифровая панель приборов'
  }
];

const initialBrands = [
  'Вездеход-Мастер', 'ТехноМотор', 'СуперТрек', 'DrivePro', 'FilterPro', 'LubeMax',
  'CoolMax', 'ClutchMax', 'WheelTech', 'LightMax', 'PowerMax', 'WirePro',
  'ComfortSeat', 'InstrumentPro'
];

const initialPromotions = [
  {
    id: 1,
    title: 'Скидка на двигатели',
    description: 'Скидка 15% на все двигатели и запчасти к ним',
    discount: 15,
    category: 'Двигатель',
    validUntil: '2024-02-28',
    active: true,
    featured: true,
    minPurchase: 20000
  },
  {
    id: 2,
    title: 'Комплект фильтров',
    description: 'При покупке 3 фильтров - 4-й в подарок',
    discount: 25,
    category: 'Двигатель',
    validUntil: '2024-03-15',
    active: true,
    featured: true,
    minPurchase: 15000
  },
  {
    id: 3,
    title: 'Мега скидка на электрику!',
    description: 'Скидка 20% на все электрические компоненты и освещение',
    discount: 20,
    category: 'Электрика',
    validUntil: '2024-04-01',
    active: true,
    featured: true,
    minPurchase: 10000
  },
  {
    id: 4,
    title: 'Специальная цена на гусеницы',
    description: 'Только в этом месяце - специальная цена на все виды гусениц',
    discount: 12,
    category: 'Ходовая часть',
    validUntil: '2024-03-25',
    active: true,
    featured: false,
    minPurchase: 20000
  }
];

module.exports = {
  categoryStructure,
  initialProducts,
  initialBrands,
  initialPromotions
};


