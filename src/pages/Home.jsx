import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaTruck, 
  FaTools, 
  FaShieldAlt, 
  FaArrowRight,
  FaStar,
  FaRocket,
  FaCog,
  FaLightbulb
} from 'react-icons/fa';
import { useAdminData } from '../context/AdminDataContext';
import { getMainImage, isImageUrl, resolveImageSrc } from '../utils/imageHelpers';
import BrandMark from '../components/BrandMark';
import HeroVisual from '../components/HeroVisual';
import { getIconForEmoji } from '../utils/iconMap.jsx';
import Reveal from '../components/Reveal';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const HERO_IMAGE_URL = 'https://images.pexels.com/photos/162553/engine-displacement-piston-162553.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const { products, popularProductIds, aboutContent } = useAdminData();
  
  const features = [
    {
      icon: <FaRocket />,
      title: "Молниеносная доставка",
      text: "Доставляем запчасти по всей России в течение 24-48 часов"
    },
    {
      icon: <FaCog />,
      title: "Премиум качество",
      text: "Только оригинальные и сертифицированные запчасти от ведущих производителей"
    },
    {
      icon: <FaLightbulb />,
      title: "Экспертная поддержка",
      text: "24/7 консультации от опытных специалистов и полная гарантия на все товары"
    }
  ];

  // Получаем популярные товары из контекста по ID
  const popularProducts = popularProductIds
    .map(id => products.find(product => product.id === id))
    .filter(product => product)
    .map(product => ({
      id: product.id,
      title: product.title,
      price: `${product.price.toLocaleString()} ₽`,
      icon: getMainImage(product)?.data
    }));

  return (
    <div>
      {/* Hero секция с современным дизайном */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                {aboutContent?.homeHero?.title || 'Запчасти для вездеходов'}
              </h1>
              <p>
                {aboutContent?.homeHero?.description || 'Инновационные решения для вашего вездехода. Качественные запчасти, быстрая доставка и экспертная поддержка 24/7.'}
              </p>
              <div className="hero-cta-group">
                <Link to={aboutContent?.homeHero?.ctaLink || '/catalog'} className="cta-button">
                  {aboutContent?.homeHero?.ctaText || 'Исследовать каталог'}
                  <FaArrowRight />
                </Link>
                <Link
                  to="/about#contacts"
                  className="cta-button secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/about#contacts');
                    setTimeout(() => {
                      const el = document.getElementById('contacts');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                >
                  Связаться с экспертом
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-placeholder">
                {aboutContent?.homeHero?.visualImage ? (
                  <img src={aboutContent.homeHero.visualImage} alt="Визуальный блок" className="hero-visual" />
                ) : (
                  <HeroVisual />
                )}
              </div>
              <p>{aboutContent?.homeHero?.imageCaption || 'Инновационные решения для вашего вездехода'}</p>
              {(aboutContent?.homeHero?.visualButtons || []).map((btn, i) => (
                <Link key={i} to={btn.link || '/catalog'} className="cta-button" style={{ marginTop: '1rem', marginRight: '0.5rem', display: 'inline-flex' }}>
                  {btn.text || 'Подробнее'}
                  <FaArrowRight />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Секция преимуществ с 3D эффектами */}
      <section className="features">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Почему выбирают нас</h2>
          </Reveal>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Reveal key={index} type="up" delay={index * 0.2}>
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

      {/* Секция популярных товаров */}
      <section className="products popular-products">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Популярные товары</h2>
          </Reveal>

          {popularProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FaStar />
              </div>
              <h3>Популярные товары скоро появятся</h3>
              <p>
                Сейчас мы собираем статистику по покупкам. В каталоге уже много отличных предложений.
              </p>
              <Link to="/catalog" className="cta-button">
                Перейти в каталог <FaArrowRight />
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {popularProducts.map((product, i) => (
                <Reveal key={product.id} type="up" delay={i * 0.1}>
                  <div className="product-card">
                    <div className="product-image">
                      {(() => {
                        const productData = products.find(p => p.id === product.id);
                        if (!productData) return (
                          <span className="product-icon">
                            <BrandMark alt={product.title} style={{ height: 48 }} />
                          </span>
                        );
                        const mainImage = getMainImage(productData);
                        if (mainImage?.data) {
                          const resolved = typeof mainImage.data === 'string' ? resolveImageSrc(mainImage.data) : null;
                          if (
                            (typeof mainImage.data === 'string' && mainImage.data.startsWith('data:image')) ||
                            resolved
                          ) {
                            return (
                              <img
                                src={resolved || mainImage.data}
                                alt={product.title}
                                className="product-image-img"
                              />
                            );
                          }
                          return (
                            <span className="product-icon">
                              <BrandMark alt={product.title} style={{ height: 48 }} />
                            </span>
                          );
                        }
                        return (
                          <span className="product-icon">
                            <BrandMark alt={product.title} style={{ height: 48 }} />
                          </span>
                        );
                      })()}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.title}</h3>
                      <div className="product-price">{product.price}</div>
                      <Link to={`/product/${product.id}`} className="product-button">
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
