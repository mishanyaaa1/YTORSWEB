import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaTools, FaShieldAlt } from 'react-icons/fa';
import { useAdminData } from '../context/AdminDataContext';
import { getMainImage } from '../utils/imageHelpers';
import HeroVisual from '../components/HeroVisual';
import './Home.css';

function Home() {
  const { products, popularProductIds } = useAdminData();

  const features = [
    {
      icon: <FaTruck />,
      title: "Быстрая доставка",
      text: "Доставляем запчасти по всей России в кратчайшие сроки."
    },
    {
      icon: <FaTools />,
      title: "Качественные детали",
      text: "Только оригинальные и сертифицированные запчасти от проверенных производителей."
    },
    {
      icon: <FaShieldAlt />,
      title: "Гарантия качества",
      text: "Предоставляем полную гарантию на все товары и оказываем профессиональную поддержку."
    }
  ];

  const popularProducts = popularProductIds
    .map(id => products.find(product => product.id === id))
    .filter(Boolean);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Надежные запчасти для вашего вездехода</h1>
              <p>
                Мы предлагаем широкий ассортимент качественных запчастей для всех типов вездеходов. 
                Быстрая доставка, гарантия и профессиональный подбор.
              </p>
              <Link to="/catalog" className="cta-button">
                Перейти в каталог
              </Link>
            </div>
            <div className="hero-visual-wrapper">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Почему выбирают нас</h2>
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

      <section className="section">
        <div className="container">
          <h2 className="section-title">Популярные товары</h2>
          {popularProducts.length > 0 ? (
            <div className="products-grid">
              {popularProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                  <div className="product-card">
                    <div className="product-image">
                      <img 
                        src={getMainImage(product)?.data || './placeholder.png'} 
                        alt={product.title}
                        className="product-image-img"
                      />
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.title}</h3>
                      <p className="product-price">{product.price.toLocaleString()} ₽</p>
                      <span className="product-button">
                        Подробнее
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="placeholder-message">
              <h3>Популярные товары скоро появятся</h3>
              <p>Мы анализируем спрос, чтобы предложить вам лучшее. А пока загляните в наш каталог.</p>
              <Link to="/catalog" className="cta-button">
                Весь каталог
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
