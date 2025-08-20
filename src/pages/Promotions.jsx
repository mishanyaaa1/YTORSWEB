import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGift, 
  FaPercent, 
  FaClock, 
  FaFire,
  FaCalendarAlt,
  FaTag,
  FaArrowRight,
  FaRocket,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { useAdminData } from '../context/AdminDataContext';
import './Promotions.css';
import { getIconForEmoji } from '../utils/iconMap.jsx';

function Promotions() {
  const { promotions: adminPromotions, categories: adminCategories } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Фильтруем только активные акции, которые не истекли
  const activePromotions = adminPromotions.filter(promo => {
    const isActive = promo.active;
    const notExpired = !promo.validUntil || new Date(promo.validUntil) >= new Date();
    return isActive && notExpired;
  });

  // Функция для получения иконки в зависимости от категории
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Двигатель': return getIconForEmoji('⚙️');
      case 'Трансмиссия': return getIconForEmoji('🔧');
      case 'Ходовая часть': return getIconForEmoji('🛠️');
      case 'Электрика': return getIconForEmoji('💡');
      case 'Кабина': return getIconForEmoji('🪑');
      default: return getIconForEmoji('🎯');
    }
  };

  // Используем ТОЛЬКО активные акции из админки
  const promotions = activePromotions.map(promo => ({
    ...promo,
    image: getCategoryIcon(promo.category),
    code: promo.code || `SALE${promo.discount || ''}`,
    minPurchase: promo.minPurchase || 15000,
    validUntil: promo.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));

  const categories = [
    { value: 'all', label: 'Все акции', icon: <FaGift /> },
    ...Object.keys(adminCategories).map(cat => ({
      value: cat,
      label: cat,
      icon: getCategoryIcon(cat)
    }))
  ];

  const filteredPromotions = selectedCategory === 'all' 
    ? promotions 
    : promotions.filter(promo => promo.category === selectedCategory);

  const featuredPromotions = promotions.filter(promo => promo.featured === true);

  const getDaysLeft = (validUntil) => {
    if (!validUntil) return 30; // По умолчанию 30 дней если дата не указана
    const today = new Date();
    const endDate = new Date(validUntil);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return futureDate.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="promotions-page">
      {/* Hero секция */}
      <section className="promotions-hero">
        <div className="container">
          <Reveal type="up">
            <div className="hero-content">
              <h1 className="hero-title">Акции и специальные предложения</h1>
              <p className="hero-subtitle">
                Откройте для себя лучшие цены на качественные запчасти для вездеходов
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <FaRocket className="stat-icon" />
                  <span className="stat-number">{promotions.length}</span>
                  <span className="stat-label">Активных акций</span>
                </div>
                <div className="stat-item">
                  <FaStar className="stat-icon" />
                  <span className="stat-number">до 50%</span>
                  <span className="stat-label">Максимальная скидка</span>
                </div>
                <div className="stat-item">
                  <FaCheckCircle className="stat-icon" />
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Гарантия качества</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Фильтры */}
      <section className="promotions-filters">
        <div className="container">
          <Reveal type="up">
            <div className="filters-container">
              <h2 className="filters-title">Выберите категорию</h2>
              <div className="category-filters">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    className={`category-filter ${selectedCategory === category.value ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-label">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Рекомендуемые акции */}
      {featuredPromotions.length > 0 && (
        <section className="featured-promotions">
          <div className="container">
            <Reveal type="up">
              <h2 className="section-title">Рекомендуемые акции</h2>
              <div className="featured-grid">
                {featuredPromotions.map((promo, index) => (
                  <Reveal key={promo.id} type="up" delay={index * 0.1}>
                    <div className="featured-card">
                      <div className="featured-badge">
                        <FaFire />
                        Рекомендуем
                      </div>
                      <div className="promo-image">
                        {promo.image}
                      </div>
                      <div className="promo-content">
                        <h3 className="promo-title">{promo.title}</h3>
                        <p className="promo-description">{promo.description}</p>
                        <div className="promo-discount">
                          <FaPercent />
                          Скидка {promo.discount}%
                        </div>
                        <div className="promo-conditions">
                          <div className="condition-item">
                            <FaTag />
                            <span>Минимум: {promo.minPurchase.toLocaleString()} ₽</span>
                          </div>
                          <div className="condition-item">
                            <FaClock />
                            <span>До: {formatDate(promo.validUntil)}</span>
                          </div>
                        </div>
                        <Link to="/catalog" className="promo-button">
                          Использовать акцию
                          <FaArrowRight />
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Все акции */}
      <section className="all-promotions">
        <div className="container">
          <Reveal type="up">
            <div className="promotions-header">
              <h2 className="section-title">
                {selectedCategory === 'all' ? 'Все акции' : `Акции в категории "${selectedCategory}"`}
              </h2>
              <p className="promotions-count">
                Найдено {filteredPromotions.length} акций
              </p>
            </div>
          </Reveal>

          {filteredPromotions.length === 0 ? (
            <Reveal type="up">
              <div className="no-promotions">
                <FaGift className="no-promotions-icon" />
                <h3>Акции не найдены</h3>
                <p>В выбранной категории пока нет активных акций</p>
                <button 
                  className="reset-filters-btn"
                  onClick={() => setSelectedCategory('all')}
                >
                  Показать все акции
                </button>
              </div>
            </Reveal>
          ) : (
            <div className="promotions-grid">
              <AnimatePresence>
                {filteredPromotions.map((promo, index) => (
                  <motion.div
                    key={promo.id}
                    className="promotion-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="promo-header">
                      <div className="promo-image">
                        {promo.image}
                      </div>
                      <div className="promo-badges">
                        <div className="discount-badge">
                          -{promo.discount}%
                        </div>
                        {promo.featured && (
                          <div className="featured-badge">
                            <FaFire />
                            Топ
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="promo-body">
                      <h3 className="promo-title">{promo.title}</h3>
                      <p className="promo-description">{promo.description}</p>
                      
                      <div className="promo-details">
                        <div className="detail-item">
                          <FaTag className="detail-icon" />
                          <span>Код: {promo.code}</span>
                        </div>
                        <div className="detail-item">
                          <FaCalendarAlt className="detail-icon" />
                          <span>Действует до: {formatDate(promo.validUntil)}</span>
                        </div>
                        <div className="detail-item">
                          <FaClock className="detail-icon" />
                          <span>Осталось дней: {getDaysLeft(promo.validUntil)}</span>
                        </div>
                        {promo.minPurchase && (
                          <div className="detail-item">
                            <FaGift className="detail-icon" />
                            <span>Минимум покупки: {promo.minPurchase.toLocaleString()} ₽</span>
                          </div>
                        )}
                      </div>

                      <div className="promo-actions">
                        <Link to="/catalog" className="use-promo-btn">
                          Использовать акцию
                          <FaArrowRight />
                        </Link>
                        <div className="promo-timer">
                          <FaClock />
                          <span>Осталось: {getDaysLeft(promo.validUntil)} дн.</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Информация об акциях */}
      <section className="promotions-info">
        <div className="container">
          <Reveal type="up">
            <div className="info-content">
              <h2 className="info-title">Как использовать акции?</h2>
              <div className="info-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <h3>Выберите акцию</h3>
                  <p>Просмотрите доступные акции и выберите подходящую для вашей покупки</p>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <h3>Добавьте товары в корзину</h3>
                  <p>Выберите товары из соответствующей категории и добавьте их в корзину</p>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <h3>Скидка применится автоматически</h3>
                  <p>При достижении минимальной суммы покупки скидка применится автоматически</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default Promotions;
