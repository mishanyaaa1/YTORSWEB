import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  categoryStructure, 
  initialProducts, 
  initialBrands, 
  initialPromotions, 
  initialAboutContent 
} from '../data/initialData.js';
import { migrateProductImages } from '../utils/imageHelpers';

const AdminDataContext = createContext();

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
    return saved ? JSON.parse(saved) : categoryStructure;
  });

  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('adminBrands');
    return saved ? JSON.parse(saved) : initialBrands;
  });

  const [promotions, setPromotions] = useState(() => {
    const saved = localStorage.getItem('adminPromotions');
    // По умолчанию пустой список — никаких демо-акций
    return saved ? JSON.parse(saved) : [];
  });

  const [aboutContent, setAboutContent] = useState(() => {
    const saved = localStorage.getItem('adminAboutContent');
    if (saved) {
      try {
        const parsedContent = JSON.parse(saved);
        // Мигрируем данные для обеспечения совместимости
        const migratedContent = {
          ...initialAboutContent,
          ...parsedContent,
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

  const [popularProductIds, setPopularProductIds] = useState(() => {
    const saved = localStorage.getItem('adminPopularProducts');
    return saved ? JSON.parse(saved) : [11, 1, 8, 2]; // ID популярных товаров по умолчанию
  });

  // Первичная загрузка из API (fallback на локальные данные)
  useEffect(() => {
    const bootstrapFromApi = async () => {
      try {
        const [apiProductsRes, apiCategoriesRes, apiBrandsRes, apiPromosRes] = await Promise.allSettled([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/brands'),
          fetch('/api/promotions')
        ]);

        if (apiProductsRes.status === 'fulfilled' && apiProductsRes.value.ok) {
          const apiProducts = await apiProductsRes.value.json();
          const normalized = Array.isArray(apiProducts)
            ? apiProducts.map(p => migrateProductImages(p)).sort((a, b) => (a.id || 0) - (b.id || 0))
            : [];
          setProducts(normalized);
          localStorage.setItem('adminProducts', JSON.stringify(normalized));
        }

        if (apiCategoriesRes.status === 'fulfilled' && apiCategoriesRes.value.ok) {
          const apiCats = await apiCategoriesRes.value.json();
          if (apiCats && typeof apiCats === 'object') {
            setCategories(apiCats);
            localStorage.setItem('adminCategories', JSON.stringify(apiCats));
          }
        }

        if (apiBrandsRes.status === 'fulfilled' && apiBrandsRes.value.ok) {
          const apiBrands = await apiBrandsRes.value.json();
          if (Array.isArray(apiBrands) && apiBrands.length) {
            setBrands(apiBrands);
            localStorage.setItem('adminBrands', JSON.stringify(apiBrands));
          }
        }

        if (apiPromosRes.status === 'fulfilled' && apiPromosRes.value.ok) {
          const apiPromos = await apiPromosRes.value.json();
          if (Array.isArray(apiPromos)) {
            setPromotions(apiPromos);
            localStorage.setItem('adminPromotions', JSON.stringify(apiPromos));
          }
        }
      } catch (e) {
        console.warn('AdminDataContext: API bootstrap failed, using local data');
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
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
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
          body: JSON.stringify({ newName })
        });
        if (!r1.ok) throw new Error('Failed to rename category');
      }
      const r2 = await fetch(`/api/categories/${encodeURIComponent(newName)}/subcategories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, { method: 'DELETE' });
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
      const res = await fetch(`/api/brands/${encodeURIComponent(brandName)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete brand');
      await refreshFromApi();
    } catch (e) {
      const updatedBrands = brands.filter(brand => brand !== brandName);
      setBrands(updatedBrands);
      localStorage.setItem('adminBrands', JSON.stringify(updatedBrands));
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
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
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
      team: newContent.team || [],
      history: {
        ...initialAboutContent.history,
        ...(newContent.history || {})
      },
      footer: {
        ...initialAboutContent.footer,
        ...(newContent.footer || {})
      }
    };
    
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

  const value = {
    // Данные
    products,
    categories,
    brands,
    promotions,
    aboutContent,
    popularProductIds,
    data: { categoryStructure: categories },
    refreshFromApi: async () => {
      const [p, c, b, pr] = await Promise.all([
        fetch('/api/products').then(r => r.ok ? r.json() : []),
        fetch('/api/categories').then(r => r.ok ? r.json() : categoryStructure),
        fetch('/api/brands').then(r => r.ok ? r.json() : initialBrands),
        fetch('/api/promotions').then(r => r.ok ? r.json() : [])
      ]);
      const normalized = Array.isArray(p) ? p.map(migrateProductImages).sort((a, b) => (a.id || 0) - (b.id || 0)) : [];
      setProducts(normalized);
      setCategories(c);
      setBrands(b);
      setPromotions(pr);
      localStorage.setItem('adminProducts', JSON.stringify(normalized));
      localStorage.setItem('adminCategories', JSON.stringify(c));
      localStorage.setItem('adminBrands', JSON.stringify(b));
      localStorage.setItem('adminPromotions', JSON.stringify(pr));
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
    
    // Функции для акций
    addPromotion,
    updatePromotion,
    deletePromotion,
    
    // Функция для контента
    updateAboutContent,
    
    // Функции для популярных товаров
    updatePopularProducts
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};
