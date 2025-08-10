import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTruck, 
  FaTools, 
  FaShieldAlt, 
  FaArrowRight,
  FaStar,
  FaUsers,
  FaBox,
  FaAward,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAdminData } from '../context/AdminDataContext';
// wishlist removed
import { getMainImage, isImageUrl } from '../utils/imageHelpers';
import HeroVisual from '../components/HeroVisual';
import './Home.css';

function Home() {
  const HERO_IMAGE_URL = 'https://images.pexels.com/photos/162553/engine-displacement-piston-162553.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const { products, popularProductIds } = useAdminData();
  
  // wishlist removed
  
  const features = [
    {
      icon: <FaTruck />,
      title: "Быстрая доставка",
      text: "Доставляем запчасти по всей России в кратчайшие сроки",
      color: "var(--primary-color)"
    },
    {
      icon: <FaTools />,
      title: "Качественные детали",
      text: "Только оригинальные и сертифицированные запчасти",
      color: "var(--secondary-color)"
    },
    {
      icon: <FaShieldAlt />,
      title: "Гарантия качества",
      text: "Полная гарантия на все товары и профессиональная поддержка",
      color: "var(--accent-color)"
    }
  ];

  const stats = [
    { icon: <FaUsers />, number: "5000+", label: "Довольных клиентов", color: "var(--primary-color)" },
    { icon: <FaBox />, number: "15000+", label: "Товаров в каталоге", color: "var(--secondary-color)" },
    { icon: <FaAward />, number: "15+", label: "Лет на рынке", color: "var(--accent-color)" },
    { icon: <FaMapMarkerAlt />, number: "89", label: "Регионов доставки", color: "var(--primary-color)" }
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

  // Отладочная информация
  console.log('Home: popularProductIds:', popularProductIds);
  console.log('Home: products:', products);
  console.log('Home: popularProducts:', popularProducts);

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
              <div className="hero-badge">
                <FaStar /> Лучшие цены на рынке
              </div>
              <h1>Запчасти для вездеходов</h1>
              <p>
                Качественные запчасти для всех типов вездеходов. 
                Быстрая доставка по всей России. Гарантия качества на все товары.
              </p>
              <div className="hero-actions">
                <Link to="/catalog" className="cta-button primary">
                  Перейти в каталог
                  <FaArrowRight />
                </Link>
                <Link to="/about" className="cta-button secondary">
                  О компании
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-placeholder">
                <HeroVisual />
              </div>
              <p>Надёжные запчасти для вашего вездехода</p>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{'--stat-color': stat.color}}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Почему выбирают нас</h2>
            <p className="section-subtitle">Мы обеспечиваем качество и надёжность на каждом этапе</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{'--feature-color': feature.color}}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="advantages-section">
        <div className="container">
          <div className="advantages-content">
            <div className="advantages-text">
              <h2>Профессиональный подход</h2>
              <p>Мы понимаем важность каждой детали для вашего вездехода. Наша команда экспертов поможет подобрать именно то, что нужно.</p>
              <div className="advantages-list">
                <div className="advantage-item">
                  <FaClock />
                  <span>Быстрая обработка заказов</span>
                </div>
                <div className="advantage-item">
                  <FaShieldAlt />
                  <span>Гарантия на все товары</span>
                </div>
                <div className="advantage-item">
                  <FaTruck />
                  <span>Доставка по всей России</span>
                </div>
              </div>
            </div>
            <div className="advantages-visual">
              <div className="advantages-placeholder">
                <FaTools style={{fontSize: '4rem', color: 'var(--primary-color)'}} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="products popular-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Популярные товары</h2>
            <p className="section-subtitle">Товары, которые выбирают наши клиенты</p>
          </div>

          {/* Отладочная информация */}
          <div style={{background: '#f0f0f0', padding: '1rem', margin: '1rem 0', borderRadius: '8px', fontSize: '12px'}}>
            <strong>Отладка:</strong><br/>
            popularProductIds: {JSON.stringify(popularProductIds)}<br/>
            products count: {products.length}<br/>
            popularProducts count: {popularProducts.length}<br/>
            <button 
              onClick={() => {
                console.log('localStorage adminProducts:', localStorage.getItem('adminProducts'));
                console.log('localStorage adminPopularProducts:', localStorage.getItem('adminPopularProducts'));
                console.log('localStorage adminCategories:', localStorage.getItem('adminCategories'));
                console.log('localStorage adminBrands:', localStorage.getItem('adminBrands'));
                console.log('localStorage adminPromotions:', localStorage.getItem('adminPromotions'));
                console.log('localStorage adminAbout:', localStorage.getItem('adminAbout'));
              }}
              style={{margin: '0.5rem 0', padding: '0.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
            >
              Проверить localStorage
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('adminProducts');
                localStorage.removeItem('adminPopularProducts');
                localStorage.removeItem('adminCategories');
                localStorage.removeItem('adminBrands');
                localStorage.removeItem('adminPromotions');
                localStorage.removeItem('adminAbout');
                window.location.reload();
              }}
              style={{margin: '0.5rem 0.5rem', padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px'}}
            >
              Очистить localStorage
            </button>
            <button 
              onClick={() => {
                console.log('=== ДЕТАЛЬНАЯ ОТЛАДКА ===');
                console.log('popularProductIds:', popularProductIds);
                console.log('products:', products);
                console.log('popularProducts:', popularProducts);
                
                // Проверяем каждый ID популярного товара
                popularProductIds.forEach(id => {
                  const found = products.find(p => p.id === id);
                  console.log(`ID ${id}: ${found ? `НАЙДЕН - ${found.title}` : 'НЕ НАЙДЕН'}`);
                });
              }}
              style={{margin: '0.5rem 0', padding: '0.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px'}}
            >
              Детальная отладка
            </button>
            <button 
              onClick={() => {
                console.log('=== СОСТОЯНИЕ ДАННЫХ ===');
                console.log('Context products:', products);
                console.log('Context popularProductIds:', popularProductIds);
                console.log('Computed popularProducts:', popularProducts);
                
                // Проверяем, есть ли товары с нужными ID
                const foundProducts = popularProductIds.map(id => {
                  const product = products.find(p => p.id === id);
                  return { id, found: !!product, product };
                });
                console.log('Found products analysis:', foundProducts);
              }}
              style={{margin: '0.5rem 0', padding: '0.5rem', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px'}}
            >
              Анализ данных
            </button>
          </div>

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
            <div className="promotions-grid">
              {popularProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="promotion-card">
                  {/* Отладочная информация для товара */}
                  <div style={{background: '#ffeb3b', padding: '0.5rem', margin: '-1.5rem -1.5rem 1rem -1.5rem', borderRadius: '15px 15px 0 0', fontSize: '10px'}}>
                    ID: {product.id}, Title: {product.title}
                  </div>
                  
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

      {/* CTA секция */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Готовы начать?</h2>
            <p>Переходите в каталог и найдите нужные запчасти для вашего вездехода</p>
            <Link to="/catalog" className="cta-button large">
              Открыть каталог
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
