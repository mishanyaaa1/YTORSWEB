import React, { useState, useEffect } from 'react';
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
  FaPlus,
  FaTrendingUp,
  FaTrendingDown,
  FaClock,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaCog,
  FaFileAlt
} from 'react-icons/fa';
import './AdminOverview.css';

function AdminOverview() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Моковые данные для статистики
  const stats = [
    {
      icon: <FaBox />,
      label: 'Товары',
      value: '6',
      change: '+2',
      changeType: 'up',
      color: '#00ff88',
      link: '/admin/dashboard/products'
    },
    {
      icon: <FaPercent />,
      label: 'Акции',
      value: '3',
      change: '+1',
      changeType: 'up',
      color: '#ff9800',
      link: '/admin/dashboard/promotions'
    },
    {
      icon: <FaShoppingCart />,
      label: 'Заказы',
      value: '12',
      change: '+5',
      changeType: 'up',
      color: '#2196f3',
      link: '/admin/dashboard/orders'
    },
    {
      icon: <FaUsers />,
      label: 'Клиенты',
      value: '45',
      change: '+8',
      changeType: 'up',
      color: '#9c27b0',
      link: '/admin/dashboard/customers'
    }
  ];

  const performanceMetrics = [
    {
      label: 'Скорость загрузки',
      value: '2.3с',
      status: 'excellent',
      icon: <FaTrendingUp />
    },
    {
      label: 'Доступность',
      value: '99.9%',
      status: 'excellent',
      icon: <FaShieldAlt />
    },
    {
      label: 'SEO Score',
      value: '92/100',
      status: 'good',
      icon: <FaStar />
    },
    {
      label: 'Мобильная версия',
      value: '95/100',
      status: 'excellent',
      icon: <FaTrendingUp />
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'order',
      message: 'Новый заказ #1023',
      time: '2 минуты назад',
      status: 'new',
      priority: 'high'
    },
    {
      id: 2,
      type: 'product',
      message: 'Товар "Гусеницы" обновлен',
      time: '15 минут назад',
      status: 'updated',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'promotion',
      message: 'Акция "Скидка 20%" активирована',
      time: '1 час назад',
      status: 'active',
      priority: 'low'
    },
    {
      id: 4,
      type: 'user',
      message: 'Новый пользователь зарегистрирован',
      time: '2 часа назад',
      status: 'new',
      priority: 'medium'
    }
  ];

  const quickActions = [
    {
      icon: <FaPlus />,
      label: 'Добавить товар',
      link: '/admin/dashboard/products/new',
      color: '#00ff88',
      description: 'Создать новый товар в каталоге'
    },
    {
      icon: <FaPercent />,
      label: 'Создать акцию',
      link: '/admin/dashboard/promotions/new',
      color: '#ff9800',
      description: 'Запустить новую акцию'
    },
    {
      icon: <FaEye />,
      label: 'Посмотреть сайт',
      link: '/',
      color: '#2196f3',
      external: true,
      description: 'Открыть сайт в новой вкладке'
    },
    {
      icon: <FaCog />,
      label: 'Настройки',
      link: '/admin/dashboard/settings',
      color: '#9c27b0',
      description: 'Настройки системы'
    }
  ];

  const systemInfo = {
    uptime: '15 дней',
    lastBackup: '2 часа назад',
    diskUsage: '45%',
    memoryUsage: '32%',
    version: '2.1.0'
  };

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <div className="header-content">
          <div>
            <h2>Обзор системы</h2>
            <p>Добро пожаловать в панель управления сайтом ЮТОРС</p>
          </div>
          <div className="header-time">
            <FaClock />
            <span>{currentTime.toLocaleTimeString('ru-RU')}</span>
            <span className="date">{currentTime.toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
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
                <div className={`stat-change ${stat.changeType}`}>
                  {stat.changeType === 'up' ? <FaTrendingUp /> : <FaTrendingDown />}
                  {stat.change}
                </div>
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
                    <div className="action-content">
                      <span className="action-label">{action.label}</span>
                      <span className="action-description">{action.description}</span>
                    </div>
                  </a>
                ) : (
                  <Link to={action.link} className="action-link">
                    <div className="action-icon" style={{ color: action.color }}>
                      {action.icon}
                    </div>
                    <div className="action-content">
                      <span className="action-label">{action.label}</span>
                      <span className="action-description">{action.description}</span>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Производительность системы */}
        <motion.div 
          className="performance-metrics"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3>Производительность системы</h3>
          <div className="metrics-grid">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className={`metric-card ${metric.status}`}>
                <div className="metric-icon">{metric.icon}</div>
                <div className="metric-info">
                  <div className="metric-label">{metric.label}</div>
                  <div className="metric-value">{metric.value}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Последняя активность */}
        <motion.div 
          className="recent-activity"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3>Последняя активность</h3>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className={`activity-item priority-${activity.priority}`}>
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

      {/* Информация о системе */}
      <motion.div 
        className="system-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3>Информация о системе</h3>
        <div className="system-grid">
          <div className="system-card">
            <h4>🖥️ Система</h4>
            <div className="system-item">
              <span>Версия:</span>
              <span>{systemInfo.version}</span>
            </div>
            <div className="system-item">
              <span>Время работы:</span>
              <span>{systemInfo.uptime}</span>
            </div>
            <div className="system-item">
              <span>Последний бэкап:</span>
              <span>{systemInfo.lastBackup}</span>
            </div>
          </div>
          <div className="system-card">
            <h4>💾 Ресурсы</h4>
            <div className="system-item">
              <span>Диск:</span>
              <span className={`usage ${systemInfo.diskUsage > 80 ? 'warning' : 'normal'}`}>
                {systemInfo.diskUsage}
              </span>
            </div>
            <div className="system-item">
              <span>Память:</span>
              <span className={`usage ${systemInfo.memoryUsage > 80 ? 'warning' : 'normal'}`}>
                {systemInfo.memoryUsage}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Полезные ссылки */}
      <motion.div 
        className="helpful-links"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
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
          <div className="info-card">
            <h4>📊 Аналитика</h4>
            <p>Отслеживайте статистику и производительность</p>
            <Link to="/admin/dashboard/analytics">Перейти к аналитике</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminOverview;
