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
import { useAdminData } from '../context/AdminDataContext';
import './Promotions.css';

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
      case 'Двигатель': return '⚙️';
      case 'Трансмиссия': return '🔧';
      case 'Ходовая часть': return '🛠️';
      case 'Электрика': return '💡';
      case 'Кабина': return '🪑';
      default: return '🎯';
    }
  };

  // Используем ТОЛЬКО активные акции из админки
  const promotions = activePromotions.map(promo => ({
    ...promo,
    image: getCategoryIcon(promo.category),
    code: promo.code || `PROMO${promo.discount || ''}`,
    minPurchase: promo.minPurchase || 20000,
    validUntil: promo.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));

  const categories = [
    { value: 'all', label: 'Все предложения', icon: <FaGift /> },
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
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Специальные предложения для бизнеса</h1>
            <p>
              Оптимизированные акции на компоненты для вездеходов. 
              Максимальная выгода для корпоративных клиентов.
            </p>
          </motion.div>
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
            🔥 Эксклюзивные предложения
          </motion.h2>
          
          <div className="featured-grid">
            {featuredPromotions.length === 0 ? (
              <div className="no-promotions featured-empty">
                <div className="empty-icon">🔥</div>
                <h3>Эксклюзивы в разработке</h3>
                <p>Подготавливаем персонализированные предложения</p>
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
                  whileHover={{ y: -5 }}
                >
                  <div className="featured-badge">
                    <FaFire /> VIP
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
                      <div className="promo-code">
                        <FaTag /> Код: <strong>{promo.code}</strong>
                      </div>
                      
                      <div className="promo-expires">
                        <FaCalendarAlt /> До {formatDate(promo.validUntil)}
                      </div>
                      
                      <div className="days-left">
                        Срок: {getDaysLeft(promo.validUntil)} дней
                      </div>
                    </div>
                    
                    <Link to="/catalog" className="promo-button">
                      Применить <FaArrowRight />
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
            Актуальные предложения
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
                      <h3>Предложений нет</h3>
                      <p>В данный момент активных предложений нет</p>
                      <small>Мы разрабатываем новые</small>
                    </div>
                  ) : (
                    <div className="empty-content">
                      <div className="empty-icon">📦</div>
                      <h3>Пусто в разделе</h3>
                      <p>В разделе <strong>"{categories.find(c => c.value === selectedCategory)?.label}"</strong> нет активных предложений</p>
                      <button 
                        className="view-all-btn" 
                        onClick={() => setSelectedCategory('all')}
                      >
                        Все предложения
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
                    whileHover={{ y: -3 }}
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
                        <div className="promo-code-small">
                          <FaTag /> {promo.code}
                        </div>
                        
                        <div className="promo-expires-small">
                          <FaClock /> {getDaysLeft(promo.validUntil)} дней
                        </div>
                      </div>
                      
                      <div className="min-purchase">
                        Мин. сумма: {promo.minPurchase.toLocaleString()} ₽
                      </div>
                      
                      <Link to="/catalog" className="promo-link">
                        Применить <FaArrowRight />
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
            Как активировать предложение
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
              <h3>Выберите позиции</h3>
              <p>Добавьте необходимые компоненты в корзину</p>
            </motion.div>
            
            <motion.div 
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="step-number">2</div>
              <h3>Введите код</h3>
              <p>Укажите промокод при оформлении</p>
            </motion.div>
            
            <motion.div 
              className="step-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="step-number">3</div>
              <h3>Получите выгоду</h3>
              <p>Скидка применится автоматически</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Promotions;
