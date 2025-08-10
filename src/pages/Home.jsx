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
import './Home.css';

function Home() {
  const HERO_IMAGE_URL = 'https://images.pexels.com/photos/162553/engine-displacement-piston-162553.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const { products, popularProductIds } = useAdminData();
  
  // wishlist removed
  
  const features = [
    {
      icon: <FaTruck />,
      title: "Оперативная логистика",
      text: "Доставка компонентов по всей территории РФ в минимальные сроки"
    },
    {
      icon: <FaTools />,
      title: "Премиум компоненты",
      text: "Исключительно оригинальные и сертифицированные запчасти от проверенных поставщиков"
    },
    {
      icon: <FaShieldAlt />,
      title: "Гарантийное обслуживание",
      text: "Комплексная гарантия на всю продукцию с профессиональной поддержкой"
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
              <h1>B2B поставки запчастей для вездеходов</h1>
              <p>
                Профессиональные решения для бизнеса: качественные компоненты для всех типов вездеходов. 
                Оптимизированная логистика по РФ. Полная гарантия и поддержка.
              </p>
              <Link to="/catalog" className="cta-button">
                Просмотреть каталог
                <FaArrowRight />
              </Link>
            </div>
            <div className="hero-image">
              <div className="hero-placeholder">
                <HeroVisual />
              </div>
              <p>Надежные компоненты для вашего бизнеса</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Преимущества сотрудничества</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="products popular-products">
        <div className="container">
          <h2 className="section-title">Популярные позиции</h2>

          {popularProducts.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(224,224,224,0.1)',
                background: 'linear-gradient(180deg, rgba(224,224,224,0.04), rgba(224,224,224,0.02))',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '2.2rem', color: '#1e88e5', marginBottom: '0.5rem' }}>
                  <FaStar style={{ verticalAlign: 'middle' }} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem' }}>Популярные позиции в разработке</h3>
                <p style={{ opacity: 0.85, margin: '0 0 1rem' }}>
                  Мы анализируем спрос. В каталоге доступны профессиональные решения.
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
                    <div className="min-purchase">Стоимость: {product.price}</div>
                    <div className="promo-link">
                      Детали <FaArrowRight />
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
