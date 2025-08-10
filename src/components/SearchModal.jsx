import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useAdminData } from '../context/AdminDataContext';
import { getMainImage } from '../utils/imageHelpers';
import { useCartActions } from '../hooks/useCartActions';
import './SearchModal.css';

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { products, categories } = useAdminData();
  const { addToCartWithNotification } = useCartActions();

  // Защита от undefined данных
  if (!products || !categories) {
    return null;
  }

  // Очищаем поиск при закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedCategory('all');
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
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

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
    }).slice(0, 10); // Ограничиваем до 10 результатов
  }, [searchTerm, selectedCategory, products]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = (product) => {
    addToCartWithNotification(product, 1);
  };

  const categoryList = categories ? Object.keys(categories) : [];

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
                <FaSearch /> Поиск товаров
              </h2>
              <button onClick={onClose} className="close-btn">
                <FaTimes />
              </button>
            </div>

            <div className="search-form">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Введите название товара, категорию или бренд..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="category-filter">
                <label>Категория:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="all">Все категории</option>
                  {categoryList && categoryList.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-results">
              {searchTerm.trim() === '' ? (
                <div className="search-placeholder">
                  <FaSearch className="placeholder-icon" />
                  <p>Начните вводить название товара для поиска</p>
                  <small>Поиск осуществляется по названию, категории, бренду и описанию</small>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="no-results">
                  <h3>Ничего не найдено</h3>
                  <p>По запросу "{searchTerm}" не найдено товаров</p>
                  <small>Попробуйте изменить запрос или выбрать другую категорию</small>
                </div>
              ) : (
                <div className="results-container">
                  <div className="results-header">
                    <span>Найдено товаров: {searchResults.length}</span>
                  </div>
                  
                  <div className="results-list">
                    {searchResults && searchResults.map((product) => {
                      const mainImage = getMainImage(product);
                      
                      return (
                        <motion.div
                          key={product.id}
                          className="result-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="result-image">
                      {(() => {
                        const d = mainImage?.data;
                        if (d && typeof d === 'string' && (d.startsWith('data:image') || d.startsWith('/uploads/') || d.startsWith('http'))){
                          return <img src={d} alt={product.title} />;
                        }
                        return <span className="result-icon">{d || '📦'}</span>;
                      })()}
                          </div>

                          <div className="result-info">
                            <h4>{product.title}</h4>
                            <div className="result-meta">
                              <span className="result-category">{product.category}</span>
                              {product.subcategory && (
                                <span className="result-subcategory"> • {product.subcategory}</span>
                              )}
                              {product.brand && (
                                <span className="result-brand"> • {product.brand}</span>
                              )}
                            </div>
                            <div className="result-price">{product.price?.toLocaleString()} ₽</div>
                            <div className="result-availability">
                              {product.quantity > 0 ? (
                                <span className="in-stock">В наличии: {product.quantity} шт</span>
                              ) : (
                                <span className="out-of-stock">Нет в наличии</span>
                              )}
                            </div>
                          </div>

                          <div className="result-actions">
                            <Link 
                              to={`/product/${product.id}`} 
                              onClick={onClose}
                              className="view-btn"
                            >
                              Подробнее
                            </Link>
                            {product.quantity > 0 && (
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="add-to-cart-btn"
                              >
                                <FaShoppingCart /> В корзину
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
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
