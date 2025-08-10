import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBox, 
  FaPercent, 
  FaFileAlt, 
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaCog,
  FaBell,
  FaUser,
  FaShoppingCart,
  FaStar
} from 'react-icons/fa';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Моковые уведомления

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: <FaChartLine />,
      label: 'Обзор',
      exact: true,
      description: 'Аналитика и статистика'
    },
    {
      path: '/admin/dashboard/products',
      icon: <FaBox />,
      label: 'Товары',
      description: 'Управление каталогом'
    },
    {
      path: '/admin/dashboard/promotions',
      icon: <FaPercent />,
      label: 'Акции',
      description: 'Скидки и промо'
    },
    {
      path: '/admin/dashboard/content',
      icon: <FaFileAlt />,
      label: 'Контент',
      description: 'Тексты и страницы'
    },
    {
      path: '/admin/dashboard/orders',
      icon: <FaShoppingCart />,
      label: 'Заказы',
      description: 'Обработка заказов'
    },
    {
      path: '/admin/dashboard/categories',
      icon: <FaCog />,
      label: 'Категории',
      description: 'Структура каталога'
    }
  ];

  const isActiveLink = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-dashboard">
      {/* Боковая панель */}
      <motion.div 
        className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="sidebar-header">
          <Link to="/" className="brand-link">
            <div className="brand-icon">
              <FaHome />
            </div>
            <div className="brand-text">
              <span className="brand-title">ЮТОРС</span>
              <span className="brand-subtitle">Админ панель</span>
            </div>
          </Link>
          <button 
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ x: 8 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.path}
                className={`nav-item ${isActiveLink(item.path, item.exact) ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="nav-icon">{item.icon}</div>
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Выйти</span>
          </button>
        </div>
      </motion.div>

      {/* Основной контент */}
      <div className="admin-main">
        {/* Хедер */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars />
            </button>
            <div className="page-info">
              <h1>Панель управления</h1>
              <p>Управление сайтом ЮТОРС</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-btn">
              <FaBell />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
            
            <div className="user-menu">
              <button className="user-btn">
                <FaUser />
                <span>Администратор</span>
              </button>
            </div>
            
            <Link to="/" className="site-link">
              <FaHome />
              <span>На сайт</span>
            </Link>
            
            <button className="logout-btn-header" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        {/* Контент */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Оверлей для мобильной навигации */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
