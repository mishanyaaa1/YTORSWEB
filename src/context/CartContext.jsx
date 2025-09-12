import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { safeGetItem, safeSetItem, STORAGE_KEYS } from '../utils/localStorage';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
};

// Функции для работы с localStorage
const loadCartFromStorage = () => {
  return safeGetItem(STORAGE_KEYS.CART, []);
};

const saveCartToStorage = (cartItems) => {
  return safeSetItem(STORAGE_KEYS.CART, cartItems);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Рефы для дополнительной защиты данных
  const lastSavedCart = useRef(null);
  const saveTimeoutRef = useRef(null);
  const pendingSaveRef = useRef(false);

  // Проверка доступности localStorage
  useEffect(() => {
    const checkStorage = () => {
      try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        setStorageAvailable(true);
        return true;
      } catch (e) {
        console.warn('localStorage недоступен, используем fallback');
        setStorageAvailable(false);
        return false;
      }
    };

    checkStorage();
  }, []);

  // Загрузка корзины из localStorage при инициализации
  useEffect(() => {
    console.log('CartContext: Начинаем загрузку корзины из localStorage');
    
    if (!storageAvailable) {
      console.log('CartContext: localStorage недоступен, используем пустую корзину');
      setCartItems([]);
      setIsInitialized(true);
      return;
    }

    const savedCart = loadCartFromStorage();
    console.log('CartContext: Загруженные данные корзины:', savedCart);
    
    // Проверяем, что загруженные данные являются массивом
    if (Array.isArray(savedCart)) {
      setCartItems(savedCart);
      console.log('CartContext: Корзина успешно загружена, товаров:', savedCart.length);
    } else {
      console.warn('Некорректные данные корзины в localStorage, сбрасываем');
      setCartItems([]);
    }
    setIsInitialized(true);
    console.log('CartContext: Инициализация завершена');
  }, [storageAvailable]);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    if (isInitialized && storageAvailable) {
      console.log('CartContext: Сохраняем корзину в localStorage, товаров:', cartItems.length);
      saveCartToStorage(cartItems);
    }
  }, [cartItems, isInitialized, storageAvailable]);

  // Синхронизация с localStorage при изменении в других вкладках
  useEffect(() => {
    if (!storageAvailable) return;

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.CART && e.newValue !== null) {
        try {
          const newCart = JSON.parse(e.newValue);
          if (Array.isArray(newCart)) {
            setCartItems(newCart);
          }
        } catch (error) {
          console.error('Ошибка при синхронизации корзины:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageAvailable]);

  // Дополнительная защита от потери данных - сохранение с задержкой
  useEffect(() => {
    if (!isInitialized || !cartItems || !storageAvailable) return;

    // Проверяем, действительно ли изменилась корзина
    const cartString = JSON.stringify(cartItems);
    if (cartString === lastSavedCart.current) return;

    // Очищаем предыдущий таймаут
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Сохраняем с небольшой задержкой для оптимизации
    saveTimeoutRef.current = setTimeout(() => {
      if (saveCartToStorage(cartItems)) {
        lastSavedCart.current = cartString;
        pendingSaveRef.current = false;
      } else {
        pendingSaveRef.current = true;
      }
    }, 100);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cartItems, isInitialized, storageAvailable]);

  // Принудительное сохранение при изменении фокуса
  useEffect(() => {
    if (!storageAvailable) return;

    const handleFocus = () => {
      if (isInitialized && cartItems && pendingSaveRef.current) {
        saveCartToStorage(cartItems);
        pendingSaveRef.current = false;
      }
    };

    const handleBlur = () => {
      if (isInitialized && cartItems) {
        saveCartToStorage(cartItems);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [cartItems, isInitialized, storageAvailable]);

  // Сохранение корзины перед закрытием страницы
  useEffect(() => {
    if (!storageAvailable) return;

    const handleBeforeUnload = () => {
      if (isInitialized && cartItems) {
        saveCartToStorage(cartItems);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isInitialized && cartItems) {
        saveCartToStorage(cartItems);
      }
    };

    const handlePageHide = () => {
      if (isInitialized && cartItems) {
        saveCartToStorage(cartItems);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [cartItems, isInitialized, storageAvailable]);

  // Периодическое сохранение для дополнительной защиты
  useEffect(() => {
    if (!storageAvailable) return;

    const interval = setInterval(() => {
      if (isInitialized && cartItems && pendingSaveRef.current) {
        saveCartToStorage(cartItems);
        pendingSaveRef.current = false;
      }
    }, 5000); // Проверяем каждые 5 секунд

    return () => clearInterval(interval);
  }, [cartItems, isInitialized, storageAvailable]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Сохраняем необходимые данные товара, включая изображение
        const cartItem = {
          id: product.id,
          title: product.title,
          price: product.price,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          available: product.available,
          image: product.image, // Добавляем изображение
          type: product.type, // Добавляем тип (vehicle/product)
          quantity: quantity
        };
        return [...prevItems, cartItem];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    setCartItems,
    isInitialized,
    storageAvailable
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
