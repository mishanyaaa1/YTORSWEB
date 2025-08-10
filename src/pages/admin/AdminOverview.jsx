import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBox, 
  FaPercent, 
  FaShoppingCart,
  FaUsers,
  FaRuble,
  FaChartLine,
  FaEye,
  FaPlus
} from 'react-icons/fa';
import './AdminOverview.css';

function AdminOverview() {
  // Моковые данные для статистики
  const stats = [
    {
      icon: <FaBox />,
      label: 'Товары',
      value: '6',
      color: '#00ff88',
      link: '/admin/dashboard/products'
    },
    {
      icon: <FaPercent />,
      label: 'Акции',
      value: '3',
      color: '#ff9800',
      link: '/admin/dashboard/promotions'
    },
    {
      icon: <FaShoppingCart />,
      label: 'Заказы',
      value: '12',
      color: '#2196f3',
      link: '/admin/dashboard/orders'
    },
    {
      icon: <FaUsers />,
      label: 'Клиенты',
      value: '45',
      color: '#9c27b0',
      link: '/admin/dashboard/customers'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'order',
      message: 'Новый заказ #1023',
      time: '2 минуты назад',
      status: 'new'
    },
    {
      id: 2,
      type: 'product',
      message: 'Товар "Гусеницы" обновлен',
      time: '15 минут назад',
      status: 'updated'
    },
    {
      id: 3,
      type: 'promotion',
      message: 'Акция "Скидка 20%" активирована',
      time: '1 час назад',
      status: 'active'
    }
  ];

  const quickActions = [
    {
      icon: <FaPlus />,
      label: 'Добавить товар',
      link: '/admin/dashboard/products/new',
      color: '#00ff88'
    },
    {
      icon: <FaPercent />,
      label: 'Создать акцию',
      link: '/admin/dashboard/promotions/new',
      color: '#ff9800'
    },
    {
      icon: <FaEye />,
      label: 'Посмотреть сайт',
      link: '/',
      color: '#2196f3',
      external: true
    }
  ];

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h2>Обзор системы</h2>
        <p>Добро пожаловать в панель управления сайтом</p>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Link to={stat.link} className="stat-link">
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="overview-content">
        {/* Быстрые действия */}
        <motion.div 
          className="quick-actions"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3>Быстрые действия</h3>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="action-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {action.external ? (
                  <a 
                    href={action.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link"
                  >
                    <div className="action-icon" style={{ color: action.color }}>
                      {action.icon}
                    </div>
                    <span>{action.label}</span>
                  </a>
                ) : (
                  <Link to={action.link} className="action-link">
                    <div className="action-icon" style={{ color: action.color }}>
                      {action.icon}
                    </div>
                    <span>{action.label}</span>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Последняя активность */}
        <motion.div 
          className="recent-activity"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3>Последняя активность</h3>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-info">
                  <div className="activity-message">{activity.message}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
                <div className={`activity-status ${activity.status}`}>
                  {activity.status === 'new' && '🆕'}
                  {activity.status === 'updated' && '📝'}
                  {activity.status === 'active' && '🟢'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Полезные ссылки */}
      <motion.div 
        className="helpful-links"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3>Полезная информация</h3>
        <div className="links-grid">
          <div className="info-card">
            <h4>🚀 Управление товарами</h4>
            <p>Добавляйте, редактируйте и удаляйте товары в каталоге</p>
            <Link to="/admin/dashboard/products">Перейти к товарам</Link>
          </div>
          <div className="info-card">
            <h4>🎯 Управление акциями</h4>
            <p>Создавайте привлекательные предложения для клиентов</p>
            <Link to="/admin/dashboard/promotions">Перейти к акциям</Link>
          </div>
          <div className="info-card">
            <h4>📝 Управление контентом</h4>
            <p>Редактируйте тексты и информацию на сайте</p>
            <Link to="/admin/dashboard/content">Перейти к контенту</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminOverview;
