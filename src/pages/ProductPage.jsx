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

// Данные товаров (в реальном приложении будут загружаться с сервера)
const productsData = {
  1: {
    id: 1,
    title: 'Гусеницы для вездехода',
    price: 45000,
    originalPrice: 50000,
    category: 'Ходовая',
    brand: 'Вездеход-Мастер',
    available: true,
    inStock: 12,
    icon: '🔗',
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400', '/api/placeholder/600/400'],
    description: 'Высококачественные гусеницы для вездеходов различных марок. Изготовлены из прочной резины с металлическими вставками. Обеспечивают отличное сцепление на любой поверхности.',
    specifications: {
      'Ширина': '400 мм',
      'Длина': '2500 мм',
      'Материал': 'Резина с металлокордом',
      'Совместимость': 'Универсальная',
      'Гарантия': '12 месяцев'
    },
    features: [
      'Высокая износостойкость',
      'Отличное сцепление на снегу и грязи',
      'Простая установка',
      'Совместимость с большинством вездеходов'
    ]
  },
  2: {
    id: 2,
    title: 'Двигатель 2.0L',
    price: 180000,
    category: 'Двигатель',
    brand: 'ТехноМотор',
    available: true,
    inStock: 3,
    icon: '⚙️',
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
    description: 'Мощный и надежный двигатель объемом 2.0 литра для вездеходов. Отличается высокой топливной экономичностью и долговечностью.',
    specifications: {
      'Объем': '2.0 л',
      'Мощность': '150 л.с.',
      'Тип топлива': 'Бензин',
      'Охлаждение': 'Жидкостное',
      'Гарантия': '24 месяца'
    },
    features: [
      'Высокая мощность и крутящий момент',
      'Экономичный расход топлива',
      'Простое обслуживание',
      'Надежная система охлаждения'
    ]
  },
  3: {
    id: 3,
    title: 'Трансмиссия',
    price: 95000,
    category: 'Трансмиссия',
    brand: 'Вездеход-Мастер',
    available: false,
    inStock: 0,
    icon: '🔧',
    images: ['/api/placeholder/600/400'],
    description: 'Надежная трансмиссия для вездеходов различных марок. Обеспечивает плавное переключение передач и долгий срок службы.',
    specifications: {
      'Тип': 'Механическая',
      'Количество передач': '6',
      'Материал': 'Сталь высокой прочности',
      'Совместимость': 'Универсальная',
      'Гарантия': '18 месяцев'
    },
    features: [
      'Плавное переключение передач',
      'Высокая надежность',
      'Простое обслуживание',
      'Совместимость с большинством двигателей'
    ]
  },
  4: {
    id: 4,
    title: 'Подвеска',
    price: 65000,
    category: 'Ходовая',
    brand: 'СуперТрек',
    available: true,
    inStock: 8,
    icon: '🛠️',
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
    description: 'Усиленная подвеска для экстремальных условий эксплуатации. Повышает проходимость и комфорт езды.',
    specifications: {
      'Тип': 'Независимая',
      'Амортизаторы': 'Газо-масляные',
      'Материал': 'Сталь + алюминий',
      'Ход подвески': '250 мм',
      'Гарантия': '12 месяцев'
    },
    features: [
      'Увеличенный ход подвески',
      'Усиленная конструкция',
      'Отличная амортизация',
      'Подходит для экстремальных условий'
    ]
  },
  5: {
    id: 5,
    title: 'Фильтр воздушный',
    price: 3500,
    category: 'Двигатель',
    brand: 'ТехноМотор',
    available: true,
    inStock: 25,
    icon: '🌀',
    images: ['/api/placeholder/600/400'],
    description: 'Высококачественный воздушный фильтр для защиты двигателя от пыли и грязи.',
    specifications: {
      'Тип': 'Панельный',
      'Материал': 'Синтетическое волокно',
      'Эффективность': '99.5%',
      'Ресурс': '15 000 км',
      'Гарантия': '6 месяцев'
    },
    features: [
      'Высокая степень фильтрации',
      'Долгий срок службы',
      'Простая замена',
      'Защита двигателя от износа'
    ]
  },
  6: {
    id: 6,
    title: 'Ремень приводной',
    price: 2200,
    category: 'Трансмиссия',
    brand: 'DrivePro',
    available: true,
    inStock: 15,
    icon: '⛓️',
    images: ['/api/placeholder/600/400'],
    description: 'Прочный приводной ремень для надежной передачи мощности от двигателя к трансмиссии.',
    specifications: {
      'Длина': '1200 мм',
      'Ширина': '30 мм',
      'Материал': 'Резина с кевларовым кордом',
      'Максимальная нагрузка': '150 Нм',
      'Гарантия': '12 месяцев'
    },
    features: [
      'Высокая прочность на разрыв',
      'Устойчивость к износу',
      'Работа в широком диапазоне температур',
      'Простая установка'
    ]
  }
};

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCartWithNotification } = useCartActions();
  const { products, categories, brands, filterSettings } = useAdminData();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  // wishlist removed

  const product = products.find(p => p.id === parseInt(id));

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
              {/* wishlist button removed */}
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
                        // Разрешаем пустое поле
                        if (inputValue === '') {
                          return;
                        }
                        const value = parseInt(inputValue);
                        if (!isNaN(value) && value >= 1) {
                          setQuantity(Math.min(value, product.quantity || 999));
                        }
                      }}
                      onBlur={(e) => {
                        // При потере фокуса, если поле пустое, ставим 1
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