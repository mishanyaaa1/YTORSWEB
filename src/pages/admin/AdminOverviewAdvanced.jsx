import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBox, 
  FaPercent, 
  FaShoppingCart,
  FaUsers,
  FaRuble,
  FaChartLine,
  FaEye,
  FaPlus,
  FaTags,
  FaFileAlt
} from 'react-icons/fa';
import { useAdminData } from '../../context/AdminDataContext';
import './AdminOverviewAdvanced.css';

function AdminOverviewAdvanced() {
  const { data } = useAdminData();

  // Подсчёт статистики
  const stats = [
    {
      icon: <FaTags />,
      label: 'Категории',
      value: Object.keys(data.categoryStructure).length,
      color: '#9c27b0',
      link: '/admin/dashboard/categories'
    },
    {
      icon: <FaBox />,
      label: 'Товары',
      value: data.products.length,
      color: '#00ff88',
      link: '/admin/dashboard/products'
    },
    {
      icon: <FaPercent />,
      label: 'Акции',
      value: data.promotions.length,
      color: '#ff9800',
      link: '/admin/dashboard/promotions'
    },
    {
      icon: <FaShoppingCart />,
      label: 'В наличии',
      value: data.products.filter(p => p.available).length,
      color: '#2196f3',
      link: '/admin/dashboard/products'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'product',
      message: `Товаров в системе: ${data.products.length}`,
      time: 'Актуальная информация',
      status: 'info'
    },
    {
      id: 2,
      type: 'category',
      message: `Категорий создано: ${Object.keys(data.categoryStructure).length}`,
      time: 'Текущее состояние',
      status: 'success'
    },
    {
      id: 3,
      type: 'promotion',
      message: `Активных акций: ${data.promotions.filter(p => p.active).length}`,
      time: 'На данный момент',
      status: 'active'
    }
  ];

  const quickActions = [
    {
      icon: <FaTags />,
      label: 'Управление категориями',
      link: '/admin/dashboard/categories',
      color: '#9c27b0'
    },
    {
      icon: <FaPlus />,
      label: 'Добавить товар',
      link: '/admin/dashboard/products',
      color: '#00ff88'
    },
    {
      icon: <FaPercent />,
      label: 'Создать акцию',
      link: '/admin/dashboard/promotions',
      color: '#ff9800'
    },
    {
      icon: <FaFileAlt />,
      label: 'Редактировать контент',
      link: '/admin/dashboard/content',
      color: '#2196f3'
    },
    {
      icon: <FaEye />,
      label: 'Посмотреть сайт',
      link: '/',
      color: '#00ff88',
      external: true
    }
  ];

  return (
    <div className="admin-overview-advanced">
      <div className="overview-header">
        <h2>
          <FaChartLine /> Обзор системы
        </h2>
        <p>Добро пожаловать в панель управления сайтом ВездеходЗапчасти</p>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="stat-card"
            style={{ '--stat-color': stat.color }}
          >
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="overview-content">
        {/* Быстрые действия */}
        <div className="quick-actions">
          <h3>⚡ Быстрые действия</h3>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <div key={index} className="action-card">
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
              </div>
            ))}
          </div>
        </div>

        {/* Последняя активность */}
        <div className="recent-activity">
          <h3>📊 Системная информация</h3>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-info">
                  <div className="activity-message">{activity.message}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
                <div className={`activity-status ${activity.status}`}>
                  {activity.status === 'info' && 'ℹ️'}
                  {activity.status === 'success' && '✅'}
                  {activity.status === 'active' && '🟢'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Полезные ссылки */}
      <div className="helpful-links">
        <h3>🚀 Разделы управления</h3>
        <div className="links-grid">
          <div className="info-card">
            <h4>🗂️ Категории</h4>
            <p>Управляйте категориями и подкатегориями товаров</p>
            <Link to="/admin/dashboard/categories">Перейти к категориям</Link>
          </div>
          <div className="info-card">
            <h4>📦 Товары</h4>
            <p>Добавляйте, редактируйте и удаляйте товары в каталоге</p>
            <Link to="/admin/dashboard/products">Перейти к товарам</Link>
          </div>
          <div className="info-card">
            <h4>🎯 Акции</h4>
            <p>Создавайте привлекательные предложения для клиентов</p>
            <Link to="/admin/dashboard/promotions">Перейти к акциям</Link>
          </div>
          <div className="info-card">
            <h4>📝 О компании</h4>
            <p>Редактируйте информацию о компании и контакты</p>
            <Link to="/admin/dashboard/content">Перейти к контенту</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverviewAdvanced;
