import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import { useCartActions } from '../hooks/useCartActions';
import { useAdminData } from '../context/AdminDataContext';
import { migrateProductImages, getAllImages, isImageUrl } from '../utils/imageHelpers';
import BrandMark from '../components/BrandMark';
import './ProductPage.css';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCartWithNotification } = useCartActions();
  const { products, isLoading } = useAdminData();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Находим товар сразу после получения данных
  const product = products.find(p => p.id === parseInt(id));

  // Дополнительная проверка: если товар не найден, но данные загружены, пробуем обновить
  useEffect(() => {
    if (!isLoading && !product && id && products.length > 0) {
      console.log('ProductPage: Product not found in loaded data, attempting to refresh...');
      // Небольшая задержка перед обновлением, чтобы избежать бесконечного цикла
      const timer = setTimeout(() => {
        if (!products.find(p => p.id === parseInt(id))) {
          console.log('ProductPage: Still no product found, forcing page reload...');
          window.location.reload();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, product, id, products]);

  // Сбрасываем состояние при изменении id товара
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [id]);

  // Принудительно обновляем данные при переходе на страницу товара
  useEffect(() => {
    if (id && !isLoading) {
      // Проверяем, есть ли товар с таким id
      const foundProduct = products.find(p => p.id === parseInt(id));
      if (!foundProduct) {
        // Если товар не найден, пытаемся обновить данные
        console.log('ProductPage: Product not found, refreshing data...');
        // Принудительно обновляем данные из API
        const refreshData = async () => {
          try {
            const response = await fetch('/api/products', { credentials: 'include' });
            if (response.ok) {
              const freshProducts = await response.json();
              console.log('ProductPage: Refreshed products from API:', freshProducts.length);
              // Обновляем контекст через refreshFromApi
              window.location.reload(); // Временное решение для принудительного обновления
            }
          } catch (error) {
            console.error('ProductPage: Error refreshing data:', error);
          }
        };
        refreshData();
      }
    }
  }, [id, products, isLoading]);

  // Дополнительная проверка: если товар не найден после загрузки, показываем сообщение
  useEffect(() => {
    if (!isLoading && !product && id) {
      console.warn(`ProductPage: Product with id ${id} not found after data loading`);
    }
  }, [isLoading, product, id]);

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log('ProductPage: id changed to:', id);
    console.log('ProductPage: products count:', products.length);
    console.log('ProductPage: found product:', product);
  }, [id, products, product]);

  // Показываем состояние загрузки
  if (isLoading) {
    return (
      <div className="product-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка информации о товаре...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Товар не найден</h2>
        <p>ID товара: {id}</p>
        <p>Всего товаров: {products.length}</p>
        <div className="product-not-found-actions">
          <button 
            onClick={() => window.location.reload()} 
            className="refresh-button"
          >
            Обновить страницу
          </button>
          <button onClick={() => navigate('/catalog')} className="back-button">
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  // Мигрируем и получаем все изображения товара
  const migratedProduct = migrateProductImages(product);
  const allImages = getAllImages(migratedProduct) || [];
  
  // Безопасность: убеждаемся что selectedImageIndex в пределах массива
  const safeSelectedIndex = Math.max(0, Math.min(selectedImageIndex, allImages.length - 1));

  const handleAddToCart = () => {
    addToCartWithNotification(product, quantity);
  };

  const handleBuyNow = () => {
    try {
      addToCartWithNotification(product, quantity);
      setTimeout(() => {
        navigate('/cart');
      }, 100);
    } catch (error) {
      console.error('Error in handleBuyNow:', error);
      alert('Ошибка при покупке товара');
    }
  };

  // Нормализация характеристик: поддержка как объекта, так и массива [{name, value}]
  const specsArray = Array.isArray(product?.specifications)
    ? (product.specifications || []).filter(s => s && (s.name || s.value))
    : (product?.specifications && typeof product.specifications === 'object')
      ? Object.entries(product.specifications).map(([name, value]) => ({ name, value }))
      : [];

  return (
    <motion.div 
      className="product-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          <FaArrowLeft /> Назад
        </button>

        <div className="product-content">
          <div className="product-images">
            <div className="main-image">
              <motion.div 
                className="image-container"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {allImages && allImages.length > 0 && allImages[safeSelectedIndex] ? (
                  allImages[safeSelectedIndex].data && (
                    allImages[safeSelectedIndex].data.startsWith('data:image') ||
                    isImageUrl(allImages[safeSelectedIndex].data)
                  ) ? (
                    <img
                      src={allImages[safeSelectedIndex].data}
                      alt={product.title}
                      className="product-main-image"
                    />
                  ) : (
                    <span className="product-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrandMark alt={product.title} style={{ height: 200 }} />
                    </span>
                  )
                ) : (
                  <span className="product-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrandMark alt={product.title} style={{ height: 200 }} />
                  </span>
                )}
              </motion.div>
              
              {allImages && allImages.length > 1 && (
                <div className="image-navigation">
                  <button 
                    className="nav-button prev"
                    onClick={() => setSelectedImageIndex(selectedImageIndex === 0 ? allImages.length - 1 : selectedImageIndex - 1)}
                    disabled={!allImages || allImages.length <= 1}
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    className="nav-button next"
                    onClick={() => setSelectedImageIndex(selectedImageIndex === allImages.length - 1 ? 0 : selectedImageIndex + 1)}
                    disabled={!allImages || allImages.length <= 1}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
            
            {allImages && allImages.length > 1 && (
              <div className="image-thumbnails">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    {image && image.data && (
                      image.data.startsWith('data:image') || isImageUrl(image.data)
                    ) ? (
                      <img src={image.data} alt={`${product.title} ${index + 1}`} />
                    ) : (
                      <span className="product-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BrandMark alt={product.title} style={{ height: 40 }} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1>{product.title}</h1>
            </div>

            <div className="product-meta">
              <span className="brand">{product.brand}</span>
              <span className="category">{product.category}</span>
              <span className={`availability ${product.available ? 'in-stock' : 'out-of-stock'}`}>
                {product.available ? <FaCheckCircle /> : <FaTimesCircle />}
                {product.available ? `В наличии: ${product.quantity || 0} шт` : 'Нет в наличии'}
              </span>
            </div>

            <Reveal type="up">
              <div className="product-price">
                <span className="current-price">{product.price.toLocaleString()} ₽</span>
                {product.originalPrice && (
                  <span className="original-price">{product.originalPrice.toLocaleString()} ₽</span>
                )}
              </div>
            </Reveal>

            <Reveal type="up" delay={0.05}>
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            </Reveal>

            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h3>Преимущества:</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <Reveal type="up" delay={0.1}>
              <div className="product-actions">
                <div className="quantity-selector">
                  <label>Количество:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="text" 
                      value={quantity} 
                      onChange={(e) => {
                        const inputValue = e.target.value.replace(/[^0-9]/g, '');
                        if (inputValue === '') {
                          return;
                        }
                        const value = parseInt(inputValue);
                        if (!isNaN(value) && value >= 1) {
                          setQuantity(Math.min(value, product.quantity || 999));
                        }
                      }}
                      onBlur={(e) => {
                        const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                        if (cleanValue === '' || parseInt(cleanValue) < 1) {
                          setQuantity(1);
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="1"
                      className="quantity-input"
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(quantity + 1, product.quantity || 999))}
                      disabled={quantity >= (product.quantity || 999)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <motion.button 
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={!product.available}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaShoppingCart /> В корзину
                  </motion.button>

                  <motion.button 
                    className="buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={!product.available}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Купить сейчас
                  </motion.button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {specsArray.length > 0 && (
          <Reveal type="up">
            <div className="product-specifications">
              <h3>Технические характеристики</h3>
              <div className="specs-grid">
                {specsArray.map((spec, idx) => (
                  <div key={idx} className="spec-item">
                    <span className="spec-label">{spec.name}:</span>
                    <span className="spec-value">{String(spec.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </motion.div>
  );
}

export default ProductPage;