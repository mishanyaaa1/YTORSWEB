import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaShoppingCart, FaTruck, FaBox } from 'react-icons/fa';
import { getMainImage } from '../utils/imageHelpers';
import BrandMark from './BrandMark';
import { useCartActions } from '../hooks/useCartActions';
import './SearchModal.css';

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchType, setSearchType] = useState('products'); // 'products' или 'vehicles'
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');
  const [selectedTerrain, setSelectedTerrain] = useState('all');
  // Статичные данные для поиска
  const products = [
    {
      id: 1,
      title: 'Гусеницы для вездехода',
      price: 45000,
      category: 'Ходовая',
      brand: 'Вездеход-Мастер',
      available: true,
      inStock: 12,
      icon: '🔗',
      images: ['/img/vehicles/1757657975220-561708050.png'],
      description: 'Высококачественные гусеницы для вездеходов различных марок.'
    },
    {
      id: 2,
      title: 'Двигатель 2.0L',
      price: 180000,
      category: 'Двигатель',
      brand: 'ТехноМотор',
      available: true,
      inStock: 3,
      icon: '⚙️',
      images: ['/img/vehicles/1757658286691-822575460.jpg'],
      description: 'Мощный и надежный двигатель для вездеходов.'
    },
    {
      id: 3,
      title: 'Трансмиссия 4WD',
      price: 95000,
      category: 'Трансмиссия',
      brand: 'ТрансМастер',
      available: true,
      inStock: 5,
      icon: '⚙️',
      images: ['/img/vehicles/1757699189101-187791637.png'],
      description: 'Полноприводная трансмиссия для вездеходов.'
    }
  ];
  
  const categories = [
    { name: 'all', title: 'Все категории' },
    { name: 'Ходовая', title: 'Ходовая часть' },
    { name: 'Двигатель', title: 'Двигатель' },
    { name: 'Трансмиссия', title: 'Трансмиссия' }
  ];
  
  const vehicles = [
    {
      id: 1,
      name: 'Вездеход "Буран"',
      type: 'Гусеничный',
      terrain: 'Снег',
      price: 2500000,
      description: 'Мощный гусеничный вездеход для работы в условиях глубокого снега',
      images: ['/img/vehicles/1757657975220-561708050.png']
    },
    {
      id: 2,
      name: 'Вездеход "Амфибия"',
      type: 'Плавающий',
      terrain: 'Вода',
      price: 1800000,
      description: 'Универсальный вездеход для работы на воде и суше',
      images: ['/img/vehicles/1757658286691-822575460.jpg']
    },
    {
      id: 3,
      name: 'Вездеход "Горный"',
      type: 'Колесный',
      terrain: 'Горы',
      price: 2200000,
      description: 'Специализированный вездеход для работы в горной местности',
      images: ['/img/vehicles/1757699189101-187791637.png']
    }
  ];
  
  const vehicleTypes = [
    { name: 'all', title: 'Все типы' },
    { name: 'Гусеничный', title: 'Гусеничный' },
    { name: 'Колесный', title: 'Колесный' },
    { name: 'Плавающий', title: 'Плавающий' }
  ];
  
  const terrainTypes = [
    { name: 'all', title: 'Все типы местности' },
    { name: 'Снег', title: 'Снег' },
    { name: 'Вода', title: 'Вода' },
    { name: 'Горы', title: 'Горы' },
    { name: 'Болото', title: 'Болото' }
  ];
  const { addToCartWithNotification } = useCartActions();

  // Очищаем поиск при закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedCategory('all');
      setSearchType('products');
      setSelectedVehicleType('all');
      setSelectedTerrain('all');
    }
  }, [isOpen]);

  // Фокус на поле поиска при открытии
  useEffect(() => {
    if (isOpen) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  }, [isOpen]);

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Логика поиска товаров
  const searchProducts = useMemo(() => {
    if (!searchTerm.trim() || searchType !== 'products') return [];

    const query = searchTerm.toLowerCase().trim();
    
    return products.filter(product => {
      // Фильтр по категории
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Поиск по названию
      if (product.title.toLowerCase().includes(query)) return true;
      
      // Поиск по категории
      if (product.category?.toLowerCase().includes(query)) return true;
      
      // Поиск по подкатегории
      if (product.subcategory?.toLowerCase().includes(query)) return true;
      
      // Поиск по бренду
      if (product.brand?.toLowerCase().includes(query)) return true;
      
      // Поиск по описанию
      if (product.description?.toLowerCase().includes(query)) return true;

      return false;
    }).slice(0, 10);
  }, [searchTerm, selectedCategory, products, searchType]);

  // Логика поиска вездеходов
  const searchVehicles = useMemo(() => {
    if (!searchTerm.trim() || searchType !== 'vehicles') return [];

    const query = searchTerm.toLowerCase().trim();
    
    return vehicles.filter(vehicle => {
      // Фильтр по типу вездехода
      if (selectedVehicleType !== 'all' && vehicle.type !== selectedVehicleType) {
        return false;
      }

      // Фильтр по местности
      if (selectedTerrain !== 'all' && vehicle.terrain !== selectedTerrain) {
        return false;
      }

      // Поиск по названию
      if (vehicle.name.toLowerCase().includes(query)) return true;
      
      // Поиск по типу
      if (vehicle.type?.toLowerCase().includes(query)) return true;
      
      // Поиск по местности
      if (vehicle.terrain?.toLowerCase().includes(query)) return true;
      
      // Поиск по описанию
      if (vehicle.description?.toLowerCase().includes(query)) return true;

      // Поиск по характеристикам
      if (vehicle.specs?.engine?.toLowerCase().includes(query)) return true;
      if (vehicle.specs?.capacity?.toLowerCase().includes(query)) return true;

      return false;
    }).slice(0, 10);
  }, [searchTerm, selectedVehicleType, selectedTerrain, vehicles, searchType]);

  const searchResults = searchType === 'products' ? searchProducts : searchVehicles;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = (item) => {
    if (searchType === 'products') {
      addToCartWithNotification(item, 1);
    } else {
      // Для вездеходов создаем специальный объект корзины с полной информацией
      const cartItem = {
        id: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        images: item.images,
        type: 'vehicle',
        brand: item.type,
        available: item.available,
        category: item.category || 'Вездеходы',
        subcategory: item.subcategory,
        description: item.description,
        specifications: item.specs || item.specifications,
        features: item.features
      };
      addToCartWithNotification(cartItem, 1);
    }
  };

  const categoryList = Object.keys(categories);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="search-modal"
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-header">
              <h2>
                <FaSearch /> Поиск товаров и вездеходов
              </h2>
              <button onClick={onClose} className="close-btn">
                <FaTimes />
              </button>
            </div>

            <div className="search-form">
              {/* Переключатель типа поиска */}
              <div className="search-type-selector">
                <button
                  className={`search-type-btn ${searchType === 'products' ? 'active' : ''}`}
                  onClick={() => setSearchType('products')}
                >
                  <FaBox /> Товары
                </button>
                <button
                  className={`search-type-btn ${searchType === 'vehicles' ? 'active' : ''}`}
                  onClick={() => setSearchType('vehicles')}
                >
                  <FaTruck /> Вездеходы
                </button>
              </div>

              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  id="search-input"
                  type="text"
                  placeholder={
                    searchType === 'products' 
                      ? "Введите название товара, категорию или бренд..." 
                      : "Введите название вездехода, тип или местность..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Фильтры для товаров */}
              {searchType === 'products' && (
                <div className="category-filter">
                  <label>Категория:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
                    <option value="all">Все категории</option>
                    {categoryList.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Фильтры для вездеходов */}
              {searchType === 'vehicles' && (
                <div className="vehicle-filters">
                  <div className="filter-row">
                    <div className="filter-group">
                      <label>Тип вездехода:</label>
                      <select
                        value={selectedVehicleType}
                        onChange={(e) => setSelectedVehicleType(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">Все типы</option>
                        {vehicleTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Местность:</label>
                      <select
                        value={selectedTerrain}
                        onChange={(e) => setSelectedTerrain(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">Вся местность</option>
                        {terrainTypes.map(terrain => (
                          <option key={terrain} value={terrain}>{terrain}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="search-results">
              {searchTerm.trim() === '' ? (
                <div className="search-placeholder">
                  <FaSearch className="placeholder-icon" />
                  <p>Начните вводить название для поиска</p>
                  <small>
                    {searchType === 'products' 
                      ? 'Поиск осуществляется по названию, категории, бренду и описанию'
                      : 'Поиск осуществляется по названию, типу, местности и характеристикам'
                    }
                  </small>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="no-results">
                  <h3>Ничего не найдено</h3>
                  <p>По запросу "{searchTerm}" не найдено {searchType === 'products' ? 'товаров' : 'вездеходов'}</p>
                  <small>Попробуйте изменить запрос или выбрать другие фильтры</small>
                </div>
              ) : (
                <div className="results-container">
                  <div className="results-header">
                    <span>Найдено {searchType === 'products' ? 'товаров' : 'вездеходов'}: {searchResults.length}</span>
                  </div>
                  
                  <div className="results-list">
                    {searchResults.map((item) => {
                      if (searchType === 'products') {
                        // Отображение товаров
                        const mainImage = getMainImage(item);
                        
                        return (
                          <motion.div
                            key={item.id}
                            className="result-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="result-image">
                              {(() => {
                                const d = mainImage?.data;
                                if (d && typeof d === 'string' && (d.startsWith('data:image') || d.startsWith('/uploads/') || d.startsWith('http'))){
                                  return <img src={d} alt={item.title} />;
                                }
                                return (
                                  <span className="result-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BrandMark alt={item.title} style={{ height: 28 }} />
                                  </span>
                                );
                              })()}
                            </div>

                            <div className="result-info">
                              <h4>{item.title}</h4>
                              <div className="result-meta">
                                <span className="result-category">{item.category}</span>
                                {item.subcategory && (
                                  <span className="result-subcategory"> • {item.subcategory}</span>
                                )}
                                {item.brand && item.brand.trim() && (
                                  <span className="result-brand"> • {item.brand}</span>
                                )}
                              </div>
                              <div className="result-price">{item.price?.toLocaleString()} ₽</div>
                              <div className="result-availability">
                                {item.quantity > 0 ? (
                                  <span className="in-stock">В наличии: {item.quantity} шт</span>
                                ) : (
                                  <span className="out-of-stock">Нет в наличии</span>
                                )}
                              </div>
                            </div>

                            <div className="result-actions">
                              <Link 
                                to={`/product/${item.id}`} 
                                onClick={onClose}
                                className="view-btn"
                              >
                                Подробнее
                              </Link>
                              {item.quantity > 0 && (
                                <button
                                  onClick={() => handleAddToCart(item)}
                                  className="add-to-cart-btn"
                                >
                                  <FaShoppingCart /> В корзину
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      } else {
                        // Отображение вездеходов
                        return (
                          <motion.div
                            key={item.id}
                            className="result-item vehicle-result"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="result-image">
                              {item.image && (item.image.startsWith('data:image') || item.image.startsWith('/uploads/') || item.image.startsWith('/img/vehicles/') || item.image.startsWith('http')) ? (
                                <img src={item.image} alt={item.name} />
                              ) : (
                                <span className="result-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FaTruck style={{ height: 28, color: '#e6a34a' }} />
                                </span>
                              )}
                            </div>

                            <div className="result-info">
                              <h4>{item.name}</h4>
                              <div className="result-meta">
                                <span className="result-category">{item.type}</span>
                                <span className="result-subcategory"> • {item.terrain}</span>
                                {item.specs?.engine && (
                                  <span className="result-brand"> • {item.specs.engine}</span>
                                )}
                              </div>
                              <div className="result-price">{item.price?.toLocaleString()} ₽</div>
                              <div className="result-availability">
                                {item.available ? (
                                  <span className="in-stock">В наличии: {item.quantity} шт</span>
                                ) : (
                                  <span className="out-of-stock">Нет в наличии</span>
                                )}
                              </div>
                            </div>

                            <div className="result-actions">
                              <Link 
                                to={`/vehicle/${item.id}`} 
                                onClick={onClose}
                                className="view-btn"
                              >
                                Подробнее
                              </Link>
                              {item.available && (
                                <button
                                  onClick={() => handleAddToCart(item)}
                                  className="add-to-cart-btn"
                                >
                                  <FaShoppingCart /> В корзину
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
