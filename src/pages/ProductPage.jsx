import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight, FaStar, FaTruck, FaShieldAlt, FaTools } from 'react-icons/fa';
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
      'Ход': '200 мм',
      'Материал': 'Сталь высокой прочности',
      'Совместимость': 'Универсальная',
      'Гарантия': '12 месяцев'
    },
    features: [
      'Увеличенный ход подвески',
      'Высокая прочность',
      'Простое обслуживание',
      'Совместимость с большинством вездеходов'
    ]
  }
};

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCartWithNotification } = useCartActions();
  const { products } = useAdminData();
  
  // Получаем данные товара
  const product = products.find(p => p.id === parseInt(productId)) || productsData[productId];
  
  if (!product) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="product-not-found">
            <h1>Товар не найден</h1>
            <p>К сожалению, запрашиваемый товар не существует или был удален.</p>
            <button onClick={() => navigate('/catalog')} className="cta-button">
              Вернуться в каталог
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Получаем изображения товара
  const productImages = getAllImages(product);
  const hasImages = productImages && productImages.length > 0;

  const handleAddToCart = () => {
    addToCartWithNotification(product, quantity);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="product-page">
      <div className="container">
        {/* Заголовок страницы */}
        <div className="product-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
            Назад
          </button>
          <div className="breadcrumbs">
            <span onClick={() => navigate('/catalog')} className="breadcrumb-link">Каталог</span>
            <span className="breadcrumb-separator">/</span>
            <span onClick={() => navigate(`/catalog?category=${product.category}`)} className="breadcrumb-link">{product.category}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{product.title}</span>
          </div>
        </div>

        <div className="product-content">
          {/* Галерея изображений */}
          <div className="product-gallery">
            <Reveal type="left">
              <div className="main-image-container">
                {hasImages ? (
                  <div className="main-image-wrapper">
                    <img
                      src={productImages[selectedImageIndex]}
                      alt={product.title}
                      className="main-image"
                    />
                    {productImages.length > 1 && (
                      <>
                        <button className="gallery-nav prev" onClick={prevImage}>
                          <FaChevronLeft />
                        </button>
                        <button className="gallery-nav next" onClick={nextImage}>
                          <FaChevronRight />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="main-image-placeholder">
                    <BrandMark alt={product.title} style={{ height: 120 }} />
                  </div>
                )}
              </div>
            </Reveal>

            {/* Миниатюры */}
            {hasImages && productImages.length > 1 && (
              <Reveal type="left" delay={0.1}>
                <div className="image-thumbnails">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img src={image} alt={`${product.title} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="product-info">
            <Reveal type="right">
              <div className="product-header-info">
                <div className="product-meta">
                  <span className="product-category">{product.category}</span>
                  {product.brand && <span className="product-brand">{product.brand}</span>}
                </div>
                
                <h1 className="product-title">{product.title}</h1>
                
                <div className="product-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < 4 ? 'star filled' : 'star'} />
                    ))}
                  </div>
                  <span className="rating-text">4.8 (127 отзывов)</span>
                </div>
              </div>
            </Reveal>

            <Reveal type="right" delay={0.1}>
              <div className="product-pricing">
                <div className="price-container">
                  <span className="current-price">{product.price.toLocaleString()} ₽</span>
                  {hasDiscount && (
                    <span className="original-price">{product.originalPrice.toLocaleString()} ₽</span>
                  )}
                </div>
                {hasDiscount && (
                  <div className="discount-badge">
                    -{discountPercentage}%
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal type="right" delay={0.2}>
              <div className="product-availability">
                <div className={`availability-status ${product.available ? 'in-stock' : 'out-of-stock'}`}>
                  {product.available ? <FaCheckCircle /> : <FaTimesCircle />}
                  <span>{product.available ? 'В наличии' : 'Нет в наличии'}</span>
                </div>
                {product.available && product.inStock && (
                  <span className="stock-count">Осталось: {product.inStock} шт.</span>
                )}
              </div>
            </Reveal>

            <Reveal type="right" delay={0.3}>
              <div className="product-description">
                <h3>Описание</h3>
                <p>{product.description}</p>
              </div>
            </Reveal>

            <Reveal type="right" delay={0.4}>
              <div className="product-actions">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Количество:</label>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="quantity-input"
                    />
                    <button
                      className="quantity-btn"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!product.available}
                >
                  <FaShoppingCart />
                  {product.available ? 'Добавить в корзину' : 'Нет в наличии'}
                </button>
              </div>
            </Reveal>

            <Reveal type="right" delay={0.5}>
              <div className="product-features">
                <h3>Ключевые особенности</h3>
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <FaStar className="feature-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Детальная информация */}
        <div className="product-details">
          <Reveal type="up">
            <div className="details-tabs">
              <div className="tab-content active" id="specifications">
                <h3 className="tab-title">
                  <FaTools />
                  Технические характеристики
                </h3>
                <div className="specifications-grid">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-label">{key}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Дополнительные преимущества */}
        <Reveal type="up">
          <div className="product-benefits">
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <FaTruck />
                </div>
                <h4>Быстрая доставка</h4>
                <p>Доставляем по всей России в течение 24-48 часов</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <FaShieldAlt />
                </div>
                <h4>Гарантия качества</h4>
                <p>Полная гарантия на все товары от производителя</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <FaTools />
                </div>
                <h4>Техподдержка</h4>
                <p>Профессиональная консультация по установке и использованию</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
