import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminData } from '../../context/AdminDataContext';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import PromotionManagement from './PromotionManagement';
import ContentManagement from './ContentManagement';
import PopularProductsManagement from './PopularProductsManagement';
import OrderManagement from './OrderManagement';
import { migrateProductImages, getMainImage } from '../../utils/imageHelpers';
import { 
  FaHome, 
  FaBox, 
  FaTags, 
  FaUsers, 
  FaChartBar, 
  FaSignOutAlt, 
  FaEdit, 
  FaStar, 
  FaShoppingCart,
  FaEye,
  FaEyeSlash,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus
} from 'react-icons/fa';
import './AdvancedAdminDashboard.css';

function AdvancedAdminDashboard() {
  const navigate = useNavigate();
  const { products, promotions, orders } = useAdminData();
  const [activeSection, setActiveSection] = useState('overview');

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
    { id: 'overview', label: 'Обзор', icon: <FaChartBar /> },
    { id: 'products', label: 'Товары', icon: <FaBox /> },
    { id: 'categories', label: 'Категории', icon: <FaTags /> },
    { id: 'popular', label: 'Популярные товары', icon: <FaStar /> },
    { id: 'promotions', label: 'Акции', icon: <FaTags /> },
    { id: 'orders', label: 'Заказы', icon: <FaShoppingCart /> },
    { id: 'content', label: 'Контент', icon: <FaEdit /> }
  ];

  // Расчет статистики
  const totalProducts = products?.length || 0;
  const availableProducts = products?.filter(p => p.available)?.length || 0;
  const totalPromotions = promotions?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalValue = products?.reduce((sum, p) => sum + (p.price * (p.quantity || 0)), 0) || 0;
  const lowStockProducts = products?.filter(p => (p.quantity || 0) < 5 && p.available)?.length || 0;
  const outOfStockProducts = products?.filter(p => !p.available || (p.quantity || 0) === 0)?.length || 0;

  const renderOverview = () => (
    <div className="overview-section">
      <div className="overview-header">
        <h2>Панель управления Вездеход Запчасти</h2>
        <p className="overview-subtitle">Мониторинг и управление интернет-магазином</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaBox />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalProducts}</div>
            <div className="stat-label">Всего товаров</div>
            <div className="stat-trend">
              <FaArrowUp className="trend-up" />
              <span>+12% за месяц</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-number">{availableProducts}</div>
            <div className="stat-label">В наличии</div>
            <div className="stat-trend">
              <FaArrowUp className="trend-up" />
              <span>Доступно</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <div className="stat-number">{lowStockProducts}</div>
            <div className="stat-label">Заканчивается</div>
            <div className="stat-trend">
              <FaArrowDown className="trend-down" />
              <span>Требует внимания</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-icon">
            <FaEyeSlash />
          </div>
          <div className="stat-content">
            <div className="stat-number">{outOfStockProducts}</div>
            <div className="stat-label">Нет в наличии</div>
            <div className="stat-trend">
              <FaArrowDown className="trend-down" />
              <span>Требует пополнения</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">
            <FaTags />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalPromotions}</div>
            <div className="stat-label">Активных акций</div>
            <div className="stat-trend">
              <FaTrendingUp className="trend-up" />
              <span>Активно</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-icon">
            <FaShoppingCart />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalOrders}</div>
            <div className="stat-label">Заказов</div>
            <div className="stat-trend">
              <FaArrowUp className="trend-up" />
              <span>+8% за неделю</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overview-charts">
        <div className="chart-section">
          <h3>Быстрые действия</h3>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => setActiveSection('products')}>
              <FaPlus />
              <span>Добавить товар</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveSection('promotions')}>
              <FaTags />
              <span>Создать акцию</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveSection('orders')}>
              <FaShoppingCart />
              <span>Просмотр заказов</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveSection('content')}>
              <FaEdit />
              <span>Редактировать контент</span>
            </button>
          </div>
        </div>

        <div className="chart-section">
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
                    return <span className="product-icon">{mainImage.data}</span>;
                  }
                  return <span className="product-icon">📦</span>;
                })()}
                <div className="product-info">
                  <div className="product-name">{product.title}</div>
                  <div className="product-price">{product.price?.toLocaleString()} ₽</div>
                  <div className="product-quantity">
                    {product.available ? (
                      <span className="product-status available">
                        <FaCheckCircle /> В наличии ({product.quantity || 0})
                      </span>
                    ) : (
                      <span className="product-status unavailable">
                        <FaEyeSlash /> Нет в наличии
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="no-products">
                <p>Товары не найдены</p>
                <Link to="/admin/advanced/products">Добавить первый товар</Link>
              </div>
            )}
          </div>
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
      case 'orders':
        return <OrderManagement />;
      case 'content':
        return <ContentManagement />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Вездеход Запчасти</h2>
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
            <span>Администратор</span>
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