import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGift, 
  FaPercent, 
  FaClock, 
  FaFire,
  FaCalendarAlt,
  FaTag,
  FaArrowRight
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

  // Убираем демо-акции: показываем только то, что задано в админке

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
              <h1>Акции и специальные предложения</h1>
              <p>
                Выгодные предложения на качественные запчасти для вездеходов. 
                Не упустите возможность сэкономить!
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Горячие предложения */}
      <section className="featured-promotions">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            🔥 Горячие предложения
          </motion.h2>
          
          <div className="featured-grid">
            {featuredPromotions.length === 0 ? (
              <div className="no-promotions featured-empty">
                <div className="empty-icon">🔥</div>
                <h3>Пока нет горячих предложений</h3>
                <p>Но мы готовим для вас отличные акции!</p>
                <small>Следите за обновлениями</small>
              </div>
            ) : (
              featuredPromotions.map((promo, index) => (
              <motion.div 
                key={promo.id}
                className="featured-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="featured-badge">
                  <FaFire /> ХИТ
                </div>
                
                <div className="promo-image">
                  <span className="promo-icon">{promo.image}</span>
                </div>
                
                <div className="promo-content">
                  <h3>{promo.title}</h3>
                  <p>{promo.description}</p>
                  
                  {promo.discount && (
                    <div className="discount-badge">
                      -{promo.discount}%
                    </div>
                  )}
                  
                  <div className="promo-details">
                    <div className="promo-expires">
                      <FaCalendarAlt /> До {formatDate(promo.validUntil)}
                    </div>
                    
                    <div className="days-left">
                      Осталось: {getDaysLeft(promo.validUntil)} дней
                    </div>
                  </div>
                  
                  <Link to="/catalog" className="promo-button">
                    Воспользоваться <FaArrowRight />
                  </Link>
                </div>
              </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Все акции */}
      <section className="all-promotions">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Все актуальные акции
          </motion.h2>
          
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              className="promotions-grid"
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredPromotions.length === 0 ? (
                <div className="no-promotions category-empty">
                  {selectedCategory === 'all' ? (
                    <div className="empty-content">
                      <div className="empty-icon">🎁</div>
                      <h3>Акций пока нет</h3>
                      <p>В данный момент нет активных акций</p>
                      <small>Но мы готовим отличные предложения для вас!</small>
                    </div>
                  ) : (
                    <div className="empty-content">
                      <div className="empty-icon">📦</div>
                      <h3>Пусто в категории</h3>
                      <p>В категории <strong>"{categories.find(c => c.value === selectedCategory)?.label}"</strong> пока нет активных акций</p>
                      <button 
                        className="view-all-btn" 
                        onClick={() => setSelectedCategory('all')}
                      >
                        Посмотреть все акции
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredPromotions.map((promo, index) => (
                <motion.div 
                  key={promo.id}
                  className="promotion-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="promo-header">
                    <div className="promo-image-small">
                      <span className="promo-icon">{promo.image}</span>
                    </div>
                    
                    {promo.discount && (
                      <div className="discount-badge-small">
                        -{promo.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="promo-info">
                    <h3>{promo.title}</h3>
                    <p>{promo.description}</p>
                    
                    <div className="promo-meta">
                      <div className="promo-expires-small">
                        <FaClock /> {getDaysLeft(promo.validUntil)} дней
                      </div>
                    </div>
                    
                    <div className="min-purchase">
                      Минимальная сумма: {promo.minPurchase.toLocaleString()} ₽
                    </div>
                    
                    <Link to="/catalog" className="promo-link">
                      Перейти в каталог <FaArrowRight />
                    </Link>
                  </div>
                </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Как воспользоваться */}
      <section className="how-to-use">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Как воспользоваться акцией
          </motion.h2>
          
          <div className="steps-grid">
            <motion.div 
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="step-number">1</div>
              <h3>Выберите товары</h3>
              <p>Добавьте нужные запчасти в корзину</p>
            </motion.div>
            
            <motion.div 
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="step-number">2</div>
              <h3>Оформите заказ</h3>
              <p>Перейдите в корзину и оформите заказ</p>
            </motion.div>
            
            <motion.div 
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="step-number">3</div>
              <h3>Получите скидку</h3>
              <p>Скидка применится автоматически при достижении минимальной суммы</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Promotions;
