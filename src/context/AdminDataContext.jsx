import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  categoryStructure, 
  initialProducts, 
  initialBrands, 
  initialPromotions, 
  initialAboutContent,
  initialVehicles
} from '../data/initialData.js';
import { migrateProductImages } from '../utils/imageHelpers';

const AdminDataContext = createContext();

// Нормализуем любые форматы категорий к виду { [name]: string[] }
function normalizeCategories(rawCategories) {
  try {
    if (!rawCategories) return {};
    // Если уже объект вида { name: [subs] }
    if (!Array.isArray(rawCategories) && typeof rawCategories === 'object') {
      // Убедимся, что значения — массивы строк
      const result = {};
      Object.entries(rawCategories).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          result[key] = value.map(String);
        } else if (value && typeof value === 'object' && Array.isArray(value.subcategories)) {
          result[key] = value.subcategories.map(String);
        } else {
          result[key] = [];
        }
      });
      return result;
    }
    // Если массив: поддержим форматы [{ name, subcategories }] или [name]
    if (Array.isArray(rawCategories)) {
      const entries = rawCategories.map((item) => {
        if (item && typeof item === 'object') {
          const name = String(item.name ?? '');
          const subs = Array.isArray(item.subcategories) ? item.subcategories.map(String) : [];
          return [name, subs];
        }
        return [String(item), []];
      }).filter(([name]) => name);
      return Object.fromEntries(entries);
    }
  } catch (e) {
    // В случае ошибки вернём пустую структуру, чтобы не ломать UI
    return {};
  }
  return {};
}

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
};

