import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminData } from '../../context/AdminDataContext';
import { apiGet, apiPost } from '../../utils/api';
import { API_CONFIG } from '../../config/api';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import PromotionManagement from './PromotionManagement';
import PromocodeManagement from './PromocodeManagement';
import ContentManagement from './ContentManagement';
import PopularProductsManagement from './PopularProductsManagement';
import OrderManagement from './OrderManagement';
import AdvertisingManagement from './AdvertisingManagement';
import FilterManagement from './FilterManagement';
import VehiclesManagement from './VehiclesManagement';
import VehicleTypesManagement from './VehicleTypesManagement';
import BotManagement from './BotManagement';

import { migrateProductImages, getMainImage } from '../../utils/imageHelpers';
import BrandMark from '../../components/BrandMark';
import { FaHome, FaBox, FaTags, FaUsers, FaChartBar, FaSignOutAlt, FaEdit, FaStar, FaShoppingCart, FaAd, FaFilter, FaTag, FaTruck, FaRobot, FaCog } from 'react-icons/fa';
import './AdvancedAdminDashboard.css';
import BrandLogo from '../../components/BrandLogo';

function AdvancedAdminDashboard() {
  const navigate = useNavigate();
  const { products, promotions, promocodes, vehicles } = useAdminData();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_ME);
        if (!res.ok) throw new Error('unauth');
      } catch (_) {
        if (!canceled) navigate('/admin');
      }
    })();
    return () => { canceled = true; };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiPost(API_CONFIG.ENDPOINTS.ADMIN_LOGOUT);
    } finally {
      navigate('/admin');
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Обзор', icon: <FaChartBar /> },
    { id: 'products', label: 'Товары', icon: <FaBox /> },
    { id: 'categories', label: 'Категории', icon: <FaTags /> },
    { id: 'popular', label: 'Популярные товары', icon: <FaStar /> },
    { id: 'promotions', label: 'Акции', icon: <FaTags /> },
    { id: 'promocodes', label: 'Промокоды', icon: <FaTag /> },
    { id: 'orders', label: 'Заказы', icon: <FaShoppingCart /> },
    { id: 'vehicles', label: 'Вездеходы', icon: <FaTruck /> },
    { id: 'vehicleTypes', label: 'Типы вездеходов', icon: <FaCog /> },
    { id: 'filters', label: 'Фильтры', icon: <FaFilter /> },
    { id: 'content', label: 'Контент', icon: <FaEdit /> },
    { id: 'advertising', label: 'Реклама', icon: <FaAd /> },
    { id: 'bot', label: 'Telegram бот', icon: <FaRobot /> }
  ];

  const renderOverview = () => (
    <div className="overview-section">
      {/* Заголовок секции скрыт, используется общий заголовок сверху */}
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-number">{products.length}</div>
            <div className="stat-label">Товаров</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{promotions.length}</div>
            <div className="stat-label">Акций</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <div className="stat-number">{promocodes.length}</div>
            <div className="stat-label">Промокодов</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{products.filter(p => p.available).length}</div>
            <div className="stat-label">В наличии</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-number">{vehicles.length}</div>
            <div className="stat-label">Вездеходов</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{Math.round(products.reduce((sum, p) => sum + (p.price * (p.quantity || 0)), 0) / 1000)}К</div>
            <div className="stat-label">Общая стоимость склада</div>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <h3>Популярные товары</h3>
        <div className="product-list">
          {products && products.length > 0 ? products.slice(0, 5).map(product => (
            <div key={product.id} className="product-item">
              {(() => {
                const migratedProduct = migrateProductImages(product);
                const mainImage = getMainImage(migratedProduct);
                
                if (mainImage?.data) {
                  if (
                    typeof mainImage.data === 'string' &&
                    (mainImage.data.startsWith('data:image') || mainImage.data.startsWith('/uploads/') || mainImage.data.startsWith('http'))
                  ) {
                    return <img src={mainImage.data} alt={product.title} className="product-image-small" />;
                  }
                  return (
                    <span className="product-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrandMark alt={product.title} style={{ height: 24 }} />
                    </span>
                  );
                }
                return (
                  <span className="product-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrandMark alt={product.title} style={{ height: 24 }} />
                  </span>
                );
              })()}
              <div className="product-info">
                <div className="product-name">{product.title}</div>
                <div className="product-price">{product.price.toLocaleString()} ₽</div>
                <div className="product-quantity">Количество: {product.quantity || 0} шт.</div>
              </div>
              <div className={`product-status ${product.available ? 'available' : 'unavailable'}`}>
                {product.available ? 'В наличии' : 'Нет в наличии'}
              </div>
            </div>
          )) : (
            <div className="no-products">
              <p>Товары не найдены. <Link to="#" onClick={() => setActiveSection('products')}>Добавить товары</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'popular':
        return <PopularProductsManagement />;
      case 'promotions':
        return <PromotionManagement />;
      case 'promocodes':
        return <PromocodeManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'vehicles':
        return <VehiclesManagement />;
      case 'vehicleTypes':
        return <VehicleTypesManagement />;
      case 'filters':
        return <FilterManagement />;
      case 'content':
        return <ContentManagement />;
      case 'advertising':
        return <AdvertisingManagement />;
      case 'bot':
        return <BotManagement />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <BrandLogo
            to="/admin/advanced"
            size="sm"
            onClick={(e) => {
              if (window.location.pathname === '/admin/advanced') {
                e.preventDefault();
                window.location.reload();
              } else {
                setActiveSection('overview');
                navigate('/admin/advanced');
              }
            }}
          />
          <p>Админ панель</p>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <Link to="/" className="nav-item">
            <FaHome />
            <span>На сайт</span>
          </Link>
          <button onClick={handleLogout} className="nav-item logout">
            <FaSignOutAlt />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {menuItems.find(item => item.id === activeSection)?.label || 'Обзор'}
          </h1>
          <div className="header-actions">
            {/* вторичный логотип удалён по просьбе */}
          </div>
        </header>
        
        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default AdvancedAdminDashboard;