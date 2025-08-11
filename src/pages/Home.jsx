import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTruck, 
  FaTools, 
  FaShieldAlt, 
  FaArrowRight,
  FaStar
} from 'react-icons/fa';
import { useAdminData } from '../context/AdminDataContext';
// wishlist removed
import { getMainImage, isImageUrl } from '../utils/imageHelpers';
import HeroVisual from '../components/HeroVisual';
import { getIconForEmoji } from '../utils/iconMap.jsx';
import './Home.css';

function Home() {
  const HERO_IMAGE_URL = 'https://images.pexels.com/photos/162553/engine-displacement-piston-162553.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const { products, popularProductIds, aboutContent } = useAdminData();
  
  // wishlist removed
  
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
      icon: getMainImage(product)?.data || '📦'
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
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>{aboutContent?.homeHero?.title || 'Запчасти для вездеходов'}</h1>
              <p>{aboutContent?.homeHero?.description || 'Качественные запчасти для всех типов вездеходов. Быстрая доставка по всей России. Гарантия качества на все товары.'}</p>
              <Link to={aboutContent?.homeHero?.ctaLink || '/catalog'} className="cta-button">
                {aboutContent?.homeHero?.ctaText || 'Перейти в каталог'}
                <FaArrowRight />
              </Link>
            </div>
            <div className="hero-image">
              <div className="hero-placeholder">
                {aboutContent?.homeHero?.visualImage ? (
                  <img src={aboutContent.homeHero.visualImage} alt="Визуальный блок" className="hero-visual" />
                ) : (
                  <HeroVisual />
                )}
              </div>
              <p>{aboutContent?.homeHero?.imageCaption || 'Надёжные запчасти для вашего вездехода'}</p>
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

      <section className="features">
        <div className="container">
          <h2 className="section-title">Почему выбирают нас</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {typeof feature.icon === 'string' ? getIconForEmoji(feature.icon) : feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="products popular-products">
        <div className="container">
          <h2 className="section-title">Популярные товары</h2>

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
            <div className="promotions-grid">
              {popularProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="promotion-card">
                  <div className="promo-header">
                    <div className="promo-image-small">
                      {(() => {
                        const productData = products.find(p => p.id === product.id);
                        if (!productData) return <span className="promo-icon">{product.icon}</span>;
                        const mainImage = getMainImage(productData);
                        if (mainImage?.data) {
                          if (
                            typeof mainImage.data === 'string' &&
                            (mainImage.data.startsWith('data:image') || isImageUrl(mainImage.data))
                          ) {
                            return (
                              <img
                                src={mainImage.data}
                                alt={product.title}
                                className="product-image-img"
                                style={{ borderRadius: '8px' }}
                              />
                            );
                          }
                          return <span className="promo-icon">{mainImage.data}</span>;
                        }
                        return <span className="promo-icon">{product.icon}</span>;
                      })()}
                    </div>
                  </div>
                  <div className="promo-info">
                    <h3>{product.title}</h3>
                    <div className="min-purchase">Цена: {product.price}</div>
                    <div className="promo-link">
                      Подробнее <FaArrowRight />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