export const AdminDataProvider = ({ children }) => {
  // Состояние данных
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('adminProducts');
    let productsData = saved ? JSON.parse(saved) : initialProducts;
    
    // Автоматически мигрируем products при первой загрузке
    productsData = productsData.map(product => migrateProductImages(product));
    
    return productsData;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('adminCategories');
    const initial = saved ? JSON.parse(saved) : categoryStructure;
    return normalizeCategories(initial);
  });

  // Гарантируем, что в localStorage хранится нормализованный формат категорий
  useEffect(() => {
    try {
      localStorage.setItem('adminCategories', JSON.stringify(categories));
    } catch (e) {
      // ignore storage errors
    }
  }, [categories]);

  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('adminBrands');
    return saved ? JSON.parse(saved) : initialBrands;
  });

  const [promotions, setPromotions] = useState(() => {
    const saved = localStorage.getItem('adminPromotions');
    // По умолчанию пустой список — никаких демо-акций
    return saved ? JSON.parse(saved) : [];
  });

  const [promocodes, setPromocodes] = useState(() => {
    const saved = localStorage.getItem('adminPromocodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('adminVehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  // Типы местности и вездеходов
  const [terrainTypes, setTerrainTypes] = useState(() => {
    const saved = localStorage.getItem('adminTerrainTypes');
    return saved ? JSON.parse(saved) : ['Снег', 'Болото', 'Вода', 'Горы', 'Лес', 'Пустыня'];
  });

  const [vehicleTypes, setVehicleTypes] = useState(() => {
    const saved = localStorage.getItem('adminVehicleTypes');
    return saved ? JSON.parse(saved) : ['Гусеничный', 'Колесный', 'Плавающий'];
  });

  const [aboutContent, setAboutContent] = useState(() => {
    const saved = localStorage.getItem('adminAboutContent');
    if (saved) {
      try {
        const parsedContent = JSON.parse(saved);

        // Миграция deliveryAndPayment: аккуратно объединяем методы доставки по заголовку
        const initialDAP = initialAboutContent.deliveryAndPayment || {};
        const savedDAP = parsedContent.deliveryAndPayment || {};
        const initialMethods = Array.isArray(initialDAP.deliveryMethods) ? initialDAP.deliveryMethods : [];
        const savedMethods = Array.isArray(savedDAP.deliveryMethods) ? savedDAP.deliveryMethods : [];
        const mergedMethods = [
          ...initialMethods.map(initialMethod => {
            const savedMatch = savedMethods.find(m => m && m.title === initialMethod.title);
            if (!savedMatch) return initialMethod;
            return {
              ...initialMethod,
              ...savedMatch,
              // Учитываем намеренно пустую строку ("скрыть описание")
              description: (savedMatch.description !== undefined) ? savedMatch.description : initialMethod.description,
              // Если массив задан (включая пустой), используем его; иначе — дефолт
              items: Array.isArray(savedMatch.items) ? savedMatch.items : initialMethod.items
            };
          }),
          // Добавляем любые новые методы, которых не было раньше
          ...savedMethods.filter(m => m && !initialMethods.some(im => im.title === m.title))
        ];

        const mergedDeliveryAndPayment = {
          ...initialDAP,
          ...savedDAP,
          deliveryMethods: mergedMethods
        };

        // Мигрируем данные для обеспечения совместимости
        const migratedContent = {
          ...initialAboutContent,
          ...parsedContent,
          homeHero: {
            ...initialAboutContent.homeHero,
            ...(parsedContent.homeHero || {}),
            heroEffect: (parsedContent?.homeHero?.heroEffect) || initialAboutContent.homeHero.heroEffect || 'particles',
            // миграция одиночной кнопки в массив
            visualButtons: Array.isArray(parsedContent?.homeHero?.visualButtons)
              ? parsedContent.homeHero.visualButtons
              : (parsedContent?.homeHero?.visualButtonText
                  ? [{ text: parsedContent.homeHero.visualButtonText, link: parsedContent.homeHero.visualButtonLink || '/catalog' }]
                  : (initialAboutContent.homeHero.visualButtons || []))
          },
          // Обновлённая секция доставки и оплаты
          deliveryAndPayment: mergedDeliveryAndPayment,
          // Миграция ссылки в футере на новую секцию доставки
          footer: {
            ...initialAboutContent.footer,
            ...(parsedContent.footer || {}),
            informationSection: {
              ...initialAboutContent.footer.informationSection,
              ...((parsedContent.footer && parsedContent.footer.informationSection) || {}),
              links: ((parsedContent.footer && parsedContent.footer.informationSection && parsedContent.footer.informationSection.links) || [])
                .map(l => (l && l.text && l.text.toLowerCase().includes('доставка') ? { ...l, url: '/about#delivery' } : l))
            }
          },
          team: parsedContent.team || initialAboutContent.team,
          history: {
            ...initialAboutContent.history,
            ...(parsedContent.history || {})
          },

        };
        console.log('AdminDataContext: Loaded and migrated about content:', migratedContent);
        return migratedContent;
      } catch (error) {
        console.error('AdminDataContext: Error parsing saved about content:', error);
        return initialAboutContent;
      }
    }
    console.log('AdminDataContext: Using initial about content');
    return initialAboutContent;
  });

  // Настройки фильтров каталога
  const [filterSettings, setFilterSettings] = useState(() => {
    const saved = localStorage.getItem('adminFilterSettings');
    return saved ? JSON.parse(saved) : {
      showBrandFilter: true, // По умолчанию фильтр производителя включен
      showCategoryFilter: true,
      showSubcategoryFilter: true,
      showPriceFilter: true,
      showStockFilter: true
    };
  });

  // Сохраняем настройки фильтров в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adminFilterSettings', JSON.stringify(filterSettings));
    } catch (e) {
      // ignore storage errors
    }
  }, [filterSettings]);

  // Сохраняем вездеходы в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adminVehicles', JSON.stringify(vehicles));
    } catch (e) {
      // ignore storage errors
    }
  }, [vehicles]);

  // Сохраняем типы местности в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adminTerrainTypes', JSON.stringify(terrainTypes));
    } catch (e) {
      // ignore storage errors
    }
  }, [terrainTypes]);

  // Сохраняем типы вездеходов в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adminVehicleTypes', JSON.stringify(vehicleTypes));
    } catch (e) {
      // ignore storage errors
    }
  }, [vehicleTypes]);

  // Сохраняем промокоды в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adminPromocodes', JSON.stringify(promocodes));
    } catch (e) {
      // ignore storage errors
    }
  }, [promocodes]);

  const [popularProductIds, setPopularProductIds] = useState(() => {
    const saved = localStorage.getItem('adminPopularProducts');
    return saved ? JSON.parse(saved) : [11, 1, 8, 2]; // ID популярных товаров по умолчанию
  });

  // Первичная загрузка из API (fallback на локальные данные)
  useEffect(() => {
    const bootstrapFromApi = async () => {
      try {
        console.log('AdminDataContext: Starting API bootstrap...');
        const [apiProductsRes, apiCategoriesRes, apiBrandsRes, apiPromosRes, apiTerrainTypesRes, apiVehicleTypesRes] = await Promise.allSettled([
          fetch('/api/products', { credentials: 'include' }),
          fetch('/api/categories', { credentials: 'include' }),
          fetch('/api/brands', { credentials: 'include' }),
          fetch('/api/promotions', { credentials: 'include' }),
          fetch('/api/terrain-types', { credentials: 'include' }),
          fetch('/api/vehicle-types', { credentials: 'include' })
        ]);

        if (apiProductsRes.status === 'fulfilled' && apiProductsRes.value.ok) {
          const apiProducts = await apiProductsRes.value.json();
          const normalized = Array.isArray(apiProducts)
            ? apiProducts.map(p => migrateProductImages(p)).sort((a, b) => (a.id || 0) - (b.id || 0))
            : [];
          console.log('AdminDataContext: Loaded', normalized.length, 'products from API');
          setProducts(normalized);
          localStorage.setItem('adminProducts', JSON.stringify(normalized));
        } else {
          console.warn('AdminDataContext: Failed to load products from API:', apiProductsRes.status);
        }

        if (apiCategoriesRes.status === 'fulfilled' && apiCategoriesRes.value.ok) {
          const apiCats = await apiCategoriesRes.value.json();
          const normalizedCats = normalizeCategories(apiCats);
          if (normalizedCats && typeof normalizedCats === 'object') {
            console.log('AdminDataContext: Loaded categories from API');
            setCategories(normalizedCats);
            localStorage.setItem('adminCategories', JSON.stringify(normalizedCats));
          }
        } else {
          console.warn('AdminDataContext: Failed to load categories from API:', apiCategoriesRes.status);
        }

        if (apiBrandsRes.status === 'fulfilled' && apiBrandsRes.value.ok) {
          const apiBrands = await apiBrandsRes.value.json();
          if (Array.isArray(apiBrands) && apiBrands.length) {
            console.log('AdminDataContext: Loaded brands from API');
            setBrands(apiBrands);
            localStorage.setItem('adminBrands', JSON.stringify(apiBrands));
          }
        } else {
          console.warn('AdminDataContext: Failed to load brands from API:', apiBrandsRes.status);
        }

        if (apiPromosRes.status === 'fulfilled' && apiPromosRes.value.ok) {
          const apiPromos = await apiPromosRes.value.json();
          if (Array.isArray(apiPromos)) {
            console.log('AdminDataContext: Loaded promotions from API');
            setPromotions(apiPromos);
            localStorage.setItem('adminPromotions', JSON.stringify(apiPromos));
          }
        } else {
          console.warn('AdminDataContext: Failed to load promotions from API:', apiPromosRes.status);
        }

        if (apiTerrainTypesRes.status === 'fulfilled' && apiTerrainTypesRes.value.ok) {
          const apiTerrainTypes = await apiTerrainTypesRes.value.json();
          if (Array.isArray(apiTerrainTypes)) {
            console.log('AdminDataContext: Loaded terrain types from API');
            setTerrainTypes(apiTerrainTypes);
            localStorage.setItem('adminTerrainTypes', JSON.stringify(apiTerrainTypes));
          }
        } else {
          console.warn('AdminDataContext: Failed to load terrain types from API:', apiTerrainTypesRes.status);
        }

        if (apiVehicleTypesRes.status === 'fulfilled' && apiVehicleTypesRes.value.ok) {
          const apiVehicleTypes = await apiVehicleTypesRes.value.json();
          if (Array.isArray(apiVehicleTypes)) {
            console.log('AdminDataContext: Loaded vehicle types from API');
            setVehicleTypes(apiVehicleTypes);
            localStorage.setItem('adminVehicleTypes', JSON.stringify(apiVehicleTypes));
          }
        } else {
          console.warn('AdminDataContext: Failed to load vehicle types from API:', apiVehicleTypesRes.status);
        }
      } catch (e) {
        console.error('AdminDataContext: API bootstrap failed:', e);
        console.warn('AdminDataContext: Using local data as fallback');
      }
    };
    bootstrapFromApi();
  }, []);

  // Функции для работы с товарами
  const addProduct = async (product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error('Failed to create product');
      await refreshFromApi();
    } catch (e) {
      // Fallback локально
      const newProduct = {
        ...product,
        id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedProduct)
      });
      if (!res.ok) throw new Error('Failed to update product');
      await refreshFromApi();
    } catch (e) {
      const updatedProducts = products.map(product => 
        product.id === id ? { ...product, ...updatedProduct } : product
      );
      setProducts(updatedProducts);
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete product');
      await refreshFromApi();
    } catch (e) {
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    }
  };

  // Функции для работы с категориями
  const addCategory = async (categoryName, subcategories = []) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: categoryName, subcategories })
      });
      if (!res.ok) throw new Error('Failed to create category');
      await refreshFromApi();
    } catch (e) {
      const updatedCategories = {
        ...categories,
        [categoryName]: subcategories
      };
      setCategories(updatedCategories);
      localStorage.setItem('adminCategories', JSON.stringify(updatedCategories));
    }
  };

  const updateCategory = async (oldName, newName, subcategories) => {
    try {
      const subs = Array.isArray(subcategories) ? subcategories : (categories[oldName] || []);
      if (oldName !== newName) {
        const r1 = await fetch(`/api/categories/${encodeURIComponent(oldName)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ newName })
        });
        if (!r1.ok) throw new Error('Failed to rename category');
      }
      const r2 = await fetch(`/api/categories/${encodeURIComponent(newName)}/subcategories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subcategories: subs })
      });
      if (!r2.ok) throw new Error('Failed to update subcategories');
      await refreshFromApi();
    } catch (e) {
      const subs = Array.isArray(subcategories) ? subcategories : (categories[oldName] || []);
      const updatedCategories = { ...categories };
      delete updatedCategories[oldName];
      updatedCategories[newName] = subs;
      setCategories(updatedCategories);
      localStorage.setItem('adminCategories', JSON.stringify(updatedCategories));
    }
  };

  const deleteCategory = async (categoryName) => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete category');
      await refreshFromApi();
    } catch (e) {
      const updatedCategories = { ...categories };
      delete updatedCategories[categoryName];
      setCategories(updatedCategories);
      localStorage.setItem('adminCategories', JSON.stringify(updatedCategories));
    }
  };

  // Подкатегории
  const addSubcategory = async (categoryName, subcategoryName) => {
    const current = categories[categoryName] || [];
    if (current.includes(subcategoryName)) return;
    const next = [...current, subcategoryName];
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(categoryName)}/subcategories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subcategories: next })
      });
      if (!res.ok) throw new Error('Failed to add subcategory');
      await refreshFromApi();
    } catch (e) {
      const updated = { ...categories, [categoryName]: next };
      setCategories(updated);
      localStorage.setItem('adminCategories', JSON.stringify(updated));
    }
  };

  const updateSubcategory = async (categoryName, oldSubName, newSubName) => {
    const current = categories[categoryName] || [];
    const next = current.map(s => (s === oldSubName ? newSubName : s));
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(categoryName)}/subcategories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subcategories: next })
      });
      if (!res.ok) throw new Error('Failed to update subcategory');
      await refreshFromApi();
    } catch (e) {
      const updated = { ...categories, [categoryName]: next };
      setCategories(updated);
      localStorage.setItem('adminCategories', JSON.stringify(updated));
    }
  };

  const deleteSubcategory = async (categoryName, subcategoryName) => {
    const current = categories[categoryName] || [];
    const next = current.filter(s => s !== subcategoryName);
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(categoryName)}/subcategories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subcategories: next })
      });
      if (!res.ok) throw new Error('Failed to delete subcategory');
      await refreshFromApi();
    } catch (e) {
      const updated = { ...categories, [categoryName]: next };
      setCategories(updated);
      localStorage.setItem('adminCategories', JSON.stringify(updated));
    }
  };

  // Функции для работы с брендами
  const addBrand = async (brandName) => {
    if (!brandName) return;
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: brandName })
      });
      if (!res.ok) throw new Error('Failed to create brand');
      await refreshFromApi();
    } catch (e) {
      if (!brands.includes(brandName)) {
        const updatedBrands = [...brands, brandName];
        setBrands(updatedBrands);
        localStorage.setItem('adminBrands', JSON.stringify(updatedBrands));
      }
    }
  };

  const deleteBrand = async (brandName) => {
    try {
      const res = await fetch(`/api/brands/${encodeURIComponent(brandName)}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete brand');
      await refreshFromApi();
    } catch (e) {
      const updatedBrands = brands.filter(brand => brand !== brandName);
      setBrands(updatedBrands);
      localStorage.setItem('adminBrands', JSON.stringify(updatedBrands));
    }
  };

  // Функции для работы с промокодами
  const addPromocode = async (promocode) => {
    try {
      const res = await fetch('/api/promocodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(promocode)
      });
      if (!res.ok) throw new Error('Failed to create promocode');
      await refreshFromApi();
    } catch (e) {
      // Fallback: локально, если API недоступен
      const newPromocode = {
        ...promocode,
        id: promocodes.length ? Math.max(...promocodes.map(p => p.id)) + 1 : 1,
        usedCount: 0
      };
      const updatedPromocodes = [...promocodes, newPromocode];
      setPromocodes(updatedPromocodes);
      localStorage.setItem('adminPromocodes', JSON.stringify(updatedPromocodes));
    }
  };

  const updatePromocode = async (id, updatedPromocode) => {
    try {
      const res = await fetch(`/api/promocodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedPromocode)
      });
      if (!res.ok) throw new Error('Failed to update promocode');
      await refreshFromApi();
    } catch (e) {
      // Fallback: локально, если API недоступен
      const updatedPromocodes = promocodes.map(p => 
        p.id === id ? { ...p, ...updatedPromocode, usedCount: p.usedCount || 0 } : p
      );
      setPromocodes(updatedPromocodes);
      localStorage.setItem('adminPromocodes', JSON.stringify(updatedPromocodes));
    }
  };

  const deletePromocode = async (id) => {
    try {
      const res = await fetch(`/api/promocodes/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (!res.ok) throw new Error('Failed to delete promocode');
      await refreshFromApi();
    } catch (e) {
      // Fallback: локально, если API недоступен
      const updatedPromocodes = promocodes.filter(p => p.id !== id);
      setPromocodes(updatedPromocodes);
      localStorage.setItem('adminPromocodes', JSON.stringify(updatedPromocodes));
    }
  };

  // Функция для увеличения счетчика использований промокода
  const updatePromocodeUsage = async (id) => {
    try {
      const promocode = promocodes.find(p => p.id === id);
      if (!promocode) return;

      const updatedPromocode = {
        ...promocode,
        usedCount: (promocode.usedCount || 0) + 1
      };

      const res = await fetch(`/api/promocodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedPromocode)
      });
      
      if (!res.ok) throw new Error('Failed to update promocode usage');
      await refreshFromApi();
    } catch (e) {
      // Fallback: локально, если API недоступен
      const updatedPromocodes = promocodes.map(p => 
        p.id === id ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p
      );
      setPromocodes(updatedPromocodes);
      localStorage.setItem('adminPromocodes', JSON.stringify(updatedPromocodes));
    }
  };

  // Функции для работы с акциями
  const addPromotion = async (promotion) => {
    try {
      const payload = {
        ...promotion,
        category: promotion.category && promotion.category !== 'Все категории' ? promotion.category : null,
      };
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create promotion');
      await refreshFromApi();
    } catch (e) {
      // Fallback: локально, если API недоступен
      const newPromotion = {
        ...promotion,
        id: promotions.length ? Math.max(...promotions.map(p => p.id)) + 1 : 1
      };
      const updatedPromotions = [...promotions, newPromotion];
      setPromotions(updatedPromotions);
      localStorage.setItem('adminPromotions', JSON.stringify(updatedPromotions));
    }
  };

  const updatePromotion = async (id, updatedPromotion) => {
    try {
      const payload = {
        ...updatedPromotion,
        category: updatedPromotion.category && updatedPromotion.category !== 'Все категории' ? updatedPromotion.category : null,
      };
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update promotion');
      await refreshFromApi();
    } catch (e) {
      // Fallback локально
      const updatedPromotions = promotions.map(promo => 
        promo.id === id ? { ...promo, ...updatedPromotion } : promo
      );
      setPromotions(updatedPromotions);
      localStorage.setItem('adminPromotions', JSON.stringify(updatedPromotions));
    }
  };

  const deletePromotion = async (id) => {
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete promotion');
      await refreshFromApi();
    } catch (e) {
      // Fallback локально
      const updatedPromotions = promotions.filter(promo => promo.id !== id);
      setPromotions(updatedPromotions);
      localStorage.setItem('adminPromotions', JSON.stringify(updatedPromotions));
    }
  };

  // Функция для обновления контента "О компании"
  const updateAboutContent = (newContent) => {
    console.log('AdminDataContext: Updating about content:', newContent);
    console.log('AdminDataContext: Previous about content:', aboutContent);
    console.log('AdminDataContext: Team data in new content:', newContent.team);
    console.log('AdminDataContext: History data in new content:', newContent.history);
    
    // Убеждаемся, что структура данных полная
    const completeContent = {
      ...initialAboutContent,
      ...newContent,
      homeHero: {
        ...initialAboutContent.homeHero,
        ...(newContent.homeHero || {}),
        heroEffect: (newContent?.homeHero?.heroEffect) || initialAboutContent.homeHero.heroEffect || 'particles',
        visualButtons: Array.isArray(newContent?.homeHero?.visualButtons)
          ? newContent.homeHero.visualButtons
          : []
      },
      team: newContent.team || { title: 'Наша команда', members: [] },
      history: {
        ...initialAboutContent.history,
        ...(newContent.history || {}),
        milestones: {
          ...initialAboutContent.history.milestones,
          ...(newContent.history?.milestones || {})
        }
      },
      footer: {
        ...initialAboutContent.footer,
        ...(newContent.footer || {})
      }
    };

    // Тонкая настройка: если админ явно задал пустое описание метода доставки,
    // сохраняем пустую строку (не подменяем дефолтом).
    if (completeContent?.deliveryAndPayment?.deliveryMethods) {
      completeContent.deliveryAndPayment.deliveryMethods = completeContent.deliveryAndPayment.deliveryMethods.map(m => {
        if (!m) return m;
        return {
          ...m,
          description: (m.description !== undefined) ? m.description : undefined,
          items: Array.isArray(m.items) ? m.items : []
        };
      });
    }
    
    setAboutContent(completeContent);
    localStorage.setItem('adminAboutContent', JSON.stringify(completeContent));
    
    console.log('AdminDataContext: Complete content saved:', completeContent);
    console.log('AdminDataContext: Saved team:', completeContent.team);
    console.log('AdminDataContext: Saved history:', completeContent.history);
  };

  // Функции для работы с популярными товарами
  const updatePopularProducts = (productIds) => {
    setPopularProductIds(productIds);
    localStorage.setItem('adminPopularProducts', JSON.stringify(productIds));
  };

  // Функция для обновления настроек фильтров
  const updateFilterSettings = (newSettings) => {
    setFilterSettings(newSettings);
    localStorage.setItem('adminFilterSettings', JSON.stringify(newSettings));
  };

  // Функции для работы с вездеходами
  const addVehicle = async (vehicle) => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vehicle)
      });
      if (!res.ok) throw new Error('Failed to create vehicle');
      await refreshFromApi();
    } catch (e) {
      // Fallback локально
      const newVehicle = {
        ...vehicle,
        id: vehicles.length ? Math.max(...vehicles.map(v => v.id)) + 1 : 1
      };
      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      localStorage.setItem('adminVehicles', JSON.stringify(updatedVehicles));
    }
  };

  const updateVehicle = async (id, updatedVehicle) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedVehicle)
      });
      if (!res.ok) throw new Error('Failed to update vehicle');
      await refreshFromApi();
    } catch (e) {
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, ...updatedVehicle } : vehicle
      );
      setVehicles(updatedVehicles);
      localStorage.setItem('adminVehicles', JSON.stringify(updatedVehicles));
    }
  };

  const deleteVehicle = async (id) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete vehicle');
      await refreshFromApi();
    } catch (e) {
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
      setVehicles(updatedVehicles);
      localStorage.setItem('adminVehicles', JSON.stringify(updatedVehicles));
    }
  };

  // Функции для управления типами местности
  const addTerrainType = async (typeName) => {
    try {
      const response = await fetch('/api/terrain-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: typeName })
      });
      
      if (response.ok) {
        setTerrainTypes(prev => [...prev, typeName]);
      }
    } catch (error) {
      console.error('Error adding terrain type:', error);
      // Fallback на локальное добавление
      setTerrainTypes(prev => [...prev, typeName]);
    }
  };

  const deleteTerrainType = async (typeName) => {
    try {
      const response = await fetch(`/api/terrain-types/${encodeURIComponent(typeName)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setTerrainTypes(prev => prev.filter(t => t !== typeName));
      }
    } catch (error) {
      console.error('Error deleting terrain type:', error);
      // Fallback на локальное удаление
      setTerrainTypes(prev => prev.filter(t => t !== typeName));
    }
  };

  // Функции для управления типами вездеходов
  const addVehicleType = async (typeName) => {
    try {
      const response = await fetch('/api/vehicle-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: typeName })
      });
      
      if (response.ok) {
        setVehicleTypes(prev => [...prev, typeName]);
      }
    } catch (error) {
      console.error('Error adding vehicle type:', error);
      // Fallback на локальное добавление
      setVehicleTypes(prev => [...prev, typeName]);
    }
  };

  const deleteVehicleType = async (typeName) => {
    try {
      const response = await fetch(`/api/vehicle-types/${encodeURIComponent(typeName)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setVehicleTypes(prev => prev.filter(t => t !== typeName));
      }
    } catch (error) {
      console.error('Error deleting vehicle type:', error);
      // Fallback на локальное удаление
      setVehicleTypes(prev => prev.filter(t => t !== typeName));
    }
  };

  const value = {
    // Данные
    products,
    categories,
    brands,
    promotions,
    promocodes,
    aboutContent,
    filterSettings,
    popularProductIds,
    vehicles,
    terrainTypes,
    vehicleTypes,
    data: { categoryStructure: categories },
    refreshFromApi: async () => {
      try {
        console.log('AdminDataContext: Refreshing data from API...');
        const [p, cRaw, b, pr, pc, t, v] = await Promise.allSettled([
          fetch('/api/products', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
          fetch('/api/categories', { credentials: 'include' }).then(r => r.ok ? r.json() : categoryStructure),
          fetch('/api/brands', { credentials: 'include' }).then(r => r.ok ? r.json() : initialBrands),
          fetch('/api/promotions', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
          fetch('/api/promocodes', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
          fetch('/api/terrain-types', { credentials: 'include' }).then(r => r.ok ? r.json() : ['Снег', 'Болото', 'Вода', 'Горы', 'Лес', 'Пустыня']),
          fetch('/api/vehicle-types', { credentials: 'include' }).then(r => r.ok ? r.json() : ['Гусеничный', 'Колесный', 'Плавающий'])
        ]);
        
        // Обрабатываем результаты
        const normalized = Array.isArray(p.value) ? p.value.map(migrateProductImages).sort((a, b) => (a.id || 0) - (b.id || 0)) : [];
        const c = normalizeCategories(cRaw.value);
        
        console.log('AdminDataContext: Refreshed data - products:', normalized.length, 'categories:', Object.keys(c).length);
        
        setProducts(normalized);
        setCategories(c);
        setBrands(b.value);
        setPromotions(pr.value);
        setPromocodes(pc.value);
        setTerrainTypes(t.value);
        setVehicleTypes(v.value);
        localStorage.setItem('adminProducts', JSON.stringify(normalized));
        localStorage.setItem('adminCategories', JSON.stringify(c));
        localStorage.setItem('adminBrands', JSON.stringify(b.value));
        localStorage.setItem('adminPromotions', JSON.stringify(pr.value));
        localStorage.setItem('adminPromocodes', JSON.stringify(pc.value));
        localStorage.setItem('adminTerrainTypes', JSON.stringify(t.value));
        localStorage.setItem('adminVehicleTypes', JSON.stringify(v.value));
      } catch (error) {
        console.error('AdminDataContext: Error refreshing data:', error);
      } finally {
        // setIsLoading(false); // Удалено
      }
    },
    
    // Функции для товаров
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Функции для категорий
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    
    // Функции для брендов
    addBrand,
    deleteBrand,
    
    // Функции для промокодов
    addPromocode,
    updatePromocode,
    deletePromocode,
    updatePromocodeUsage,
    
    // Функции для акций
    addPromotion,
    updatePromotion,
    deletePromotion,
    
    // Функция для контента
    updateAboutContent,
    
    // Функции для популярных товаров
    updatePopularProducts,

    // Функция для настроек фильтров
    updateFilterSettings,

    // Функции для вездеходов
    addVehicle,
    updateVehicle,
    deleteVehicle,

    // Функции для типов местности
    addTerrainType,
    deleteTerrainType,

    // Функции для типов вездеходов
    addVehicleType,
    deleteVehicleType
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};
