import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTruck, 
  FaTools, 
  FaShieldAlt, 
  FaArrowRight,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaShoppingCart
} from 'react-icons/fa';
import { useAdminData } from '../context/AdminDataContext';
import { useCartActions } from '../hooks/useCartActions';
// wishlist removed
import { getMainImage, isImageUrl, resolveImageSrc } from '../utils/imageHelpers';
import BrandMark from '../components/BrandMark';
import { getIconForEmoji } from '../utils/iconMap.jsx';
import Reveal from '../components/Reveal';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const HERO_IMAGE_URL = 'https://images.pexels.com/photos/162553/engine-displacement-piston-162553.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const { products, popularProductIds, aboutContent } = useAdminData();
  const { addToCartWithNotification } = useCartActions();
  
  // wishlist removed
  
  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartWithNotification(product, 1);
  };
  
  const features = [
    {
      icon: <FaTruck />,
      title: "Быстрая доставка",
      text: "Доставляем запчасти по всей России в кратчайшие сроки"
    },
    {
      icon: <FaTools />,
      title: "Качественные детали",
      text: "Только оригинальные и сертифицированные запчасти"
    },
    {
      icon: <FaShieldAlt />,
      title: "Гарантия качества",
      text: "Полная гарантия на все товары и профессиональная поддержка"
    }
  ];

  // Получаем популярные товары из контекста по ID
  const popularProducts = popularProductIds
    .map(id => products.find(product => product.id === id))
    .filter(product => product) // Убираем undefined если товар не найден
    .map(product => ({
      id: product.id,
      title: product.title,
      price: `${product.price.toLocaleString()} ₽`,
      icon: getMainImage(product)?.data
    }));

  // Оригинальный массив для справки:
  const _originalPopularProducts = [
    {
      id: 11,
      title: "Гусеницы для вездехода",
      price: "45,000 ₽",
      icon: "🔗"
    },
    {
      id: 1,
      title: "Двигатель 2.0L дизельный",
      price: "180,000 ₽",
      icon: "⚙️"
    },
    {
      id: 8,
      title: "Коробка передач механическая",
      price: "95,000 ₽",
      icon: "🔧"
    },
    {
      id: 12,
      title: "Амортизатор передний",
      price: "12,000 ₽",
      icon: "🛠️"
    },
    {
      id: 15,
      title: "Аккумулятор 12V 100Ah",
      price: "15,000 ₽",
      icon: "🔋"
    },
    {
      id: 17,
      title: "Сиденье водителя",
      price: "25,000 ₽",
      icon: "🪑"
    }
  ];

  return (
    <div>
      {(() => {
        return (
          <section className="hero">
            <div className="container">
              <div className="hero-content">
                <div className="hero-text">
                  <motion.h1 
                    className="hero-title"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {(() => {
                      const title = aboutContent?.homeHero?.title || 'Запчасти для вездеходов';
                      if (title.includes('\n')) {
                        return title.split('\n').map((line, index) => (
                          <span key={index} style={{ display: 'block' }}>
                            {line}
                          </span>
                        ));
                      }
                      return title;
                    })()}
                  </motion.h1>
                  <motion.div 
                    className="hero-description"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {(() => {
                      const description = aboutContent?.homeHero?.description || 'Качественные запчасти для всех типов вездеходов. Быстрая доставка по всей России. Гарантия качества на все товары.';
                      if (description.includes('\n')) {
                        return description.split('\n').map((line, index) => (
                          <p key={index} style={{ margin: index > 0 ? '0.05em 0 0 0' : '0' }}>
                            {line}
                          </p>
                        ));
                      }
                      return <p>{description}</p>;
                    })()}
                  </motion.div>
                  <motion.div 
                    className="hero-cta-group"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Link to={aboutContent?.homeHero?.ctaLink || '/catalog'} className="cta-button">
                      {aboutContent?.homeHero?.ctaText || 'Перейти в каталог'}
                      <FaArrowRight />
                    </Link>
                    <Link
                      to={aboutContent?.homeHero?.secondaryCtaLink || "/about#contacts"}
                      className="cta-button secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        const link = aboutContent?.homeHero?.secondaryCtaLink || "/about#contacts";
                        if (link.includes('#contacts')) {
                          navigate('/about#contacts');
                          setTimeout(() => {
                            const el = document.getElementById('contacts');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 50);
                        } else {
                          navigate(link);
                        }
                      }}
                    >
                      {aboutContent?.homeHero?.secondaryCtaText || 'Связаться с менеджером'}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}
      

      <section className="features">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Почему выбирают нас</h2>
          </Reveal>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Reveal key={index} type="up" delay={index * 0.1}>
                <div className="feature-card">
                  <div className="feature-icon">
                    {typeof feature.icon === 'string' ? getIconForEmoji(feature.icon) : feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-text">{feature.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="products popular-products">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Популярные товары</h2>
          </Reveal>

          {popularProducts.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '2.2rem', color: '#ffd166', marginBottom: '0.5rem' }}>
                  <FaStar style={{ verticalAlign: 'middle' }} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem' }}>Популярные товары скоро появятся</h3>
                <p style={{ opacity: 0.85, margin: '0 0 1rem' }}>
                  Сейчас мы собираем статистику по покупкам. В каталоге уже много отличных предложений.
                </p>
                <Link to="/catalog" className="cta-button">
                  Перейти в каталог <FaArrowRight />
                </Link>
              </div>
            </div>
          ) : (
            <div className="catalog-grid">
              {popularProducts.map((product, i) => {
                const productData = products.find(p => p.id === product.id);
                return (
                  <Reveal key={product.id} type="up" delay={i * 0.05}>
                    <div 
                      className="catalog-card"
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="catalog-card-image">
                        {(() => {
                          if (!productData) return (
                            <span className="catalog-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BrandMark alt={product.title} style={{ height: 64 }} />
                            </span>
                          );
                          const mainImage = getMainImage(productData);
                          if (mainImage?.data) {
                            const resolved = typeof mainImage.data === 'string' ? resolveImageSrc(mainImage.data) : null;
                            if (
                              (typeof mainImage.data === 'string' && mainImage.data.startsWith('data:image')) ||
                              (resolved && isImageUrl(resolved))
                            ) {
                              return (
                                <img
                                  src={resolved || mainImage.data}
                                  alt={product.title}
                                  className="catalog-product-image"
                                />
                              );
                            }
                          }
                          return (
                            <span className="catalog-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BrandMark alt={product.title} style={{ height: 64 }} />
                            </span>
                          );
                        })()}
                      </div>
                      <div className="catalog-card-info">
                        <div className="catalog-card-header">
                          <h3>{product.title}</h3>
                        </div>
                        
                        <div className="catalog-card-price-section">
                          <div className="catalog-card-price">{product.price}</div>
                        </div>
                        
                        <div className="catalog-card-actions">
                          <div className="catalog-card-meta">
                            <span className={productData?.available ? 'in-stock' : 'out-of-stock'}>
                              {productData?.available ? <FaCheckCircle /> : <FaTimesCircle />} {productData?.available ? 'В наличии' : 'Нет в наличии'}
                            </span>
                          </div>
                          <button 
                            className="catalog-card-btn"
                            onClick={(e) => handleAddToCart(productData, e)}
                            disabled={!productData?.available}
                          >
                            <FaShoppingCart /> В корзину
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
